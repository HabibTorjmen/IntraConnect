// prisma/seeds/users.seeds.ts
import { PrismaClient } from '@prisma/client';
import { AuthHelpers } from '../../src/shared/helpers/auth.helpers';

const prisma = new PrismaClient();

export async function seed() {
  console.log('🚀 Starting seeding...');

  // 1️⃣ Permissions
  console.log('🔐 Creating permissions...');
  const permissionsData = [
    { action: 'manage', module: 'all' }, // Admin
    { action: 'create', module: 'users' },
    { action: 'read', module: 'users' },
    { action: 'manage', module: 'users' },
    { action: 'manage', module: 'roles' },
    { action: 'manage', module: 'permissions' },
    { action: 'read', module: 'employees' },
    { action: 'create', module: 'leave' },
    { action: 'read', module: 'leave' },
    { action: 'approve', module: 'leave' },
    { action: 'create', module: 'tickets' },
    { action: 'read', module: 'tickets' },
    { action: 'assign', module: 'tickets' },
    { action: 'manage', module: 'tickets' },
    { action: 'read', module: 'documents' },
    { action: 'manage', module: 'documents' },
    { action: 'manage', module: 'payroll' },
    { action: 'read', module: 'reports' },
    { action: 'read', module: 'dashboard' },
    { action: 'read', module: 'audit' },
    { action: 'manage', module: 'settings' },
    { action: 'manage', module: 'training' },
    { action: 'read', module: 'profile' },
    { action: 'update', module: 'profile' },
    { action: 'submit', module: 'feedback' },
    { action: 'read', module: 'tools' },
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

  const selectPermissions = (names: string[]) =>
    permissions.filter((permission) =>
      names.includes(`${permission.module}.${permission.action}`),
    );

  const managerPermissions = selectPermissions([
    'employees.read',
    'users.read',
    'leave.approve',
    'leave.read',
    'tickets.manage',
    'tickets.assign',
    'documents.read',
    'dashboard.read',
    'reports.read',
    'training.manage',
  ]);

  const employeePermissions = selectPermissions([
    'profile.read',
    'profile.update',
    'leave.create',
    'leave.read',
    'tickets.create',
    'tickets.read',
    'documents.read',
    'feedback.submit',
    'tools.read',
  ]);

  // 2️⃣ Roles
  console.log('📝 Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      code: 'admin',
      permissions: { set: permissions.map(p => ({ id: p.id })) }
    },
    create: { 
      name: 'admin',
      code: 'admin',
      permissions: { connect: permissions.map(p => ({ id: p.id })) }
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {
      code: 'manager',
      permissions: { 
        set: managerPermissions.map(p => ({ id: p.id })) 
      }
    },
    create: { 
      name: 'manager',
      code: 'manager',
      permissions: { 
        connect: managerPermissions.map(p => ({ id: p.id })) 
      }
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {
      code: 'employee',
      permissions: { 
        set: employeePermissions.map(p => ({ id: p.id })) 
      }
    },
    create: { 
      name: 'employee',
      code: 'employee',
      permissions: { 
        connect: employeePermissions.map(p => ({ id: p.id })) 
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
  const hashedPassword = await AuthHelpers.hash('Admin123!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@virtide.com' },
    update: {
      username: 'admin',
      passwordHash: hashedPassword,
      roles: { set: [{ id: adminRole.id }] },
    },
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
    update: {
      username: 'manager',
      passwordHash: await AuthHelpers.hash('Manager123!'),
      roles: { set: [{ id: managerRole.id }] },
    },
    create: {
      username: 'manager',
      email: 'manager@virtide.com',
      passwordHash: await AuthHelpers.hash('Manager123!'),
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
    update: {
      username: 'employee',
      passwordHash: await AuthHelpers.hash('Employee123!'),
      roles: { set: [{ id: employeeRole.id }] },
    },
    create: {
      username: 'employee',
      email: 'employee@virtide.com',
      passwordHash: await AuthHelpers.hash('Employee123!'),
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

