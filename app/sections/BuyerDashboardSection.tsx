'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { callAIAgent } from '@/lib/aiAgent'
import { FiPackage, FiTruck, FiCheck, FiClock, FiDollarSign, FiMapPin, FiShield, FiInfo, FiLayers, FiGrid, FiBox } from 'react-icons/fi'
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
    { supplier_name: 'Bay Area Pallet Recyclers', match_score: 89, location: 'Oakland, CA', pallet_types: '48x40 GMA, 42x42, 48x48', heat_treated: true, delivery_available: true, estimated_price: '$11.75/unit', lead_time: '3-5 days', match_explanation: 'Excellent match: local Oakland supplier with full range including heat treatment and delivery. Eco-focused recycler.' },
    { supplier_name: 'Heartland Wood Products', match_score: 82, location: 'Kansas City, MO', pallet_types: '48x40 GMA, 48x48', heat_treated: true, delivery_available: false, estimated_price: '$11.00/unit', lead_time: '5-7 days', match_explanation: 'Strong match on pallet type and grade. No delivery option, pickup only. Competitive pricing for bulk orders.' },
    { supplier_name: 'SouthEast Pallets', match_score: 71, location: 'Atlanta, GA', pallet_types: '48x40 GMA, Custom', heat_treated: false, delivery_available: true, estimated_price: '$13.00/unit', lead_time: '7-10 days', match_explanation: 'Good type match. No heat treatment, but offers custom sizing and delivery. Longer lead time.' },
  ],
  total_matches: 4,
  rfq_summary: 'Your RFQ for 500 Grade A 48x40 GMA pallets with delivery in Oakland, CA was matched against 342 registered suppliers.',
  recommendations: 'Pacific Pallet Co. and Bay Area Pallet Recyclers are the strongest matches. Bay Area Pallet Recyclers is local to Oakland and offers competitive pricing. Consider requesting quotes from both top suppliers to compare.',
}

// Pallet dimension data for preview
const PALLET_DIMENSIONS: Record<string, { width: number; depth: number; label: string }> = {
  '48x40 GMA': { width: 48, depth: 40, label: '48" x 40"' },
  '42x42': { width: 42, depth: 42, label: '42" x 42"' },
  '48x48': { width: 48, depth: 48, label: '48" x 48"' },
  '36x36': { width: 36, depth: 36, label: '36" x 36"' },
  '48x36': { width: 48, depth: 36, label: '48" x 36"' },
  '48x42': { width: 48, depth: 42, label: '48" x 42"' },
  '44x44': { width: 44, depth: 44, label: '44" x 44"' },
  '48x45': { width: 48, depth: 45, label: '48" x 45"' },
  '60x48': { width: 60, depth: 48, label: '60" x 48"' },
  '48x20': { width: 48, depth: 20, label: '48" x 20" (Half)' },
  'Custom': { width: 48, depth: 40, label: 'Custom' },
}

const GRADE_INFO: Record<string, { color: string; desc: string }> = {
  'New': { color: '#8B6914', desc: 'Brand new, never used. Clean, uniform appearance.' },
  'A': { color: '#9B7B3C', desc: 'Like-new condition. Minimal wear, no broken boards.' },
  'B': { color: '#A89060', desc: 'Good condition. Minor cosmetic wear, fully functional.' },
  'C': { color: '#B8A080', desc: 'Economy grade. Visible wear, may have repairs. Functional.' },
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]

