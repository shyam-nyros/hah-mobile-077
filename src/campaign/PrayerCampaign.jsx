import {View, Text, Image, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';

const PrayerCampaign = () => {
  const route = useRoute();
  const {campaignData} = route.params || {}; 
  

  return (
    <>
      <View style={styles.container}>
        {/* Campaign Image */}
        <Image source={{uri: campaignData?.imageURL}} style={styles.image} />

        {/* Campaign Details */}
        <View style={styles.content}>
          <Text style={styles.title}>{campaignData?.title}</Text>
          <Text style={styles.description}>{campaignData?.description}</Text>
          <Text style={styles.landingPage}>
            Landing Page: {campaignData?.landingpage}
          </Text>
        </View>
      </View>
    </>
  );
};

export default PrayerCampaign;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  type: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  landingPage: {
    fontSize: 14,
    color: '#888',
  },
});
