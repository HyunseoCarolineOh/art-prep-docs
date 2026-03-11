import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

const UNIVERSITIES = [
  '홍익대학교', '서울대학교', '이화여자대학교', '국민대학교',
  '건국대학교', '경희대학교', '성신여자대학교', '덕성여자대학교',
  '세종대학교', '인하대학교', '아주대학교', '충남대학교',
  '전북대학교', '영남대학교', '기타'
]

const EXAM_TYPES = ['수시', '정시']

const ARTWORK_TYPES = [
  '소묘', '수채화', '유화', '기초디자인',
  '발상과표현', '사고의전환', '색채구성', '입체조형', '기타'
]

type Step = 1 | 2 | 3

export default function GoalsScreen() {
  const [step, setStep] = useState<Step>(1)
  const [university, setUniversity] = useState('')
  const [examType, setExamType] = useState('')
  const [artworkType, setArtworkType] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: user.id,
        target_university: university,
        exam_type: examType,
        artwork_type: artworkType,
      })

    if (error) {
      Alert.alert('오류', '목표 저장에 실패했습니다. 다시 시도해주세요.')
    } else {
      router.replace('/(tabs)')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
        ))}
      </View>

      {step === 1 && (
        <>
          <Text style={styles.title}>목표 대학을 선택해주세요</Text>
          <ScrollView contentContainerStyle={styles.optionGrid}>
            {UNIVERSITIES.map((uni) => (
              <TouchableOpacity
                key={uni}
                style={[styles.option, university === uni && styles.optionSelected]}
                onPress={() => setUniversity(uni)}
              >
                <Text style={[styles.optionText, university === uni && styles.optionTextSelected]}>
                  {uni}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, !university && styles.buttonDisabled]}
            onPress={() => setStep(2)}
            disabled={!university}
          >
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>전형을 선택해주세요</Text>
          <View style={styles.optionGrid}>
            {EXAM_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionLarge, examType === type && styles.optionSelected]}
                onPress={() => setExamType(type)}
              >
                <Text style={[styles.optionTextLarge, examType === type && styles.optionTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.button, !examType && styles.buttonDisabled]}
            onPress={() => setStep(3)}
            disabled={!examType}
          >
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <Text style={styles.backText}>이전</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>실기 유형을 선택해주세요</Text>
          <View style={styles.optionGrid}>
            {ARTWORK_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.option, artworkType === type && styles.optionSelected]}
                onPress={() => setArtworkType(type)}
              >
                <Text style={[styles.optionText, artworkType === type && styles.optionTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.button, (!artworkType || loading) && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={!artworkType || loading}
          >
            <Text style={styles.buttonText}>{loading ? '저장 중...' : '완료'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
            <Text style={styles.backText}>이전</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 60, marginBottom: 32 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: '#000' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  option: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd'
  },
  optionLarge: {
    flex: 1, paddingVertical: 20,
    borderRadius: 12, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center'
  },
  optionSelected: { backgroundColor: '#000', borderColor: '#000' },
  optionText: { fontSize: 14, color: '#333' },
  optionTextLarge: { fontSize: 18, fontWeight: '600', color: '#333' },
  optionTextSelected: { color: '#fff' },
  button: {
    backgroundColor: '#000', borderRadius: 8,
    padding: 16, alignItems: 'center', marginBottom: 12
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', padding: 8 },
  backText: { color: '#999', fontSize: 14 },
})
