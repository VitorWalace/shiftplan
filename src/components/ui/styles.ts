// Shared Tailwind class strings for plain form controls, kept in one place
// so CRUD forms across features look consistent without a component layer.

export const inputClass =
  'rounded-md border border-muted-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

export const labelClass = 'flex flex-col gap-1 text-sm font-medium text-muted-700'

export const buttonPrimaryClass =
  'rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60'

export const buttonSecondaryClass =
  'rounded-md border border-muted-200 px-4 py-2 text-sm font-medium text-muted-700 hover:bg-muted-100 disabled:opacity-60'

export const buttonDangerClass =
  'rounded-md border border-danger-200 px-3 py-1.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-60'

export const cardClass = 'rounded-xl border border-muted-200 bg-white p-4 shadow-sm'
