import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator
} from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Artwork } from '../../lib/types'

const FILTERS = ['전체', '소묘', '수채화', '기초디자인', '발상과표현', '서울', '경기인천']
const PAGE_SIZE = 20

export default function HomeScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [activeFilter, setActiveFilter] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userGoal, setUserGoal] = useState<{ artwork_type: string; target_university: string } | null>(null)

  useEffect(() => {
    loadUserGoal()
  }, [])

  useEffect(() => {
    if (userGoal !== null) {
      resetAndLoad()
    }
  }, [activeFilter, userGoal])

  async function loadUserGoal() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_goals')
      .select('artwork_type, target_university')
      .eq('user_id', user.id)
      .single()

    if (!data) {
      router.replace('/(onboarding)/goals')
      return
    }
    setUserGoal(data)

    const { data: saved } = await supabase
      .from('saved_artworks')
      .select('artwork_id')
      .eq('user_id', user.id)
    setSavedIds(new Set(saved?.map(s => s.artwork_id) ?? []))
  }

  async function fetchArtworks(pageNum: number, replace: boolean) {
    if (!userGoal) return
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('artworks').select('*').order('success_score', { ascending: false }).range(from, to)

    const regionFilters = ['서울', '경기인천']
    if (regionFilters.includes(activeFilter)) {
      query = query.eq('region', activeFilter)
    } else if (activeFilter !== '전체') {
      query = query.eq('artwork_type', activeFilter)
    } else {
      query = query.eq('artwork_type', userGoal.artwork_type)
    }

    const { data } = await query
    const items = data ?? []
    setHasMore(items.length === PAGE_SIZE)
    setArtworks(prev => replace ? items : [...prev, ...items])
  }

  async function resetAndLoad() {
    setLoading(true)
    setPage(0)
    await fetchArtworks(0, true)
    setLoading(false)
  }

  async function handleRefresh() {
    setRefreshing(true)
    setPage(0)
    await fetchArtworks(0, true)
    setRefreshing(false)
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    await fetchArtworks(nextPage, false)
    setLoadingMore(false)
  }

  async function toggleSave(artworkId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (savedIds.has(artworkId)) {
      await supabase.from('saved_artworks').delete().match({ user_id: user.id, artwork_id: artworkId })
      setSavedIds(prev => { const s = new Set(prev); s.delete(artworkId); return s })
    } else {
      await supabase.from('saved_artworks').insert({ user_id: user.id, artwork_id: artworkId })
      setSavedIds(prev => new Set(prev).add(artworkId))
    }
  }

  const renderArtwork = useCallback(({ item }: { item: Artwork }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/artwork/${item.id}`)}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardUniversity} numberOfLines={1}>{item.university}</Text>
        <Text style={styles.cardType}>{item.artwork_type}</Text>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={() => toggleSave(item.id)}>
        <Text style={styles.saveIcon}>{savedIds.has(item.id) ? '♥' : '♡'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [savedIds])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 큐레이션</Text>
        {userGoal && (
          <Text style={styles.headerSub}>{userGoal.target_university} · {userGoal.artwork_type}</Text>
        )}
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderArtwork}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  filterList: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 52 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: '#ddd',
    marginHorizontal: 4, backgroundColor: '#fff'
  },
  filterChipActive: { backgroundColor: '#000', borderColor: '#000' },
  filterText: { fontSize: 13, color: '#555' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 8, paddingBottom: 20 },
  row: { justifyContent: 'space-between', paddingHorizontal: 4 },
  card: { width: '48%', marginBottom: 16, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f5f5f5' },
  cardImage: { width: '100%', aspectRatio: 1 },
  cardInfo: { padding: 8 },
  cardUniversity: { fontSize: 13, fontWeight: '600' },
  cardType: { fontSize: 11, color: '#888', marginTop: 2 },
  saveButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 4 },
  saveIcon: { fontSize: 16, color: '#fff' },
  loader: { flex: 1 },
})
