import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../../constants/api_constants.dart';
import '../../models/order_model.dart';
import './order_detail_screen.dart';
import '../../models/user.dart';

class OrderManagementScreen extends StatefulWidget {
  const OrderManagementScreen({super.key});

  @override
  State<OrderManagementScreen> createState() => _OrderManagementScreenState();
}

class _OrderManagementScreenState extends State<OrderManagementScreen> {
  List<Order> _orders = [];
  List<Order> _filteredOrders = [];
  bool _isLoading = true;
  String _selectedStatus = 'ALL';
  bool _isDescending = true;

  final List<String> statusOptions = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPING',
    'DELIVERED',
    'CANCELED',
    'CANCELED_REQUEST',
  ];

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<User?> _fetchUserById(int userId) async {
    final response = await http.get(
      Uri.parse("${ApiConstants.getDetailUser}$userId"),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return User.fromJson(data);
    } else {
      print("Failed to fetch user with status: ${response.statusCode}");
      return null;
    }
  }

  Future<void> _fetchOrders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      setState(() {
        _isLoading = false;
      });
      print("Token is null");
      return;
    }

    final response = await http.get(
      Uri.parse(ApiConstants.getAllActiveOrder),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      if (decoded['data'] != null && decoded['data'] is List) {
        final List<dynamic> jsonData = decoded['data'];
        final allOrders = jsonData.map((e) => Order.fromJson(e)).toList();

        // Fetch user information for each order
        for (var order in allOrders) {
          final user = await _fetchUserById(order.userId);
          order.user = user; // Gán thông tin người dùng vào đơn hàng
        }

        setState(() {
          _orders = allOrders;
          _filteredOrders =
              allOrders.where((o) => o.status != 'CANCELED').toList();
          _isLoading = false;
        });
      } else {
        print("Data is empty or malformed");
        setState(() => _isLoading = false);
      }
    } else {
      print("Failed with status: ${response.statusCode}");
      setState(() => _isLoading = false);
    }
  }

  void _filterOrders(String status) {
    setState(() {
      _selectedStatus = status;
      if (status == 'ALL') {
        _filteredOrders = _orders.where((o) => o.status != 'CANCELED').toList();
      } else {
        _filteredOrders = _orders.where((o) => o.status == status).toList();
      }
      _sortOrders(); // Ensure that orders are sorted after filtering
    });
  }

  void _sortOrders() {
    _filteredOrders.sort((a, b) {
      final aDate = DateTime.parse(a.createdAt);
      final bDate = DateTime.parse(b.createdAt);
      return _isDescending ? bDate.compareTo(aDate) : aDate.compareTo(bDate);
    });
  }

  void _toggleSortOrder() {
    setState(() {
      _isDescending = !_isDescending;
      _sortOrders(); // Resort the list whenever the sort order is toggled
    });
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'CONFIRMED':
        return Colors.blueAccent;
      case 'PROCESSING':
        return Colors.purple;
      case 'SHIPPING':
        return Colors.teal;
      case 'DELIVERED':
        return Colors.green;
      case 'CANCELED_REQUEST':
        return Colors.deepOrange;
      default:
        return Colors.grey;
    }
  }

  Widget _buildStatusChip(String status) {
    final color = _getStatusColor(status);
    return Chip(
      label: Text(status, style: const TextStyle(fontWeight: FontWeight.bold)),
      backgroundColor: color.withOpacity(0.1),
      labelStyle: TextStyle(color: color),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    );
  }

  @override
  Widget build(BuildContext context) {
    String _formatDateTime(String dateTime) {
      final parsedDate = DateTime.parse(dateTime);
      final formattedDate = DateFormat(
        'dd/MM/yyyy HH:mm',
      ).format(parsedDate); // Thay đổi định dạng theo yêu cầu của bạn
      return formattedDate;
    }

    String _formatCurrency(double amount) {
      final formatter = NumberFormat.simpleCurrency(
        locale: 'vi_VN',
      ); // Định dạng theo tiền tệ Việt Nam
      return formatter.format(amount);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Order Management',
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child:
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: InputDecorator(
                            decoration: InputDecoration(
                              labelText: 'Filter by Status',
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 4,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedStatus,
                                isExpanded: true,
                                items:
                                    statusOptions
                                        .map(
                                          (status) => DropdownMenuItem(
                                            value: status,
                                            child: Text(status),
                                          ),
                                        )
                                        .toList(),
                                onChanged: (value) {
                                  if (value != null) _filterOrders(value);
                                },
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        IconButton(
                          icon: Icon(
                            _isDescending
                                ? Icons.arrow_downward
                                : Icons.arrow_upward,
                            color: Colors.blue,
                          ),
                          onPressed: _toggleSortOrder,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child:
                          _filteredOrders.isEmpty
                              ? const Center(child: Text('No orders found'))
                              : ListView.builder(
                                itemCount: _filteredOrders.length,
                                itemBuilder: (context, index) {
                                  final order = _filteredOrders[index];
                                  return Card(
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    elevation: 3,
                                    margin: const EdgeInsets.symmetric(
                                      vertical: 8,
                                    ),
                                    child: ListTile(
                                      contentPadding: const EdgeInsets.all(12),
                                      title: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Order #${order.id}',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          _buildStatusChip(order.status),
                                        ],
                                      ),
                                      subtitle: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const SizedBox(height: 6),
                                          Text(
                                            'User: ${order.user?.email ?? 'Unknown'}',
                                          ),
                                          Text(
                                            'Total: ${_formatCurrency(order.totalAmount)}',
                                          ),
                                          Text(
                                            'Payment: ${order.paymentMethod}',
                                          ),
                                          Text(
                                            'Date: ${_formatDateTime(order.createdAt)}',
                                          ),
                                        ],
                                      ),
                                      trailing: const Icon(
                                        Icons.chevron_right_rounded,
                                      ),
                                      onTap: () async {
                                        final result = await Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder:
                                                (_) => OrderDetailScreen(
                                                  order: order,
                                                ),
                                          ),
                                        );

                                        if (result == 'reload') {
                                          _fetchOrders(); // Reload toàn bộ danh sách để đảm bảo dữ liệu chính xác
                                        }
                                      },
                                    ),
                                  );
                                },
                              ),
                    ),
                  ],
                ),
      ),
    );
  }
}
