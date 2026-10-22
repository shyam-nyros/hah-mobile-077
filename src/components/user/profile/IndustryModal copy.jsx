import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Formik} from 'formik';
import * as yup from 'yup';
import LoadingSpinner from '../../LoadingSpinner';
import tw from 'twrnc';

const validationSchema = yup.object().shape({
  selectedIndustry: yup.string().required('Please select a industry'),
});

const IndustryModal = ({
  isEditing,
  setIsEditing,
  dropdownList,
  onSubmit,
  isSubmittingStatus,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isEditing}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertBox}>
          <Formik
            initialValues={{selectedIndustry: '', selectedIndustryId: ''}}
            validationSchema={validationSchema}
            onSubmit={onSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <>
                <Dropdown
                  style={[tw`w-full`, styles.dropdown]}
                  selectedTextStyle={[
                    tw`text-[#000] text-[14px]`,
                    styles.selectedTextStyle,
                  ]}
                  data={dropdownList}
                  labelField="name"
                  valueField="name"
                  placeholder="Select a Industry"
                  placeholderTextColor="#000000"
                  value={values.selectedIndustry}
                  onChange={item => {
                    setFieldValue('selectedIndustryId', item._id);
                    setFieldValue('selectedIndustry', item.name);
                  }}
                  renderItem={item => (
                    <View style={styles.itemContainer}>
                      <Text style={styles.name}>{item.name}</Text>
                      <View
                        style={tw`h-px bg-black bg-opacity-10 w-full mt-2 mb-2`}
                      />
                    </View>
                  )}
                />

                {touched.selectedIndustry && errors.selectedIndustry && (
                  <Text style={styles.errorText}>
                    {errors.selectedIndustry}
                  </Text>
                )}

                {isSubmittingStatus && (
                  <View>
                    <LoadingSpinner size={'small'} />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsEditing(!isEditing)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}>
                    <Text style={styles.okText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

export default IndustryModal;

const styles = StyleSheet.create({
  alertBox: {
    width: '94%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  dropdown: {
    width: '90%',
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
  addButton: {
    backgroundColor: '#0077B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 10,
    marginLeft: 5,
  },
});
