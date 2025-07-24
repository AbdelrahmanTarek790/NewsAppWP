import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../errors/exceptions.dart';

class ApiClient {
  final http.Client client;
  
  ApiClient(this.client);

  Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final response = await client.get(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: _buildHeaders(headers),
      );
      
      return _handleResponse(response);
    } on SocketException {
      throw ServerException('No internet connection');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  Future<Map<String, dynamic>> post(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await client.post(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: _buildHeaders(headers),
        body: body != null ? json.encode(body) : null,
      );
      
      return _handleResponse(response);
    } on SocketException {
      throw ServerException('No internet connection');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  Future<Map<String, dynamic>> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await client.patch(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: _buildHeaders(headers),
        body: body != null ? json.encode(body) : null,
      );
      
      return _handleResponse(response);
    } on SocketException {
      throw ServerException('No internet connection');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  Future<Map<String, dynamic>> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final response = await client.delete(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: _buildHeaders(headers),
      );
      
      return _handleResponse(response);
    } on SocketException {
      throw ServerException('No internet connection');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  Map<String, String> _buildHeaders(Map<String, String>? additionalHeaders) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (additionalHeaders != null) {
      headers.addAll(additionalHeaders);
    }
    
    return headers;
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final responseBody = json.decode(response.body) as Map<String, dynamic>;
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return responseBody;
    } else {
      final message = responseBody['message'] ?? 'An error occurred';
      throw ServerException(message);
    }
  }
}