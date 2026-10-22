import React, {useState} from 'react';
import {Image, Text, View, Dimensions, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import Video from 'react-native-video';
import tw from 'twrnc';
import moment from 'moment';
import FullScreenMedia from '../individualchat/FullScreenMedia';

const GroupChatReceiverMessageItem = ({
  name,
  profileImage,
  content,
  createdAt,
  attachment,
  type,
}) => {
  const {width} = Dimensions.get('window');
  const maxImageWidth = width * 0.6; // 60% of screen width
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);

  const handleVideoError = (error) => {
    
    setVideoError(true);
    setThumbnailLoading(false);
  };

  const handleVideoLoad = () => {
    setThumbnailLoading(false);
  };

  const handleVideoLoadStart = () => {
    setThumbnailLoading(true);
    setVideoError(false);
  };

  const renderVideoThumbnail = () => {
    if (videoError) {
      // Fallback to placeholder if video fails to load
      return (
        <Image
          source={{uri: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"}}
          style={{
            width: maxImageWidth,
            height: maxImageWidth * 0.6,
            borderRadius: 5,
            backgroundColor: '#222',
          }}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.videoThumbnailContainer}>
        {/* Loading indicator */}
        {thumbnailLoading && (
          <View style={[
            styles.thumbnailLoader,
            {
              width: maxImageWidth,
              height: maxImageWidth * 0.6,
            }
          ]}>
            <ActivityIndicator size="small" color="#00B4D8" />
          </View>
        )}
        
        <Video
          source={{uri: attachment.url}}
          style={{
            width: maxImageWidth,
            height: maxImageWidth * 0.6,
            borderRadius: 5,
            opacity: thumbnailLoading ? 0 : 1,
          }}
          paused={true}
          resizeMode="cover"
          onError={handleVideoError}
          onLoad={handleVideoLoad}
          onLoadStart={handleVideoLoadStart}
          poster={undefined} // Let video show first frame
          posterResizeMode="cover"
        />
        
        {/* Play button overlay - only show when not loading */}
        {!thumbnailLoading && !videoError && (
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Image
                source={require('../../../assets/images/blueplayicon.png')}
                style={styles.playIcon}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Full Screen Media Modal */}
      {(type === 'image' || type === 'video') && attachment?.url && (
        <FullScreenMedia
          visible={fullScreenVisible}
          mediaUrl={attachment.url}
          mediaType={type}
          onClose={() => setFullScreenVisible(false)}
        />
      )}
      
      <View style={tw`mt-3 mb-3 flex-row gap-2`}>
        <Image
          source={
            profileImage
              ? {uri: profileImage}
              : require('../../../assets/images/whiteplaceholder.png')
          }
          style={tw`w-7 h-7 rounded-full`}
        />

        <View
          style={tw`bg-white mr-18 p-[10px] justify-end flex rounded-[10px] rounded-tl-[0px] shadow-sm`}>
          
          {/* Sender Name */}
          <Text style={tw`text-[15px] text-[#040641] font-medium mb-1`}>{name}</Text>
          
          {/* Message Content */}
          {type === 'image' && attachment?.url ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => setFullScreenVisible(true)}>
              <Image
                source={{uri: attachment.url}}
                style={{
                  width: maxImageWidth,
                  height: maxImageWidth,
                  borderRadius: 5,
                  marginBottom: 5,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : type === 'video' && attachment?.url ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => setFullScreenVisible(true)}>
              {renderVideoThumbnail()}
            </TouchableOpacity>
          ) : type === 'file' && attachment?.url ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              style={styles.fileContainer}>
              <View style={styles.fileIcon}>
                <Image
                  source={require('../../../assets/images/pagesicon.png')}
                  style={tw`w-8 h-8`}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {attachment.name || 'Document'}
                </Text>
                <Text style={styles.fileSize}>
                  {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'File'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={tw`text-[#0d0d0d] text-[14px]`}>{content}</Text>
          )}
          
          {/* Timestamp */}
          <Text style={tw`text-[#aaa] text-right text-[10px]`}>
            {moment(createdAt).format('hh.mm A')}
          </Text>
        </View>
      </View>
    </>
  );
};

export default GroupChatReceiverMessageItem;

const styles = StyleSheet.create({
  videoThumbnailContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  thumbnailLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playIcon: {
    width: 20,
    height: 20,
    marginLeft: 2, // Slight adjustment for visual centering
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  fileSize: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
});