import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Sms, Lock, User } from 'iconsax-react-native';
import {
    ContainerComponent,
    SectionComponent,
    SpaceComponent,
    InputComponent,
    ButtonComponent,
    TextComponent,
} from '../../components';
import { appColors } from '../../constants/appColors';
import { Validate } from '../../utils/validate';
import authService from '../../service/api/authService';
import { showMessage, hideMessage } from 'react-native-flash-message';
import Spinner from 'react-native-loading-spinner-overlay';

const SignupScreen = ({ navigation }: any) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDisable, setIsDisable] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailValidation = Validate.email(email);
        const passwordValidation = password === confirmPassword;

        if (!fullName || !email || !password || !confirmPassword || !emailValidation || !passwordValidation) {
            setIsDisable(true);
        } else {
            setIsDisable(false);
        }
    }, [fullName, email, password, confirmPassword]);

    const handleSignup = async () => {
        try {
            setLoading(true);
            console.log(fullName, email, password, confirmPassword);
            const response: any = await authService.register(fullName, email, password, confirmPassword);
            console.log(response);

            if (response && response.data) {
                const userId = response.data.id || null;
                navigation.navigate('OtpVerificationScreen', { email, userId });
            }
        } catch (error: any) {
            let errorMessage = 'Sign up failed!';

            if (error.response && error.response.data) {
                const data = error.response.data;

                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.Message) {
                    errorMessage = data.Message;
                } else if (Array.isArray(data.errors)) {
                    errorMessage = data.errors.join('\n');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showMessage({
                message: 'Sign up Failed',
                description: errorMessage,
                type: 'danger',
                hideStatusBar: true,
                position: 'top',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerComponent isImageBackground isScroll>
            <Spinner visible={loading} textContent={'Processing...'} textStyle={styles.spinnerTextStyle} />
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
                        marginBottom: 15,
                    }}
                />
            </SectionComponent>
            <SectionComponent>
                <TextComponent size={24} title text='Sign up' />
                <SpaceComponent height={21} />

                <InputComponent
                    value={fullName}
                    placeholder='Full Name'
                    onChange={(val) => setFullName(val)}
                    allowClear
                    affix={<User size={22} color={appColors.gray} />}
                />

                <InputComponent
                    value={email}
                    placeholder='Email'
                    onChange={(val) => setEmail(val)}
                    allowClear
                    affix={<Sms size={22} color={appColors.gray} />}
                />
                <InputComponent
                    value={password}
                    placeholder='Password'
                    onChange={(val) => setPassword(val)}
                    isPassword
                    allowClear
                    affix={<Lock size={22} color={appColors.gray} />}
                />
                <InputComponent
                    value={confirmPassword}
                    placeholder='Confirm Password'
                    onChange={(val) => setConfirmPassword(val)}
                    isPassword
                    allowClear
                    affix={<Lock size={22} color={appColors.gray} />}
                />
            </SectionComponent>
            <SectionComponent>
                <ButtonComponent
                    text='SIGN UP'
                    onPress={handleSignup}
                    type='primary'
                    disable={isDisable}
                    color={isDisable ? appColors.gray : appColors.blueLink}
                />
            </SectionComponent>
            <SectionComponent>
                <View style={styles.buttonContainer}>
                    <Text style={styles.normalText}>You already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                        <Text style={[styles.linkText, { marginLeft: 5 }]}>Sign in</Text>
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
    spinnerTextStyle: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default SignupScreen;
