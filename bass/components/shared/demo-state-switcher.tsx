'use client'

import { FlaskConical } from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface DemoStateOption {
  value: string
  label: string
}

export function DemoStateSwitcher({
  value,
  onChange,
  options,
  label = '演示状态',
}: {
  value: string
  onChange: (v: string) => void
  options: DemoStateOption[]
  label?: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-dashed border-border bg-muted/60 px-3 py-1.5">
      <FlaskConical className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="hidden text-xs text-muted-foreground sm:inline">{label}</span>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger aria-label={label} size="sm" className="h-7 border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-2">
          <SelectValue>{options.find(option => option.value === value)?.label ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
