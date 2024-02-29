// External Dependencies
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const Page = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();

  const onSignUp = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.push('/(tabs)/log');
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={stylesheet.container}>
      {!pendingVerification && (
        <View>
          <TextInput
            autoCapitalize="none"
            onChangeText={(newName) => setName(newName)}
            placeholder="Name"
            style={[stylesheet.inputField, { marginBottom: 20 }]}
            value={name}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={(newEmail) => setEmail(newEmail)}
            placeholder="Email"
            style={[stylesheet.inputField, { marginBottom: 20 }]}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={(newPassword) => setPassword(newPassword)}
            placeholder="Password"
            secureTextEntry={true}
            style={[stylesheet.inputField, { marginBottom: 30 }]}
            value={password}
          />
          <Pressable style={stylesheet.btn} onPress={onSignUp}>
            <Text style={stylesheet.btnText}>Sign Up</Text>
          </Pressable>
        </View>
      )}

      {pendingVerification && (
        <View>
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              onChangeText={(code) => setCode(code)}
              style={[stylesheet.inputField, { marginBottom: 30 }]}
            />
          </View>
          <Pressable onPress={onPressVerify} style={stylesheet.btn}>
            <Text style={stylesheet.btnText}>Verify Email</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#FDFFFF',
    padding: 26,
    justifyContent: 'center',
  },
  seperatorView: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 30,
  },
  seperator: {
    color: '#5E5D5E',
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ABABAB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#15803D',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  btnIcon: {
    position: 'absolute',
    left: 16,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#5E5D5E',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: '#000',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: '#5E5D5E',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default Page;
