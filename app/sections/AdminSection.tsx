'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FiPackage, FiTruck, FiMapPin, FiAlertCircle, FiCheck, FiFilter, FiUser } from 'react-icons/fi'

interface AdminSectionProps {
  showSample: boolean
}

const sampleMetrics = [
  { label: 'Active Buyers', value: 128, icon: FiPackage, color: 'text-primary' },
  { label: 'Active Suppliers', value: 342, icon: FiTruck, color: 'text-accent' },
  { label: 'Active Hunters', value: 87, icon: FiMapPin, color: 'text-foreground' },
  { label: 'RFQs This Week', value: 56, icon: FiPackage, color: 'text-primary' },
  { label: 'Matches Made', value: 234, icon: FiCheck, color: 'text-accent' },
  { label: 'Stockpiles Claimed', value: 45, icon: FiMapPin, color: 'text-foreground' },
]

const sampleFlagged = [
  { id: 'FL-001', type: 'Listing', user: 'Bad Pallets LLC', reason: 'Misleading grade description', date: '2026-02-28', status: 'pending' },
  { id: 'FL-002', type: 'Quote', user: 'QuickPallet', reason: 'Suspiciously low pricing', date: '2026-02-27', status: 'reviewing' },
  { id: 'FL-003', type: 'Profile', user: 'WoodWorks Co.', reason: 'Duplicate account', date: '2026-02-26', status: 'resolved' },
]

const sampleUsers = [
  { id: 'U-001', name: 'John Turner', email: 'john@acme.com', role: 'buyer', joined: '2026-01-15', status: 'active' },
  { id: 'U-002', name: 'Sarah Mills', email: 'sarah@pacific.com', role: 'supplier', joined: '2026-01-20', status: 'active' },
  { id: 'U-003', name: 'Mike Chen', email: 'mike@freelance.com', role: 'hunter', joined: '2026-02-01', status: 'active' },
  { id: 'U-004', name: 'Lisa Park', email: 'lisa@woodco.com', role: 'supplier', joined: '2026-02-10', status: 'suspended' },
  { id: 'U-005', name: 'Tom Davis', email: 'tom@logistics.com', role: 'buyer', joined: '2026-02-15', status: 'active' },
]

export default function AdminSection({ showSample }: AdminSectionProps) {
  const [roleFilter, setRoleFilter] = useState('all')

  const metrics = showSample ? sampleMetrics : sampleMetrics.map((m) => ({ ...m, value: 0 }))
  const flagged = showSample ? sampleFlagged : []
  const users = showSample ? sampleUsers : []

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)

  const statusColor = (status: string) => {
    if (status === 'active' || status === 'resolved') return 'bg-green-100 text-green-800 border-green-200'
    if (status === 'pending' || status === 'reviewing') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (status === 'suspended') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Marketplace metrics, moderation, and user management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/40 bg-card">
            <CardContent className="pt-4 pb-3 text-center">
              <m.icon className={`w-5 h-5 mx-auto mb-2 ${m.color}`} />
              <p className="font-serif text-2xl font-bold text-foreground">{showSample ? m.value : '--'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showSample && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/40 bg-card">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-2">Weekly RFQ Trend</p>
              <div className="flex items-end gap-1 h-20">
                {[32, 45, 38, 52, 48, 56, 42].map((val, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative" style={{ height: `${(val / 60) * 100}%` }}>
                    <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-sm" style={{ height: `${(val / 60) * 80}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-2">Match Success Rate</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-16 h-16 rounded-full border-4 border-accent flex items-center justify-center">
                  <span className="font-serif text-lg font-bold text-accent">78%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>234 matches from</p>
                  <p>300 RFQs processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-2">User Distribution</p>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-sm bg-primary" style={{ width: '40%' }} />
                  <span className="text-xs text-muted-foreground">Buyers 40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-sm bg-accent" style={{ width: '45%' }} />
                  <span className="text-xs text-muted-foreground">Suppliers 45%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-sm bg-muted-foreground" style={{ width: '15%' }} />
                  <span className="text-xs text-muted-foreground">Hunters 15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-8 border-border/40 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-destructive" />
            <CardTitle className="font-serif text-lg">Flagged Content</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No flagged content. Enable Sample Data to preview.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flagged.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-mono">{item.id}</TableCell>
                    <TableCell className="text-xs">{item.type}</TableCell>
                    <TableCell className="text-xs font-medium">{item.user}</TableCell>
                    <TableCell className="text-xs">{item.reason}</TableCell>
                    <TableCell className="text-xs">{item.date}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusColor(item.status)}`}>{item.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="text-xs h-7">Review</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-primary" />
              <CardTitle className="font-serif text-lg">User Management</CardTitle>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <FiFilter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
                <SelectItem value="hunter">Hunters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users to display. Enable Sample Data to preview.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs font-medium">{user.name}</TableCell>
                    <TableCell className="text-xs">{user.email}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{user.role}</Badge></TableCell>
                    <TableCell className="text-xs">{user.joined}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusColor(user.status)}`}>{user.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
