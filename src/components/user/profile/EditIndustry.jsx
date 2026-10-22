import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {
  useIndustriesAPIQuery,
  useUpdateUserAPIMutation,
} from '../../../features/auth/authApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import * as yup from 'yup';
import SingleSelectDropdownModal from './SingleSelectDropdownModal';




const validationSchema = yup.object().shape({
  selectedIndustry: yup.string().required('Please select a industry'),
});

const initialValues = {selectedIndustry: '', selectedIndustryId: ''};

const EditIndustry = () => {
  const dispatch = useDispatch();
  const {industry} = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const {
    data: industryList,
    isLoading: industryListLoading,
    isError: industryListError,
  } = useIndustriesAPIQuery();

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const addIndustry = async (values, {setSubmitting, resetForm}) => {
    try {
      const response = await updateUserAPI({
        industry: values.selectedIndustryId,
      }).unwrap();

      dispatch(
        updateUserNameFromProfile({
          id: response?.user?.industry?._id,
          name: response?.user?.industry?.name,
        }),
      );
    } catch (error) {
  
    } finally {
      setIsEditing(!isEditing); // Exit edit mode
    }
  };

  return (
    <>
      <View style={tw` h-12 mx-4 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>Industry</Text>

        <View style={tw`flex-row  w-60 justify-end gap-2 items-center`}>
          <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
            {industry?.name ? industry.name : 'None'}
          </Text>

          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <View style={tw`py-3 pl-3`}>
            <Image
              source={require('../../../assets/images/editicon.png')}
              style={tw` w-4 h-4 `}
            />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <SingleSelectDropdownModal
          isEditing={isEditing} // based on this boolean modal will be opened
          setIsEditing={setIsEditing} // modal open/close function
          dropdownList={industryList} // dropdown list 
          initialValues={initialValues} // initial values 
          validationSchema={validationSchema} // validation schema
          fieldId="selectedIndustryId"  // id should be same in schema
          fieldName="selectedIndustry" // name should be same in schema
          fieldLabel="Select a Industry" // dropdownplaceholder
          handleDropdownSubmit={addIndustry} // onsubmit function pointer
          isSubmittingStatus={userUpdateLoading} // submitting status - boolean
          labelField="name" // eachitem name field in the dropdown based on the api response 
          valueField="name" // eachitem name field in the dropdown based on the api response 
        />
      )}
    </>
  );
};

export default EditIndustry;
