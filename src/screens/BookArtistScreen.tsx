import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Calendar, Clock, MapPin, FileText, ChevronDown } from 'lucide-react-native';
import { artistsApi, hireApi } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'BookArtist'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'BookArtist'>;

const EVENT_TYPES = ['Wedding', 'Birthday Party', 'Corporate Event', 'Concert', 'Private Party', 'Other'];
const DURATIONS = ['1 hour', '2 hours', '3 hours', '4 hours', '5+ hours'];

export function BookArtistScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { artistId } = route.params;

  const [artistName, setArtistName] = useState('');
  const [form, setForm] = useState({
    eventType: '', date: '', time: '', duration: '2 hours', location: '', details: '',
  });
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    artistsApi.get(artistId).then((res) => {
      const data = res?.data ?? res;
      setArtistName(data?.stageName || data?.user?.name || 'Artist');
    }).catch(() => {});
  }, [artistId]);

  const handleSubmit = async () => {
    if (!form.eventType || !form.date || !form.time) {
      setError('Event type, date, and time are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const scheduledDate = `${form.date}T${form.time}`;
      await hireApi.book({
        artistId,
        service: form.eventType,
        scheduledDate,
        message: form.details || form.location || undefined,
      });
      Alert.alert('Booking Sent!', 'Your booking request has been sent to the artist.', [
        { text: 'View Bookings', onPress: () => navigation.navigate('MyBookings') },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setError(e?.message || 'Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Book Artist</Text>
          <Text style={styles.headerSub}>{artistName}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Event Type */}
        <Animated.View entering={FadeInDown.delay(50).duration(350)} style={styles.field}>
          <Text style={styles.label}>Event Type *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowEventPicker(!showEventPicker)} activeOpacity={0.8}>
            <Text style={[styles.pickerText, !form.eventType && styles.placeholder]}>
              {form.eventType || 'Select event type'}
            </Text>
            <ChevronDown color="#888" size={18} />
          </TouchableOpacity>
          {showEventPicker && (
            <View style={styles.dropdownBox}>
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.dropdownItem, form.eventType === type && styles.dropdownItemActive]}
                  onPress={() => { setForm({ ...form, eventType: type }); setShowEventPicker(false); }}
                >
                  <Text style={[styles.dropdownText, form.eventType === type && styles.dropdownTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Date & Time */}
        <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
            <View style={styles.inputRow}>
              <Calendar color="#888" size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.date}
                onChangeText={v => setForm({ ...form, date: v })}
                placeholder="2026-06-15"
                placeholderTextColor="#555"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Time * (HH:MM)</Text>
            <View style={styles.inputRow}>
              <Clock color="#888" size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.time}
                onChangeText={v => setForm({ ...form, time: v })}
                placeholder="18:00"
                placeholderTextColor="#555"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </Animated.View>

        {/* Duration */}
        <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.field}>
          <Text style={styles.label}>Duration</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowDurationPicker(!showDurationPicker)} activeOpacity={0.8}>
            <Text style={styles.pickerText}>{form.duration}</Text>
            <ChevronDown color="#888" size={18} />
          </TouchableOpacity>
          {showDurationPicker && (
            <View style={styles.dropdownBox}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dropdownItem, form.duration === d && styles.dropdownItemActive]}
                  onPress={() => { setForm({ ...form, duration: d }); setShowDurationPicker(false); }}
                >
                  <Text style={[styles.dropdownText, form.duration === d && styles.dropdownTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Location */}
        <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.field}>
          <Text style={styles.label}>Event Location</Text>
          <View style={styles.inputRow}>
            <MapPin color="#888" size={16} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={v => setForm({ ...form, location: v })}
              placeholder="Enter event location"
              placeholderTextColor="#555"
            />
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(250).duration(350)} style={styles.field}>
          <Text style={styles.label}>Additional Details</Text>
          <View style={[styles.inputRow, styles.textareaRow]}>
            <FileText color="#888" size={16} style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.details}
              onChangeText={v => setForm({ ...form, details: v })}
              placeholder="Tell the artist about your event, music preferences, etc."
              placeholderTextColor="#555"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Send Booking Request</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 4 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 14, padding: 12, marginBottom: 8 },
  errorText: { color: '#ef4444', fontSize: 13 },
  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  label: { fontSize: 13, color: '#888', marginBottom: 8 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingHorizontal: 14, height: 52 },
  pickerText: { color: '#fff', fontSize: 14 },
  placeholder: { color: '#555' },
  dropdownBox: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  dropdownItemActive: { backgroundColor: 'rgba(124,58,237,0.15)' },
  dropdownText: { color: '#ccc', fontSize: 14 },
  dropdownTextActive: { color: '#7c3aed', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingHorizontal: 12, height: 52 },
  textareaRow: { height: 'auto', paddingVertical: 12, alignItems: 'flex-start' },
  inputIcon: { marginRight: 8, flexShrink: 0 },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  textarea: { minHeight: 80 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(10,10,10,0.97)', borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  submitBtn: { backgroundColor: '#7c3aed', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
