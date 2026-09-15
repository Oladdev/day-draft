import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useStore } from '../lib/store'
import { fmtDur, todayISO } from '../lib/time'
import type { TaskPriority } from '../lib/types'

export function TasksScreen() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTaskDone = useStore((s) => s.toggleTaskDone)
  const deleteTask = useStore((s) => s.deleteTask)
  const activeDate = useStore((s) => s.date)

  const [filter, setFilter] = useState<'all' | 'today' | 'done'>('all')
  const [quickTitle, setQuickTitle] = useState('')

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return
    addTask({
      title: quickTitle.trim(),
      priority: 'medium',
      status: 'todo',
      scheduledDate: filter === 'today' ? activeDate : undefined,
      columnId: 'todo',
    })
    setQuickTitle('')
  }

  const filteredTasks = tasks.filter((t) => {
    if (t.deleted) return false
    if (filter === 'done') return t.status === 'done'
    if (filter === 'today') return t.scheduledDate === activeDate && t.status !== 'done'
    return t.status !== 'done'
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Board & Backlog</Text>
        <Text style={styles.headerSub}>Action items, assignments, and study projects</Text>
      </View>

      {/* Quick Task Capture */}
      <View style={styles.captureContainer}>
        <TextInput
          style={styles.captureInput}
          placeholder="⚡ Quick capture new task..."
          value={quickTitle}
          onChangeText={setQuickTitle}
          onSubmitEditing={handleQuickAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.captureBtn, !quickTitle.trim() && styles.captureBtnDisabled]}
          onPress={handleQuickAdd}
          disabled={!quickTitle.trim()}
        >
          <Text style={styles.captureBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'today', 'done'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' && `Active (${tasks.filter((t) => t.status !== 'done').length})`}
              {f === 'today' && `Today (${tasks.filter((t) => t.scheduledDate === activeDate && t.status !== 'done').length})`}
              {f === 'done' && `Done (${tasks.filter((t) => t.status === 'done').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={styles.list}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No tasks in this section.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'done'
            return (
              <View key={t.id} style={[styles.card, isDone && styles.cardDone]}>
                <TouchableOpacity
                  style={[styles.checkbox, isDone && styles.checkboxDone]}
                  onPress={() => toggleTaskDone(t.id)}
                >
                  {isDone && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <View style={styles.cardContent}>
                  <Text style={[styles.title, isDone && styles.titleDone]}>{t.title}</Text>

                  <View style={styles.tagRow}>
                    <View
                      style={[
                        styles.priorityPill,
                        t.priority === 'high' && styles.priorityHigh,
                        t.priority === 'low' && styles.priorityLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          t.priority === 'high' && styles.priorityHighText,
                        ]}
                      >
                        {t.priority.toUpperCase()}
                      </Text>
                    </View>

                    {t.estimate && (
                      <Text style={styles.estimateText}>⏱ {fmtDur(t.estimate)}</Text>
                    )}

                    {t.scheduledDate && (
                      <Text style={styles.scheduledText}>📅 {t.scheduledDate}</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteTask(t.id)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  captureInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  captureBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  captureBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  captureBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#0f172a',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  emptyView: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  cardDone: {
    opacity: 0.6,
    backgroundColor: '#f8fafc',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priorityPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  priorityHigh: {
    backgroundColor: '#ffe4e6',
  },
  priorityLow: {
    backgroundColor: '#f8fafc',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  priorityHighText: {
    color: '#be123c',
  },
  estimateText: {
    fontSize: 11,
    color: '#64748b',
  },
  scheduledText: {
    fontSize: 11,
    color: '#0284c7',
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
})
