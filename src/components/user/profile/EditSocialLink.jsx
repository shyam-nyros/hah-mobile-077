import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, Alert} from 'react-native';
import tw from 'twrnc';
import LoadingSpinner from '../../LoadingSpinner';
import {useDispatch} from 'react-redux';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';

const EditSocialLink = ({fieldName, fieldValue, socialLinkList}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize tempName with an empty handle if fieldValue is 'None'
  const [tempName, setTempName] = useState({
    platform: fieldName,
    handle: fieldValue === 'None' ? '' : fieldValue,
  });

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const handleSave = async () => {
    // Trim the handle to remove whitespace
    const trimmedHandle = tempName.handle.trim();
    
    // If handle is empty after trimming, show alert and don't save
    if (trimmedHandle === '') {
      Alert.alert(
        "Empty Field",
        `Please enter a value for your ${fieldName} handle.`,
        [{ text: "OK" }]
      );
      setTempName(prev => ({
        ...prev,
        handle: '', // Set to empty string, not spaces
      }));
      return; // Don't exit edit mode so user can try again
    }
    
    // Check if handle is too long (max 50 characters)
    const MAX_CHAR_LIMIT = 30;
    if (trimmedHandle.length > MAX_CHAR_LIMIT) {
      Alert.alert(
        "Text Too Long",
        `Your ${fieldName} handle cannot exceed ${MAX_CHAR_LIMIT} characters.`,
        [{ text: "OK" }]
      );
      return; // Stay in edit mode
    }

    // Create a new item with the trimmed handle
    const newItem = {
      ...tempName,
      handle: trimmedHandle,
    };
    
    const payload = [...socialLinkList]; // take a copy from slice

    // Find the index of the item with the same platform as newItem
    const index = payload.findIndex(item => item.platform === newItem.platform);

    if (index !== -1) {
      // If the platform exists, replace the item
      payload[index] = newItem;
    } else {
      // If the platform does not exist, add the new item
      payload.push(newItem);
    }

    try {
      const response = await updateUserAPI({
        social_links: JSON.stringify(payload),
      }).unwrap();

      dispatch(
        updateUserNameFromProfile({
          socialLinks: response?.user?.social_links,
        }),
      );

      setIsEditing(false);
    } catch (error) {}
  };

  useEffect(() => {
    setTempName({
      platform: fieldName,
      // If fieldValue is 'None', set handle to empty string
      handle: fieldValue === 'None' ? '' : fieldValue,
    });
  }, [fieldValue, fieldName, socialLinkList]);

  return (
    <>
      {userUpdateLoading && <LoadingSpinner />}
      <View
        style={tw`h-12 px-4 bg-[#040641] bg-opacity-6 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>
          {fieldName}
        </Text>

        <View style={tw`flex-row justify-between gap-2 items-center`}>
          {isEditing ? (
            <TextInput
              placeholder="None"
              value={tempName.handle}
              onChangeText={newHandle => {
                setTempName(prevState => ({
                  ...prevState,
                  handle: newHandle,
                }));
              }}
              maxLength={50}
              style={tw`text-[15px] text-[#040641] border-b border-[#040641] w-40`}
            />
          ) : (
            <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
              {tempName.handle ? tempName.handle : 'None'}
            </Text>
          )}

          <TouchableOpacity
            style={tw``}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
            {isEditing ? (
              <View style={tw`py-3 px-2`}>
                <Image
                  source={require('../../../assets/images/attendingicon.png')}
                  style={tw`w-6 h-6`}
                />
              </View>
            ) : (
              <View style={tw`py-3 pl-3`}>
                <Image
                  source={require('../../../assets/images/editicon.png')}
                  style={tw`w-4 h-4`}
                />
              </View>
            )}
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <View style={tw`py-3 px-2`}>
                <Image
                  source={require('../../../assets/images/closered.png')}
                  style={tw`w-5 h-5`}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

export default EditSocialLink;