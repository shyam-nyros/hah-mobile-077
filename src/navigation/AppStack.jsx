import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import EventsScreen from '../screens/events/EventsScreen';
import TabNavigator from './TabNavigator';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import EventsSearchScreen from '../screens/events/EventsSearchScreen';
import GlobalLeadersScreen from '../screens/library/GlobalLeadersScreen';
import LibrarySearchScreen from '../screens/library/LibrarySearchScreen';

import PodcastDetailsScreen from '../screens/library/PodcastDetailsScreen';

import BookDetailsScreen from '../screens/library/BookDetailsScreen';
import VideoDetailsScreen from '../screens/library/VideoDetailsScreen';
import LeaderProfileScreen from '../screens/library/LeaderProfileScreen';
import LiveChurchDetailsScreen from '../screens/livechurch/LiveChurchDetailsScreen';
import GiveDetailsScreen from '../screens/give/GiveDetailsScreen';
import DashboardScreen from '../screens/user/account/DashboardScreen';
import AccountScreen from '../screens/user/account/AccountScreen';
import ChangePasswordScreen from '../screens/user/account/ChangePasswordScreen';
import DeleteAccountScreen from '../screens/user/account/DeleteAccountScreen';

import GrowthGoalsScreen from '../screens/user/growthgoals/GrowthGoalsScreen';
import GrowthGoalsFinalScreen from '../screens/user/growthgoals/GrowthGoalsFinalScreen';
import WeeklyActivityScrren from '../screens/user/weeklyactivity/WeeklyActivityScreen';
import OrderHistoryScreen from '../screens/user/order/OrderHstoryScreen';
import UserProfileScreen from '../screens/user/account/UserProfileScreen';
import CreatePost from '../screens/fellowship/feed/CreatePost';

import PostDetails from '../screens/fellowship/feed/PostDetails';
import FollowingUsersListScreen from '../screens/fellowship/messages/FollowingUsersListScreen';
import GroupChatScreen from '../screens/fellowship/messages/group/GroupChatScreen';
import ChatScreen from '../screens/fellowship/messages/individual/ChatScreen';
import IndividualProfileScreen from '../screens/fellowship/messages/individual/IndividualProfileScreen';
import GroupProfileScreen from '../screens/fellowship/messages/group/GroupProfileScreen';
import Podcast from '../screens/library/PodcastPlayer';
import AddMembers from '../components/messages/groupchat/AddMembers';
import PlayerScreen from '../components/player/PlayerScreen';

import ContactScreen from '../screens/user/account/ContactScreen';
import WeeklyActivityScreen from '../screens/user/weeklyactivity/WeeklyActivityScreen';
import HomeNotificationScreen from '../screens/user/notifications/HomeNotificationScreen';
import HomeMessagesScreen from '../screens/user/messages/HomeMessagesScreen';
import FavoritesScreen from '../screens/user/account/FavoritesScreen';
import AddMembersToGroupScreen from '../screens/fellowship/messages/group/AddMembersToGroupScreen';
import CurrentChurchScreen from '../screens/user/account/CurrentChurchScreen';
import DeactivateAccountScreen from '../screens/user/account/DeactivateAccountScreen';
import DeleteAccOtpScreen from '../screens/user/account/DeleteAccOtpScreen';
import HomeCampaign from '../campaign/HomeCampaign';
import PrayerCampaign from '../campaign/PrayerCampaign';
import PrivacyPolicy from '../screens/signup/PrivacyPolicy';
import Guidelines from '../screens/fellowship/Guidelines';
import BlockedUsersList from '../screens/user/account/BlockedUsersList';
import ReferralScreen from '../screens/user/account/ReferralScreen';
import PendingRequestList from '../components/homenotification/PendingRequestList';
import LiveActivitiesDetailsScreen from '../components/liveactivities/liveactivitiesdetails';
import NewsDetails from '../screens/news/newsDetailsScreen';
import MinistryAssistantScreen from '../components/ministryassistant/MinistryAssistantScreen';


const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Main'}
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        ...TransitionPresets.SlideFromRightIOS, // Slide transition
      }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

      <Stack.Screen
        name="LiveChurchDetails"
        component={LiveChurchDetailsScreen}
      />
      <Stack.Screen
        name="LiveActivitiesDetails"
        component={LiveActivitiesDetailsScreen}
      />

      <Stack.Screen name="EventSearch" component={EventsSearchScreen} />
      <Stack.Screen name="LibrarySearch" component={LibrarySearchScreen} />
      <Stack.Screen name="GlobalLeaderScreen" component={GlobalLeadersScreen} />
      <Stack.Screen name="LeaderProfile" component={LeaderProfileScreen} />
      <Stack.Screen name="PodcastDetails" component={PodcastDetailsScreen} />
      <Stack.Screen name="PodcastPlayer" component={Podcast} />
      <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
      <Stack.Screen name="MinistryAssistantScreen" component={MinistryAssistantScreen} />

      <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      <Stack.Screen name="VideoDetails" component={VideoDetailsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />

      <Stack.Screen name="GiveDetails" component={GiveDetailsScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersList} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="CurrentChurch" component={CurrentChurchScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="DeleteAccountOtp" component={DeleteAccOtpScreen} />
      <Stack.Screen name="PendingRequestList" component={PendingRequestList} />
      <Stack.Screen
        name="DeactivateAccount"
        component={DeactivateAccountScreen}
      />
      <Stack.Screen name="ContactHah" component={ContactScreen} />
      <Stack.Screen name="GrowthGoals" component={GrowthGoalsScreen} />
      <Stack.Screen
        name="GrowthGoalsFinal"
        component={GrowthGoalsFinalScreen}
      />
      <Stack.Screen
        name="WeeklyActivityScreen"
        component={WeeklyActivityScrren}
      />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Profile" component={UserProfileScreen} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="Guidelines" component={Guidelines} />
      <Stack.Screen name="PostDetails" component={PostDetails} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="NewsDetails" component={NewsDetails} />
      <Stack.Screen
        name="IndividualProfile"
        component={IndividualProfileScreen}
      />
      <Stack.Screen name="GroupProfile" component={GroupProfileScreen} />
      <Stack.Screen
        name="FollowingUsers"
        component={FollowingUsersListScreen}
      />
      <Stack.Screen
        name="AddMembersInGroup"
        component={AddMembersToGroupScreen}
      />
      <Stack.Screen name="Notifications" component={HomeNotificationScreen} />
      <Stack.Screen name="Messages" component={HomeMessagesScreen} />
      {/* campaign screens */}
      <Stack.Screen name="Homecampaign" component={HomeCampaign} />
      <Stack.Screen name="Prayercampaign" component={PrayerCampaign} />
    </Stack.Navigator>
  );
};

export default AppStack;
