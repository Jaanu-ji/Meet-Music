import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, Music } from 'lucide-react-native';
import { authApi, setAuthToken } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await authApi.login(email, password);
      if (!user?.token) throw new Error('Unable to authenticate. Please try again.');
      await setAuthToken(user.token);
      navigation.navigate('ChoosePath');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(600)} style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Music color="#fff" size={32} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your musical journey</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoBox: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 40 },
  form: { gap: 16 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14,
  },
  errorText: { color: '#ef4444', fontSize: 14 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, color: '#888' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderWidth: 1,
    borderColor: '#2a2a2a', borderRadius: 16,
    paddingHorizontal: 16, height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  forgotText: { color: '#7c3aed', fontSize: 14, textAlign: 'right' },
  loginBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#888', fontSize: 14 },
  footerLink: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
});
