export type FormFieldIds = {
  inputId: string
  descriptionId: string
  errorId: string
}

export function makeFieldIds(baseId: string): FormFieldIds {
  return {
    inputId: `${baseId}-input`,
    descriptionId: `${baseId}-description`,
    errorId: `${baseId}-error`,
  }
}

export function describedBy(
  ids: FormFieldIds,
  hasDescription: boolean,
  hasError: boolean,
): string | undefined {
  const parts = [
    hasDescription ? ids.descriptionId : null,
    hasError ? ids.errorId : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}
