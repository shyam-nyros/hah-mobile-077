// working file with send text and attachments 
// not implemented the compress and content moderation
import {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import {launchImageLibrary, MediaType} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {useSelector} from 'react-redux';
import {
  useEmitGroupTextMessageMutation,
  useSendAttachmentInGroupMutation,
} from '../../../features/chat/groupChat';
import showToast from '../../../utils/toast/showToast';
import LoadingSpinner from '../../LoadingSpinner';

const GroupChatCreateMessage = ({groupId, conversationId}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // RTK mutations
  const [emitGroupTextMessage] = useEmitGroupTextMessageMutation();
  const [sendAttachmentInGroup] = useSendAttachmentInGroupMutation();

  const showAttachmentOptions = () => {
    Alert.alert(
      'Select Attachment',
      'Choose the type of file you want to attach',
      [
        {
          text: 'Image',
          onPress: () => selectImageOrVideo('photo'),
        },
        {
          text: 'Video',
          onPress: () => selectImageOrVideo('video'),
        },
        {
          text: 'Document',
          onPress: selectDocument,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const selectImageOrVideo = mediaType => {
    const options = {
      mediaType: mediaType,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const fileType = mediaType === 'photo' ? 'image' : 'video';

        setSelectedFile({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `${fileType}_${Date.now()}`,
          size: asset.fileSize,
          fileType: fileType,
        });

        // Clear text input when file is selected
        setNewMessage('');
      }
    });
  };

  const selectDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });

      setSelectedFile({
        uri: result.uri,
        type: result.type,
        name: result.name,
        size: result.size,
        fileType: 'document',
      });

      // Clear text input when file is selected
      setNewMessage('');
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        showToast('error', 'Failed to select document');
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const sendNewMessage = async () => {
    try {
      setSendingMessage(true);

      if (selectedFile) {
        // Send attachment via POST request
        

        const response = await sendAttachmentInGroup({
          groupId,
          attachment: {
            uri: selectedFile.uri,
            type: selectedFile.type,
            name: selectedFile.name,
          },
          type: selectedFile.fileType,
        }).unwrap();

        
        showToast('success', 'Attachment sent successfully');
        
        // Clear selected file after successful send
        setSelectedFile(null);
        
      } else if (newMessage.trim()) {
        // Send text message via Socket.IO
        

        const response = await emitGroupTextMessage({
          groupId,
          content: newMessage.trim(),
        }).unwrap();

        
        
        // Clear text input after successful send
        setNewMessage('');
        
      } else {
        setSendingMessage(false);
        return;
      }

    } catch (error) {
      console.error('Failed to send group message:', error);
      showToast('error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const canSend = (newMessage.trim() || selectedFile) && !sendingMessage;

  const renderSelectedFile = () => {
    if (!selectedFile) return null;

    return (
      <View style={styles.selectedFileContainer}>
        <View style={styles.filePreview}>
          {selectedFile.fileType === 'image' ? (
            <Image source={{uri: selectedFile.uri}} style={styles.fileImage} />
          ) : (
            <View style={styles.fileIcon}>
              <Image
                source={
                  selectedFile.fileType === 'video'
                    ? require('../../../assets/images/playbutton.png')
                    : require('../../../assets/images/pagesicon.png')
                }
                style={tw`w-6 h-6`}
              />
            </View>
          )}
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
          <TouchableOpacity
            onPress={removeSelectedFile}
            style={styles.removeButton}>
            <Image
              source={require('../../../assets/images/closered.png')}
              style={tw`w-4 h-4`}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={tw`bg-[#fff]`}>
        {renderSelectedFile()}
        <View style={tw`mx-2 flex-row items-center py-3 justify-between`}>
          <View style={[styles.inputbar, styles.inputbarNormal]}>
            <View style={styles.inputRow}>
              <TextInput
                placeholder={selectedFile ? 'File selected' : 'Type Here'}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="rgba(4, 6, 65, 0.5)"
                style={[styles.textInput, tw`text-[15px]`]}
                editable={!selectedFile}
              />

              <TouchableOpacity
                onPress={showAttachmentOptions}
                style={styles.attachButton}>
                <Image
                  source={require('../../../assets/images/commentsendicon.png')}
                  style={tw`w-6 h-6`}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!canSend}
                onPress={sendNewMessage}
                style={styles.sendButton}>
                {sendingMessage ? (
                  <LoadingSpinner size="small" color="#1E40AF" />
                ) : (
                  <Image
                    source={require('../../../assets/images/tickicon.png')}
                    style={tw`w-7 h-7 ${
                      !canSend ? 'opacity-50' : 'opacity-100'
                    }`}
                  />
                )}
              </TouchableOpacity>
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
    borderRadius: 50,
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
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: 'black',
  },
  attachButton: {
    marginRight: 10,
    padding: 5,
  },
  sendButton: {
    padding: 2,
  },
  selectedFileContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fileImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  fileSize: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
});