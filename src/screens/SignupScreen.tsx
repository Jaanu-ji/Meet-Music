import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Mail, Phone, Lock, Music } from 'lucide-react-native';
import { authApi, setAuthToken } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const role = formData.role === 'artist' ? 'artist' : 'user';
      const response = await authApi.register(formData.name, formData.email, formData.password, role);
      const token = response?.token ?? response?.data?.token;
      if (!token) throw new Error('Unable to register. Please try again.');
      await setAuthToken(token);
      navigation.navigate('ChoosePath');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(600)} style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Music color="#fff" size={32} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the music community today</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="Enter your name"
                placeholderTextColor="#888"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(v) => setFormData({ ...formData, email: v })}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWrapper}>
              <Phone color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(v) => setFormData({ ...formData, phone: v })}
                placeholder="Enter your phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock color="#888" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(v) => setFormData({ ...formData, password: v })}
                placeholder="Create a password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleRow}>
              {(['student', 'artist'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setFormData({ ...formData, role: r })}
                  style={[styles.roleBtn, formData.role === r && styles.roleBtnActive]}
                >
                  <Text style={[styles.roleBtnText, formData.role === r && styles.roleBtnTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Create Account</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: '#7c3aed',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 32 },
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
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1,
    borderColor: '#2a2a2a', backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center',
  },
  roleBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)' },
  roleBtnText: { color: '#fff', fontSize: 14 },
  roleBtnTextActive: { color: '#7c3aed', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#888', fontSize: 14 },
  footerLink: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
});
