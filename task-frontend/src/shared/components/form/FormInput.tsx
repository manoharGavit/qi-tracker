import { useId, type ComponentProps, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { FormField } from '@/shared/components/form/FormField'
import { describedBy, makeFieldIds } from '@/shared/components/form/fieldIds'
import { Input } from '@/shared/components/ui/input'

type FormInputProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: ReactNode
  description?: ReactNode
} & Omit<
  ComponentProps<'input'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id'
>

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...inputProps
}: FormInputProps<T>) {
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
          <Input
            {...inputProps}
            {...field}
            value={field.value ?? ''}
            id={ids.inputId}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy(
              ids,
              Boolean(description),
              fieldState.invalid,
            )}
          />
        </FormField>
      )}
    />
  )
}
