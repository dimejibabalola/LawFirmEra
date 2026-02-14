"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Attorney avatar mapping
export const ATTORNEY_AVATARS: Record<string, string> = {
  "john.doe@lawfirm.com": "/avatars/john_doe.png",
  "sarah.johnson@lawfirm.com": "/avatars/sarah_johnson.png",
  "michael.chen@lawfirm.com": "/avatars/michael_chen.png",
  "david.brown@lawfirm.com": "/avatars/david_brown.png",
  "emily.williams@lawfirm.com": "/avatars/default.png",
}

export const ATTORNEY_PROFILES: Record<string, {
  name: string
  role: string
  title: string
  department: string
  phone: string
  barNumber?: string
  hourlyRate: number
  bio: string
  practiceAreas: string[]
  officeLocation: string
}> = {
  "john.doe@lawfirm.com": {
    name: "John Doe",
    role: "PARTNER",
    title: "Managing Partner",
    department: "Corporate Law",
    phone: "+1 (555) 123-4567",
    barNumber: "NY123456",
    hourlyRate: 550,
    bio: "John Doe is the founding partner of the firm with over 25 years of experience in corporate law, mergers and acquisitions, and complex business transactions. He has successfully represented Fortune 500 companies and emerging businesses alike.",
    practiceAreas: ["Corporate Law", "M&A", "Securities", "Business Transactions"],
    officeLocation: "New York, NY",
  },
  "sarah.johnson@lawfirm.com": {
    name: "Sarah Johnson",
    role: "ASSOCIATE",
    title: "Senior Associate",
    department: "Litigation",
    phone: "+1 (555) 234-5678",
    barNumber: "NY234567",
    hourlyRate: 425,
    bio: "Sarah Johnson specializes in commercial litigation and dispute resolution. She has successfully argued cases in federal and state courts, with a particular focus on contract disputes and business torts.",
    practiceAreas: ["Litigation", "Dispute Resolution", "Commercial Litigation"],
    officeLocation: "New York, NY",
  },
  "michael.chen@lawfirm.com": {
    name: "Michael Chen",
    role: "PARALEGAL",
    title: "Senior Paralegal",
    department: "Corporate Law",
    phone: "+1 (555) 345-6789",
    hourlyRate: 175,
    bio: "Michael Chen provides essential support to the corporate law team, with expertise in document management, legal research, and case preparation. He is certified in multiple legal software platforms.",
    practiceAreas: ["Corporate Law", "Document Management", "Legal Research"],
    officeLocation: "New York, NY",
  },
  "emily.williams@lawfirm.com": {
    name: "Emily Williams",
    role: "ASSOCIATE",
    title: "Associate",
    department: "Estate Planning",
    phone: "+1 (555) 456-7890",
    barNumber: "NY345678",
    hourlyRate: 350,
    bio: "Emily Williams focuses on estate planning, trusts, and wealth transfer strategies. She helps clients protect their assets and ensure smooth transitions for future generations.",
    practiceAreas: ["Estate Planning", "Trusts", "Wealth Transfer", "Probate"],
    officeLocation: "New York, NY",
  },
  "david.brown@lawfirm.com": {
    name: "David Brown",
    role: "ADMIN",
    title: "System Administrator",
    department: "Administration",
    phone: "+1 (555) 567-8901",
    hourlyRate: 0,
    bio: "David Brown manages the firm's technology infrastructure and administrative systems. He ensures smooth operations across all departments and implements process improvements.",
    practiceAreas: [],
    officeLocation: "New York, NY",
  },
}

interface UserAvatarProps {
  email?: string
  name?: string
  src?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showBorder?: boolean
}

const sizeClasses = {
  xs: "size-6",
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
  xl: "size-16",
}

const textSizes = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
}

export function UserAvatar({ 
  email, 
  name, 
  src, 
  size = "md", 
  className,
  showBorder = false 
}: UserAvatarProps) {
  const avatarSrc = src || (email ? ATTORNEY_AVATARS[email] : undefined)
  
  // Get initials from name
  const getInitials = () => {
    if (name) {
      const parts = name.split(" ")
      return parts.length >= 2 
        ? `${parts[0][0]}${parts[1][0]}` 
        : name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        "rounded-full object-cover",
        showBorder && "ring-2 ring-white ring-offset-2 ring-offset-gray-100",
        className
      )}
    >
      <AvatarImage 
        src={avatarSrc} 
        alt={name || email || "User"} 
        className="object-cover"
      />
      <AvatarFallback 
        className={cn(
          "rounded-full bg-teal-100 text-teal-700 font-semibold",
          textSizes[size]
        )}
      >
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  )
}

// Component to show user name with avatar
interface UserNameWithAvatarProps {
  email?: string
  name?: string
  src?: string
  size?: "xs" | "sm" | "md" | "lg"
  showRole?: boolean
  role?: string
  className?: string
  avatarClassName?: string
}

export function UserNameWithAvatar({
  email,
  name,
  src,
  size = "sm",
  showRole = false,
  role,
  className,
  avatarClassName,
}: UserNameWithAvatarProps) {
  const profile = email ? ATTORNEY_PROFILES[email] : null
  const displayName = name || profile?.name || email?.split("@")[0] || "Unknown"
  const displayRole = role || profile?.role
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserAvatar 
        email={email} 
        name={displayName} 
        src={src} 
        size={size}
        className={avatarClassName}
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate">
          {displayName}
        </span>
        {showRole && displayRole && (
          <span className="text-xs text-gray-500 capitalize">
            {displayRole.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  )
}
