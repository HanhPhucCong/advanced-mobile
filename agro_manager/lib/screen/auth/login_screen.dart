import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../home/home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool isButtonDisabled = true;
  bool isLoading = false;
  bool _isPasswordVisible = false;

  @override
  void initState() {
    super.initState();
    _emailController.addListener(_validateForm);
    _passwordController.addListener(_validateForm);
  }

  // Kiểm tra tính hợp lệ của form
  void _validateForm() {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final isValid = email.contains('@') && password.isNotEmpty;

    setState(() {
      isButtonDisabled = !isValid;
    });
  }

  void _handleLogin() async {
    setState(() {
      isLoading = true;
    });

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final url = Uri.parse('http://localhost:8083/api/v1/auth/signin');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token']; // lấy token từ response
        final userRole = data['role']; // lấy role

        if (userRole == 'ADMIN') {
          // Nếu là ADMIN, lưu token và chuyển màn hình
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', token);

          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          }
        } else {
          // Nếu không phải ADMIN, hiển thị thông báo lỗi
          _showToast('You are not authorized to access this section.');
        }
      } else {
        // Nếu API trả về không phải 200, lấy message từ backend và hiển thị
        final data = jsonDecode(response.body);
        final errorMessage = data['message'] ?? 'An error occurred';
        _showToast(errorMessage);
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      //print('Login failed: $e');
      _showToast('An error occurred. Please try again. : $e');
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void _showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.black,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 60),
              const Text(
                'Admin Panel',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1E293B),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Login with admin credentials',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              Center(
                child: Image.asset(
                  'assets/images/text-logo.png',
                  width: 200,
                  height: 200,
                ),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Admin Email',
                  prefixIcon: const Icon(Icons.admin_panel_settings_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: !_isPasswordVisible,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: const Color.fromARGB(255, 182, 182, 182),
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),

              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed:
                      isButtonDisabled || isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 68, 82, 121),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child:
                      isLoading
                          ? const CircularProgressIndicator(
                            color: Color.fromARGB(255, 247, 247, 247),
                          )
                          : const Text(
                            'LOGIN',
                            style: TextStyle(
                              fontSize: 16,
                              letterSpacing: 0.5,
                              color: Color.fromARGB(255, 247, 247, 247),
                            ),
                          ),
                ),
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              const Text(
                'Only administrators are allowed to access this section.',
                style: TextStyle(fontSize: 13, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
