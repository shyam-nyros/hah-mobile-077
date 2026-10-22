import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import tw from 'twrnc';

const MessageInput = ({onSendMessage, isLoading = false}) => {
  const textInputRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const canSend = newMessage.trim() && !isLoading;

  return (
    <SafeAreaView>
      <View style={tw`bg-[#fff]`}>
        <View style={tw`mx-2 flex-row items-center py-3 justify-between`}>
          <View style={[styles.inputbar, styles.inputbarNormal]}>
            <View style={styles.inputRow}>
              <TextInput
                ref={textInputRef}
                placeholder="Type Here"
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="rgba(4, 6, 65, 0.5)"
                style={[styles.textInput, tw`text-[15px]`]}
                multiline
                editable={!isLoading}
                onSubmitEditing={handleSendMessage}
              />
              {/* 
              <TouchableOpacity
                disabled={!canSend}
                onPress={handleSendMessage}
                style={styles.sendButton}>
                <Text
                  style={tw`text-[#1E40AF] text-[16px] font-bold ${
                    !canSend ? 'opacity-50' : 'opacity-100'
                  }`}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                disabled={!canSend}
                onPress={canSend ? handleSendMessage : null}
                style={[styles.sendButton, !canSend && styles.disabledButton]}
                activeOpacity={canSend ? 0.7 : 1}>
                <Image
                  source={require('../../assets/images/commentsendicon.png')}
                  style={tw`w-7 h-7 ${!canSend ? 'opacity-50' : 'opacity-100'}`}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    minHeight: 48,
    borderRadius: 25,
    justifyContent: 'center',
  },
  inputbarNormal: {
    backgroundColor: 'rgba(4, 6, 65, 0.05)',
  },
  inputRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: 'black',
    paddingVertical: 8,
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
  },
});

export default MessageInput;
