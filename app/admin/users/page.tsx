'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/store'

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'students' | 'lecturers' | 'admins'>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  const mockUsers = [
    {
      id: 1,
      name: 'Ayo Sesay',
      email: 'ayo.sesay@student.lusl.edu.sl',
      role: 'student',
      faculty: 'FICT',
      status: 'active',
      joined: '2026-01-15',
    },
    {
      id: 2,
      name: 'Dr. Sarah Williams',
      email: 'sarah.williams@lusl.edu.sl',
      role: 'lecturer',
      faculty: 'FICT',
      status: 'active',
      joined: '2025-09-20',
    },
    {
      id: 3,
      name: 'Mary Koroma',
      email: 'mary.koroma@student.lusl.edu.sl',
      role: 'student',
      faculty: 'FCMB',
      status: 'active',
      joined: '2026-02-10',
    },
    {
      id: 4,
      name: 'Prof. David Bangura',
      email: 'david.bangura@lusl.edu.sl',
      role: 'lecturer',
      faculty: 'FICT',
      status: 'inactive',
      joined: '2025-08-01',
    },
  ]

  const filteredUsers = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'students') return matchSearch && u.role === 'student'
    if (filter === 'lecturers') return matchSearch && u.role === 'lecturer'
    if (filter === 'admins') return matchSearch && u.role === 'admin'
    return matchSearch
  })

  return (
    <AppShell title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {mockUsers.length} users
            </p>
          </div>
          <Button>Add New User</Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All ({mockUsers.length})</TabsTrigger>
                <TabsTrigger value="students">
                  Students ({mockUsers.filter((u) => u.role === 'student').length})
                </TabsTrigger>
                <TabsTrigger value="lecturers">
                  Lecturers ({mockUsers.filter((u) => u.role === 'lecturer').length})
                </TabsTrigger>
                <TabsTrigger value="admins">Admins (1)</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Faculty</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Joined</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{u.faculty}</td>
                      <td className="p-4">
                        <Badge
                          variant={u.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{u.joined}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Shield className="w-4 h-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
