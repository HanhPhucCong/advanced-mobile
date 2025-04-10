import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import notificationService from '../../../src/service/api/notificationService';

// Kiểu thông báo
interface INotification {
  id: number;
  title: string;
  content: string;
  readStatus: boolean;
  createdDate: string;
}

interface NotificationScreenProps {
  navigation: any; // Nếu bạn dùng react-navigation, kiểu navigation sẽ khác
}

const NotificationScreen = ({ navigation }: NotificationScreenProps) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  // Sử dụng kiểu số duy nhất để mở, thay vì mảng cho phép mở nhiều notification cùng lúc.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAllByUser();
      // Sắp xếp thông báo từ mới nhất đến cũ nhất dựa trên createdDate
      const sortedNotifications = response.sort(
        (a: INotification, b: INotification) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo:', error);
      setNotifications([]); // fallback nếu lỗi
    }
  };

  // Khi nhấn vào 1 thông báo
  const handleToggle = async (id: number, readStatus: boolean) => {
    if (expandedId !== id) {
      setExpandedId(id);
      if (!readStatus) {
        try {
          await notificationService.markAsRead(id);
          setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, readStatus: true } : n))
          );
        } catch (error) {
          console.error('Lỗi khi đánh dấu đã đọc:', error);
        }
      }
    } else {
      // Nếu đã mở rồi, đóng lại
      setExpandedId(null);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socketUrl = 'http://10.0.2.2:8083/ws';
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: str => console.log('[WebSocket]', str),
    });

    stompClient.onConnect = () => {
      console.log('✅ Đã kết nối WebSocket');
      stompClient.subscribe('/user/queue/notifications', message => {
        const newNotification: INotification = JSON.parse(message.body);
        // Khi có thông báo mới thì sắp xếp lại cho đúng thứ tự mới nhất đến cũ nhất
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          return updated.sort(
            (a, b) =>
              new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
        });
      });
    };

    stompClient.onStompError = frame => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
    <View style={styles.screen}>
      {/* Header với nút back và tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <ScrollView style={styles.container}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleToggle(notification.id, notification.readStatus)}
              style={[
                styles.notificationBox,
                expandedId === notification.id && styles.activeNotificationBox,
              ]}
            >
              <View style={styles.notificationHeader}>
                <Text
                  style={[
                    styles.notificationTitle,
                    notification.readStatus ? styles.read : styles.unread,
                  ]}
                >
                  {notification.title}
                </Text>
                <Text style={styles.date}>
                  {new Date(notification.createdDate).toLocaleString()}
                </Text>
              </View>
              {expandedId === notification.id && (
                <Text style={styles.content}>{notification.content}</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Để căn giữa hiệu quả, tùy chỉnh theo ý bạn
  },
  container: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  notificationBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeNotificationBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
  },
  unread: {
    fontWeight: 'bold',
    color: '#000',
  },
  read: {
    fontWeight: 'normal',
    color: '#888',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  content: {
    marginTop: 8,
    fontSize: 14,
    color: '#444',
  },
});

export default NotificationScreen;