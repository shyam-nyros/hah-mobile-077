import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {
  useSpokenLanguagesAPIQuery,
  useUpdateUserAPIMutation,
} from '../../../features/auth/authApiSlice';
import MultiSelectDropdownModal from './MultiSelectDropdownModal';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';

const validationSchema = yup.object().shape({
  selectedLanguagesId: yup
    .array()
    .min(1, 'Please select at least one language')
    .required('Languages are required'),
});

// languages array received from parent prop
const EditSpokenLanguages = ({languages}) => {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  // to store the selected ids from the dropdown
  const [selectedIds, setSelectedIds] = useState([]);
  //   set the existing ids - in case if there is any
  const [existingIds, setExistingIds] = useState([]);

  const {
    data: languagesList,
    isLoading: languagesListLoading,
    isError: languagesListError,
  } = useSpokenLanguagesAPIQuery();

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const updateLanguages = async (values, {setSubmitting, resetForm}) => {
   
    try {
      const response = await updateUserAPI({
        languages: JSON.stringify(values.selectedLanguagesId),
      }).unwrap();
    

      dispatch(
        updateUserNameFromProfile({
          languages: response?.user?.languages,
        }),
      );
    } catch (error) {
    
    } finally {
      setIsEditing(!isEditing); // Exit edit mode
    }
  };

  //   pass the existing ids as selectedLanguagesId
  const initialValues = {selectedLanguagesId: [...existingIds]};

  //   this will set the existing ids
  useEffect(() => {
    if (languages && languages.length > 0) {
      const ids = languages.map(item => item._id);
      setExistingIds(ids);
      setSelectedIds(ids);
    }
  }, [languages, isEditing]);

  return (
    <>
      <View style={tw`my-4 mx-4 flex-row justify-between`}>
        <View>
          <Text style={tw`text-[15px] text-[#040641] font-medium`}>
            Spoken Languages
          </Text>
          <Text style={tw`text-[13px] text-[#040641] opacity-70 w-50 mt-1`}>
            Tell us what you speak so we can introduce you to potential friends
          </Text>
         
        </View>
        <View style={tw`flex-row items-start`}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Image
              source={require('../../../assets/images/darkchevronrighticon.png')}
              style={tw`w-4 h-4`}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={tw`flex-row flex flex-wrap gap-2  mx-4  mb-4`}>
            {languages && languages.length > 0 ? (
              <>
                {languages.map((lang, index) => (
                  <View  key={lang._id}>
                    <View style={[tw`bg-white rounded-full p-2`, styles.shadow]}>
                    <Text
                      key={index}
                      style={tw`text-[13px] text-[#040641] font-medium`}>
                      {lang.name}
                    </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text>None</Text>
            )}
            <TouchableOpacity style={[tw`bg-white rounded-full py-2 px-[13px] `, styles.shadow]} onPress={() => setIsEditing(true)}>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={tw`text-[13px] text-[#040641] font-medium`}>
                  +
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

      {isEditing && (
        <MultiSelectDropdownModal
          dropdownList={languagesList} // dataset for dropdown
          fieldLabel={'Select languages'} // field label - string
          itemsSelectionLimit={6} // max item to select in the dropdown
          setIsEditing={setIsEditing} // set editing status
          isSubmittingStatus={userUpdateLoading} // submitting status - boolean
          handleDropdownSubmit={updateLanguages} // onsubmit pointer
          initialValues={initialValues} // initial values
          validationSchema={validationSchema} // validation schema
          labelField={'name'} // prop name as per the api response
          valueField={'_id'} // prop name as per the api response
          fieldId={'selectedLanguagesId'}
          selectedItems={selectedIds} //has array of ids
          setSelectedItems={setSelectedIds} //set the ids
          showSelectedItems={true} //show selected items below the dropdown - boolean
          isEditing={isEditing} // based on this boolean modal will be opened
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  shadow: {
    // Shadow properties for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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

export default EditSpokenLanguages;
