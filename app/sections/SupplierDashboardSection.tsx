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
import { FiTruck, FiEdit, FiPackage, FiDollarSign, FiClock, FiMapPin, FiPlus, FiCheck, FiVideo, FiUpload, FiMail, FiPhone, FiX, FiStar, FiAlertCircle } from 'react-icons/fi'
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
  const [profile, setProfile] = useState({ name: '', location: '', capabilities: '', palletTypes: '', heatTreatment: false, delivery: false, minOrder: '', customCrates: false })
  const [quoteForm, setQuoteForm] = useState({ rfqId: '', price: '', leadTime: '', deliveryFee: '', notes: '' })
  const [assistantResponse, setAssistantResponse] = useState<{ content?: string; key_points?: string[]; suggested_actions?: string[]; context_notes?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'paid'>('free')
  const [capabilityStatement, setCapabilityStatement] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

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

      <div className="mb-6">
        <Card className={`border-border/40 ${subscriptionTier === 'paid' ? 'bg-accent/5 border-accent/40' : 'bg-card'}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {subscriptionTier === 'paid' ? (
                  <Badge className="bg-accent text-accent-foreground text-xs"><FiVideo className="w-3 h-3 mr-1" /> Pro Plan - $49/mo</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Free Plan</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {subscriptionTier === 'paid' ? 'Video capability statement enabled' : 'Text capability statement only'}
                </span>
              </div>
              <div className="flex gap-2">
                {subscriptionTier === 'free' ? (
                  <Button size="sm" className="text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setSubscriptionTier('paid')}>
                    <FiStar className="w-3 h-3 mr-1" /> Upgrade to Pro - $49/mo
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setSubscriptionTier('free')}>
                    Switch to Free
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
          <TabsTrigger value="capability" className="text-xs">Capability Statement</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label className="text-xs font-medium">Heat Treatment</Label>
                  <Switch checked={profile.heatTreatment} onCheckedChange={(v) => setProfile((prev) => ({ ...prev, heatTreatment: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label className="text-xs font-medium">Delivery Available</Label>
                  <Switch checked={profile.delivery} onCheckedChange={(v) => setProfile((prev) => ({ ...prev, delivery: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label className="text-xs font-medium">Custom Crates & Pallets</Label>
                  <Switch checked={profile.customCrates} onCheckedChange={(v) => setProfile((prev) => ({ ...prev, customCrates: v }))} />
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

        <TabsContent value="capability">
          <div className="space-y-4">
            <Card className="border-border/40 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <FiEdit className="w-4 h-4 text-accent" /> Capability Statement
                </CardTitle>
                <p className="text-xs text-muted-foreground">Tell buyers who you are, what you do, where you are located, and whether you can build custom crates and pallets.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Written Capability Statement</Label>
                  <Textarea
                    placeholder="Describe your company: Who are you? What do you specialize in? Where are you located? Do you build custom crates and pallets? What sets you apart from competitors? Include certifications, years in business, service areas, and any specializations..."
                    className="mt-1 bg-background text-sm"
                    rows={6}
                    value={capabilityStatement}
                    onChange={(e) => setCapabilityStatement(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Available on all plans. This text appears on your public supplier profile.</p>
                </div>
                <Button className="font-medium">
                  <FiCheck className="w-4 h-4 mr-1" /> Save Statement
                </Button>
              </CardContent>
            </Card>

            {subscriptionTier === 'paid' ? (
              <Card className="border-accent/40 bg-accent/5">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <FiVideo className="w-4 h-4 text-accent" /> Video Capability Statement
                    <Badge className="text-[10px] bg-accent text-accent-foreground ml-2">Pro</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Upload a 5-minute video showcasing your business, capabilities, location, and custom crate/pallet services.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videoPreviewUrl ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiVideo className="w-3.5 h-3.5 text-accent" />
                          <span className="text-xs font-medium">{videoFile?.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            ({videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) : 0} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-destructive hover:text-destructive"
                          onClick={() => { setVideoFile(null); setVideoPreviewUrl(null) }}
                        >
                          <FiX className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      </div>
                      <Button className="font-medium">
                        <FiUpload className="w-4 h-4 mr-1" /> Upload Video
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-accent/40 rounded-lg cursor-pointer hover:border-accent/60 hover:bg-accent/5 transition-colors"
                      >
                        <FiUpload className="w-8 h-8 text-accent/60 mb-3" />
                        <p className="text-sm font-medium text-foreground">Click to upload your video</p>
                        <p className="text-xs text-muted-foreground mt-1">MP4, MOV, or WebM -- max 5 minutes, 500 MB</p>
                      </label>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setVideoFile(file)
                            setVideoPreviewUrl(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FiVideo className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Need help producing your video?</p>
                        <p className="text-xs text-muted-foreground mb-2" style={{ lineHeight: '1.65' }}>
                          We can assist you in creating a professional 5-minute capability video. Your video can cover who you are, what you do, where you are located, and whether you build custom crates and pallets.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <FiMail className="w-3 h-3 text-primary" />
                            <a href="mailto:bomar3620@gmail.com" className="text-primary font-medium hover:underline">bomar3620@gmail.com</a>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <FiPhone className="w-3 h-3 text-primary" />
                            <span className="text-foreground font-medium">443-531-2612</span>
                            <span className="text-muted-foreground">(text &quot;video wanted&quot;)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card">
                <CardContent className="py-8">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FiVideo className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2">Video Capability Statement</h3>
                    <p className="text-xs text-muted-foreground mb-4" style={{ lineHeight: '1.65' }}>
                      Upgrade to Pro ($49/mo) to upload a 5-minute video showcasing who you are, what you do, your location, and your custom crate and pallet capabilities. Video profiles get significantly more buyer engagement.
                    </p>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium" onClick={() => setSubscriptionTier('paid')}>
                      <FiStar className="w-4 h-4 mr-1" /> Upgrade to Pro - $49/mo
                    </Button>

                    <Separator className="my-6" />

                    <div className="bg-muted/30 rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-1">Want a video but need help?</p>
                          <p className="text-xs text-muted-foreground mb-2">We can help you produce a professional capability statement video. Contact us:</p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs">
                              <FiMail className="w-3 h-3 text-primary" />
                              <a href="mailto:bomar3620@gmail.com" className="text-primary font-medium hover:underline">bomar3620@gmail.com</a>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <FiPhone className="w-3 h-3 text-primary" />
                              <span className="text-foreground font-medium">443-531-2612</span>
                              <span className="text-muted-foreground">(text &quot;video wanted&quot;)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
