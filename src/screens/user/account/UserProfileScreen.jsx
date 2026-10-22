import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import EditCity from '../../../components/user/profile/EditCity';
import EditIndustry from '../../../components/user/profile/EditIndustry';
import EditableName from '../../../components/user/profile/EditableName';
import EditAbout from '../../../components/user/profile/EditAbout';
import EditMyProfession from '../../../components/user/profile/EditMyProfession';
import EditGender from '../../../components/user/profile/EditGender';
import EditSocialLink from '../../../components/user/profile/EditSocialLink';
import EditSpokenLanguages from '../../../components/user/profile/EditSpokenLanguages';
import EditInterests from '../../../components/user/profile/EditInterests';
import EditDob from '../../../components/user/profile/EditDob';
import EditProfilePicture from '../../../components/user/profile/EditProfilePicture';
import EditCountry from '../../../components/user/profile/EditCountry';
import EditZipcode from '../../../components/user/profile/EditZipcode';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const {
    firstName,
    lastName,
    aboutMeDescription,
    socialLinks,
    spokenLanguages,
    interestedContent,
    profilePicture,
  } = useSelector(state => state.auth);
  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };
  //modal
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // const getFieldValue = platformName => {
  //   const platform = socialLinks.find(item => item.platform === platformName);
  //   return platform ? platform.handle : 'None'; // return handle if found, otherwise empty string
  // };
  // const getFieldValue = platformName => {
  //   const platform = socialLinks.find(item => item.platform === platformName);
  //   return platform && platform.handle.trim() !== '' ? platform.handle : 'None';
  // };
  
