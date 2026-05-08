import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Camera, Globe } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { artistsApi, uploadApi } from '../lib/api';
import { DANCE_STYLES, DANCE_GENRES, LANGUAGES } from '../types/artist';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'JoinAsDanceArtist'>;

type PortfolioItem = { url: string; type: 'image' | 'video' };

export function JoinAsDanceArtistScreen() {
  const navigation = useNavigation<Nav>();
  const [formData, setFormData] = useState({
    stageName: '', bio: '', city: '', country: '', experience_years: 0,
    available_for_teaching: false, online_classes: false, offline_classes: false,
  });
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    artistsApi.me().then((res) => {
      const profile = res?.data ?? res;
      if (!profile?._id) return;
      const parts = (profile.location || '').split(', ');
      const country = parts.length > 1 ? parts[parts.length - 1] : '';
      const city = parts.length > 1 ? parts.slice(0, -1).join(', ') : parts[0] || '';
      setFormData(prev => ({ ...prev, stageName: profile.stageName || '', bio: profile.bio || '', city, country }));
      if (profile.services?.length) setSelectedStyles(profile.services);
      if (profile.genres?.length) setSelectedGenres(profile.genres);
      if (profile.languages?.length) setSelectedLanguages(profile.languages);
      if (profile.photoUrl) setPhotoUrl(profile.photoUrl);
      if (profile.portfolio?.length) setPortfolioItems(profile.portfolio);
    }).catch(() => {});
  }, []);

  const pickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets?.[0]) {
      const asset = result.assets[0];
      setUploadingPhoto(true);
      try {
        const res = await uploadApi.uploadImage(asset.uri!, asset.fileName || 'photo.jpg', asset.type || 'image/jpeg');
        setPhotoUrl(res?.data?.url || res?.url || '');
      } catch (err: any) {
        setError(err?.message || 'Photo upload failed');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSubmit = async () => {
    if (!formData.stageName || !formData.bio || !formData.city || !formData.country) {
      setError('Please complete all required fields.');
      return;
    }
    const payload = {
      stageName: formData.stageName,
      bio: formData.bio,
      genres: selectedGenres,
      location: [formData.city, formData.country].filter(Boolean).join(', '),
      services: selectedStyles,
      languages: selectedLanguages,
      photoUrl: photoUrl || undefined,
      portfolio: portfolioItems.length > 0 ? portfolioItems : undefined,
      socialLinks: { website: '', instagram: '', youtube: '' },
      category: null,
      artistType: 'dance',
    };
    try {
      setLoading(true);
      setError(null);
      await artistsApi.upsert(payload);
      navigation.navigate('ArtistDashboard');
    } catch (err: any) {
      setError(err?.message || 'Unable to create artist profile.');
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
          <Text style={styles.headerTitle}>Join as Artist</Text>
          <Text style={styles.headerSub}>Create your dance profile</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(400)} style={styles.photoSection}>
          <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto} activeOpacity={0.8}>
            {uploadingPhoto ? (
              <ActivityIndicator color="#fff" />
            ) : photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photoImg} />
            ) : (
              <Camera color="#fff" size={40} />
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to upload profile photo</Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.label}>Stage Name</Text>
          <TextInput style={styles.input} value={formData.stageName} onChangeText={(v) => setFormData({ ...formData, stageName: v })} placeholder="Enter your stage name" placeholderTextColor="#888" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput style={[styles.input, styles.textarea]} value={formData.bio} onChangeText={(v) => setFormData({ ...formData, bio: v })} placeholder="Tell us about your dance journey, style, and teaching experience." placeholderTextColor="#888" multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={formData.city} onChangeText={(v) => setFormData({ ...formData, city: v })} placeholder="Your city" placeholderTextColor="#888" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Country</Text>
          <View style={styles.iconInputWrapper}>
            <Globe color="#888" size={18} style={styles.inputIcon} />
            <TextInput style={styles.iconInput} value={formData.country} onChangeText={(v) => setFormData({ ...formData, country: v })} placeholder="Your country" placeholderTextColor="#888" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput style={styles.input} value={formData.experience_years.toString()} onChangeText={(v) => setFormData({ ...formData, experience_years: parseInt(v) || 0 })} placeholder="0" placeholderTextColor="#888" keyboardType="number-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dance Styles You Teach</Text>
          <View style={styles.chipGrid}>
            {DANCE_STYLES.map((style) => (
              <TouchableOpacity key={style} onPress={() => toggle(selectedStyles, setSelectedStyles, style)} style={[styles.chip, selectedStyles.includes(style) && styles.chipActive]}>
                <Text style={[styles.chipText, selectedStyles.includes(style) && styles.chipTextActive]}>{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dance Genre / Type</Text>
          <View style={styles.chipGrid}>
            {DANCE_GENRES.map((genre) => (
              <TouchableOpacity key={genre} onPress={() => toggle(selectedGenres, setSelectedGenres, genre)} style={[styles.chip, selectedGenres.includes(genre) && styles.chipActive]}>
                <Text style={[styles.chipText, selectedGenres.includes(genre) && styles.chipTextActive]}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Languages You Speak</Text>
          <View style={styles.chipGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang} onPress={() => toggle(selectedLanguages, setSelectedLanguages, lang)} style={[styles.chip, selectedLanguages.includes(lang) && styles.chipActive]}>
                <Text style={[styles.chipText, selectedLanguages.includes(lang) && styles.chipTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Available for Teaching</Text>
              <Text style={styles.toggleSub}>Give dance lessons and classes</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, available_for_teaching: !formData.available_for_teaching })}
              style={[styles.toggleTrack, formData.available_for_teaching && styles.toggleTrackOn]}
            >
              <View style={[styles.toggleThumb, formData.available_for_teaching && styles.toggleThumbOn]} />
            </TouchableOpacity>
          </View>
        </View>

        {formData.available_for_teaching && (
          <View style={styles.section}>
            <Text style={styles.label}>Class Types</Text>
            <View style={styles.classRow}>
              {[{ key: 'online_classes', label: 'Online Classes' }, { key: 'offline_classes', label: 'Offline Classes' }].map((c) => (
                <TouchableOpacity key={c.key} onPress={() => setFormData({ ...formData, [c.key]: !formData[c.key as keyof typeof formData] })} style={[styles.classBtn, !!formData[c.key as keyof typeof formData] && styles.classBtnActive]}>
                  <Text style={[styles.classBtnText, !!formData[c.key as keyof typeof formData] && styles.classBtnTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Dance Profile</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, gap: 4 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14, marginBottom: 8 },
  errorText: { color: '#ef4444', fontSize: 14 },
  photoSection: { alignItems: 'center', gap: 12, marginBottom: 8 },
  photoCircle: { width: 120, height: 120, borderRadius: 30, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
  photoImg: { width: 120, height: 120 },
  photoHint: { color: '#888', fontSize: 13 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, color: '#888', marginBottom: 10 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, paddingHorizontal: 16, height: 54, color: '#fff', fontSize: 15 },
  textarea: { height: 110, paddingTop: 14 },
  iconInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, paddingHorizontal: 16, height: 54 },
  inputIcon: { marginRight: 10 },
  iconInput: { flex: 1, color: '#fff', fontSize: 15 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' },
  chipActive: { borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.15)' },
  chipText: { color: '#888', fontSize: 13 },
  chipTextActive: { color: '#ec4899', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, padding: 16 },
  toggleInfo: { flex: 1 },
  toggleLabel: { color: '#fff', fontWeight: '600', fontSize: 15 },
  toggleSub: { color: '#888', fontSize: 12, marginTop: 2 },
  toggleTrack: { width: 48, height: 26, borderRadius: 13, backgroundColor: '#2a2a2a', justifyContent: 'center', paddingHorizontal: 2 },
  toggleTrackOn: { backgroundColor: '#ec4899' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  classRow: { flexDirection: 'row', gap: 12 },
  classBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  classBtnActive: { borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.15)' },
  classBtnText: { color: '#888', fontSize: 14 },
  classBtnTextActive: { color: '#ec4899', fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(10,10,10,0.97)', borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  submitBtn: { backgroundColor: '#ec4899', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
