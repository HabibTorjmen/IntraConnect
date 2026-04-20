'use client'

import { useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LayoutList, MessageSquare, PieChart, Star, Send, TrendingUp } from 'lucide-react'

export default function FeedbackList() {
  const { surveys, isLoading } = useContext(AppContext)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Feedback & Engagement</h1>
          <p className="text-slate-600 mt-1">Share your thoughts and participate in company surveys</p>
        </div>
        <Button className="gap-2 bg-pink-600 hover:bg-pink-700 shadow-md">
          <Send size={18} />
          Submit Feedback
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
              <Star size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Employee NPS</h3>
              <p className="text-slate-500 text-sm">Overall satisfaction score</p>
            </div>
            <div className="ml-auto flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">72</span>
              <span className="text-emerald-500 text-sm flex items-center gap-1 font-medium">
                <TrendingUp size={14} />
                +5
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-pink-500 w-[72%] rounded-full shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Active Surveys</h3>
              <p className="text-slate-500 text-sm">Participate and make an impact</p>
            </div>
            <div className="ml-auto">
               <span className="text-3xl font-bold text-slate-900">{surveys.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">2 High Priority</span>
             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">1 Optional</span>
          </div>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutList size={20} className="text-pink-500" />
              Company Surveys
            </h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Survey Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading surveys...</TableCell>
              </TableRow>
            ) : surveys.length > 0 ? (
              surveys.map(survey => (
                <TableRow key={survey.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{survey.title}</TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-sm truncate">{survey.description}</TableCell>
                  <TableCell className="text-slate-500 text-sm">Available</TableCell>
                  <TableCell className="text-slate-600 font-medium">12/45</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Open</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="text-pink-600 hover:text-white hover:bg-pink-600 transition-all">
                       Take Survey
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                   <PieChart className="mx-auto mb-2 opacity-20" size={48} />
                   <p>No active surveys</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
