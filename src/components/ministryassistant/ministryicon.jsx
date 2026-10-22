import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FloatingChatIcon = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isDragging, setIsDragging] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const {width: screenWidth, height: screenHeight} = screenData;

  // Dynamic margin considering safe area (for iOS notch)
  const marginRight = screenWidth * 0.05 + insets.right;
  const marginBottom = screenHeight * 0.13 + insets.bottom;

  const initialX = screenWidth - (60 + marginRight);
  const initialY = screenHeight - (95 + marginBottom);

  const pan = useRef(new Animated.ValueXY({x: initialX, y: initialY})).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({x: pan.x._value, y: pan.y._value});
        pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        pan.flattenOffset();
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          navigation.navigate('MinistryAssistantScreen');
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        Platform.select({
          ios: styles.iosShadow,
          android: styles.androidShadow,
        }),
        {transform: [{translateX: pan.x}, {translateY: pan.y}]},
      ]}
      {...panResponder.panHandlers}>
      <LinearGradient
        colors={['#0077B6', '#90E0EF']}
        style={styles.gradientBackground}>
        <Image
          source={require('../../assets/images/logo_white.png')}
          style={styles.icon}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 1000,
    borderRadius: 50,
  },
  androidShadow: {
    elevation: 6,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
  },
  gradientBackground: {
    borderRadius: 50,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});

export default FloatingChatIcon;
