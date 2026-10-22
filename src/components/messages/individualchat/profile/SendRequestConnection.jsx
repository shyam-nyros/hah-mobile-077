import {Text, TouchableOpacity, View} from 'react-native';
import {useSendConnectionRequestMutation} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import tw from 'twrnc';

const SendRequestConnection = ({oppositeUserId}) => {
  const [sendConnectionRequest, {isLoading, isError, error}] =
    useSendConnectionRequestMutation();

  const handlesendRequest = async () => {
    
    try {
      const res = await sendConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      {isLoading ? (
        <LoadingSpinner size={'small'} />
      ) : (
        <TouchableOpacity
          onPress={handlesendRequest}
          style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center flex-row bg-[#0077B6]`}>
          <Text style={tw`text-white`}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SendRequestConnection;
