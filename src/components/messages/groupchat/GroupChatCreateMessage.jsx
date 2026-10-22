import {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import tw from 'twrnc';
import {
  launchImageLibrary,
  launchCamera,
  MediaType,
} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import {useSelector} from 'react-redux';
import {
  useEmitGroupTextMessageMutation,
  useSendAttachmentInGroupMutation,
} from '../../../features/chat/groupChat';
import showToast from '../../../utils/toast/showToast';
import LoadingSpinner from '../../LoadingSpinner';
// Import the compressor library
import {
  Image as ImageCompressor,
  Video as VideoCompressor,
} from 'react-native-compressor';
// Import SightEngine APIs
import {
  useAnalyzeImageAPIMutation,
  useAnalyzeTextAPIMutation,
  useAnalyzeVideoAPIMutation,
} from '../../../store/siteEngineApiSlice';

// File size limits in MB
const imageFileSize = 10;
const videoFileSize = 50;
const documentFileSize = 15;

const GroupChatCreateMessage = ({groupId}) => {
  const textInputRef = useRef(null);

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCheckingContent, setIsCheckingContent] = useState(false);

  // RTK mutations
  const [emitGroupTextMessage] = useEmitGroupTextMessageMutation();
  const [sendAttachmentInGroup] = useSendAttachmentInGroupMutation();

  // SightEngine content moderation APIs
  const [analyzeTextAPI, {isLoading: checkingText}] =
    useAnalyzeTextAPIMutation();
  const [analyzeImageAPI, {isLoading: checkingImage}] =
    useAnalyzeImageAPIMutation();
  const [analyzeVideoAPI, {isLoading: checkingVideo}] =
    useAnalyzeVideoAPIMutation();

  // Helper function to get file size
  const getFileSize = async fileUri => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  };

  // Function to compress image
  const compressImage = async imageFile => {
    try {
      setIsCompressing(true);
      const compressedUri = await ImageCompressor.compress(imageFile.uri, {
        compressionMethod: 'auto',
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      const fileName = imageFile.name || `img-${Date.now()}.jpg`;
      const fileSize = await getFileSize(compressedUri);

      return {
        uri: compressedUri,
        type: imageFile.type,
        name: fileName,
        size: fileSize,
        fileType: 'image',
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      showToast('error', 'Image compression failed, using original');
      return imageFile;
    } finally {
      setIsCompressing(false);
    }
  };

  // Function to compress video
  const compressVideo = async videoFile => {
    try {
      setIsCompressing(true);
      const compressedUri = await VideoCompressor.compress(videoFile.uri, {
        quality: 'medium',
        compressionMethod: 'auto',
      });

      const fileName = videoFile.name || `video-${Date.now()}.mp4`;
      const fileSize = await getFileSize(compressedUri);

      return {
        uri: compressedUri,
        type: videoFile.type,
        name: fileName,
        size: fileSize,
        fileType: 'video',
      };
    } catch (error) {
      console.error('Video compression failed:', error);
      showToast('error', 'Video compression failed, using original');
      return videoFile;
    } finally {
      setIsCompressing(false);
    }
  };

  // Function to check text content for violations
  const checkTextViolation = async text => {
    try {
      setIsCheckingContent(true);
      const hasViolation = await analyzeTextAPI({
        text: text.trim(),
      }).unwrap();

      if (hasViolation) {
        Alert.alert(
          'Content Violation',
          'Your message contains inappropriate content and cannot be sent to the group.',
          [{text: 'OK'}],
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking text violation:', error);
      // If API fails, allow message to be sent to avoid blocking user
      showToast('error', 'Unable to verify content. Message will be sent.');
      return false;
    } finally {
      setIsCheckingContent(false);
    }
  };

  // Function to check image content for violations
  const checkImageViolation = async imageFile => {
    try {
      setIsCheckingContent(true);
      const hasViolation = await analyzeImageAPI({
        image: imageFile,
      }).unwrap();

      if (hasViolation) {
        Alert.alert(
          'Content Violation',
          'Your image contains inappropriate content and cannot be sent to the group.',
          [{text: 'OK'}],
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking image violation:', error);
      // If API fails, allow image to be sent to avoid blocking user
      showToast('error', 'Unable to verify image content. Image will be sent.');
      return false;
    } finally {
      setIsCheckingContent(false);
    }
  };

  // Function to check video content for violations
  const checkVideoViolation = async videoFile => {
    try {
      setIsCheckingContent(true);
      const hasViolation = await analyzeVideoAPI({
        video: videoFile,
      }).unwrap();

      if (hasViolation) {
        Alert.alert(
          'Content Violation',
          'Your video contains inappropriate content and cannot be sent to the group.',
          [{text: 'OK'}],
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking video violation:', error);
      if (error?.data?.error?.type === 'credentials_error') {
        Alert.alert('Error', 'Unable to process the video');
        return true;
      }
      if (
        error?.data?.error?.type === 'media_error' &&
        error?.data?.error?.code === 710
      ) {
        Alert.alert(
          'Error',
          'Please select a video that is 60 seconds or less',
        );
        return true;
      }
      // If API fails, allow video to be sent to avoid blocking user
      showToast('error', 'Unable to verify video content. Video will be sent.');
      return false;
    } finally {
      setIsCheckingContent(false);
    }
  };

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
        // {
        //   text: 'Document',
        //   onPress: selectDocument,
        // },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to take pictures',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    }
  };

  const selectImageOrVideo = mediaType => {
    const options = {
      mediaType: mediaType,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const fileType = mediaType === 'photo' ? 'image' : 'video';

        const originalFile = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `${fileType}_${Date.now()}`,
          size: asset.fileSize,
          fileType: fileType,
        };

        // Check file size before compression
        if (
          fileType === 'image' &&
          asset.fileSize > imageFileSize * 1024 * 1024
        ) {
          showToast(
            'error',
            `Image file size is too large, should be less than ${imageFileSize} MB`,
          );
          return;
        }

        if (
          fileType === 'video' &&
          asset.fileSize > videoFileSize * 1024 * 1024
        ) {
          showToast(
            'error',
            `Video file size is too large, should be less than ${videoFileSize} MB`,
          );
          return;
        }

        // Compress based on file type
        let processedFile;
        if (fileType === 'image') {
          processedFile = await compressImage(originalFile);
        } else if (fileType === 'video') {
          processedFile = await compressVideo(originalFile);
        } else {
          processedFile = originalFile;
        }

        setSelectedFile(processedFile);
        setNewMessage(''); // Clear text input when file is selected
      }
    });
  };

  // New function to handle camera capture
  const captureImageFromCamera = async () => {
    const permissionGranted = await requestCameraPermission();
    if (!permissionGranted) {
      showToast('error', 'Camera permission denied');
      return;
    }
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
    };

    launchCamera(options, async response => {
      if (response.didCancel || response.error) {
        if (response.error) {
          showToast('error', 'Camera error: ' + response.error);
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];

        const originalFile = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `camera_image_${Date.now()}.jpg`,
          size: asset.fileSize,
          fileType: 'image',
        };

        // Check file size before compression
        if (asset.fileSize > imageFileSize * 1024 * 1024) {
          showToast(
            'error',
            `Image file size is too large, should be less than ${imageFileSize} MB`,
          );
          return;
        }

        // Compress the captured image
        const compressedFile = await compressImage(originalFile);
        setSelectedFile(compressedFile);
        setNewMessage(''); // Clear text input when file is selected
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

      // Check document file size
      if (result.size > documentFileSize * 1024 * 1024) {
        showToast(
          'error',
          `Document file size is too large, should be less than ${documentFileSize} MB`,
        );
        return;
      }

      setSelectedFile({
        uri: result.uri,
        type: result.type,
        name: result.name,
        size: result.size,
        fileType: 'document',
      });

      setNewMessage(''); // Clear text input when file is selected
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        showToast('error', 'Failed to select document');
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  // Updated sendNewMessage function with content moderation
  const sendNewMessage = async () => {
    try {
      setSendingMessage(true);

      if (selectedFile) {
        // Step 1: Check file content for violations (except documents)
        if (selectedFile.fileType === 'image') {
          const hasViolation = await checkImageViolation(selectedFile);
          if (hasViolation) {
            setSendingMessage(false);
            return;
          }
        } else if (selectedFile.fileType === 'video') {
          const hasViolation = await checkVideoViolation(selectedFile);
          if (hasViolation) {
            setSendingMessage(false);
            return;
          }
        }
        // Documents are not checked for content violations

        // Step 2: Send attachment via POST request
        

        const response = await sendAttachmentInGroup({
          groupId,
          attachment: {
            uri: selectedFile.uri,
            type: selectedFile.type,
            name: selectedFile.name,
          },
          type: selectedFile.fileType,
        }).unwrap();

        
        // showToast('success', 'Attachment sent successfully');

        // Clear selected file after successful send
        setSelectedFile(null);
      } else if (newMessage.trim()) {
        // Store the current message before clearing
        const messageToSend = newMessage.trim();

        // Clear the input immediately to prevent keyboard closing
        setNewMessage('');

        // Step 1: Check text content for violations
        const hasViolation = await checkTextViolation(messageToSend);
        if (hasViolation) {
          // Restore the message if there's a violation
          setNewMessage(messageToSend);
          setSendingMessage(false);
          return;
        }

        // Step 2: Send text message via Socket.IO
        

        const response = await emitGroupTextMessage({
          groupId,
          content: messageToSend,
        }).unwrap();

        
        // Message is already cleared, so no need to clear again
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

  const canSend =
    (newMessage.trim() || selectedFile) && !sendingMessage && !isCompressing;

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
              {isCompressing ? 'Compressing...' : selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {selectedFile.size
                ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
                : 'Processing...'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={removeSelectedFile}
            style={styles.removeButton}
            disabled={isCompressing || isCheckingContent}>
            <Image
              source={require('../../../assets/images/closered.png')}
              style={tw`w-4 h-4 ${
                isCompressing || isCheckingContent
                  ? 'opacity-50'
                  : 'opacity-100'
              }`}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getPlaceholderText = () => {
    if (isCompressing) return 'Processing file...';
    if (isCheckingContent) return 'Checking content...';
    if (selectedFile) return 'File selected';
    return 'Type Here';
  };

  return (
    <SafeAreaView>
      <View style={tw`bg-[#fff]`}>
        {renderSelectedFile()}
        <View style={tw`mx-2 flex-row items-center py-3 justify-between`}>
          <View style={[styles.inputbar, styles.inputbarNormal]}>
            <View style={styles.inputRow}>
              {/* Camera Icon */}
              <TouchableOpacity
                onPress={captureImageFromCamera}
                style={styles.attachButton}
                disabled={isCompressing}>
                <Image
                  source={require('../../../assets/images/camicon.png')}
                  style={tw`w-6 h-6 ${
                    isCompressing ? 'opacity-50' : 'opacity-100'
                  }`}
                />
              </TouchableOpacity>

              <TextInput
                ref={textInputRef}
                placeholder={getPlaceholderText()}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="rgba(4, 6, 65, 0.5)"
                style={[
                  styles.textInput,
                  tw`text-[15px]`,
                  isCheckingContent && styles.textInputChecking,
                ]}
                editable={!selectedFile && !isCompressing}
              />

              <TouchableOpacity
                onPress={showAttachmentOptions}
                style={styles.attachButton}
                disabled={isCompressing}>
                <Image
                  source={require('../../../assets/images/ph_paperclip.png')}
                  style={tw`w-6 h-6 ${
                    isCompressing ? 'opacity-50' : 'opacity-100'
                  }`}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!canSend}
                onPress={sendNewMessage}
                style={styles.sendButton}>
                {sendingMessage || isCompressing || isCheckingContent ? (
                  <LoadingSpinner size="small" color="#1E40AF" />
                ) : (
                  <Image
                    source={require('../../../assets/images/commentsendicon.png')}
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
  textInputChecking: {
    opacity: 0.7,
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
