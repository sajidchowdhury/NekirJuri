'use client'

// ============================================================
// useAccountingMode — Hook for managing accounting mode
// CR-8: Simplified Accounting Mode
// Modes: 'double-entry' (default) | 'simplified'
// ============================================================

import { useState, useEffect, useCallback } from 'react'

export type AccountingMode = 'double-entry' | 'simplified'

export function useAccountingMode() {
  const [mode, setMode] = useState<AccountingMode>('double-entry')
  const [loading, setLoading] = useState(true)

  // Fetch current mode on mount
  useEffect(() => {
    async function fetchMode() {
      try {
        const res = await fetch('/api/accounting-mode')
        if (res.ok) {
          const data = await res.json()
          setMode(data.mode === 'simplified' ? 'simplified' : 'double-entry')
        }
      } catch {
        // Default to double-entry on error
      } finally {
        setLoading(false)
      }
    }
    fetchMode()
  }, [])

  const updateMode = useCallback(async (newMode: AccountingMode) => {
    try {
      const res = await fetch('/api/accounting-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      })

      if (res.ok) {
        setMode(newMode)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const isSimplified = mode === 'simplified'
  const isDoubleEntry = mode === 'double-entry'

  return { mode, setMode: updateMode, loading, isSimplified, isDoubleEntry }
}
