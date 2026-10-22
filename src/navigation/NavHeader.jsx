import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import tw from 'twrnc';
import {Dropdown} from 'react-native-element-dropdown';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const NavHeader = ({onBackPress, title}) => {
  return (
    <SafeAreaView style={tw`bg-[#0077B6]`}>
      <View style={tw`flex-row justify-between items-center`}>
        <TouchableOpacity onPress={onBackPress}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <View style={tw`flex-row justify-center items-center`}>
              <Image
                source={require('../assets/images/chevronlefticon.png')}
                style={tw`w-[26px] h-[26px]`}
              />
              <Text style={tw`text-xl text-[#fff] font-semibold`}>{title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
  },
  dropdown: {
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    marginBottom: 18,
    marginTop: 8,
    color: 'black',
  },
  itemContainer: {
    paddingHorizontal: 10,
    color: 'black',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#040641',
  },
  address: {
    fontSize: 14,
    color: '#0077B6',
    color: 'black',
  },
  addButton: {
    backgroundColor: '#0077B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    color: 'black',
  },
  church: {
    height: hp('45%'),
    // backgroundColor: 'black',
    padding: 3,
    overflow: 'scroll',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '94%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: hp('2.8%'),
    textAlign: 'start',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    marginHorizontal: 10,
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '400',
  },
  okText: {
    color: '#0077B6',
    fontSize: 16,
    fontWeight: '400',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },
});
export default NavHeader;
