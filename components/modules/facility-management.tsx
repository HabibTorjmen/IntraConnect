'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useContext, useMemo } from 'react'
import { AppContext } from '@/context/app-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function FacilityManagement() {
  const { tickets, ticketCategories, createTicket } = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
    location: ''
  })

  // Filter for facility-related tickets
  const facilityCategories = ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Janitorial', 'Security (Physical)']
  
  const facilityTickets = useMemo(() => {
    return tickets.filter(t => 
      facilityCategories.includes(t.categoryName || '') || 
      t.categoryName?.includes('Facility')
    )
  }, [tickets])

  const stats = useMemo(() => {
    const active = facilityTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length
    const urgent = facilityTickets.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status === 'open').length
    return { active, urgent }
  }, [facilityTickets])

  const handleCreateIncident = async () => {
    try {
      if (!ticketForm.categoryId) {
        alert('Please select a category')
        return
      }
      await createTicket(ticketForm)
      setIsModalOpen(false)
      setTicketForm({ title: '', description: '', categoryId: '', priority: 'medium', location: '' })
    } catch (err: any) {
      alert('Failed to report incident: ' + err.message)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Facility Management</h1>
          <p className="text-slate-500">Infrastructure maintenance and workspace incident tracking.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 gap-2 h-11 px-6">
              <Plus size={18} />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Report Workspace Incident</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">What is the problem?</label>
                <Input 
                  placeholder="Short summary (e.g. Broken AC, Water leak)" 
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="h-11 border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type of Incident</label>
                  <Select 
                    onValueChange={(val) => setTicketForm({ ...ticketForm, categoryId: val })}
                  >
                    <SelectTrigger className="h-11 border-slate-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketCategories.filter(c => facilityCategories.includes(c.name)).map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Urgency</label>
                  <Select 
                    defaultValue="medium"
                    onValueChange={(val) => setTicketForm({ ...ticketForm, priority: val })}
                  >
                    <SelectTrigger className="h-11 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor</SelectItem>
                      <SelectItem value="medium">Medium - Standard</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                      <SelectItem value="urgent">Critical - Danger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Exact Location</label>
                <Input 
                  placeholder="e.g. Floor 2, North Wing, Room 204" 
                  value={ticketForm.location}
                  onChange={(e) => setTicketForm({ ...ticketForm, location: e.target.value })}
                  className="h-11 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description & Details</label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="Please describe what happened..." 
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8" onClick={handleCreateIncident}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-blue-700 uppercase tracking-wider">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-900 font-outfit">{stats.active}</div>
            <p className="text-xs text-blue-600 font-medium">Requiring attention</p>
          </CardContent>
          <div className="h-1 w-full bg-blue-100 mt-2">
            <div className="h-full bg-blue-500 translate-x-0" style={{ width: '40%' }}></div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-orange-700 uppercase tracking-wider">Urgent Action</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-900 font-outfit">{stats.urgent}</div>
            <p className="text-xs text-orange-600 font-medium font-bold uppercase transition-all animate-pulse">High Priority Pending</p>
          </CardContent>
          <div className="h-1 w-full bg-orange-100 mt-2">
            <div className="h-full bg-orange-500" style={{ width: '75%' }}></div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Resolved This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-900 font-outfit">
              {facilityTickets.filter(t => t.status === 'resolved').length}
            </div>
            <p className="text-xs text-emerald-600 font-medium font-bold uppercase">Incident Recovery</p>
          </CardContent>
          <div className="h-1 w-full bg-emerald-100 mt-2">
            <div className="h-full bg-emerald-500" style={{ width: '80%' }}></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List View */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Facility Incidents</CardTitle>
              <CardDescription>Workspace issues reported by employees.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              View All <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facilityTickets.length > 0 ? (
                facilityTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all hover:border-slate-300 group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${ticket.priority === 'urgent' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'} text-white border-none py-0 px-2 text-[10px]`}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <span className="font-bold text-sm text-slate-800">{ticket.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded"><Building2 size={12}/> {ticket.location || 'Not specified'}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span className="text-slate-400">•</span>
                        <span>{ticket.categoryName}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold text-[10px] bg-white border-slate-200 uppercase">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Wrench size={32} className="mx-auto mb-3 opacity-20" />
                  <p>No incidents reported yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>Planned upkeep & asset inspections.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_MAINTENANCE.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`p-2.5 rounded-xl ${m.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Wrench size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{m.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {m.priority}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200">{m.status}</Badge>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-widest transition-all">
              Manage Assets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const MOCK_MAINTENANCE = [
  { id: 1, title: 'Generator Service', date: '2024-05-20', priority: 'High', status: 'Scheduled' },
  { id: 2, title: 'HVAC Filter Change', date: '2024-05-22', priority: 'Medium', status: 'Planned' },
  { id: 3, title: 'Elevator Inspection', date: '2024-05-25', priority: 'High', status: 'Pending' },
  { id: 4, title: 'Pest Control', date: '2024-05-28', priority: 'Low', status: 'Scheduled' },
]
