import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  TextInput,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
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
  useAnalyzeImageAPIMutation,
  useAnalyzeTextAPIMutation,
  useAnalyzeVideoAPIMutation,
} from '../../../store/siteEngineApiSlice';

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
      'Image file size is too large, should be less than 1MB',
      value => {
        if (!value) return true; // Skip validation if no image
        return value.fileSize <= 10 * 1024 * 1024; // 10 MB
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
      'Video file size is too large, should be less than 10MB',
      value => {
        if (!value) return true;
        return value.fileSize <= 50 * 1024 * 1024; // 50 MB
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
      'PDF file size is too large, should be less than 10MB',
      value => {
        if (!value) return true;
        return value.fileSize <= 10 * 1024 * 1024; // 10 MB
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
  const {profilePicture, isLeader} = useSelector(state => state.auth);
  const [createPostAPI, {isLoading: createPostLoading, isError}] =
    useCreatePostAPIMutation();

  const [analyzeTextAPI, {isLoading: checkingText, textIsError}] =
    useAnalyzeTextAPIMutation();
  const [analyzeImageAPI, {isLoading: checkingImage, imageIsError}] =
    useAnalyzeImageAPIMutation();
  const [analyzeVideoAPI, {isLoading: checkingvideo, videoIsError}] =
    useAnalyzeVideoAPIMutation();

  const toggleSwitch = () => setIsPublic(previousState => !previousState);

  const handleMediaPick = (setFieldValue, mediaType) => {
    launchImageLibrary({mediaType, includeExtra: true}, response => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          fileSize: asset.fileSize,
        };

        if (asset.type.startsWith('image')) {
          setFieldValue('image', file);
          setFieldValue('video', null);
          setFieldValue('pdf', null);
        } else if (asset.type.startsWith('video')) {
          setFieldValue('video', file);
          setFieldValue('image', null);
          setFieldValue('pdf', null);
        } else {
        }

        setAttachementName(file?.name);
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
        } else {
        }
      });
  };

  const handleNewPostCreation = async (values, {setSubmitting, resetForm}) => {
    try {
      // check text
      // Step 2: Check text violations
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

      // check image
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

      // check video
      // Step 2: Check video violations if an video is provided
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
   
      if (error?.data?.error?.type === 'credentials_error') {
        Alert.alert('Error', 'Unable to process the post');
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
    <ScrollView style={tw`bg-white`}>
      {/* <TouchableOpacity onPress={handleTextAnalyze}>
        <Text>Submit</Text>
      </TouchableOpacity> */}
      {(createPostLoading ||
        checkingText ||
        checkingImage ||
        checkingvideo) && <LoadingSpinner />}
      <Formik
        initialValues={{
          title: '',
          description: '',
          image: '',
          video: '',
          pdf: '',
        }}
        validationSchema={validationSchema}
        // onSubmit={checkImage}>
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
            <SafeAreaView style={tw`mx-2 py-4 flex-row justify-between`}>
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
                disabled={createPostLoading}
                onPress={handleSubmit}
                style={tw`border-2 px-4  justify-center items-center border-[#0077B6] rounded-[10px]`}
                accessibilityLabel="Submit Post">
                <Text style={tw`text-[#0077B6] text-[14px]`}>Post</Text>
              </TouchableOpacity>
            </SafeAreaView>

            <SafeAreaView style={tw`mx-4 mt-4 flex-1 `}>
              <View style={tw`flex-row gap-4 items-center`}>
                {/* <Image
                  source={
                    profilePicture
                      ? {uri: profilePicture}
                      : require('../../../assets/images/placeholder.png')
                  }
                  style={tw`w-10 h-10 rounded-full`}
                /> */}
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
            </SafeAreaView>

            {attachementName && (
              <View style={tw`flex-row  items-center ml-4 mt-12`}>
                <View
                  style={tw`bg-[#040641] bg-opacity-6 gap-3 rounded-[12px]  items-center flex-row py-3 px-4 `}>
                  <Text style={tw`text-[#040641] text-[16px] font-medium`}>
                    {truncateText(attachementName, 20)}
                  </Text>
                  <TouchableOpacity onPress={clearAttachmentName}>
                    <Image
                      source={require('../../../assets/images/closered.png')}
                      style={tw`w-6 h-6 `} // Added some margin-left to create spacing between the text and the image
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
            {violatedContent && (
              <View style={{marginTop: 100, marginLeft: 10}}>
                <Text style={{color: 'red'}}>
                  Post has some violated content. Please check the guidelines.
                </Text>
              </View>
            )}
          </>
        )}
      </Formik>
    </ScrollView>
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
});

export default CreatePost;
