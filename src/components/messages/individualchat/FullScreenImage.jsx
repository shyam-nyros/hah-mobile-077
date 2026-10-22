import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Text,
} from 'react-native';
import tw from 'twrnc';

// import Icon from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window');

const FullScreenImage = ({visible, imageUrl, onClose}) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            {/* <Icon name="arrow-back" size={24} color="#fff" /> */}
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: imageUrl}}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 60,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullImage: {
    width: width,
    height: height - 60,
  },
});

export default FullScreenImage;