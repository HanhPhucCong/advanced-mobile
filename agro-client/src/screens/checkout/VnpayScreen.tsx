import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/AntDesign';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type VnpayScreenRouteProp = RouteProp<{ VnpayScreen: { vnpayUrl: string } }, 'VnpayScreen'>;

const VnpayScreen: React.FC = ({ navigation }: any) => {
    const route = useRoute<VnpayScreenRouteProp>();
    const vnpayUrl = route.params?.vnpayUrl || 'https://sandbox.vnpayment.vn/tryitnow/';

    // Xử lý khi WebView thay đổi URL (khi BE goi vnpay call-back -> url bị thay đổi)
    const handleNavigation = (event: any) => {
        const url = event.url;
        //console.log('Current URL: ', url);

        if (url.startsWith('myapp://payment-success')) {
            navigation.navigate('PaymentSuccessScreen');
        } else if (url.startsWith('myapp://payment-failed')) {
            // Lấy lỗi từ URL và giải mã
            const urlObj = new URL(url);
            const errorParam = urlObj.searchParams.get('error') || 'Payment Failed! Please try again.';

            //console.log('Error param:', errorParam);

            navigation.navigate('PaymentFailedScreen', { error: errorParam });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name='arrowleft' size={26} color='#fff' />
            </TouchableOpacity>

            {/* WebView */}
            <View style={styles.webViewContainer}>
                <WebView
                    source={{ uri: vnpayUrl }}
                    style={styles.webView}
                    scalesPageToFit={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onNavigationStateChange={handleNavigation} // Bắt sự kiện điều hướng
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        marginBottom: 40,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 10,
        backgroundColor: 'rgba(93, 97, 102, 0.6)',
        padding: 12,
        borderRadius: 50,
        zIndex: 10,
        elevation: 5,
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: 'white',
        top: 50,
    },
    webView: {
        flex: 1,
    },
});

export default VnpayScreen;
