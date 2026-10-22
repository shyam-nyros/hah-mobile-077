import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  Share,
} from 'react-native';
import {useSelector} from 'react-redux';
import tw from 'twrnc';

// share used in 2 places
// 1. leader profile and 2. Feed post items
// based on where its used the icon will update
// icon is based on leader flag
const ShareAppInSocialLinks = ({leader}) => {
  const {appShareLinks} = useSelector(state => state.auth);

  const handleShare = async () => {
    const storeUrl =
      Platform.OS === 'ios' ? appShareLinks?.ios : appShareLinks?.android;
    const shareMessage = `Check out this amazing app: ${storeUrl}`;
    try {
      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (err) {
      console.error('Failed to share:', err.message);
    }
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <View style={tw`flex-row gap-4 items-center`}>
        {/* Share button */}

        <View style={tw`flex-row gap-2 items-center`}>
          {leader && (
            <Image
              source={require('../../assets/images/share2icon.png')}
              style={tw`w-4 h-4 m-2`}
            />
          )}
          {!leader && (
            <Image
              source={require('../../assets/images/shareicon.png')}
              style={tw`w-6 h-6 mx-2 my-1`}
            />
          )}
          {/* <Text style={tw`text-[#fff] text-[16px] font-medium`}>
            {shareCount}
          </Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ShareAppInSocialLinks;
