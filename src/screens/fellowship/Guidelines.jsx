import {Text, View, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';

const Guidelines = () => {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 bg-white p-4`}>
      {/* Back Button */}
      <TouchableOpacity
        style={tw`flex-row items-center mb-4`}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/images/backnavicon.png')}
          style={tw`w-9 h-9`}
          accessibilityLabel="Back"
        />
        <Text style={tw`text-base text-gray-800`}>Back</Text>
      </TouchableOpacity>

      {/* Guidelines Card */}
      <View style={tw`bg-gray-100 p-4 rounded-2xl shadow-md`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>Guidelines</Text>

        <View style={tw`mb-2`}>
          <Text style={tw`text-base text-gray-700`}>
            • Title, description, image, or video must not contain any nudity,
            offensive content, gore, or harmful material.
          </Text>
        </View>

        <View>
          <Text style={tw`text-base text-gray-700`}>
            • For video uploads, the duration must be exactly 60 seconds.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Guidelines;
