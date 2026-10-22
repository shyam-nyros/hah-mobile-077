import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import tw from 'twrnc';
import * as yup from 'yup';
import {Formik} from 'formik';
import {useCreatePostAPIMutation} from '../../../features/feed/feedApiSlice';
import {launchImageLibrary} from 'react-native-image-picker';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DocumentPicker from 'react-native-document-picker';
import {useSelector} from 'react-redux';
import showToast from '../../../utils/toast/showToast';
import {
  useUserDetailsQuery,
  useUpdateUserAPIMutation,
} from '../../../features/auth/authApiSlice';
import {
  useAnalyzeImageAPIMutation,
  useAnalyzeTextAPIMutation,
  useAnalyzeVideoAPIMutation,
} from '../../../store/siteEngineApiSlice';
// Import the compressor library
import {
  Image as ImageCompressor,
  Video as VideoCompressor,
} from 'react-native-compressor';

// upload file size represented in MB
const imageFileSize = 10;
const videoFileSize = 50;
const pdfFileSize = 15;

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup
    .string()
    .required('Description is required')
    .max(160, 'Description cannot be longer than 150 characters'),
  image: yup
    .mixed()
    .nullable()
    .test(
      'fileSize',
      `Image file size is too large, should be less than ${imageFileSize} MB`,
      value => {
        if (!value) return true;
        return value.fileSize <= imageFileSize * 1024 * 1024;
      },
    )
    .test('fileType', 'Unsupported file format', value => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
    }),
  video: yup
    .mixed()
    .nullable()
    .test(
      'fileSize',
      `Video file size is too large, should be less than ${videoFileSize} MB`,
      value => {
        if (!value) return true;
        return value.fileSize <= videoFileSize * 1024 * 1024;
      },
    )
    .test('fileType', 'Unsupported file format', value => {
      if (!value) return true;
      return ['video/mp4', 'video/avi', 'video/mkv'].includes(value.type);
    }),
  pdf: yup
    .mixed()
    .nullable()
    .test(
      'fileSize',
      `PDF file size is too large, should be less than ${pdfFileSize} MB`,
      value => {
        if (!value) return true;
        return value.fileSize <= pdfFileSize * 1024 * 1024;
      },
    )
    .test('fileType', 'Unsupported file format', value => {
      if (!value) return true;
      return value.type === 'application/pdf';
    }),
});

