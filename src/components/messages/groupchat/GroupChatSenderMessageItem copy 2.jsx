import moment from 'moment';
import React, {useState} from 'react';
import {Text, View, Image, Dimensions, TouchableOpacity, StyleSheet} from 'react-native';
import tw from 'twrnc';

import videoPlayIcon from '../../../assets/images/blueplayicon.png';
import videoPlaceHolderImg from '../../../assets/images/defaults/videothumbnail.png';
import FullScreenMedia from '../individualchat/FullScreenMedia';

const GroupChatSenderMessageItem = ({
  content, 
  createdAt, 
  attachment, 
  type
}) => {
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const {width} = Dimensions.get('window');
  const maxImageWidth = width * 0.6; // 60% of screen width

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
      
      <View style={tw`mt-3 mb-3 flex-row justify-end items-start gap-2`}>
        <View
          style={tw`bg-[#00B4D8] ml-18 gap-2 justify-end items-end p-[10px] rounded-[10px] rounded-tr-[0px] shadow-sm shadow-white`}>
          
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
              <View style={styles.videoContainer}>
                <Image
                  source={videoPlaceHolderImg}
                  style={{
                    width: maxImageWidth,
                    height: maxImageWidth * 0.6,
                    borderRadius: 5,
                    backgroundColor: '#222',
                  }}
                  resizeMode="cover"
                />
                {/* Uncomment if you want play button overlay
                <View style={styles.playButtonOverlay}>
                  <Image source={videoPlayIcon} style={tw`w-12 h-12`} /> 
                </View> */}
              </View>
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
            <Text style={tw`text-[#fff] text-[14px]`}>{content}</Text>
          )}
          
          <Text style={tw`text-[#fff] text-right text-[10px] -mt-2`}>
            {moment(createdAt).format('hh.mm A')}
          </Text>
        </View>
      </View>
    </>
  );
};

export default GroupChatSenderMessageItem;

const styles = StyleSheet.create({
  videoContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    minWidth: 200,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: '#fff',
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});