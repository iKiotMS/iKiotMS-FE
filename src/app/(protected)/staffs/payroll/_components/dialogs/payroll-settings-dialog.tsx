'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { usePayroll } from '../../_context/payroll-provider'
import { payrollSettingsSchema, type PayrollSettingsFormValues } from '../../_types/payroll.types'
import { WEEKDAYS } from '../../_constants/payroll.constants'

type PayrollSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_SETTINGS: PayrollSettingsFormValues = {
  cycle: 'MONTHLY',
  periodStartDay: 1,
  approveAfterPeriodEndDays: 2,
  payAfterPeriodEndDays: 5,
  autoGenerate: false,
  standardWorkingDays: 26,
  standardWorkingHoursPerDay: 8,
  weekendDays: [0], // Default Sunday
  lateGraceMinutes: 15,
}

export function PayrollSettingsDialog({ open, onOpenChange }: PayrollSettingsDialogProps) {
  const { settings, handleUpdateSettings } = usePayroll()

  const form = useForm<PayrollSettingsFormValues>({
    resolver: zodResolver(payrollSettingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  })

  useEffect(() => {
    if (!open) return
    if (settings) {
      form.reset({
        cycle: settings.cycle || 'MONTHLY',
        periodStartDay: settings.periodStartDay ?? 1,
        approveAfterPeriodEndDays: settings.approveAfterPeriodEndDays ?? 2,
        payAfterPeriodEndDays: settings.payAfterPeriodEndDays ?? 5,
        autoGenerate: !!settings.autoGenerate,
        standardWorkingDays: settings.standardWorkingDays ?? 26,
        standardWorkingHoursPerDay: settings.standardWorkingHoursPerDay ?? 8,
        weekendDays: settings.weekendDays ?? [0],
        lateGraceMinutes: settings.lateGraceMinutes ?? 15,
      })
    } else {
      form.reset(DEFAULT_SETTINGS)
    }
  }, [open, settings, form])

  async function onSubmit(data: PayrollSettingsFormValues) {
    const success = await handleUpdateSettings(data)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cấu hình tính lương</DialogTitle>
          <DialogDescription>
            Thiết lập chu kỳ, ngày công chuẩn và chính sách đi muộn áp dụng cho toàn hệ thống.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chu kỳ lương</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Chọn chu kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Hàng tháng (Monthly)</SelectItem>
                        <SelectItem value="WEEKLY">Hàng tuần (Weekly)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodStartDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu chu kỳ (1-28)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="standardWorkingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày công chuẩn hàng tháng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="standardWorkingHoursPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số giờ làm việc / ca chuẩn</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lateGraceMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đi muộn cho phép (Phút)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoGenerate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Tự động tạo kỳ lương</FormLabel>
                      <div className="text-xs text-muted-foreground">Tự chạy khi hết kỳ</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="approveAfterPeriodEndDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian xét duyệt (Số ngày)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payAfterPeriodEndDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn trả lương sau kỳ (Số ngày)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Weekend days Selection */}
            <FormField
              control={form.control}
              name="weekendDays"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel>Ngày nghỉ cuối tuần</FormLabel>
                  <div className="grid grid-cols-4 gap-2 border p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
                    {WEEKDAYS.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="weekendDays"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(day.value)
                          return (
                            <FormItem
                              key={day.value}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.value])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== day.value)
                                        )
                                  }}
                                />
                              </FormControl>
                              <span className="text-sm font-normal">{day.label}</span>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer">
                <Save className="mr-2 size-4" />
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
