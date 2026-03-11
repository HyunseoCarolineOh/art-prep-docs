import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#000' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎨</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: '저장함',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>♡</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  )
}
