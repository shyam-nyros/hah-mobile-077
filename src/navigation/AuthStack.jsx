import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import SigninScreen from '../screens/signup/SigninScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import OtpScreen from '../screens/signup/OtpScreen';
import OnboardingStack from './OnboardingStack';
import {useSelector} from 'react-redux';
import ResetPasswordScreen from '../screens/signup/ResetPasswordScreen';
import ForgotPasswordScreen from '../screens/signup/ForgotPasswordScreen';

import VerificationPendingScreen from '../screens/signup/VerificationPendingScreen';
import TermOfUse from '../screens/signup/TermOfUse';
import PrivacyPolicy from '../screens/signup/PrivacyPolicy';

const Stack = createStackNavigator();
const AuthStack = () => {
  const {isInstalled} = useSelector(state => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        ...TransitionPresets.SlideFromRightIOS, // Slide transition
      }}>
      {!isInstalled && (
        <Stack.Screen name="Onboard" component={OnboardingStack} />
      )}
      <Stack.Screen
        name="Signin"
        component={SigninScreen}
        options={{
          headerShown: false,
          headerTitle: '',
        }}
      />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="TermOfUse" component={TermOfUse} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />

      <Stack.Screen
        name="VerificationPending"
        component={VerificationPendingScreen}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
