import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import {updateUserNameFromProfile} from '../../../features/auth/authSlice';
import {useDispatch, useSelector} from 'react-redux';
import tw from 'twrnc';
import LoadingSpinner from '../../LoadingSpinner';

const EditDob = () => {
  const dispatch = useDispatch();
  const {dob} = useSelector(state => state.auth);
  const [date, setDate] = useState(dob ? new Date(dob) : null);
  const [isEditing, setIsEditing] = useState(false);

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  // Format date to "22 May 1975"
  const formatDate = date => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  // Format date to "MM/DD/YYYY"
  const formatDateShort = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Function to update date of birth
  const updateDob = useCallback(async (selectedDate) => {
    const formattedDate = formatDateShort(selectedDate);
    try {
      const response = await updateUserAPI({ dob: formattedDate }).unwrap();
      dispatch(updateUserNameFromProfile({ dob: response?.user?.dob }));
    } catch (error) {
      
    } finally {
      setIsEditing(false);
    }
  }, [updateUserAPI, dispatch]);

  // Ensure the dob is correctly updated on state change
  useEffect(() => {
    if (dob) {
      setDate(new Date(dob));
    }
  }, [dob]);

  return (
    <>
      {userUpdateLoading && <LoadingSpinner />}
      <View style={tw`mx-4 py-2`}>
        <Text style={tw`text-[16px] text-[#040641] font-medium`}>
          Date Of Birth
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Image
              source={require('../../../assets/images/editicon.png')}
              style={tw`w-4 h-4 ml-2`}
            />
          </TouchableOpacity>
        </Text>
        <Text style={tw`text-[15px] text-[#040641] opacity-70 mt-1`}>
          Many of our programs are designed for different age groups, knowing
          your age allows us to show age appropriate content.
        </Text>
      </View>

      <View style={tw`bg-[#040641] bg-opacity-6 mt-2`}>
        <View style={tw`my-4 mx-4 flex-row`}>
          <Text style={tw`text-[15px] text-[#040641] font-medium`}>
            {date ? formatDate(date) : 'None'}
          </Text>
        </View>
      </View>

      {isEditing && (
        <View>
          <DatePicker
            modal
            open={isEditing}
            date={date || new Date()} // Handle case when date is null
            mode="date"
            maximumDate={new Date()} // Disable future dates
            onConfirm={updateDob} // Update the date and close the picker
            onCancel={() => setIsEditing(false)}
          />
        </View>
      )}
      
      {userUpdateError && (
        <Text style={tw`text-red-500 text-center mt-4`}>Failed to update DOB</Text>
      )}
    </>
  );
};

export default EditDob;