const truncateText = (text, limit) => {
  if (!text) return '';
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

const CreatePost = ({navigation}) => {
  const [isPublic, setIsPublic] = useState(false);
  const [violatedContent, setViolatedContent] = useState(false);
  const [attachementName, setAttachementName] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const {profilePicture, isLeader} = useSelector(state => state.auth);

  // Name prompt sheet
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [nameFirst, setNameFirst] = useState('');
  const [nameLast, setNameLast] = useState('');
  const {data: userInfo} = useUserDetailsQuery();
  const [updateUserAPI, {isLoading: isUpdatingName}] =
    useUpdateUserAPIMutation();

  useEffect(() => {
    if (userInfo?.is_name_verified === false) {
      setShowNameSheet(true);
    }
  }, [userInfo]);

  const handleNameSubmit = async () => {
    if (!nameFirst.trim() || !nameLast.trim()) return;
    try {
      await updateUserAPI({
        first_name: nameFirst.trim(),
        last_name: nameLast.trim(),
        is_name_verified: true,
      }).unwrap();
      setShowNameSheet(false);
    } catch (e) {}
  };
  const [createPostAPI, {isLoading: createPostLoading, isError}] =
    useCreatePostAPIMutation();

  const [analyzeTextAPI, {isLoading: checkingText, textIsError}] =
    useAnalyzeTextAPIMutation();
  const [analyzeImageAPI, {isLoading: checkingImage, imageIsError}] =
    useAnalyzeImageAPIMutation();
  const [analyzeVideoAPI, {isLoading: checkingvideo, videoIsError}] =
    useAnalyzeVideoAPIMutation();

  const toggleSwitch = () => setIsPublic(previousState => !previousState);

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

      // Get file information about the compressed image
      const fileName = imageFile.name || `img-${Date.now()}.jpg`;

      return {
        uri: compressedUri,
        type: imageFile.type,
        name: fileName,
        fileSize: await getFileSize(compressedUri),
      };
    } catch (error) {
   
      return imageFile; // Return original file if compression fails
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

      // Get file information about the compressed video
      const fileName = videoFile.name || `video-${Date.now()}.mp4`;

      return {
        uri: compressedUri,
        type: videoFile.type,
        name: fileName,
        fileSize: await getFileSize(compressedUri),
      };
    } catch (error) {

      return videoFile; // Return original file if compression fails
    } finally {
      setIsCompressing(false);
    }
  };

  // Helper function to get file size
  const getFileSize = async fileUri => {
    try {
      // This is a workaround since we can't directly get the file size
      // You might need to use a native module like react-native-fs for more accurate file size
      const response = await fetch(fileUri);
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
  
      return 0;
    }
  };

  const handleMediaPick = async (setFieldValue, mediaType) => {
    launchImageLibrary({mediaType, includeExtra: true}, async response => {
      if (response.didCancel) {
        // User cancelled
      } else if (response.errorCode) {
        // Error handling
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          fileSize: asset.fileSize,
        };

        if (asset.type.startsWith('image')) {
          setAttachementName('Compressing image...');
          const compressedImage = await compressImage(file);
    

          setFieldValue('image', compressedImage);
          setFieldValue('video', null);
          setFieldValue('pdf', null);
          setAttachementName(compressedImage?.name);
        } else if (asset.type.startsWith('video')) {
          setAttachementName('Compressing video...');
          const compressedVideo = await compressVideo(file);
      

          setFieldValue('video', compressedVideo);
          setFieldValue('image', null);
          setFieldValue('pdf', null);
          setAttachementName(compressedVideo?.name);
        }
      }
    });
  };

  const handlePdfPick = setFieldValue => {
    DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    })
      .then(response => {
        if (response && response.length > 0) {
          const file = {
            uri: response[0].uri,
            type: response[0].type,
            name: response[0].name,
            fileSize: response[0].size,
          };

          setFieldValue('pdf', file);
          setAttachementName(file?.name);
          setFieldValue('image', null);
          setFieldValue('video', null);
        }
      })
      .catch(error => {
        if (DocumentPicker.isCancel(error)) {
          // User cancelled
        } else {
          // Error handling
        }
      });
  };

  const handleNewPostCreation = async (values, {setSubmitting, resetForm}) => {
    try {
      // Step 1: Check text violations
      const hasTextViolation = await analyzeTextAPI({
        text: `${values.title} ${values.description}`,
      }).unwrap();

      if (hasTextViolation) {
        setViolatedContent(true);
        Alert.alert(
          'Info',
          'Your post contains violations and cannot be submitted.',
        );
        return;
      }

      // Step 2: Check image violations if an image is provided
      if (values.image) {
        const hasImageViolation = await analyzeImageAPI({
          image: values.image,
        }).unwrap();

        if (hasImageViolation) {
          setViolatedContent(true);
          Alert.alert(
            'Info',
            'Your image contains violations and cannot be submitted.',
          );
          return;
        }
      }

      // Step 3: Check video violations if a video is provided
      if (values.video) {
        const hasVideoViolation = await analyzeVideoAPI({
          video: values.video,
        }).unwrap();
        
        if (hasVideoViolation) {
          setViolatedContent(true);
          Alert.alert(
            'Info',
            'Your video contains violations and cannot be submitted.',
          );
          return;
        }
      }



      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('public', isPublic);

      if (values.image) formData.append('attachment', values.image);
      if (values.video) formData.append('attachment', values.video);
      if (values.pdf) formData.append('attachment', values.pdf);

      try {
        await createPostAPI(formData).unwrap();
        resetForm();
        setIsPublic(false);
        navigation.navigate('Fellowship');
      } catch (error) {
  
        Alert.alert('Error', 'Failed to create post. Please try again.'); // User feedback on error
      }
    } catch (error) {
      console.log(error);
      
      if (error?.data?.error?.type === 'credentials_error') {
        Alert.alert('Error', 'Unable to process the post');
        return;
      }
      if (
        error?.data?.error?.type === 'media_error' &&
        error?.data?.error?.code === 710
      ) {
        Alert.alert('Error', 'Please upload a 60-second video');
        return;
      }

      if (error) console.error('Error checking text violation:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }

    setViolatedContent(false);
  };

  const clearAttachmentName = () => {
    setAttachementName(null);
  };

  return (
    <SafeAreaView edges={['top']} style={tw`flex-1 bg-white`}>
    <ScrollView style={tw`bg-white`}>
      {(createPostLoading ||
        checkingText ||
        checkingImage ||
        checkingvideo ||
        isCompressing) && <LoadingSpinner />}
      <Formik
        initialValues={{
          title: '',
          description: '',
          image: '',
          video: '',
          pdf: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleNewPostCreation}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <View style={tw`mx-2 py-4 flex-row justify-between`}>
              <TouchableOpacity
                style={tw`flex-row items-center`}
                onPress={() => navigation.goBack()}>
                <View>
                  <Image
                    source={require('../../../assets/images/backnavicon.png')}
                    style={tw`w-9 h-9`}
                    accessibilityLabel="Back"
                  />
                </View>
                <Text style={tw`text-[#040641] text-[18px] mr-4 font-semibold`}>
                  Create a Post
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={createPostLoading || isCompressing || showNameSheet}
                onPress={handleSubmit}
                style={[
                  tw`border-2 px-4 justify-center items-center border-[#0077B6] rounded-[10px]`,
                  showNameSheet && {opacity: 0.4},
                ]}
                accessibilityLabel="Submit Post">
                <Text style={tw`text-[#0077B6] text-[14px]`}>Post</Text>
              </TouchableOpacity>
            </View>

            <View style={tw`mx-4 mt-4 flex-1`}>
              <View style={tw`flex-row gap-4 items-center`}>
                <View
                  style={tw`${
                    isLeader ? 'w-11 h-10' : 'w-10 h-10'
                  } rounded-full relative`}>
                  {isLeader && (
                    <Image
                      source={require('../../../assets/images/leadersframe.png')}
                      style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                    />
                  )}
                  <Image
                    source={
                      profilePicture
                        ? {uri: profilePicture}
                        : require('../../../assets/images/whiteplaceholder.png')
                    }
                    style={tw`${
                      isLeader ? 'w-9 h-9 left-1.3 top-0.7' : 'w-11 h-11'
                    } rounded-full`}
                  />
                </View>
                <View style={styles.inputbar}>
                  <TextInput
                    placeholder="Add a title"
                    placeholderTextColor="rgba(4, 6, 65, 0.4)"
                    style={tw`flex-1 text-[20px] font-medium text-[#040641]`}
                    value={values.title}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                  />
                  {touched.title && errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputbar}>
                <TextInput
                  placeholder="Text Area"
                  placeholderTextColor="rgba(4, 6, 65, 0.4)"
                  style={tw`flex-1 text-[16px] text-[#040641]`}
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                />
                {touched.description && errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={tw`border-b border-gray-300 opacity-40 mb-2 mt-2`} />

              <View style={tw`flex-row justify-between mt-2`}>
                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    onPress={() => handleMediaPick(setFieldValue, 'photo')}
                    accessibilityLabel="Pick Image or Video">
                    <Image
                      source={require('../../../assets/images/gallaryicon.png')}
                      style={tw`w-7 h-7`}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleMediaPick(setFieldValue, 'video')}
                    accessibilityLabel="Pick Video">
                    <Image
                      source={require('../../../assets/images/videoposticon.png')}
                      style={tw`w-7 h-7`}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePdfPick(setFieldValue)}
                    accessibilityLabel="Pick PDF">
                    <Image
                      source={require('../../../assets/images/pdficon.png')}
                      style={tw`w-7 h-7`}
                    />
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-[#040641] text-[13px] mr-4 opacity-70`}>
                    Make it Public
                  </Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#00B4D8'}}
                    thumbColor={isPublic ? '#f4f3f4' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isPublic}
                  />
                </View>
              </View>
              {touched.image && errors.image && (
                <Text style={styles.errorText}>{errors.image}</Text>
              )}
              {touched.video && errors.video && (
                <Text style={styles.errorText}>{errors.video}</Text>
              )}
              {touched.pdf && errors.pdf && (
                <Text style={styles.errorText}>{errors.pdf}</Text>
              )}
            </View>

            {attachementName && (
              <View style={tw`flex-row  items-center ml-4 mt-12`}>
                <View
                  style={tw`bg-[#040641] bg-opacity-6 gap-3 rounded-[12px]  items-center flex-row py-3 px-4 `}>
                  <Text style={tw`text-[#040641] text-[16px] font-medium`}>
                    {isCompressing
                      ? 'Compressing...'
                      : truncateText(attachementName, 20)}
                  </Text>
                  <TouchableOpacity onPress={clearAttachmentName}>
                    <Image
                      source={require('../../../assets/images/closered.png')}
                      style={tw`w-6 h-6 `}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* note */}
            <View style={tw`mx-4 mt-5 text-center`}>
              <Text style={tw`text-gray-500 text-[10px] mr-4`}>
                Only your friends will be able to see your posts. Turn on
                <Text style={tw`text-gray-500 text-[10px] mr-4 font-semibold`}>
                  {' '}
                  Make it Public{' '}
                </Text>
                to allow everyone to see them.
              </Text>
            </View>
            <View style={tw`mx-4 mt-3 text-center`}>
              <Text style={tw`text-gray-500 text-[10px] mr-4`}>
                For video, you can upload a video that is up to 60 seconds long.
              </Text>
            </View>
            {violatedContent && (
              <View style={{marginTop: 100, marginLeft: 10}}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Guidelines')}>
                  <Text style={{color: 'red'}}>
                    Post has some violated content. Please check the guidelines
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Formik>

      {/* Name prompt bottom sheet */}
      <Modal
        visible={showNameSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameSheet(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.sheetHandle} />

            {/* Avatar + text */}
            <View style={styles.sheetAvatarRow}>
              <View style={styles.sheetAvatar}>
                <Image
                  source={require('../../../assets/images/placeholder.png')}
                  style={styles.sheetAvatarImg}
                />
              </View>
            </View>
            <Text style={styles.sheetTitle}>Add your name to post</Text>
            <Text style={styles.sheetSubtitle}>
              Your name will be shown with your post so others can know and
              connect with you.
            </Text>

            {/* Inputs */}
            <TextInput
              style={styles.sheetInput}
              placeholder="First Name"
              placeholderTextColor="#9A9EAE"
              value={nameFirst}
              onChangeText={setNameFirst}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="Last Name"
              placeholderTextColor="#9A9EAE"
              value={nameLast}
              onChangeText={setNameLast}
            />

            {/* Continue button */}
            <TouchableOpacity
              style={[
                styles.sheetButton,
                (!nameFirst.trim() || !nameLast.trim()) &&
                  styles.sheetButtonDisabled,
              ]}
              onPress={handleNameSubmit}
              disabled={!nameFirst.trim() || !nameLast.trim() || isUpdatingName}>
              {isUpdatingName ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sheetButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Not now */}
            <TouchableOpacity onPress={() => setShowNameSheet(false)}>
              <Text style={styles.sheetNotNow}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 100,
    marginTop: Platform.OS === 'ios' ? 20 : 8,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },

  /* ── Name prompt bottom sheet ── */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D3DC',
    marginBottom: 20,
  },
  sheetAvatarRow: {
    marginBottom: 14,
  },
  sheetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  sheetInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 14,
  },
  sheetButton: {
    height: 52,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetButtonDisabled: {
    opacity: 0.5,
  },
  sheetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sheetNotNow: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CreatePost;
