import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { showMessage } from 'react-native-flash-message';
import couponService from '../../../service/api/couponService';

const UseCoin = ({ route, navigation }: any) => {
    const { currentCoin } = route.params;
    const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
    const [currentCoinState, setCurrentCoinState] = useState(currentCoin);
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await couponService.myCoupons();
            setCoupons(response.data);
        } catch (error) {
            //console.error('Lỗi lấy danh sách coupon:', error);
            showMessage({
                message: 'Lỗi',
                description: 'Không thể tải danh sách mã giảm giá',
                type: 'danger',
            });
        }
    };

    const exchangeOptions = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
    const handleExchange = async () => {
        if (!selectedCoin) {
            showMessage({
                message: 'Thông báo',
                description: 'Vui lòng chọn số xu muốn đổi',
                type: 'warning',
            });
            return;
        }

        try {
            await couponService.create({ coinAmount: selectedCoin });
            // Cập nhật số xu ngay lập tức
            setCurrentCoinState((prev: any) => prev - selectedCoin);

            showMessage({
                message: 'Thành công',
                description: `Bạn đã đổi ${selectedCoin} xu lấy mã giảm giá!`,
                type: 'success',
            });

            fetchCoupons();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đổi xu thất bại, vui lòng thử lại.';
            showMessage({
                message: 'Lỗi',
                description: errorMessage,
                type: 'danger',
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Tránh bị che trên Android */}
            {Platform.OS === 'android' && <StatusBar backgroundColor='#F8F9FA' barStyle='dark-content' />}

            <View style={styles.container}>
                {/* Nút quay lại */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name='arrowleft' size={26} color='#000' />
                </TouchableOpacity>

                {/* Tiêu đề */}
                <Text style={styles.title}>Đổi xu lấy mã giảm giá</Text>
                <Text style={styles.coinText}>
                    Số xu hiện có: <Text style={styles.coinHighlight}>{currentCoinState}</Text>
                </Text>

                {/* Danh sách coupon */}
                <ScrollView style={styles.couponList} showsVerticalScrollIndicator={false}>
                    <Text style={styles.couponTitle}>Mã giảm giá của bạn</Text>
                    {coupons.length > 0 ? (
                        coupons.map((coupon: any) => (
                            <View key={coupon.id} style={styles.couponItem}>
                                <Text style={styles.couponText}>Giảm {coupon.discountValue}%</Text>
                                <Text style={styles.couponDetail}>
                                    Áp dụng cho đơn từ {coupon.minimumOrderAmount.toLocaleString()}đ
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noCouponText}>Bạn chưa có mã giảm giá nào</Text>
                    )}
                </ScrollView>

                {/* Phần đổi xu */}
                <View style={styles.exchangeContainer}>
                    <Text style={styles.subTitle}>Chọn số xu muốn đổi:</Text>
                    <ScrollView style={styles.scrollContainer} horizontal>
                        {exchangeOptions.length > 0 ? (
                            exchangeOptions.map((coin) => (
                                <TouchableOpacity
                                    key={coin}
                                    style={[styles.optionButton, selectedCoin === coin && styles.selectedOption]}
                                    onPress={() => setSelectedCoin(coin)}
                                >
                                    <Text style={styles.optionText}>
                                        {coin} xu → Giảm {coin / 100}%
                                    </Text>
                                    <Text style={styles.minOrderText}>
                                        Áp dụng cho đơn từ {(coin * 100).toLocaleString()}đ
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noOptionText}>Bạn cần tối thiểu 1000 xu để đổi mã giảm giá</Text>
                        )}
                    </ScrollView>

                    {exchangeOptions.length > 0 && (
                        <TouchableOpacity style={styles.exchangeButton} onPress={handleExchange}>
                            <Text style={styles.buttonText}>Xác nhận đổi</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default UseCoin;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#F2F4F5',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10,
        left: 10,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 50,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        textAlign: 'center',
        marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 20 : 20,
        marginBottom: 8,
    },
    coinText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    coinHighlight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E86AB',
    },

    couponList: {
        flex: 1,
        marginBottom: 10,
        maxHeight: 400,
    },
    couponTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 10,
    },
    couponItem: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    couponText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E86AB',
        marginBottom: 4,
    },
    couponDetail: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    noCouponText: {
        fontSize: 15,
        color: '#95A5A6',
        textAlign: 'center',
    },

    exchangeContainer: {
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 8,
    },
    subTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
        textAlign: 'center',
    },
    scrollContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    optionButton: {
        padding: 14,
        backgroundColor: '#F0F1F3',
        marginHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 130,
    },
    selectedOption: {
        backgroundColor: '#D1F2EB',
    },
    optionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
        textAlign: 'center',
    },
    minOrderText: {
        fontSize: 13,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    noOptionText: {
        fontSize: 15,
        color: '#E74C3C',
        marginTop: 20,
        textAlign: 'center',
    },
    exchangeButton: {
        marginTop: 10,
        paddingVertical: 15,
        backgroundColor: '#2E86AB',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});
