import React, {useState} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {
  useAcceptConnectionRequestMutation,
  useIgnoreConnectionRequestMutation,
} from '../../features/messages/messageApiSlice';

const FollowList = ({info, onResponse}) => {
  const navigation = useNavigation();

  // New mutations for accept and ignore
  const [acceptConnectionRequest, {isLoading: isAcceptLoading}] =
    useAcceptConnectionRequestMutation();
  const [ignoreConnectionRequest, {isLoading: isIgnoreLoading}] =
    useIgnoreConnectionRequestMutation();

  // Local state to track the current status
  const [currentStatus, setCurrentStatus] = useState(info.status);

  // Update local status when info.status changes (after reload)
  React.useEffect(() => {
    setCurrentStatus(info.status);
  }, [info.status]);

  // Combined loading state
  const isLoading = isAcceptLoading || isIgnoreLoading;

  

  const handleConfirm = async () => {
    

    try {
      // Use the new accept connection API
      const result = await acceptConnectionRequest({
        oppositeUserId: info.user._id,
      }).unwrap();

      
      Alert.alert('Success', result.message || 'Connection request confirmed!');

      // Update local status
      setCurrentStatus('accepted');

      // Call the parent callback to update UI
      onResponse && onResponse(info._id, 'confirm');
    } catch (error) {
      console.error('Accept connection request error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to confirm connection request',
      );
    }
  };

  const handleDelete = async () => {
    try {
      // Use the new ignore connection API
      const result = await ignoreConnectionRequest({
        oppositeUserId: info.user._id,
      }).unwrap();

      
      Alert.alert('Success', result.message || 'Connection request deleted!');

      // Update local status
      setCurrentStatus('rejected');

      // Call the parent callback to update UI
      onResponse && onResponse(info._id, 'reject');
    } catch (error) {
      console.error('Ignore connection request error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to delete connection request',
      );
    }
  };

  // Handle profile/chat navigation based on status
  const handleUserPress = () => {
    if (currentStatus === 'pending') {
      // Navigate to individual profile screen
      navigation.navigate(
        'IndividualProfile',
        {userId: info.user._id},
        {is_leader: info.user.is_leader},
        {is_verified: info.user.is_verified},
        {name: `${info.user.first_name} ${info.user.last_name}`},
        {profileImage: info.user.profile_image},
        {about: info.user.about},
        {featured: info.user.featured},
      );
    } else if (currentStatus === 'accepted') {
      // Navigate to chat screen
      navigation.navigate('Chat', {
        conversationId: info.conversationId,
        recepientId: info?.user?._id,
        featured: info?.user?.featured,
        name: `${info?.user?.first_name} ${info?.user?.last_name}`,
        profileImage: info?.user?.profile_image,
        is_leader: info?.user?.is_leader,
        is_verified: info?.user?.is_verified,
      });
    }
  };

  // Function to render status badge
  const renderStatus = () => {
    let statusText = '';
    let statusStyle = '';

    switch (currentStatus) {
      case 'accepted':
        break;
      case 'rejected':
        statusText = 'Deleted';
        statusStyle = 'bg-red-500';
        break;
      case 'pending':
      default:
        return null; // Don't show status for pending
    }

    return (
      <View style={tw`${statusStyle} px-4 py-1.5 rounded-2`}>
        <Text style={tw`text-white text-sm font-semibold`}>{statusText}</Text>
      </View>
    );
  };

  // Function to render action buttons
  const renderActionButtons = () => {
    if (currentStatus !== 'pending') {
      return null; // Don't show buttons if not pending
    }

    return (
      <View style={tw`flex-row`}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isLoading}
          style={tw`bg-[#0077B5] px-3 py-1.5 rounded-2 mr-1 ${
            isLoading ? 'opacity-70' : ''
          }`}>
          {isAcceptLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={tw`text-white  text-[13px]`}>Confirm</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={isLoading}
          style={tw`border border-[#0077B5] px-3 py-1.5 rounded-2 ${
            isLoading ? 'opacity-70' : ''
          }`}>
          {isIgnoreLoading ? (
            <ActivityIndicator size="small" color="#0077B5" />
          ) : (
            <Text style={tw`text-[#0077B5] text-[13px] `}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row justify-between  items-start gap-2 `}>
          <TouchableOpacity
            onPress={handleUserPress}
            style={tw`relative`}
            disabled={currentStatus === 'rejected'}>
            <Image
              source={
                info?.user?.profile_image
                  ? {uri: info?.user?.profile_image}
                  : require('../../assets/images/whiteplaceholder.png')
              }
              style={tw`w-10 h-10 bg-black rounded-full mb-1`}
            />
          </TouchableOpacity>

          <View style={tw`flex-row justify-between items-center flex-1  p-1`}>
            {/* Text Container */}
            <TouchableOpacity
              onPress={handleUserPress}
              style={tw`flex-1`}
              disabled={currentStatus === 'rejected'}>
              {/* Message */}
              <Text style={tw`text-[#040641] text-[14px]`}>
                <Text style={tw`font-bold`}>
                  {info.user.first_name} {info.user.last_name}
                </Text>{' '}
                {currentStatus === 'accepted'
                  ? 'is now connected with you'
                  : 'sent you Connection request'}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons or Status */}
            <View>
              {renderActionButtons()}
              {renderStatus()}
            </View>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default FollowList;
