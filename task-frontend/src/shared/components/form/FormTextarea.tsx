import { useId, type ComponentProps, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { FormField } from '@/shared/components/form/FormField'
import { describedBy, makeFieldIds } from '@/shared/components/form/fieldIds'
import { Textarea } from '@/shared/components/ui/textarea'

type FormTextareaProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: ReactNode
  description?: ReactNode
  /** Shows a live "n / max" counter; not enforced via `maxLength` so zod reports the error. */
  maxChars?: number
} & Omit<
  ComponentProps<'textarea'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id'
>

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  maxChars,
  ...textareaProps
}: FormTextareaProps<T>) {
  const ids = makeFieldIds(useId())

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string = field.value ?? ''
        return (
          <FormField
            ids={ids}
            label={label}
            description={description}
            error={fieldState.error}
            aside={
              maxChars ? (
                <span
                  className={
                    value.length > maxChars
                      ? 'text-xs tabular-nums text-destructive'
                      : 'text-xs tabular-nums text-muted-foreground'
                  }
                  aria-hidden
                >
                  {value.length}/{maxChars}
                </span>
              ) : null
            }
          >
            <Textarea
              {...textareaProps}
              {...field}
              value={value}
              id={ids.inputId}
              aria-invalid={fieldState.invalid}
              aria-describedby={describedBy(
                ids,
                Boolean(description),
                fieldState.invalid,
              )}
            />
          </FormField>
        )
      }}
    />
  )
}
