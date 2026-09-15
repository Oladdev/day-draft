/**
 * Data Repository Interface
 *
 * Provides an abstraction layer so that the app's persistence can seamlessly
 * switch from LocalStorage to Supabase (or SQLite in Tauri) without touching UI code.
 */

import type { ScheduleItem, Task, RecurrenceOverride, Settings, Category, BoardColumn } from './types'

export interface AppData {
  items: ScheduleItem[]
  tasks: Task[]
  overrides: RecurrenceOverride[]
  categories: Category[]
  boardColumns: BoardColumn[]
  settings: Settings
}

export interface IDataRepository {
  load(): Promise<AppData | null>
  save(data: AppData): Promise<void>
}

const STORAGE_KEY = 'day_draft_data_v3'

export class LocalStorageRepository implements IDataRepository {
  async load(): Promise<AppData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AppData
    } catch (e) {
      console.error('Failed to load from local storage', e)
      return null
    }
  }

  async save(data: AppData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save to local storage', e)
    }
  }
}

export const repository: IDataRepository = new LocalStorageRepository()