// Updated getFieldValue function for UserProfileScreen.jsx
const getFieldValue = platformName => {
  const platform = socialLinks.find(item => item.platform === platformName);
  return platform && platform.handle && platform.handle.trim() !== '' ? platform.handle : 'None';
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior for iOS
      style={tw`flex-1`} // Full height to manage keyboard overlap
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <View style={tw`bg-white flex-1`}>
        {/* Header */}
        <SafeAreaView style={tw`bg-[#0077B6]`}>
          <View style={tw`mx-2 flex-row  justify-between`}>
            <TouchableOpacity
              style={tw`py-4`}
              onPress={navigateToPreviousScreen}>
              <View style={tw`flex-row items-center`}>
                <View>
                  <Image
                    source={require('../../../assets/images/chevronlefticon.png')}
                    style={tw`w-[26px] h-[26px]`}
                  />
                </View>
                <Text style={tw`text-xl text-[#fff] font-medium`}>
                  Edit Profile
                </Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity>
            <Text style={tw`text-lg text-[#fff]`}>Save</Text>
          </TouchableOpacity> */}
          </View>
        </SafeAreaView>

        <ScrollView style={tw`bg-white`}>
          {/* Body */}
          {/* profile pic */}
          <View>
            <EditProfilePicture existingProfilePictureUri={profilePicture} />

            {/****  Modal start ****/}
            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)} >
              <View
                style={tw`flex-1 justify-end items-center bg-gray-900 bg-opacity-40`}>
                <View style={tw`bg-[#0077B6] p-5 h-64 rounded-t-[30px] w-full`}>
                  <View>
                    <Text style={tw`text-[#fff] text-[16px]  mt-1 mb-1`}>
                      We’ve highlighted the profile details required for
                      Introduction:
                    </Text>
                    <TouchableOpacity style={tw`flex-row items-center mt-6`}>
                      <Image
                        source={require('../../../assets/images/whitecamicon.png')}
                        style={tw` w-6 h-6 rounded-full`}
                      />
                      <Text style={tw`text-[#fff] text-[15px] ml-5`}>
                        Profile Picture
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={tw`border-b border-gray-300 opacity-40 mb-3 mt-3`}
                    />
                    <TouchableOpacity style={tw`flex-row items-center`}>
                      <Image
                        source={require('../../../assets/images/whiteediticon.png')}
                        style={tw` w-6 h-6 rounded-full`}
                      />
                      <Text style={tw`text-[#fff] text-[15px] ml-5`}>
                        A Short bio about yourself
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={tw`bg-[#0077B6]  mt-6 items-center`}>
                    <TouchableOpacity
                      style={tw`bg-[#fff] w-40 h-10 justify-center items-center font-medium rounded-full`}
                      onPress={toggleModal}>
                      <Text style={tw`text-[15px] text-[#040641]`}>
                        Update Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/****  Modal end ****/}

            {/* profile info */}
            <View style={tw`mx-4 mt-6`}>
              <Text style={tw`text-[16px] text-[#040641] font-medium`}>
                Basic
              </Text>
            </View>
            <View style={tw`bg-[#040641] bg-opacity-6 mt-2`}>
              <EditableName fieldName={'First Name'} fieldValue={firstName} />
              <View style={tw`border-b border-[#fff]`} />

              <EditableName fieldName={'Last Name'} fieldValue={lastName} />
              <View style={tw`border-b border-[#fff]`} />

              <EditCountry />
              <View style={tw`border-b border-[#fff]`} />

              <EditCity />
              <View style={tw`border-b border-[#fff]`} />

              <EditZipcode />
              <View style={tw`border-b border-[#fff]`} />

              {/* uses single select dropdown*/}
              <EditIndustry />
              <View style={tw`border-b border-[#fff]`} />

              {/*Spoken languages uses multi select dropdown*/}
              <EditSpokenLanguages languages={spokenLanguages} />
              <View style={tw`border-b border-[#fff]`} />

              {/* Interests uses multi select dropdown*/}
              <EditInterests interests={interestedContent} />
              <View style={tw`border-b border-[#fff]`} />
            </View>

            {/* About */}
            <EditAbout fieldName={'About Me'} fieldValue={aboutMeDescription} />
            <View style={tw`border-b border-[#fff]`} />

            {/* My Profession uses single select dropdown */}
            <EditMyProfession />
            <View style={tw`border-b border-[#fff]`} />

            {/* Date Of Birth */}
            <EditDob />

            {/* security*/}
            <View style={tw`mx-4 py-2 gap-2 flex-row items-center`}>
              <Image
                source={require('../../../assets/images/darklockicon.png')}
                style={tw`w-4 h-4`}
              />
              <Text style={tw`text-[14px] text-[#040641] opacity-70 mt-1`}>
                Never share anywhere without Your Permission
              </Text>
            </View>

            {/* Gender uses single select dropdown */}
            <EditGender />

            {/* Your Social Links */}
            <View style={tw`mx-4 py-2`}>
              <Text style={tw`text-[16px] text-[#040641] font-medium`}>
                Your Social Links
              </Text>
            </View>
            <View style={tw`border-b border-[#fff]`} />

            <EditSocialLink
              socialLinkList={socialLinks}
              fieldName={'Instagram'}
              fieldValue={getFieldValue('Instagram')}
            />
            <View style={tw`border-b border-[#fff]`} />

            <EditSocialLink
              socialLinkList={socialLinks}
              fieldName={'Facebook'}
              fieldValue={getFieldValue('Facebook')}
            />
            <View style={tw`border-b border-[#fff]`} />

            <EditSocialLink
              socialLinkList={socialLinks}
              fieldName={'Twitter'}
              fieldValue={getFieldValue('Twitter')}
            />
            <View style={tw`border-b border-[#fff]`} />

            <EditSocialLink
              socialLinkList={socialLinks}
              fieldName={'LinkedIn'}
              fieldValue={getFieldValue('LinkedIn')}
            />
            <View style={tw`border-b border-[#fff]`} />
          </View>
        </ScrollView>

        {/* save changes */}
        {/* <View style={tw`bg-[#0077B6] py-3 items-center`}>
        <TouchableOpacity
          style={tw`bg-[#fff] w-40 h-10 justify-center items-center font-medium rounded-full`}>
          <Text style={tw`text-[15px] text-[#040641]`}>Save Details</Text>
        </TouchableOpacity>
      </View> */}
      </View>
    </KeyboardAvoidingView>
  );
};

export default UserProfileScreen;
