import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { enrollmentApi } from '../lib/api';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MyLearning'>;

type Enrollment = {
  _id: string;
  course?: {
    _id: string; title?: string; description?: string;
    lessons?: Array<{ _id: string; title: string }>;
    instructor?: { name?: string };
  };
  completedLessons?: string[];
  status?: string;
};

export function MyLearningScreen() {
  const navigation = useNavigation<Nav>();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    enrollmentApi.myEnrollments().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setEnrollments(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load'))
      .finally(() => setLoading(false));
  }, []);

  const totalLessons = enrollments.reduce((sum, e) => sum + (e.course?.lessons?.length ?? 0), 0);
  const completedCount = enrollments.reduce((sum, e) => sum + (e.completedLessons?.length ?? 0), 0);
  const activeCount = enrollments.filter(e => e.status !== 'completed').length;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Learning</Text>
          <Text style={styles.headerSub}>Your enrolled courses</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(50).duration(350)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalLessons}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#7c3aed" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : enrollments.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyBox}>
            <BookOpen color="#444" size={48} />
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptyText}>Browse teachers and enroll in courses to start learning</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('LearningHome')}>
              <Text style={styles.browseBtnText}>Browse Teachers</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Courses</Text>
            {enrollments.map((enrollment, i) => {
              const course = enrollment.course;
              const totalL = course?.lessons?.length ?? 0;
              const doneL = enrollment.completedLessons?.length ?? 0;
              const progress = totalL > 0 ? doneL / totalL : 0;
              const title = course?.title ?? 'Untitled Course';
              const instructor = course?.instructor?.name ?? 'Unknown';
              return (
                <Animated.View key={enrollment._id} entering={FadeInDown.delay(i * 60 + 100).duration(350)}>
                  <View style={styles.courseCard}>
                    <View style={styles.courseTop}>
                      <View style={styles.courseIconBox}>
                        <BookOpen color="#7c3aed" size={22} />
                      </View>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.courseInstructor}>by {instructor}</Text>
                      </View>
                      {enrollment.status === 'completed' && (
                        <CheckCircle2 color="#22c55e" size={20} />
                      )}
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
                      </View>
                      <Text style={styles.progressLessons}>{doneL}/{totalL}</Text>
                    </View>
                    <Text style={styles.progressPct}>{Math.round(progress * 100)}% complete</Text>
                  </View>
                </Animated.View>
              );
            })}
          </>
        )}
        <View style={{ height: 40 }} />
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#7c3aed', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', paddingHorizontal: 20 },
  browseBtn: { marginTop: 4, backgroundColor: '#7c3aed', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 14 },
  courseCard: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 16, marginBottom: 12 },
  courseTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  courseIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  courseInstructor: { fontSize: 12, color: '#888' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  progressTrack: { flex: 1, height: 6, backgroundColor: '#2a2a2a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#7c3aed', borderRadius: 3 },
  progressLessons: { fontSize: 11, color: '#888', flexShrink: 0 },
  progressPct: { fontSize: 12, color: '#7c3aed', fontWeight: '600' },
});
