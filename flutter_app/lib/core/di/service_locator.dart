import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/datasources/posts_remote_datasource.dart';
import '../../data/datasources/users_remote_datasource.dart';
import '../../data/datasources/categories_remote_datasource.dart';
import '../../data/datasources/comments_remote_datasource.dart';
import '../../data/datasources/search_remote_datasource.dart';

import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/posts_repository_impl.dart';
import '../../data/repositories/users_repository_impl.dart';
import '../../data/repositories/categories_repository_impl.dart';
import '../../data/repositories/comments_repository_impl.dart';
import '../../data/repositories/search_repository_impl.dart';

import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/posts_repository.dart';
import '../../domain/repositories/users_repository.dart';
import '../../domain/repositories/categories_repository.dart';
import '../../domain/repositories/comments_repository.dart';
import '../../domain/repositories/search_repository.dart';

import '../../domain/usecases/auth/login_usecase.dart';
import '../../domain/usecases/auth/register_usecase.dart';
import '../../domain/usecases/auth/logout_usecase.dart';
import '../../domain/usecases/auth/refresh_token_usecase.dart';
import '../../domain/usecases/auth/forgot_password_usecase.dart';
import '../../domain/usecases/auth/reset_password_usecase.dart';
import '../../domain/usecases/auth/get_current_user_usecase.dart';

import '../../domain/usecases/posts/get_posts_usecase.dart';
import '../../domain/usecases/posts/get_post_details_usecase.dart';
import '../../domain/usecases/posts/get_featured_posts_usecase.dart';
import '../../domain/usecases/posts/get_trending_posts_usecase.dart';
import '../../domain/usecases/posts/search_posts_usecase.dart';

import '../../domain/usecases/users/get_authors_usecase.dart';
import '../../domain/usecases/users/get_author_profile_usecase.dart';
import '../../domain/usecases/users/update_profile_usecase.dart';

import '../../domain/usecases/categories/get_categories_usecase.dart';
import '../../domain/usecases/categories/get_category_posts_usecase.dart';

import '../../domain/usecases/comments/get_post_comments_usecase.dart';
import '../../domain/usecases/comments/add_comment_usecase.dart';
import '../../domain/usecases/comments/update_comment_usecase.dart';
import '../../domain/usecases/comments/delete_comment_usecase.dart';

import '../../domain/usecases/search/global_search_usecase.dart';

import '../../presentation/providers/auth_provider.dart';
import '../../presentation/providers/posts_provider.dart';
import '../../presentation/providers/users_provider.dart';
import '../../presentation/providers/categories_provider.dart';
import '../../presentation/providers/comments_provider.dart';
import '../../presentation/providers/search_provider.dart';
import '../../presentation/providers/theme_provider.dart';

import '../../core/network/network_info.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';

class ServiceLocator {
  static final GetIt _getIt = GetIt.instance;
  
  static GetIt get getIt => _getIt;
  
  static T get<T extends Object>() => _getIt<T>();

  static Future<void> init() async {
    // External dependencies
    final sharedPreferences = await SharedPreferences.getInstance();
    _getIt.registerLazySingleton(() => sharedPreferences);
    
    _getIt.registerLazySingleton(() => http.Client());
    _getIt.registerLazySingleton(() => const FlutterSecureStorage());
    _getIt.registerLazySingleton(() => Connectivity());

    // Core
    _getIt.registerLazySingleton<NetworkInfo>(
      () => NetworkInfoImpl(_getIt()),
    );
    
    _getIt.registerLazySingleton<ApiClient>(
      () => ApiClient(_getIt<http.Client>()),
    );
    
    _getIt.registerLazySingleton<SecureStorage>(
      () => SecureStorageImpl(_getIt<FlutterSecureStorage>()),
    );

    // Data sources
    _getIt.registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSourceImpl(_getIt<ApiClient>()),
    );
    
    _getIt.registerLazySingleton<PostsRemoteDataSource>(
      () => PostsRemoteDataSourceImpl(_getIt<ApiClient>()),
    );
    
    _getIt.registerLazySingleton<UsersRemoteDataSource>(
      () => UsersRemoteDataSourceImpl(_getIt<ApiClient>()),
    );
    
    _getIt.registerLazySingleton<CategoriesRemoteDataSource>(
      () => CategoriesRemoteDataSourceImpl(_getIt<ApiClient>()),
    );
    
    _getIt.registerLazySingleton<CommentsRemoteDataSource>(
      () => CommentsRemoteDataSourceImpl(_getIt<ApiClient>()),
    );
    
    _getIt.registerLazySingleton<SearchRemoteDataSource>(
      () => SearchRemoteDataSourceImpl(_getIt<ApiClient>()),
    );

    // Repositories
    _getIt.registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(
        remoteDataSource: _getIt<AuthRemoteDataSource>(),
        secureStorage: _getIt<SecureStorage>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );
    
