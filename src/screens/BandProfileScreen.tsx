import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, MapPin, Music, Star } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'BandProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'BandProfile'>;

type BandData = {
  _id: string; stageName?: string; bandName?: string; bio?: string; location?: string;
  services?: string[]; genres?: string[]; rating?: number; availability?: string;
  user?: { name?: string; profileImageUrl?: string };
  profileImageUrl?: string;
};

export function BandProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { id } = route.params;

  const [band, setBand] = useState<BandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    artistsApi.get(id).then((res) => {
      const data = res?.data ?? res;
      setBand(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load band'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = async (value: number) => {
    setUserRating(value);
    setRated(true);
    try {
      await artistsApi.rate(id, value);
    } catch {
      // ignore
    }
  };

  const name = band?.bandName || band?.stageName || band?.user?.name || 'Band';
  const imgUrl = band ? resolveProfileImage(band) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Band Profile</Text>
        </View>
        <ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (error || !band) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Band Profile</Text>
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || 'Band not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.backBtnHero} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View style={styles.avatarBox}>
            {imgUrl ? (
              <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.avatarImg} />
            ) : (
              <Music color="#fff" size={36} />
            )}
          </View>
          <Text style={styles.bandName}>{name}</Text>
          {band.location ? (
            <View style={styles.locationRow}>
              <MapPin color="#ccc" size={14} />
              <Text style={styles.locationText}>{band.location}</Text>
            </View>
          ) : null}
          <View style={[styles.availBadge, band.availability === 'busy' && styles.availBusy]}>
            <Text style={[styles.availText, band.availability === 'busy' && styles.availTextBusy]}>
              {band.availability === 'busy' ? 'Currently Busy' : 'Available for Hire'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {(band.services ?? []).length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.section}>
              <Text style={styles.sectionTitle}>Genres & Specialties</Text>
              <View style={styles.tagRow}>
                {(band.services ?? []).map(s => (
                  <View key={s} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {band.bio ? (
            <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{band.bio}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Rate this Band</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => handleRate(star)} activeOpacity={0.8}>
                  <Star
                    color={star <= userRating ? '#f59e0b' : '#2a2a2a'}
                    fill={star <= userRating ? '#f59e0b' : 'transparent'}
                    size={32}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rated ? <Text style={styles.ratingConfirm}>Thanks for rating!</Text> : null}
          </Animated.View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookArtist', { artistId: id })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book This Band</Text>
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
  heroSection: { backgroundColor: '#111', paddingTop: 60, paddingBottom: 32, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtnHero: { position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  avatarBox: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 14 },
  avatarImg: { width: 90, height: 90 },
  bandName: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  locationText: { color: '#ccc', fontSize: 14 },
  availBadge: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  availBusy: { backgroundColor: 'rgba(239,68,68,0.15)' },
  availText: { color: '#22c55e', fontWeight: '600', fontSize: 13 },
  availTextBusy: { color: '#ef4444' },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(14,165,233,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#0ea5e9', fontSize: 13, fontWeight: '600' },
  bioText: { color: '#aaa', fontSize: 14, lineHeight: 22 },
  starsRow: { flexDirection: 'row', gap: 10 },
  ratingConfirm: { marginTop: 10, color: '#f59e0b', fontSize: 13, fontWeight: '600' },
  errorBox: { margin: 20, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14 },
  errorText: { color: '#ef4444', fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(10,10,10,0.97)', borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  bookBtn: { backgroundColor: '#0ea5e9', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
