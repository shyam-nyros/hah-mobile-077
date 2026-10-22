import {Text, TouchableOpacity, View} from 'react-native';
import {useAcceptConnectionRequestMutation} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import tw from 'twrnc';

const AcceptConnection = ({oppositeUserId}) => {
  const [acceptConnectionRequest, {isLoading}] =
    useAcceptConnectionRequestMutation();

  const handleAcceptRequest = async () => {
    

    try {
      const res = await acceptConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      {isLoading && <LoadingSpinner size={'small'} />}
      {!isLoading && (
        <TouchableOpacity
          onPress={handleAcceptRequest}
          disabled={isLoading}
          style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 bg-[#0077B6] border-[1px] border-[#0077B6] items-center justify-center flex-row`}>
          <Text style={tw`text-white`}>Accept Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AcceptConnection;
