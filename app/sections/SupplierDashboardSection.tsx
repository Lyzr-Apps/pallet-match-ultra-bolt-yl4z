'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'
import { FiTruck, FiEdit, FiPackage, FiDollarSign, FiClock, FiMapPin, FiPlus, FiCheck } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const ASSISTANT_AGENT_ID = '69a43a1b1ecf43e3e54a52be'

interface SupplierDashboardProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const sampleListings = [
  { id: 'L1', type: '48x40 GMA', grade: 'A', quantity: 2000, price: '$12.50', heatTreated: true },
  { id: 'L2', type: '42x42', grade: 'B', quantity: 500, price: '$9.00', heatTreated: false },
  { id: 'L3', type: '48x48', grade: 'New', quantity: 800, price: '$18.00', heatTreated: true },
]

const sampleRFQs = [
  { id: 'RFQ-101', buyer: 'Acme Warehousing', type: '48x40 GMA', grade: 'A', qty: 500, delivery: 'Delivery', location: 'Portland, OR', posted: '2 hours ago' },
  { id: 'RFQ-102', buyer: 'Metro Distribution', type: '48x40 GMA', grade: 'B', qty: 1000, delivery: 'Pickup', location: 'Seattle, WA', posted: '5 hours ago' },
  { id: 'RFQ-103', buyer: 'Fresh Foods Inc.', type: '42x42', grade: 'A', qty: 300, delivery: 'Delivery', location: 'San Francisco, CA', posted: '1 day ago' },
]

