import {Text, TouchableOpacity, View} from 'react-native';
import {useWithdrawConnectionRequestMutation} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import tw from 'twrnc';

const WithdrawConnection = ({oppositeUserId}) => {
  const [withdrawConnectionRequest, {isLoading}] =
    useWithdrawConnectionRequestMutation();

  const handleWithdrawRequest = async () => {
    

    try {
      const res = await withdrawConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      <Text
        style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center flex-row text-white text-center bg-[#0077B6]`}>
        pending{' '}
      </Text>
      {isLoading && <LoadingSpinner size={'small'} />}
      {!isLoading && (
        <TouchableOpacity
          onPress={handleWithdrawRequest}
          disabled={isLoading}
          style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center flex-row`}>
          <Text style={tw`text-[#0077B6]`}>Withdraw</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default WithdrawConnection;
