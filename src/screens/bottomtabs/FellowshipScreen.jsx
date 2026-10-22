import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import FellowshipMessageTab from '../../components/messages/FellowshipMessageTab';
import FellowshipFeedTab from '../../components/feed/FellowshipFeedTab';
import {useEffect, useState} from 'react';
import NavHeaders from '../../components/navheaders/NavHeaders';

const Tab = createMaterialTopTabNavigator();

const FellowshipScreen = ({navigation, route}) => {
  const initialTab = route.params?.initialTab || 'Feed';

  const navigateToChatScreen = () => {
    navigation.navigate('chats');
  };
  const navigateToGroupChatScreen = () => {
    navigation.navigate('groupchats');
  };

  const CustomTabBar = props => {
    return (
      <View style={styles.tabBar}>
        {/* Custom Tab Bar Content */}
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => props.navigation.navigate(route.name)}
              style={[
                styles.tabItem,
                {backgroundColor: isFocused ? '#fff' : 'transparent'},
              ]}>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? '#040641' : 'rgba(4, 6, 41, 0.7)',
                    fontWeight: isFocused ? '600' : 'normal',
                  },
                ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  useEffect(() => {
    // Ensure that when the page loads, it switches to the second tab if specified
    navigation.setParams({screen: initialTab});
  }, [initialTab]);

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <NavHeaders title={'Fellowship'} showHomeButton />
      </SafeAreaView>
      <View style={tw`bg-white flex-1 `}>
        {/* Tabs */}
        <View style={tw`bg-white flex-1`}>
          <Tab.Navigator
            initialRouteName={initialTab}
            screenOptions={{
              tabBarActiveTintColor: '#fff',
              tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.8)',
              tabBarStyle: {
                backgroundColor: 'black',
                borderRadius: 100,
                marginHorizontal: 30,
                height: 60,
                shadowOpacity: 0,
                elevation: 0,
              },
            }}
            tabBar={props => <CustomTabBar {...props} />}>
            <Tab.Screen name="Feed" component={FellowshipFeedTab} />
            <Tab.Screen name="Message" component={FellowshipMessageTab} />
          </Tab.Navigator>
        </View>
      </View>
    </>
  );
};

export default FellowshipScreen;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 100,
    marginTop: 16,
    justifyContent: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 216, 0.4)',
    height: 48,
    padding: 10,
    marginHorizontal: 38,
    marginTop: 12,
    borderRadius: 100,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 5,
    borderRadius: 25,
    height: 34,
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'semibold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
  },
  inputbaroverlay: {
    width: '92%',
    height: 48,
    backgroundColor: '#E6F8FB',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 144,
    justifyContent: 'center',
    marginBottom: 1,
  },
  resultsContainer: {
    backgroundColor: '#E6F8FB',
    width: '92%',
    maxHeight: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 10,
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 2,
    // Android elevation property
    elevation: 2,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
