import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc'; // Assuming you're using tailwind-rn for styling
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../LoadingSpinner';
import {useDispatch} from 'react-redux';

const EditAbout = ({fieldValue}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(fieldValue); // Initial value
  const [tempName, setTempName] = useState(fieldValue); // Temp value for editing
  const [aboutError, setAboutError] = useState('');

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  // Function to save the changes
  const handleSave = async () => {
    if (!tempName || !tempName.trim()) {
      setAboutError('About Me is required');
      return;
    }
    setAboutError('');
    try {
      
      const response = await updateUserAPI({
        about: tempName,
      }).unwrap();

      dispatch(
        updateUserNameFromProfile({
          about: response?.user?.about,
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
      <View style={tw` h-12 mx-4 flex-row   items-center`}>
        <Text style={tw`text-[16px] text-[#040641] font-medium`}>About Me</Text>
        <View style={tw` h-12 gap-3 flex-row justify-between items-center`}>
        <TouchableOpacity
          style={tw``}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
          {isEditing ? (
           <View style={tw` p-2`}>
             <Image
              source={require('../../../assets/images/attendingicon.png')}
              style={tw` w-6 h-6`}
            />
           </View>
          ) : (
            <>
             <View style={tw` p-2`}>
             <Image
                source={require('../../../assets/images/editicon.png')}
                style={tw` w-4 h-4 `}
              />
             </View>
            </>
          )}
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity onPress={() => { setIsEditing(false); setAboutError(''); }}>
           <View style={tw` p-2`}>
           <Image
              source={require('../../../assets/images/closered.png')}
              style={tw` w-5 h-5 `}
            />
           </View>
          </TouchableOpacity>
        )}
        </View>
      </View>

      <View
        style={tw`bg-[#040641] bg-opacity-6  border-l border-l-[2px] border-[#040641]`}>
        <View style={tw`mx-4 flex-row`}>
          {isEditing ? (
            <>
              <TextInput
                placeholder="Tell us a little about yourself"
                placeholderTextColor='#aaa'
                value={tempName}
                onChangeText={text => {
                  setTempName(text);
                  if (aboutError) setAboutError('');
                }}
                style={[
                  tw`text-[15px] h-13 text-[#040641] border-b w-full`,
                  {borderBottomColor: aboutError ? 'red' : '#040641'},
                ]}
              />
              {aboutError ? (
                <Text style={tw`text-red-500 text-xs mt-1`}>{aboutError}</Text>
              ) : null}
            </>
          ) : (
            <Text style={tw`text-[15px] my-4  text-right text-[#040641] opacity-70`}>
              {name ? name : 'Tell us a little about yourself'}
            </Text>
          )}
        </View>
      </View>
    </>
  );
};

export default EditAbout;
