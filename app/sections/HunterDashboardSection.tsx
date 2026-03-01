'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { callAIAgent } from '@/lib/aiAgent'
import { FiMapPin, FiRefreshCw, FiPackage, FiDollarSign, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const HUNTER_AGENT_ID = '69a43a1a553457ac25becc8e'

interface HunterDashboardProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

interface Stockpile {
  stockpile_id?: string
  location?: string
  distance?: string
  pallet_type?: string
  grade?: string
  quantity?: number
  accessibility?: string
  priority_score?: number
  estimated_value?: string
  potential_buyers?: string
  collection_notes?: string
}

interface HunterResult {
  stockpiles?: Stockpile[]
  total_stockpiles?: number
  suggested_route?: string
  market_summary?: string
}

const sampleResult: HunterResult = {
  stockpiles: [
    { stockpile_id: 'SP-001', location: 'Industrial Park, NE 42nd Ave', distance: '2.3 miles', pallet_type: '48x40 GMA', grade: 'B', quantity: 150, accessibility: 'Easy - loading dock access', priority_score: 92, estimated_value: '$1,350', potential_buyers: 'Acme Warehousing, Metro Distribution', collection_notes: 'Contact site manager before pickup. Available Mon-Fri 8AM-5PM.' },
    { stockpile_id: 'SP-002', location: 'Warehouse District, SE Division', distance: '4.1 miles', pallet_type: '48x40 GMA', grade: 'A', quantity: 80, accessibility: 'Moderate - narrow alley', priority_score: 78, estimated_value: '$960', potential_buyers: 'Fresh Foods Inc.', collection_notes: 'Stack is behind the building. Need flatbed truck.' },
    { stockpile_id: 'SP-003', location: 'Behind Costco, 82nd Ave', distance: '6.7 miles', pallet_type: '42x42', grade: 'C', quantity: 220, accessibility: 'Easy - open lot', priority_score: 65, estimated_value: '$880', potential_buyers: 'Multiple potential matches', collection_notes: 'Mixed condition. Sort on-site recommended.' },
    { stockpile_id: 'SP-004', location: 'Fred Meyer Distribution, Airport Way', distance: '8.2 miles', pallet_type: '48x48', grade: 'B', quantity: 60, accessibility: 'Difficult - behind fence, need permission', priority_score: 45, estimated_value: '$540', potential_buyers: 'Heartland Wood Products', collection_notes: 'Call distribution center for access. Limited hours.' },
  ],
  total_stockpiles: 4,
  suggested_route: 'Optimal route: Start at SP-001 (Industrial Park) -> SP-002 (Warehouse District) -> SP-003 (82nd Ave). Skip SP-004 unless you have extra time. Total estimated drive: 45 minutes. Prioritize SP-001 for highest value-per-mile ratio.',
  market_summary: 'Current pallet demand is high in the Portland metro area. 48x40 GMA pallets Grade A-B are most sought after. 3 active RFQs match your potential collection. Estimated total value: $3,730 from todays finds.',
}

const statusOptions = ['Available', 'Reserved', 'Collected']

function priorityColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

function priorityLabel(score: number) {
  if (score >= 80) return 'High'
  if (score >= 50) return 'Medium'
  return 'Low'
}

export default function HunterDashboardSection({ showSample, activeAgentId, setActiveAgentId }: HunterDashboardProps) {
  const [hunterLocation, setHunterLocation] = useState('')
  const [result, setResult] = useState<HunterResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [selectedStockpile, setSelectedStockpile] = useState<string | null>(null)
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')

  const displayResult = showSample && !result ? sampleResult : result
  const stockpiles = Array.isArray(displayResult?.stockpiles) ? displayResult.stockpiles : []

  const handleRefresh = async () => {
    if (!hunterLocation.trim()) {
      setError('Please enter your current location')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveAgentId(HUNTER_AGENT_ID)
    try {
      const message = `Find nearby pallet stockpiles for collection. My current location is: ${hunterLocation}. Show me stockpiles sorted by proximity and priority, including estimated values and potential buyers.`
      const res = await callAIAgent(message, HUNTER_AGENT_ID)
      if (res.success) {
        const data = res?.response?.result
        setResult({
          stockpiles: Array.isArray(data?.stockpiles) ? data.stockpiles : [],
          total_stockpiles: data?.total_stockpiles ?? 0,
          suggested_route: data?.suggested_route ?? '',
          market_summary: data?.market_summary ?? '',
        })
      } else {
        setError(res?.error ?? 'Failed to fetch stockpiles')
      }
    } catch {
      setError('An error occurred')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  const getStatus = (id: string) => statuses[id] || 'Available'

  const handleClaim = (id: string) => {
    if (pickupDate && pickupTime) {
      setStatuses((prev) => ({ ...prev, [id]: 'Reserved' }))
      setSelectedStockpile(null)
      setPickupDate('')
      setPickupTime('')
    }
  }

  const handleMarkCollected = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'Collected' }))
  }

  const statusColor = (s: string) => {
    if (s === 'Available') return 'bg-green-100 text-green-800 border-green-200'
    if (s === 'Reserved') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Hunter Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover nearby pallet stockpiles and plan collection routes</p>
      </div>

      <Card className="border-border/40 bg-card mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs font-medium">Your Current Location</Label>
              <Input placeholder="e.g. Portland, OR or 123 Main St" className="mt-1 bg-background text-sm" value={hunterLocation} onChange={(e) => setHunterLocation(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleRefresh} disabled={loading} className="font-medium">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching...</> : <><FiRefreshCw className="w-4 h-4 mr-2" /> Refresh Finds</>}
              </Button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {!displayResult && !loading ? (
        <Card className="border-border/40 bg-card">
          <CardContent className="py-16 text-center">
            <FiMapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Enter your location and click Refresh Finds, or enable Sample Data to preview.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Stockpile Feed ({displayResult?.total_stockpiles ?? stockpiles.length})</h2>
            </div>
            <ScrollArea className="h-[600px] pr-2">
              <div className="space-y-3">
                {stockpiles.map((sp, idx) => {
                  const spId = sp?.stockpile_id ?? `sp-${idx}`
                  const currentStatus = getStatus(spId)
                  return (
                    <Card key={spId} className="border-border/40 bg-card hover:shadow-md transition-shadow">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] font-mono">{spId}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${statusColor(currentStatus)}`}>{currentStatus}</Badge>
                            </div>
                            <p className="text-sm font-medium mt-1 flex items-center gap-1">
                              <FiMapPin className="w-3.5 h-3.5 text-primary" /> {sp?.location ?? 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">{sp?.distance ?? 'N/A'} away</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${priorityColor(sp?.priority_score ?? 0)}`}>
                            {priorityLabel(sp?.priority_score ?? 0)} ({sp?.priority_score ?? 0})
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground">Type</p>
                            <p className="text-xs font-medium">{sp?.pallet_type ?? 'N/A'}</p>
                          </div>
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground">Grade</p>
                            <p className="text-xs font-medium">{sp?.grade ?? 'N/A'}</p>
                          </div>
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground">Quantity</p>
                            <p className="text-xs font-medium">{sp?.quantity ?? 0}</p>
                          </div>
                          <div className="p-2 bg-muted/40 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground">Value</p>
                            <p className="text-xs font-medium text-accent">{sp?.estimated_value ?? 'N/A'}</p>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 mb-3">
                          <p><span className="font-medium text-muted-foreground">Access:</span> {sp?.accessibility ?? 'N/A'}</p>
                          <p><span className="font-medium text-muted-foreground">Buyers:</span> {sp?.potential_buyers ?? 'N/A'}</p>
                          {sp?.collection_notes && <p><span className="font-medium text-muted-foreground">Notes:</span> {sp.collection_notes}</p>}
                        </div>

                        <div className="flex gap-2">
                          {currentStatus === 'Available' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="text-xs h-7" onClick={() => setSelectedStockpile(spId)}>
                                  <FiCheck className="w-3 h-3 mr-1" /> Claim Pickup
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card">
                                <DialogHeader>
                                  <DialogTitle className="font-serif">Schedule Pickup - {spId}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 pt-2">
                                  <div>
                                    <Label className="text-xs font-medium">Pickup Date</Label>
                                    <Input type="date" className="mt-1 bg-background text-sm" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium">Pickup Time</Label>
                                    <Input type="time" className="mt-1 bg-background text-sm" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                                  </div>
                                  <Button className="w-full" onClick={() => handleClaim(spId)} disabled={!pickupDate || !pickupTime}>
                                    Confirm Pickup
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {currentStatus === 'Reserved' && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleMarkCollected(spId)}>
                              Mark Collected
                            </Button>
                          )}
                          {currentStatus === 'Collected' && (
                            <Badge variant="secondary" className="text-[10px]"><FiCheck className="w-3 h-3 mr-0.5" /> Collected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            {displayResult?.suggested_route && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-accent" /> Suggested Route
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm" style={{ lineHeight: '1.65' }}>{displayResult.suggested_route}</p>
                </CardContent>
              </Card>
            )}
            {displayResult?.market_summary && (
              <Card className="border-border/40 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-primary" /> Market Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm" style={{ lineHeight: '1.65' }}>{displayResult.market_summary}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
