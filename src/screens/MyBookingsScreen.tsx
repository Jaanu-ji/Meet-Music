import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, XCircle, Hourglass } from 'lucide-react-native';
import { bookingsApi } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MyBookings'>;

type Booking = {
  _id: string; service: string; scheduledDate: string;
  message?: string; status?: string; amount?: number;
  artist?: { stageName?: string };
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};
const formatTime = (d: string) => {
  try { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

const statusStyle = (s?: string) => {
  if (s === 'confirmed') return { bg: 'rgba(34,197,94,0.12)', text: '#22c55e' };
  if (s === 'completed') return { bg: 'rgba(236,72,153,0.12)', text: '#ec4899' };
  if (s === 'cancelled') return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' };
  return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' };
};

export function MyBookingsScreen() {
  const navigation = useNavigation<Nav>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(() => {
    bookingsApi.myBookings().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setBookings(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const tabs = [
    { key: 'upcoming'  as const, label: 'Upcoming',  icon: Hourglass,     data: upcoming },
    { key: 'completed' as const, label: 'Completed', icon: CheckCircle2,  data: completed },
    { key: 'cancelled' as const, label: 'Cancelled', icon: XCircle,       data: cancelled },
  ];

  const current = tabs.find(t => t.key === tab)?.data || [];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>Track your reservations</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
            >
              <Icon color={active ? '#fff' : '#888'} size={14} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>{t.data.length}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#7c3aed" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : current.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyBox}>
            <Calendar color="#444" size={48} />
            <Text style={styles.emptyTitle}>No {tab} bookings</Text>
            <Text style={styles.emptyText}>
              {tab === 'upcoming' ? "You don't have any upcoming bookings yet"
                : tab === 'completed' ? "You haven't completed any bookings yet"
                : "You don't have any cancelled bookings"}
            </Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('BrowseArtists')}>
              <Text style={styles.browseBtnText}>Browse Artists</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          current.map((b, i) => {
            const ss = statusStyle(b.status);
            return (
              <Animated.View key={b._id} entering={FadeInDown.delay(i * 60).duration(350)}>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.service}>{b.service}</Text>
                      <Text style={styles.artistName}>with {b.artist?.stageName || 'Artist'}</Text>
                    </View>
                    <View>
                      {b.amount != null && <Text style={styles.amount}>${b.amount}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.statusText, { color: ss.text }]}>
                          {b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar color="#888" size={13} />
                    <Text style={styles.metaText}>{formatDate(b.scheduledDate)}</Text>
                    <Clock color="#888" size={13} />
                    <Text style={styles.metaText}>{formatTime(b.scheduledDate)}</Text>
                  </View>
                  {b.message ? (
                    <View style={styles.msgRow}>
                      <MapPin color="#888" size={13} />
                      <Text style={styles.metaText} numberOfLines={1}>{b.message}</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a' },
  tabActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: '#2a2a2a', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabBadgeText: { fontSize: 11, color: '#888', fontWeight: '700' },
  tabBadgeTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14, marginTop: 20 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', paddingHorizontal: 20 },
  browseBtn: { marginTop: 8, backgroundColor: '#7c3aed', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 18, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardLeft: { flex: 1, marginRight: 12 },
  service: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  artistName: { fontSize: 13, color: '#888' },
  amount: { fontSize: 18, fontWeight: '700', color: '#7c3aed', textAlign: 'right', marginBottom: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end' },
  statusText: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#888', flex: 1 },
});
