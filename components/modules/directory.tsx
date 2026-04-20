'use client'

import { useState, useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { Search, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Directory() {
  const { employees } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'cards' | 'org-chart'>('cards')

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Directory</h2>
            <p className="text-slate-500 mt-1 text-sm">Find and connect with colleagues across the company.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, role, or department..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6 border-b border-slate-200">
          <button 
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cards' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('cards')}
          >
            Directory View
          </button>
          <button 
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'org-chart' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('org-chart')}
          >
            Organization Chart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        {activeTab === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-2xl font-bold mb-4 shadow-inner ring-4 ring-white border border-slate-100">
                    {getInitials(emp.name)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                  <p className="text-sm font-medium text-blue-600 mt-1">{emp.position}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Building2 size={12} />
                    <span>{emp.department}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-5"></div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={14} />
                    </div>
                    <span>{emp.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={14} />
                    </div>
                    <span>HQ Office</span>
                  </div>
                </div>
                
                <Button className="w-full mt-6 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200">
                  View Profile
                </Button>
              </div>
            ))}

            {filteredEmployees.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                <Search size={48} className="text-slate-300 mb-4" />
                <p>No employees found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <Building2 size={64} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Organization Chart View</h3>
            <p className="text-slate-500 mt-2 max-w-md text-center">Visual hierarchy mapping is coming in the next update. You will be able to see reporting lines and department structures.</p>
          </div>
        )}
      </div>
    </div>
  )
}
