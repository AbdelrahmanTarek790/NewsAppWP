# NewsPress API - Production-Ready News System Backend

A robust, scalable, and secure backend API for a news platform with WordPress data import capabilities, built with Node.js, Express, MongoDB/Mongoose.

## Features

- **Content Management**
  - Posts with revisions and scheduling
  - Categories and tags with hierarchical structure
  - Comments with moderation
  - Media management with optimization

- **User Management**
  - Role-based access control (user, author, editor, admin)
  - JWT-based authentication with refresh tokens
  - Email verification and password recovery
  - User profiles with customization

- **WordPress Import**
  - Full WordPress XML export import
  - Import posts, pages, users, comments, categories, tags, and media
  - Content mapping and transformation

- **Content Distribution**
  - Schedule content across multiple channels
  - Social media posting automation
  - Email newsletter scheduling
  - Push notification management
  - Distribution calendar and analytics
  - Recurring distribution patterns

- **Performance Optimizations**
  - Response compression
  - Database indexing
  - Efficient media processing
  - In-memory caching

- **Security Features**
  - Protection against XSS, CSRF, and NoSQL injection
  - Rate limiting
  - Input validation and sanitization
  - Secure HTTP headers

## Tech Stack

- **Server**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access and refresh tokens)
- **File Processing**: Multer, Sharp
- **Email**: Nodemailer with templating
- **Validation**: Express Validator
- **Security**: Helmet, XSS-Clean, Express-Mongo-Sanitize
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Deployment**: Nginx

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/news-press-api.git
cd news-press-api