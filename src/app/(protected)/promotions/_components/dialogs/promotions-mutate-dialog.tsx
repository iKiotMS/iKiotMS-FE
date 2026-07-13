// [Dialog – Mutate Promotion]
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Pencil, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { Promotion } from '@/types/promotion'
import { promotionFormSchema, type PromotionFormValues } from '../../_types/promotion.types'
import { usePromotions } from '../../_context/promotions-provider'
import { branchApi } from '@/lib/api/branch'
import { categoryApi } from '@/lib/api/category'
import { productApi } from '@/lib/api/product'

type Option = { value: string; label: string }

function RuleTargetsMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
}: {
  options: Option[]
  value: string[]
  onChange: (v: string[]) => void
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
}) {
  const [open, setOpen] = useState(false)
  const selected = new Set(value)

  function toggle(id: string) {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
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
                  toggle(id)
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
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                  <Check
                    className={cn('mr-2 size-4', selected.has(o.value) ? 'opacity-100' : 'opacity-0')}
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

const EMPTY_VALUES: PromotionFormValues = {
  promoName: '',
  description: '',
  branchId: null,
  discountType: 'PERCENT',
  discountValue: 0,
  maxDiscountAmount: null,
  minOrderValue: 0,
  applicableRuleType: 'all',
  categoryIds: [],
  productItemIds: [],
  startDate: '',
  endDate: '',
  priority: 0,
  stackable: false,
  usageLimit: null,
  usageLimitPerCustomer: null,
  status: 'ACTIVE',
}

const ALL_BRANCHES = '__all__'

type PromotionsMutateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Promotion
}

function toDateInputValue(iso?: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function PromotionsMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: PromotionsMutateDialogProps) {
  const isEdit = !!currentRow
  const { handleAdd, handleEdit } = usePromotions()
  const [branchOptions, setBranchOptions] = useState<Option[]>([])
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([])
  const [productItemOptions, setProductItemOptions] = useState<Option[]>([])

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    branchApi
      .getList({ limit: 100 })
      .then((res) => setBranchOptions(res.data.map((b) => ({ value: b._id, label: b.name }))))
      .catch(() => setBranchOptions([]))
    categoryApi
      .getList({ limit: 200 })
      .then((res) => setCategoryOptions(res.data.map((c) => ({ value: c.id, label: c.name }))))
      .catch(() => setCategoryOptions([]))
    productApi
      .getList({ limit: 200 })
      .then((res) =>
        setProductItemOptions(
          res.data.flatMap(
            (p) =>
              p.items?.map((item) => ({
                value: item.id,
                label: `${p.name} — ${item.sku}`,
              })) ?? [],
          ),
        ),
      )
      .catch(() => setProductItemOptions([]))
  }, [open])

  useEffect(() => {
    if (!open) return
    if (isEdit && currentRow) {
      form.reset({
        promoName: currentRow.promoName,
        description: currentRow.description || '',
        branchId: currentRow.branchId ?? null,
        discountType: currentRow.discountType,
        discountValue: currentRow.discountValue,
        maxDiscountAmount: currentRow.maxDiscountAmount ?? null,
        minOrderValue: currentRow.minOrderValue,
        applicableRuleType: currentRow.applicableRule.type,
        categoryIds: currentRow.applicableRule.categoryIds ?? [],
        productItemIds: currentRow.applicableRule.productItemIds ?? [],
        startDate: toDateInputValue(currentRow.startDate),
        endDate: toDateInputValue(currentRow.endDate),
        priority: currentRow.priority,
        stackable: currentRow.stackable,
        usageLimit: currentRow.usageLimit ?? null,
        usageLimitPerCustomer: currentRow.usageLimitPerCustomer ?? null,
        status: currentRow.status,
      })
    } else {
      form.reset(EMPTY_VALUES)
    }
  }, [open, isEdit, currentRow, form])

  const discountType = form.watch('discountType')
  const applicableRuleType = form.watch('applicableRuleType')

  async function onSubmit(data: PromotionFormValues) {
    const success =
      isEdit && currentRow ? await handleEdit(currentRow.id, data) : await handleAdd(data)
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin chương trình khuyến mãi. Nhấn Lưu khi hoàn tất.'
              : 'Điền thông tin chương trình khuyến mãi mới. Nhấn Lưu khi hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="promoName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên chương trình <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giảm giá mùa hè" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chương trình"
                      className="resize-none"
                      rows={2}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại giảm giá</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENT">Giảm theo %</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Giảm số tiền cố định</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá trị giảm {discountType === 'PERCENT' ? '(%)' : '(VND)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={discountType === 'PERCENT' ? 100 : undefined}
                        {...field}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber
                          field.onChange(isNaN(val) ? 0 : val)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {discountType === 'PERCENT' && (
              <FormField
                control={form.control}
                name="maxDiscountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức giảm tối đa (VND, để trống nếu không giới hạn)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị đơn tối thiểu (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber
                          field.onChange(isNaN(val) ? 0 : val)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Áp dụng cho chi nhánh</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === ALL_BRANCHES ? null : v)}
                      value={field.value ?? ALL_BRANCHES}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ALL_BRANCHES}>Toàn hệ thống</SelectItem>
                        {branchOptions.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="applicableRuleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phạm vi áp dụng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toàn bộ sản phẩm</SelectItem>
                      <SelectItem value="category">Theo danh mục</SelectItem>
                      <SelectItem value="product">Theo sản phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {applicableRuleType === 'category' && (
              <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục áp dụng</FormLabel>
                    <FormControl>
                      <RuleTargetsMultiSelect
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn danh mục..."
                        searchPlaceholder="Tìm danh mục..."
                        emptyLabel="Không tìm thấy danh mục."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {applicableRuleType === 'product' && (
              <FormField
                control={form.control}
                name="productItemIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm áp dụng</FormLabel>
                    <FormControl>
                      <RuleTargetsMultiSelect
                        options={productItemOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn sản phẩm..."
                        searchPlaceholder="Tìm sản phẩm..."
                        emptyLabel="Không tìm thấy sản phẩm."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber
                          field.onChange(isNaN(val) ? 0 : val)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stackable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="mb-0">Cho phép cộng dồn</FormLabel>
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
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn lượt dùng (để trống nếu không giới hạn)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageLimitPerCustomer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn lượt dùng / khách hàng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? null : Number(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Đang chạy</SelectItem>
                        <SelectItem value="INACTIVE">Đã tắt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm khuyến mãi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
