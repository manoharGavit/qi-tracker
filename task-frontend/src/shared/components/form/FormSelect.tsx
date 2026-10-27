import { useId, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { FormField } from '@/shared/components/form/FormField'
import { describedBy, makeFieldIds } from '@/shared/components/form/fieldIds'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export type SelectOption = { value: string; label: ReactNode }

type FormSelectProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: ReactNode
  options: readonly SelectOption[]
  placeholder?: string
  description?: ReactNode
  disabled?: boolean
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select an option',
  description,
  disabled,
}: FormSelectProps<T>) {
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
          <Select
            name={field.name}
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              ref={field.ref}
              id={ids.inputId}
              onBlur={field.onBlur}
              className="w-full"
              aria-invalid={fieldState.invalid}
              aria-describedby={describedBy(
                ids,
                Boolean(description),
                fieldState.invalid,
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  )
}
