import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import tw from 'twrnc';
import {useFollowingUsersListQuery} from '../../../features/messages/messageApiSlice';
import {Formik} from 'formik';
import * as yup from 'yup';
import {launchImageLibrary} from 'react-native-image-picker';
import {truncateText} from '../../../utils/helpers';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {MultiSelect} from 'react-native-element-dropdown';
import {useGetContentListQuery} from '../../../features/content/contentApiSlice';
import {useCreateNewGroupAPIMutation} from '../../../features/chat/groupChat';
import {useSelector} from 'react-redux';
import socket from '../../../socket/socket';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const validationSchema = yup.object().shape({
  groupname: yup
    .string()
    .required('Group name is required')
    .min(3, 'Group name must be at least 3 characters')
    .max(20, 'Group name cannot be more than 20 characters'),
  about: yup
    .string()
    .required('Group description is required')
    .max(100, 'Group description cannot be more than 100 characters'),
  category: yup.array().min(1, 'At least one category is required'),
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

const FollowingUsersListScreen = ({navigation}) => {
  const {currentUserId} = useSelector(state => state.auth);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [attachementName, setAttachementName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [previousFollowingListLength, setPreviousFollowingListLength] =
    useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const [selectedMembers, setSelectedMembers] = useState([]);

  const {
    data: categoryList,
    isLoading: categoryListLoading,
    isError: categoryListError,
  } = useGetContentListQuery();

  const {
    data: followingList = [],
    isLoading: followingListLoading,
    isFetching: followingListFetching,
    isError: followingListError,
  } = useFollowingUsersListQuery({page: currentPage, keyword: ''});

  const [
    createNewGroupAPI,
    {isLoading: newGroupLoading, isError: newGroupError},
  ] = useCreateNewGroupAPIMutation();

  const currentFollowingListLength = followingList.length;

  useEffect(() => {
    if (!followingListFetching && !followingListLoading) {
      if (currentFollowingListLength === previousFollowingListLength) {
        if (!hasReachedEnd) {
          setHasReachedEnd(true);
        }
      } else {
        setHasReachedEnd(false);
        setPreviousFollowingListLength(currentFollowingListLength);
      }
    }

    if (refreshing) {
      setRefreshing(false);
    }
  }, [followingListFetching, currentFollowingListLength]);

  // if (followingListLoading) {
  //   return (
  //     <View style={tw`flex-1 justify-center items-center`}>
  //       <LoadingSpinner />
  //     </View>
  //   );
  // }

  const handleMemberPress = (setFieldValue, member) => {
    let updatedMembers;
    if (selectedMembers.includes(member._id)) {
      // Deselect member
      updatedMembers = selectedMembers.filter(id => id !== member._id);
    } else {
      // Select member
      updatedMembers = [...selectedMembers, member._id];
    }
    setSelectedMembers(updatedMembers);
    setFieldValue('members', updatedMembers);
  };

  const handleCreateGroup = async (values, {resetForm}) => {

    try {
      const formData = new FormData();
      formData.append('group_name', values.groupname);
      formData.append('about', values.about);
      formData.append('participants', JSON.stringify(values.members));
      formData.append('group_picture', values.group_profile_picture);
      formData.append('category', JSON.stringify(values.category));
      const response = await createNewGroupAPI(formData).unwrap();
      navigation.navigate('Fellowship', {initialTab: 'Message'});
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      resetForm();
    }
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
        }
      },
    );
  };

  const clearAttachmentName = () => {
    setAttachementName(null);
  };

  const renderGroupCreationShimmer = () => {
    return (
      <View style={tw`p-4`}>
        <View style={tw`mb-4`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-20 h-20 rounded-full`}
          />
        </View>
        <View style={tw`mb-4`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-4 rounded-md mb-2`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-full h-6 rounded-md`}
          />
        </View>
        <View style={tw`mb-4`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-1/3 h-4 rounded-md mb-2`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-full h-6 rounded-md`}
          />
        </View>
        <View style={tw`mb-6`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-full h-12 rounded-md`}
          />
        </View>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <View key={index} style={tw`flex-row items-center mb-4`}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={tw`w-12 h-12 rounded-full mr-4`}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={tw`w-1/2 h-4 rounded-md`}
              />
            </View>
          ))}
        <View style={tw`items-center mt-25`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-12 rounded-full`}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {categoryListLoading ? (
        <View>{renderGroupCreationShimmer()}</View>
      ) : categoryListError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          Error loading categories
        </View>
      ) : (
        <SafeAreaView>
          <View style={tw`h-full bg-white`}>
            <TouchableOpacity
              style={tw`absolute top-2 right-0`}
              onPress={() => navigation.goBack()}>
              <Image
                source={require('../../../assets/images/closeicon.png')}
                style={tw`w-6 h-6 m-3`}
              />
            </TouchableOpacity>
            <View style={tw`mx-4 flex-1`}>
              <Formik
                initialValues={{
                  group_profile_picture: '',
                  groupname: '',
                  about: '',
                  members: [],
                  category: [],
                }}
                validationSchema={validationSchema}
                onSubmit={handleCreateGroup}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  setFieldValue,
                  errors,
                  touched,
                }) => (
                  <View style={tw`flex-1 mt-[6px]`}>
                    <View style={tw`mt-5   items-center`}>
                      <TouchableOpacity
                        onPress={() => handleImagePick(setFieldValue)}>
                        <View
                          style={tw`items-center flex-row  items-center justify-center`}>
                          <Image
                            source={require('../../../assets/images/groupplaceholder.png')}
                            style={tw`w-14 h-14 border-[3px] border-[#00B4D8] rounded-full`}
                          />
                          <TouchableOpacity
                            style={tw`p-1 bg-[#00B4D8] rounded-full absolute bottom-0 -right-1`}
                            onPress={() => handleImagePick(setFieldValue)}>
                            <Image
                              source={require('../../../assets/images/editwhiteicon.png')}
                              style={tw`w-3 h-3`}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {attachementName && (
                      <View
                        style={tw`flex-row justify-center items-center  mt-2`}>
                        <View
                          style={tw`bg-[#040641] bg-opacity-6 gap-3 rounded-[12px]  items-center flex-row py-2 px-3 `}>
                          <Text
                            style={tw`text-[#040641] text-[12px] font-medium`}>
                            {/* {`${attachementName}`} */}
                            {truncateText(attachementName, 20)}
                          </Text>
                          <TouchableOpacity onPress={clearAttachmentName}>
                            <Image
                              source={require('../../../assets/images/closered.png')}
                              style={tw`w-4 h-4 `} // Added some margin-left to create spacing between the text and the image
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    <Text style={tw`text-[#040641] font-semibold mt-3`}>
                      Group Name
                    </Text>

                    <View style={styles.inputbar}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          alignItems: 'center',
                        }}>
                        <TextInput
                          placeholderTextColor="rgba(4, 6, 65, 0.4)"
                          style={tw`ml-3 text-black h-full flex-1`}
                          placeholder="Enter Name"
                          value={values.groupname}
                          onChangeText={handleChange('groupname')}
                          onBlur={handleBlur('groupname')}
                        />
                      </View>
                    </View>
                    {touched.groupname && errors.groupname && (
                      <Text style={styles.errorText}>{errors.groupname}</Text>
                    )}
                    <Text style={tw`text-[#040641] font-semibold mt-3`}>
                      About
                    </Text>

                    <View style={styles.inputbar2}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          alignItems: 'center',
                        }}>
                        <TextInput
                          placeholderTextColor="rgba(4, 6, 65, 0.7)"
                          style={tw`ml-3 text-black h-full flex-1`}
                          placeholder="Description"
                          value={values.about}
                          onChangeText={handleChange('about')}
                          onBlur={handleBlur('about')}
                        />
                      </View>
                    </View>

                    {touched.about && errors.about && (
                      <Text style={styles.errorText}>{errors.about}</Text>
                    )}

                    {/* <Text style={tw`text-gray-400 font-semibold mt-3`}>
                    Select a category
                  </Text> */}

                    <MultiSelect
                      style={[tw`w-full mt-3`, styles.dropdown]}
                      selectedTextStyle={[
                        tw`text-black text-[14px]`,
                        styles.selectedTextStyle,
                      ]}
                      activeColor={'#E5E7EB'} // color for selected items in dropdown
                      placeholderStyle={tw`text-gray-500`}
                      selectedStyle={tw`rounded-full border-[#0077B6]`}
                      data={categoryList}
                      labelField={'name'}
                      valueField={'_id'}
                      placeholder={'Select category'}
                      maxSelect={3}
                      placeholderTextColor="#000000"
                      value={selectedCategoryIds}
                      onChange={item => {
                        setFieldValue('category', item);
                        setSelectedCategoryIds(item);
                      }}
                      visibleSelectedItem={selectedCategoryIds}
                      renderItem={item => (
                        <View style={tw`mx-3 mt-3`}>
                          <Text
                            style={tw`text-[#0077B6] text-[14px] font-medium`}>
                            {item.name}
                          </Text>
                          <View
                            style={tw`h-px bg-black bg-opacity-10 w-full mt-3 `}
                          />
                        </View>
                      )}
                    />
                    {touched.category && errors.category && (
                      <Text style={[styles.errorText, tw`mt-3`]}>
                        {errors.category}
                      </Text>
                    )}
                    <View style={tw`mt-3 flex-1 mb-20`}>
                      {/* <Text style={tw`text-gray-400 font-semibold`}>
                      Select Members
                    </Text> */}
                      <FlatList
                        data={followingList} // Or your actual data from the API
                        keyExtractor={item => item._id}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            onPress={() =>
                              handleMemberPress(setFieldValue, item)
                            }
                            style={tw`py-4 border-b border-gray-100 flex-row items-center`}>
                            {selectedMembers.includes(item._id) && (
                              <Image
                                source={require('../../../assets/images/confirmicon.png')}
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginRight: 10,
                                  borderRadius: 100,
                                }}
                              />
                            )}
                            <View style={tw`flex-row items-center gap-3`}>
                              {/* <Text>{item?.profile_image}</Text> */}
                              <Image
                                source={
                                  item?.profile_image
                                    ? {uri: item?.profile_image}
                                    : require('../../../assets/images/placeholder.png')
                                }
                                style={tw`w-10 h-10 rounded-full`}
                              />
                              <View>
                                <Text
                                  style={tw`text-[#0077B6] text-[16px] font-500`}>
                                  {item.first_name}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                    <View
                      style={tw`justify-center bg-white w-full  bottom-0 absolute items-center`}>
                      <TouchableOpacity
                        disabled={newGroupLoading}
                        onPress={handleSubmit}
                        style={tw`mt-5 mb-5 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center`}>
                        <Text
                          style={tw`text-[#0077B6] text-[16px] font-semibold`}>
                          Create Group
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </SafeAreaView>
      )}
      {newGroupLoading && <LoadingSpinner />}
    </>
  );
};

export default FollowingUsersListScreen;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    // backgroundColor: 'rgba(4, 6, 65, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  inputbar2: {
    width: '100%',
    height: 48,
    marginBottom: 10,
    // backgroundColor: 'rgba(4, 6, 65, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },
  dropdown: {
    height: 44,
    borderColor: '#040641',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
});
