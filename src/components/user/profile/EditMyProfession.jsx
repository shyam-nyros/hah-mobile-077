import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {
  useProfessionAPIQuery,
  useUpdateUserAPIMutation,
} from '../../../features/auth/authApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import * as yup from 'yup';
import SingleSelectDropdownModal from './SingleSelectDropdownModal';

const validationSchema = yup.object().shape({
  selectedProfession: yup.string().required('Please select a profession'),
});

const initialValues = {selectedProfession: '', selectedProfessionId: ''};

const EditMyProfession = () => {
  const dispatch = useDispatch();
  const {profession} = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherProfession, setOtherProfession] = useState('');

  const {data: professionList} = useProfessionAPIQuery();
  // const [updateUserAPI] = useUpdateUserAPIMutation();


  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  // const modifiedProfessionList = [
  //   ...(professionList || []),
  //   {_id: 'other', name: 'Other'},
  // ];

  const modifiedProfessionList = [
    {_id: 'other', name: 'Add Custom Profession'}, // Place "Other" as the first item
    ...(professionList || []).filter(profession => profession._id !== 'other'), // Filter out "Other" if it exists in professionList
  ];
  

  const addProfession = async values => {
    const professionToUpdate =
      values.selectedProfession === 'Add Custom Profession'
        ? otherProfession
        : values.selectedProfession;

    if (!professionToUpdate.trim()) {
      alert('Please enter your profession');
      return;
    }

    try {
      const response = await updateUserAPI({
        profession: professionToUpdate,
      }).unwrap();
      dispatch(updateUserNameFromProfile({name: response?.user?.profession}));
      setOtherProfession('');
      setShowOtherInput(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleProfessionSelect = value => {
    setShowOtherInput(value === 'Add Custom Profession');
  };

  return (
    <>
      <View style={tw`mx-4 py-2`}>
        <Text style={tw`text-[16px] text-[#040641] font-medium`}>
          My Profession
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Image
              source={require('../../../assets/images/editicon.png')}
              style={tw`w-4 h-4 ml-2`}
            />
          </TouchableOpacity>
        </Text>
        <Text style={tw`text-[15px] text-[#040641] opacity-70 mt-1`}>
          Show others the amazing work you do
        </Text>
      </View>
      <View style={tw`bg-[#040641] bg-opacity-6 mt-2`}>
        <View style={tw`my-4 mx-4 flex-row`}>
          <Text style={tw`text-[15px] text-[#040641] font-medium`}>
            {profession?.name || 'None'}
          </Text>
        </View>
      </View>

      <SingleSelectDropdownModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        dropdownList={modifiedProfessionList}
        initialValues={initialValues}
        validationSchema={validationSchema}
        fieldId="selectedProfessionId"
        fieldName="selectedProfession"
        fieldLabel="Select a Profession"
        handleDropdownSubmit={addProfession}
        isSubmittingStatus={userUpdateLoading}
        labelField="name"
        valueField="name"
        onValueChange={handleProfessionSelect}
        showOtherInput={showOtherInput}
        otherProfession={otherProfession}
        setOtherProfession={setOtherProfession}
      />
    </>
  );
};

export default EditMyProfession;