// SVG Pallet Preview Component
function PalletPreview({ palletType, grade, material, heatTreated, deckType, customWidth, customDepth }: {
  palletType: string
  grade: string
  material: string
  heatTreated: boolean
  deckType: string
  customWidth: string
  customDepth: string
}) {
  const dims = palletType === 'Custom'
    ? { width: parseInt(customWidth) || 48, depth: parseInt(customDepth) || 40, label: `${customWidth || '?'}" x ${customDepth || '?'}"` }
    : (PALLET_DIMENSIONS[palletType] || PALLET_DIMENSIONS['48x40 GMA'])

  const gradeInfo = GRADE_INFO[grade] || GRADE_INFO['A']
  const isPlastic = material === 'Plastic'
  const isMetal = material === 'Metal'

  // Colors based on grade and material
  const boardColor = isPlastic ? '#6B8FA3' : isMetal ? '#8A8A8A' : gradeInfo.color
  const boardStroke = isPlastic ? '#4A7080' : isMetal ? '#6A6A6A' : '#6B5B3A'
  const stringerColor = isPlastic ? '#5A7F93' : isMetal ? '#707070' : '#7A6A44'

  // Calculate visual proportions (normalize to fit in 280x200 viewport)
  const maxW = 260
  const maxD = 140
  const scale = Math.min(maxW / dims.width, maxD / dims.depth)
  const vw = dims.width * scale
  const vd = dims.depth * scale
  const offsetX = (280 - vw) / 2
  const offsetY = 20

  // Isometric-ish 3D effect offsets
  const isoX = 12
  const isoY = 8
  const boardH = 6
  const stringerH = 14
  const totalH = boardH + stringerH + boardH

  // How many top deck boards based on type
  const isFullDeck = deckType === 'Full Deck'
  const topBoardCount = isFullDeck ? Math.max(5, Math.round(dims.depth / 8)) : (dims.depth >= 40 ? 7 : 5)
  const boardSpacing = vd / topBoardCount
  const gapRatio = isFullDeck ? 0.05 : 0.25

  return (
    <div className="bg-muted/30 rounded-xl border border-border/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-foreground">Pallet Preview</p>
          <p className="text-[11px] text-muted-foreground">{dims.label} {grade && `-- Grade ${grade}`}</p>
        </div>
        <div className="flex gap-1">
          {heatTreated && (
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
              <FiShield className="w-2 h-2 mr-0.5" /> HT
            </Badge>
          )}
          {material && (
            <Badge variant="secondary" className="text-[9px]">{material}</Badge>
          )}
        </div>
      </div>

      <svg viewBox="0 0 300 220" className="w-full max-w-[320px] mx-auto" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>
        {/* Bottom deck boards (3 boards) */}
        {[0, 0.4, 0.8].map((pos, i) => {
          const by = offsetY + totalH - boardH + isoY
          const bx = offsetX + isoX
          const bw = vw
          const bd = vd * 0.12
          const bOffset = pos * vd
          return (
            <g key={`bottom-${i}`}>
              {/* Side face */}
              <polygon
                points={`${bx},${by + bOffset + bd} ${bx + bw},${by + bOffset + bd} ${bx + bw},${by + bOffset + bd + boardH} ${bx},${by + bOffset + bd + boardH}`}
                fill={stringerColor}
                stroke={boardStroke}
                strokeWidth="0.5"
                opacity="0.7"
              />
              {/* Top face */}
              <polygon
                points={`${bx - isoX},${by + bOffset + bd - isoY} ${bx + bw - isoX},${by + bOffset + bd - isoY} ${bx + bw},${by + bOffset + bd} ${bx},${by + bOffset + bd}`}
                fill={boardColor}
                stroke={boardStroke}
                strokeWidth="0.5"
                opacity="0.6"
              />
            </g>
          )
        })}

        {/* Stringers (3 vertical supports) */}
        {[0.05, 0.45, 0.88].map((pos, i) => {
          const sx = offsetX + pos * vw + isoX
          const sy = offsetY + boardH + isoY
          const sw = vw * 0.07
          const sh = vd
          return (
            <g key={`stringer-${i}`}>
              {/* Front face */}
              <rect
                x={sx}
                y={sy}
                width={sw}
                height={stringerH}
                fill={stringerColor}
                stroke={boardStroke}
                strokeWidth="0.5"
                rx="0.5"
              />
              {/* Top face */}
              <polygon
                points={`${sx - isoX},${sy - isoY} ${sx + sw - isoX},${sy - isoY} ${sx + sw},${sy} ${sx},${sy}`}
                fill={boardColor}
                stroke={boardStroke}
                strokeWidth="0.5"
                opacity="0.8"
              />
            </g>
          )
        })}

        {/* Top deck boards */}
        {Array.from({ length: topBoardCount }).map((_, i) => {
          const ty = offsetY + isoY
          const tx = offsetX + isoX
          const tw = vw
          const bd = boardSpacing * (1 - gapRatio)
          const bOffset = i * boardSpacing
          return (
            <g key={`top-${i}`}>
              {/* Front edge */}
              <polygon
                points={`${tx},${ty + bOffset + bd - 1} ${tx + tw},${ty + bOffset + bd - 1} ${tx + tw},${ty + bOffset + bd - 1 + boardH} ${tx},${ty + bOffset + bd - 1 + boardH}`}
                fill={stringerColor}
                stroke={boardStroke}
                strokeWidth="0.4"
                opacity="0.5"
              />
              {/* Top face of board */}
              <polygon
                points={`${tx - isoX},${ty + bOffset - isoY} ${tx + tw - isoX},${ty + bOffset - isoY} ${tx + tw},${ty + bOffset} ${tx},${ty + bOffset}`}
                fill={boardColor}
                stroke={boardStroke}
                strokeWidth="0.5"
                rx="0.5"
              />
              {/* Right side edge */}
              <polygon
                points={`${tx + tw - isoX},${ty + bOffset - isoY} ${tx + tw},${ty + bOffset} ${tx + tw},${ty + bOffset + bd - 1} ${tx + tw - isoX},${ty + bOffset + bd - 1 - isoY}`}
                fill={boardColor}
                stroke={boardStroke}
                strokeWidth="0.4"
                opacity="0.7"
              />
              {/* Wood grain lines */}
              {!isPlastic && !isMetal && (
                <>
                  <line x1={tx - isoX + 10} y1={ty + bOffset - isoY + 1} x2={tx + tw - isoX - 10} y2={ty + bOffset - isoY + 1} stroke={boardStroke} strokeWidth="0.2" opacity="0.3" />
                  <line x1={tx - isoX + 20} y1={ty + bOffset - isoY + 3} x2={tx + tw - isoX - 5} y2={ty + bOffset - isoY + 3} stroke={boardStroke} strokeWidth="0.15" opacity="0.2" />
                </>
              )}
            </g>
          )
        })}

        {/* Heat treatment stamp */}
        {heatTreated && (
          <g>
            <rect x={offsetX + vw * 0.25} y={offsetY - 6} width="52" height="14" rx="2" fill="#2D5F2D" opacity="0.85" />
            <text x={offsetX + vw * 0.25 + 26} y={offsetY + 4.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="600" fontFamily="monospace">ISPM-15</text>
          </g>
        )}

        {/* Dimension labels */}
        <g fontSize="9" fill="hsl(30, 20%, 45%)" fontFamily="sans-serif">
          {/* Width label */}
          <line x1={offsetX} y1={offsetY + totalH + isoY + 18} x2={offsetX + vw} y2={offsetY + totalH + isoY + 18} stroke="hsl(30, 20%, 45%)" strokeWidth="0.5" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
          <text x={offsetX + vw / 2} y={offsetY + totalH + isoY + 28} textAnchor="middle" fontWeight="500">{dims.width}&quot;</text>

          {/* Depth label */}
          <line x1={offsetX + vw + isoX + 12} y1={offsetY} x2={offsetX + vw + isoX + 12} y2={offsetY + vd} stroke="hsl(30, 20%, 45%)" strokeWidth="0.5" />
          <text x={offsetX + vw + isoX + 22} y={offsetY + vd / 2 + 3} textAnchor="middle" fontWeight="500" transform={`rotate(90, ${offsetX + vw + isoX + 22}, ${offsetY + vd / 2 + 3})`}>{dims.depth}&quot;</text>
        </g>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="hsl(30, 20%, 45%)" strokeWidth="0.5" />
          </marker>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="hsl(30, 20%, 45%)" strokeWidth="0.5" />
          </marker>
        </defs>
      </svg>

      {/* Spec summary below preview */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="text-center p-2 bg-background rounded-lg">
          <p className="text-[10px] text-muted-foreground">Dimensions</p>
          <p className="text-xs font-semibold">{dims.label}</p>
        </div>
        <div className="text-center p-2 bg-background rounded-lg">
          <p className="text-[10px] text-muted-foreground">Grade</p>
          <p className="text-xs font-semibold">{grade || 'Not selected'}</p>
        </div>
        <div className="text-center p-2 bg-background rounded-lg">
          <p className="text-[10px] text-muted-foreground">Material</p>
          <p className="text-xs font-semibold">{material || 'Wood'}</p>
        </div>
        <div className="text-center p-2 bg-background rounded-lg">
          <p className="text-[10px] text-muted-foreground">Deck Style</p>
          <p className="text-xs font-semibold">{deckType || 'Standard'}</p>
        </div>
      </div>

      {grade && (
        <div className="mt-2 flex items-start gap-1.5 p-2 bg-background rounded-lg">
          <FiInfo className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground" style={{ lineHeight: '1.5' }}>
            <span className="font-medium text-foreground">Grade {grade}:</span> {GRADE_INFO[grade]?.desc || 'Standard quality pallet.'}
          </p>
        </div>
      )}
    </div>
  )
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
    street: '',
    city: '',
    state: '',
    zip: '',
    material: 'Wood',
    heatTreated: false,
    deckType: 'Standard',
    entryType: '4-Way',
    customWidth: '',
    customDepth: '',
    specialRequirements: '',
  })
  const [result, setResult] = useState<RFQResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayResult = showSample && !result ? sampleResult : result
  const locationString = [form.city, form.state].filter(Boolean).join(', ')

  const handleSubmitRFQ = async () => {
    if (!form.palletType || !form.grade || !form.quantity || !form.city || !form.state) {
      setError('Please fill in all required fields: Pallet Type, Grade, Quantity, City, and State.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveAgentId(RFQ_AGENT_ID)
    try {
      const dims = form.palletType === 'Custom' ? `${form.customWidth}"x${form.customDepth}" (Custom)` : form.palletType
      const fullAddress = [form.street, form.city, form.state, form.zip].filter(Boolean).join(', ')
      const message = `I need a quote for pallets with the following requirements:
- Pallet Type/Size: ${dims}
- Grade: ${form.grade}
- Material: ${form.material}
- Quantity: ${form.quantity}
- Entry Type: ${form.entryType}
- Deck Style: ${form.deckType}
- Heat Treatment Required: ${form.heatTreated ? 'Yes (ISPM-15)' : 'No'}
- Delivery Method: ${form.deliveryMethod}
- Frequency: ${form.frequency || 'One-time'}
- Budget Range: ${form.budgetMin ? `$${form.budgetMin}` : 'No min'} - ${form.budgetMax ? `$${form.budgetMax}` : 'No max'} per unit
- Delivery Address: ${fullAddress}
${form.specialRequirements ? `- Special Requirements: ${form.specialRequirements}` : ''}`
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RFQ Form - Left Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-primary" /> Create RFQ
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Fill out your pallet specifications to broadcast to matched suppliers</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pallet Type */}
              <div>
                <Label className="text-xs font-medium">Pallet Size / Type *</Label>
                <Select value={form.palletType} onValueChange={(v) => setForm((prev) => ({ ...prev, palletType: v }))}>
                  <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select pallet size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48x40 GMA">48&quot; x 40&quot; GMA (Standard North America)</SelectItem>
                    <SelectItem value="42x42">42&quot; x 42&quot; (Telecom / Paint)</SelectItem>
                    <SelectItem value="48x48">48&quot; x 48&quot; (Drum / Square)</SelectItem>
                    <SelectItem value="36x36">36&quot; x 36&quot; (Small Footprint)</SelectItem>
                    <SelectItem value="48x36">48&quot; x 36&quot; (Beverage)</SelectItem>
                    <SelectItem value="48x42">48&quot; x 42&quot; (Military / CAN)</SelectItem>
                    <SelectItem value="44x44">44&quot; x 44&quot; (Automotive)</SelectItem>
                    <SelectItem value="48x45">48&quot; x 45&quot; (European Compat.)</SelectItem>
                    <SelectItem value="60x48">60&quot; x 48&quot; (Oversized)</SelectItem>
                    <SelectItem value="48x20">48&quot; x 20&quot; (Half Pallet)</SelectItem>
                    <SelectItem value="Custom">Custom Dimensions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Dimensions */}
              {form.palletType === 'Custom' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-[11px] font-medium">Width (inches)</Label>
                    <Input type="number" placeholder="e.g. 48" className="mt-1 bg-background text-sm" value={form.customWidth} onChange={(e) => setForm((prev) => ({ ...prev, customWidth: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-[11px] font-medium">Depth (inches)</Label>
                    <Input type="number" placeholder="e.g. 40" className="mt-1 bg-background text-sm" value={form.customDepth} onChange={(e) => setForm((prev) => ({ ...prev, customDepth: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* Grade */}
              <div>
                <Label className="text-xs font-medium">Condition / Grade *</Label>
                <Select value={form.grade} onValueChange={(v) => setForm((prev) => ({ ...prev, grade: v }))}>
                  <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New -- Brand new, never used</SelectItem>
                    <SelectItem value="A">Grade A -- Like-new, minimal wear</SelectItem>
                    <SelectItem value="B">Grade B -- Good condition, minor wear</SelectItem>
                    <SelectItem value="C">Grade C -- Economy, visible wear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Material */}
              <div>
                <Label className="text-xs font-medium">Material</Label>
                <Select value={form.material} onValueChange={(v) => setForm((prev) => ({ ...prev, material: v }))}>
                  <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select material" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wood">Wood (Hardwood / Softwood)</SelectItem>
                    <SelectItem value="Hardwood">Hardwood Only (Oak, Maple)</SelectItem>
                    <SelectItem value="Softwood">Softwood Only (Pine, Spruce)</SelectItem>
                    <SelectItem value="Plywood">Plywood</SelectItem>
                    <SelectItem value="Plastic">Plastic (HDPE / PP)</SelectItem>
                    <SelectItem value="Metal">Metal (Steel / Aluminum)</SelectItem>
                    <SelectItem value="Presswood">Presswood / Molded Wood</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-xs font-medium">Quantity Needed *</Label>
                <Select value={form.quantity} onValueChange={(v) => setForm((prev) => ({ ...prev, quantity: v }))}>
                  <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="Select quantity range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-25">1 - 25 pallets</SelectItem>
                    <SelectItem value="26-50">26 - 50 pallets</SelectItem>
                    <SelectItem value="51-100">51 - 100 pallets</SelectItem>
                    <SelectItem value="101-250">101 - 250 pallets</SelectItem>
                    <SelectItem value="251-500">251 - 500 pallets</SelectItem>
                    <SelectItem value="501-1000">501 - 1,000 pallets</SelectItem>
                    <SelectItem value="1001-2500">1,001 - 2,500 pallets</SelectItem>
                    <SelectItem value="2501-5000">2,501 - 5,000 pallets</SelectItem>
                    <SelectItem value="5000+">5,000+ pallets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Deck & Entry Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Entry Type</Label>
                  <Select value={form.entryType} onValueChange={(v) => setForm((prev) => ({ ...prev, entryType: v }))}>
                    <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-Way">4-Way Entry</SelectItem>
                      <SelectItem value="2-Way">2-Way Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Deck Style</Label>
                  <Select value={form.deckType} onValueChange={(v) => setForm((prev) => ({ ...prev, deckType: v }))}>
                    <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard Deck</SelectItem>
                      <SelectItem value="Full Deck">Full Deck (No Gaps)</SelectItem>
                      <SelectItem value="Perimeter Base">Perimeter Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Heat Treatment */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs font-medium">Heat Treatment (ISPM-15)</Label>
                  <p className="text-[10px] text-muted-foreground">Required for international shipping</p>
                </div>
                <Switch checked={form.heatTreated} onCheckedChange={(v) => setForm((prev) => ({ ...prev, heatTreated: v }))} />
              </div>

              <Separator />

              {/* Delivery Method */}
              <div>
                <Label className="text-xs font-medium">Delivery Method</Label>
                <RadioGroup value={form.deliveryMethod} onValueChange={(v) => setForm((prev) => ({ ...prev, deliveryMethod: v }))} className="flex gap-4 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="text-xs cursor-pointer">Delivery to my address</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="text-xs cursor-pointer">I will pick up</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frequency */}
              <div>
                <Label className="text-xs font-medium">Order Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((prev) => ({ ...prev, frequency: v }))}>
                  <SelectTrigger className="mt-1 bg-background text-sm"><SelectValue placeholder="How often do you need pallets?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One-time">One-time order</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Every 2 weeks</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="As-needed">As needed (on-demand)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Budget Min ($/unit)</Label>
                  <Input type="number" placeholder="Min" className="mt-1 bg-background text-sm" value={form.budgetMin} onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-medium">Budget Max ($/unit)</Label>
                  <Input type="number" placeholder="Max" className="mt-1 bg-background text-sm" value={form.budgetMax} onChange={(e) => setForm((prev) => ({ ...prev, budgetMax: e.target.value }))} />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div>
                <Label className="text-xs font-medium flex items-center gap-1"><FiMapPin className="w-3 h-3" /> Delivery / Business Address *</Label>
                <Input placeholder="Street Address" className="mt-1.5 bg-background text-sm" value={form.street} onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))} />
                <div className="grid grid-cols-5 gap-2 mt-2">
                  <Input placeholder="City" className="col-span-2 bg-background text-sm" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
                  <Select value={form.state} onValueChange={(v) => setForm((prev) => ({ ...prev, state: v }))}>
                    <SelectTrigger className="bg-background text-sm"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="ZIP" className="col-span-2 bg-background text-sm" value={form.zip} onChange={(e) => setForm((prev) => ({ ...prev, zip: e.target.value }))} />
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <Label className="text-xs font-medium">Special Requirements (optional)</Label>
                <Textarea
                  placeholder="Any special requirements? e.g., notched stringers, color coding, stenciling, fumigation, specific load capacity..."
                  className="mt-1 bg-background text-sm"
                  rows={2}
                  value={form.specialRequirements}
                  onChange={(e) => setForm((prev) => ({ ...prev, specialRequirements: e.target.value }))}
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button className="w-full font-medium" onClick={handleSubmitRFQ} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Matching Suppliers...</> : 'Submit RFQ & Find Matches'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview + Results - Right Columns */}
        <div className="lg:col-span-7 space-y-4">
          {/* Pallet Preview */}
          <PalletPreview
            palletType={form.palletType || '48x40 GMA'}
            grade={form.grade}
            material={form.material}
            heatTreated={form.heatTreated}
            deckType={form.deckType}
            customWidth={form.customWidth}
            customDepth={form.customDepth}
          />

          {/* RFQ Summary */}
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

          {/* Matched Suppliers */}
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
