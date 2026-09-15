/**
 * Live Cloud Synchronization Engine
 * Handles bidirectional state synchronization between Zustand and Supabase PostgreSQL.
 * Automatically pulls on authentication, pushes mutations, and subscribes to realtime CDC events.
 */

import { supabase, isCloudConfigured } from './supabase'
import { useStore } from '../store'
import type { ScheduleItem, Task, RecurrenceOverride } from './types'

let realtimeSubscription: any = null
let isPulling = false

export async function pullCloudData(userId: string) {
  if (!supabase || !isCloudConfigured || isPulling) return
  isPulling = true

  try {
    const store = useStore.getState()

    // 1. Fetch Schedule Items
    const { data: remoteItems, error: itemsErr } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('user_id', userId)

    if (!itemsErr && remoteItems) {
      const items: ScheduleItem[] = remoteItems.map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        startTime: r.start_time || undefined,
        duration: r.duration,
        date: r.date || undefined,
        recurrence: r.recurrence || undefined,
        preferredStart: r.preferred_start || undefined,
        preferredEnd: r.preferred_end || undefined,
        location: r.location || undefined,
        notes: r.notes || undefined,
        color: r.color,
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
        version: r.version,
      }))

      // Merge remote items with local
      if (items.length > 0) {
        useStore.setState({ items })
      }
    }

    // 2. Fetch Tasks
    const { data: remoteTasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)

    if (!tasksErr && remoteTasks) {
      const tasks: Task[] = remoteTasks.map((r: any) => ({
        id: r.id,
        title: r.title,
        notes: r.notes || undefined,
        priority: r.priority,
        estimate: r.estimate || undefined,
        status: r.status,
        columnId: r.column_id,
        scheduledDate: r.scheduled_date || undefined,
        boardOrder: r.board_order,
        tags: r.tags || undefined,
        fromCapture: r.from_capture,
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
        version: r.version,
      }))

      if (tasks.length > 0) {
        useStore.setState({ tasks })
      }
    }

    // 3. Fetch Overrides
    const { data: remoteOverrides, error: ovErr } = await supabase
      .from('recurrence_overrides')
      .select('*')
      .eq('user_id', userId)

    if (!ovErr && remoteOverrides) {
      const overrides: RecurrenceOverride[] = remoteOverrides.map((r: any) => ({
        id: r.id,
        itemId: r.item_id,
        date: r.date,
        action: r.action,
        newStartTime: r.new_start_time || undefined,
        newDuration: r.new_duration || undefined,
      }))

      if (overrides.length > 0) {
        useStore.setState({ overrides })
      }
    }

    useStore.setState({ syncStatus: 'synced', lastSyncedAt: Date.now() })
  } catch (err) {
    console.warn('Cloud sync pull failed:', err)
    useStore.setState({ syncStatus: 'offline' })
  } finally {
    isPulling = false
  }
}

export async function pushItemToCloud(item: ScheduleItem, userId: string) {
  if (!supabase || !isCloudConfigured) return

  try {
    await supabase.from('schedule_items').upsert({
      id: item.id,
      user_id: userId,
      type: item.type,
      title: item.title,
      start_time: item.startTime || null,
      duration: item.duration,
      date: item.date || null,
      recurrence: item.recurrence || null,
      preferred_start: item.preferredStart || null,
      preferred_end: item.preferredEnd || null,
      location: item.location || null,
      notes: item.notes || null,
      color: item.color,
      version: item.version,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })
  } catch (e) {
    console.warn('Push item error', e)
  }
}

export async function deleteItemFromCloud(itemId: string, userId: string) {
  if (!supabase || !isCloudConfigured) return

  try {
    await supabase.from('schedule_items').delete().eq('id', itemId).eq('user_id', userId)
  } catch (e) {
    console.warn('Delete item error', e)
  }
}

export async function pushTaskToCloud(task: Task, userId: string) {
  if (!supabase || !isCloudConfigured) return

  try {
    await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      notes: task.notes || null,
      priority: task.priority,
      estimate: task.estimate || null,
      status: task.status,
      column_id: task.columnId,
      scheduled_date: task.scheduledDate || null,
      board_order: task.boardOrder,
      tags: task.tags || null,
      from_capture: task.fromCapture || false,
      version: task.version,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    })
  } catch (e) {
    console.warn('Push task error', e)
  }
}

export async function deleteTaskFromCloud(taskId: string, userId: string) {
  if (!supabase || !isCloudConfigured) return

  try {
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId)
  } catch (e) {
    console.warn('Delete task error', e)
  }
}

export function subscribeToRealtime(userId: string) {
  if (!supabase || !isCloudConfigured) return () => {}

  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
  }

  const channel = supabase
    .channel('daydraft-realtime-' + userId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', filter: `user_id=eq.${userId}` },
      () => {
        // Trigger pull to synchronize remote updates across devices
        pullCloudData(userId)
      }
    )
    .subscribe()

  realtimeSubscription = channel
  return () => {
    supabase?.removeChannel(channel)
  }
}
