import {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import { useEmitGroupTextMessageMutation } from '../../../features/chat/groupChat';


const GroupChatCreateMessage = ({groupId}) => {
  const [newMessage, setNewMessage] = useState('');

  const [emitGroupTextMessage, {isLoading, isError}] =
    useEmitGroupTextMessageMutation();

  const handleCreateNewMessage = async () => {
    try {
      const response = await emitGroupTextMessage({
        groupId,
        content: newMessage,
      }).unwrap();

    
    } catch (error) {
    
    } finally {
      setNewMessage('');
    }
  };

  return (
    <SafeAreaView>
      <View style={tw`bg-[#fff]`}>
        <View style={tw`mx-2 flex-row items-center py-3 justify-between`}>
          <View style={styles.inputbar}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 10,
              }}>
              <TextInput
                placeholder="Type Here"
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="rgba(4, 6, 65, 0.5)"
                style={tw`text-[15px] flex-1 h-full  text-black`}
              />
              <View style={tw`flex-row gap-2`}>
                {/* <Image
                  source={require('../../../assets/images/emojiicon.png')}
                  style={tw`w-7 h-7`}
                /> */}
                <TouchableOpacity onPress={handleCreateNewMessage}>
                  <Image
                    source={require('../../../assets/images/tickicon.png')}
                    style={tw`w-7 h-7`}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GroupChatCreateMessage;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(4, 6, 65, 0.05)',
    borderRadius: 50,
    justifyContent: 'center',
  },
});
