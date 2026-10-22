import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const GrowthGoalsFinalScreen = () => {
  const {interestedContent} = useSelector(state => state.auth);
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require('../../../assets/images/growthgoalsbgimage.png')}
      style={styles.backgroundImage}>
     <SafeAreaView style={styles.overlay}>
     <View style={styles.overlay2}>
        <TouchableOpacity
          style={tw`absolute top-4 left-4`}
          onPress={() => navigation.navigate('Today')}>
          <Image
            style={tw`w-6 h-6 `}
            source={require('../../../assets/images/closewhite.png')}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={tw`text-center mx-3 `}>
            <Text style={tw`text-[#fff] text-[20px] font-semibold`}>
              Browsing
            </Text>
            <Text style={tw`text-[#040641] text-[20px] font-semibold`}>
              {' '}
              1000+ resources
            </Text>
            <Text style={tw`text-[#fff] text-[20px] font-semibold`}>
              {' '}
              of content to find the best programs for you
            </Text>
          </Text>
        </View>
        <View style={tw`gap-3 mx-6`}>
          {interestedContent &&
            interestedContent.map(content => (
              <View style={tw`flex-row gap-5`} key={content._id}>
                <Image
                  source={require('../../../assets/images/tickicon.png')}
                  style={tw`w-6 h-6`}
                />
                <Text style={tw`text-[#fff] text-[16px] font-medium`}>
                  {content.name}
                </Text>
              </View>
            ))}
        </View>
      </View>
     </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    backgroundColor: 'rgba(0, 119, 182, 0.8)',
    justifyContent: 'center',
    alignItems: 'start',
    height: '100%',
  },
  overlay2: {
    justifyContent: 'center',
    alignItems: 'start',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default GrowthGoalsFinalScreen;
