import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc'; 
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../LoadingSpinner';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';

const EditableName = ({fieldName, fieldValue}) => {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(fieldValue);
  const [tempName, setTempName] = useState(fieldValue);
  const [nameError, setNameError] = useState('');

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const handleSave = async () => {
    if (!tempName || !tempName.trim()) {
      setNameError(`${fieldName} is required`);
      return;
    }
    setNameError('');

    const trimmedName = fieldName.trim().toLowerCase();

    const payload = {};

    // Add the correct field to the payload based on fieldName
    if (trimmedName === 'first name') {
     
      payload.first_name = tempName;
    } else if (trimmedName === 'last name') {
      
      payload.last_name = tempName;
    }

    try {
     
      const response = await updateUserAPI({
        ...payload,
      }).unwrap();


      dispatch(
        updateUserNameFromProfile({
          first_name: response?.user?.first_name,
          last_name: response?.user?.last_name,
        }),
      );

      //   setName(fieldValue);
      setIsEditing(false); // Exit edit mode
    } catch (error) {
    
    }
  };

  useEffect(() => {
    setName(fieldValue);
    setTempName(fieldValue);
  }, [fieldValue]);

  return (
    <>
      {userUpdateLoading && <LoadingSpinner />}
      <View style={tw` h-12 mx-4 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>
          {fieldName}
        </Text>

        <View style={tw`flex-row justify-between gap-2 items-center`}>
          {isEditing ? (
            <TextInput
              value={tempName}
              onChangeText={text => {
                setTempName(text);
                if (nameError) setNameError('');
              }}
              style={[
                tw`text-[15px] text-[#040641] border-b w-40`,
                {borderBottomColor: nameError ? 'red' : '#040641'},
              ]}
            />
          ) : (
            <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
              {name}
            </Text>
          )}

          <TouchableOpacity
            style={tw` `}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
            {isEditing ? (
             <View style={tw` py-3 px-2 `}>
               <Image
                source={require('../../../assets/images/attendingicon.png')}
                style={tw` w-6 h-6 `}
              />
             </View>
            ) : (
              <View style={tw` py-3 pl-3  `}>
                <Image
                source={require('../../../assets/images/editicon.png')}
                style={tw` w-4 h-4 `}
              />
              </View>
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={() => { setIsEditing(false); setNameError(''); }}>
              <View style={tw` py-3 px-2`}>
              <Image
                source={require('../../../assets/images/closered.png')}
                style={tw` w-4 h-4 `}
              />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isEditing && nameError ? (
        <Text style={tw`text-red-500 text-xs mx-4 -mt-1 mb-1`}>{nameError}</Text>
      ) : null}
    </>
  );
};

export default EditableName;



// [
//   {platform: 'Website', handle: 'https://example.com'},
//   {platform: 'Instagram', handle: 'test'},
//   {platform: 'Facebook', handle: 'test'},
//   {platform: 'Twitter', handle: 'test'},
//   {platform: 'LinkedIn', handle: 'test'},
// ];