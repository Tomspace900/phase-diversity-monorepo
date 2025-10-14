import React, { useState, useMemo } from 'react'
import { type ValidationResult } from '../utils/validation'

export interface ParamInputProps {
  label: string
  value: number | string
  onChange: (value: number | string) => void
  unit?: string
  type?: 'number' | 'text' | 'select'
  options?: string[]
  min?: number
  max?: number
  step?: number
  tooltip?: string
  placeholder?: string
  required?: boolean
  validation?: ValidationResult
  className?: string
  disabled?: boolean
}

const ParamInput: React.FC<ParamInputProps> = ({
  label,
  value,
  onChange,
  unit,
  type = 'number',
  options = [],
  min,
  max,
  step,
  tooltip,
  placeholder,
  required = false,
  validation,
  className = '',
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const rawValue = e.target.value

    if (type === 'number') {
      // Support scientific notation (e.g., 5.5e-7)
      const numValue = parseFloat(rawValue)
      onChange(isNaN(numValue) ? rawValue : numValue)
    } else {
      onChange(rawValue)
    }
  }

  // Determine border color based on validation state (memoized)
  const baseInputClass = useMemo(() => {
    let borderClass = 'border-gray-600 focus:ring-science-blue focus:border-science-blue'

    if (validation) {
      if (!validation.isValid) {
        borderClass = 'border-red-500 focus:ring-red-500 focus:border-red-500'
      } else if (validation.warning) {
        borderClass = 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500'
      } else {
        borderClass = 'border-green-500 focus:ring-green-500 focus:border-green-500'
      }
    }

    return `
      flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg
      focus:outline-none focus:ring-2 transition
      disabled:opacity-50 disabled:cursor-not-allowed
      ${borderClass}
    `.trim()
  }, [validation])

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label with optional tooltip and required indicator */}
      <div className="flex items-center mb-1">
        <label className="block text-sm font-medium text-gray-200">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>

        {tooltip && (
          <div className="relative ml-2">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-science-accent transition"
              aria-label="Show tooltip"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Tooltip popup */}
            {showTooltip && (
              <div className="absolute left-6 top-0 z-10 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg border border-gray-700">
                {tooltip}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input field with optional unit */}
      <div className="flex items-center">
        {type === 'select' ? (
          <select
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={baseInputClass}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClass}
          />
        )}

        {unit && (
          <span className="ml-2 text-sm text-gray-400 whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>

      {/* Validation messages */}
      {validation && (
        <div className="mt-1 space-y-1">
          {/* Error message */}
          {!validation.isValid && validation.error && (
            <p className="text-xs text-red-400 flex items-start">
              <span className="mr-1">❌</span>
              <span>{validation.error}</span>
            </p>
          )}

          {/* Warning message */}
          {validation.isValid && validation.warning && (
            <p className="text-xs text-yellow-400 flex items-start">
              <span className="mr-1">⚠️</span>
              <span>{validation.warning}</span>
            </p>
          )}

          {/* Helper text (always shown if present) */}
          {validation.helperText && (
            <p className="text-xs text-gray-400 flex items-start">
              <span className="mr-1">ℹ️</span>
              <span>{validation.helperText}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ParamInput
