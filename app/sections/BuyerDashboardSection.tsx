'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'
import { FiPackage, FiTruck, FiCheck, FiClock, FiDollarSign, FiMapPin, FiShield } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const RFQ_AGENT_ID = '69a43a1adfefaf7e451d3585'

interface BuyerDashboardProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

interface MatchedSupplier {
  supplier_name?: string
  match_score?: number
  location?: string
  pallet_types?: string
  heat_treated?: boolean
  delivery_available?: boolean
  estimated_price?: string
  lead_time?: string
  match_explanation?: string
}

interface RFQResult {
  matched_suppliers?: MatchedSupplier[]
  total_matches?: number
  rfq_summary?: string
  recommendations?: string
}

const sampleResult: RFQResult = {
  matched_suppliers: [
    { supplier_name: 'Pacific Pallet Co.', match_score: 95, location: 'Portland, OR', pallet_types: '48x40 GMA, 42x42', heat_treated: true, delivery_available: true, estimated_price: '$12.50/unit', lead_time: '3-5 days', match_explanation: 'Perfect match: supplies requested 48x40 GMA, Grade A, within 50 miles, offers delivery and heat treatment.' },
    { supplier_name: 'Heartland Wood Products', match_score: 82, location: 'Kansas City, MO', pallet_types: '48x40 GMA, 48x48', heat_treated: true, delivery_available: false, estimated_price: '$11.00/unit', lead_time: '5-7 days', match_explanation: 'Strong match on pallet type and grade. No delivery option, pickup only. Competitive pricing for bulk orders.' },
    { supplier_name: 'SouthEast Pallets', match_score: 71, location: 'Atlanta, GA', pallet_types: '48x40 GMA, Custom', heat_treated: false, delivery_available: true, estimated_price: '$13.00/unit', lead_time: '7-10 days', match_explanation: 'Good type match. No heat treatment, but offers custom sizing and delivery. Longer lead time.' },
  ],
  total_matches: 3,
  rfq_summary: 'Your RFQ for 500 Grade A 48x40 GMA pallets with delivery in Portland, OR was matched against 342 registered suppliers.',
  recommendations: 'Pacific Pallet Co. is the strongest match with the highest score. Consider requesting quotes from the top 2 suppliers to compare pricing. Heartland offers better pricing but requires pickup arrangement.',
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{line.slice(2)}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm" style={{ lineHeight: '1.65' }}>{line}</p>
      })}
    </div>
  )
}

