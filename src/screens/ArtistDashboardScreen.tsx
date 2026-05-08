import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Image,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Calendar, Clock, CheckCircle2, X, TrendingUp } from 'lucide-react-native';
import { artistsApi, bookingsApi, type Booking } from '../lib/api';
import { resolveProfileImage, withImageCacheBust, initialsFromName } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ArtistDashboard'>;

type DashboardProfile = {
  stageName?: string;
  bio?: string;
  location?: string;
  availability?: 'available' | 'busy';
  user?: { name?: string; profileImageUrl?: string };
  photoUrl?: string;
};

const formatDate = (v: string) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (v: string) => new Date(v).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function ArtistDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<'available' | 'busy'>('available');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, bRes] = await Promise.all([artistsApi.me(), bookingsApi.artistBookings()]);
      const profileData = pRes?.data ?? pRes ?? null;
      const bookingsData = bRes?.data ?? bRes ?? [];
      setProfile(profileData);
      setAvailability(profileData?.availability ?? 'available');
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const pending = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings]);
  const upcoming = useMemo(() => bookings.filter(b => ['confirmed', 'completed'].includes((b.status || '').toLowerCase())), [bookings]);

  const handleAvailability = (val: 'available' | 'busy') => {
    if (val === availability) return;
    const prev = availability;
    setAvailability(val);
    artistsApi.updateAvailability(val).catch(() => { setAvailability(prev); });
  };

  const handleStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await bookingsApi.updateStatus(id, status);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Unable to update booking.');
    }
  };

  const imgUrl = resolveProfileImage(profile);
  const initials = initialsFromName(profile?.stageName || profile?.user?.name || 'Artist');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('ChoosePath')}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Artist Dashboard</Text>
          <Text style={styles.headerSub}>Manage your bookings</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color="#7c3aed" size="large" style={{ padding: 32 }} />}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              {imgUrl ? (
                <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.heroAvatarImg} />
              ) : (
                <Text style={styles.heroAvatarText}>{initials}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{profile?.stageName || 'Artist'}</Text>
              <Text style={styles.heroBio} numberOfLines={2}>{profile?.bio || 'Complete your profile to get discovered.'}</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{bookings.length}</Text>
              <Text style={styles.heroStatLabel}>Total Gigs</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{pending.length}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          {[
            { icon: Calendar, label: 'Bookings', val: bookings.length, color: '#7c3aed' },
            { icon: Clock, label: 'Pending', val: pending.length, color: '#0ea5e9' },
            { icon: TrendingUp, label: 'Upcoming', val: upcoming.length, color: '#10b981' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <s.icon color={s.color} size={20} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Availability */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>Availability Status</Text>
          <View style={styles.availRow}>
            <TouchableOpacity
              onPress={() => handleAvailability('available')}
              style={[styles.availBtn, availability === 'available' && styles.availBtnActive]}
            >
              <Text style={[styles.availBtnText, availability === 'available' && styles.availBtnTextActive]}>Available</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAvailability('busy')}
              style={[styles.availBtn, availability === 'busy' && styles.availBtnBusy]}
            >
              <Text style={[styles.availBtnText, availability === 'busy' && styles.availBtnTextBusy]}>Busy</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Booking Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Requests</Text>
          {pending.length > 0 ? pending.map((req, i) => (
            <Animated.View key={req._id} entering={FadeInLeft.delay(i * 50).duration(400)} style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <View>
                  <Text style={styles.bookingClient}>{req.user?.name || 'Client'}</Text>
                  <Text style={styles.bookingService}>{req.service}</Text>
                </View>
                <Text style={styles.bookingDate}>{formatDate(req.scheduledDate)}</Text>
              </View>
              <View style={styles.bookingActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleStatus(req._id, 'confirmed')}>
                  <CheckCircle2 color="#fff" size={16} />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleStatus(req._id, 'cancelled')}>
                  <X color="#ccc" size={16} />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )) : (
            <View style={styles.emptyBox}>
              <Calendar color="#888" size={40} />
              <Text style={styles.emptyText}>No pending requests</Text>
            </View>
          )}
        </View>

        {/* Upcoming Gigs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Gigs</Text>
          {upcoming.length > 0 ? upcoming.map((gig, i) => (
            <Animated.View key={gig._id} entering={FadeInLeft.delay(i * 50).duration(400)} style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <View>
                  <Text style={styles.bookingClient}>{gig.service}</Text>
                  <Text style={styles.bookingService}>{profile?.location || 'Location not set'}</Text>
                </View>
              </View>
              <View style={styles.gigMeta}>
                <View style={styles.gigMetaItem}>
                  <Calendar color="#888" size={14} />
                  <Text style={styles.gigMetaText}>{formatDate(gig.scheduledDate)}</Text>
                </View>
                <View style={styles.gigMetaItem}>
                  <Clock color="#888" size={14} />
                  <Text style={styles.gigMetaText}>{formatTime(gig.scheduledDate)}</Text>
                </View>
              </View>
            </Animated.View>
          )) : (
            <View style={styles.emptyBox}>
              <Calendar color="#888" size={40} />
              <Text style={styles.emptyText}>No upcoming gigs</Text>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  content: { paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 14 },
  errorText: { color: '#ef4444', fontSize: 14 },
  heroCard: {
    borderRadius: 24, padding: 22,
    backgroundColor: '#7c3aed',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  heroTop: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  heroAvatar: { width: 72, height: 72, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroAvatarImg: { width: 72, height: 72 },
  heroAvatarText: { color: '#fff', fontWeight: '700', fontSize: 24 },
  heroName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroBio: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  heroStats: { flexDirection: 'row', gap: 12 },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14 },
  heroStatNum: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 2 },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, padding: 14, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#888' },
  card: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 14 },
  availRow: { flexDirection: 'row', gap: 10 },
  availBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  availBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.15)' },
  availBtnBusy: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  availBtnText: { color: '#888', fontWeight: '600', fontSize: 14 },
  availBtnTextActive: { color: '#7c3aed' },
  availBtnTextBusy: { color: '#ef4444' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bookingCard: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 16 },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  bookingClient: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  bookingService: { fontSize: 13, color: '#888' },
  bookingDate: { fontSize: 13, color: '#888' },
  bookingActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, height: 42, borderRadius: 12, backgroundColor: '#7c3aed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  acceptBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  declineBtn: { flex: 1, height: 42, borderRadius: 12, backgroundColor: '#2a2a2a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  declineBtnText: { color: '#ccc', fontWeight: '600', fontSize: 14 },
  gigMeta: { flexDirection: 'row', gap: 16 },
  gigMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  gigMetaText: { color: '#888', fontSize: 13 },
  emptyBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyText: { color: '#888', fontSize: 14 },
});
