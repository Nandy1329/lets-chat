import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Platform,
    Alert,
    ActionSheetIOS,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CustomActions = ({ onSend, storage, userId }) => {
    const actionSheetRef = useRef();

    const showActionSheet = () => {
        const options = [
            'Select an image from library',
            'Take a photo',
            'Share location',
            'Cancel',
        ];
        const cancelButtonIndex = 3;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex },
                (buttonIndex) => handleAction(buttonIndex)
            );
        } else {
            actionSheetRef.current.show();
        }
    };

    const handleAction = async (index) => {
        switch (index) {
            case 0:
                await pickImage();
                break;
            case 1:
                await takePhoto();
                break;
            case 2:
                await shareLocation();
                break;
            default:
                break;
        }
    };

    const pickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert('Permission denied', 'We need access to your media library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) uploadAndSend(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
            Alert.alert('Permission denied', 'We need access to your camera.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (!result.canceled) uploadAndSend(result.assets[0].uri);
    };

    const shareLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'We need access to your location.');
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        onSend([
            {
                text: 'My location',
                location: {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                },
            },
        ]);
    };

    const uploadAndSend = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const timestamp = Date.now();
            const filename = uri.split('/').pop() || `photo_${timestamp}.jpg`;
            const storageRef = ref(
                storage,
                `user_uploads/${userId || 'anonymous'}/${timestamp}_${filename}`
            );

            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${Math.round(progress)}% done`);
                },
                (error) => {
                    console.error('Upload error:', error);
                    Alert.alert('Upload failed', error.message);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onSend([{ image: downloadURL }]);
                }
            );
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('Upload failed', err.message);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={showActionSheet}
                accessibilityLabel="Open actions menu"
                accessibilityRole="button"
                style={styles.button}
            >
                <Text style={styles.icon}>➕</Text>
            </TouchableOpacity>

            {/* Android ActionSheet */}
            <ActionSheet
                ref={actionSheetRef}
                title="Choose an action"
                options={[
                    'Select an image from library',
                    'Take a photo',
                    'Share location',
                    'Cancel',
                ]}
                cancelButtonIndex={3}
                onPress={(index) => handleAction(index)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4,
    },
    button: {
        backgroundColor: '#f2f3f5',
        borderRadius: 20,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
        color: '#111',
    },
});

export default CustomActions;
