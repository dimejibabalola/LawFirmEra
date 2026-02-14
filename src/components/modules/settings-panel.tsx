"use client"

import * as React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Calendar,
  Palette,
  Shield,
  Camera,
  Save,
  Key,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"
import { useAuthStore, mockCurrentUser } from "@/store"
import { cn } from "@/lib/utils"

// Mock settings data
const mockFirmSettings = {
  name: "Babalola Tax Law Firm",
  address: "500 Grant Street, Suite 1200",
  city: "Pittsburgh",
  state: "PA",
  zip: "15219",
  phone: "+1 (412) 555-0100",
  email: "contact@babalola.law",
  website: "https://babalola.law",
  taxId: "12-3456789",
  defaultBillingRate: 400,
  invoicePrefix: "INV",
  invoiceNumberFormat: "YYYY-NNNN",
  paymentTerms: "net30",
  lateFeePercentage: 1.5,
}

const mockNotificationSettings = {
  emailNewMatter: true,
  emailDueDates: true,
  emailOverdueInvoices: true,
  emailCourtDeadlines: true,
  emailTaskAssigned: true,
  emailMessages: true,
  pushNewMatter: false,
  pushDueDates: true,
  pushOverdueInvoices: true,
  pushCourtDeadlines: true,
}

const mockCalendarSettings = {
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  defaultMeetingDuration: 30,
  timezone: "America/New_York",
  courtCalendarSync: false,
}

const mockDisplaySettings = {
  theme: "light",
  dateFormat: "MM/DD/YYYY",
  currencyFormat: "USD",
  dashboardView: "overview",
}

// Role permissions
const rolePermissions = {
  partner: {
    label: "Partner",
    permissions: [
      { name: "View all matters", enabled: true },
      { name: "Edit all matters", enabled: true },
      { name: "Delete matters", enabled: true },
      { name: "View billing", enabled: true },
      { name: "Edit billing rates", enabled: true },
      { name: "Approve invoices", enabled: true },
      { name: "Manage clients", enabled: true },
      { name: "Manage users", enabled: true },
      { name: "Access reports", enabled: true },
      { name: "Firm settings", enabled: true },
    ]
  },
  associate: {
    label: "Associate",
    permissions: [
      { name: "View all matters", enabled: true },
      { name: "Edit assigned matters", enabled: true },
      { name: "Delete matters", enabled: false },
      { name: "View billing", enabled: true },
      { name: "Edit billing rates", enabled: false },
      { name: "Approve invoices", enabled: false },
      { name: "Manage clients", enabled: true },
      { name: "Manage users", enabled: false },
      { name: "Access reports", enabled: true },
      { name: "Firm settings", enabled: false },
    ]
  },
  paralegal: {
    label: "Paralegal",
    permissions: [
      { name: "View assigned matters", enabled: true },
      { name: "Edit assigned matters", enabled: true },
      { name: "Delete matters", enabled: false },
      { name: "View billing", enabled: false },
      { name: "Edit billing rates", enabled: false },
      { name: "Approve invoices", enabled: false },
      { name: "Manage clients", enabled: false },
      { name: "Manage users", enabled: false },
      { name: "Access reports", enabled: false },
      { name: "Firm settings", enabled: false },
    ]
  },
  admin: {
    label: "Admin",
    permissions: [
      { name: "View all matters", enabled: true },
      { name: "Edit all matters", enabled: true },
      { name: "Delete matters", enabled: true },
      { name: "View billing", enabled: true },
      { name: "Edit billing rates", enabled: true },
      { name: "Approve invoices", enabled: true },
      { name: "Manage clients", enabled: true },
      { name: "Manage users", enabled: true },
      { name: "Access reports", enabled: true },
      { name: "Firm settings", enabled: true },
    ]
  }
}

