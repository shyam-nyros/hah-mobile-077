import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Button,
} from 'react-native';
import {MultiSelect} from 'react-native-element-dropdown';
import {Formik} from 'formik';
import LoadingSpinner from '../../LoadingSpinner';
import tw from 'twrnc';

const MultiSelectDropdownModal = ({
  isEditing,
  setIsEditing,
  itemsSelectionLimit,
  handleDropdownSubmit,
  initialValues,
  validationSchema,
  labelField,
  valueField,
  dropdownList,
  selectedItems,
  setSelectedItems,
  fieldLabel,
  isSubmittingStatus,
  showSelectedItems,
  fieldId
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isEditing}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertBox}>
          <Formik
            initialValues={initialValues} // use dynamic initial values
            validationSchema={validationSchema} // use dynamic validation schema
            onSubmit={handleDropdownSubmit}>
            {({handleSubmit, values, errors, touched, setFieldValue}) => (
              <>
                <MultiSelect
                  style={[tw`w-full`, styles.dropdown]}
                  selectedTextStyle={[
                    tw`text-black text-[14px]`,
                    styles.selectedTextStyle,
                  ]}
                  activeColor={'#E5E7EB'} // color for selected items in dropdown
                  placeholderStyle={styles.placeholderStyle}
                  selectedStyle={styles.selectedStyle}
                  data={dropdownList}
                  labelField={labelField}
                  valueField={valueField}
                  placeholder={fieldLabel}
                  maxSelect={itemsSelectionLimit}
                  placeholderTextColor="#000000"
                  value={selectedItems}
                  onChange={item => {
           
                    setFieldValue(fieldId, item);
                    setSelectedItems(item);
                  }}
                  visibleSelectedItem={showSelectedItems}
                  renderItem={item => (
                    <View style={styles.itemContainer}>
                      <Text style={styles.name}>{item.name}</Text>
                      <View
                        style={tw`h-px bg-black bg-opacity-10 w-full mt-3`}
                      />
                    </View>
                  )}
                />

                  {/* to display err message */}
                {touched[fieldId] && errors[fieldId] && (
                  <Text style={styles.errorText}>
                    {errors[fieldId]}
                  </Text>
                )}

                {/* show spinner when api req is made */}
                {isSubmittingStatus && (
                  <View>
                    <LoadingSpinner size={'small'} />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    disabled={isSubmittingStatus}
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

export default MultiSelectDropdownModal;

const styles = StyleSheet.create({
  alertBox: {
    width: '94%',
    backgroundColor: 'white',
    borderRadius: 20, 
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, 
  },
  dropdown: {
    width: '99%',
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 10, 
    padding: 13,
    marginBottom: 18,
    marginTop: 8,
    color: 'black',
  },
  itemContainer: {
    paddingHorizontal: 10,
    color: 'black',
   paddingTop:10,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#040641',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12, 
    marginHorizontal: 10,
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, 
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
});
