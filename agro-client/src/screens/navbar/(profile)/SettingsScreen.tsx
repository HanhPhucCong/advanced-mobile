import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const API_URL = 'http://localhost:8083/api/user/my-profile';
const BEARER_TOKEN = 'your-token-here';

const ProfileScreen: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetch(API_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => setUserData(data.data))
            .catch((error) => console.error('Error fetching user data:', error))
            .finally(() => setLoading(false));
    }, []);

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
                        <InfoRow label='Ngày sinh' value={userData.dateOfBirth?.split('T')[0] || 'Chưa cập nhật'} />
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.errorText}>Không thể tải dữ liệu người dùng.</Text>
            )}
        </ScrollView>
    );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
    profileCard: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, borderWidth: 3, borderColor: '#007bff' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    email: { fontSize: 16, color: '#555', marginBottom: 15 },
    infoContainer: { width: '100%', marginTop: 10 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#555' },
    infoValue: { fontSize: 16, color: '#333' },
    button: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    errorText: { color: 'red', fontSize: 16, marginTop: 20 },
});

export default ProfileScreen;
