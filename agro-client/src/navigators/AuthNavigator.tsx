import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LoginScreen } from '../screens';
import OnboardingScreen from '../screens/auth/OnBoarding';
import TabNavigator from './TabNavigator';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import EditProfileScreen from '../screens/navbar/(profile)/EditProfileScreen';
import ProductDetailScreen from '../screens/home/ProductDetailScreen';
import ChangePasswordScreen from '../screens/navbar/(profile)/ChangePasswordScreen';
import CartScreen from '../screens/navbar/CartScreen';
import FavoriteScreen from '../screens/navbar/FavoriteScreen';
import ProductForCategoryScreen from '../screens/home/ProductForCategoryScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import VnpayScreen from '../screens/checkout/VnpayScreen';
import PaymentFailedScreen from '../screens/checkout/PaymentFailedScreen';
import PaymentSuccessScreen from '../screens/checkout/PaymentSuccessScreen';
import UseCoin from '../screens/navbar/(profile)/UseCoin';
import NotificationScreen from '../screens/navbar/NotidicationScreen';
import ListOrderScreen from '../screens/navbar/(profile)/ListOrderScreen';
import HomeScreen from '../screens/home/HomeScreen';

const AuthNavigator = () => {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='OnboardingScreen' component={OnboardingScreen} />
            <Stack.Screen name='LoginScreen' component={LoginScreen} />
            <Stack.Screen name='SignupScreen' component={SignupScreen} />
            <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen} />
            <Stack.Screen name='ResetPasswordScreen' component={ResetPasswordScreen} />
            <Stack.Screen name='OtpVerificationScreen' component={OtpVerificationScreen} />
            <Stack.Screen name='Main' component={TabNavigator} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen name='ProductDetailScreen' component={ProductDetailScreen} />
            <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
            <Stack.Screen name='CartScreen' component={CartScreen} />
            <Stack.Screen name='FavoriteScreen' component={FavoriteScreen} />
            <Stack.Screen name='ProductForCategoryScreen' component={ProductForCategoryScreen} />
            <Stack.Screen name='CheckoutScreen' component={CheckoutScreen} />
            <Stack.Screen name='VnpayScreen' component={VnpayScreen} />
            <Stack.Screen name='PaymentFailedScreen' component={PaymentFailedScreen} />
            <Stack.Screen name='PaymentSuccessScreen' component={PaymentSuccessScreen} />
            <Stack.Screen name='UseCoin' component={UseCoin} />
            <Stack.Screen name='Notification' component={NotificationScreen} />
            <Stack.Screen name='ListOrderScreen' component={ListOrderScreen} />
            <Stack.Screen name='HomeScreen' component={HomeScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
