import {createStackNavigator} from '@react-navigation/stack';
import AppIntroSlider from '../screens/splash/AppIntroSlider';

const Stack = createStackNavigator();

const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Splash1'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash1" component={AppIntroSlider} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
