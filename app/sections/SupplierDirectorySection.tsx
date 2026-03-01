'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { callAIAgent } from '@/lib/aiAgent'
import { FiSearch, FiGrid, FiList, FiMapPin, FiTruck, FiShield, FiDollarSign, FiPackage, FiFilter, FiStar, FiVideo } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const DISCOVERY_AGENT_ID = '69a43a1a2b90bd3461e87627'

interface SupplierDirectoryProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

interface DiscoveredSupplier {
  supplier_name?: string
  relevance_score?: number
  location?: string
  capabilities?: string
  pallet_types?: string
  heat_treated?: boolean
  delivery_available?: boolean
  min_order?: string
  price_range?: string
  relevance_explanation?: string
  tier?: 'free' | 'paid'
  custom_crates?: boolean
  has_video?: boolean
}

interface DiscoveryResult {
  search_interpretation?: string
  suppliers?: DiscoveredSupplier[]
  total_results?: number
  suggested_refinements?: string
}

const sampleResult: DiscoveryResult = {
  search_interpretation: 'Searching for suppliers that offer heat-treated 48x40 GMA pallets with delivery capability within 50 miles of Portland, OR.',
  suppliers: [
    { supplier_name: 'Pacific Pallet Co.', relevance_score: 96, location: 'Portland, OR', capabilities: 'Full-service pallet manufacturing with ISPM-15 certification. Custom sizing and crate building available.', pallet_types: '48x40 GMA, 42x42, Custom', heat_treated: true, delivery_available: true, min_order: '100 units', price_range: '$10-$15/unit', relevance_explanation: 'Perfect match: heat-treated 48x40 GMA supplier within your location, offers delivery.', tier: 'paid', custom_crates: true, has_video: true },
    { supplier_name: 'Bay Area Pallet Recyclers', relevance_score: 91, location: 'Oakland, CA', capabilities: 'Eco-focused pallet recycling and remanufacturing. Custom crate solutions for shipping and export.', pallet_types: '48x40 GMA, 42x42, 48x48', heat_treated: true, delivery_available: true, min_order: '75 units', price_range: '$8-$13/unit', relevance_explanation: 'Top Bay Area supplier: heat-treated, full range of sizes, custom crates, and delivery.', tier: 'paid', custom_crates: true, has_video: true },
    { supplier_name: 'Heartland Wood Products', relevance_score: 82, location: 'Kansas City, MO', capabilities: 'Pallet remanufacturing specialist. High-volume capacity with custom crate services.', pallet_types: '48x40 GMA, 48x48', heat_treated: true, delivery_available: true, min_order: '200 units', price_range: '$8-$12/unit', relevance_explanation: 'Strong match: heat-treated, delivers, competitive pricing. Farther location but ships nationwide.', tier: 'paid', custom_crates: true, has_video: true },
    { supplier_name: 'SouthEast Pallets', relevance_score: 75, location: 'Atlanta, GA', capabilities: 'New and recycled pallets. Quick turnaround times with regional focus.', pallet_types: '48x40 GMA, 42x42, 48x48', heat_treated: false, delivery_available: true, min_order: '50 units', price_range: '$9-$14/unit', relevance_explanation: 'Good type match and delivery. Does not offer heat treatment or custom crates.', tier: 'free', custom_crates: false, has_video: false },
    { supplier_name: 'Golden State Lumber & Pallet', relevance_score: 68, location: 'Sacramento, CA', capabilities: 'Raw lumber and pallet manufacturing. Large-scale operations serving Central Valley.', pallet_types: '48x40 GMA, Custom', heat_treated: true, delivery_available: false, min_order: '500 units', price_range: '$7-$10/unit', relevance_explanation: 'Heat-treated with good pricing, but no delivery and higher minimum order.', tier: 'free', custom_crates: false, has_video: false },
  ],
  total_results: 5,
  suggested_refinements: 'Try narrowing by grade (A, B, C) or specifying quantity needs for more precise pricing. You might also filter by lead time if urgency is a factor.',
}

