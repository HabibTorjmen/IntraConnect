import { Employee, LeaveRequest, Ticket, TrainingPlan, Payroll, Document, Survey, PerformanceFeedback, AuditLog } from '@/context/app-context'

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Nada Ben Romdhane',
    email: 'nada.br@intraconnect.com',
    phone: '+216 20 123 456',
    department: 'Executive',
    position: 'Chief Executive Officer',
    joinDate: '2020-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Akram Trimech',
    email: 'akram.tr@intraconnect.com',
    phone: '+216 50 987 654',
    department: 'Engineering',
    position: 'VP of Engineering',
    joinDate: '2021-06-01',
    status: 'active',
    managerId: '1'
  },
  {
    id: '3',
    name: 'Ines Jlassi',
    email: 'ines.jl@intraconnect.com',
    phone: '+216 98 456 789',
    department: 'Design',
    position: 'Design Director',
    joinDate: '2021-03-20',
    status: 'active',
    managerId: '1'
  },
  {
    id: '4',
    name: 'Sami Gharbi',
    email: 'sami.gh@intraconnect.com',
    phone: '+216 71 321 654',
    department: 'HR',
    position: 'HR Director',
    joinDate: '2021-11-10',
    status: 'active',
    managerId: '1'
  },
  {
    id: '5',
    name: 'Meriam Kallel',
    email: 'meriam.kl@intraconnect.com',
    phone: '+216 22 444 555',
    department: 'Engineering',
    position: 'Engineering Manager',
    joinDate: '2022-02-15',
    status: 'active',
    managerId: '2'
  },
  {
    id: '6',
    name: 'Yassine Belhadj',
    email: 'yassine.bh@intraconnect.com',
    phone: '+216 55 666 777',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2022-04-10',
    status: 'active',
    managerId: '5'
  },
  {
    id: '7',
    name: 'Olfa Hammami',
    email: 'olfa.hm@intraconnect.com',
    phone: '+216 99 888 999',
    department: 'Engineering',
    position: 'Backend Developer',
    joinDate: '2023-01-05',
    status: 'active',
    managerId: '5'
  },
  {
    id: '8',
    name: 'Firas Toumi',
    email: 'firas.tm@intraconnect.com',
    phone: '+216 44 222 333',
    department: 'Engineering',
    position: 'Frontend Developer',
    joinDate: '2023-02-14',
    status: 'active',
    managerId: '5'
  },
  {
    id: '9',
    name: 'Leila Ammar',
    email: 'leila.am@intraconnect.com',
    phone: '+216 21 000 111',
    department: 'Design',
    position: 'Senior UI Designer',
    joinDate: '2022-08-20',
    status: 'active',
    managerId: '3'
  },
  {
    id: '10',
    name: 'Omar Zaid',
    email: 'omar.zd@intraconnect.com',
    phone: '+216 58 555 666',
    department: 'HR',
    position: 'Recruiter',
    joinDate: '2022-10-12',
    status: 'active',
    managerId: '4'
  },
  {
    id: '11',
    name: 'Selma Rezgui',
    email: 'selma.rz@intraconnect.com',
    phone: '+216 93 111 222',
    department: 'HR',
    position: 'HR Specialist',
    joinDate: '2023-05-01',
    status: 'active',
    managerId: '4'
  },
  {
    id: '12',
    name: 'Anis Trabelsi',
    email: 'anis.tr@intraconnect.com',
    phone: '+216 27 777 888',
    department: 'Engineering',
    position: 'QA Engineer',
    joinDate: '2023-03-10',
    status: 'active',
    managerId: '5'
  }
]

export const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    employeeId: '1',
    employeeName: 'Nada Ben Romdhane',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    type: 'annual',
    reason: 'Family vacation',
    status: 'approved',
    createdAt: '2024-04-15T10:00:00Z'
  },
  {
    id: 'l2',
    employeeId: '2',
    employeeName: 'Akram Trimech',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    type: 'personal',
    reason: 'Personal errands',
    status: 'pending',
    createdAt: '2024-04-18T14:30:00Z'
  }
]

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    title: 'Monitor flickering',
    description: 'My secondary monitor keeps flickering every few minutes. I have tried swapping the HDMI cable but the issue persists.',
    priority: 'medium',
    status: 'in_progress',
    categoryId: '1',
    categoryName: 'IT Support',
    employeeId: '2',
    employeeName: 'Akram Trimech',
    assignedToId: '1',
    assignedToName: 'Nada Ben Romdhane',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    slaDeadline: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    slaStatus: 'ON_TRACK',
    comments: [
      {
        id: 'c1',
        content: 'I will bring a replacement monitor to your desk this afternoon.',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        authorId: '1',
        authorName: 'Nada Ben Romdhane'
      }
    ]
  },
  {
    id: 't2',
    title: 'Server Access Request',
    description: 'Need access to the staging server for the new project deployment.',
    priority: 'high',
    status: 'open',
    categoryId: '1',
    categoryName: 'IT Support',
    employeeId: '3',
    employeeName: 'Ines Jlassi',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    slaDeadline: new Date(Date.now() + 14400000).toISOString(), // 4 hours from now
    slaStatus: 'NEAR_BREACH',
    comments: []
  }
]

