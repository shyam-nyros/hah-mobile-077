import {View, ActivityIndicator, StyleSheet} from 'react-native';

const LoadingSpinner = ({color, size, marginTop}) => {
  return (
    <View style={[styles.container, styles.horizontal, styles.overlay]}>
      <ActivityIndicator
        style={marginTop ? {marginTop} : {marginTop: ""}}
        size={size || 'large'}
        color={color || 'blue'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: semi-transparent background
    zIndex: 1000, // High zIndex to ensure it stays on top
  },
});
export default LoadingSpinner;
