import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import profileService from '../../../service/api/profileService';
import authService from '../../../service/api/authService';
import orderService from '../../../service/api/orderService';

type User = {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDeleted: boolean;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    address?: string | null;
    dateOfBirth?: string;
    avatarUrl?: string | null;
    role: string;
    isEmailVerified: boolean;
    coin: number;
};
interface Order {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDeleted: boolean;
    userId: number;
    lineItems: any[];
    shippingAddress: string;
    note: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentDate: string | null;
}

const ProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User | null>(null);
    const [orders, setOrders] = useState<number>(0);
    const [deliveredCount, setDeliveredCount] = useState<number>(0);
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await profileService.getAllActive();
            setUserData(data.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderData = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrder();
            const ordersData: Order[] = response.data;
            setOrders(ordersData.length);
            const count = ordersData.filter(
                (order: Order) =>
                    order.status === 'PENDING' ||
                    order.status === 'CONFIRMED' ||
                    order.status === 'PROCESSING' ||
                    order.status === 'SHIPPING'
            ).length;
            setDeliveredCount(count);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchOrderData();
            fetchUserData();
        }, [])
    );
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';

        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return `${day}/${month}/${year}`;
    };

    const getToken = async () => {
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        return { token, refreshToken };
    };

    const handleLogout = async () => {
        try {
            const { token, refreshToken } = await getToken();
            const signoutRequest: any = { token, refreshToken };
            await authService.signout(signoutRequest);

            await AsyncStorage.clear();

            navigation.navigate('LoginScreen');
        } catch (err) {
            console.error('Signout failed: ', err);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
                <ActivityIndicator size='large' color='#007bff' />
            ) : userData ? (
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: userData.avatarUrl || 'https://via.placeholder.com/120' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{userData.fullName}</Text>
                    <Text style={styles.email}>{userData.email}</Text>

                    <View style={styles.infoContainer}>
                        <InfoRow label='Số điện thoại' value={userData.phoneNumber || 'Chưa cập nhật'} />
                        <InfoRow label='Địa chỉ' value={userData.address || 'Chưa cập nhật'} />
                        <InfoRow label='Ngày sinh' value={formatDate(userData.dateOfBirth) || 'Chưa cập nhật'} />
                        {/* <InfoRow
                            label='Đơn hàng đang vận chuyển'
                            value={deliveredCount !== undefined ? deliveredCount.toString() : 'Chưa có'}
                        /> */}
                        <InfoRow
                            label='Tổng số đơn hàng'
                            value={orders !== undefined ? orders.toString() : 'Chưa có'}
                        />
                        <View style={styles.coinContainer}>
                            <Text style={styles.infoLabel}>Số xu hiện có:</Text>
                            <Text style={styles.infoCoin}>{userData.coin?.toLocaleString() || '0'} xu</Text>
                            <TouchableOpacity
                                style={styles.useCoinButton}
                                onPress={() => navigation.navigate('UseCoin', { currentCoin: userData.coin })}
                            >
                                <Text style={styles.useCoinText}>Sử dụng xu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.editButton]}
                            onPress={() => navigation.navigate('EditProfile', { userData })}
                        >
                            <Text style={styles.buttonText}>Sửa hồ sơ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.changePasswordButton]}
                            onPress={() => navigation.navigate('ChangePassword', { userData })}
                        >
                            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.orderListButton]}
                            onPress={() => navigation.navigate('ListOrderScreen', { userData })}
                        >
                            <Text style={styles.buttonText}>Đơn hàng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                            <Text style={styles.buttonText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity>
                    <Text style={styles.errorText}>Không thể tải dữ liệu người dùng.</Text>
                    <Button title='Đăng xuất' onPress={handleLogout} />
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

type InfoRowProps = {
    label: string;
    value: string | number;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        top: 20,
    },
    profileCard: { width: '100%', maxWidth: 400, alignItems: 'center', padding: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
    name: { fontSize: 26, fontWeight: '600', color: '#222', marginBottom: 5 },
    email: { fontSize: 18, color: '#666', marginBottom: 20 },
    infoContainer: { width: '100%', marginTop: 10 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    infoLabel: { fontSize: 16, fontWeight: '500', color: '#444' },
    infoValue: { fontSize: 16, color: '#222' },
    errorText: { color: 'red', fontSize: 16, marginTop: 20 },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1, // Ngăn text bị ép xuống dòng
    },

    changePasswordText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1, // Ngăn text bị ép xuống dòng
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 16,
    },
    button: {
        width: '48%',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    editButton: {
        backgroundColor: '#4A90E2',
    },
    changePasswordButton: {
        backgroundColor: '#50E3C2',
    },
    orderListButton: {
        backgroundColor: '#F5A623',
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoCoin: {
        fontSize: 16,
        fontWeight: '500',
        color: '#7f8c8d',
        textAlign: 'right',
    },

    coinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },

    useCoinButton: {
        marginTop: 6,
        backgroundColor: '#ecf0f1',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },

    useCoinText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
    },
});
export default ProfileScreen;
