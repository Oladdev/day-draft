import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useStore } from '../lib/store'
import type { ItemType, TaskPriority } from '../lib/types'
import { ITEM_TYPE_LABEL, ITEM_TYPE_EMOJI, DAY_SHORT } from '../lib/types'
import { todayISO, addDaysISO } from '../lib/time'

interface SequentialAddModalProps {
  visible: boolean
  onClose: () => void
}

type Step = 'category' | 'details' | 'timing'

export function SequentialAddModal({ visible, onClose }: SequentialAddModalProps) {
  const addItem = useStore((s) => s.addItem)
  const addTask = useStore((s) => s.addTask)
  const activeDate = useStore((s) => s.date)

  const [step, setStep] = useState<Step>('category')
  const [selectedCategory, setSelectedCategory] = useState<ItemType | 'task'>('class')

  // Details State
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  // Timing State
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState('60')
  const [preferredWindow, setPreferredWindow] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly'>('weekly')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]) // Mon, Wed, Fri by default

  const resetForm = () => {
    setStep('category')
    setSelectedCategory('class')
    setTitle('')
    setLocation('')
    setNotes('')
    setPriority('medium')
    setStartTime('09:00')
    setDuration('60')
    setPreferredWindow('morning')
    setRecurrenceType('weekly')
    setSelectedDays([1, 3, 5])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCategorySelect = (cat: ItemType | 'task') => {
    setSelectedCategory(cat)
    setStep('details')
  }

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex))
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort())
    }
  }

  const handleSave = () => {
    if (!title.trim()) return

    const dur = parseInt(duration, 10) || 45

    if (selectedCategory === 'task') {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        estimate: dur,
        priority,
        status: 'todo',
        scheduledDate: activeDate,
        columnId: 'todo',
      })
    } else {
      let prefStart: string | undefined
      let prefEnd: string | undefined

      if (selectedCategory === 'routine' || selectedCategory === 'reading') {
        if (preferredWindow === 'morning') {
          prefStart = '07:00'
          prefEnd = '12:00'
        } else if (preferredWindow === 'afternoon') {
          prefStart = '12:00'
          prefEnd = '17:00'
        } else {
          prefStart = '17:00'
          prefEnd = '22:00'
        }
      }

      addItem({
        type: selectedCategory,
        title: title.trim(),
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        duration: dur,
        startTime: (selectedCategory === 'class' || selectedCategory === 'meeting' || selectedCategory === 'event') ? startTime : undefined,
        preferredStart: prefStart,
        preferredEnd: prefEnd,
        color: selectedCategory === 'class' ? 'blue' : selectedCategory === 'routine' ? 'emerald' : 'amber',
        date: recurrenceType === 'none' ? activeDate : undefined,
        recurrence:
          recurrenceType === 'none'
            ? undefined
            : recurrenceType === 'daily'
            ? { type: 'daily' }
            : { type: 'weekly', days: selectedDays },
      })
    }

    handleClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Header with Step Indicator */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              {step === 'category' && 'Step 1 of 3 · Select Category'}
              {step === 'details' && 'Step 2 of 3 · Core Details'}
              {step === 'timing' && 'Step 3 of 3 · Timing & Repeat'}
            </Text>
          </View>
          {step !== 'category' ? (
            <TouchableOpacity
              onPress={() => setStep(step === 'timing' ? 'details' : 'category')}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 'category' && (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.headline}>What do you want to add?</Text>
            <Text style={styles.subhead}>
              Select the kind of commitment to configure its parameters.
            </Text>

            <View style={styles.cardGrid}>
              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: '#3b82f6' }]}
                onPress={() => handleCategorySelect('class')}
              >
                <Text style={styles.cardEmoji}>📚</Text>
                <Text style={styles.cardTitle}>Class / Lecture</Text>
                <Text style={styles.cardDesc}>Fixed lecture, tutorial, lab or recurring academic course</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: '#10b981' }]}
                onPress={() => handleCategorySelect('routine')}
              >
                <Text style={styles.cardEmoji}>🔄</Text>
                <Text style={styles.cardTitle}>Routine / Habit</Text>
                <Text style={styles.cardDesc}>Flexible daily rhythm auto-placed into ideal gaps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: '#6366f1' }]}
                onPress={() => handleCategorySelect('meeting')}
              >
                <Text style={styles.cardEmoji}>👥</Text>
                <Text style={styles.cardTitle}>Meeting / Discussion</Text>
                <Text style={styles.cardDesc}>Study group, advisor session, or project standup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: '#f59e0b' }]}
                onPress={() => handleCategorySelect('reading')}
              >
                <Text style={styles.cardEmoji}>📖</Text>
                <Text style={styles.cardTitle}>Deep Reading</Text>
                <Text style={styles.cardDesc}>Focused paper breakdown or textbook chapter study</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryCard, { borderColor: '#ec4899' }]}
                onPress={() => handleCategorySelect('task')}
              >
                <Text style={styles.cardEmoji}>⚡</Text>
                <Text style={styles.cardTitle}>Action Task</Text>
                <Text style={styles.cardDesc}>Discrete actionable deliverable or assignment to finish</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* STEP 2: DETAILS */}
        {step === 'details' && (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.headline}>Item Details</Text>
            <Text style={styles.subhead}>
              {selectedCategory === 'task' ? 'Task details and priority' : `Configure your ${selectedCategory}`}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder={selectedCategory === 'class' ? 'e.g. Advanced Operating Systems (CSC 401)' : 'e.g. Write Chapter 3 Draft'}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            {selectedCategory !== 'task' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Location / Room / Zoom Link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Science Complex Lab 4 or meet.google.com"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            )}

            {selectedCategory === 'task' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.pillsRow}>
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pill, priority === p && styles.pillActive]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[styles.pillText, priority === p && styles.pillTextActive]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes / Syllabus / Objectives</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional notes, reading references, or reminders..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, !title.trim() && styles.disabledButton]}
              disabled={!title.trim()}
              onPress={() => setStep('timing')}
            >
              <Text style={styles.primaryButtonText}>Continue to Timing →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: TIMING & RECURRENCE */}
        {step === 'timing' && (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.headline}>Timing & Recurrence</Text>
            <Text style={styles.subhead}>Define when and how often this happens.</Text>

            {/* Fixed Time Items */}
            {(selectedCategory === 'class' || selectedCategory === 'meeting' || selectedCategory === 'event') && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Start Time (24h format)</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
              </View>
            )}

            {/* Routine Preferred Window */}
            {(selectedCategory === 'routine' || selectedCategory === 'reading') && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Preferred Time Window</Text>
                <View style={styles.pillsRow}>
                  {(['morning', 'afternoon', 'evening'] as const).map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.pill, preferredWindow === w && styles.pillActive]}
                      onPress={() => setPreferredWindow(w)}
                    >
                      <Text style={[styles.pillText, preferredWindow === w && styles.pillTextActive]}>
                        {w.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration (Minutes)</Text>
              <View style={styles.pillsRow}>
                {['25', '45', '60', '90', '120'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, duration === d && styles.pillActive]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.pillText, duration === d && styles.pillTextActive]}>{d}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurrence (Only for Schedule Items) */}
            {selectedCategory !== 'task' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recurrence Pattern</Text>
                <View style={styles.pillsRow}>
                  {(['none', 'daily', 'weekly'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.pill, recurrenceType === r && styles.pillActive]}
                      onPress={() => setRecurrenceType(r)}
                    >
                      <Text style={[styles.pillText, recurrenceType === r && styles.pillTextActive]}>
                        {r === 'none' ? 'One-off' : r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {recurrenceType === 'weekly' && (
                  <View style={[styles.pillsRow, { marginTop: 12 }]}>
                    {DAY_SHORT.map((name, idx) => {
                      const isSelected = selectedDays.includes(idx)
                      return (
                        <TouchableOpacity
                          key={name}
                          style={[styles.dayPill, isSelected && styles.dayPillActive]}
                          onPress={() => toggleDay(idx)}
                        >
                          <Text style={[styles.dayPillText, isSelected && styles.dayPillTextActive]}>
                            {name}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>✓ Save to Schedule</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '700',
  },
  stepPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  body: {
    padding: 20,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  cardGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dayPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
})
