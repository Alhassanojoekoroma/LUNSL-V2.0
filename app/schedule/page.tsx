"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react'
import { useAuthStore, useScheduleStore } from '@/lib/store'
import { mockScheduleEntries } from '@/lib/mock-data'
import { DAYS_OF_WEEK, SCHEDULE_TYPES } from '@/lib/constants'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import type { ScheduleEntry, DayOfWeek, ScheduleType } from '@/lib/types'

const scheduleTypeColors: Record<ScheduleType, string> = {
  lecture: 'bg-primary/20 text-primary border-primary/30',
  lab: 'bg-info/20 text-info border-info/30',
  tutorial: 'bg-success/20 text-success border-success/30',
  exam: 'bg-destructive/20 text-destructive border-destructive/30',
  other: 'bg-muted text-muted-foreground border-border',
}

export default function SchedulePage() {
  const { user } = useAuthStore()
  const { entries, setEntries, addEntry, updateEntry, deleteEntry } = useScheduleStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null)
  const [mounted, setMounted] = useState(false)

  // Form state
  const [formDay, setFormDay] = useState<DayOfWeek>('monday')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndTime, setFormEndTime] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formType, setFormType] = useState<ScheduleType>('lecture')

  useEffect(() => {
    setMounted(true)
    if (entries.length === 0) {
      setEntries(mockScheduleEntries)
    }
  }, [entries.length, setEntries])

  if (!mounted || !user) return null

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  const resetForm = () => {
    setFormDay('monday')
    setFormStartTime('')
    setFormEndTime('')
    setFormSubject('')
    setFormLocation('')
    setFormType('lecture')
    setEditingEntry(null)
  }

  const openEditDialog = (entry: ScheduleEntry) => {
    setEditingEntry(entry)
    setFormDay(entry.day)
    setFormStartTime(entry.start_time)
    setFormEndTime(entry.end_time)
    setFormSubject(entry.subject)
    setFormLocation(entry.location || '')
    setFormType(entry.type)
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingEntry) {
      updateEntry(editingEntry.id, {
        day: formDay,
        start_time: formStartTime,
        end_time: formEndTime,
        subject: formSubject,
        location: formLocation,
        type: formType,
      })
    } else {
      const newEntry: ScheduleEntry = {
        id: `sch_${Date.now()}`,
        user_id: user.id,
        day: formDay,
        start_time: formStartTime,
        end_time: formEndTime,
        subject: formSubject,
        location: formLocation,
        type: formType,
        created_at: new Date().toISOString(),
      }
      addEntry(newEntry)
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const getEntriesForDay = (day: DayOfWeek) => {
    return entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  const currentDayName = format(today, 'EEEE').toLowerCase() as DayOfWeek

  return (
    <AppShell title="Schedule">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Weekly Schedule</h1>
            <p className="text-muted-foreground">Manage your class schedule and timetable</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Edit Schedule Entry' : 'Add New Class'}</DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Update your class details' : 'Add a new class to your weekly schedule'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject / Course</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Database Systems"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <Select value={formDay} onValueChange={(v) => setFormDay(v as DayOfWeek)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formType} onValueChange={(v) => setFormType(v as ScheduleType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room 201, Lab 3"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formSubject.trim() || !formStartTime || !formEndTime}>
                  {editingEntry ? 'Update' : 'Add Class'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar Sidebar */}
          <Card className="lg:col-span-1" style={{ boxShadow: 'none' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-0"
              />
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Legend</p>
                <div className="space-y-1">
                  {SCHEDULE_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${scheduleTypeColors[type.value as ScheduleType].split(' ')[0]}`} />
                      <span className="text-xs text-muted-foreground">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <div className="lg:col-span-3 space-y-4">
            {/* Week Navigation */}
            <Card style={{ boxShadow: 'none' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">
                      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </p>
                    <Button variant="link" size="sm" className="text-primary" onClick={() => setSelectedDate(new Date())}>
                      Go to Today
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DAYS_OF_WEEK.slice(0, 6).map((day) => {
                const dayDate = weekDays[DAYS_OF_WEEK.findIndex((d) => d.value === day.value)]
                const isCurrentDay = isSameDay(dayDate, today)
                const dayEntries = getEntriesForDay(day.value as DayOfWeek)

                return (
                  <Card
                    key={day.value}
                    className={isCurrentDay ? 'border-primary/50 bg-primary/5' : ''}
                    style={{ boxShadow: 'none' }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {day.label}
                          {isCurrentDay && (
                            <Badge variant="default" className="ml-2 text-xs">Today</Badge>
                          )}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {format(dayDate, 'MMM d')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dayEntries.length > 0 ? (
                        dayEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`p-3 rounded-lg border ${scheduleTypeColors[entry.type]}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{entry.subject}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                                  <Clock className="w-3 h-3" />
                                  {entry.start_time} - {entry.end_time}
                                </div>
                                {entry.location && (
                                  <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                                    <MapPin className="w-3 h-3" />
                                    {entry.location}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => openEditDialog(entry)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => deleteEntry(entry.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No classes
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Sunday */}
            <Card style={{ boxShadow: 'none' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Sunday
                    {isSameDay(weekDays[6], today) && (
                      <Badge variant="default" className="ml-2 text-xs">Today</Badge>
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(weekDays[6], 'MMM d')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {getEntriesForDay('sunday').length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {getEntriesForDay('sunday').map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg border ${scheduleTypeColors[entry.type]}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{entry.subject}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                              <Clock className="w-3 h-3" />
                              {entry.start_time} - {entry.end_time}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(entry)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No classes scheduled
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
