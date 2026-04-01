'use client'

import Image from 'next/image'
import React from 'react'

interface CustomIconProps {
  name: string
  size?: number
  width?: number
  height?: number
  className?: string
  alt?: string
}

/**
 * Custom SVG Icon Component
 * Maps icon names to custom icons stored in public/icons folder
 * Usage: <CustomIcon name="dashboard" size={24} />
 */
export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  width,
  height,
  className = '',
  alt = name,
}) => {
  const iconPath = `/icons/${name}.svg`
  const w = width || size
  const h = height || size

  return (
    <img
      src={iconPath}
      alt={alt}
      width={w}
      height={h}
      className={`inline-block ${className}`}
      style={{
        width: `${w}px`,
        height: `${h}px`,
      }}
      onError={(e) => {
        console.warn(`Icon not found: ${iconPath}`)
      }}
    />
  )
}

/**
 * Icon name mappings for easy reference
 * Maps logical names to actual SVG file names
 */
export const ICON_NAMES = {
  // Navigation
  DASHBOARD: 'Dashboard Icon',
  BROWSE: 'Browse Courses icon',
  AI_BOT: 'AI bot icon ',
  SCHEDULE: 'Schedule icon ',
  PROGRESS: 'My Progress icon',
  NOTIFICATIONS: 'Notification Icon',
  SETTINGS: 'Setting icon',
  LOGOUT: 'Log out',
  SEARCH: 'Search icon',
  MENU: 'Handboager Menu Icon ',

  // Icons/Badges
  LOGO: 'LUNSL LOGO ICON',
  REFERRAL: 'Referral Program',
  PDF: 'PDF icon to be use for files that are pdf',
  SECURITY: 'Secutity lock icon',
  ID_CARD: 'ID Card Icon',
  AUTH_ID_CARD: 'use this for Auth ID card verification icon ',

  // Learning/Courses
  ACADEMIC: 'Academic icon',
  AI_THINKING: 'Ai thinking icon',
  ENGINEERING: 'Engnierring icon for course ',
  MULTIMEDIA: 'Use this for Multimedia Media course icon',
  SOUND: 'Sound Icon',
  SOUND_ENGINEERING: 'use this for sound enginering course icon',
  CATEGORY: 'To diffrencate content by module or to put them in catogor',
  AI_BACKGROUND: 'Ai icon for ai page Background ',

  // Alternate progress icon
  PROGRESS_ALT: 'My Progress (2)',
} as const

/**
 * Get icon name with proper formatting
 * Handles file naming conventions
 */
export function getIconName(logicalName: (typeof ICON_NAMES)[keyof typeof ICON_NAMES]): string {
  // Return the name as-is since ICON_NAMES already contains the correct file names
  return logicalName
}

/**
 * Custom Icon component with automatic size management
 * Useful for specific use cases like navigation, toolbar, etc.
 */
export const NavIcon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name,
  size = 20,
  className = '',
}) => (
  <CustomIcon
    name={name}
    size={size}
    className={`flex-shrink-0 ${className}`}
  />
)
