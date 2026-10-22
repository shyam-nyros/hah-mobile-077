import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Modal,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import tw from 'twrnc';
import {logout} from '../../../features/auth/authSlice';
import {useNavigation} from '@react-navigation/native';
import {useDeactivateAccountAPIMutation} from '../../../features/auth/authApiSlice';
import messaging from '@react-native-firebase/messaging';
import {rootApiSlice} from '../../../store/rootApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import showToast from '../../../utils/toast/showToast';

const DeactivateAccountScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const [deactivateAccountAPI, {isLoading: deactivateLoading}] =
    useDeactivateAccountAPIMutation();

  const handleLogout = async () => {
    await messaging().deleteToken();
    dispatch(rootApiSlice.util.resetApiState());
    dispatch(logout());
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleDeactivateAccount = async () => {
    try {
      setLoader(true);
      const response = await deactivateAccountAPI().unwrap();
 
      await handleLogout();
      navigation.navigate('Signin');
      showToast('success', 'Account Deactivated');
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      setLoader(false);
    }
  };

  //modal confirmation yes
  const handleYes = () => {

    setShowConfirmationModal(false);
    handleDeactivateAccount();
  };

  //modal confirmation no
  const handleNo = () => {

    setShowConfirmationModal(false);
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
            Deactivate Account
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
            Please note that upon Deactivate the account you will not able to
            access it again, In order to re-activate your account send a mail to
            Heaven at Hand Support Team
          </Text>
        </View>

        <View style={tw`items-center`}>
          <TouchableOpacity
            style={tw`mt-8 w-[322px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex justify-center items-center`}
            onPress={() => setShowConfirmationModal(true)}
            disabled={deactivateLoading}>
            <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
              {'Deactivate Account'}
            </Text>
            {/* <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
              {deactivateLoading ? 'Deactivating...' : 'Deactivate Account'}
            </Text> */}
          </TouchableOpacity>
        </View>
      </View>

      {loader && <LoadingSpinner marginTop={150} />}

      {/* confirmation modal to deactivate the account */}
      <Modal transparent={true} visible={showConfirmationModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.title}>Confirmation</Text>
            <View style={styles.messagecontainer}>
              <Text style={styles.message}>
                Are you sure you want to{' '}
                <Text style={styles.boldText}> Deactivate</Text> your account ?
              </Text>
            </View>
            <View style={styles.line} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleNo}>
                <Text style={styles.cancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleYes}>
                <Text style={styles.okText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DeactivateAccountScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    paddingHorizontal: 30,
  },
  alertBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    color: 'black',
  },
  messagecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  boldText: {
    marginBottom: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: 'black',
  },
  button: {
    padding: 10,
    marginHorizontal: 10,
  },
  cancelText: {
    color: 'gray',
    fontSize: 16,
  },
  okText: {
    color: 'gray',
    fontSize: 16,
  },
  line: {
    width: '100%',
    height: 0.1,
    backgroundColor: 'gray',
    opacity: 1,
  },
});
