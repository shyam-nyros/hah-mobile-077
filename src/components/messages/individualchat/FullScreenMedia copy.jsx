import React, {useState, useRef} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
// import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import videoicon from '../../../assets/images/blueplayicon.png';
import CustomVideoPlayer from '../../../utils/videoplayer/CustomVideoPlayer';
// import videoicon from '../../assets/images/blueplayicon.png';

const {width, height} = Dimensions.get('window');

const FullScreenMedia = ({visible, mediaUrl, mediaType, onClose}) => {
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);

  const onLoadStart = () => {
    setLoading(true);
  };

  const onLoad = () => {
    setLoading(false);
  };

  const onError = error => {
    console.error('Media loading error:', error);
    setLoading(false);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={tw`py-2 px-2`}>
            <Image
              source={require('../../../assets/images/backnavicon.png')}
              style={tw`w-[26px] h-[46px]`}
            />
          </TouchableOpacity>

          {mediaType === 'video' && (
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.controlButton}>
              {/* <Icon
                name={paused ? 'play' : 'pause'}
                size={24}
                color="#fff"
              /> */}
              <Image
                source={videoicon}
                style={tw`w-4 h-4 bg-white bg-opacity-90 rounded-full absolute top-1 left-1 z-10`}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mediaContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#00B4D8"
              style={styles.loader}
            />
          )}

          {mediaType === 'image' ? (
            <Image
              source={{uri: mediaUrl}}
              style={styles.fullImage}
              resizeMode="contain"
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onError={onError}
            />
          ) : mediaType === 'video' ? (
            <Video
              ref={videoRef}
              source={{
                uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              }}
              //   source={{uri: mediaUrl}}
              style={styles.fullVideo}
              resizeMode="contain"
              controls={false}
              paused={paused}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onError={onError}
              repeat={true}
            />
          ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullImage: {
    width: width,
    height: height - 60,
  },
  fullVideo: {
    width: width,
    height: height - 60,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
  },
});

export default FullScreenMedia;
