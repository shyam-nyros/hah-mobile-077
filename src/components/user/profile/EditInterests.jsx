import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import MultiSelectDropdownModal from './MultiSelectDropdownModal';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import {useGetContentListQuery} from '../../../features/content/contentApiSlice';
import tw from 'twrnc';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  selectedInterestsId: yup
    .array()
    .min(1, 'Please select at least one interests')
    .required('Interests is required'),
});

// interests array received from parent prop
const EditInterests = ({interests}) => {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  // to store the selected ids from the dropdown
  const [selectedIds, setSelectedIds] = useState([]);
  //   set the existing ids - in case if there is any
  const [existingIds, setExistingIds] = useState([]);

  const {
    data: interestsList,
    isLoading: interestsListLoading,
    isError: interestsListError,
  } = useGetContentListQuery();

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const updateInterests = async (values, {setSubmitting, resetForm}) => {
 
    try {
      const response = await updateUserAPI({
        interests: JSON.stringify(values.selectedInterestsId),
      }).unwrap();
    

   

      dispatch(
        updateUserNameFromProfile({
          interests: response?.user?.interests,
        }),
      );
    } catch (error) {
    
    } finally {
      setIsEditing(!isEditing); // Exit edit mode
    }
  };

  //   pass the existing ids as selectedInterestsId
  const initialValues = {selectedInterestsId: [...existingIds]};

  //   this will set the existing ids
  useEffect(() => {
    if (interests && interests.length > 0) {
      const ids = interests.map(item => item._id);
      setExistingIds(ids);
      setSelectedIds(ids);
    }
  }, [interests, isEditing]);

  return (
    <>
      <View style={tw`my-4 mx-4 flex-row justify-between`}>
        <View>
          <Text style={tw`text-[15px] text-[#040641] font-medium`}>
            Your Interests
          </Text>
          <Text style={tw`text-[13px] text-[#040641] opacity-70 w-50 mt-1`}>
            Share your interests so we can guide you in the best way possible.
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
      <View style={tw`flex-row flex flex-wrap mx-4 gap-2 mb-4`}>
            {interests && interests.length > 0 ? (
              <>
                {interests.map((interest, index) => (
                  <View
                  
                    key={interest._id}>
                    <View style={[tw`bg-white rounded-full p-2`, styles.shadow]}>
                    <Text
                      key={index}
                      style={tw`text-[13px] text-[#040641] font-medium`}>
                      {interest.name}
                    </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text> None</Text>
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
          dropdownList={interestsList} // dataset for dropdown
          fieldLabel={'Select interests'} // field label - string
          itemsSelectionLimit={3} // max item to select in the dropdown
          setIsEditing={setIsEditing} // set editing status
          isSubmittingStatus={userUpdateLoading} // submitting status - boolean
          handleDropdownSubmit={updateInterests} // onsubmit pointer
          initialValues={initialValues} // initial values
          validationSchema={validationSchema} // validation schema
          labelField={'name'} // prop name as per the api response
          valueField={'_id'} // prop name as per the api response
          fieldId="selectedInterestsId"
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

export default EditInterests;
