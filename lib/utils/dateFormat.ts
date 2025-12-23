export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
