"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  CheckSquare,
  Clock,
  Calendar,
  Tag,
  Trash2,
  Edit,
  Filter,
  Search,
  AlertCircle,
  Users
} from 'lucide-react'
import { useAuthStore, useTasksStore } from '@/lib/store'
import { mockTasks } from '@/lib/mock-data'
import { PRIORITY_COLORS } from '@/lib/constants'
import { format, formatDistanceToNow, parseISO, differenceInHours, isAfter } from 'date-fns'
import type { Task, TaskPriority, TaskStatus } from '@/lib/types'

export default function TasksPage() {
  const { user } = useAuthStore()
  const { tasks, setTasks, addTask, updateTask, deleteTask } = useTasksStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium')
  const [formTags, setFormTags] = useState('')

  useEffect(() => {
    setMounted(true)
    if (tasks.length === 0) {
      setTasks(mockTasks)
    }
  }, [tasks.length, setTasks])

  if (!mounted || !user) return null

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormDeadline('')
    setFormPriority('medium')
    setFormTags('')
    setEditingTask(null)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDescription(task.description || '')
    setFormDeadline(task.deadline ? task.deadline.split('T')[0] : '')
    setFormPriority(task.priority)
    setFormTags(task.tags.join(', '))
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean)

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle,
        description: formDescription,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
        priority: formPriority,
        tags: tagsArray,
        updated_at: new Date().toISOString(),
      })
    } else {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        user_id: user.id,
        title: formTitle,
        description: formDescription,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
        priority: formPriority,
        status: 'pending',
        tags: tagsArray,
        collaborators: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addTask(newTask)
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const toggleTaskStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
    updateTask(task.id, { status: newStatus, updated_at: new Date().toISOString() })
  }

  const getDeadlineInfo = (deadline: string) => {
    const deadlineDate = parseISO(deadline)
    const hoursLeft = differenceInHours(deadlineDate, new Date())
    const isOverdue = hoursLeft < 0

    return {
      isOverdue,
      hoursLeft,
      text: isOverdue 
        ? 'Overdue' 
        : hoursLeft < 24 
        ? `${hoursLeft}h left` 
        : formatDistanceToNow(deadlineDate, { addSuffix: true }),
      color: isOverdue || hoursLeft < 24 
        ? 'text-destructive' 
        : hoursLeft < 72 
        ? 'text-warning' 
        : 'text-muted-foreground'
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress')
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed')

  const TaskCard = ({ task }: { task: Task }) => {
    const priorityColor = PRIORITY_COLORS[task.priority]
    const deadlineInfo = task.deadline ? getDeadlineInfo(task.deadline) : null

    return (
      <Card className={`${task.status === 'completed' ? 'opacity-60' : ''}`} style={{ boxShadow: 'none' }}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => toggleTaskStatus(task)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-medium text-foreground ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <Badge className={`${priorityColor.bg} ${priorityColor.text} border-0 capitalize`}>
                  {task.priority}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  {deadlineInfo && (
                    <span className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {deadlineInfo.text}
                    </span>
                  )}
                  {task.collaborators.length > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {task.collaborators.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(task)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AppShell title="Task Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
            <p className="text-muted-foreground">Manage your assignments, projects, and study tasks</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update your task details' : 'Add a new task to your list'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add task details..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formPriority} onValueChange={(v) => setFormPriority(v as TaskPriority)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., Assignment, Programming, Exam"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formTitle.trim()}>
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card style={{ boxShadow: 'none' }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{inProgressTasks.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card style={{ boxShadow: 'none' }}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{completedTasks.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending tasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="mt-4 space-y-3">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks in progress</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No completed tasks</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
