import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function tripCountdown(startDate: string): number {
  return differenceInDays(parseISO(startDate), new Date())
}

export function formatCurrency(amount: number, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  accommodation: 'bg-purple-100 text-purple-700',
  adventure: 'bg-green-100 text-green-700',
  spiritual: 'bg-yellow-100 text-yellow-700',
  shopping: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
}

export const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  accommodation: '🏨',
  adventure: '🧗',
  spiritual: '🛕',
  shopping: '🛍️',
  other: '📌',
}

export const STOP_CATEGORY_ICONS: Record<string, string> = {
  hotel: '🏨',
  restaurant: '🍽️',
  waterfall: '💧',
  cave: '🦇',
  viewpoint: '🏔️',
  market: '🛒',
  temple: '🛕',
  adventure: '🧗',
  transport: '🚗',
  river: '🌊',
  village: '🏡',
  default: '📍',
}