export const MOCK_TRAINING: TrainingPlan[] = [
  {
    id: 'tr1',
    title: 'React Advanced Patterns',
    description: 'Deep dive into hooks and performance optimization.',
    startDate: '2024-05-15',
    endDate: '2024-05-17',
    status: 'planned',
    employeeId: '2',
    employeeName: 'Akram Trimech'
  }
]

export const MOCK_PAYROLL: Payroll[] = [
  {
    id: 'p1',
    employeeId: '1',
    employeeName: 'Nada Ben Romdhane',
    status: 'paid',
    periodStart: '2024-03-01',
    periodEnd: '2024-03-31',
    netAmount: 3500.00
  }
]

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    title: 'Employee Handbook 2024',
    fileName: 'Internal_Handbook_2024.pdf',
    fileType: 'application/pdf',
    fileSize: 2450000,
    filePath: '',
    version: 1,
    isLatest: true,
    description: 'The latest version of the employee handbook.',
    category: 'HR',
    isPublic: true,
    uploadedById: '1',
    uploadedByName: 'Nada Ben Romdhane',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'd2',
    title: 'Q1 Financial Report',
    fileName: 'Q1_2024_Financials.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 1250000,
    filePath: '',
    version: 2,
    isLatest: true,
    description: 'Final Q1 financial statement.',
    category: 'Finance',
    isPublic: false,
    uploadedById: '2',
    uploadedByName: 'Akram Trimech',
    createdAt: '2024-04-05T14:30:00Z',
    updatedAt: '2024-04-05T14:30:00Z'
  }
]

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 's1',
    title: 'Employee Satisfaction 2024',
    description: 'We value your feedback. Please take a moment to share your thoughts on the workplace environment.',
    isActive: true,
    createdAt: '2024-04-01T10:00:00Z',
    questions: [
      { id: 'q1', text: 'How satisfied are you with your current role?', type: 'rating' },
      { id: 'q2', text: 'How would you rate the work-life balance?', type: 'rating' },
      { id: 'q3', text: 'Any suggestions for improvement?', type: 'text' }
    ]
  },
  {
    id: 's2',
    title: 'New Office Feedback',
    description: 'Tell us what you think about the new office facilities.',
    isActive: true,
    createdAt: '2024-04-15T09:00:00Z',
    questions: [
      { id: 'q1', text: 'Rate the new seating arrangement.', type: 'rating' },
      { id: 'q2', text: 'Rate the coffee machine quality.', type: 'rating' }
    ]
  }
]

export const MOCK_FEEDBACK: PerformanceFeedback[] = [
  {
    id: 'f1',
    content: 'Excellent leadership on the Project Phoenix. Your technical expertise was crucial.',
    rating: 5,
    employeeId: '2',
    employeeName: 'Akram Trimech',
    authorId: '1',
    authorName: 'Nada Ben Romdhane',
    createdAt: '2024-03-25T15:00:00Z'
  },
  {
    id: 'f2',
    content: 'Great attention to detail in the latest UI designs. Keep it up!',
    rating: 4,
    employeeId: '3',
    employeeName: 'Ines Jlassi',
    authorId: '2',
    authorName: 'Akram Trimech',
    createdAt: '2024-04-05T11:30:00Z'
  }
]

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a1',
    action: 'CREATE_EMPLOYEE',
    module: 'HR',
    details: 'Created employee: John Doe',
    userId: '1',
    userName: 'Nada Ben Romdhane',
    createdAt: '2024-04-18T09:15:00Z'
  },
  {
    id: 'a2',
    action: 'DELETE_DOCUMENT',
    module: 'DOCUMENTS',
    details: 'Deleted document: old_policy.pdf',
    userId: '2',
    userName: 'Akram Trimech',
    createdAt: '2024-04-19T14:45:00Z'
  },
  {
    id: 'a3',
    action: 'UPDATE_TICKET',
    module: 'TICKETS',
    details: 'Updated ticket status to RESOLVED',
    userId: '1',
    userName: 'Nada Ben Romdhane',
    createdAt: '2024-04-19T16:20:00Z'
  }
]