export default function BuyerDashboardSection({ showSample, activeAgentId, setActiveAgentId }: BuyerDashboardProps) {
  const [form, setForm] = useState({
    palletType: '',
    grade: '',
    quantity: '',
    deliveryMethod: 'delivery',
    frequency: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
  })
  const [result, setResult] = useState<RFQResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayResult = showSample && !result ? sampleResult : result

  const handleSubmitRFQ = async () => {
    if (!form.palletType || !form.grade || !form.quantity || !form.location) {
      setError('Please fill in all required fields: Pallet Type, Grade, Quantity, and Location.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveAgentId(RFQ_AGENT_ID)
    try {
      const message = `I need a quote for pallets with the following requirements:
- Pallet Type: ${form.palletType}
- Grade: ${form.grade}
- Quantity: ${form.quantity}
- Delivery Method: ${form.deliveryMethod}
- Frequency: ${form.frequency || 'One-time'}
- Budget Range: ${form.budgetMin ? `$${form.budgetMin}` : 'No min'} - ${form.budgetMax ? `$${form.budgetMax}` : 'No max'}
- Location: ${form.location}`
      const res = await callAIAgent(message, RFQ_AGENT_ID)
      if (res.success) {
        const data = res?.response?.result
        setResult({
          matched_suppliers: Array.isArray(data?.matched_suppliers) ? data.matched_suppliers : [],
          total_matches: data?.total_matches ?? 0,
          rfq_summary: data?.rfq_summary ?? '',
          recommendations: data?.recommendations ?? '',
        })
      } else {
        setError(res?.error ?? 'Failed to match suppliers')
      }
    } catch {
      setError('An error occurred while processing your RFQ')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  const suppliers = Array.isArray(displayResult?.matched_suppliers) ? displayResult.matched_suppliers : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Buyer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Create RFQs and find matched suppliers using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/40 bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-primary" /> Create RFQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Pallet Type *</Label>
              <Select value={form.palletType} onValueChange={(v) => setForm((prev) => ({ ...prev, palletType: v }))}>
                <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="48x40 GMA">48x40 GMA</SelectItem>
                  <SelectItem value="42x42">42x42</SelectItem>
                  <SelectItem value="48x48">48x48</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Grade *</Label>
              <Select value={form.grade} onValueChange={(v) => setForm((prev) => ({ ...prev, grade: v }))}>
                <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Quantity *</Label>
              <Input type="number" placeholder="e.g. 500" className="mt-1 bg-background text-sm" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs font-medium">Delivery Method</Label>
              <RadioGroup value={form.deliveryMethod} onValueChange={(v) => setForm((prev) => ({ ...prev, deliveryMethod: v }))} className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="text-xs">Delivery</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="text-xs">Pickup</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-xs font-medium">Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm((prev) => ({ ...prev, frequency: v }))}>
                <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-time">One-time</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Budget Min ($)</Label>
                <Input type="number" placeholder="Min" className="mt-1 bg-background text-sm" value={form.budgetMin} onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium">Budget Max ($)</Label>
                <Input type="number" placeholder="Max" className="mt-1 bg-background text-sm" value={form.budgetMax} onChange={(e) => setForm((prev) => ({ ...prev, budgetMax: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Location *</Label>
              <Input placeholder="e.g. Portland, OR" className="mt-1 bg-background text-sm" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button className="w-full font-medium" onClick={handleSubmitRFQ} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Matching Suppliers...</> : 'Submit RFQ & Find Matches'}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {displayResult?.rfq_summary && (
            <Card className="border-border/40 bg-card">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">RFQ Summary</p>
                <p className="text-sm" style={{ lineHeight: '1.65' }}>{displayResult.rfq_summary}</p>
                {displayResult.total_matches != null && (
                  <Badge variant="secondary" className="mt-2 text-xs">{displayResult.total_matches} suppliers matched</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {suppliers.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">Matched Suppliers</h2>
              {suppliers.map((supplier, idx) => (
                <Card key={idx} className="border-border/40 bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{supplier?.supplier_name ?? 'Unknown Supplier'}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <FiMapPin className="w-3 h-3" /> {supplier?.location ?? 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-2xl font-bold text-primary">{supplier?.match_score ?? 0}</span>
                        <p className="text-[10px] text-muted-foreground">Match Score</p>
                      </div>
                    </div>

                    <Progress value={supplier?.match_score ?? 0} className="h-1.5 mb-3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <FiPackage className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">Types</p>
                        <p className="text-xs font-medium truncate">{supplier?.pallet_types ?? 'N/A'}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <FiDollarSign className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">Est. Price</p>
                        <p className="text-xs font-medium">{supplier?.estimated_price ?? 'N/A'}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <FiClock className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">Lead Time</p>
                        <p className="text-xs font-medium">{supplier?.lead_time ?? 'N/A'}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <FiTruck className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">Delivery</p>
                        <p className="text-xs font-medium">{supplier?.delivery_available ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 mb-3">
                      {supplier?.heat_treated && (
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                          <FiShield className="w-2.5 h-2.5 mr-0.5" /> Heat Treated
                        </Badge>
                      )}
                      {supplier?.delivery_available && (
                        <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                          <FiTruck className="w-2.5 h-2.5 mr-0.5" /> Delivers
                        </Badge>
                      )}
                    </div>

                    {supplier?.match_explanation && (
                      <p className="text-xs text-muted-foreground" style={{ lineHeight: '1.6' }}>{supplier.match_explanation}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="text-xs h-7">Request Quote</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {displayResult?.recommendations && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs font-semibold text-accent mb-1">Recommendations</p>
                {renderMarkdown(displayResult.recommendations)}
              </CardContent>
            </Card>
          )}

          {!displayResult && !loading && (
            <Card className="border-border/40 bg-card">
              <CardContent className="py-16 text-center">
                <FiPackage className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Submit an RFQ to find matched suppliers, or enable Sample Data to preview results.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
