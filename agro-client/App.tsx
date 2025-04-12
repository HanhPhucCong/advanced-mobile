import React, { useEffect, useState } from 'react';
import { SplashScreen } from './src/screens';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigators/AuthNavigator';
import { StatusBar } from 'react-native';
import MainNavigator from './src/navigators/MainNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage from 'react-native-flash-message';
import { navigationRef } from './src/navigators/RootNavigation';

const App = () => {
    const [isShowSplash, setIsShowSplash] = useState(true);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsShowSplash(false);
        }, 1500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            //await AsyncStorage.clear();
            const token = await AsyncStorage.getItem('token');
            console.log('check current token: ', token);
            if (token) {
                setAccessToken(token);
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
    };

    return (
        <>
            <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'} />
            {isShowSplash ? (
                <SplashScreen />
            ) : (
                <NavigationContainer ref={navigationRef}>
                    <MainNavigator />
                    {/* {accessToken ? <MainNavigator /> : <AuthNavigator />} */}
                </NavigationContainer>
            )}
            <FlashMessage position='top' />
        </>
    );
};

export default App;
