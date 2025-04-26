import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../models/order_model.dart';
import '../../models/product.dart';
import '../../constants/api_constants.dart';

class OrderDetailScreen extends StatefulWidget {
  final Order order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Map<int, Product> _products = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    Map<int, Product> loaded = {};

    for (var item in widget.order.lineItems) {
      final res = await http.get(
        Uri.parse('${ApiConstants.getDetailProduct}${item.productId}'),
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body)['data'];
        loaded[item.productId] = Product.fromJson(data);
      }
    }

    setState(() {
      _products = loaded;
      _isLoading = false;
    });
  }

  Future<void> _showSnackbarAndPop(String message) async {
    _showSnackbar(message);
    await Future.delayed(const Duration(seconds: 1));
    Navigator.pop(context, 'reload');
  }

  Future<void> _confirmOrder() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final res = await http.put(
      Uri.parse('${ApiConstants.confirmOrder}${widget.order.id}'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      await _showSnackbarAndPop("Đã xác nhận đơn hàng");
    } else {
      _showSnackbar("Xác nhận thất bại");
    }
  }

  Future<void> _approveCancelRequest() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final res = await http.put(
      Uri.parse('${ApiConstants.approveCancelRequest}${widget.order.id}'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      await _showSnackbarAndPop("Đã duyệt yêu cầu hủy");
    } else {
      _showSnackbar("Duyệt thất bại");
    }
  }

  Future<void> _rejectCancelRequest() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final res = await http.put(
      Uri.parse('${ApiConstants.rejectCancelRequest}${widget.order.id}'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      await _showSnackbarAndPop("Đã từ chối yêu cầu hủy");
    } else {
      _showSnackbar("Từ chối thất bại");
    }
  }

  void _showSnackbar(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
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
      case 'CANCELED':
        return Colors.red;
      case 'CANCELED_REQUEST':
        return Colors.deepOrange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;

    String _formatDateTime(String isoString) {
      final date = DateTime.parse(isoString).toLocal();
      final formatter = DateFormat('dd/MM/yyyy HH:mm');
      return formatter.format(date);
    }

    String _formatCurrency(double amount) {
      final formatter = NumberFormat.simpleCurrency(locale: 'vi_VN');
      return formatter.format(amount);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Đơn hàng #${order.id}'),
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        titleTextStyle: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Thêm thông tin người dùng tại đây
                    if (order.user != null) ...[
                      _infoRow("Tên người dùng", order.user!.fullName),
                      _infoRow("Email", order.user!.email),
                      _infoRow("Số điện thoại giao hàng", order.phoneNumber),
                      const Divider(),
                    ],

                    // Thông tin trạng thái đơn hàng và các chi tiết khác
                    _infoRow(
                      "Trạng thái",
                      order.status,
                      color: _getStatusColor(order.status),
                    ),
                    _infoRow("Tổng tiền", _formatCurrency(order.totalAmount)),
                    _infoRow("Thanh toán", order.paymentMethod),
                    _infoRow("Địa chỉ giao hàng", order.shippingAddress),
                    _infoRow("Ghi chú đơn hàng", order.note),
                    _infoRow("Thời gian tạo", _formatDateTime(order.createdAt)),
                    const SizedBox(height: 20),

                    // Hiển thị danh sách sản phẩm
                    if (order.status != 'CANCELED') ...[
                      const Text(
                        "Danh sách sản phẩm",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const Divider(),
                      ...order.lineItems.map((item) {
                        final product = _products[item.productId];
                        return product == null
                            ? const Text("Đang tải sản phẩm...")
                            : Card(
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              margin: const EdgeInsets.symmetric(vertical: 10),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child:
                                          product.imageUrls.isNotEmpty
                                              ? Image.network(
                                                product.imageUrls[0],
                                                width: 80,
                                                height: 80,
                                                fit: BoxFit.cover,
                                              )
                                              : Container(
                                                width: 80,
                                                height: 80,
                                                color: Colors.grey[200],
                                                child: const Icon(
                                                  Icons.image_not_supported,
                                                  color: Colors.grey,
                                                ),
                                              ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            product.name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            product.description,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              color: Colors.grey[700],
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                "Giá: ${product.price.toStringAsFixed(0)}đ",
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                ),
                                              ),
                                              Text(
                                                "x${item.quantity}",
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            "Tổng: ${(product.price * item.quantity).toStringAsFixed(0)}đ",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                          Text(
                                            "Kho: ${product.quantity}",
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                      }).toList(),
                    ],

                    // Các button action khác (nếu có)
                    if (order.status == 'PENDING') ...[
                      const SizedBox(height: 20),
                      _actionButton(
                        "Xác nhận đơn hàng",
                        Colors.blueAccent,
                        _confirmOrder,
                      ),
                    ] else if (order.status == 'CANCELED_REQUEST') ...[
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: _actionButton(
                              "Từ chối hủy",
                              Colors.red,
                              _rejectCancelRequest,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _actionButton(
                              "Duyệt hủy",
                              Colors.green,
                              _approveCancelRequest,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
    );
  }

  Widget _infoRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "$label: ",
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(fontSize: 15, color: color ?? Colors.black),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton(String label, Color color, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color, // Sử dụng backgroundColor thay vì primary
        padding: const EdgeInsets.symmetric(
          vertical: 16,
          horizontal: 16,
        ), // Thêm khoảng cách trên dưới
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12), // Góc bo tròn mềm mại
        ),
        elevation: 5, // Thêm bóng đổ để tạo độ nổi
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 18, // Tăng kích thước chữ để dễ đọc hơn
          fontWeight: FontWeight.bold, // Chữ đậm
          color: Colors.white, // Màu chữ trắng để nổi bật trên nền
        ),
      ),
    );
  }
}
