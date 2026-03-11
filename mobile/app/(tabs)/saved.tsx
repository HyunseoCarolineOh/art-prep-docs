import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { SavedArtwork } from '../../lib/types'

export default function SavedScreen() {
  const [saved, setSaved] = useState<SavedArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadSaved()
    }, [])
  )

  async function loadSaved() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('saved_artworks')
      .select('*, artworks(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setSaved(data ?? [])
    setLoading(false)
  }

  async function handleUnsave(artworkId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('saved_artworks').delete().match({ user_id: user.id, artwork_id: artworkId })
    setSaved(prev => prev.filter(s => s.artwork_id !== artworkId))
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />

  if (saved.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>저장한 작품이 없습니다.</Text>
        <Text style={styles.emptySubText}>홈에서 마음에 드는 작품을 저장해보세요.</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeButtonText}>홈으로 가기</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>저장함</Text>
      <FlatList
        data={saved}
        keyExtractor={item => item.artwork_id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/artwork/${item.artwork_id}`)}
          >
            <Image source={{ uri: item.artworks?.image_url }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardUniversity} numberOfLines={1}>{item.artworks?.university}</Text>
              <Text style={styles.cardType}>{item.artworks?.artwork_type}</Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => handleUnsave(item.artwork_id)}>
              <Text style={styles.saveIcon}>♥</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  list: { paddingHorizontal: 8, paddingBottom: 20 },
  row: { justifyContent: 'space-between', paddingHorizontal: 4 },
  card: { width: '48%', marginBottom: 16, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f5f5f5' },
  cardImage: { width: '100%', aspectRatio: 1 },
  cardInfo: { padding: 8 },
  cardUniversity: { fontSize: 13, fontWeight: '600' },
  cardType: { fontSize: 11, color: '#888', marginTop: 2 },
  saveButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 4 },
  saveIcon: { fontSize: 16, color: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  homeButton: { backgroundColor: '#000', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  homeButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
