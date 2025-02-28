import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import * as ImagePicker from 'expo-image-picker';
import profileService from '../../service/api/profileService';
import Icon from 'react-native-vector-icons/AntDesign';
import mime from 'react-native-mime-types';

const EditProfileScreen = ({ navigation, route }: any) => {
    const { userData } = route.params;

    const [fullName, setFullName] = useState(userData.fullName);
    const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
    const [address, setAddress] = useState(userData.address || '');
    const [avatarUrl, setAvatarUrl] = useState(userData.avatarUrl);
    const [file, setFile] = useState<any>(null);
    const [dateOfBirth, setDateOfBirth] = useState(formatDate(userData.dateOfBirth || ''));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    function formatDate(dateString: string) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }

    function convertToLocalDateTime(dateString: string) {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}T00:00:00`;
    }

    function validateInputs() {
        let errors: any = {};
        if (!fullName.trim()) {
            errors.fullName = 'Họ và tên không được để trống!';
        } else if (fullName.length > 50) {
            errors.fullName = 'Họ và tên không được quá 50 ký tự!';
        }

        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Số điện thoại không được để trống!';
        } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
            errors.phoneNumber = 'Số điện thoại phải có đúng 10 chữ số!';
        }

        if (!address.trim()) {
            errors.address = 'Địa chỉ không được để trống!';
        } else if (address.length > 255) {
            errors.address = 'Địa chỉ không được quá 255 ký tự!';
        }

        if (!dateOfBirth.trim()) {
            errors.dateOfBirth = 'Ngày sinh không được để trống!';
        } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dateOfBirth)) {
            errors.dateOfBirth = 'Ngày sinh phải đúng định dạng dd/MM/yyyy!';
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleUpdateProfile = async () => {
        if (!validateInputs()) {
            showMessage({ message: 'Lỗi', description: 'Vui lòng kiểm tra lại thông tin!', type: 'danger' });
            return;
        }

        setLoading(true);
        const formattedDate = convertToLocalDateTime(dateOfBirth);

        const profileRequest = { fullName, phoneNumber, address, dateOfBirth: formattedDate };
        const formData = new FormData();
        formData.append('profileRequest', JSON.stringify(profileRequest));

        if (file) {
            formData.append('file', {
                uri: file.uri,
                type: mime.lookup(file.uri) || 'image/jpeg',
                name: file.uri.split('/').pop(),
            } as any);
        }

        try {
            await profileService.updateProfile(formData);
            showMessage({ message: 'Thành công', description: 'Hồ sơ đã được cập nhật!', type: 'success' });
            navigation.goBack();
        } catch (error) {
            showMessage({ message: 'Lỗi', description: 'Không thể cập nhật hồ sơ.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0]);
            setAvatarUrl(result.assets[0].uri);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name='arrowleft' size={24} color='#000' />
            </TouchableOpacity>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Text style={styles.title}>CẬP NHẬT HỒ SƠ</Text>

                        <TouchableOpacity onPress={pickImage}>
                            <Image
                                source={{ uri: avatarUrl || 'https://via.placeholder.com/120' }}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Họ và tên</Text>
                            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                            {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType='numeric'
                            />
                            {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Địa chỉ</Text>
                            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
                            {errors.address && <Text style={styles.error}>{errors.address}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Ngày sinh (dd/MM/yyyy)</Text>
                            <TextInput
                                style={styles.input}
                                value={dateOfBirth}
                                onChangeText={setDateOfBirth}
                                keyboardType='numeric'
                            />
                            {errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth}</Text>}
                        </View>

                        {loading ? (
                            <ActivityIndicator size='large' color='#007bff' style={styles.loadingIndicator} />
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
                                <Text style={styles.buttonText}>Lưu thay đổi</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, top: 24 },
    container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#f8f9fa' },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#a4a2a2', marginTop: 40 },
    avatar: { width: 130, height: 130, borderRadius: 65, marginBottom: 20, borderWidth: 2, borderColor: '#007bff' },
    inputContainer: { width: '100%', marginBottom: 12 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 5 },
    input: {
        height: 45,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    error: { color: 'red', fontSize: 14, marginTop: 2 },
    button: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    loadingIndicator: { marginVertical: 10 },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 8,
        borderRadius: 50,
        zIndex: 10,
    },
});

export default EditProfileScreen;
