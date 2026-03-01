'use client'

import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FiPackage, FiSearch, FiMapPin, FiMessageSquare } from 'react-icons/fi'

import NavigationHeader, { type PageView, type UserRole } from './sections/NavigationHeader'
import LandingSection from './sections/LandingSection'
import BuyerDashboardSection from './sections/BuyerDashboardSection'
import SupplierDashboardSection from './sections/SupplierDashboardSection'
import HunterDashboardSection from './sections/HunterDashboardSection'
import SupplierDirectorySection from './sections/SupplierDirectorySection'
import MessagingSection from './sections/MessagingSection'
import AdminSection from './sections/AdminSection'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const AGENTS = [
  { id: '69a43a1adfefaf7e451d3585', name: 'RFQ Matching Agent', purpose: 'Matches RFQs to qualified suppliers', icon: FiPackage },
  { id: '69a43a1a2b90bd3461e87627', name: 'Supplier Discovery Agent', purpose: 'Natural language supplier search', icon: FiSearch },
  { id: '69a43a1a553457ac25becc8e', name: 'Hunter Stockpile Agent', purpose: 'Finds and ranks nearby stockpiles', icon: FiMapPin },
  { id: '69a43a1b1ecf43e3e54a52be', name: 'Marketplace Assistant', purpose: 'Drafts quotes, summaries, and help', icon: FiMessageSquare },
]

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing')
  const [userRole, setUserRole] = useState<UserRole>('buyer')
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role)
    if (role === 'buyer' && currentPage !== 'buyer') setCurrentPage('buyer')
    if (role === 'supplier' && currentPage !== 'supplier') setCurrentPage('supplier')
    if (role === 'hunter' && currentPage !== 'hunter') setCurrentPage('hunter')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground" style={{ letterSpacing: '0.01em', lineHeight: '1.65' }}>
        <NavigationHeader
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userRole={userRole}
          setUserRole={handleRoleChange}
        />

        <div className="fixed top-20 right-4 z-40 flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1.5 shadow-sm">
          <Label htmlFor="sample-toggle" className="text-[11px] text-muted-foreground font-medium cursor-pointer">Sample Data</Label>
          <Switch id="sample-toggle" checked={showSample} onCheckedChange={setShowSample} className="scale-75" />
        </div>

        <main>
          {currentPage === 'landing' && (
            <LandingSection setCurrentPage={setCurrentPage} showSample={showSample} />
          )}
          {currentPage === 'buyer' && (
            <BuyerDashboardSection showSample={showSample} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId} />
          )}
          {currentPage === 'supplier' && (
            <SupplierDashboardSection showSample={showSample} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId} />
          )}
          {currentPage === 'hunter' && (
            <HunterDashboardSection showSample={showSample} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId} />
          )}
          {currentPage === 'directory' && (
            <SupplierDirectorySection showSample={showSample} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId} />
          )}
          {currentPage === 'messaging' && (
            <MessagingSection showSample={showSample} activeAgentId={activeAgentId} setActiveAgentId={setActiveAgentId} />
          )}
          {currentPage === 'admin' && (
            <AdminSection showSample={showSample} />
          )}
        </main>

        <footer className="border-t border-border/30 bg-card/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h3 className="font-serif text-sm font-semibold text-foreground mb-3">Powered by AI Agents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${activeAgentId === agent.id ? 'border-accent bg-accent/10' : 'border-border/30 bg-card/50'}`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${activeAgentId === agent.id ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <agent.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{agent.purpose}</p>
                    </div>
                    {activeAgentId === agent.id && (
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FiPackage className="w-3.5 h-3.5" />
                <span className="font-serif font-semibold">PalletMatch</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-accent text-accent">BETA</Badge>
              </div>
              <p>Intelligent pallet marketplace</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
