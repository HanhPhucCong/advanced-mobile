import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const PaymentSuccessScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            {/* Icon Thành Công */}
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }}
                style={styles.successIcon}
            />

            {/* Tiêu đề */}
            <Text style={styles.title}>Thanh toán thành công!</Text>
            <Text style={styles.subtitle}>Cảm ơn bạn đã mua sắm. Chúc bạn một ngày tốt lành! 🎉</Text>

            {/* Nút Quay Lại Trang Chủ */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
                <Icon name='home' size={24} color='#fff' style={styles.icon} />
                <Text style={styles.buttonText}>Về Trang Chủ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    successIcon: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2ecc71',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#2ecc71',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default PaymentSuccessScreen;
