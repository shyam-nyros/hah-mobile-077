import {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import tw from 'twrnc';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import showToast from '../../../utils/toast/showToast';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {useDeleteAccountAPIMutation} from '../../../features/auth/authApiSlice';
import DeleteCofirmationModal from '../../../utils/customalert/DeleteCofirmationModal';
import {logout} from '../../../features/auth/authSlice';
import messaging from '@react-native-firebase/messaging';
import {rootApiSlice} from '../../../store/rootApiSlice';

const DeleteAccOtpScreen = ({route, navigation}) => {
  const {email} = useSelector(state => state.auth);

  const dispatch = useDispatch();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const CELL_COUNT = 4;
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [value, setValue] = useState('');
  const [counter, setCounter] = useState(59);
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // delete acc api
  const [deleteAccountAPI, {isLoading: deleteAccLoading}] =
    useDeleteAccountAPIMutation();

  // logout and clear the fcm token
  const handleLogout = async () => {
    await messaging().deleteToken();
    dispatch(rootApiSlice.util.resetApiState());
    dispatch(logout());
  };

  // handle the account delete
  const handleDelete = async () => {
 
    try {
      setLoader(true);
      const response = await deleteAccountAPI({otp: value}).unwrap();

      await handleLogout();
      navigation.navigate('Signin');
      showToast('success', 'Account Deleted');
    } catch (error) {
 
      if (error?.data?.msg === 'Invalid OTP') {
        showToast('error', 'Invalid OTP');
      }
    } finally {
      setLoader(false);
    }
  };

  const checkOTPLength = () => {
    if (value.length < 4) {
      showToast('error', 'Enter 4 digit OTP');
      return;
    }
    setShowConfirmationModal(true);
  };

  //modal confirmation yes
  const handleYes = () => {
  
    handleDelete();
    setShowConfirmationModal(false);
  };

  //modal confirmation no
  const handleNo = () => {
 
    setShowConfirmationModal(false);
    navigation.navigate('Dashboard');
  };

  return (
    <>
      <View style={tw`flex-1 justify-center h-full bg-white`}>
        <LinearGradient colors={['#0077B6', '#90E0EF']} style={tw`h-full`}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tw`flex-1`}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <SafeAreaView style={styles.root}>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <Image
                    source={require('../../../assets/images/logo_white.png')}
                    style={{
                      width: 170,
                      height: 170,
                      resizeMode: 'contain',
                      margin: 10,
                    }}
                  />
                  <Text style={styles.title}>Delete Account</Text>
                </View>
                <Text style={styles.title1}>
                  Please type the verification code sent to the email &nbsp;
                  {email}
                </Text>
                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={setValue}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFiledRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({index, symbol, isFocused}) => (
                    <View
                      onLayout={getCellOnLayoutHandler(index)}
                      key={index}
                      style={[styles.cellRoot, isFocused && styles.focusCell]}>
                      <Text style={styles.cellText}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                      </Text>
                    </View>
                  )}
                />
                {/* 
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 30,
                  }}>
                  <Pressable
                    disabled={counter === 0 ? false : true}
                    onPress={() => {}}>
                    <Text style={tw`font-bold text-white`}>Resend OTP </Text>
                  </Pressable>
                  <Text style={tw`font-bold text-white`}>
                    {counter !== 0 ? ' in 00:' + counter : ''}
                  </Text>
                </View> */}

                <TouchableOpacity
                  style={tw`bg-gray-100 h-10 mt-10 ml-8 mr-8 mb-2 flex items-center rounded`}
                  activeOpacity={0.5}
                  onPress={checkOTPLength}>
                  <Text style={tw`font-bold text-[#040641] py-3`}>
                    VERIFY & PROCEED
                  </Text>
                </TouchableOpacity>
              </SafeAreaView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
      {/* confirmation modal to deactivate the account */}
      {loader && <LoadingSpinner />}
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

export default DeleteAccOtpScreen;

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#291F4E',
    alignContent: 'center',
    padding: 20,
  },
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#2A0D62',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#fcc630',
    height: 40,
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 25,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {textAlign: 'center', fontSize: 30, color: '#fff'},
  title1: {textAlign: 'center', fontSize: 15, color: '#fff'},

  codeFiledRoot: {
    marginTop: 20,
    width: 280,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cellRoot: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  cellText: {
    color: '#fff',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
  registerTextStyle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'center',
    color: '#FFFFFF',
  },
  buttonStyle: {
    backgroundColor: '#2A0D62',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#072c32',
    height: 40,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 150,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