export function SettingsPanel() {
  const { user } = useAuthStore()
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  
  const [activeTab, setActiveTab] = useState("personal")
  const [firmSettings, setFirmSettings] = useState(mockFirmSettings)
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings)
  const [calendarSettings, setCalendarSettings] = useState(mockCalendarSettings)
  const [displaySettings, setDisplaySettings] = useState(mockDisplaySettings)
  const [isSaving, setIsSaving] = useState(false)
  
  const isAdmin = currentUser.role === "admin" || currentUser.role === "partner"

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700 text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex flex-wrap gap-1">
          <TabsTrigger value="personal" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="firm" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="mr-2 h-4 w-4" />
              Firm
            </TabsTrigger>
          )}
          <TabsTrigger value="billing" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="display" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="mr-2 h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Personal Settings */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <UserAvatar 
                  email={currentUser.email} 
                  name={profile?.name || currentUser.firstName + " " + currentUser.lastName}
                  size="xl"
                  showBorder
                />
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={currentUser.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={currentUser.lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="email" defaultValue={currentUser.email} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="phone" defaultValue={profile?.phone || currentUser.phone} className="pl-10" />
                  </div>
                </div>
                {profile?.barNumber && (
                  <div className="space-y-2">
                    <Label htmlFor="barNumber">Bar Number</Label>
                    <Input id="barNumber" defaultValue={profile.barNumber} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" defaultValue={profile?.title || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  className="w-full min-h-[100px] rounded-md border border-gray-200 p-3 text-sm"
                  defaultValue={profile?.bio || ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="currentPassword" type="password" className="pl-10" />
                  </div>
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firm Settings */}
        {isAdmin && (
          <TabsContent value="firm" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Firm Information</CardTitle>
                <CardDescription>Manage your firm's details and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="firmName">Firm Name</Label>
                    <Input 
                      id="firmName" 
                      value={firmSettings.name}
                      onChange={(e) => setFirmSettings({...firmSettings, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="firmAddress">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="firmAddress" 
                        value={firmSettings.address}
                        onChange={(e) => setFirmSettings({...firmSettings, address: e.target.value})}
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={firmSettings.city}
                      onChange={(e) => setFirmSettings({...firmSettings, city: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        value={firmSettings.state}
                        onChange={(e) => setFirmSettings({...firmSettings, state: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input 
                        id="zip" 
                        value={firmSettings.zip}
                        onChange={(e) => setFirmSettings({...firmSettings, zip: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmPhone">Phone</Label>
                    <Input 
                      id="firmPhone" 
                      value={firmSettings.phone}
                      onChange={(e) => setFirmSettings({...firmSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firmEmail">Email</Label>
                    <Input 
                      id="firmEmail" 
                      type="email"
                      value={firmSettings.email}
                      onChange={(e) => setFirmSettings({...firmSettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input 
                      id="taxId" 
                      value={firmSettings.taxId}
                      onChange={(e) => setFirmSettings({...firmSettings, taxId: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Billing Configuration</CardTitle>
              <CardDescription>Configure billing rates, invoice formats, and payment terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultRate">Default Hourly Rate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="defaultRate" 
                      type="number"
                      value={firmSettings.defaultBillingRate}
                      onChange={(e) => setFirmSettings({...firmSettings, defaultBillingRate: parseInt(e.target.value)})}
                      className="pl-10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input 
                    id="invoicePrefix" 
                    value={firmSettings.invoicePrefix}
                    onChange={(e) => setFirmSettings({...firmSettings, invoicePrefix: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFormat">Invoice Number Format</Label>
                  <Select 
                    value={firmSettings.invoiceNumberFormat}
                    onValueChange={(value) => setFirmSettings({...firmSettings, invoiceNumberFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-NNNN">2024-0001</SelectItem>
                      <SelectItem value="NNNN-YYYY">0001-2024</SelectItem>
                      <SelectItem value="INV-NNNN">INV-0001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select 
                    value={firmSettings.paymentTerms}
                    onValueChange={(value) => setFirmSettings({...firmSettings, paymentTerms: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="net90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Fee Percentage</Label>
                  <div className="relative">
                    <Input 
                      id="lateFee" 
                      type="number"
                      step="0.1"
                      value={firmSettings.lateFeePercentage}
                      onChange={(e) => setFirmSettings({...firmSettings, lateFeePercentage: parseFloat(e.target.value)})}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attorney Rates */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Attorney Billing Rates</CardTitle>
              <CardDescription>Set individual billing rates for each attorney</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(ATTORNEY_PROFILES).map(([email, profile]) => (
                  <div key={email} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <UserAvatar email={email} name={profile.name} size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-500">{profile.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <Input 
                        type="number" 
                        className="w-24" 
                        defaultValue={profile.hourlyRate}
                      />
                      <span className="text-sm text-gray-500">/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Email Notifications</CardTitle>
              <CardDescription>Choose when you want to receive email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailNewMatter", label: "New matter assigned", desc: "Get notified when a new matter is assigned to you" },
                { key: "emailDueDates", label: "Upcoming due dates", desc: "Reminders for deadlines and due dates" },
                { key: "emailOverdueInvoices", label: "Overdue invoices", desc: "Alerts when invoices become overdue" },
                { key: "emailCourtDeadlines", label: "Court deadlines", desc: "Reminders for court filing deadlines" },
                { key: "emailTaskAssigned", label: "Task assignments", desc: "When a task is assigned to you" },
                { key: "emailMessages", label: "New messages", desc: "When you receive a new message" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, [item.key]: checked})
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Push Notifications</CardTitle>
              <CardDescription>Browser and mobile push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "pushNewMatter", label: "New matter assigned" },
                { key: "pushDueDates", label: "Upcoming due dates" },
                { key: "pushOverdueInvoices", label: "Overdue invoices" },
                { key: "pushCourtDeadlines", label: "Court deadlines" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <Switch 
                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, [item.key]: checked})
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Settings */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Working Hours</CardTitle>
              <CardDescription>Set your default availability for scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="time" 
                      className="pl-10"
                      value={calendarSettings.workingHoursStart}
                      onChange={(e) => setCalendarSettings({...calendarSettings, workingHoursStart: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="time" 
                      className="pl-10"
                      value={calendarSettings.workingHoursEnd}
                      onChange={(e) => setCalendarSettings({...calendarSettings, workingHoursEnd: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <Badge 
                      key={day}
                      variant={calendarSettings.workingDays.includes(day) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer capitalize",
                        calendarSettings.workingDays.includes(day) && "bg-teal-600"
                      )}
                      onClick={() => {
                        const days = calendarSettings.workingDays.includes(day)
                          ? calendarSettings.workingDays.filter(d => d !== day)
                          : [...calendarSettings.workingDays, day]
                        setCalendarSettings({...calendarSettings, workingDays: days})
                      }}
                    >
                      {day.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Meeting Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Meeting Duration</Label>
                  <Select 
                    value={calendarSettings.defaultMeetingDuration.toString()}
                    onValueChange={(value) => setCalendarSettings({...calendarSettings, defaultMeetingDuration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={calendarSettings.timezone}
                    onValueChange={(value) => setCalendarSettings({...calendarSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Court Calendar Sync</p>
                  <p className="text-sm text-gray-500">Sync with court calendar systems</p>
                </div>
                <Switch 
                  checked={calendarSettings.courtCalendarSync}
                  onCheckedChange={(checked) => setCalendarSettings({...calendarSettings, courtCalendarSync: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map((theme) => (
                    <div
                      key={theme.value}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        displaySettings.theme === theme.value 
                          ? "border-teal-600 bg-teal-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setDisplaySettings({...displaySettings, theme: theme.value})}
                    >
                      <theme.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={displaySettings.dateFormat}
                    onValueChange={(value) => setDisplaySettings({...displaySettings, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency Format</Label>
                  <Select 
                    value={displaySettings.currencyFormat}
                    onValueChange={(value) => setDisplaySettings({...displaySettings, currencyFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dashboard Default View</Label>
                  <Select 
                    value={displaySettings.dashboardView}
                    onValueChange={(value) => setDisplaySettings({...displaySettings, dashboardView: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="matters">Matters</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Settings */}
        <TabsContent value="permissions" className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Roles & Permissions</CardTitle>
              <CardDescription>Define what each role can view and edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(rolePermissions).map(([roleKey, role]) => (
                  <div key={roleKey} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize bg-teal-100 text-teal-700">{role.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {role.permissions.map((perm, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md text-sm",
                            perm.enabled ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                          )}
                        >
                          {perm.enabled ? (
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-gray-300" />
                          )}
                          <span className="truncate">{perm.name}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
