import { ref } from 'vue'

export interface LogEntry {
  id: string
  action: string
  target: string
  detail: string
  timestamp: number
}

const STORAGE_KEY = 'admin_activity_log'
const MAX_ENTRIES = 200

function loadLog(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLog(entries: LogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

const entries = ref<LogEntry[]>(loadLog())

export function useActivityLog() {
  const log = (action: string, target: string, detail: string = '') => {
    const entry: LogEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      action,
      target,
      detail,
      timestamp: Date.now()
    }
    entries.value = [entry, ...entries.value].slice(0, MAX_ENTRIES)
    saveLog(entries.value)
  }

  const clear = () => {
    entries.value = []
    saveLog([])
  }

  const reload = () => {
    entries.value = loadLog()
  }

  return { entries, log, clear, reload }
}
