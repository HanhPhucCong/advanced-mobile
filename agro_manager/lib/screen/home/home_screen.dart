import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../order/order_management.dart';
import '../user/user_mamagement.dart';
import '../setting/setting_screen.dart';
import '../product/product_management.dart';
import '../category/category_management.dart';
import '../auth/login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? token;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString('token');
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token'); // Xóa token khi logout
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        ), // Chuyển về LoginScreen
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 237, 239, 241), // Nền tổng thể
      appBar: AppBar(
        flexibleSpace: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/banner.jpg', // Đường dẫn đến ảnh banner
              fit: BoxFit.cover,
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.black26, Colors.transparent],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 8),
            decoration: BoxDecoration(
              color: Colors.black38, // nền bán trong suốt
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: _logout,
              icon: const Icon(Icons.logout, color: Colors.white),
              tooltip: 'Logout',
            ),
          ),
        ],
      ),

      body:
          token == null
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(bottom: 16.0),
                        child: Text(
                          'Welcome to Admin Panel!',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color.fromARGB(
                              133,
                              75,
                              81,
                              82,
                            ), // Màu chữ thanh lịch
                          ),
                        ),
                      ),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          return GridView.builder(
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount:
                                      constraints.maxWidth > 600 ? 4 : 2,
                                  crossAxisSpacing: 16,
                                  mainAxisSpacing: 16,
                                  childAspectRatio: 1,
                                ),
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: 5,
                            itemBuilder: (context, index) {
                              final cards = [
                                _DashboardCard(
                                  title: 'Users',
                                  icon: Icons.supervised_user_circle,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.blueAccent,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) => const UserManagementScreen(),
                                      ),
                                    );
                                  },
                                ),
                                _DashboardCard(
                                  title: 'Orders',
                                  icon: Icons.shopping_cart,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.purpleAccent,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) =>
                                                const OrderManagementScreen(),
                                      ),
                                    );
                                  },
                                ),

                                _DashboardCard(
                                  title: 'Products',
                                  icon: Icons.production_quantity_limits,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.deepOrange,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) =>
                                                const ProductManagementScreen(),
                                      ),
                                    );
                                  },
                                ),
                                _DashboardCard(
                                  title: 'Categories',
                                  icon: Icons.category,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.teal,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) =>
                                                const CategoryManagementScreen(),
                                      ),
                                    );
                                  },
                                ),
                                _DashboardCard(
                                  title: 'Settings',
                                  icon: Icons.settings,
                                  backgroundColor: Colors.white,
                                  iconColor: const Color.fromARGB(
                                    255,
                                    146,
                                    144,
                                    146,
                                  ),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => const SettingsScreen(),
                                      ),
                                    );
                                  },
                                ),
                              ];
                              return cards[index];
                            },
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onTap;

  const _DashboardCard({
    required this.title,
    required this.icon,
    required this.backgroundColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        color: backgroundColor,
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        shadowColor: Colors.black12,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 50, color: iconColor),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
