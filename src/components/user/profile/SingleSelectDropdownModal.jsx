import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Formik} from 'formik';
import LoadingSpinner from '../../LoadingSpinner';
import tw from 'twrnc';

const SingleSelectDropdownModal = ({
  isEditing,
  setIsEditing,
  dropdownList,
  handleDropdownSubmit,
  isSubmittingStatus,
  initialValues,
  validationSchema,
  fieldId,
  fieldName,
  fieldLabel,
  labelField,
  valueField,
  onValueChange,
  showOtherInput,
  otherProfession,
  setOtherProfession,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isEditing}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertBox}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleDropdownSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View style={tw`w-full`}>
                <Dropdown
                  style={[tw`w-full`, styles.dropdown]}
                  selectedTextStyle={[
                    tw`text-[#000] text-[14px]`,
                    styles.selectedTextStyle,
                  ]}
                  data={dropdownList}
                  labelField={labelField}
                  valueField={valueField}
                  placeholder={fieldLabel}
                  placeholderTextColor="#000000"
                  placeholderStyle={styles.placeholderStyle}
                  value={values[fieldName]}
                  onChange={item => {
                    setFieldValue(fieldId, item._id);
                    setFieldValue(fieldName, item[valueField]);
                    if (onValueChange) {
                      onValueChange(item[valueField]);
                    }
                  }}
                  // renderItem={item => (
                  //   <View style={styles.itemContainer}>
                  //     <Text style={styles.name}>{item[labelField]}</Text>
                  //     <View
                  //       style={tw`h-px bg-black bg-opacity-10 w-full mt-2`}
                  //     />
                  //   </View>
                  // )}
                  renderItem={item => (
                    <View style={styles.itemContainer}>
                      <Text
                        style={[
                          styles.name,
                          item[labelField] === 'Add Custom Profession' && styles.customProfessionText,
                        ]}>
                        {item[labelField]}
                      </Text>
                      <View style={tw`h-px bg-black bg-opacity-10 w-full mt-2`} />
                    </View>
                  )}
                  
                />

                {touched[fieldName] && errors[fieldName] && (
                  <Text style={styles.errorText}>{errors[fieldName]}</Text>
                )}

                {showOtherInput && (
                  <View style={tw`mt-4`}>
                    <Text style={tw`text-[#040641] mb-1`}>
                      Specify your profession:
                    </Text>
                    <TextInput
                      style={[styles.dropdown, tw`w-full`]}
                      placeholder="Enter your profession"
                      placeholderTextColor="#aaa"
                      value={otherProfession}
                      onChangeText={setOtherProfession}
                    />
                  </View>
                )}

                {isSubmittingStatus && (
                  <View>
                    <LoadingSpinner size={'small'} />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    disabled={isSubmittingStatus}
                    onPress={() => {
                      setIsEditing(!isEditing);
                      if (setOtherProfession) {
                        setOtherProfession('');
                      }
                    }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={isSubmittingStatus}>
                    <Text style={styles.okText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdown: {
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    color: 'black',
  },
  itemContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#040641',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 12,
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
    marginBottom: 10,
    marginLeft: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#aaa',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: 'black',
  },
  customProfessionText: {
    color: '#0077B6',
  },
  
});

export default SingleSelectDropdownModal;
