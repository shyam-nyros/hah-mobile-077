import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  useUserDetailsQuery,
  useUpdateUserAPIMutation,
} from '../../features/auth/authApiSlice';

const NamePromptCard = () => {
  const [dismissed, setDismissed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const {data: userInfo} = useUserDetailsQuery();
  const [updateUserAPI, {isLoading}] = useUpdateUserAPIMutation();

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    try {
      await updateUserAPI({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_name_verified: true,
      }).unwrap();
      setDismissed(true);
    } catch (e) {}
  };

  if (userInfo?.is_name_verified !== false || dismissed) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* X dismiss */}
        <TouchableOpacity
          style={styles.dismiss}
          onPress={() => setDismissed(true)}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>

        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Image
              source={require('../../assets/images/placeholder.png')}
              style={styles.avatarImg}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.badge}>Quick question...</Text>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>
              it will be visible to the group.
            </Text>
          </View>
        </View>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#9A9EAE"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#9A9EAE"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Add Name button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!firstName.trim() || !lastName.trim()) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!firstName.trim() || !lastName.trim() || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Name</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NamePromptCard;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dismiss: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    color: '#9A9EAE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerText: {
    flex: 1,
  },
  badge: {
    fontSize: 13,
    color: '#0077B6',
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
