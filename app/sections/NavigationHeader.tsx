'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiPackage, FiUser } from 'react-icons/fi'

export type PageView = 'landing' | 'buyer' | 'supplier' | 'hunter' | 'directory' | 'messaging' | 'admin'
export type UserRole = 'buyer' | 'supplier' | 'hunter'

interface NavigationHeaderProps {
  currentPage: PageView
  setCurrentPage: (page: PageView) => void
  userRole: UserRole
  setUserRole: (role: UserRole) => void
}

const roleColors: Record<UserRole, string> = {
  buyer: 'bg-primary text-primary-foreground',
  supplier: 'bg-accent text-accent-foreground',
  hunter: 'bg-secondary text-secondary-foreground',
}

const roleLabels: Record<UserRole, string> = {
  buyer: 'Buyer',
  supplier: 'Supplier',
  hunter: 'Hunter',
}

export default function NavigationHeader({ currentPage, setCurrentPage, userRole, setUserRole }: NavigationHeaderProps) {
  const navItems: { label: string; page: PageView; roles?: UserRole[] }[] = [
    { label: 'Home', page: 'landing' },
    { label: 'Buyer Dashboard', page: 'buyer', roles: ['buyer'] },
    { label: 'Supplier Dashboard', page: 'supplier', roles: ['supplier'] },
    { label: 'Hunter Dashboard', page: 'hunter', roles: ['hunter'] },
    { label: 'Supplier Directory', page: 'directory' },
    { label: 'Messages', page: 'messaging' },
    { label: 'Admin', page: 'admin' },
  ]

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-foreground">PalletMatch</span>
              <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-accent text-accent">BETA</Badge>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Button
                key={item.page}
                variant={currentPage === item.page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage(item.page)}
                className={`text-xs font-medium tracking-wide ${currentPage === item.page ? '' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Select value={userRole} onValueChange={(v) => setUserRole(v as UserRole)}>
              <SelectTrigger className="w-[130px] h-8 text-xs bg-background border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="hunter">Hunter</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge className={`${roleColors[userRole]} text-xs`}>
                {roleLabels[userRole]}
              </Badge>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <FiUser className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {visibleNavItems.map((item) => (
            <Button
              key={item.page}
              variant={currentPage === item.page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage(item.page)}
              className="text-xs whitespace-nowrap flex-shrink-0"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
