import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useGetActivitiesAPIQuery} from '../../../features/auth/authApiSlice';
import ActivityList from '../../../components/library/ActivityList';

const WeeklyActivityScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivities = useCallback(
    timeframe => {
      return useGetActivitiesAPIQuery({
        data: timeframe,
        page: currentPage,
        search: searchTerm,
      });
    },
    [currentPage, searchTerm],
  );

  const {data: todayActivities, isLoading: todayLoading} =
    fetchActivities('today');
  const {data: yesterdayActivities, isLoading: yesterdayLoading} =
    fetchActivities('yesterday');
  const {data: earlierActivities, isLoading: earlierLoading} =
    fetchActivities('earlier');

  const handleSearch = term => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const shimmerPlaceholder = () => (
    <View style={styles.shimmerRow}>
      {[...Array(3)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
          LinearGradient={LinearGradient}
          style={styles.shimmerCard}
        />
      ))}
    </View>
  );

  const renderActivityList = (activities, timeframe, loading) => {
    if (loading) {
      return (
        <View>
          <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
            {timeframe}
          </Text>
          {shimmerPlaceholder()}
        </View>
      );
    }

    if (activities?.length) {
      return (
        <View>
          <Text style={tw`text-lg font-bold text-gray-800 -mb-5`}>
            {timeframe}
          </Text>
          <ActivityList activities={activities} />
        </View>
      );
    }

    return null;
  };

  const noDataAvailable =
    !todayActivities?.length &&
    !yesterdayActivities?.length &&
    !earlierActivities?.length;

  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
            <Text style={tw`text-xl text-[#fff] font-medium`}>
              Weekly Activity
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      <ScrollView style={tw`mx-4 mt-4`}>
        {/* Search */}
        <View style={styles.inputbar}>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              marginHorizontal: 16,
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="Search activity"
              placeholderTextColor="rgba(4, 6, 65, 0.7)"
              style={tw`text-[15px] font-medium flex-1 h-full text-black`}
              value={searchTerm}
              onChangeText={handleSearch}
            />
            <Image
              source={require('../../../assets/images/searchicon2.png')}
              style={tw`w-7 h-7`}
            />
          </View>
        </View>

        {/* Conditionally render activities */}
        {renderActivityList(todayActivities, 'Today', todayLoading)}
        {renderActivityList(yesterdayActivities, 'Yesterday', yesterdayLoading)}
        {renderActivityList(earlierActivities, 'Earlier', earlierLoading)}

        {noDataAvailable && (
          <View style={tw`mt-4`}>
            <Text style={tw`text-lg text-gray-500 text-center`}>
              No Data Available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
  },
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shimmerCard: {
    width: '30%',
    height: 100,
    borderRadius: 10,
  },
});

export default WeeklyActivityScreen;
