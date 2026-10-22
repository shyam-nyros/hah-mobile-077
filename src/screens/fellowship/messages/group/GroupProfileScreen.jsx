import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import tw from 'twrnc';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import GroupProfileMembersItem from '../../../../components/messages/groupchat/GroupDetailsMembersItem';
import {useSelector} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  useGroupProfileDetailsQuery,
  useJoinGroupAPIMutation,
  useUpdateGroupAPIMutation,
} from '../../../../features/chat/groupChat';
import socket from '../../../../socket/socket';

const validationSchema = yup.object().shape({
  group_profile_picture: yup
    .mixed()
    .nullable()
    .test(
      'fileSize',
      'Image file size is too large, should be less than 1MB',
      value => {
        if (!value) return true; // Skip validation if no image
        return value.fileSize <= 1048576; // 1 MB
      },
    )
    .test('fileType', 'Unsupported file format', value => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
    }),
});

const GroupProfileScreen = ({navigation, route}) => {
  const {groupId} = route.params;

  const {currentUserId} = useSelector(state => state.auth);
  const [attachementName, setAttachementName] = useState(null);
  const [showUpdateImgBtn, setShowUpdateImgBtn] = useState(false);

  // show bio edit icon only for the admins
  const [showBioEditIcon, setShowBioEditIcons] = useState(false);

  const {groupConversationList} = useSelector(state => state.message);

  const [joinGroupAPI, {isLoading: joinGroupLoading, isError: joinGroupError}] =
    useJoinGroupAPIMutation();

  const {data, isLoading, isError} = useGroupProfileDetailsQuery(groupId);

  const combinedMembers = [
    ...(data?.admin?.map(admin => ({...admin, isAdmin: true})) || []),
    ...(data?.participants
      ?.filter(
        participant => !data.admin.some(admin => admin._id === participant._id),
      )
      .map(participant => ({...participant, isAdmin: false})) || []),
  ];

  const [
    updateGroupAPI,
    {isLoading: updateGroupLoading, isError: updateGroupError},
  ] = useUpdateGroupAPIMutation();

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleImagePick = setFieldValue => {
    launchImageLibrary(
      {mediaType: 'photo', includeBase64: true, includeExtra: true},
      response => {
        if (response.didCancel) {
        } else if (response.errorCode) {
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          const image = {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            fileSize: asset.fileSize,
          };
          

          setFieldValue('group_profile_picture', image);
          setAttachementName(image?.name);
          setShowUpdateImgBtn(true);
        }
      },
    );
  };

  // const handleUpdateGroupProfileImage = async (values, {resetForm}) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('group_picture', values.group_profile_picture);
  //     const response = await updateGroupAPI({groupId, formData}).unwrap();
  

  //     setShowUpdateImgBtn(false);
  //     resetForm();
  //   } catch (error) {
  
  //   }
  // };
  // const handleUpdateGroupProfileImage = async (_, { resetForm }) => {
  //   try {
  //     const formData = new FormData();

  //     // Create a dummy file (Blob)
  //     const dummyImage = {
  //       uri: 'https://plus.unsplash.com/premium_photo-1692660488123-ae381d61fe96?fm=jpg',
  //       type: 'image/jpeg',
  //       name: 'dummy-image.jpg',
  //     };

  //     formData.append('group_picture', dummyImage);

  

  //     const response = await updateGroupAPI({ groupId, formData }).unwrap();
  

  //     setShowUpdateImgBtn(false);
  //     resetForm();
  //   } catch (error) {
  
  //   }
  // };

  const handleUpdateGroupProfileImage = async (values, {resetForm}) => {
    

    try {
      const imageToUpload = {
        uri: "https://plus.unsplash.com/premium_photo-1692660488123-ae381d61fe96?fm=jpg",
        // uri: values?.group_profile_picture.uri,
        type: values?.group_profile_picture.type,
        name: values?.group_profile_picture.name,
      };
      const formData = new FormData();
      formData.append('group_picture', imageToUpload);

      

      const response = await updateGroupAPI({groupId, formData}).unwrap();
      

      setShowUpdateImgBtn(false);
      resetForm();
    } catch (error) {
      
    }
  };

  // const handleUpdateGroupProfileImage = async (values, { resetForm }) => {
  //   try {
  //     const { group_profile_picture } = values;

  

  //     if (!group_profile_picture?.uri || !group_profile_picture?.type || !group_profile_picture?.name) {
  //       console.warn('Invalid image data');
  //       return;
  //     }

  //     // Short delay to ensure file availability
  //     // await new Promise(res => setTimeout(res, 4000));

  //     // const imageToUpload = {
  //     //   // uri: "https://plus.unsplash.com/premium_photo-1692660488123-ae381d61fe96?fm=jpg",
  //     //   // uri: "",
  //     //   uri: group_profile_picture.uri,
  //     //   type: group_profile_picture.type || 'image/jpeg',
  //     //   name: group_profile_picture.fileName || 'upload.jpg',
  //     // };

  //     const imageToUpload = {
  //       uri: group_profile_picture.uri,
  //       type: group_profile_picture.type,
  //       name: group_profile_picture.fileName,
  //     };

  //     const formData = new FormData();
  //     formData.append('group_picture', imageToUpload);

  //     console.log('Uploading image:', imageToUpload);

  //     const response = await updateGroupAPI({ groupId, formData }).unwrap();
  //     console.log('Upload successful:', response);

  //     setShowUpdateImgBtn(false);
  //     resetForm();
  //   } catch (error) {
  //     console.log('Upload error:', error);
  //   }
  // };

  const handleJoinGroup = async () => {
    try {
      const response = await joinGroupAPI(groupId).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (data && !isLoading) {
      if (data?.admin?.some(admin => admin._id === currentUserId)) {
        setShowBioEditIcons(true);
      } else {
        setShowBioEditIcons(false);
      }
    }
  }, [data, isLoading]);

  useEffect(() => {
    const groupInformation = groupConversationList.find(
      group => group._id === groupId,
    );

    // setGroupInfo(groupInformation);
  }, [groupId, data, isLoading]);

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `user_group_${currentUserId}`;
      const handleSocketResponse = response => {
        if (response?.group === groupId && response?.removed) {
          navigation.navigate('Fellowship', {initialTab: 'Message'});
        }
      };
      // Attach the listener
      socket?.socket?.on(eventName, handleSocketResponse);
      return () => {
        socket?.socket?.off(eventName, handleSocketResponse);
      };
    }
    return () => {};
  }, []);

  return (
    <>
      {(updateGroupLoading || joinGroupLoading) && <LoadingSpinner />}
      {isLoading ? (
        <View style={tw`items-center mt-25`}>
          {/* Profile Image */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-24 h-24 rounded-full`}
          />
          {/* Name */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[60%] h-6 mt-4 rounded-md`}
          />
          {/* About Section */}
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[90%] h-16 mt-6 rounded-[15px]`}
          />
          {/* Common Groups */}
          <View style={tw`w-full mt-5`}>
            {[1, 2, 3].map(index => (
              <View key={index} style={tw`flex-row items-center gap-3 mt-3`}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={tw`w-10 h-10 rounded-full`}
                />
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={tw`flex-1 h-5 rounded-md`}
                />
              </View>
            ))}
          </View>
        </View>
      ) : isError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingSpinner />
        </View>
      ) : (
        <>
          <SafeAreaView style={tw`bg-white`}>
            <View style={tw`mx-4 flex-row justify-between items-center `}>
              <TouchableOpacity onPress={navigateToPreviousScreen}>
                <View style={tw`py-4`}>
                  <Image
                    source={require('../../../../assets/images/backnavicon.png')}
                    style={tw`w-[36px] h-[36px]`}
                  />
                </View>
              </TouchableOpacity>

              {!data?.is_user_a_member && (
                <TouchableOpacity
                  onPress={handleJoinGroup}
                  style={tw`w-20 h-7 rounded-[6px] border-[1px] border-[#0077B6] items-center justify-center`}>
                  <Text style={tw`text-[#0077B6] text-[13px]`}>Join Group</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
          <View style={tw`flex-1 bg-white `}>
            <Formik
              initialValues={{
                group_profile_picture: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdateGroupProfileImage}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                setFieldValue,
                errors,
                touched,
              }) => (
                <View>
                  {/* Body */}
                  <ScrollView style={tw`mx-4 `}>
                    <View style={tw`items-center mt-10`}>
                      <View>
                        {showBioEditIcon && (
                          <TouchableOpacity
                            onPress={() => handleImagePick(setFieldValue)}
                            style={tw`absolute p-[6px] bg-white  border border-opacity-20 border-[#00B4D8] rounded-full bottom-1 -right-2 z-10`}>
                            <Image
                              source={require('../../../../assets/images/editicon.png')}
                              style={tw`w-4 h-4`}
                            />
                          </TouchableOpacity>
                        )}
                        <Image
                          source={
                            data?.groupPicture
                              ? {uri: data?.groupPicture}
                              : require('../../../../assets/images/groupplaceholder.png')
                          }
                          style={tw`w-24 h-24 rounded-full border-[#0077B6] border-[3px]`}
                        />
                      </View>

                      <Text
                        style={tw`text-[20px] text-[#040641] text-center font-medium mt-2`}>
                        {data?.groupName}
                      </Text>
                      <Text
                        style={tw`text-[14px] text-[#040641] opacity-60 mt-1`}>
                        {combinedMembers.length} Members
                      </Text>
                      {showUpdateImgBtn && (
                        <TouchableOpacity
                          onPress={handleSubmit}
                          style={tw`rounded-full border-[1.8px] py-1 px-3 mt-2 border-[#0077B6]`}>
                          <Text style={tw`text-[#0077B6] font-medium`}>
                            Update
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* About */}
                    <View>
                      <Text
                        style={tw`text-[16px] text-[#040641] font-medium mt-5`}>
                        About
                      </Text>
                      <View
                        style={tw`bg-[#040641] bg-opacity-6 mt-3 p-4 rounded-[15px]`}>
                        <Text style={tw`text-[14px] text-[#040641] opacity-70`}>
                          {data?.about}
                          {/* {data?.groupName} welcomes you */}
                        </Text>
                      </View>
                    </View>

                    {/* Group members component item */}
                    <GroupProfileMembersItem
                      groupId={groupId}
                      combinedMembers={combinedMembers}
                    />
                  </ScrollView>
                </View>
              )}
            </Formik>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 17,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '30%',
    left: '11%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
export default GroupProfileScreen;
