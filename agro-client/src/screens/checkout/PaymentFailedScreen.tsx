import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute } from '@react-navigation/native';

type PaymentFailedScreenRouteProp = RouteProp<{ PaymentFailedScreen: { error?: string } }, 'PaymentFailedScreen'>;

const PaymentFailedScreen = ({ navigation }: any) => {
    const route = useRoute<PaymentFailedScreenRouteProp>();
    const error = route.params?.error || 'Payment Failed! Please try again.';

    return (
        <View style={styles.container}>
            <Icon name='error' size={80} color='red' style={styles.icon} />
            <Text style={styles.title}>Thanh toán thất bại!</Text>
            <Text style={styles.message}>Lỗi: {error}</Text>
            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Main')}>
                <Text style={styles.homeText}>Về trang chủ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 30,
    },
    homeButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    homeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PaymentFailedScreen;
