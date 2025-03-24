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
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Đảm bảo không bị che
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10, // Điều chỉnh vị trí theo nền tảng
        left: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 50,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 20 : 20, // Đảm bảo tiêu đề không bị che
    },
    optionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    minOrderText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    noOptionText: {
        fontSize: 16,
        color: 'red',
        marginTop: 20,
        textAlign: 'center',
    },

    coinText: {
        fontSize: 18,
        color: '#34495E',
        textAlign: 'center',
        marginBottom: 10,
    },
    coinHighlight: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E67E22',
    },
    couponList: {
        flex: 1,
        marginBottom: 10,
        maxHeight: 400,
    },
    couponTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    couponItem: {
        backgroundColor: '#e19d2e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    couponText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    couponDetail: {
        fontSize: 14,
        color: '#FDEBD0',
    },
    noCouponText: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    exchangeContainer: {
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    optionButton: {
        padding: 15,
        backgroundColor: '#ECF0F1',
        marginHorizontal: 5,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
    },
    selectedOption: {
        backgroundColor: '#b7e4ca',
    },
    exchangeButton: {
        marginTop: 10,
        paddingVertical: 15,
        backgroundColor: '#E74C3C',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
