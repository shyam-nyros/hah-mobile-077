// BlockedUserListItem.js
import {Text, TouchableOpacity, View, Image} from 'react-native';
import {useUnblockUserMutation} from '../../../features/auth/authApiSlice';
import showToast from '../../../utils/toast/showToast';
import LoadingSpinner from '../../LoadingSpinner';
import {setReloadOnBlockingUser} from '../../../features/feed/feedSlice';
import {useDispatch} from 'react-redux';
import tw from 'twrnc';

const BlockedUserListItem = ({user, onUnblockSuccess}) => {
  const dispatch = useDispatch();

  const [unblockUser, {isLoading: unblockUserLoading}] =
    useUnblockUserMutation();

  const handleUnblock = async unblockUserId => {
    try {
      await unblockUser(unblockUserId).unwrap();
      showToast('success', 'User unblocked successfully');
      dispatch(setReloadOnBlockingUser());
      // Call the callback function from parent to refresh the list
      if (onUnblockSuccess) {
        onUnblockSuccess();
      }
    } catch (error) {
      showToast('error', 'Failed to unblock user');
    }
  };

  return (
    <View style={tw`flex-row items-center px-2 border-b border-gray-200 py-3`}>
      <Image
        source={
          user?.profile_image
            ? {uri: user.profile_image}
            : require('../../../assets/images/whiteplaceholder.png')
        }
        style={tw`w-11 h-11 rounded-full relative`}
      />
      <Text style={tw`text-[#0077B6] text-[16px] font-medium ml-3 flex-1`}>
        {user.first_name} {user.last_name}
      </Text>
      {!unblockUserLoading ? (
        <TouchableOpacity
          onPress={() => handleUnblock(user._id)}
          style={tw`px-4 py-2 rounded-full border border-[1px] border-[#F62727] bg-white mx-auto flex-row items-center`}>
          <Image
            source={require('../../../assets/images/unblock_red.png')}
            style={tw`w-4 h-4 mr-2`}
          />
          <Text style={tw`text-[#F62727] text-[15px] font-medium`}>
            Unblock
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={tw`px-3 py-1`}>
          <LoadingSpinner size={'small'} />
        </View>
      )}
    </View>
  );
};

export default BlockedUserListItem;
