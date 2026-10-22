import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const FloatingChatIcon = () => {
  const navigation = useNavigation();
  const [isDragging, setIsDragging] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Get screen dimensions
  const {width: screenWidth, height: screenHeight} = screenData;

  // // Calculate responsive initial position (bottom-right with some margin)
  // const initialX = screenWidth - 100; // 100px from right edge
  // const initialY = screenHeight - 200; // 200px from bottom

  const marginRight = screenWidth * 0.1; // 5% from right edge
  const marginBottom = screenHeight * 0.15; // 10% from bottom

  const initialX = screenWidth - (60 + marginRight);
  const initialY = screenHeight - (60 + marginBottom);
  // Initial position
  const pan = useRef(new Animated.ValueXY({x: initialX, y: initialY})).current;

  // Update screen dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
      // Optionally reset position on orientation change
      // pan.setValue({x: window.width - 100, y: window.height - 200});
    });

    return () => subscription?.remove();
  }, []);

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only set pan responder if there's significant movement
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
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

        // If there was minimal movement, treat it as a tap
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
    padding: 19,
    // elevation: 5,
    // shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // shadowOffset: { width: 0, height: 2 },
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
