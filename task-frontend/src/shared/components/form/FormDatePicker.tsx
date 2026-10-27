import { useId, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { FormField } from '@/shared/components/form/FormField'
import { describedBy, makeFieldIds } from '@/shared/components/form/fieldIds'
import { DatePicker } from '@/shared/components/ui/date-picker'

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: ReactNode
  description?: ReactNode
  placeholder?: string
  min?: string
  max?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  min,
  max,
  disabled,
  clearable,
  className,
}: FormDatePickerProps<T>) {
  const ids = makeFieldIds(useId())

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          ids={ids}
          label={label}
          description={description}
          error={fieldState.error}
        >
          <DatePicker
            id={ids.inputId}
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            inputRef={field.ref}
            disabled={disabled}
            placeholder={placeholder}
            clearable={clearable}
            min={min}
            max={max}
            className={className}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy(
              ids,
              Boolean(description),
              Boolean(fieldState.error),
            )}
          />
        </FormField>
      )}
    />
  )
}
