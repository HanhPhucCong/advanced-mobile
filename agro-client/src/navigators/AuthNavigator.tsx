import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LoginScreen } from '../screens';
import OnboardingScreen from '../screens/auth/OnBoarding';
import TabNavigator from './TabNavigator';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import EditProfileScreen from '../screens/home/EditProfileScreen';
import ProductDetailScreen from '../screens/home/ProductDetailScreen';
import ChangePasswordScreen from '../screens/home/ChangePasswordScreen';
import CartScreen from '../screens/home/CartScreen';
import FavoriteScreen from '../screens/home/FavoriteScreen';
import ProductForCategoryScreen from '../screens/home/ProductForCategoryScreen';
import CheckoutScreen from '../screens/home/(checkout)/CheckoutScreen';
import VnpayScreen from '../screens/home/(checkout)/VnpayScreen';
import PaymentFailedScreen from '../screens/home/(checkout)/PaymentFailedScreen';
import PaymentSuccessScreen from '../screens/home/(checkout)/PaymentSuccessScreen';
import UseCoin from '../screens/home/(profile)/UseCoin';

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
        </Stack.Navigator>
    );
};

export default AuthNavigator;
