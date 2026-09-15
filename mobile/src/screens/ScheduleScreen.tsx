import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useStore } from '../lib/store'
import { DAY_NAMES, DAY_SHORT } from '../lib/types'
import { to12h, fmtDur, todayISO } from '../lib/time'
import { ITEM_TYPE_COLORS } from '../lib/colors'

export function ScheduleScreen() {
  const items = useStore((s) => s.items)
  const deleteItem = useStore((s) => s.deleteItem)
  const skipOccurrence = useStore((s) => s.skipOccurrence)
  const activeDate = useStore((s) => s.date)
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())

  // Filter items that occur on this day of week
  const dayItems = items.filter((it) => {
    if (it.deleted) return false
    if (!it.recurrence) return true
    if (it.recurrence.type === 'daily') return true
    if (it.recurrence.type === 'weekly') {
      return (it.recurrence.days ?? []).includes(selectedDay)
    }
    return false
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Commitments</Text>
        <Text style={styles.headerSub}>
          Master recurring timetable for classes and daily rhythms
        </Text>
      </View>

      {/* Day Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScroll}
      >
        {DAY_SHORT.map((shortName, idx) => {
          const isSelected = selectedDay === idx
          return (
            <TouchableOpacity
              key={shortName}
              style={[styles.dayChip, isSelected && styles.dayChipActive]}
              onPress={() => setSelectedDay(idx)}
            >
              <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                {shortName}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{DAY_NAMES[selectedDay]}'s Schedule</Text>
        <Text style={styles.itemCount}>{dayItems.length} recurring items</Text>
      </View>

      {/* Items list */}
      <ScrollView contentContainerStyle={styles.list}>
        {dayItems.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No recurring commitments on this day.</Text>
          </View>
        ) : (
          dayItems.map((item) => {
            const scheme = ITEM_TYPE_COLORS[item.type]
            return (
              <View
                key={item.id}
                style={[styles.card, { borderLeftColor: scheme.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: scheme.badgeBg }]}>
                    <Text style={[styles.badgeText, { color: scheme.badgeText }]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.recurrenceLabel}>
                    {item.recurrence?.type === 'daily' ? 'Repeats Daily' : 'Repeats Weekly'}
                  </Text>
                </View>

                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.metaRow}>
                  {item.startTime ? (
                    <Text style={styles.metaTime}>
                      🕒 {to12h(parseInt(item.startTime.split(':')[0], 10) * 60 + parseInt(item.startTime.split(':')[1], 10))} ({fmtDur(item.duration)})
                    </Text>
                  ) : (
                    <Text style={styles.metaTime}>
                      ✨ Flexible ({fmtDur(item.duration)})
                    </Text>
                  )}
                  {item.location && <Text style={styles.metaLoc}>📍 {item.location}</Text>}
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={() => skipOccurrence(item.id, activeDate)}
                  >
                    <Text style={styles.skipBtnText}>Skip Today</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
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
  daysScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  dayChipActive: {
    backgroundColor: '#059669',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
  },
  itemCount: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 60,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recurrenceLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  metaTime: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  metaLoc: {
    fontSize: 12,
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  skipBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffe4e6',
    borderRadius: 8,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#be123c',
  },
})
