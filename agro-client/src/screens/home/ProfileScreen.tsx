import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import profileService from '../../service/api/profileService';
import authService from '../../service/api/authService';

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
};
const ProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<User | null>(null);
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

    useFocusEffect(
        useCallback(() => {
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
                        <InfoRow label='Đơn hàng đang vận chuyển' value={'Chưa có'} />
                        <InfoRow label='Lịch sử mua hàng' value={'Chưa có'} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditProfile', { userData })}
                        >
                            <Text style={styles.editButtonText} numberOfLines={1}>
                                Sửa hồ sơ
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.changePasswordButton}
                            onPress={() => navigation.navigate('ChangePassword', { userData })}
                        >
                            <Text style={styles.changePasswordText} numberOfLines={1}>
                                Đổi mật khẩu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text style={styles.errorText}>Không thể tải dữ liệu người dùng.</Text>
            )}

            <Button title='Logout' onPress={handleLogout} />
        </ScrollView>
    );
};

type InfoRowProps = {
    label: string;
    value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10, // Khoảng cách giữa hai button
        marginTop: 15,
    },

    editButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        flex: 1, // Chia đều kích thước giữa hai button
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120, // Đảm bảo đủ chỗ để text không xuống hàng
    },

    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1, // Ngăn text bị ép xuống dòng
    },

    changePasswordButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120, // Đảm bảo đủ rộng để tránh text xuống hàng
    },

    changePasswordText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1, // Ngăn text bị ép xuống dòng
    },
});
export default ProfileScreen;