    _getIt.registerLazySingleton<PostsRepository>(
      () => PostsRepositoryImpl(
        remoteDataSource: _getIt<PostsRemoteDataSource>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );
    
    _getIt.registerLazySingleton<UsersRepository>(
      () => UsersRepositoryImpl(
        remoteDataSource: _getIt<UsersRemoteDataSource>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );
    
    _getIt.registerLazySingleton<CategoriesRepository>(
      () => CategoriesRepositoryImpl(
        remoteDataSource: _getIt<CategoriesRemoteDataSource>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );
    
    _getIt.registerLazySingleton<CommentsRepository>(
      () => CommentsRepositoryImpl(
        remoteDataSource: _getIt<CommentsRemoteDataSource>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );
    
    _getIt.registerLazySingleton<SearchRepository>(
      () => SearchRepositoryImpl(
        remoteDataSource: _getIt<SearchRemoteDataSource>(),
        networkInfo: _getIt<NetworkInfo>(),
      ),
    );

    // Use cases
    _getIt.registerLazySingleton(() => LoginUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => RegisterUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => LogoutUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => RefreshTokenUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => ForgotPasswordUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => ResetPasswordUseCase(_getIt<AuthRepository>()));
    _getIt.registerLazySingleton(() => GetCurrentUserUseCase(_getIt<AuthRepository>()));
    
    _getIt.registerLazySingleton(() => GetPostsUseCase(_getIt<PostsRepository>()));
    _getIt.registerLazySingleton(() => GetPostDetailsUseCase(_getIt<PostsRepository>()));
    _getIt.registerLazySingleton(() => GetFeaturedPostsUseCase(_getIt<PostsRepository>()));
    _getIt.registerLazySingleton(() => GetTrendingPostsUseCase(_getIt<PostsRepository>()));
    _getIt.registerLazySingleton(() => SearchPostsUseCase(_getIt<PostsRepository>()));
    
    _getIt.registerLazySingleton(() => GetAuthorsUseCase(_getIt<UsersRepository>()));
    _getIt.registerLazySingleton(() => GetAuthorProfileUseCase(_getIt<UsersRepository>()));
    _getIt.registerLazySingleton(() => UpdateProfileUseCase(_getIt<UsersRepository>()));
    
    _getIt.registerLazySingleton(() => GetCategoriesUseCase(_getIt<CategoriesRepository>()));
    _getIt.registerLazySingleton(() => GetCategoryPostsUseCase(_getIt<CategoriesRepository>()));
    
    _getIt.registerLazySingleton(() => GetPostCommentsUseCase(_getIt<CommentsRepository>()));
    _getIt.registerLazySingleton(() => AddCommentUseCase(_getIt<CommentsRepository>()));
    _getIt.registerLazySingleton(() => UpdateCommentUseCase(_getIt<CommentsRepository>()));
    _getIt.registerLazySingleton(() => DeleteCommentUseCase(_getIt<CommentsRepository>()));
    
    _getIt.registerLazySingleton(() => GlobalSearchUseCase(_getIt<SearchRepository>()));

    // Providers
    _getIt.registerFactory(() => AuthProvider(
      loginUseCase: _getIt<LoginUseCase>(),
      registerUseCase: _getIt<RegisterUseCase>(),
      logoutUseCase: _getIt<LogoutUseCase>(),
      refreshTokenUseCase: _getIt<RefreshTokenUseCase>(),
      forgotPasswordUseCase: _getIt<ForgotPasswordUseCase>(),
      resetPasswordUseCase: _getIt<ResetPasswordUseCase>(),
      getCurrentUserUseCase: _getIt<GetCurrentUserUseCase>(),
    ));
    
    _getIt.registerFactory(() => PostsProvider(
      getPostsUseCase: _getIt<GetPostsUseCase>(),
      getPostDetailsUseCase: _getIt<GetPostDetailsUseCase>(),
      getFeaturedPostsUseCase: _getIt<GetFeaturedPostsUseCase>(),
      getTrendingPostsUseCase: _getIt<GetTrendingPostsUseCase>(),
      searchPostsUseCase: _getIt<SearchPostsUseCase>(),
    ));
    
    _getIt.registerFactory(() => UsersProvider(
      getAuthorsUseCase: _getIt<GetAuthorsUseCase>(),
      getAuthorProfileUseCase: _getIt<GetAuthorProfileUseCase>(),
      updateProfileUseCase: _getIt<UpdateProfileUseCase>(),
    ));
    
    _getIt.registerFactory(() => CategoriesProvider(
      getCategoriesUseCase: _getIt<GetCategoriesUseCase>(),
      getCategoryPostsUseCase: _getIt<GetCategoryPostsUseCase>(),
    ));
    
    _getIt.registerFactory(() => CommentsProvider(
      getPostCommentsUseCase: _getIt<GetPostCommentsUseCase>(),
      addCommentUseCase: _getIt<AddCommentUseCase>(),
      updateCommentUseCase: _getIt<UpdateCommentUseCase>(),
      deleteCommentUseCase: _getIt<DeleteCommentUseCase>(),
    ));
    
    _getIt.registerFactory(() => SearchProvider(
      globalSearchUseCase: _getIt<GlobalSearchUseCase>(),
    ));
    
    _getIt.registerFactory(() => ThemeProvider(_getIt<SharedPreferences>()));
  }
}