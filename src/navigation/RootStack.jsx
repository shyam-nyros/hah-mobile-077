import {createStackNavigator} from '@react-navigation/stack';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';

const Stack = createStackNavigator();

const RootStack = ({isLoggedIn}) => {
  const navigation = useNavigation();
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        

        if (remoteMessage?.data?.type === 'post') {
          navigation.navigate('PostDetails', {
            postId: '67094e03f4da2644795d0a2f',
          });
        }
        // Handle notification interaction when the app is opened from a closed state
      });
  }, []);

  // The backend assigns interests on signup/login (assignRandomInterestsIfEmpty),
  // so logged-in users always go straight to the app - no Interests screen.
  const initialRoute = isLoggedIn ? 'App' : 'Auth';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootStack;
