import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Artwork, AnalysisReport } from '../../lib/types'

export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadArtwork()
  }, [id])

  async function loadArtwork() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: artworkData } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single()
    setArtwork(artworkData)

    const { data: reportData } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('artwork_id', id)
      .single()

    if (reportData) {
      setReport(reportData)
    } else {
      requestAnalysis(artworkData?.image_url)
    }

    if (user) {
      const { data: saved } = await supabase
        .from('saved_artworks')
        .select('artwork_id')
        .match({ user_id: user.id, artwork_id: id })
        .single()
      setIsSaved(!!saved)
    }
  }

  async function requestAnalysis(imageUrl?: string) {
    if (!imageUrl) return
    setLoadingReport(true)
    const { data, error } = await supabase.functions.invoke('analyze-artwork', {
      body: { artwork_id: id, image_url: imageUrl }
    })
    if (error || !data?.success) {
      Alert.alert('분석 오류', '분석을 불러올 수 없습니다. 다시 시도해주세요.')
    } else {
      setReport(data.report)
    }
    setLoadingReport(false)
  }

  async function toggleSave() {
    if (!userId) return
    if (isSaved) {
      await supabase.from('saved_artworks').delete().match({ user_id: userId, artwork_id: id })
      setIsSaved(false)
    } else {
      await supabase.from('saved_artworks').insert({ user_id: userId, artwork_id: id })
      setIsSaved(true)
    }
  }

  if (!artwork) return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: artwork.image_url }} style={styles.image} contentFit="cover" />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={toggleSave}>
          <Text style={styles.saveIcon}>{isSaved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoTag}>{artwork.university}</Text>
        <Text style={styles.infoTag}>{artwork.exam_type}</Text>
        <Text style={styles.infoTag}>{artwork.artwork_type}</Text>
        {artwork.year && <Text style={styles.infoTag}>{artwork.year}년</Text>}
      </View>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>AI 분석 리포트</Text>

        {loadingReport ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>AI가 분석 중입니다...</Text>
          </View>
        ) : report ? (
          <>
            <ReportSection title="1단계 · 출제의도" content={report.intention} />
            <ReportSection title="2단계 · 학교 성향" content={report.school_tendency} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3단계 · 조형요소</Text>
              {report.form_elements && Object.entries({
                구도: report.form_elements.composition,
                형태: report.form_elements.form,
                색채: report.form_elements.color,
                표현력: report.form_elements.expression,
              }).map(([label, el]) => (
                <View key={label} style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>{label}</Text>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreBarFill, { width: `${el.score}%` }]} />
                  </View>
                  <Text style={styles.scoreNumber}>{el.score}점</Text>
                </View>
              ))}
              {report.form_elements && Object.entries({
                구도: report.form_elements.composition,
                형태: report.form_elements.form,
                색채: report.form_elements.color,
                표현력: report.form_elements.expression,
              }).map(([label, el]) => (
                <Text key={`${label}-comment`} style={styles.scoreComment}>
                  {label}: {el.comment}
                </Text>
              ))}
            </View>

            <ReportSection title="4단계 · 평가기준 부합도" content={report.evaluation_fit} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5단계 · 종합 리포트</Text>
              <View style={styles.totalScore}>
                <Text style={styles.totalScoreLabel}>종합 점수</Text>
                <Text style={styles.totalScoreValue}>{report.score}점</Text>
              </View>
              <Text style={styles.sectionContent}>{report.summary}</Text>
              <Text style={styles.improvementTitle}>개선 방향</Text>
              <Text style={styles.sectionContent}>{report.improvement}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noReport}>분석 리포트를 불러올 수 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  )
}

function ReportSection({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1 },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  backIcon: { color: '#fff', fontSize: 18 },
  saveButton: { position: 'absolute', top: 50, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  saveIcon: { color: '#fff', fontSize: 22 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  infoTag: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 13 },
  reportContainer: { padding: 16 },
  reportTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20, padding: 16, backgroundColor: '#fafafa', borderRadius: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  sectionContent: { fontSize: 14, color: '#444', lineHeight: 22 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreLabel: { width: 48, fontSize: 13, color: '#555' },
  scoreBar: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginHorizontal: 8 },
  scoreBarFill: { height: '100%', backgroundColor: '#000', borderRadius: 4 },
  scoreNumber: { width: 36, fontSize: 12, color: '#555', textAlign: 'right' },
  scoreComment: { fontSize: 12, color: '#777', marginBottom: 4 },
  totalScore: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalScoreLabel: { fontSize: 15, fontWeight: '600' },
  totalScoreValue: { fontSize: 24, fontWeight: 'bold' },
  improvementTitle: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20 },
  loadingText: { color: '#666', fontSize: 14 },
  noReport: { color: '#999', fontSize: 14, textAlign: 'center', padding: 20 },
})
