import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';

const InfoAlert = ({visible, message, onConfirm, onCancel, boldText}) => {
  return (
    <Modal transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>Info</Text>
          <View style={styles.messagecontainer}>
            <Text style={styles.message}>{message}</Text>
            {boldText && <Text style={styles.boldText}>{boldText}</Text>}
          </View>
          <View style={styles.line} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              {/* <Text style={styles.cancelText}>No</Text> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={styles.okText}>Okay</Text>
            </TouchableOpacity>
          </View>
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
    color: 'black',
    paddingHorizontal: 30,
  },
  alertBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    color: 'black',
  },
  messagecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  boldText: {
    marginBottom: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: 'black',
  },
  button: {
    padding: 10,
    marginHorizontal: 10,
  },
  cancelText: {
    // color: 'red',
    color: 'gray',
    fontSize: 16,
  },
  okText: {
    // color: '#0077B6',
    color: 'gray',
    fontSize: 16,
  },
  line: {
    width: '100%',
    height: 0.1,
    backgroundColor: 'gray',
    opacity: 1,
  },
});

export default InfoAlert;
