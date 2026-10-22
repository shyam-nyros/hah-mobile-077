import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TodayScreen from '../screens/bottomtabs/TodayScreen';
import LibraryScreen from '../screens/bottomtabs/LibraryScreen';
import GiveScreen from '../screens/bottomtabs/GiveScreen';
import FellowshipScreen from '../screens/bottomtabs/FellowshipScreen';
import {View, Image, Text, TouchableOpacity, Platform} from 'react-native';
import LiveChurchScreen from '../screens/bottomtabs/LiveChurchScreen';
import PushNotificationsHandler from '../pushnotifications/PushNotificationsHandler';
import SocketConnection from '../socket/SocketConnection';
import PersonalGroupsListener from '../components/messages/individualchat/PersonalGroupsListener';
import MessageInbox from '../components/messages/MessageInbox';
import Notifications from '../notifications/Notifications';
import {useNavigation} from '@react-navigation/native';

const Tab = createBottomTabNavigator();

// Standard tab button
const CustomTabBarButton = ({children, onPress, focused}) => (
  <TouchableOpacity
    style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
    onPress={onPress}>
    <View
      style={{
        width: 50,
        height: 28,
        borderRadius: 25,
        backgroundColor: focused ? 'rgba(4, 6, 65, 0.6)' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {children}
    </View>
  </TouchableOpacity>
);

// Centre raised AI Assist button
// const AIAssistTabButton = () => {
//   const navigation = useNavigation();
//   return (
//     <TouchableOpacity
//       style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}
//       activeOpacity={0.85}
//       onPress={() => navigation.navigate('MinistryAssistantScreen')}>
//       <View
//         style={{
//           width: 62,
//           height: 62,
//           borderRadius: 31,
//           backgroundColor: 'white',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginBottom: 18,
//           // Android elevation
//           elevation: 8,
//           // iOS shadow
//           shadowColor: '#0077B6',
//           shadowOffset: {width: 0, height: -3},
//           shadowOpacity: 0.18,
//           shadowRadius: 8,
//         }}>
//         <Image
//           source={require('../assets/images/AIicon.png')}
//           style={{width: 74, height: 74}}
//           resizeMode="contain"
//         />
//       </View>
//       <Text
//         style={{
//           fontSize: 12,
//           color: 'white',
//           position: 'absolute',
//           // bottom: Platform.OS === 'ios' ? 4 : 0,
//         }}>
//         AI Assist
//       </Text>
//     </TouchableOpacity>
//   );
// };

const AIAssistTabButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('MinistryAssistantScreen')}>
      <View
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 6, // 👈 GAP BETWEEN ICON & TEXT
          elevation: 8,
          shadowColor: '#0077B6',
          shadowOffset: {width: 0, height: -3},
          shadowOpacity: 0.18,
          shadowRadius: 8,
        }}>
        <Image
          source={require('../assets/images/AIicon.png')}
          style={{width: 74, height: 74}}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          fontSize: 12,
          color: 'white',
          marginTop: 2, // 👈 extra spacing control
          // marginBottom: -0.5,
        }}>
        AI Assist
      </Text>
    </TouchableOpacity>
  );
};

// Placeholder — never actually rendered since AIAssistTabButton intercepts all presses
const AIAssistPlaceholder = () => <View />;

const TabNavigator = () => {
  return (
    <>
      {/* setup push notification */}
      <PushNotificationsHandler />
      {/* notifications count in the nav headers for bell icon and message icon count  */}
      <Notifications />
      {/* listen for personal and group messages updates */}
      <PersonalGroupsListener />
      {/* Floating ministry assistant icon — replaced by AI Assist tab button */}
      {/* <FloatingChatIcon /> */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ffff',
          tabBarInactiveTintColor: '#ffff',
          tabBarStyle: {
            backgroundColor: '#0077B6',
            height: Platform.OS === 'ios' ? 76 : 60,
            paddingBottom: Platform.OS === 'ios' ? 22 : 6,
            paddingTop: Platform.OS === 'ios' ? '' : 6,
            overflow: 'visible',
          },
          headerShown: false,
        }}>
        {/* Today — hidden from tab bar, initial screen */}
        <Tab.Screen
          name="Today"
          component={TodayScreen}
          options={{
            headerShown: false,
            tabBarButton: () => null,
          }}
        />

        {/* Library */}
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            headerShown: false,
            tabBarButton: props => (
              <View {...props}>
                <CustomTabBarButton
                  {...props}
                  focused={props.accessibilityState.selected}>
                  <Image
                    source={require('../assets/images/libraryicon.png')}
                    style={{width: 24, height: 24, tintColor: '#ffffff'}}
                  />
                </CustomTabBarButton>
                <Text style={{fontSize: 12, color: 'white'}}>Library</Text>
              </View>
            ),
          }}
        />

        {/* Live Church */}
        <Tab.Screen
          name="Livechurch"
          component={LiveChurchScreen}
          options={{
            headerShown: false,
            tabBarButton: props => (
              <View {...props}>
                <CustomTabBarButton
                  {...props}
                  focused={props.accessibilityState.selected}>
                  <Image
                    source={require('../assets/images/liveicon.png')}
                    // style={{width: 24, height: 20, tintColor: '#ffffff'}}
                    style={{width: 24, height: 20, tintColor: '#ffffff'}}
                  />
                </CustomTabBarButton>
                <Text style={{fontSize: 12, color: 'white'}}>Live Church</Text>
              </View>
            ),
          }}
        />

        {/* AI Assist — centre raised button */}
        <Tab.Screen
          name="AIAssist"
          component={AIAssistPlaceholder}
          options={{
            headerShown: false,
            tabBarButton: () => <AIAssistTabButton />,
          }}
        />

        {/* Give */}
        <Tab.Screen
          name="Give"
          component={GiveScreen}
          options={{
            headerShown: false,
            tabBarButton: props => (
              <View {...props}>
                <CustomTabBarButton
                  {...props}
                  focused={props.accessibilityState.selected}>
                  <Image
                    source={require('../assets/images/heart1.png')}
                    style={{width: 24, height: 24, tintColor: '#ffffff'}}
                  />
                </CustomTabBarButton>
                <Text style={{fontSize: 12, color: 'white'}}>Give</Text>
              </View>
            ),
          }}
        />

        {/* Fellowship */}
        <Tab.Screen
          name="Fellowship"
          component={FellowshipScreen}
          options={{
            headerShown: false,
            tabBarButton: props => (
              <View {...props}>
                <CustomTabBarButton
                  {...props}
                  focused={props.accessibilityState.selected}>
                  <Image
                    source={require('../assets/images/fellowshipicon.png')}
                    style={{width: 24, height: 24, tintColor: '#ffffff'}}
                  />
                </CustomTabBarButton>
                <Text style={{fontSize: 12, color: 'white'}}>Fellowship</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default TabNavigator;