export default function SupplierDirectorySection({ showSample, activeAgentId, setActiveAgentId }: SupplierDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [result, setResult] = useState<DiscoveryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({ radius: [50], heatTreated: false, deliveryOnly: false, types: { gma: true, '4242': false, '4848': false, custom: false } })

  const displayResult = showSample && !result ? sampleResult : result
  const suppliers = Array.isArray(displayResult?.suppliers) ? displayResult.suppliers : []

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveAgentId(DISCOVERY_AGENT_ID)
    try {
      const res = await callAIAgent(searchQuery, DISCOVERY_AGENT_ID)
      if (res.success) {
        const data = res?.response?.result
        setResult({
          search_interpretation: data?.search_interpretation ?? '',
          suppliers: Array.isArray(data?.suppliers) ? data.suppliers : [],
          total_results: data?.total_results ?? 0,
          suggested_refinements: data?.suggested_refinements ?? '',
        })
      } else {
        setError(res?.error ?? 'Search failed')
      }
    } catch {
      setError('An error occurred during search')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Supplier Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Search suppliers using natural language powered by AI</p>
      </div>

      <Card className="border-border/40 bg-card mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g. heat-treated 48x40 suppliers within 50 miles that deliver"
                className="pl-10 bg-background text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="font-medium">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FiSearch className="w-4 h-4 mr-1" /> Search</>}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-border/40 bg-card lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <FiFilter className="w-4 h-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs font-medium">Location Radius: {filters.radius[0]} miles</Label>
              <Slider value={filters.radius} onValueChange={(v) => setFilters((prev) => ({ ...prev, radius: v }))} min={10} max={200} step={10} className="mt-2" />
            </div>
            <Separator />
            <div>
              <Label className="text-xs font-medium mb-2 block">Pallet Types</Label>
              <div className="space-y-2">
                {[{ key: 'gma', label: '48x40 GMA' }, { key: '4242', label: '42x42' }, { key: '4848', label: '48x48' }, { key: 'custom', label: 'Custom' }].map((t) => (
                  <div key={t.key} className="flex items-center gap-2">
                    <Checkbox checked={filters.types[t.key as keyof typeof filters.types]} onCheckedChange={(v) => setFilters((prev) => ({ ...prev, types: { ...prev.types, [t.key]: !!v } }))} id={`type-${t.key}`} />
                    <Label htmlFor={`type-${t.key}`} className="text-xs">{t.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Heat Treated Only</Label>
                <Switch checked={filters.heatTreated} onCheckedChange={(v) => setFilters((prev) => ({ ...prev, heatTreated: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Delivery Only</Label>
                <Switch checked={filters.deliveryOnly} onCheckedChange={(v) => setFilters((prev) => ({ ...prev, deliveryOnly: v }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {displayResult?.search_interpretation && (
            <Card className="border-border/40 bg-muted/30">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Search Interpretation</p>
                <p className="text-sm" style={{ lineHeight: '1.65' }}>{displayResult.search_interpretation}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{displayResult?.total_results ?? suppliers.length} results found</p>
            <div className="flex gap-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}><FiGrid className="w-3.5 h-3.5" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('list')}><FiList className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          {suppliers.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {suppliers.map((supplier, idx) => (
                <Card key={idx} className="border-border/40 bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{supplier?.supplier_name ?? 'Unknown'}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <FiMapPin className="w-3 h-3" /> {supplier?.location ?? 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-xl font-bold text-primary">{supplier?.relevance_score ?? 0}</span>
                        <p className="text-[10px] text-muted-foreground">Relevance</p>
                      </div>
                    </div>

                    <Progress value={supplier?.relevance_score ?? 0} className="h-1 mb-3" />

                    {supplier?.capabilities && (
                      <p className="text-xs text-muted-foreground mb-2" style={{ lineHeight: '1.5' }}>{supplier.capabilities}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {supplier?.pallet_types?.split(',').map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{t.trim()}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
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
                      {supplier?.custom_crates && (
                        <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">Custom Crates</Badge>
                      )}
                      {supplier?.tier === 'paid' ? (
                        <Badge className="text-[10px] bg-accent text-accent-foreground">
                          <FiVideo className="w-2.5 h-2.5 mr-0.5" /> Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Free</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Min Order:</span> {supplier?.min_order ?? 'N/A'}
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Price:</span> {supplier?.price_range ?? 'N/A'}
                      </div>
                    </div>

                    {supplier?.relevance_explanation && (
                      <p className="text-[11px] text-muted-foreground italic" style={{ lineHeight: '1.5' }}>{supplier.relevance_explanation}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="text-xs h-7">Contact</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loading ? (
            <Card className="border-border/40 bg-card">
              <CardContent className="py-16 text-center">
                <FiSearch className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Search for suppliers or enable Sample Data to preview results.</p>
              </CardContent>
            </Card>
          ) : null}

          {displayResult?.suggested_refinements && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs font-semibold text-accent mb-1">Suggested Refinements</p>
                <p className="text-sm" style={{ lineHeight: '1.65' }}>{displayResult.suggested_refinements}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
