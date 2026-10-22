import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import InterestsScreen from '../screens/signup/InterestsScreen';

const Stack = createStackNavigator();

const UserIntroStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        ...TransitionPresets.SlideFromRightIOS,
      }}>
      <Stack.Screen name="Interests" component={InterestsScreen} />
    </Stack.Navigator>
  );
};

export default UserIntroStack;
