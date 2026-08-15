import { formatDistanceToNow, format } from 'date-fns'
import clsx, { type ClassValue } from 'clsx'

export const cn = (...values: ClassValue[]) => clsx(values)
export const timeAgo = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true })
export const shortDate = (date: string) => format(new Date(date), 'dd MMM, HH:mm')
export const pct = (value: number) => `${Math.round(value * 100)}%`
export const formatStatus = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file (JPG, PNG or WebP).')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB. Choose a smaller photo.')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('The image could not be read. Please try another file.'))
    reader.readAsDataURL(file)
  })
}
