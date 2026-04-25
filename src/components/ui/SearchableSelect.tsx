'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface SelectOption {
  label: string
  value: string
  description?: string
}

interface BaseProps {
  options: SelectOption[]
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  error?: string
  label?: string
  className?: string
  emptyText?: string
}

interface SingleProps extends BaseProps {
  multiple?: false
  value: string | undefined
  onChange: (value: string) => void
}

interface MultipleProps extends BaseProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

type SearchableSelectProps = SingleProps | MultipleProps

export function SearchableSelect(props: SearchableSelectProps) {
  const {
    options,
    placeholder = 'Selecciona una opción',
    loading,
    disabled,
    error,
    label,
    className,
    emptyText = 'Sin resultados',
  } = props

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
    )
  }, [options, query])

  const isSelected = (val: string) =>
    props.multiple ? props.value.includes(val) : props.value === val

  const select = (val: string) => {
    if (props.multiple) {
      const exists = props.value.includes(val)
      props.onChange(exists ? props.value.filter((v) => v !== val) : [...props.value, val])
    } else {
      props.onChange(val)
      setOpen(false)
      setQuery('')
    }
  }

  const removeChip = (val: string) => {
    if (props.multiple) props.onChange(props.value.filter((v) => v !== val))
  }

  const displayValue = () => {
    if (props.multiple) return null
    const found = options.find((o) => o.value === props.value)
    return found ? found.label : null
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      setOpen(true)
      e.preventDefault()
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setHighlight((h) => Math.max(h - 1, 0))
      e.preventDefault()
    } else if (e.key === 'Enter') {
      const opt = filtered[highlight]
      if (opt) select(opt.value)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const selectedLabels = props.multiple
    ? options.filter((o) => props.value.includes(o.value))
    : []

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-dark">{label}</label>
      )}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'relative flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary',
          error ? 'border-red-500' : 'border-gray-300',
          disabled && 'cursor-not-allowed bg-gray-50 opacity-70'
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {props.multiple && selectedLabels.length > 0 ? (
            selectedLabels.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {o.label}
                <button
                  type="button"
                  onClick={() => removeChip(o.value)}
                  className="text-primary hover:text-primary-700"
                  aria-label={`Quitar ${o.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : displayValue() ? (
            <span className="text-dark">{displayValue()}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn('text-gray-400 transition', open && 'rotate-180')}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && (
        <div className="relative">
          <div className="absolute z-30 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlight(0)
                }}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto py-1" role="listbox">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                  <Spinner size="sm" /> Cargando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  {emptyText}
                </div>
              ) : (
                filtered.map((opt, idx) => {
                  const selected = isSelected(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => select(opt.value)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm',
                        idx === highlight && 'bg-primary-50',
                        selected && 'font-semibold text-primary'
                      )}
                    >
                      <span>
                        <span className="block">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-xs text-gray-500">
                            {opt.description}
                          </span>
                        )}
                      </span>
                      {selected && <Check size={16} className="text-primary" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
