// prisma/seeds/users.seeds.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seed() {
  console.log('🚀 Starting seeding...');

  // 1️⃣ Permissions
  console.log('🔐 Creating permissions...');
  const permissionsData = [
    { action: 'manage', module: 'all' }, // Admin
    { action: 'read', module: 'employees' },
    { action: 'create', module: 'tickets' },
    { action: 'update', module: 'tickets' },
    { action: 'approve', module: 'leave' },
    { action: 'view', module: 'payroll' },
    { action: 'create', module: 'Survey' },
    { action: 'read', module: 'Survey' },
    { action: 'create', module: 'PerformanceFeedback' },
    { action: 'read', module: 'PerformanceFeedback' },
    { action: 'create', module: 'TrainingPlan' },
    { action: 'read', module: 'TrainingPlan' },
    { action: 'read', module: 'AuditLog' },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { action_module: { action: p.action, module: p.module } },
      update: {},
      create: p,
    });
    permissions.push(perm);
  }

  // 2️⃣ Roles
  console.log('📝 Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      permissions: { connect: permissions.map(p => ({ id: p.id })) }
    },
    create: { 
      name: 'admin',
      permissions: { connect: permissions.map(p => ({ id: p.id })) }
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {
      permissions: { 
        connect: permissions.filter(p => ['read', 'create', 'update', 'approve'].includes(p.action)).map(p => ({ id: p.id })) 
      }
    },
    create: { 
      name: 'manager',
      permissions: { 
        connect: permissions.filter(p => ['read', 'create', 'update', 'approve'].includes(p.action)).map(p => ({ id: p.id })) 
      }
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {
      permissions: { 
        connect: permissions.filter(p => ['create', 'update', 'view'].includes(p.action)).map(p => ({ id: p.id })) 
      }
    },
    create: { 
      name: 'employee',
      permissions: { 
        connect: permissions.filter(p => ['create', 'update', 'view'].includes(p.action)).map(p => ({ id: p.id })) 
      }
    },
  });

  console.log('✅ Roles and Permissions created');

  // 3️⃣ Departments
  console.log('🏢 Creating departments...');
  const departmentsData = [
    { name: 'IT' },
    { name: 'Human Resources' },
    { name: 'Operations' },
    { name: 'Finance' },
  ];

  const deptMap: Record<string, string> = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    deptMap[dept.name] = d.id;
  }

  // 4️⃣ Tools
  console.log('🛠️ Creating tools...');
  const toolsData = [
    { name: 'Microsoft Teams', category: 'Communication' },
    { name: 'Jira', category: 'Project Management' },
    { name: 'Confluence', category: 'Documentation' },
    { name: 'GitLab', category: 'Development' },
  ];

  for (const tool of toolsData) {
    let existing = await prisma.tool.findFirst({ where: { name: tool.name } });
    if (!existing) {
      existing = await prisma.tool.create({
        data: {
          name: tool.name,
          category: tool.category,
          roles: { connect: [{ id: adminRole.id }] },
        },
      });
    }
  }

  // 5️⃣ Job Titles
  console.log('💼 Creating job titles...');
  const jobTitlesData = [
    { title: 'CEO', level: 'C-Level' },
    { title: 'CTO', level: 'C-Level' },
    { title: 'HR Director', level: 'Director' },
    { title: 'IT Manager', level: 'Manager' },
    { title: 'Senior Developer', level: 'Senior' },
    { title: 'Developer', level: 'Junior' },
    { title: 'HR Specialist', level: 'Specialist' },
  ];

  const jobTitleMap: Record<string, string> = {};
  for (const jt of jobTitlesData) {
    let existing = await prisma.jobTitle.findFirst({ where: { title: jt.title } });
    if (!existing) {
      existing = await prisma.jobTitle.create({
        data: { title: jt.title, level: jt.level },
      });
    }
    jobTitleMap[jt.title] = existing.id;
  }

  // 6️⃣ Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@virtide.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@virtide.com',
      passwordHash: hashedPassword,
      roles: { connect: [{ id: adminRole.id }] },
      employee: {
        create: {
          fullName: 'Admin System',
          departmentId: deptMap['IT'],
          status: 'active',
          jobTitleId: jobTitleMap['IT Manager'],
        },
      },
    },
    include: { employee: true },
  });

  // 7️⃣ Manager User
  console.log('👤 Creating manager user...');
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@virtide.com' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@virtide.com',
      passwordHash: await bcrypt.hash('Manager123!', 10),
      roles: { connect: [{ id: managerRole.id }] },
      employee: {
        create: {
          fullName: 'John Manager',
          departmentId: deptMap['Human Resources'],
          status: 'active',
          jobTitleId: jobTitleMap['HR Director'],
        },
      },
    },
    include: { employee: true },
  });

  // 8️⃣ Sample Employee User
  console.log('👤 Creating sample employee user...');
  const sampleUser = await prisma.user.upsert({
    where: { email: 'employee@virtide.com' },
    update: {},
    create: {
      username: 'employee',
      email: 'employee@virtide.com',
      passwordHash: await bcrypt.hash('Employee123!', 10),
      roles: { connect: [{ id: employeeRole.id }] },
      employee: {
        create: {
          fullName: 'Jane Employee',
          departmentId: deptMap['IT'],
          status: 'active',
          jobTitleId: jobTitleMap['Developer'],
          managerId: managerUser.employee?.id,
          leaveRequests: {
            create: [
              {
                startDate: new Date('2025-08-01'),
                endDate: new Date('2025-08-05'),
                type: 'annual',
                status: 'pending',
              },
            ],
          },
          tickets: {
            create: [
              {
                title: 'Cannot access GitLab',
                description: 'GitLab access is denied for my account.',
                status: 'open',
                priority: 'high',
              },
            ],
          },
        },
      },
    },
  });

  console.log('🎉 Seeding successfully completed!');
}
