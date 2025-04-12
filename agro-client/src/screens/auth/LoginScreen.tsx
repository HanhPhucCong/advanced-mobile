import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sms, Lock } from 'iconsax-react-native';
import {
    ContainerComponent,
    SectionComponent,
    SpaceComponent,
    InputComponent,
    RowComponent,
    ButtonComponent,
    TextComponent,
} from '../../components';
import { appColors } from '../../constants/appColors';
import { Validate } from '../../utils/validate';
import authService from '../../service/api/authService';
import { showMessage, hideMessage } from 'react-native-flash-message';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isDisable, setIsDisable] = useState(true);

    useEffect(() => {
        const emailValidation = Validate.email(email);
        if (!email || !password || !emailValidation) {
            setIsDisable(true);
        } else {
            setIsDisable(false);
        }
    }, [email, password]);

    const handleLogin = async () => {
        try {
            const response: any = await authService.login(email, password);

            if (!response) {
                throw new Error(response?.message || 'Login failed');
            }

            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('refreshToken', response.refreshToken);
            navigation.navigate('Main');
        } catch (error: any) {
            let errorMessage = 'Sign in failed!';

            // Kiểm tra và log lỗi để debug
            if (error.response && error.response.data) {
                //console.log('check 88:', error.response.data.message);

                const { message, status } = error.response.data;

                if (status === 401) {
                    errorMessage = message || 'Incorrect email or password!';
                } else {
                    errorMessage = 'Something went wrong. Please try again!';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showMessage({
                message: 'Login Failed',
                description: errorMessage,
                type: 'danger',
                hideStatusBar: true,
                position: 'top',
                duration: 4000,
            });

            //console.error('Login Error:', error);
        }
    };

    return (
        <ContainerComponent isImageBackground isScroll>
            <SectionComponent
                styles={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 75,
                }}
            >
                <Image
                    source={require('../../assets/images/text-logo.png')}
                    style={{
                        width: 250,
                        height: 150,
                        marginBottom: 30,
                    }}
                />
            </SectionComponent>
            <SectionComponent>
                <TextComponent size={24} title text='Login' />
                <SpaceComponent height={21} />
                <InputComponent
                    value={email}
                    placeholder='Email'
                    onChange={(val) => setEmail(val)}
                    allowClear
                    affix={<Sms size={22} color={appColors.gray} />}
                    fontSize={16}
                />
                <InputComponent
                    value={password}
                    placeholder='Password'
                    onChange={(val) => setPassword(val)}
                    isPassword
                    allowClear
                    affix={<Lock size={22} color={appColors.gray} />}
                    fontSize={16}
                />
                <RowComponent justify='space-between'>
                    <RowComponent>
                        <Text></Text>
                    </RowComponent>
                    <ButtonComponent
                        text='Forgot Password?'
                        onPress={() => navigation.navigate('ForgotPasswordScreen')}
                        type='text'
                    />
                </RowComponent>
            </SectionComponent>
            <SpaceComponent height={16} />
            <SectionComponent>
                <ButtonComponent text='LOGIN' onPress={handleLogin} color={appColors.blueLink} type='primary' />
            </SectionComponent>
            <SectionComponent>
                <View style={styles.buttonContainer}>
                    <Text style={styles.normalText}>Dont have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
                        <Text style={[styles.linkText, { marginLeft: 5 }]}>Sign up</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.guestRow}>
                    <Text style={styles.guestTitle}>Continue as a guest?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                        <Text style={styles.guestLink}> Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </SectionComponent>
        </ContainerComponent>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    normalText: {
        fontSize: 16,
        color: appColors.grayTextBlur,
    },
    linkText: {
        fontSize: 16,
        color: appColors.blueLink,
    },
    guestRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    guestTitle: {
        fontSize: 14,
        color: '#666',
    },
    guestLink: {
        fontSize: 14,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
