const crypto = require("crypto")
const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const logger = require("../utils/logger")
const sendEmail = require("../utils/email")

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    }

    // Remove password from output
    user.password = undefined

    res.cookie("jwt", token, cookieOptions)

    return res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    })
}

exports.register = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    })

    // Create verification token
    const verificationToken = newUser.createEmailVerificationToken()
    await newUser.save({ validateBeforeSave: false })

    // Send verification email
    const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`

    const message = `To verify your email address, please click the link below:\n${verificationURL}\nIf you did not create an account, please ignore this email.`

    try {
        await sendEmail({
            email: newUser.email,
            subject: "Your email verification token (valid for 24 hours)",
            message,
        })

        createSendToken(newUser, 201, req, res)
    } catch (err) {
        newUser.emailVerificationToken = undefined
        newUser.emailVerificationExpires = undefined
        await newUser.save({ validateBeforeSave: false })

        logger.error("Error sending verification email", { error: err })
        return next(new AppError("There was an error sending the verification email. Try again later!", 500))
    }
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400))
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({
        $or: [{ email }, { username: email }],
    }).select("+password")
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401))
    }

    // 3) Update last login time
    user.lastLogin = Date.now()
    await user.save({ validateBeforeSave: false })

    // 4) If everything ok, send token to client
    createSendToken(user, 200, req, res)
})

exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })
    res.status(200).json({ status: "success" })
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access.", 401))
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError("The user belonging to this token does not exist anymore.", 401))
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please log in again.", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    res.locals.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'editor']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError("There is no user with that email address.", 404))
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        })

        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        logger.error("Error sending password reset email", { error: err })
        return next(new AppError("There was an error sending the email. Try again later!", 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    })

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt property for the user
    // This is handled by a pre-save middleware

    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password")

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong.", 401))
    }

    // 3) If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res)
})

exports.verifyEmail = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    })

    // 2) If token has not expired, and there is user, set emailVerified to true
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }
    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save({ validateBeforeSave: false })

    // 3) Respond
    res.status(200).json({
        status: "success",
        message: "Email verified successfully!",
    })
})

exports.resendVerification = catchAsync(async (req, res, next) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError("There is no user with that email address.", 404))
    }

    if (user.emailVerified) {
        return next(new AppError("This email is already verified.", 400))
    }

    // 2) Generate new verification token
    const verificationToken = user.createEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    // 3) Send it to user's email
    const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`

    const message = `To verify your email address, please click the link below:\n${verificationURL}\nIf you did not create an account, please ignore this email.`

    try {
        await sendEmail({
            email: user.email,
            subject: "Your email verification token (valid for 24 hours)",
            message,
        })

        res.status(200).json({
            status: "success",
            message: "Verification email sent!",
        })
    } catch (err) {
        user.emailVerificationToken = undefined
        user.emailVerificationExpires = undefined
        await user.save({ validateBeforeSave: false })

        logger.error("Error sending verification email", { error: err })
        return next(new AppError("There was an error sending the email. Try again later!", 500))
    }
})

exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: "success",
        data: {
            user: req.user,
        },
    })
})

exports.refreshToken = catchAsync(async (req, res, next) => {
    // 1) Get token from the request
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access.", 401))
    }

    // 2) Verify token
    try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id)
        if (!currentUser) {
            return next(new AppError("The user belonging to this token does not exist anymore.", 401))
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError("User recently changed password! Please log in again.", 401))
        }

        // 5) Create new token
        createSendToken(currentUser, 200, req, res)
    } catch (err) {
        return next(new AppError("Invalid token or token expired. Please log in again.", 401))
    }
})
