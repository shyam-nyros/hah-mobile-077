import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import tw from 'twrnc';
import PostComments from './PostComments';
import {useCreateCommentAPIMutation} from '../../features/feed/feedApiSlice';

const CommentsModal = ({modalVisible, closeModal, postId}) => {
  const [newComment, setNewComment] = useState('');

  const [
    createCommentAPI,
    {
      isLoading: createCommentLoading,
      isError: createCommentIsError,
      error: commentError,
    },
  ] = useCreateCommentAPIMutation();

  const handleCreateComment = async id => {
    try {
      await createCommentAPI({postId: id, content: newComment}).unwrap();
      setNewComment('');
      Keyboard.dismiss(); // Dismiss keyboard
    } catch (error) {
      
    }
  };

  const handleChangeComment = text => {
    setNewComment(text);
  };



  return (
    <View style={tw`mb-6`}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomSheet}>
            <TouchableOpacity
              style={tw`flex flex-row justify-between items-center mb-3`}>
              <Text
                style={tw`text-lg font-semibold text-center text-black flex-1 text-center`}>
                Comments
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={tw`px-3 py-2 bg-[#00B4D8] bg-opacity-10 rounded-full`}
                accessibilityLabel="Close Comments Modal">
                <Text style={tw`text-[#00B4D8] font-bold`}>X</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={tw`border-b border-black opacity-10 `} />
            <View style={tw`flex-1`}>
              {/* Comments section */}
              <PostComments postId={postId} fromModal={true} />
            </View>
            {/* {errorMessage ? (
              <Text style={tw`text-red-500 text-sm mb-2`}>{errorMessage}</Text>
            ) : null} */}

            <View
              style={[
                tw`w-full bg-[#F5F5F5] h-[44px] rounded-full mt-[16px]  justify-center`,
                {
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 1,
                  marginBottom: Platform.OS === 'ios' ? 28 : 0,
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <TextInput
                  placeholder="Write Comment"
                  placeholderTextColor="rgba(4, 6, 65, 0.7)"
                  style={tw`flex-1 ml-3 text-black`}
                  value={newComment}
                  onChangeText={handleChangeComment}
                  accessibilityLabel="Comment input field"
                />
                <TouchableOpacity
                  onPress={() => handleCreateComment(postId)}
                  disabled={newComment.length === 0}
                  style={[tw``, {opacity: newComment.length === 0 ? 0.5 : 1}]}
                  accessibilityLabel="Send Comment">
                  {createCommentLoading ? (
                    <ActivityIndicator size="small" color="#00B4D8" />
                  ) : (
                    <Image
                      source={require('../../assets/images/commentsendicon.png')}
                      style={tw`mr-3 w-6 h-6 my-7 mx-4`}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: '76%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default CommentsModal;
