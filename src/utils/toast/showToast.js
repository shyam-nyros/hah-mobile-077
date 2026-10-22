import Toast from 'react-native-toast-message';

const showToast = (type, message, duration = 4000) => {
  if (type === 'success') {
    Toast.show({
      type: 'success',
      text2: message,
      visibilityTime: duration,
    });
  } else if (type === 'error') {
    Toast.show({
      type: 'error',
      text2: message,
      visibilityTime: duration,
    });
  } else {
    Toast.show({
      type: 'info',
      text2: message,
      visibilityTime: duration,
    });
  }
};

export default showToast;
