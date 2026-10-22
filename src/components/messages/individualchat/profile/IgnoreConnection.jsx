import {Text, TouchableOpacity, View} from 'react-native';
import {useIgnoreConnectionRequestMutation} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import tw from 'twrnc';

const IgnoreConnection = ({oppositeUserId}) => {
  const [ignoreConnectionRequest, {isLoading}] =
    useIgnoreConnectionRequestMutation();

  const handleIgnoreRequest = async () => {
    try {
      const res = await ignoreConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      {isLoading && <LoadingSpinner size={'small'} />}
      {!isLoading && (
        <TouchableOpacity
          onPress={handleIgnoreRequest}
          disabled={isLoading}
          style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-red-500 items-center justify-center flex-row`}>
          <Text style={tw`text-red-500`}>Ignore Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default IgnoreConnection;
