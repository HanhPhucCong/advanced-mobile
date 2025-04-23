import 'package:flutter/material.dart';
import '../../models/user.dart';
import '../../service/api_service.dart';

class UserDetailScreen extends StatefulWidget {
  final int userId;
  const UserDetailScreen({super.key, required this.userId});

  @override
  State<UserDetailScreen> createState() => _UserDetailScreenState();
}

class _UserDetailScreenState extends State<UserDetailScreen> {
  late Future<User> _userFuture;

  @override
  void initState() {
    super.initState();
    _userFuture = ApiService.getUserDetail(widget.userId);
  }

  Future<void> _toggleBlock(User user) async {
    if (user.isDeleted) {
      await ApiService.unblockUser(user.id);
    } else {
      await ApiService.blockUser(user.id);
    }

    setState(() {
      _userFuture = ApiService.getUserDetail(widget.userId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Detail')),
      body: FutureBuilder<User>(
        future: _userFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final user = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundImage: user.avatarUrl != null
                      ? NetworkImage(user.avatarUrl!)
                      : const AssetImage('assets/default_avatar.png') as ImageProvider,
                ),
                const SizedBox(height: 16),
                Text(user.fullName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text(user.email, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 20),
                _buildDetailRow('Phone', user.phoneNumber),
                _buildDetailRow('Address', user.address),
                _buildDetailRow('DOB', user.dateOfBirth),
                _buildDetailRow('Orders', user.orders.toString()),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  icon: Icon(user.isDeleted ? Icons.lock_open : Icons.block),
                  label: Text(user.isDeleted ? 'Unblock User' : 'Block User'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: user.isDeleted ? Colors.green : Colors.red,
                  ),
                  onPressed: () => _toggleBlock(user),
                )
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('$title:', style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value ?? '-', style: const TextStyle(color: Colors.black87)),
        ],
      ),
    );
  }
}
