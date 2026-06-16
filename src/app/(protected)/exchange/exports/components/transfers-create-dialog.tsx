'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { stockMovementApi } from '@/lib/api/stock-movement'
import { useTransfers } from './transfers-provider'

const MOCK_LOCATIONS = [
  { _id: 'wh-1', name: 'Kho Trung Tâm', type: 'warehouse' as const },
  { _id: 'br-1', name: 'Chi nhánh Q.1', type: 'branch' as const },
  { _id: 'br-2', name: 'Chi nhánh Q.3', type: 'branch' as const },
]
const MOCK_PRODUCTS = [
  { _id: 'pi-1', name: 'Nước suối Lavie 500ml', sku: 'LAV-500' },
  { _id: 'pi-2', name: 'Coca-Cola 330ml', sku: 'COKE-330' },
  { _id: 'pi-3', name: 'Bánh mì que', sku: 'BMQ-001' },
  { _id: 'pi-4', name: 'Mì gói Hảo Hảo', sku: 'HH-001' },
]

const transferFormSchema = z.object({
  fromLocationId: z.string().min(1, 'Vui lòng chọn kho gửi'),
  toLocationId: z.string().min(1, 'Vui lòng chọn kho nhận'),
  note: z.string().optional(),
  details: z.array(
    z.object({
      productItemId: z.string().min(1, 'Vui lòng chọn hàng hóa'),
      quantity: z.number({ error: 'Nhập số nguyên' }).int().positive('Số lượng phải > 0'),
      note: z.string().optional(),
    })
  ).min(1, 'Cần ít nhất 1 mặt hàng'),
}).refine((d) => d.fromLocationId !== d.toLocationId, {
  message: 'Kho gửi và kho nhận không được trùng nhau',
  path: ['toLocationId'],
})

type TransferFormValues = z.infer<typeof transferFormSchema>

const EMPTY_VALUES: TransferFormValues = {
  fromLocationId: '',
  toLocationId: '',
  note: '',
  details: [{ productItemId: '', quantity: 1, note: '' }],
}

interface TransfersCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransfersCreateDialog({ open, onOpenChange }: TransfersCreateDialogProps) {
  const { fetchTransfers } = useTransfers()

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY_VALUES)
  }, [open, form])

  async function onSubmit(data: TransferFormValues) {
    const fromLoc = MOCK_LOCATIONS.find((l) => l._id === data.fromLocationId)
    const toLoc = MOCK_LOCATIONS.find((l) => l._id === data.toLocationId)
    try {
      await stockMovementApi.createTransfer({
        movementType: 'TRANSFER',
        fromLocationId: data.fromLocationId,
        fromLocationType: fromLoc?.type ?? 'warehouse',
        toLocationId: data.toLocationId,
        toLocationType: toLoc?.type ?? 'branch',
        note: data.note,
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          note: d.note,
        })),
      })
      toast.success('Tạo yêu cầu chuyển kho thành công')
      onOpenChange(false)
      await fetchTransfers()
    } catch {
      toast.error('Không thể tạo yêu cầu, vui lòng thử lại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu chuyển kho</DialogTitle>
          <DialogDescription>Chọn kho gửi, kho nhận và danh sách hàng hóa cần chuyển.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fromLocationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kho / Chi nhánh gửi <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full"><SelectValue placeholder="Chọn kho gửi" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_LOCATIONS.map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="toLocationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kho / Chi nhánh nhận <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full"><SelectValue placeholder="Chọn kho nhận" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_LOCATIONS.map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="note" render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea placeholder="Lý do chuyển kho (tùy chọn)" rows={2} className="resize-none" {...field} />
                </FormControl>
              </FormItem>
            )} />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Danh sách hàng hóa cần chuyển</h3>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => append({ productItemId: '', quantity: 1, note: '' })}>
                  <Plus className="mr-1 size-4" />Thêm dòng
                </Button>
              </div>

              {fields.map((f, idx) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border bg-muted/30">
                  <div className="col-span-5">
                    <FormField control={form.control} name={`details.${idx}.productItemId`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Hàng hóa <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer h-8 text-sm"><SelectValue placeholder="Chọn hàng hóa" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_PRODUCTS.map((p) => (
                              <SelectItem key={p._id} value={p._id}>{p.name} <span className="text-xs text-muted-foreground">({p.sku})</span></SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="col-span-2">
                    <FormField control={form.control} name={`details.${idx}.quantity`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Số lượng <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="0" className="h-8 text-sm" value={field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="col-span-4">
                    <FormField control={form.control} name={`details.${idx}.note`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Ghi chú dòng</FormLabel>
                        <FormControl>
                          <Input placeholder="..." className="h-8 text-sm" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive cursor-pointer" onClick={() => remove(idx)} disabled={fields.length === 1}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="cursor-pointer">
                <Plus className="mr-2 size-4" />
                {form.formState.isSubmitting ? 'Đang tạo...' : 'Tạo yêu cầu chuyển kho'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
