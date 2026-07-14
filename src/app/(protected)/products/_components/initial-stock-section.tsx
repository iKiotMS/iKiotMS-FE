'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormLabel } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export type LocationOption = { value: string; label: string }
export type StockLocation = { locationId: string; locationType: 'branch' | 'warehouse' }

const SELECT_ALL = '__all__'

function LocationMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  selectAllLabel,
}: {
  options: LocationOption[]
  value: string[]
  onChange: (ids: string[]) => void
  placeholder: string
  searchPlaceholder: string
  selectAllLabel: string
}) {
  const [open, setOpen] = useState(false)
  const selectedSet = new Set(value)
  const allSelected = options.length > 0 && options.every((o) => selectedSet.has(o.value))

  function toggle(id: string) {
    onChange(selectedSet.has(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  function toggleAll() {
    onChange(allSelected ? [] : options.map((o) => o.value))
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id))
  }

  function getLabel(id: string) {
    return options.find((o) => o.value === id)?.label ?? id
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn(
            'w-full min-h-9 h-auto justify-start gap-1.5 flex-wrap font-normal px-3 py-2',
            value.length === 0 && 'text-muted-foreground',
          )}
        >
          {value.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            value.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(id)
                }}
              >
                {getLabel(id)}
                <X className="size-3" />
              </Badge>
            ))
          )}
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Không tìm thấy địa điểm.</CommandEmpty>
            <CommandGroup>
              <CommandItem value={SELECT_ALL} onSelect={toggleAll}>
                <Check className={cn('mr-2 size-4', allSelected ? 'opacity-100' : 'opacity-0')} />
                {selectAllLabel}
              </CommandItem>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                  <Check
                    className={cn('mr-2 size-4', selectedSet.has(o.value) ? 'opacity-100' : 'opacity-0')}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type Props = {
  branchOptions: LocationOption[]
  warehouseOptions: LocationOption[]
  value: StockLocation[]
  onChange: (value: StockLocation[]) => void
}

// Shared "Tồn kho ban đầu" picker used by both the product-create dialog (first
// item) and the standalone product-item dialog (add variant) — branch and
// warehouse are picked independently, each with its own "select all".
export function InitialStockSection({ branchOptions, warehouseOptions, value, onChange }: Props) {
  const hasLocations = branchOptions.length > 0 || warehouseOptions.length > 0
  const branchSelected = value.filter((s) => s.locationType === 'branch').map((s) => s.locationId)
  const warehouseSelected = value.filter((s) => s.locationType === 'warehouse').map((s) => s.locationId)

  function setBranchSelected(ids: string[]) {
    const rest = value.filter((s) => s.locationType !== 'branch')
    onChange([...ids.map((locationId) => ({ locationId, locationType: 'branch' as const })), ...rest])
  }

  function setWarehouseSelected(ids: string[]) {
    const rest = value.filter((s) => s.locationType !== 'warehouse')
    onChange([...rest, ...ids.map((locationId) => ({ locationId, locationType: 'warehouse' as const }))])
  }

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div>
          <FormLabel>Tồn kho ban đầu</FormLabel>
          <p className="text-xs text-muted-foreground mt-0.5">Tùy chọn</p>
        </div>
        {!hasLocations ? (
          <p className="text-xs text-muted-foreground">
            Chưa có chi nhánh hoặc kho. Vui lòng tạo trước để nhập tồn kho.
          </p>
        ) : (
          <div className="space-y-3">
            {branchOptions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Chi nhánh</span>
                <LocationMultiSelect
                  options={branchOptions}
                  value={branchSelected}
                  onChange={setBranchSelected}
                  placeholder="Chọn chi nhánh..."
                  searchPlaceholder="Tìm chi nhánh..."
                  selectAllLabel="Chọn tất cả chi nhánh"
                />
              </div>
            )}
            {warehouseOptions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Kho</span>
                <LocationMultiSelect
                  options={warehouseOptions}
                  value={warehouseSelected}
                  onChange={setWarehouseSelected}
                  placeholder="Chọn kho..."
                  searchPlaceholder="Tìm kho..."
                  selectAllLabel="Chọn tất cả kho"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
