import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { UserGoal } from '../../lib/types'

export default function SettingsScreen() {
  const [goal, setGoal] = useState<UserGoal | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEmail(user.email ?? '')

    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setGoal(data)
  }

  async function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace('/(auth)/login')
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 목표</Text>
        {goal ? (
          <View style={styles.goalCard}>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>목표 대학</Text>
              <Text style={styles.goalValue}>{goal.target_university}</Text>
            </View>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>전형</Text>
              <Text style={styles.goalValue}>{goal.exam_type}</Text>
            </View>
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>실기 유형</Text>
              <Text style={styles.goalValue}>{goal.artwork_type}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noGoal}>목표가 설정되지 않았습니다.</Text>
        )}
        <TouchableOpacity style={styles.changeButton} onPress={() => router.push('/(onboarding)/goals')}>
          <Text style={styles.changeButtonText}>목표 변경</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <Text style={styles.emailText}>{email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 },
  section: { paddingHorizontal: 20, paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 12, textTransform: 'uppercase' },
  goalCard: { backgroundColor: '#f8f8f8', borderRadius: 10, padding: 16, marginBottom: 12 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  goalLabel: { fontSize: 14, color: '#666' },
  goalValue: { fontSize: 14, fontWeight: '600' },
  noGoal: { color: '#999', fontSize: 14, marginBottom: 12 },
  changeButton: {
    borderWidth: 1, borderColor: '#000', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center'
  },
  changeButtonText: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16, marginHorizontal: 20 },
  emailText: { fontSize: 14, color: '#333', marginBottom: 16 },
  logoutButton: { borderWidth: 1, borderColor: '#ff3b30', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  logoutText: { fontSize: 15, color: '#ff3b30', fontWeight: '600' },
})
