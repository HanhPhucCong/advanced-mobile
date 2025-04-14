import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Lock } from 'iconsax-react-native';
import { ButtonComponent, InputComponent, TextComponent, SpaceComponent, SectionComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import AntDesign from 'react-native-vector-icons/AntDesign'; // Import icon back
import authService from '../../service/api/authService';
import { showMessage, hideMessage } from 'react-native-flash-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { Keyboard } from 'react-native';

const OtpVerificationScreen = ({ navigation, route }: any) => {
    const { email, userId } = route.params; // Lấy email từ route params

    const [otp, setOtp] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Kiểm tra tính hợp lệ của OTP
    useEffect(() => {
        const isValid = otp.length === 6 && !isNaN(Number(otp));
        setIsDisabled(!isValid);
    }, [otp]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            Keyboard.dismiss();

            const verifyResponse: any = await authService.verify(otp, userId);
            if (verifyResponse && verifyResponse.data) {
                showMessage({
                    message: 'Verify account successfully!',
                    description: verifyResponse.message || 'Your account has been verified.',
                    type: 'success',
                    hideStatusBar: true,
                    position: 'top',
                    duration: 4000,
                });

                navigation.navigate('LoginScreen');
            }
        } catch (error: any) {
            let errorMessage = 'Verify failed!';

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
                message: 'Verify Failed',
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

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            Keyboard.dismiss();
            const getVerifyResponse: any = await authService.getVerify(email);
            if (getVerifyResponse && getVerifyResponse.message) {
                showMessage({
                    message: 'Get verify successfully!',
                    description: getVerifyResponse.message,
                    type: 'success',
                    hideStatusBar: true,
                    position: 'top',
                    duration: 4000,
                });
            }
        } catch (error: any) {
            //console.error('Error during signup:', error.response || error.message); // Log chi tiết lỗi
            let errorMessage = 'Get verify failed!';

            // Kiểm tra lỗi từ phản hồi của server
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message) {
                    errorMessage = message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showMessage({
                message: 'Get verify Failed',
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Spinner visible={loading} textContent={'Processing...'} textStyle={styles.spinnerTextStyle} />
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <AntDesign name='arrowleft' size={24} color={appColors.blueLink} />
            </TouchableOpacity>

            <SectionComponent styles={styles.section}>
                <TextComponent color={appColors.blueLink} size={24} title text='Verify your account' />
                <SpaceComponent height={21} />
                <TextComponent
                    size={14}
                    styles={{ textAlign: 'center' }}
                    text={`Please check your email and enter a verification code`}
                />
                <TextComponent color={appColors.grayTextBlur} text='(Expired in 5 minutes)'></TextComponent>
                <SpaceComponent height={32} />
                <InputComponent
                    value={otp}
                    placeholder='Enter OTP'
                    onChange={(val) => setOtp(val)}
                    allowClear
                    affix={<Lock size={22} color={appColors.gray} />}
                />
                <SpaceComponent height={16} />
            </SectionComponent>

            <ButtonComponent
                text='Verify OTP'
                onPress={handleSubmit}
                color={isDisabled ? appColors.gray : appColors.blueLink}
                type='primary'
                disable={isDisabled}
            />
            <View style={styles.buttonContainer}>
                <Text style={styles.normalText}>Didn't receive the code?</Text>
                <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={[styles.linkText, { marginLeft: 5 }]}>Resend OTP</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: appColors.white,
    },
    backButton: {
        position: 'absolute',
        top: 80,
        left: 10,
        zIndex: 1,
    },
    section: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 75,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
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

export default OtpVerificationScreen;
