'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FiPackage, FiTruck, FiMapPin, FiChevronRight, FiStar, FiShield } from 'react-icons/fi'

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
  { name: 'Pacific Pallet Co.', location: 'Portland, OR', rating: 4.8, types: ['48x40 GMA', '42x42'] },
  { name: 'Heartland Wood Products', location: 'Kansas City, MO', rating: 4.6, types: ['48x40 GMA', '48x48'] },
  { name: 'SouthEast Pallets', location: 'Atlanta, GA', rating: 4.9, types: ['48x40 GMA', 'Custom'] },
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <p className="text-xs text-muted-foreground mb-3">{supplier.location}</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.types.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        <FiShield className="w-2.5 h-2.5 mr-0.5" /> Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

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
