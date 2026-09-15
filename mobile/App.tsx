import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useStore } from './src/lib/store'
import { TodayScreen } from './src/screens/TodayScreen'
import { ScheduleScreen } from './src/screens/ScheduleScreen'
import { TasksScreen } from './src/screens/TasksScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { AuthScreen } from './src/screens/AuthScreen'
import { SequentialAddModal } from './src/components/SequentialAddModal'
import { supabase } from './src/lib/supabase'

export default function App() {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const isAddModalOpen = useStore((s) => s.isAddModalOpen)
  const setAddModalOpen = useStore((s) => s.setAddModalOpen)
  const isAuthModalOpen = useStore((s) => s.isAuthModalOpen)
  const setAuthModalOpen = useStore((s) => s.setAuthModalOpen)
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const syncWithCloud = useStore((s) => s.syncWithCloud)

  // Initialize session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || 'Student',
        })
        syncWithCloud()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || 'Student',
        })
        syncWithCloud()
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Main View Area */}
        <View style={styles.screenContainer}>
          {activeTab === 'today' && <TodayScreen />}
          {activeTab === 'schedule' && <ScheduleScreen />}
          {activeTab === 'tasks' && <TasksScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </View>

        {/* Native Bottom Tab Bar */}
        <SafeAreaView edges={['bottom']} style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('today')}
            >
              <Text style={styles.tabIcon}>📅</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'today' && styles.tabLabelActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={styles.tabIcon}>🔄</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'schedule' && styles.tabLabelActive,
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('tasks')}
            >
              <Text style={styles.tabIcon}>⚡</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'tasks' && styles.tabLabelActive,
                ]}
              >
                Tasks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={styles.tabIcon}>⚙️</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'settings' && styles.tabLabelActive,
                ]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Sequential Add Item Modal */}
        <SequentialAddModal
          visible={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
        />

        {/* Auth / Account Modal */}
        <Modal
          visible={isAuthModalOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setAuthModalOpen(false)}
        >
          <AuthScreen />
        </Modal>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#059669',
    fontWeight: '800',
  },
})
