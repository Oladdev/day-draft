import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useStore } from '../lib/store'
import { layoutDay } from '../lib/schedule'
import { todayISO, addDaysISO, prettyDate, longDate, fmtDur, to12h } from '../lib/time'
import { ITEM_TYPE_COLORS } from '../lib/colors'

export function TodayScreen() {
  const items = useStore((s) => s.items)
  const tasks = useStore((s) => s.tasks)
  const overrides = useStore((s) => s.overrides)
  const settings = useStore((s) => s.settings)
  const activeDate = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const setAddModalOpen = useStore((s) => s.setAddModalOpen)
  const startFocus = useStore((s) => s.startFocus)
  const toggleTaskDone = useStore((s) => s.toggleTaskDone)

  const isToday = activeDate === todayISO()

  const layout = useMemo(
    () => layoutDay(items, activeDate, settings, overrides),
    [items, activeDate, settings, overrides]
  )

  const todayTasks = tasks.filter((t) => t.scheduledDate === activeDate)

  return (
    <SafeAreaView style={styles.container}>
      {/* Date Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDate(addDaysISO(activeDate, -1))}
          style={styles.navBtn}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setDate(todayISO())} style={styles.dateCenter}>
          <View style={styles.dateTitleRow}>
            <Text style={styles.dateTitle}>{isToday ? 'Today' : prettyDate(activeDate)}</Text>
            {isToday && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateSubtitle}>{longDate(activeDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDate(addDaysISO(activeDate, 1))}
          style={styles.navBtn}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Capacity Strip */}
      <View style={styles.capacityBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Committed</Text>
          <Text style={styles.metricValue}>{fmtDur(layout.committedMin)}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Free Window</Text>
          <Text
            style={[
              styles.metricValue,
              { color: layout.freeMin < 60 ? '#d97706' : '#059669' },
            ]}
          >
            {fmtDur(layout.freeMin)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Day Load</Text>
          <Text
            style={[
              styles.metricValue,
              { color: layout.capacityPct > 100 ? '#e11d48' : '#0f172a' },
            ]}
          >
            {layout.capacityPct}%
          </Text>
        </View>
      </View>

      {/* Main Schedule List */}
      <ScrollView contentContainerStyle={styles.scrollList}>
        {layout.placed.length === 0 && todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>Nothing scheduled yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the button below to add your first class, routine, or study task.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setAddModalOpen(true)}
            >
              <Text style={styles.emptyBtnText}>+ Add First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Placed Schedule Items */}
            {layout.placed.map((item) => {
              const scheme = ITEM_TYPE_COLORS[item.type]
              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, { borderLeftColor: scheme.border }]}
                >
                  <View style={styles.itemHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: scheme.badgeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: scheme.badgeText },
                        ]}
                      >
                        {item.type.toUpperCase()}
                      </Text>
                    </View>
                    {item.isRoutinePlaced && (
                      <View style={styles.routinePill}>
                        <Text style={styles.routinePillText}>✨ Auto-fitted</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.itemTitle}>{item.title}</Text>

                  <View style={styles.itemMetaRow}>
                    <Text style={styles.itemTime}>
                      🕒 {to12h(item.startMin)} – {to12h(item.endMin)} ({fmtDur(item.durationMin)})
                    </Text>
                    {item.location && (
                      <Text style={styles.itemLocation}>📍 {item.location}</Text>
                    )}
                  </View>

                  {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.focusBtn}
                      onPress={() =>
                        startFocus(item.item.id, 'item', item.title, item.durationMin)
                      }
                    >
                      <Text style={styles.focusBtnText}>🔥 Focus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}

            {/* Planned Tasks For Today */}
            {todayTasks.map((t) => {
              const isDone = t.status === 'done'
              return (
                <View
                  key={t.id}
                  style={[
                    styles.itemCard,
                    styles.taskCard,
                    isDone && styles.taskDoneCard,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.taskBadge}>
                      <Text style={styles.taskBadgeText}>TASK</Text>
                    </View>
                    <View
                      style={[
                        styles.priorityPill,
                        t.priority === 'high' && styles.priorityHigh,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          t.priority === 'high' && styles.priorityHighText,
                        ]}
                      >
                        {t.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.itemTitle,
                      isDone && styles.taskDoneTitle,
                    ]}
                  >
                    {t.title}
                  </Text>

                  {t.estimate && (
                    <Text style={styles.itemTime}>⏱ {fmtDur(t.estimate)} planned</Text>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.checkBtn, isDone && styles.checkBtnDone]}
                      onPress={() => toggleTaskDone(t.id)}
                    >
                      <Text style={styles.checkBtnText}>
                        {isDone ? '✓ Completed' : 'Mark Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddBtn}
        onPress={() => setAddModalOpen(true)}
      >
        <Text style={styles.floatingAddText}>+ Add Item</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navBtn: {
    padding: 8,
  },
  navArrow: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '700',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  liveBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  dateSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  capacityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 90,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  routinePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  routinePillText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  itemMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  itemTime: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  itemLocation: {
    fontSize: 12,
    color: '#64748b',
  },
  itemNotes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  focusBtn: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  focusBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  taskCard: {
    borderLeftColor: '#059669',
  },
  taskDoneCard: {
    opacity: 0.6,
    backgroundColor: '#f8fafc',
  },
  taskBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskBadgeText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  priorityHigh: {
    backgroundColor: '#ffe4e6',
  },
  priorityHighText: {
    color: '#be123c',
  },
  taskDoneTitle: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  checkBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkBtnDone: {
    backgroundColor: '#dcfce7',
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#059669',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  floatingAddText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
})
