import Toast from 'react-native-toast-message';

export const showSuccess = (message: string) => {
    Toast.show({
        type: 'success',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
    });
};

export const showError = (message: string) => {
    Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 4000,
    });
};

export const showInfo = (message: string, subtitle?: string) => {
    Toast.show({
        type: 'info',
        text1: message,
        text2: subtitle,
        position: 'top',
        visibilityTime: 4000,
    });
};
