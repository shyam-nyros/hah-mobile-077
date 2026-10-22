import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {Formik} from 'formik';
import tw from 'twrnc';
import * as yup from 'yup';
import {useUpdateProfileImageMutation} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../LoadingSpinner';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import {useDispatch} from 'react-redux';

// Validation schema
const validationSchema = yup.object().shape({
  profile_image: yup
    .mixed()
    .required('A file is required')
    .test(
      'fileSize',
      'File size is too large, should be less than 1MB',
      value => value && value.fileSize <= 1048576, // 1 MB
    )
    .test(
      'fileType',
      'Unsupported file format',
      value =>
        value && ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type),
    ),
});

const EditProfilePicture = ({existingProfilePictureUri}) => {
  const dispatch = useDispatch();
 

  const [
    updateProfileImage,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateProfileImageMutation();

  const [profileImageUri, setProfileImageUri] = useState(
    existingProfilePictureUri ? existingProfilePictureUri : null,
  );
  const [showAddPhotoButton, setShowAddPhotoButton] = useState(false); // Button visibility state

  const handleImagePick = setFieldValue => {
    launchImageLibrary(
      {mediaType: 'photo', includeBase64: true, includeExtra: true},
      response => {
        if (response.didCancel) {
          
        } else if (response.errorCode) {
          
        } else if (response.assets && response.assets.length > 0) {
          const image = {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName,
            fileSize: response.assets[0].fileSize, // Include size for validation
          };
          
          setProfileImageUri(response.assets[0].uri);
          setFieldValue('profile_image', image); // Set form value for Formik
          setShowAddPhotoButton(true); // Show the button once an image is picked
        }
      },
    );
  };

  const uploadImage = async (values, {setSubmitting, resetForm}) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', values.profile_image); // Using Formik values
     

      const response = await updateProfileImage(formData).unwrap();

      dispatch(
        updateUserNameFromProfile({
          profile_image: response?.profile_image,
        }),
      );
      resetForm();
      setShowAddPhotoButton(false); // Hide the button after successful upload
    } catch (error) {
      
      
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={tw`items-center mt-10`}>
      <Formik
        initialValues={{profile_image: ''}}
        validationSchema={validationSchema}
        onSubmit={uploadImage}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
        }) => (
          <>
            <View>
              <TouchableOpacity
                style={[
                  tw`absolute p-[6px] bg-white  border border-opacity-20 border-[#00B4D8] rounded-full bottom-1 -right-2 z-10`,
                  styles.shadow,
                ]}
                onPress={() => handleImagePick(setFieldValue)}>
                <Image
                  source={require('../../../assets/images/editicon.png')}
                  style={tw`w-4 h-4`}
                />
              </TouchableOpacity>
              {/* <Text>{profileImageUri}</Text> */}
              {profileImageUri ? (
                <Image
                  source={{uri: profileImageUri}}
                  style={tw`w-20 h-20 border-[3px] border-[#00B4D8] rounded-full`}
                />
              ) : (
                <Image
                  source={require('../../../assets/images/placeholder.png')}
                  style={tw`w-20 h-20 border-[3px] border-[#00B4D8] rounded-full`}
                />
              )}
            </View>

            {/* Conditionally show the Add Photo button */}
            {showAddPhotoButton && !isSubmitting && (
              <TouchableOpacity
                onPress={handleSubmit}
                style={tw`bg-[#040641] bg-opacity-48 p-2 mt-3 rounded-full`}>
                <Text style={tw`text-[14px] text-[#fff]`}>Upload Photo</Text>
              </TouchableOpacity>
            )}

            {touched.profile_image && errors.profile_image && (
              <Text style={{color: 'red'}}>{errors.profile_image}</Text>
            )}

            {userUpdateLoading && <LoadingSpinner />}
            {userUpdateError && (
              <Text style={{color: 'red'}}>Error updating profile image</Text>
            )}
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    // Shadow properties for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      // Shadow properties for Android
      android: {
        elevation: 1,
      },
    }),
  },
});

export default EditProfilePicture;
