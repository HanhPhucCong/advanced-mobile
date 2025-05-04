import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';
import passwordService from '../../../service/api/passwordService';

const ChangePasswordScreen = ({ route }: any) => {
    const navigation = useNavigation();
    const { userData } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const toggleShowPassword = (field: 'old' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const isPasswordValid = newPassword.length >= 6;
    const isConfirmValid = newPassword === confirmPassword;
    const isFormValid = isPasswordValid && isConfirmValid && otp;

    const handleSendOtp = async () => {
        const email = userData.email;
        const response = await passwordService.sendOtp(email);
        if (response.success) {
            setOtpSent(true);
            setCountdown(30);
            showMessage({
                message: 'OTP đã được gửi',
                description: 'Vui lòng kiểm tra email để lấy mã OTP',
                type: 'success',
            });

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setOtpSent(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            showMessage({
                message: 'Lỗi',
                description: response.message,
                type: 'danger',
            });
        }
    };

    const handleChangePassword = async () => {
        if (!isPasswordValid) {
            showMessage({
                message: 'Lỗi',
                description: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
                type: 'danger',
            });
            return;
        }
        if (!isConfirmValid) {
            showMessage({
                message: 'Lỗi',
                description: 'Mật khẩu xác nhận không khớp.',
                type: 'danger',
            });
            return;
        }

        const userId = userData.id;
        const response = await passwordService.changePassword(userId, confirmPassword, otp);

        if (response.success) {
            showMessage({
                message: 'Thành công',
                description: 'Mật khẩu đã được thay đổi.',
                type: 'success',
            });
            navigation.goBack();
        } else {
            showMessage({
                message: 'Lỗi',
                description: response.message,
                type: 'danger',
            });
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name='arrow-back' size={28} color='black' />
            </TouchableOpacity>

            <Text style={styles.title}>Đổi Mật Khẩu</Text>

            {/* Ô nhập mật khẩu mới */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder='Nhập mật khẩu mới'
                    secureTextEntry={!showPasswords.new}
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => toggleShowPassword('new')}>
                    <Ionicons
                        name={showPasswords.new ? 'eye' : 'eye-off'}
                        size={24}
                        color='gray'
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Ô nhập xác nhận mật khẩu */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder='Xác nhận mật khẩu mới'
                    secureTextEntry={!showPasswords.confirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => toggleShowPassword('confirm')}>
                    <Ionicons
                        name={showPasswords.confirm ? 'eye' : 'eye-off'}
                        size={24}
                        color='gray'
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* OTP Input và Button cùng hàng */}
            <View style={styles.otpContainer}>
                <TextInput
                    style={styles.otpInput}
                    placeholder='Nhập mã OTP'
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType='numeric'
                />
                <TouchableOpacity
                    style={[styles.otpButton, otpSent && styles.otpButtonDisabled]}
                    onPress={handleSendOtp}
                    disabled={otpSent}
                >
                    <Text style={styles.otpButtonText}>{otpSent ? `Gửi lại (${countdown}s)` : 'Gửi OTP'}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                onPress={handleChangePassword}
                disabled={!isFormValid}
            >
                <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ChangePasswordScreen;

// styles giữ nguyên không thay đổi

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    otpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    otpInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    otpButton: {
        marginLeft: 10,
        backgroundColor: '#007bff',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    otpButtonDisabled: {
        backgroundColor: '#ccc',
    },
    otpButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: '#28a745',
        paddingVertical: 15,
        width: '100%',
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
