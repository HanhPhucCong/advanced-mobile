import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import TabNavigator from './TabNavigator';
import EditProfileScreen from '../screens/home/EditProfileScreen';
import ProductDetailScreen from '../screens/home/ProductDetailScreen';
import { LoginScreen } from '../screens';
import ChangePasswordScreen from '../screens/home/ChangePasswordScreen';
const Stack = createNativeStackNavigator();
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/home/CartScreen';
import FavoriteScreen from '../screens/home/FavoriteScreen';
import ProductForCategoryScreen from '../screens/home/ProductForCategoryScreen';
import CheckoutScreen from '../screens/home/(checkout)/CheckoutScreen';
import VnpayScreen from '../screens/home/(checkout)/VnpayScreen';
import PaymentFailedScreen from '../screens/home/(checkout)/PaymentFailedScreen';
import PaymentSuccessScreen from '../screens/home/(checkout)/PaymentSuccessScreen';
import ListOrderScreen from '../screens/home/ListOrderScreen';
import OrderScreen from '../screens/home/OrderScreen';
import UseCoin from '../screens/home/(profile)/UseCoin';
import ReviewScreen from '../screens/home/ReviewScreen';
// import ListDeliveryScreen from '../screens/home/ListDeliveryScreen';

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
        </Stack.Navigator>
    );
};

export default MainNavigator;
