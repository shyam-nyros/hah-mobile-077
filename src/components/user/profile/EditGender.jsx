import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import * as yup from 'yup';
import SingleSelectDropdownModal from './SingleSelectDropdownModal';


const validationSchema = yup.object().shape({
  selectedGender: yup.string().required('Please select a gender'),
});

const initialValues = {selectedGender: '', selectedGenderId: ''};

const genderList = [
  {_id: 'Male', name: 'Male'},
  {_id: 'Female', name: 'Female'},
  {_id: 'Other', name: 'Other'},
];

const EditGender = () => {
  const dispatch = useDispatch();
  const {gender} = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const updateGender = async (values, {setSubmitting, resetForm}) => {
    

    try {
      const response = await updateUserAPI({
        gender: values.selectedGenderId,
      }).unwrap();

      dispatch(
        updateUserNameFromProfile({
          gender: response?.user?.gender,
        }),
      );
    } catch (error) {
   
    } finally {
      setIsEditing(!isEditing); // Exit edit mode
    }
  };

  return (
    <>
      <View style={tw`mx-4 py-2`}>
        <Text style={tw`text-[16px] text-[#040641] font-medium`}>
          Gender
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Image
              source={require('../../../assets/images/editicon.png')}
              style={tw` w-4 h-4 ml-2 `}
            />
          </TouchableOpacity>
        </Text>
        <Text style={tw`text-[15px] text-[#040641] opacity-70 mt-1`}>
          Choosing your gender will help us make better program recommendations
          and introduction to other community menbers.
        </Text>
      </View>
      <View style={tw`bg-[#040641] bg-opacity-6 mt-2  `}>
        <View style={tw`my-4 mx-4 flex-row `}>
          <Text style={tw`text-[15px] text-[#040641] font-medium`}>
            {gender ? gender : '-'}
          </Text>
        </View>
      </View>

      {isEditing && (
        <SingleSelectDropdownModal
          isEditing={isEditing} // based on this boolean modal will be opened
          setIsEditing={setIsEditing} // modal open/close function
          dropdownList={genderList} // dropdown list
          initialValues={initialValues} // initial values
          validationSchema={validationSchema} // validation schema
          fieldId="selectedGenderId" // id - must be same as in the validation schema
          fieldName="selectedGender" // name - must be same as in the validation schema
          fieldLabel="Select a Gender" // dropdownplaceholder
          handleDropdownSubmit={updateGender} // onsubmit function pointer
          isSubmittingStatus={userUpdateLoading} // submitting status - boolean
          labelField="name" // eachitem name field in the dropdown based on the api response
          valueField="name" // eachitem name field in the dropdown based on the api response
        />
      )}
    </>
  );
};

export default EditGender;
