'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FiPackage, FiTruck, FiMapPin, FiChevronRight, FiStar, FiShield, FiCheck, FiX, FiVideo, FiMail, FiPhone } from 'react-icons/fi'

type PageView = 'landing' | 'buyer' | 'supplier' | 'hunter' | 'directory' | 'messaging' | 'admin'

interface LandingSectionProps {
  setCurrentPage: (page: PageView) => void
  showSample: boolean
}

const sampleStats = {
  palletsMatched: 12847,
  activeSuppliers: 342,
  stockpilesFound: 1205,
}

const sampleSuppliers = [
  { name: 'Pacific Pallet Co.', location: 'Portland, OR', rating: 4.8, types: ['48x40 GMA', '42x42'], tier: 'paid' as const, customCrates: true },
  { name: 'Heartland Wood Products', location: 'Kansas City, MO', rating: 4.6, types: ['48x40 GMA', '48x48'], tier: 'paid' as const, customCrates: true },
  { name: 'SouthEast Pallets', location: 'Atlanta, GA', rating: 4.9, types: ['48x40 GMA', 'Custom'], tier: 'free' as const, customCrates: false },
  { name: 'Bay Area Pallet Recyclers', location: 'Oakland, CA', rating: 4.7, types: ['48x40 GMA', '42x42', '48x48'], tier: 'paid' as const, customCrates: true },
  { name: 'Golden State Lumber & Pallet', location: 'Sacramento, CA', rating: 4.5, types: ['48x40 GMA', 'Custom'], tier: 'free' as const, customCrates: false },
]

