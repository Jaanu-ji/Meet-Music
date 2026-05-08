import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Bell, Calendar, Users, Music, DollarSign } from 'lucide-react-native';
import { notificationsApi } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

type Notification = {
  _id: string; type: string; title: string;
  message: string; read: boolean; createdAt: string;
};

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  booking:  { icon: Calendar,    color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  band:     { icon: Users,       color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  payment:  { icon: DollarSign,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  lesson:   { icon: Music,       color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  system:   { icon: Bell,        color: '#888',    bg: '#1a1a1a'               },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationsApi.list().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setNotifications(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (_) {}
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>{unread > 0 ? `${unread} unread` : 'All caught up'}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#7c3aed" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : notifications.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyBox}>
            <Bell color="#444" size={48} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </Animated.View>
        ) : (
          notifications.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <Animated.View key={n._id} entering={FadeInDown.delay(i * 40).duration(300)}>
                <TouchableOpacity
                  style={[styles.card, !n.read && styles.cardUnread]}
                  onPress={() => markRead(n._id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                    <Icon color={cfg.color} size={22} />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                      {!n.read && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.cardMsg} numberOfLines={2}>{n.message}</Text>
                    <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
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
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  markAllBtn: { fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14, marginTop: 20 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 14, color: '#888' },
  card: { flexDirection: 'row', gap: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 16, marginBottom: 10 },
  cardUnread: { borderColor: 'rgba(124,58,237,0.4)' },
  iconBox: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1, marginRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed', flexShrink: 0 },
  cardMsg: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 6 },
  cardTime: { fontSize: 11, color: '#555' },
});
