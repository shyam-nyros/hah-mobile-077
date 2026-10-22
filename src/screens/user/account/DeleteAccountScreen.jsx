import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StyleSheet,
  Modal,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import tw from 'twrnc';
import {logout} from '../../../features/auth/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  useDeleteAccountAPIMutation,
  useOtpToDeleteAccountAPIMutation,
} from '../../../features/auth/authApiSlice';

import messaging from '@react-native-firebase/messaging';
import {rootApiSlice} from '../../../store/rootApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import showToast from '../../../utils/toast/showToast';
import DeleteCofirmationModal from '../../../utils/customalert/DeleteCofirmationModal';

const DeleteAccount = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const [deleteAccountAPI, {isLoading}] = useDeleteAccountAPIMutation();
  const [otpToDeleteAccountAPI, {isLoading: otpLoading}] =
    useOtpToDeleteAccountAPIMutation();

  const handleLogout = async () => {
    await messaging().deleteToken();
    dispatch(rootApiSlice.util.resetApiState());
    dispatch(logout());
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await otpToDeleteAccountAPI().unwrap();

      // navigate to delete otp screen
      if (response?.msg) {
        navigation.replace('DeleteAccountOtp');
      }
    } catch (error) {

    }
  };

  //modal confirmation yes
  const handleYes = () => {

    setShowConfirmationModal(false);
    handleDeleteAccount();
  };

  //modal confirmation no
  const handleNo = () => {

    setShowConfirmationModal(false);
    navigation.navigate('Dashboard');
  };

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`mx-2 flex-row py-4 items-center`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
          </TouchableOpacity>
          <Text style={tw`text-xl text-[#fff] font-medium`}>
            Delete Account
          </Text>
        </View>
      </SafeAreaView>

      <View style={tw`bg-white flex-1`}>
        {/* Body */}
        <View style={tw`mx-4 mt-4`}>
          <View style={tw`justify-center items-center mt-40 mb-3`}>
            <Image
              source={require('../../../assets/images/roundinfoicon.png')}
            />
          </View>

          <Text
            style={tw`text-[14px] text-center text-[#ff3838] opacity-70 mt-2`}>
            Please note that upon Deleting the account you will not able to
            access it again.
          </Text>
        </View>

        <View style={tw`items-center`}>
          <TouchableOpacity
            style={tw`mt-8 w-[322px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex justify-center items-center`}
            onPress={() => setShowConfirmationModal(true)}
            disabled={isLoading}>
            <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {otpLoading && <LoadingSpinner marginTop={150} />}

      {/* confirmation modal to deactivate the account */}
      <DeleteCofirmationModal
        onConfirm={() => {
          handleYes();
        }}
        onCancel={() => {
          handleNo();
        }}
        visible={showConfirmationModal}
      />
    </>
  );
};

export default DeleteAccount;
