import type { ReactNode } from 'react'
import type { FieldError as RhfFieldError } from 'react-hook-form'
import type { FormFieldIds } from '@/shared/components/form/fieldIds'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field'

type FormFieldProps = {
  ids: FormFieldIds
  label: ReactNode
  description?: ReactNode
  error?: RhfFieldError
  aside?: ReactNode
  children: ReactNode
}

/** Shared label / description / error chrome for the RHF field wrappers. */
export function FormField({
  ids,
  label,
  description,
  error,
  aside,
  children,
}: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel htmlFor={ids.inputId}>{label}</FieldLabel>
        {aside}
      </div>
      {children}
      {description ? (
        <FieldDescription id={ids.descriptionId}>{description}</FieldDescription>
      ) : null}
      <FieldError id={ids.errorId} errors={[error]} />
    </Field>
  )
}
