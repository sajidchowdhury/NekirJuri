// ============================================================
// Madrasha ERP SaaS — Seed Script
// Creates realistic initial data for development & testing
// ============================================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── 1. SUBSCRIPTION PLANS (Global — no tenant_id) ───
  console.log('  → Creating subscription plans...')
  const freePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Free',
      slug: 'free',
      description: 'Basic plan for small Madrashas',
      priceMonthly: 0,
      priceYearly: 0,
      maxStudents: 50,
      maxEmployees: 5,
      maxStorageMb: 100,
      maxAlbums: 5,
      maxImagesPerAlbum: 20,
      maxImageSizeMb: 2,
      features: JSON.stringify({ website: false, accounting: false, inventory: false, payroll: false }),
      isActive: true,
    },
  })

  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic',
      slug: 'basic',
      description: 'Standard plan for growing Madrashas',
      priceMonthly: 29.99,
      priceYearly: 299.99,
      maxStudents: 300,
      maxEmployees: 20,
      maxStorageMb: 1024,
      maxAlbums: 15,
      maxImagesPerAlbum: 50,
      maxImageSizeMb: 5,
      features: JSON.stringify({ website: true, accounting: true, inventory: false, payroll: false }),
      isActive: true,
    },
  })

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Professional',
      slug: 'professional',
      description: 'Full-featured plan for large Madrashas',
      priceMonthly: 79.99,
      priceYearly: 799.99,
      maxStudents: 2000,
      maxEmployees: 100,
      maxStorageMb: 10240,
      maxAlbums: 50,
      maxImagesPerAlbum: 100,
      maxImageSizeMb: 10,
      features: JSON.stringify({ website: true, accounting: true, inventory: true, payroll: true }),
      isActive: true,
    },
  })

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Unlimited plan for chains & networks',
      priceMonthly: 199.99,
      priceYearly: 1999.99,
      maxStudents: 99999,
      maxEmployees: 99999,
      maxStorageMb: 102400,
      maxAlbums: 99999,
      maxImagesPerAlbum: 99999,
      maxImageSizeMb: 50,
      features: JSON.stringify({ website: true, accounting: true, inventory: true, payroll: true, customDomain: true, api: true }),
      isActive: true,
    },
  })

  // ─── 2. TENANT (Demo Madrasha) ───
  console.log('  → Creating demo tenant...')
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Jamia Islamia Darul Uloom',
      slug: 'jamia-islamia',
      domain: null,
      logoUrl: null,
      address: '123 Madrasha Road, Ward 5',
      city: 'Dhaka',
      state: 'Dhaka Division',
      country: 'Bangladesh',
      postalCode: '1216',
      phone: '+880-2-88881234',
      email: 'info@jamia-islamia.edu.bd',
      website: 'https://jamia-islamia.edu.bd',
      isActive: true,
      settings: JSON.stringify({
        currency: 'BDT',
        language: 'bn',
        dateFormat: 'DD/MM/YYYY',
        fiscalYearStart: '01',
        autoReceipt: true,
        smsEnabled: false,
        emailEnabled: true,
      }),
    },
  })

  // ─── 3. SUBSCRIPTION ───
  console.log('  → Creating subscription...')
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planId: proPlan.id,
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isAutoRenew: true,
    },
  })

  // ─── 4. PERMISSIONS (Global) ───
  console.log('  → Creating permissions...')
  const permissionDefs = [
    // Academic
    { name: 'View Academic Sessions', slug: 'academic-sessions.view', module: 'academic' },
    { name: 'Manage Academic Sessions', slug: 'academic-sessions.manage', module: 'academic' },
    { name: 'View Classes', slug: 'classes.view', module: 'academic' },
    { name: 'Manage Classes', slug: 'classes.manage', module: 'academic' },
    { name: 'View Students', slug: 'students.view', module: 'academic' },
    { name: 'Manage Students', slug: 'students.manage', module: 'academic' },
    { name: 'Promote Students', slug: 'students.promote', module: 'academic' },
    { name: 'View Guardians', slug: 'guardians.view', module: 'academic' },
    { name: 'Manage Guardians', slug: 'guardians.manage', module: 'academic' },
    { name: 'View Teachers', slug: 'teachers.view', module: 'academic' },
    { name: 'Manage Teachers', slug: 'teachers.manage', module: 'academic' },
    { name: 'View Employees', slug: 'employees.view', module: 'academic' },
    { name: 'Manage Employees', slug: 'employees.manage', module: 'academic' },
    // Finance
    { name: 'View Fee Categories', slug: 'fee-categories.view', module: 'finance' },
    { name: 'Manage Fee Categories', slug: 'fee-categories.manage', module: 'finance' },
    { name: 'View Fee Invoices', slug: 'fee-invoices.view', module: 'finance' },
    { name: 'Manage Fee Invoices', slug: 'fee-invoices.manage', module: 'finance' },
    { name: 'Collect Fees', slug: 'fees.collect', module: 'finance' },
    { name: 'Apply Fee Discounts', slug: 'fees.discount', module: 'finance' },
    { name: 'View Donations', slug: 'donations.view', module: 'finance' },
    { name: 'Manage Donations', slug: 'donations.manage', module: 'finance' },
    { name: 'View Expenses', slug: 'expenses.view', module: 'finance' },
    { name: 'Manage Expenses', slug: 'expenses.manage', module: 'finance' },
    { name: 'Approve Expenses', slug: 'expenses.approve', module: 'finance' },
    { name: 'View Payroll', slug: 'payroll.view', module: 'finance' },
    { name: 'Manage Payroll', slug: 'payroll.manage', module: 'finance' },
    { name: 'View Accounting', slug: 'accounting.view', module: 'finance' },
    { name: 'Manage Accounting', slug: 'accounting.manage', module: 'finance' },
    // Inventory
    { name: 'View Products', slug: 'products.view', module: 'inventory' },
    { name: 'Manage Products', slug: 'products.manage', module: 'inventory' },
    { name: 'View Purchases', slug: 'purchases.view', module: 'inventory' },
    { name: 'Manage Purchases', slug: 'purchases.manage', module: 'inventory' },
    { name: 'View Sales', slug: 'sales.view', module: 'inventory' },
    { name: 'Manage Sales', slug: 'sales.manage', module: 'inventory' },
    { name: 'Manage Stock', slug: 'stock.manage', module: 'inventory' },
    // CMS
    { name: 'View Website', slug: 'website.view', module: 'cms' },
    { name: 'Manage Website', slug: 'website.manage', module: 'cms' },
    { name: 'Manage Notices', slug: 'notices.manage', module: 'cms' },
    { name: 'Manage Gallery', slug: 'gallery.manage', module: 'cms' },
    // System
    { name: 'View Reports', slug: 'reports.view', module: 'system' },
    { name: 'Manage Users', slug: 'users.manage', module: 'system' },
    { name: 'Manage Roles', slug: 'roles.manage', module: 'system' },
    { name: 'Manage Settings', slug: 'settings.manage', module: 'system' },
    { name: 'View Audit Logs', slug: 'audit-logs.view', module: 'system' },
  ]

  const permissions = []
  for (const permDef of permissionDefs) {
    const perm = await prisma.permission.create({ data: permDef })
    permissions.push(perm)
  }

  // ─── 5. ROLES ───
  console.log('  → Creating roles...')
  const superAdminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access',
      isSystem: true,
    },
  })

  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Admin',
      slug: 'admin',
      description: 'Tenant administrator with full access',
      isSystem: true,
    },
  })

  const accountantRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Accountant',
      slug: 'accountant',
      description: 'Financial operations access',
      isSystem: false,
    },
  })

  const teacherRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Teacher',
      slug: 'teacher',
      description: 'Class teacher access',
      isSystem: false,
    },
  })

  const receptionistRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Receptionist',
      slug: 'receptionist',
      description: 'Student and fee collection access',
      isSystem: false,
    },
  })

  // Assign all permissions to Super Admin
  for (const perm of permissions) {
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: perm.id },
    })
  }

  // Assign most permissions to Admin (except audit logs)
  for (const perm of permissions) {
    if (perm.slug !== 'audit-logs.view') {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
      })
    }
  }

  // Finance permissions for Accountant
  const financePermSlugs = [
    'fee-categories.view', 'fee-invoices.view', 'fee-invoices.manage', 'fees.collect', 'fees.discount',
    'donations.view', 'donations.manage', 'expenses.view', 'expenses.manage', 'expenses.approve',
    'payroll.view', 'accounting.view', 'accounting.manage', 'reports.view',
    'students.view', 'classes.view', 'academic-sessions.view',
  ]
  for (const perm of permissions) {
    if (financePermSlugs.includes(perm.slug)) {
      await prisma.rolePermission.create({
        data: { roleId: accountantRole.id, permissionId: perm.id },
      })
    }
  }

  // Academic permissions for Teacher
  const teacherPermSlugs = [
    'students.view', 'classes.view', 'academic-sessions.view', 'guardians.view',
    'fee-invoices.view', 'notices.manage',
  ]
  for (const perm of permissions) {
    if (teacherPermSlugs.includes(perm.slug)) {
      await prisma.rolePermission.create({
        data: { roleId: teacherRole.id, permissionId: perm.id },
      })
    }
  }

  // ─── 6. USERS ───
  console.log('  → Creating users...')
  const superAdminUser = await prisma.user.create({
    data: {
      tenantId: null,
      email: 'superadmin@madrasha-erp.com',
      passwordHash: '$2b$10$dummyHashForDevelopmentOnly',
      name: 'System Super Admin',
      phone: '+880-1710000000',
      isActive: true,
      isSuperAdmin: true,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@jamia-islamia.edu.bd',
      passwordHash: '$2b$10$dummyHashForDevelopmentOnly',
      name: 'Maulana Abdul Karim',
      phone: '+880-1712345678',
      isActive: true,
      isSuperAdmin: false,
    },
  })

  const accountantUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'accountant@jamia-islamia.edu.bd',
      passwordHash: '$2b$10$dummyHashForDevelopmentOnly',
      name: 'Hafiz Mohammad Ali',
      phone: '+880-1712345679',
      isActive: true,
      isSuperAdmin: false,
    },
  })

  // Assign roles to users
  await prisma.userRole.create({ data: { userId: superAdminUser.id, roleId: superAdminRole.id } })
  await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } })
  await prisma.userRole.create({ data: { userId: accountantUser.id, roleId: accountantRole.id } })

  // ─── 7. ACADEMIC SESSION ───
  console.log('  → Creating academic session...')
  const academicSession = await prisma.academicSession.create({
    data: {
      tenantId: tenant.id,
      name: '2025-2026',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isCurrent: true,
      status: 'active',
    },
  })

  // ─── 8. TEACHERS ───
  console.log('  → Creating teachers...')
  const teacherData = [
    { name: 'Maulana Rafiq Ahmad', empId: 'TCH-001', phone: '+880-1711000001', qualification: 'M.A. Islamic Studies', specialization: 'Quran & Tafsir' },
    { name: 'Hafiz Ziaur Rahman', empId: 'TCH-002', phone: '+880-1711000002', qualification: 'Hafiz-e-Quran', specialization: 'Hifz' },
    { name: 'Qari Obaidullah', empId: 'TCH-003', phone: '+880-1711000003', qualification: 'Qari, B.A. Arabic', specialization: 'Tajweed & Qirat' },
    { name: 'Maulana Shafiqul Islam', empId: 'TCH-004', phone: '+880-1711000004', qualification: 'M.A. Arabic Literature', specialization: 'Arabic Language' },
    { name: 'Maulana Habibullah', empId: 'TCH-005', phone: '+880-1711000005', qualification: 'Dawra-e-Hadith', specialization: 'Hadith & Fiqh' },
  ]

  const teachers = []
  for (const td of teacherData) {
    const teacher = await prisma.teacher.create({
      data: {
        tenantId: tenant.id,
        employeeIdNo: td.empId,
        name: td.name,
        nameBn: td.name,
        gender: 'male',
        phone: td.phone,
        qualification: td.qualification,
        specialization: td.specialization,
        joiningDate: new Date('2020-01-15'),
        isActive: true,
        status: 'active',
      },
    })
    teachers.push(teacher)
  }

  // ─── 9. EMPLOYEES ───
  console.log('  → Creating employees...')
  const employeeData = [
    { name: 'Kamal Hossain', empId: 'EMP-001', designation: 'Accountant', department: 'Finance' },
    { name: 'Jamil Akter', empId: 'EMP-002', designation: 'Librarian', department: 'Library' },
    { name: 'Siddiqur Rahman', empId: 'EMP-003', designation: 'Caretaker', department: 'Admin' },
  ]

  const employees = []
  for (const ed of employeeData) {
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeIdNo: ed.empId,
        name: ed.name,
        phone: '+880-1712000001',
        designation: ed.designation,
        department: ed.department,
        joiningDate: new Date('2021-03-01'),
        isActive: true,
        status: 'active',
      },
    })
    employees.push(employee)
  }

  // ─── 10. CLASSES ───
  console.log('  → Creating classes...')
  const classData = [
    { name: 'Nursery', code: 'NUR', order: 1, capacity: 40 },
    { name: 'Kg', code: 'KG', order: 2, capacity: 45 },
    { name: 'Class 1', code: 'C1', order: 3, capacity: 50 },
    { name: 'Class 2', code: 'C2', order: 4, capacity: 50 },
    { name: 'Class 3', code: 'C3', order: 5, capacity: 50 },
    { name: 'Class 4', code: 'C4', order: 6, capacity: 50 },
    { name: 'Class 5', code: 'C5', order: 7, capacity: 50 },
    { name: 'Hifz Class', code: 'HIFZ', order: 8, capacity: 30 },
    { name: 'Alim Part 1', code: 'ALIM1', order: 9, capacity: 35 },
    { name: 'Alim Part 2', code: 'ALIM2', order: 10, capacity: 35 },
  ]

  const classes = []
  for (const cd of classData) {
    const cls = await prisma.class.create({
      data: {
        tenantId: tenant.id,
        name: cd.name,
        code: cd.code,
        orderSequence: cd.order,
        academicSessionId: academicSession.id,
        teacherId: teachers[classData.indexOf(cd) % teachers.length]?.id,
        capacity: cd.capacity,
        status: 'active',
      },
    })
    classes.push(cls)
  }

  // ─── 11. SECTIONS ───
  console.log('  → Creating sections...')
  const sections = []
  for (const cls of classes.slice(0, 5)) {
    for (const secName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          tenantId: tenant.id,
          classId: cls.id,
          name: secName,
          capacity: 25,
          status: 'active',
        },
      })
      sections.push(section)
    }
  }
  // Single section for remaining classes
  for (const cls of classes.slice(5)) {
    const section = await prisma.section.create({
      data: {
        tenantId: tenant.id,
        classId: cls.id,
        name: 'A',
        capacity: cls.capacity ?? 30,
        status: 'active',
      },
    })
    sections.push(section)
  }

  // ─── 12. GUARDIANS ───
  console.log('  → Creating guardians...')
  const guardianNames = [
    'Abdul Halim', 'Mohammad Yunus', 'Ibrahim Khalil', 'Abdus Samad', 'Shahidullah',
    'Mizanur Rahman', 'Abul Kashem', 'Nurul Islam', 'Fazlul Karim', 'Tajul Islam',
    'Jafar Ahmad', 'Mahbubul Haq', 'Shamsul Arifin', 'Enayetullah', 'Sirajul Haq',
  ]

  const guardians = []
  for (let i = 0; i < guardianNames.length; i++) {
    const guardian = await prisma.guardian.create({
      data: {
        tenantId: tenant.id,
        name: guardianNames[i],
        relationship: 'father',
        phone: `+880-1713${String(i + 1).padStart(6, '0')}`,
        email: `guardian${i + 1}@example.com`,
        occupation: ['Business', 'Teacher', 'Farmer', 'Government Service', 'Private Service'][i % 5],
        address: `Village ${i + 1}, Dhaka`,
        city: 'Dhaka',
        isActive: true,
      },
    })
    guardians.push(guardian)
  }

  // ─── 13. STUDENTS ───
  console.log('  → Creating students...')
  const studentNames = [
    'Ahmad Ibn Abdullah', 'Muhammad Zubair', 'Abdullah Al Mamun', 'Ibrahim Hossain', 'Yusuf Ali',
    'Hamza Rahman', 'Bilal Ahmed', 'Umar Farooq', 'Ali Hasan', 'Khalid Saifullah',
    'Tariq Jameel', 'Zaid bin Haris', 'Ayyub Khan', 'Sulaiman Das', 'Imran Hossain',
    'Saad bin Waqas', 'Hassan Askari', 'Hussain Madani', 'Qasim Raza', 'Nasiruddin',
    'Fahim Aziz', 'Rashid Ahmad', 'Naeem Akhtar', 'Waseem Raza', 'Ateeq Rahman',
    'Tahmid Hasan', 'Mashruf Hossain', 'Sakib Ahmed', 'Rafiq Islam', 'Mahir Abdullah',
  ]

  const students = []
  for (let i = 0; i < studentNames.length; i++) {
    const classIndex = Math.floor(i / 3) % classes.length
    const cls = classes[classIndex]
    const classSections = sections.filter(s => s.classId === cls.id)
    const section = classSections[i % classSections.length] ?? null

    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        registrationNo: `REG-${String(2025001 + i).padStart(7, '0')}`,
        admissionNo: `ADM-${String(1001 + i).padStart(4, '0')}`,
        name: studentNames[i],
        nameBn: studentNames[i],
        fatherName: guardianNames[i % guardianNames.length],
        gender: 'male',
        nationality: 'Bangladeshi',
        religion: 'Islam',
        dateOfBirth: new Date(2010 + Math.floor(i / 10), (i % 12), 1),
        classId: cls.id,
        sectionId: section?.id,
        academicSessionId: academicSession.id,
        admissionDate: new Date('2025-01-15'),
        rollNo: String(i % 25 + 1),
        isActive: true,
        status: 'admitted',
      },
    })
    students.push(student)

    // Link guardian to student
    const guardian = guardians[i % guardians.length]
    await prisma.studentGuardian.create({
      data: {
        studentId: student.id,
        guardianId: guardian.id,
        isPrimary: true,
      },
    })
  }

  // ─── 14. FEE CATEGORIES ───
  console.log('  → Creating fee categories...')
  const feeCategoryData = [
    { name: 'Admission Fee', code: 'ADM-FEE', amount: 5000, isRecurring: false, frequency: 'one_time' },
    { name: 'Tuition Fee', code: 'TUI-FEE', amount: 1500, isRecurring: true, frequency: 'monthly' },
    { name: 'Exam Fee', code: 'EXM-FEE', amount: 500, isRecurring: true, frequency: 'quarterly' },
    { name: 'Library Fee', code: 'LIB-FEE', amount: 200, isRecurring: true, frequency: 'yearly' },
    { name: 'Development Fee', code: 'DEV-FEE', amount: 1000, isRecurring: true, frequency: 'yearly' },
    { name: 'Hifz Fee', code: 'HIFZ-FEE', amount: 2000, isRecurring: true, frequency: 'monthly' },
  ]

  const feeCategories = []
  for (const fcd of feeCategoryData) {
    const fc = await prisma.feeCategory.create({
      data: {
        tenantId: tenant.id,
        name: fcd.name,
        code: fcd.code,
        amount: fcd.amount,
        isRecurring: fcd.isRecurring,
        frequency: fcd.frequency,
        isActive: true,
      },
    })
    feeCategories.push(fc)
  }

  // ─── 15. FEE STRUCTURES (Class ↔ Fee mapping) ───
  console.log('  → Creating fee structures...')
  for (const cls of classes) {
    // Admission fee for all classes
    await prisma.feeStructure.create({
      data: {
        tenantId: tenant.id,
        classId: cls.id,
        feeCategoryId: feeCategories[0].id, // Admission Fee
        academicSessionId: academicSession.id,
        amount: feeCategories[0].amount,
        isMandatory: true,
      },
    })

    // Tuition fee (different for Hifz/Alim)
    const tuitionAmount = cls.code.startsWith('HIFZ') || cls.code.startsWith('ALIM') ? 2000 : 1500
    const tuitionCategory = cls.code.startsWith('HIFZ') ? feeCategories[5] : feeCategories[1]
    await prisma.feeStructure.create({
      data: {
        tenantId: tenant.id,
        classId: cls.id,
        feeCategoryId: tuitionCategory.id,
        academicSessionId: academicSession.id,
        amount: tuitionAmount,
        isMandatory: true,
      },
    })

    // Exam fee
    await prisma.feeStructure.create({
      data: {
        tenantId: tenant.id,
        classId: cls.id,
        feeCategoryId: feeCategories[2].id, // Exam Fee
        academicSessionId: academicSession.id,
        amount: 500,
        isMandatory: true,
      },
    })
  }

  // ─── 16. FEE INVOICES (sample) ───
  console.log('  → Creating sample fee invoices...')
  for (let i = 0; i < 10; i++) {
    const student = students[i]
    const cls = classes.find(c => c.id === student.classId)!
    const totalAmount = 1500 + (i * 100)
    const invoice = await prisma.feeInvoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNo: `INV-2025-${String(i + 1).padStart(5, '0')}`,
        studentId: student.id,
        academicSessionId: academicSession.id,
        classId: cls.id,
        issueDate: new Date('2025-01-01'),
        dueDate: new Date('2025-01-31'),
        totalAmount: totalAmount,
        paidAmount: i < 5 ? totalAmount : 0,
        discountAmount: 0,
        fineAmount: 0,
        balance: i < 5 ? 0 : totalAmount,
        status: i < 5 ? 'paid' : 'unpaid',
        feeMonth: 1,
        feeYear: 2025,
      },
    })

    // Invoice items
    await prisma.feeInvoiceItem.create({
      data: {
        tenantId: tenant.id,
        invoiceId: invoice.id,
        feeCategoryId: feeCategories[1].id,
        amount: totalAmount,
        discountAmount: 0,
        netAmount: totalAmount,
      },
    })

    // Fee collection for paid invoices
    if (i < 5) {
      await prisma.feeCollection.create({
        data: {
          tenantId: tenant.id,
          receiptNo: `RCT-2025-${String(i + 1).padStart(5, '0')}`,
          invoiceId: invoice.id,
          studentId: student.id,
          amount: totalAmount,
          paymentMethod: 'cash',
          paymentDate: new Date('2025-01-15'),
          status: 'completed',
          createdBy: adminUser.id,
        },
      })
    }
  }

  // ─── 17. DONATION CATEGORIES ───
  console.log('  → Creating donation categories...')
  const donationCategories = []
  for (const dcData of [
    { name: 'Zakat', description: 'Obligatory annual alms' },
    { name: 'Sadaqah', description: 'Voluntary charity' },
    { name: 'Lillah', description: 'Donation for the sake of Allah' },
    { name: 'General Donation', description: 'General purpose donations' },
  ]) {
    const dc = await prisma.donationCategory.create({
      data: {
        tenantId: tenant.id,
        name: dcData.name,
        description: dcData.description,
        isActive: true,
      },
    })
    donationCategories.push(dc)
  }

  // ─── 18. DONORS ───
  console.log('  → Creating donors...')
  const donors = []
  for (let i = 0; i < 8; i++) {
    const donor = await prisma.donor.create({
      data: {
        tenantId: tenant.id,
        name: [`Al-Haj Moosa`, `Haji Ishaq`, `Janab Khalil`, `Al-Haj Siddiq`, `Haji Rafique`, `Al-Haj Zubair`, `Janab Amin`, `Haji Wahid`][i],
        phone: `+880-1714${String(i + 1).padStart(6, '0')}`,
        email: `donor${i + 1}@example.com`,
        occupation: ['Business', 'Retired', 'Business', 'Government', 'Business', 'Private', 'Business', 'Retired'][i],
        isRegular: i < 5,
        isActive: true,
      },
    })
    donors.push(donor)
  }

  // ─── 19. DONATIONS (sample) ───
  console.log('  → Creating sample donations...')
  const donationAmounts = [50000, 25000, 100000, 30000, 75000, 15000, 40000, 20000]
  for (let i = 0; i < 8; i++) {
    await prisma.donation.create({
      data: {
        tenantId: tenant.id,
        donationCategoryId: donationCategories[i % donationCategories.length].id,
        donorId: donors[i].id,
        receiptNo: `DON-2025-${String(i + 1).padStart(5, '0')}`,
        amount: donationAmounts[i],
        paymentMethod: i % 2 === 0 ? 'cash' : 'bank_transfer',
        paymentDate: new Date(2025, 0, 5 + i),
        isAnonymous: false,
        status: 'completed',
        createdBy: accountantUser.id,
      },
    })
  }

  // ─── 20. EXPENSE CATEGORIES ───
  console.log('  → Creating expense categories...')
  const expenseCategories = []
  for (const ecData of [
    { name: 'Utilities', code: 'UTIL' },
    { name: 'Stationery', code: 'STAT' },
    { name: 'Maintenance', code: 'MAINT' },
    { name: 'Food & Provisions', code: 'FOOD' },
    { name: 'Transport', code: 'TRANS' },
    { name: 'Medical', code: 'MED' },
    { name: 'Construction', code: 'CONST' },
    { name: 'Miscellaneous', code: 'MISC' },
  ]) {
    const ec = await prisma.expenseCategory.create({
      data: {
        tenantId: tenant.id,
        name: ecData.name,
        code: ecData.code,
        isActive: true,
      },
    })
    expenseCategories.push(ec)
  }

  // ─── 21. EXPENSES (sample) ───
  console.log('  → Creating sample expenses...')
  const expenseData = [
    { catIndex: 0, amount: 8000, desc: 'Electricity bill - January', paidTo: 'DESCO' },
    { catIndex: 0, amount: 3000, desc: 'Water bill - January', paidTo: 'WASA' },
    { catIndex: 1, amount: 5000, desc: 'Books and stationery purchase', paidTo: 'Islamic Book House' },
    { catIndex: 3, amount: 25000, desc: 'Monthly food provisions', paidTo: 'Karwan Bazar Wholesale' },
    { catIndex: 2, amount: 15000, desc: 'Building maintenance & repair', paidTo: 'Ahmed Construction' },
    { catIndex: 5, amount: 4000, desc: 'Medical supplies for dispensary', paidTo: 'Islami Pharmacy' },
  ]

  for (let i = 0; i < expenseData.length; i++) {
    const ed = expenseData[i]
    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        voucherNo: `EXP-2025-${String(i + 1).padStart(5, '0')}`,
        expenseCategoryId: expenseCategories[ed.catIndex].id,
        amount: ed.amount,
        description: ed.desc,
        expenseDate: new Date(2025, 0, 10 + i),
        paymentMethod: 'cash',
        paidTo: ed.paidTo,
        status: 'paid',
        approvedBy: adminUser.id,
        createdBy: accountantUser.id,
      },
    })
  }

  // ─── 22. SALARY STRUCTURES ───
  console.log('  → Creating salary structures...')
  for (const teacher of teachers) {
    await prisma.salaryStructure.create({
      data: {
        tenantId: tenant.id,
        employeeType: 'teacher',
        teacherId: teacher.id,
        basicSalary: 15000,
        houseRent: 5000,
        medicalAllowance: 2000,
        transportAllowance: 1500,
        otherAllowance: 0,
        totalSalary: 23500,
        pfDeduction: 1500,
        taxDeduction: 0,
        otherDeduction: 0,
        netSalary: 22000,
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdBy: adminUser.id,
      },
    })
  }

  for (const employee of employees) {
    const basic = employee.designation === 'Accountant' ? 12000 : 8000
    await prisma.salaryStructure.create({
      data: {
        tenantId: tenant.id,
        employeeType: 'staff',
        employeeId: employee.id,
        basicSalary: basic,
        houseRent: basic * 0.3,
        medicalAllowance: 1500,
        transportAllowance: 1000,
        otherAllowance: 0,
        totalSalary: basic + basic * 0.3 + 1500 + 1000,
        pfDeduction: basic * 0.1,
        taxDeduction: 0,
        otherDeduction: 0,
        netSalary: basic + basic * 0.3 + 1500 + 1000 - basic * 0.1,
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdBy: adminUser.id,
      },
    })
  }

  // ─── 23. SUPPLIERS ───
  console.log('  → Creating suppliers...')
  const suppliers = []
  for (const sd of [
    { name: 'Islamic Book House', code: 'SUP-001', phone: '+880-2-5551234', city: 'Dhaka' },
    { name: 'Al-Madina Store', code: 'SUP-002', phone: '+880-2-5555678', city: 'Chittagong' },
    { name: 'Taqwa Uniforms', code: 'SUP-003', phone: '+880-2-5559012', city: 'Dhaka' },
  ]) {
    const supplier = await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        name: sd.name,
        code: sd.code,
        phone: sd.phone,
        city: sd.city,
        isActive: true,
      },
    })
    suppliers.push(supplier)
  }

  // ─── 24. PRODUCT CATEGORIES & PRODUCTS ───
  console.log('  → Creating product categories & products...')
  const bookCat = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: 'Books', code: 'BOOK', isActive: true },
  })
  const uniformCat = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: 'Uniforms', code: 'UNIF', isActive: true },
  })
  const stationeryCat = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: 'Stationery', code: 'STAT', isActive: true },
  })

  const products = []
  for (const pd of [
    { name: 'Quran (Uthmani Script)', code: 'BK-QUR01', catId: bookCat.id, purchasePrice: 150, salePrice: 200, unit: 'piece' },
    { name: 'Noorani Qaida', code: 'BK-NQ01', catId: bookCat.id, purchasePrice: 50, salePrice: 80, unit: 'piece' },
    { name: 'Mishkatul Masabih', code: 'BK-MM01', catId: bookCat.id, purchasePrice: 300, salePrice: 400, unit: 'piece' },
    { name: 'White Kurta (M)', code: 'UF-KM01', catId: uniformCat.id, purchasePrice: 350, salePrice: 500, unit: 'piece' },
    { name: 'White Cap', code: 'UF-CP01', catId: uniformCat.id, purchasePrice: 80, salePrice: 120, unit: 'piece' },
    { name: 'Exercise Book (100pg)', code: 'ST-EX01', catId: stationeryCat.id, purchasePrice: 20, salePrice: 35, unit: 'piece' },
    { name: 'Pen (Ball Point)', code: 'ST-PN01', catId: stationeryCat.id, purchasePrice: 5, salePrice: 10, unit: 'piece' },
  ]) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: pd.name,
        code: pd.code,
        categoryId: pd.catId,
        purchasePrice: pd.purchasePrice,
        salePrice: pd.salePrice,
        currentStock: 50,
        minStockLevel: 10,
        unit: pd.unit,
        isActive: true,
      },
    })
    products.push(product)
  }

  // ─── 25. CHART OF ACCOUNTS ───
  console.log('  → Creating chart of accounts...')
  const accountDefs = [
    // Assets
    { code: '1000', name: 'Cash in Hand', type: 'asset' },
    { code: '1100', name: 'Bank Account - Main', type: 'asset' },
    { code: '1200', name: 'Petty Cash', type: 'asset' },
    { code: '1300', name: 'Accounts Receivable', type: 'asset' },
    { code: '1400', name: 'Inventory', type: 'asset' },
    { code: '1500', name: 'Fixed Assets', type: 'asset' },
    // Liabilities
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '2100', name: 'Salary Payable', type: 'liability' },
    { code: '2200', name: 'Fee Advance Received', type: 'liability' },
    // Equity
    { code: '3000', name: 'General Fund', type: 'equity' },
    { code: '3100', name: 'Reserved Fund', type: 'equity' },
    // Income
    { code: '4000', name: 'Fee Income', type: 'income' },
    { code: '4100', name: 'Donation Income', type: 'income' },
    { code: '4200', name: 'Sales Income', type: 'income' },
    { code: '4300', name: 'Other Income', type: 'income' },
    // Expense
    { code: '5000', name: 'Salary Expense', type: 'expense' },
    { code: '5100', name: 'Utility Expense', type: 'expense' },
    { code: '5200', name: 'Maintenance Expense', type: 'expense' },
    { code: '5300', name: 'Food & Provisions', type: 'expense' },
    { code: '5400', name: 'Stationery & Supplies', type: 'expense' },
    { code: '5500', name: 'Miscellaneous Expense', type: 'expense' },
  ]

  for (const ad of accountDefs) {
    await prisma.chartOfAccount.create({
      data: {
        tenantId: tenant.id,
        code: ad.code,
        name: ad.name,
        accountType: ad.type,
        isActive: true,
        openingBalance: ad.code === '1000' ? 500000 : 0,
        currentBalance: ad.code === '1000' ? 500000 : 0,
        isSystem: ['1000', '2000', '3000', '4000', '5000'].includes(ad.code),
      },
    })
  }

  // ─── 26. SETTINGS ───
  console.log('  → Creating settings...')
  const settingsData = [
    { key: 'institution_name', value: 'Jamia Islamia Darul Uloom' },
    { key: 'institution_name_bn', value: 'জামিয়া ইসলামিয়া দারুল উলূম' },
    { key: 'currency', value: 'BDT' },
    { key: 'currency_symbol', value: '৳' },
    { key: 'language', value: 'bn' },
    { key: 'date_format', value: 'DD/MM/YYYY' },
    { key: 'fiscal_year_start', value: '01' },
    { key: 'auto_receipt', value: 'true' },
    { key: 'sms_enabled', value: 'false' },
    { key: 'email_enabled', value: 'true' },
    { key: 'fee_due_reminder_days', value: '7' },
    { key: 'receipt_prefix', value: 'RCT' },
    { key: 'invoice_prefix', value: 'INV' },
    { key: 'voucher_prefix', value: 'EXP' },
    { key: 'donation_receipt_prefix', value: 'DON' },
  ]

  for (const sd of settingsData) {
    await prisma.settings.create({
      data: {
        tenantId: tenant.id,
        key: sd.key,
        value: sd.value,
      },
    })
  }

  // ─── 27. NOTICES ───
  console.log('  → Creating sample notices...')
  await prisma.notice.createMany({
    data: [
      {
        tenantId: tenant.id,
        title: 'Admission Open for 2025-2026',
        content: 'Admission is now open for the academic session 2025-2026. Please contact the office for details.',
        noticeType: 'general',
        isPublished: true,
        publishedAt: new Date('2025-01-01'),
        targetAudience: 'all',
        createdBy: adminUser.id,
      },
      {
        tenantId: tenant.id,
        title: 'Fee Payment Deadline - January',
        content: 'All students are requested to pay their fees by 31st January 2025.',
        noticeType: 'urgent',
        isPublished: true,
        publishedAt: new Date('2025-01-05'),
        targetAudience: 'guardians',
        createdBy: adminUser.id,
      },
      {
        tenantId: tenant.id,
        title: 'Annual Milad Program',
        content: 'The annual Milad-un-Nabi program will be held on 12th Rabi-ul-Awal.',
        noticeType: 'event',
        isPublished: true,
        publishedAt: new Date('2025-01-10'),
        targetAudience: 'all',
        createdBy: adminUser.id,
      },
    ],
  })

  // ─── 28. WEBSITE PAGES ───
  console.log('  → Creating website pages...')
  await prisma.websitePage.createMany({
    data: [
      {
        tenantId: tenant.id,
        title: 'About Us',
        slug: 'about-us',
        content: '<p>Jamia Islamia Darul Uloom is a renowned Islamic institution dedicated to providing quality Islamic and modern education.</p>',
        isPublished: true,
        publishedAt: new Date('2025-01-01'),
        sortOrder: 1,
        createdBy: adminUser.id,
      },
      {
        tenantId: tenant.id,
        title: 'Academic Programs',
        slug: 'academic-programs',
        content: '<p>We offer comprehensive Islamic education including Hifz, Alim, and Fadil programs alongside modern subjects.</p>',
        isPublished: true,
        publishedAt: new Date('2025-01-01'),
        sortOrder: 2,
        createdBy: adminUser.id,
      },
      {
        tenantId: tenant.id,
        title: 'Donation',
        slug: 'donation',
        content: '<p>Support our mission of spreading Islamic knowledge. Donate Zakat, Sadaqah, or Lillah.</p>',
        isPublished: true,
        publishedAt: new Date('2025-01-01'),
        sortOrder: 3,
        createdBy: adminUser.id,
      },
    ],
  })

  // ─── 29. GALLERY ───
  console.log('  → Creating gallery...')
  const gallery = await prisma.gallery.create({
    data: {
      tenantId: tenant.id,
      title: 'Annual Program 2025',
      description: 'Photos from the annual Milad program',
      isPublished: true,
      createdBy: adminUser.id,
    },
  })

  // ─── 30. ACTIVITY LOGS (sample) ───
  console.log('  → Creating sample activity logs...')
  await prisma.activityLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: 'student.created',
        entityType: 'student',
        description: '30 students admitted for session 2025-2026',
      },
      {
        tenantId: tenant.id,
        userId: accountantUser.id,
        action: 'fee.collected',
        entityType: 'fee_collection',
        description: 'Fee collected for January 2025',
      },
      {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: 'donation.received',
        entityType: 'donation',
        description: 'Zakat donation received from donors',
      },
      {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: 'user.login',
        entityType: 'user',
        description: 'Admin logged in',
      },
    ],
  })

  console.log('')
  console.log('✅ Seeding complete!')
  console.log(`  Tenant: ${tenant.name} (ID: ${tenant.id})`)
  console.log(`  Users: 3 (super-admin, admin, accountant)`)
  console.log(`  Students: ${students.length}`)
  console.log(`  Teachers: ${teachers.length}`)
  console.log(`  Classes: ${classes.length}`)
  console.log(`  Sections: ${sections.length}`)
  console.log(`  Guardians: ${guardians.length}`)
  console.log(`  Permissions: ${permissions.length}`)
  console.log(`  Products: ${products.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
