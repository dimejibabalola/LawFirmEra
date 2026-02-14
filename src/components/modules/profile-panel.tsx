"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  DollarSign,
  Calendar,
  Edit,
  Camera,
} from "lucide-react"
import { UserAvatar, ATTORNEY_AVATARS, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"
import { useAuthStore, mockCurrentUser } from "@/store"
import { cn } from "@/lib/utils"

export function ProfilePanel() {
  const { user } = useAuthStore()
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  const avatarSrc = currentUser.email ? ATTORNEY_AVATARS[currentUser.email] : undefined

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your professional profile</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <Card className="border-gray-200 shadow-sm lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <UserAvatar 
                  email={currentUser.email}
                  name={profile.name}
                  src={avatarSrc}
                  size="xl"
                  showBorder
                  className="size-32"
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-md"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.title}</p>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge className={cn(
                  "capitalize",
                  profile.role === "PARTNER" && "bg-purple-100 text-purple-700",
                  profile.role === "ASSOCIATE" && "bg-blue-100 text-blue-700",
                  profile.role === "PARALEGAL" && "bg-green-100 text-green-700",
                  profile.role === "ADMIN" && "bg-gray-100 text-gray-700",
                )}>
                  {profile.role}
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {profile.department}
                </Badge>
              </div>

              <Separator className="my-6" />

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-xs text-gray-500">Active Matters</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-xs text-gray-500">Hours This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                  <p className="text-xs text-gray-500">Billable Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{currentUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Office Location</p>
                    <p className="font-medium text-gray-900">{profile.officeLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{profile.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.barNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Bar Number</p>
                      <p className="font-medium text-gray-900">{profile.barNumber}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Hourly Rate</p>
                    <p className="font-medium text-gray-900">${profile.hourlyRate}/hr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">Jan 15, 2023</p>
                  </div>
                </div>
              </div>

              {/* Practice Areas */}
              {profile.practiceAreas.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Practice Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.practiceAreas.map((area, i) => (
                      <Badge key={i} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest work across the firm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Logged 5.5 hours", matter: "Merger Agreement - TechStart Inc", time: "2 hours ago" },
                  { action: "Uploaded document", matter: "Smith v. Johnson Corp", time: "4 hours ago" },
                  { action: "Created task", matter: "Williams Family Trust", time: "Yesterday" },
                  { action: "Closed matter", matter: "Estate of Johnson", time: "2 days ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-teal-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.matter}</p>
                    </div>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
