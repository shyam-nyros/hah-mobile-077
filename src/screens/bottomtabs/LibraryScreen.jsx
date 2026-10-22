import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Button,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import ContinueLearning from '../../components/library/ContinueLearning';
import GlobalLeaders from '../../components/library/GlobalLeaders';
import Popular from '../../components/library/Popular';
import Trending from '../../components/library/Trending';
import Categories from '../../components/library/Categories';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NavHeaders from '../../components/navheaders/NavHeaders';
import {useSelector} from 'react-redux';
import {
  useUserDetailsQuery,
  useUpdateUserAPIMutation,
} from '../../features/auth/authApiSlice';

const LibraryScreen = ({navigation}) => {
  const {location} = useSelector(state => state.auth);
  const [profileDismissed, setProfileDismissed] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');

  const {data: userInfo} = useUserDetailsQuery();
  const [updateUserAPI, {isLoading: isUpdatingName}] =
    useUpdateUserAPIMutation();

  const handleProfileNameSubmit = async () => {
    if (!profileFirstName.trim() || !profileLastName.trim()) return;
    try {
      await updateUserAPI({
        first_name: profileFirstName.trim(),
        last_name: profileLastName.trim(),
        is_name_verified: true,
      }).unwrap();
      setProfileDismissed(true);
    } catch (e) {}
  };

  // Function to navigate to the search screen
  const handleSearchPress = () => {
    navigation.navigate('LibrarySearch');
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <NavHeaders title={'Library'} showHomeButton />
      </SafeAreaView>
      <ScrollView>
        {/* Content */}
        <View style={tw`mx-4 mb-6 mt-6`}>
          <View style={tw`flex-row  justify-center items-center`}>
            <Text
              style={[
                tw`p-1 rounded bg-[#040641] font-medium text-white`,
                styles.textsize,
              ]}>
              Discover
            </Text>
            <Text style={[tw`p-1 text-[#040641] font-medium`, styles.textsize]}>
              1000+ expert learning resources from
            </Text>
          </View>
          <View style={tw`mt-1 items-center`}>
            <Text
              style={[
                tw`p-1 rounded font-medium text-white bg-[#040641] text-center`,
                styles.textsize,
              ]}>
              Global Leaders
            </Text>
          </View>
          <Text
            style={tw`p-1 mt-2 text-[#040641] text-center text-[14px] opacity-60 font-medium`}>
            Embark on your journey to wisdom and truth.
          </Text>
        </View>

        {/* Continue Learning Section */}
        <View style={tw`mb-6 mx-4`}>
          <View style={tw`flex-row justify-between items-center `}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/pickicon.png')}
                style={tw`w-[16px] h-[20px] mr-1`}
              />
              <Text
                style={tw`text-[15px] md:text-[16px] lg:text-[16px] pb-2 text-[#040641] font-semibold`}>
                Continue Learning
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WeeklyActivityScreen')}
              style={tw`pb-2`}>
              <Text
                style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
                See all {'>'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
            Spend at least 10 minutes per day and grow
          </Text>
          <ContinueLearning />
        </View>

        {/* Complete Your Profile */}
        {userInfo?.is_name_verified === false && !profileDismissed && (
          <View style={styles.profileCard}>
            {/* X dismiss */}
            <TouchableOpacity
              style={styles.profileDismiss}
              onPress={() => setProfileDismissed(true)}>
              <Text style={styles.profileDismissText}>✕</Text>
            </TouchableOpacity>

            {/* Header row */}
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={styles.profileAvatarImg}
                />
              </View>
              <View style={styles.profileHeaderText}>
                <Text style={styles.profileBadge}>Complete your profile</Text>
                <Text style={styles.profileTitle}>
                  Add your name to continue
                </Text>
                <Text style={styles.profileSubtitle}>
                  So others can recognize you in chat, community and your
                  library.
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <TextInput
              style={styles.profileInput}
              placeholder="First Name"
              placeholderTextColor="#9A9EAE"
              value={profileFirstName}
              onChangeText={setProfileFirstName}
            />
            <TextInput
              style={styles.profileInput}
              placeholder="Last Name"
              placeholderTextColor="#9A9EAE"
              value={profileLastName}
              onChangeText={setProfileLastName}
            />

            {/* Continue button */}
            <TouchableOpacity
              style={[
                styles.profileContinue,
                (!profileFirstName.trim() || !profileLastName.trim()) &&
                  styles.profileContinueDisabled,
              ]}
              onPress={handleProfileNameSubmit}
              disabled={
                !profileFirstName.trim() ||
                !profileLastName.trim() ||
                isUpdatingName
              }>
              {isUpdatingName ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.profileContinueText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Not now */}
            <TouchableOpacity onPress={() => setProfileDismissed(true)}>
              <Text style={styles.profileNotNow}>Not now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Global Leaders Section */}
        <View style={tw`mb-6 mx-4`}>
          <View style={tw`flex-row justify-between items-center `}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/globalicon.png')}
                style={tw`w-[16px] h-[20px] mr-1`}
              />
              <Text
                style={tw`text-[15px] md:text-[16px] lg:text-[16px] pb-2 text-[#040641] font-semibold`}>
                Meet the Global Leaders
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('GlobalLeaderScreen')}
              style={tw`pb-2`}>
              <Text
                style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
                See all {'>'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-2`}>
            Learn from the best
          </Text>
          <GlobalLeaders />
        </View>

        {/* Get Personalized Recommendations */}
        <LinearGradient
          colors={['#0077B6', '#90E0EF']}
          start={{x: 0, y: 0}} // top
          end={{x: 0, y: 1}} // bottom
          style={tw`rounded-[20px] p-6 mb-6 mx-4 items-center`}>
          <Text style={tw`text-white text-[18px] font-bold text-center mb-3`}>
            Personalize Your Insights
          </Text>
          <Text
            style={tw`text-white text-[13px] text-center leading-[20px] mb-5 opacity-95`}>
            Let us learn about your spiritual interests so we can recommend
            content that uplift your mind and soul.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GrowthGoals')}
            style={tw`bg-white rounded-full px-6 py-3 flex-row items-center`}>
            <Text style={tw`text-[#040641] text-[14px] font-semibold mr-2`}>
              Choose your journey
            </Text>
            <Text style={tw`text-[#040641] text-[14px] font-semibold`}>→</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Popular Section*/}
        {/* <View style={tw`mb-2 mx-4`}>
          <View style={tw`flex-row justify-between items-center mb-[8px]`}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/flameicon.png')}
                style={tw`w-[16px] h-[20px] mr-1`}
              />
              <Text
                style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                {`Popular in ${location?.city} in this week`}
              </Text>
            </View>
          </View>
          <Popular />
        </View> */}

        {/* Trending Section */}
        <View style={tw`mb-2 mx-4`}>
          <View style={tw`flex-row justify-between items-center mb-[8px]`}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/growthicon.png')}
                style={tw`w-[16px] h-[20px] mr-1`}
              />
              <Text
                style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                Trending Globally This Week
              </Text>
            </View>
          </View>

          <Trending />
        </View>

        {/*Set a reminder*/}
        <View style={tw`mb-6 mx-4`}>
          <LinearGradient
            colors={['#0077B6', '#90E0EF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={tw`rounded-[12px]  py-5`}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/bellimage.png')}
                style={tw`w-18 h-18 ml-1`}
              />
              <View>
                <Text style={tw`text-[15px] text-white font-medium w-62`}>
                  Set a reminder to continue learning at a specific time
                  everyday
                </Text>
                <Text style={tw`text-[14px] text-white mt-3 w-75`}>
                  Top members do this for best results
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/*Categories Section*/}
        <View style={tw` mx-4`}>
          <View style={tw`flex-row justify-between items-center mb-[8px]`}>
            <View style={tw`flex-row`}>
              <Image
                source={require('../../assets/images/categoriesicon.png')}
                style={tw`w-[16px] h-[20px] mr-1`}
              />
              <Text
                style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                Explore by Categories
              </Text>
            </View>
          </View>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
            Learn from the topics of your Interest
          </Text>
        </View>
        <View style={tw`ml-2`}>
          <Categories />
        </View>
      </ScrollView>
    </View>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  textsize: {
    fontSize: hp('1.9%'),
  },

  /* ── Complete Your Profile card ── */
  profileCard: {
    borderWidth: 1,
    borderColor: '#CAE0F8',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  profileDismiss: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  profileDismissText: {
    fontSize: 14,
    color: '#9A9EAE',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 24,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileHeaderText: {
    flex: 1,
  },
  profileBadge: {
    fontSize: 13,
    color: '#0077B6',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  profileInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 12,
  },
  profileContinue: {
    height: 50,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileContinueDisabled: {
    opacity: 0.5,
  },
  profileContinueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  profileNotNow: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
  },
});
