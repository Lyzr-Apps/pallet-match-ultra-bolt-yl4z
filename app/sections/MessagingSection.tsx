'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'
import { FiMessageSquare, FiSend, FiRefreshCw, FiUser, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'

const ASSISTANT_AGENT_ID = '69a43a1b1ecf43e3e54a52be'

interface MessagingSectionProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

interface Thread {
  id: string
  name: string
  role: string
  preview: string
  unread: number
  messages: { sender: string; text: string; time: string }[]
}

const sampleThreads: Thread[] = [
  {
    id: 't1',
    name: 'Pacific Pallet Co.',
    role: 'supplier',
    preview: 'We can fulfill your 48x40 GMA order...',
    unread: 2,
    messages: [
      { sender: 'you', text: 'Hi, I need 500 48x40 GMA pallets, Grade A. Can you provide a quote?', time: '10:30 AM' },
      { sender: 'Pacific Pallet Co.', text: 'We can fulfill your 48x40 GMA order. Our Grade A pallets are $12.50 each with a 3-day lead time. We offer delivery within 100 miles.', time: '10:45 AM' },
      { sender: 'you', text: 'That sounds good. What about heat treatment certification?', time: '11:00 AM' },
      { sender: 'Pacific Pallet Co.', text: 'Yes, all our pallets come with ISPM-15 heat treatment certification. We can include the documentation with delivery.', time: '11:15 AM' },
    ],
  },
  {
    id: 't2',
    name: 'Mike Chen (Hunter)',
    role: 'hunter',
    preview: 'Found a stockpile of ~200 pallets near...',
    unread: 0,
    messages: [
      { sender: 'Mike Chen', text: 'Found a stockpile of ~200 pallets near the warehouse district. Mostly 48x40, Grade B-C. Want me to collect them?', time: '9:00 AM' },
      { sender: 'you', text: 'That is great! Can you check the condition more closely and send photos?', time: '9:15 AM' },
      { sender: 'Mike Chen', text: 'Sure, I will head over this afternoon and report back with details.', time: '9:20 AM' },
    ],
  },
  {
    id: 't3',
    name: 'Heartland Wood Products',
    role: 'supplier',
    preview: 'Regarding your monthly supply contract...',
    unread: 1,
    messages: [
      { sender: 'Heartland Wood Products', text: 'Regarding your monthly supply contract, we can offer 1000 pallets/month at $11.00 each for a 6-month commitment.', time: 'Yesterday' },
      { sender: 'you', text: 'Can you do $10.50 if we commit to 12 months?', time: 'Yesterday' },
    ],
  },
]

const roleIcon = (role: string) => {
  if (role === 'supplier') return <FiTruck className="w-4 h-4" />
  if (role === 'hunter') return <FiMapPin className="w-4 h-4" />
  return <FiPackage className="w-4 h-4" />
}

export default function MessagingSection({ showSample, activeAgentId, setActiveAgentId }: MessagingSectionProps) {
  const [threads] = useState<Thread[]>(sampleThreads)
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [assistantResponse, setAssistantResponse] = useState<{ content?: string; key_points?: string[]; suggested_actions?: string[]; context_notes?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentThread = showSample ? threads.find((t) => t.id === selectedThread) : null

  const getThreadContent = () => {
    if (!currentThread) return ''
    return currentThread.messages.map((m) => `${m.sender}: ${m.text}`).join('\n')
  }

  const handleSummarize = async () => {
    if (!currentThread) return
    setLoading(true)
    setError(null)
    setAssistantResponse(null)
    setActiveAgentId(ASSISTANT_AGENT_ID)
    try {
      const result = await callAIAgent(`Summarize this conversation thread between a pallet marketplace participant and ${currentThread.name}:\n\n${getThreadContent()}`, ASSISTANT_AGENT_ID)
      if (result.success) {
        const data = result?.response?.result
        setAssistantResponse({
          content: data?.content ?? '',
          key_points: Array.isArray(data?.key_points) ? data.key_points : [],
          suggested_actions: Array.isArray(data?.suggested_actions) ? data.suggested_actions : [],
          context_notes: data?.context_notes ?? '',
        })
      } else {
        setError(result?.error ?? 'Failed to summarize thread')
      }
    } catch {
      setError('An error occurred while summarizing')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  const handleDraftResponse = async () => {
    if (!currentThread) return
    setLoading(true)
    setError(null)
    setAssistantResponse(null)
    setActiveAgentId(ASSISTANT_AGENT_ID)
    try {
      const result = await callAIAgent(`Draft a professional response for this pallet marketplace conversation with ${currentThread.name}. The conversation so far:\n\n${getThreadContent()}\n\nPlease draft a suitable reply.`, ASSISTANT_AGENT_ID)
      if (result.success) {
        const data = result?.response?.result
        setAssistantResponse({
          content: data?.content ?? '',
          key_points: Array.isArray(data?.key_points) ? data.key_points : [],
          suggested_actions: Array.isArray(data?.suggested_actions) ? data.suggested_actions : [],
          context_notes: data?.context_notes ?? '',
        })
      } else {
        setError(result?.error ?? 'Failed to draft response')
      }
    } catch {
      setError('An error occurred while drafting')
    }
    setLoading(false)
    setActiveAgentId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Communicate with suppliers, buyers, and hunters</p>
      </div>

      {!showSample ? (
        <Card className="border-border/40 bg-card">
          <CardContent className="py-16 text-center">
            <FiMessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet. Enable Sample Data to preview the messaging experience.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '600px' }}>
          <Card className="border-border/40 bg-card lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[540px]">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => { setSelectedThread(thread.id); setAssistantResponse(null); setError(null) }}
                    className={`w-full text-left px-4 py-3 border-b border-border/20 hover:bg-muted/50 transition-colors ${selectedThread === thread.id ? 'bg-muted/70' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {roleIcon(thread.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{thread.name}</span>
                          {thread.unread > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-5 w-5 flex items-center justify-center rounded-full p-0">{thread.unread}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{thread.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card lg:col-span-2">
            {!currentThread ? (
              <CardContent className="flex items-center justify-center h-[580px]">
                <p className="text-muted-foreground text-sm">Select a conversation to view messages</p>
              </CardContent>
            ) : (
              <div className="flex flex-col h-[580px]">
                <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {roleIcon(currentThread.role)}
                    <span className="font-medium text-sm">{currentThread.name}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize">{currentThread.role}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleSummarize} disabled={loading}>
                      {loading && activeAgentId === ASSISTANT_AGENT_ID ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FiRefreshCw className="w-3 h-3 mr-1" />}
                      Summarize
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleDraftResponse} disabled={loading}>
                      Draft Response
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-3">
                    {currentThread.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${msg.sender === 'you' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          <p style={{ lineHeight: '1.5' }}>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === 'you' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">{error}</div>
                  )}

                  {assistantResponse && (
                    <Card className="mt-4 border-accent/30 bg-accent/5">
                      <CardContent className="pt-4 pb-3">
                        <Badge variant="outline" className="text-[10px] border-accent text-accent mb-2">AI Assistant</Badge>
                        {assistantResponse.content && (
                          <p className="text-sm mb-3" style={{ lineHeight: '1.65' }}>{assistantResponse.content}</p>
                        )}
                        {Array.isArray(assistantResponse.key_points) && assistantResponse.key_points.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Key Points</p>
                            <ul className="space-y-1">
                              {assistantResponse.key_points.map((kp, i) => (
                                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                                  {kp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(assistantResponse.suggested_actions) && assistantResponse.suggested_actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {assistantResponse.suggested_actions.map((action, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] cursor-pointer hover:bg-accent/20">{action}</Badge>
                            ))}
                          </div>
                        )}
                        {assistantResponse.context_notes && (
                          <p className="text-[11px] text-muted-foreground mt-2 italic">{assistantResponse.context_notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </ScrollArea>

                <div className="px-4 py-3 border-t border-border/20 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="text-sm bg-background"
                  />
                  <Button size="sm" disabled={!messageInput.trim()}>
                    <FiSend className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
