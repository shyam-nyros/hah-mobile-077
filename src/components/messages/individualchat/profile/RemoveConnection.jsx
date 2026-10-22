import {Text, TouchableOpacity, View} from 'react-native';
import {useRemoveConnectionRequestMutation} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

const RemoveConnection = ({oppositeUserId}) => {
  const navigation = useNavigation();
  const [removeConnectionRequest, {isLoading}] =
    useRemoveConnectionRequestMutation();

  const handleRemoveRequest = async () => {
    

    try {
      const res = await removeConnectionRequest({oppositeUserId}).unwrap();
      navigation.navigate('Fellowship');
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      {isLoading && <LoadingSpinner size={'small'} />}

      {!isLoading && (
        <TouchableOpacity
          onPress={handleRemoveRequest}
          disabled={isLoading}
          style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center flex-row bg-[#0077B6]`}>
          <Text style={tw`text-white`}>Remove Connection</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RemoveConnection;
