// ============================================================
// Zod Validation Schemas — Academic Domain Entities
// Students, Teachers, Employees, Guardians, Classes, Sections, AcademicSessions
// ============================================================

import { z } from 'zod'

// ── Shared Enums ──────────────────────────────────────────

const GenderEnum = z.enum(['Male', 'Female', 'Other'])
const BloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
const StatusEnum = z.enum(['active', 'inactive', 'graduated', 'transferred', 'suspended'])
const TeacherStatusEnum = z.enum(['active', 'inactive', 'on_leave', 'resigned'])
const EmployeeStatusEnum = z.enum(['active', 'inactive', 'on_leave', 'resigned'])
const AcademicSessionStatusEnum = z.enum(['upcoming', 'active', 'completed', 'archived'])
const ClassStatusEnum = z.enum(['active', 'inactive', 'archived'])
const SectionStatusEnum = z.enum(['active', 'inactive'])
const RelationshipEnum = z.enum(['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt', 'Brother', 'Sister', 'Other'])

// ── Student ───────────────────────────────────────────────

export const studentCreateSchema = z.object({
  registrationNo: z.string().min(1).max(50),
  admissionNo: z.string().max(50).optional(),
  name: z.string().min(1).max(200),
  nameBn: z.string().max(200).optional(),
  fatherName: z.string().max(200).optional(),
  motherName: z.string().max(200).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  gender: GenderEnum.optional(),
  bloodGroup: BloodGroupEnum.optional(),
  nationality: z.string().max(100).optional(),
  religion: z.string().max(50).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.string().max(0)).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(200).optional().or(z.string().max(0)).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  classId: z.number().int().positive(),
  sectionId: z.number().int().positive().optional().nullable(),
  academicSessionId: z.number().int().positive(),
  admissionDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  previousSchool: z.string().max(200).optional(),
  rollNo: z.string().max(20).optional(),
  status: StatusEnum.optional(),
  guardianIds: z.array(z.object({
    guardianId: z.number().int().positive(),
    isPrimary: z.boolean().optional(),
  }).or(z.number().int().positive())).optional(),
})

export const studentUpdateSchema = z.object({
  registrationNo: z.string().min(1).max(50).optional(),
  admissionNo: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional().nullable(),
  fatherName: z.string().max(200).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  gender: GenderEnum.optional().nullable(),
  bloodGroup: BloodGroupEnum.optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  religion: z.string().max(50).optional().nullable(),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  classId: z.number().int().positive().optional(),
  sectionId: z.number().int().positive().optional().nullable(),
  academicSessionId: z.number().int().positive().optional(),
  admissionDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  previousSchool: z.string().max(200).optional().nullable(),
  rollNo: z.string().max(20).optional().nullable(),
  status: StatusEnum.optional(),
  guardianIds: z.array(z.object({
    guardianId: z.number().int().positive(),
    isPrimary: z.boolean().optional(),
  }).or(z.number().int().positive())).optional(),
})

// ── Teacher ───────────────────────────────────────────────

export const teacherCreateSchema = z.object({
  employeeIdNo: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameBn: z.string().max(200).optional(),
  fatherName: z.string().max(200).optional(),
  motherName: z.string().max(200).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  gender: GenderEnum.optional(),
  bloodGroup: BloodGroupEnum.optional(),
  nationality: z.string().max(100).optional(),
  religion: z.string().max(50).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.string().max(0)).optional(),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(200).optional().or(z.string().max(0)).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  qualification: z.string().max(200).optional(),
  specialization: z.string().max(200).optional(),
  joiningDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  leavingDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  status: TeacherStatusEnum.optional(),
})

export const teacherUpdateSchema = z.object({
  employeeIdNo: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional().nullable(),
  fatherName: z.string().max(200).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  gender: GenderEnum.optional().nullable(),
  bloodGroup: BloodGroupEnum.optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  religion: z.string().max(50).optional().nullable(),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  qualification: z.string().max(200).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
  joiningDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  leavingDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  status: TeacherStatusEnum.optional(),
})

// ── Employee ──────────────────────────────────────────────

export const employeeCreateSchema = z.object({
  employeeIdNo: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameBn: z.string().max(200).optional(),
  fatherName: z.string().max(200).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  gender: GenderEnum.optional(),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(200).optional().or(z.string().max(0)).optional(),
  address: z.string().max(500).optional(),
  designation: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  joiningDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  leavingDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.string().max(0)).optional(),
  status: EmployeeStatusEnum.optional(),
})

export const employeeUpdateSchema = z.object({
  employeeIdNo: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional().nullable(),
  fatherName: z.string().max(200).optional().nullable(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  gender: GenderEnum.optional().nullable(),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  designation: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  joiningDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  leavingDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  status: EmployeeStatusEnum.optional(),
})

// ── Guardian ──────────────────────────────────────────────

export const guardianCreateSchema = z.object({
  name: z.string().min(1).max(200),
  nameBn: z.string().max(200).optional(),
  relationship: RelationshipEnum,
  phone: z.string().min(1).max(20),
  phoneAlt: z.string().max(20).optional(),
  email: z.string().email().max(200).optional().or(z.string().max(0)).optional(),
  occupation: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.string().max(0)).optional(),
  nidNo: z.string().max(30).optional(),
})

export const guardianUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional().nullable(),
  relationship: RelationshipEnum.optional(),
  phone: z.string().min(1).max(20).optional(),
  phoneAlt: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  occupation: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  photoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  nidNo: z.string().max(30).optional().nullable(),
})

// ── Class ─────────────────────────────────────────────────

export const classCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  orderSequence: z.number().int().min(0),
  academicSessionId: z.number().int().positive(),
  teacherId: z.number().int().positive().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  status: ClassStatusEnum.optional(),
})

export const classUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  orderSequence: z.number().int().min(0).optional(),
  academicSessionId: z.number().int().positive().optional(),
  teacherId: z.number().int().positive().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  status: ClassStatusEnum.optional(),
})

// ── Section ───────────────────────────────────────────────

export const sectionCreateSchema = z.object({
  classId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  teacherId: z.number().int().positive().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  status: SectionStatusEnum.optional(),
})

export const sectionUpdateSchema = z.object({
  classId: z.number().int().positive().optional(),
  name: z.string().min(1).max(100).optional(),
  teacherId: z.number().int().positive().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  status: SectionStatusEnum.optional(),
})

// ── Academic Session ──────────────────────────────────────

export const academicSessionCreateSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  isCurrent: z.boolean().optional(),
  status: AcademicSessionStatusEnum.optional(),
})

export const academicSessionUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  isCurrent: z.boolean().optional(),
  status: AcademicSessionStatusEnum.optional(),
})

// ── Type Exports ──────────────────────────────────────────

export type StudentCreateInput = z.infer<typeof studentCreateSchema>
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>
export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>
export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>
export type GuardianCreateInput = z.infer<typeof guardianCreateSchema>
export type GuardianUpdateInput = z.infer<typeof guardianUpdateSchema>
export type ClassCreateInput = z.infer<typeof classCreateSchema>
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>
export type AcademicSessionCreateInput = z.infer<typeof academicSessionCreateSchema>
export type AcademicSessionUpdateInput = z.infer<typeof academicSessionUpdateSchema>
