import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      Alert.alert('오류', '비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      Alert.alert('회원가입 실패', error.message)
    } else {
      router.replace('/(onboarding)/goals')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <Text style={styles.subtitle}>목표를 설정하고 AI 큐레이션을 시작하세요</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 (8자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '가입 중...' : '회원가입'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 14, marginBottom: 12, fontSize: 16
  },
  button: {
    backgroundColor: '#000', borderRadius: 8,
    padding: 16, alignItems: 'center', marginBottom: 16
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#666', fontSize: 14 },
})
