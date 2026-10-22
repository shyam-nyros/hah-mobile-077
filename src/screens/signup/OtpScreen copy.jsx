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
import showToast from '../../utils/toast/showToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  useResendOtpAPIMutation,
  useVerifyOtpAPIMutation,
} from '../../features/auth/authApiSlice';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {verifyOtp} from '../../features/auth/authSlice';

const OtpScreen = ({route, navigation}) => {
  const {email} = route.params;
  const dispatch = useDispatch();
  const {token} = useSelector(state => state.auth);
  const [verifyOtpAPI, {isLoading}] = useVerifyOtpAPIMutation();
  const [resendOtpAPI, {isLoading: resendOTPLoading}] =
    useResendOtpAPIMutation();

  const CELL_COUNT = 4;
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [value, setValue] = useState('');
  const [counter, setCounter] = useState(59);
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = async () => {
    if (value.length < 4) {
      showToast('error', 'Enter 4 digit OTP');
      return;
    }
    try {
      const response = await verifyOtpAPI({
        email: email,
        otp: value,
      }).unwrap();

      
      
      dispatch(verifyOtp());
      showToast('success', response.msg);
    } catch (error) {
      
      
      showToast('error', error?.data?.msg);
    }
  };

  const resendOTP = async () => {
    try {
      const response = await resendOtpAPI({
        email: email,
      }).unwrap();
    
      
      showToast('success', response.msg);
    } catch (error) {
      
      
      showToast('error', error?.data || error.error);
    }
  };



  return (
    <>
      <View style={tw`flex-1 justify-center h-full bg-white`}>
        <LinearGradient colors={['#0077B6', '#90E0EF']} style={tw`h-full`}>
          {isLoading && <LoadingSpinner />}
          {resendOTPLoading && <LoadingSpinner />}

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
                    source={require('../../assets/images/logo_white.png')}
                    style={{
                      width: 170,
                      height: 170,
                      resizeMode: 'contain',
                      margin: 10,
                    }}
                  />
                  <Text style={styles.title}>Verify your Email</Text>
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

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 30,
                  }}>
                  <Pressable
                    disabled={counter === 0 ? false : true}
                    onPress={resendOTP}>
                    <Text style={tw`font-bold text-white`}>Resend OTP </Text>
                  </Pressable>
                  <Text style={tw`font-bold text-white`}>
                    {counter !== 0 ? ' in 00:' + counter : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  style={tw`bg-gray-100 h-10 mt-4 ml-8 mr-8 mb-2 flex items-center rounded`}
                  activeOpacity={0.5}
                  onPress={handleSubmit}>
                  <Text style={tw`font-bold text-[#040641] py-3`}>
                    VERIFY & PROCEED
                  </Text>
                </TouchableOpacity>
              </SafeAreaView>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </>
  );
};

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

export default OtpScreen;