export default function LandingSection({ setCurrentPage, showSample }: LandingSectionProps) {
  const [stats, setStats] = useState({ palletsMatched: 0, activeSuppliers: 0, stockpilesFound: 0 })

  useEffect(() => {
    if (showSample) {
      setStats(sampleStats)
    } else {
      setStats({ palletsMatched: 0, activeSuppliers: 0, stockpilesFound: 0 })
    }
  }, [showSample])

  const roleCards = [
    {
      title: 'Buyer',
      icon: FiPackage,
      description: 'Post RFQs for pallets you need. Get matched with verified suppliers based on type, grade, quantity, and location.',
      page: 'buyer' as PageView,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Supplier',
      icon: FiTruck,
      description: 'List your pallet inventory and capabilities. Receive matched RFQs and submit competitive quotes.',
      page: 'supplier' as PageView,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Hunter',
      icon: FiMapPin,
      description: 'Discover nearby stockpiles of pallets. Claim pickups and connect collected pallets with waiting buyers.',
      page: 'hunter' as PageView,
      color: 'bg-secondary text-secondary-foreground',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <img
            src="https://asset.lyzr.app/eQpyJv6j"
            alt="PalletMatch Logo"
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-border/40 shadow-lg"
          />
        </div>
        <Badge variant="outline" className="mb-4 text-xs border-accent text-accent px-3 py-1">Beta Launch</Badge>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ lineHeight: '1.15' }}>
          Where Every Pallet<br />Finds Its Match
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto" style={{ lineHeight: '1.65', letterSpacing: '0.01em' }}>
          The intelligent marketplace connecting pallet buyers, suppliers, and hunters through AI-powered matching, real-time discovery, and streamlined logistics.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" onClick={() => setCurrentPage('directory')} className="font-medium tracking-wide">
            Explore Suppliers <FiChevronRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setCurrentPage('buyer')} className="font-medium tracking-wide">
            Post an RFQ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {roleCards.map((card) => (
          <Card key={card.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/40 bg-card">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <card.icon className="w-6 h-6" />
              </div>
              <CardTitle className="font-serif text-xl tracking-wide">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4" style={{ lineHeight: '1.65' }}>{card.description}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(card.page)}
                className="text-primary hover:text-primary font-medium group-hover:translate-x-1 transition-transform"
              >
                Get Started <FiChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-16 border-border/40 bg-card">
        <CardContent className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-serif text-3xl font-bold text-primary">{showSample ? stats.palletsMatched.toLocaleString() : '--'}</p>
              <p className="text-sm text-muted-foreground mt-1">Pallets Matched</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-accent">{showSample ? stats.activeSuppliers.toLocaleString() : '--'}</p>
              <p className="text-sm text-muted-foreground mt-1">Active Suppliers</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-foreground">{showSample ? stats.stockpilesFound.toLocaleString() : '--'}</p>
              <p className="text-sm text-muted-foreground mt-1">Stockpiles Found</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSample && (
        <>
          <Separator className="mb-8" />
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Featured Suppliers</h2>
            <p className="text-sm text-muted-foreground mb-6">Top-rated suppliers in the PalletMatch network</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleSuppliers.map((supplier) => (
                <Card key={supplier.name} className="border-border/40 bg-card hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{supplier.name}</h3>
                      <div className="flex items-center gap-1 text-accent">
                        <FiStar className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-medium">{supplier.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{supplier.location}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {supplier.types.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        <FiShield className="w-2.5 h-2.5 mr-0.5" /> Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {supplier.tier === 'paid' ? (
                        <Badge className="text-[10px] bg-accent text-accent-foreground">
                          <FiVideo className="w-2.5 h-2.5 mr-0.5" /> Pro
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Free</Badge>
                      )}
                      {supplier.customCrates && (
                        <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">Custom Crates</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mb-12">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">Supplier Subscription Plans</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Choose the plan that fits your business</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit text-xs mb-2">Free Tier</Badge>
              <CardTitle className="font-serif text-2xl">Starter</CardTitle>
              <p className="font-serif text-3xl font-bold text-foreground mt-1">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Get listed on PalletMatch and start receiving RFQs from qualified buyers.</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Basic company profile listing</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Written capability statement (text only)</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Receive matched RFQs</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Submit quotes to buyers</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> In-app messaging</li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground"><FiX className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> No video capability statement</li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground"><FiX className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> No priority placement in directory</li>
              </ul>
              <Button variant="outline" className="w-full mt-6 font-medium" onClick={() => setCurrentPage('supplier')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/60 bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-semibold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
            <CardHeader className="pb-2">
              <Badge className="w-fit text-xs mb-2 bg-accent text-accent-foreground">Pro Tier</Badge>
              <CardTitle className="font-serif text-2xl">Professional</CardTitle>
              <p className="font-serif text-3xl font-bold text-foreground mt-1">$49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Stand out with a video capability statement and get priority visibility with buyers.</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> Everything in Free tier</li>
                <li className="flex items-start gap-2 text-xs font-medium"><FiVideo className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> 5-minute video capability statement upload</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> Showcase who you are, what you do, your location</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> Highlight custom crate and pallet capabilities</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> Priority placement in supplier directory</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> AI-assisted quote drafting</li>
                <li className="flex items-start gap-2 text-xs"><FiCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> Pro badge on profile</li>
              </ul>
              <Button className="w-full mt-6 font-medium bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setCurrentPage('supplier')}>
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 bg-muted/30 mt-6 max-w-4xl mx-auto">
          <CardContent className="py-5">
            <div className="flex items-start gap-3">
              <FiVideo className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Need help creating your video capability statement?</p>
                <p className="text-xs text-muted-foreground mb-3" style={{ lineHeight: '1.65' }}>
                  We can assist you in producing a professional 5-minute video that showcases your business, capabilities, location, and custom crate/pallet services. Contact us to get started:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <FiMail className="w-3.5 h-3.5 text-primary" />
                    <a href="mailto:bomar3620@gmail.com" className="text-primary font-medium hover:underline">bomar3620@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FiPhone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-foreground font-medium">443-531-2612</span>
                    <span className="text-muted-foreground">(text &quot;video wanted&quot;)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-card">
        <CardContent className="py-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">How PalletMatch Works</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: '1.65' }}>
            PalletMatch uses AI-powered agents to connect participants across the pallet supply chain. Buyers post RFQs and receive intelligent supplier matches. Suppliers list their inventory and receive matched opportunities. Hunters discover nearby stockpiles with optimized collection routes. Every interaction is powered by specialized agents that understand the pallet industry.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
