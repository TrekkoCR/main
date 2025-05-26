"use client"
import { Slider } from "@/components/ui/slider"

interface PreferenceItemProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export function PreferenceItem({ label, value, onChange }: PreferenceItemProps) {
  // Convertir el valor de -100 a 100 para representar la preferencia
  // donde 0 es neutral, negativo es menos importante, positivo es más importante
  const displayValue = value > 0 ? `+${value}` : value.toString()
  const valueColor = value === 0 ? "text-neutral-500" : value > 0 ? "text-green-600" : "text-red-600"

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className={`text-sm font-medium ${valueColor}`}>{displayValue}</span>
      </div>
      <Slider value={[value]} min={-100} max={100} step={10} onValueChange={(values) => onChange(values[0])} />
      <div className="flex justify-between text-xs text-neutral-400">
        <span>Menos importante</span>
        <span>Más importante</span>
      </div>
    </div>
  )
}
