import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import TabNavigator from './TabNavigator';
import EditProfileScreen from '../screens/navbar/(profile)/EditProfileScreen';
import ProductDetailScreen from '../screens/home/ProductDetailScreen';
import { LoginScreen } from '../screens';
import ChangePasswordScreen from '../screens/navbar/(profile)/ChangePasswordScreen';
const Stack = createNativeStackNavigator();
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/navbar/CartScreen';
import FavoriteScreen from '../screens/navbar/FavoriteScreen';
import ProductForCategoryScreen from '../screens/home/ProductForCategoryScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import VnpayScreen from '../screens/checkout/VnpayScreen';
import PaymentFailedScreen from '../screens/checkout/PaymentFailedScreen';
import PaymentSuccessScreen from '../screens/checkout/PaymentSuccessScreen';
import ListOrderScreen from '../screens/navbar/(profile)/ListOrderScreen';
import OrderScreen from '../screens/navbar/(profile)/OrderScreen';
import UseCoin from '../screens/navbar/(profile)/UseCoin';
import ReviewScreen from '../screens/review/ReviewScreen';
// import ListDeliveryScreen from '../screens/home/ListDeliveryScreen';
import NotificationScreen from '../screens/navbar/NotidicationScreen';
const MainNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* đăng nhập xong mới vào đây -> đăng nhập xong mới dùng được các dưới đây */}
            <Stack.Screen name='Main' component={TabNavigator} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
            <Stack.Screen name='ProductDetailScreen' component={ProductDetailScreen} />
            <Stack.Screen name='CartScreen' component={CartScreen} />
            <Stack.Screen name='FavoriteScreen' component={FavoriteScreen} />
            <Stack.Screen name='LoginScreen' component={LoginScreen} />
            <Stack.Screen name='SignupScreen' component={SignupScreen} />
            <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen} />
            <Stack.Screen name='ResetPasswordScreen' component={ResetPasswordScreen} />
            <Stack.Screen name='OtpVerificationScreen' component={OtpVerificationScreen} />
            <Stack.Screen name='ProductForCategoryScreen' component={ProductForCategoryScreen} />
            <Stack.Screen name='CheckoutScreen' component={CheckoutScreen} />
            <Stack.Screen name='VnpayScreen' component={VnpayScreen} />
            <Stack.Screen name='PaymentFailedScreen' component={PaymentFailedScreen} />
            <Stack.Screen name='PaymentSuccessScreen' component={PaymentSuccessScreen} />
            <Stack.Screen name='ListOrderScreen' component={ListOrderScreen} />
            <Stack.Screen name='OrderScreen' component={OrderScreen} />
            <Stack.Screen name='UseCoin' component={UseCoin} />
            <Stack.Screen name='ReviewScreen' component={ReviewScreen} />
            <Stack.Screen name='Notification' component={NotificationScreen} />

        </Stack.Navigator>
    );
};

export default MainNavigator;
