"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createDefaultBonus,
  createDefaultBonusTier,
  type PaysheetFormValues,
} from "@/lib/paysheet/paysheet-form-schema";
import {
  AMOUNT_TYPE_LABELS,
  BONUS_CALCULATION_LABELS,
  BONUS_TYPE_LABELS,
} from "@/lib/paysheet/paysheet-labels";
import { AmountValueInput, VndInput } from "./paysheet-number-inputs";

function ItemToolbar({
  enabled,
  onEnabledChange,
  onRemove,
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function PaysheetBonusFields({
  control,
}: {
  control: Control<PaysheetFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bonuses",
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => append(createDefaultBonus())}
        >
          <Plus className="size-4 mr-1" />
          Thêm
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Chưa có thưởng
        </p>
      ) : (
        fields.map((field, bonusIndex) => (
          <BonusItem
            key={field.id}
            control={control}
            bonusIndex={bonusIndex}
            onRemove={() => remove(bonusIndex)}
          />
        ))
      )}
    </div>
  );
}

function BonusItem({
  control,
  bonusIndex,
  onRemove,
}: {
  control: Control<PaysheetFormValues>;
  bonusIndex: number;
  onRemove: () => void;
}) {
  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({
    control,
    name: `bonuses.${bonusIndex}.tiers`,
  });

  return (
    <div className="rounded-lg bg-muted/40 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-w-0">
          <FormField
            control={control}
            name={`bonuses.${bonusIndex}.bonusType`}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer w-full bg-background">
                      <SelectValue placeholder="Loại thưởng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BONUS_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`bonuses.${bonusIndex}.calculationType`}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer w-full bg-background">
                      <SelectValue placeholder="Hình thức tính" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BONUS_CALCULATION_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name={`bonuses.${bonusIndex}.enable`}
          render={({ field }) => (
            <ItemToolbar
              enabled={field.value}
              onEnabledChange={field.onChange}
              onRemove={onRemove}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer h-8 text-xs"
            onClick={() => appendTier(createDefaultBonusTier(tierFields.length))}
          >
            <Plus className="size-3 mr-1" />
            Thêm mức
          </Button>
        </div>
        <div className="rounded-md border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead className="w-32">Từ (VND)</TableHead>
                <TableHead className="w-24">Loại</TableHead>
                <TableHead className="w-28">Giá trị</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierFields.map((tierField, tierIndex) => (
                <BonusTierRow
                  key={tierField.id}
                  control={control}
                  bonusIndex={bonusIndex}
                  tierIndex={tierIndex}
                  canRemove={tierFields.length > 1}
                  onRemove={() => removeTier(tierIndex)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function BonusTierRow({
  control,
  bonusIndex,
  tierIndex,
  canRemove,
  onRemove,
}: {
  control: Control<PaysheetFormValues>;
  bonusIndex: number;
  tierIndex: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const rewardType = useWatch({
    control,
    name: `bonuses.${bonusIndex}.tiers.${tierIndex}.rewardType`,
  });

  return (
    <TableRow>
      <TableCell>
        <FormField
          control={control}
          name={`bonuses.${bonusIndex}.tiers.${tierIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  maxLength={100}
                  placeholder={`Mức ${tierIndex + 1}`}
                  className="h-8"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={control}
          name={`bonuses.${bonusIndex}.tiers.${tierIndex}.fromValue`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <VndInput
                  className="h-8"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={control}
          name={`bonuses.${bonusIndex}.tiers.${tierIndex}.rewardType`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer w-full h-8">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(AMOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={control}
          name={`bonuses.${bonusIndex}.tiers.${tierIndex}.rewardValue`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AmountValueInput
                  amountType={rewardType ?? "PERCENTAGE"}
                  className="h-8"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
