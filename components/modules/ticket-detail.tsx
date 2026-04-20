'use client'

import { useState, useContext } from 'react'
import { AppContext, Ticket } from '@/context/app-context'
import { AuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  X, Send, User, Clock, AlertCircle, 
  CheckCircle2, Paperclip, MoreVertical, 
  UserPlus, Hash, Calendar, MapPin
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TicketDetailProps {
  ticket: Ticket
  onClose: () => void
}

export default function TicketDetail({ ticket, onClose }: TicketDetailProps) {
  const { user } = useContext(AuthContext)
  const { addTicketComment, updateTicket, employees, assignTicket } = useContext(AppContext)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await addTicketComment(ticket.id, newComment)
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicket(ticket.id, { status: newStatus })
    } catch (err) {
      console.error(err)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'BREACHED': return 'text-red-600 font-bold'
      case 'NEAR_BREACH': return 'text-amber-600 font-bold'
      default: return 'text-emerald-600 font-medium'
    }
  }

  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'manager'

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs text-slate-500 bg-white">
            #{ticket.id.substring(0, 8)}
          </Badge>
          <h2 className="font-bold text-slate-800 line-clamp-1">{ticket.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-slate-50/30 border-slate-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <select 
                    className="text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-blue-700"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={!isAdminOrAgent}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </Card>
              <Card className="p-3 bg-slate-50/30 border-slate-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Priority</p>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
              </Card>
              {ticket.location && (
                <Card className="p-3 bg-orange-50/30 border-orange-100 col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-1 flex items-center gap-1">
                    <MapPin size={10} /> Location
                  </p>
                  <p className="text-sm font-semibold text-orange-900">{ticket.location}</p>
                </Card>
              )}
            </div>

            {/* Requester & Assignee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Requester</p>
                    <p className="text-sm font-semibold text-slate-800">{ticket.employeeName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm text-slate-800">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.assignedToId ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {ticket.assignedToId ? <User size={20} /> : <UserPlus size={20} />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Assigned To</p>
                    {isAdminOrAgent ? (
                      <select 
                        className="text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-slate-800"
                        value={ticket.assignedToId || ''}
                        onChange={(e) => assignTicket(ticket.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{ticket.assignedToName || 'Not Assigned'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Section */}
            {ticket.slaDeadline && (
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">SLA Resolution Goal</span>
                  </div>
                  <span className={`text-xs ${getSLAColor(ticket.slaStatus || 'ON_TRACK')}`}>
                    {ticket.slaStatus?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Target: <span className="font-semibold text-slate-800">{new Date(ticket.slaDeadline).toLocaleString()}</span>
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Description</h3>
              <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                {ticket.description}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                Discussion thread
                <Badge variant="secondary" className="px-1.5 py-0 min-w-[20px] justify-center">
                  {ticket.comments?.length || 0}
                </Badge>
              </h3>

              <div className="space-y-4">
                {ticket.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}

                {(!ticket.comments || ticket.comments.length === 0) && (
                  <div className="text-center py-8 opacity-40">
                    <Hash className="mx-auto mb-2" size={32} />
                    <p className="text-sm">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="relative">
            <Textarea 
              placeholder="Type your message..." 
              className="resize-none pr-12 min-h-[80px] bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button 
              size="icon" 
              className="absolute bottom-2 right-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md"
              disabled={isSubmitting || !newComment.trim()}
              onClick={handleAddComment}
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-slate-400 hover:text-slate-600">
              <Paperclip size={12} className="mr-1" />
              Attach Files
            </Button>
            <p className="text-[10px] text-slate-400">Shift + Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