export default function SupplierDashboardSection({ showSample, activeAgentId, setActiveAgentId }: SupplierDashboardProps) {
  const [profile, setProfile] = useState({ name: '', location: '', capabilities: '', palletTypes: '', heatTreatment: false, delivery: false, minOrder: '' })
  const [quoteForm, setQuoteForm] = useState({ rfqId: '', price: '', leadTime: '', deliveryFee: '', notes: '' })
  const [assistantResponse, setAssistantResponse] = useState<{ content?: string; key_points?: string[]; suggested_actions?: string[]; context_notes?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDraftQuote = async (rfq: typeof sampleRFQs[0]) => {
    setLoading(true)
    setError(null)
    setAssistantResponse(null)
    setActiveAgentId(ASSISTANT_AGENT_ID)
    try {
      const message = `Draft a competitive quote response for this pallet RFQ:
- RFQ ID: ${rfq.id}
- Buyer: ${rfq.buyer}
- Pallet Type: ${rfq.type}
- Grade: ${rfq.grade}
- Quantity: ${rfq.qty}
- Delivery: ${rfq.delivery}
- Location: ${rfq.location}

Our capabilities: We supply ${profile.palletTypes || '48x40 GMA, 42x42, 48x48'} pallets. ${profile.heatTreatment ? 'We offer heat treatment.' : ''} ${profile.delivery ? 'We provide delivery.' : 'Pickup only.'} Minimum order: ${profile.minOrder || '100'} units.`
      const res = await callAIAgent(message, ASSISTANT_AGENT_ID)
      if (res.success) {
        const data = res?.response?.result
        setAssistantResponse({
          content: data?.content ?? '',
          key_points: Array.isArray(data?.key_points) ? data.key_points : [],
          suggested_actions: Array.isArray(data?.suggested_actions) ? data.suggested_actions : [],
          context_notes: data?.context_notes ?? '',
        })
        setQuoteForm((prev) => ({ ...prev, rfqId: rfq.id }))
      } else {
        setError(res?.error ?? 'Failed to draft quote')
      }
    } catch {
      setError('An error occurred')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Supplier Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, listings, and respond to RFQs</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
          <TabsTrigger value="listings" className="text-xs">My Listings</TabsTrigger>
          <TabsTrigger value="rfqs" className="text-xs">Open RFQs</TabsTrigger>
          <TabsTrigger value="quote" className="text-xs">Submit Quote</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <FiTruck className="w-4 h-4 text-accent" /> Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Company Name</Label>
                  <Input placeholder="e.g. Pacific Pallet Co." className="mt-1 bg-background text-sm" value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Location</Label>
                  <Input placeholder="e.g. Portland, OR" className="mt-1 bg-background text-sm" value={profile.location} onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Capabilities</Label>
                <Textarea placeholder="Describe your manufacturing capabilities, equipment, certifications..." className="mt-1 bg-background text-sm" rows={3} value={profile.capabilities} onChange={(e) => setProfile((prev) => ({ ...prev, capabilities: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium">Pallet Types Offered</Label>
                <Input placeholder="e.g. 48x40 GMA, 42x42, Custom" className="mt-1 bg-background text-sm" value={profile.palletTypes} onChange={(e) => setProfile((prev) => ({ ...prev, palletTypes: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label className="text-xs font-medium">Heat Treatment</Label>
                  <Switch checked={profile.heatTreatment} onCheckedChange={(v) => setProfile((prev) => ({ ...prev, heatTreatment: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label className="text-xs font-medium">Delivery Available</Label>
                  <Switch checked={profile.delivery} onCheckedChange={(v) => setProfile((prev) => ({ ...prev, delivery: v }))} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Minimum Order</Label>
                  <Input type="number" placeholder="e.g. 100" className="mt-1 bg-background text-sm" value={profile.minOrder} onChange={(e) => setProfile((prev) => ({ ...prev, minOrder: e.target.value }))} />
                </div>
              </div>
              <Button className="font-medium">
                <FiCheck className="w-4 h-4 mr-1" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          {!showSample ? (
            <Card className="border-border/40 bg-card">
              <CardContent className="py-12 text-center">
                <FiPackage className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No listings yet. Enable Sample Data to preview.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">My Listings ({sampleListings.length})</h2>
                <Button size="sm" className="text-xs"><FiPlus className="w-3 h-3 mr-1" /> Add Listing</Button>
              </div>
              {sampleListings.map((listing) => (
                <Card key={listing.id} className="border-border/40 bg-card">
                  <CardContent className="pt-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{listing.type} - Grade {listing.grade}</p>
                        <p className="text-xs text-muted-foreground">{listing.quantity} units at {listing.price}/unit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.heatTreated && <Badge variant="outline" className="text-[10px]">HT</Badge>}
                      <Badge variant="secondary" className="text-[10px]">Active</Badge>
                      <Button variant="ghost" size="sm" className="h-7"><FiEdit className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rfqs">
          {!showSample ? (
            <Card className="border-border/40 bg-card">
              <CardContent className="py-12 text-center">
                <FiPackage className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No open RFQs. Enable Sample Data to preview.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-semibold">Open RFQs Matching Your Profile</h2>
              {sampleRFQs.map((rfq) => (
                <Card key={rfq.id} className="border-border/40 bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">{rfq.id}</Badge>
                          <span className="text-sm font-medium">{rfq.buyer}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" /> {rfq.location}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{rfq.posted}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-[10px]">{rfq.type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">Grade {rfq.grade}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{rfq.qty} units</Badge>
                      <Badge variant="secondary" className="text-[10px]">{rfq.delivery}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs h-7" onClick={() => handleDraftQuote(rfq)} disabled={loading}>
                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FiEdit className="w-3 h-3 mr-1" />}
                        Draft Response
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">Submit Quote</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {error && <p className="text-xs text-destructive mt-2">{error}</p>}

              {assistantResponse && (
                <Card className="border-accent/30 bg-accent/5 mt-4">
                  <CardContent className="pt-4 pb-3">
                    <Badge variant="outline" className="text-[10px] border-accent text-accent mb-2">AI Draft for {quoteForm.rfqId}</Badge>
                    {assistantResponse.content && <p className="text-sm mb-3" style={{ lineHeight: '1.65' }}>{assistantResponse.content}</p>}
                    {Array.isArray(assistantResponse.key_points) && assistantResponse.key_points.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Key Points</p>
                        <ul className="space-y-1">
                          {assistantResponse.key_points.map((kp, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(assistantResponse.suggested_actions) && assistantResponse.suggested_actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {assistantResponse.suggested_actions.map((a, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] cursor-pointer hover:bg-accent/20">{a}</Badge>
                        ))}
                      </div>
                    )}
                    {assistantResponse.context_notes && <p className="text-[11px] text-muted-foreground mt-2 italic">{assistantResponse.context_notes}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quote">
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-accent" /> Submit Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium">RFQ ID</Label>
                <Input placeholder="e.g. RFQ-101" className="mt-1 bg-background text-sm" value={quoteForm.rfqId} onChange={(e) => setQuoteForm((prev) => ({ ...prev, rfqId: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium">Price per Unit ($)</Label>
                  <Input type="number" placeholder="e.g. 12.50" className="mt-1 bg-background text-sm" value={quoteForm.price} onChange={(e) => setQuoteForm((prev) => ({ ...prev, price: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Lead Time</Label>
                  <Input placeholder="e.g. 3-5 days" className="mt-1 bg-background text-sm" value={quoteForm.leadTime} onChange={(e) => setQuoteForm((prev) => ({ ...prev, leadTime: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Delivery Fee ($)</Label>
                  <Input type="number" placeholder="e.g. 150" className="mt-1 bg-background text-sm" value={quoteForm.deliveryFee} onChange={(e) => setQuoteForm((prev) => ({ ...prev, deliveryFee: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea placeholder="Additional details, terms, availability..." className="mt-1 bg-background text-sm" rows={3} value={quoteForm.notes} onChange={(e) => setQuoteForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>
              <Button className="font-medium">
                <FiCheck className="w-4 h-4 mr-1" /> Submit Quote
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
