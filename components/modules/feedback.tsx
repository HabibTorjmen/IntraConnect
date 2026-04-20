'use client'

import { useState, useContext } from 'react'
import { AppContext, Survey, PerformanceFeedback } from '@/context/app-context'
import { AuthContext } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, Star, ClipboardList, Send, 
  CheckCircle2, User, Calendar, Plus,
  ChevronRight, AlertCircle, TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FeedbackModule() {
  const { user } = useContext(AuthContext)
  const { surveys, performanceFeedback, submitSurveyResponse, createPerformanceFeedback, employees, isLoading } = useContext(AppContext)
  
  const [activeTab, setActiveTab] = useState('surveys')
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({})
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false)
  
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    employeeId: '',
    content: '',
    rating: 5
  })

  const isHR = user?.employee?.department === 'HR' || user?.role === 'admin'

  const handleOpenSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setSurveyAnswers({})
    setIsSurveyModalOpen(true)
  }

  const handleSurveySubmit = async () => {
    if (!selectedSurvey) return
    try {
      await submitSurveyResponse(selectedSurvey.id, surveyAnswers)
      setIsSurveyModalOpen(false)
      setSelectedSurvey(null)
    } catch (err) {
      console.error('Failed to submit survey', err)
    }
  }

  const handleFeedbackSubmit = async () => {
    try {
      await createPerformanceFeedback(feedbackForm)
      setIsFeedbackModalOpen(false)
      setFeedbackForm({ employeeId: '', content: '', rating: 5 })
    } catch (err) {
      console.error('Failed to create feedback', err)
    }
  }

  // Filter feedback for current user
  const myFeedback = performanceFeedback.filter(f => f.employeeId === user?.employee?.id)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Feedback & Performance</h2>
          <p className="text-slate-500">Manage surveys and view performance reviews</p>
        </div>
        {isHR && (
          <Button onClick={() => setIsFeedbackModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus size={18} className="mr-2" />
            New Performance Review
          </Button>
        )}
      </div>

      <Tabs defaultValue="surveys" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="surveys" className="data-[state=active]:bg-white">
            <ClipboardList size={16} className="mr-2" />
            Active Surveys
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white">
            <Star size={16} className="mr-2" />
            Performance Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.length > 0 ? (
              surveys.map((survey) => (
                <Card key={survey.id} className="p-6 border-slate-100 hover:shadow-lg transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant={survey.isActive ? 'default' : 'secondary'} className={survey.isActive ? 'bg-emerald-100 text-emerald-700 border-none' : ''}>
                      {survey.isActive ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-4 pt-2">
                        <MessageSquare className="text-indigo-600 mb-2" size={24} />
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{survey.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-2">{survey.description}</p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {format(new Date(survey.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          onClick={() => handleOpenSurvey(survey)}
                          disabled={!survey.isActive}
                        >
                          Participate <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-900">No active surveys</h3>
                    <p className="text-slate-500">Check back later for new company surveys.</p>
                </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="space-y-4">
            {myFeedback.length > 0 ? (
              myFeedback.map((feedback) => (
                <Card key={feedback.id} className="p-6 border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-800">Review from {feedback.authorName}</h4>
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < (feedback.rating || 0) ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center mb-4">
                          <Calendar size={12} className="mr-1" />
                          {format(new Date(feedback.createdAt), 'MMMM dd, yyyy')}
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-700">
                          "{feedback.content}"
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        Official Record
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-900">No performance reviews yet</h3>
                    <p className="text-slate-500">Performance reviews will appear here once submitted by HR or managers.</p>
                </div>
            )}

            {isHR && (
                <Card className="p-6 bg-indigo-50 border-indigo-100 mt-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-indigo-900 mb-1">Manager Overview</h4>
                            <p className="text-indigo-700 text-sm">As an HR member, you can see performance trends and manage company-wide feedback cycles.</p>
                        </div>
                        <Button className="ml-auto bg-indigo-600 hover:bg-indigo-700">Access Analytics</Button>
                    </div>
                </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Survey Participation Modal */}
      <Dialog open={isSurveyModalOpen} onOpenChange={setIsSurveyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-950">{selectedSurvey?.title}</DialogTitle>
            <DialogDescription>{selectedSurvey?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-8">
            {selectedSurvey?.questions.map((q: any) => (
              <div key={q.id} className="space-y-4">
                <Label className="text-base font-semibold text-slate-800">{q.text}</Label>
                
                {q.type === 'rating' ? (
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSurveyAnswers(prev => ({ ...prev, [q.id]: val }))}
                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold ${
                          surveyAnswers[q.id] === val 
                            ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Textarea 
                    placeholder="Enter your answer here..."
                    className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={surveyAnswers[q.id] || ''}
                    onChange={(e) => setSurveyAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsSurveyModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSurveySubmit} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
              <Send size={18} className="mr-2" />
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Feedback Modal */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Performance Review</DialogTitle>
            <DialogDescription>Submit a performance review for an employee.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select onValueChange={(val) => setFeedbackForm(prev => ({ ...prev, employeeId: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Search employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Performance Rating (1-5)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                    <button
                        key={val}
                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: val }))}
                        className={`p-2 rounded-lg transition-all ${
                            feedbackForm.rating >= val ? 'text-amber-500' : 'text-slate-200'
                        }`}
                    >
                        <Star fill={feedbackForm.rating >= val ? 'currentColor' : 'none'} size={28} />
                    </button>
                ))}
                <span className="ml-2 font-bold text-slate-600">{feedbackForm.rating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Review Content</Label>
              <Textarea 
                placeholder="Provide detailed feedback on performance, achievements, and goals..."
                className="min-h-[150px]"
                value={feedbackForm.content}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} className="bg-indigo-600 hover:bg-indigo-700">Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
