// Shared Tailwind class strings for plain form controls, kept in one place
// so CRUD forms across features look consistent without a component layer.

export const inputClass =
  'rounded-lg border border-muted-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'

export const labelClass = 'flex flex-col gap-1 text-sm font-medium text-muted-700'

export const buttonPrimaryClass =
  'rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100'

export const buttonSecondaryClass =
  'rounded-lg border border-muted-200 bg-white px-4 py-2 text-sm font-medium text-muted-700 shadow-sm transition-all hover:border-muted-300 hover:bg-muted-50 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100'

export const buttonDangerClass =
  'rounded-lg border border-danger-200 px-3 py-1.5 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-60'

export const cardClass =
  'rounded-xl border border-muted-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
