import { formatDistanceToNow, format } from 'date-fns'
import clsx, { type ClassValue } from 'clsx'

export const cn = (...values: ClassValue[]) => clsx(values)
export const timeAgo = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true })
export const shortDate = (date: string) => format(new Date(date), 'dd MMM, HH:mm')
export const pct = (value: number) => `${Math.round(value * 100)}%`
export const formatStatus = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const publicAsset = (path: string) => /^(data:|blob:|https?:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('The media could not be read. Please try another file.'))
    reader.readAsDataURL(file)
  })
}

export async function mediaFileToDataUrl(file: File): Promise<string> {
  const supported = file.type.startsWith('image/') || file.type === 'video/mp4' || file.type === 'video/webm'
  if (!supported) throw new Error('Choose a JPG, PNG, WebP, MP4 or WebM report file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Media is larger than 8 MB. Choose a smaller photo or shorter video.')
  return readFileAsDataUrl(file)
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Cleanup evidence must be a JPG, PNG or WebP image.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB. Choose a smaller photo.')
  return readFileAsDataUrl(file)
}
