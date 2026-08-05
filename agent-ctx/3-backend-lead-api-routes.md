# Task 3: Backend Lead — API Routes for Auth, Tenant Management, Academic Modules

## Work Log

- Read worklog.md to understand prior work (Task 1: DB schema with 46 tables, Task 2: Docker/GitHub push)
- Read prisma/schema.prisma to understand all model structures (Tenant, SubscriptionPlan, AcademicSession, Class, Section, ActivityLog)
- Read src/lib/api-utils.ts and src/lib/types.ts for helper functions and type definitions
- Created all 9 API route files:

### Routes Created

| # | Route | Methods | Description |
|---|-------|---------|-------------|
| 1 | `/api/tenants/route.ts` | GET, POST | List all tenants (super-admin), create tenant |
| 2 | `/api/tenants/[id]/route.ts` | GET, PUT, DELETE | Single tenant CRUD; DELETE deactivates (soft) |
| 3 | `/api/subscription-plans/route.ts` | GET, POST | List/create global subscription plans |
| 4 | `/api/academic-sessions/route.ts` | GET, POST | List/create academic sessions per tenant |
| 5 | `/api/academic-sessions/[id]/route.ts` | GET, PUT, DELETE | Single session CRUD; hard delete |
| 6 | `/api/classes/route.ts` | GET, POST | List classes with search/filter, create class |
| 7 | `/api/classes/[id]/route.ts` | GET, PUT, DELETE | Single class CRUD; prevents delete with students |
| 8 | `/api/sections/route.ts` | GET, POST | List sections with classId filter, create section |
| 9 | `/api/sections/[id]/route.ts` | GET, PUT, DELETE | Single section CRUD; prevents delete with students |

### Implementation Details

- **Multi-tenancy**: All business routes use `requireTenantId()` / `getTenantId()` from api-utils
- **Super-admin guard**: Tenant routes verify `user.isSuperAdmin` flag
- **Pagination**: All list endpoints support `page`, `limit`, `search` via `getPaginationParams()`
- **Search**: Tenants (name/slug/email), Plans (name/slug), Sessions (name), Classes (name/code), Sections (name)
- **Filters**: `isActive`, `status`, `academicSessionId`, `classId`, `teacherId`, `isCurrent`
- **Validation**: Required field checks, uniqueness checks (composite constraints), FK integrity verification
- **Soft delete**: Tenant uses `isActive=false`; AcademicSession/Class/Section use hard delete
- **Safety checks**: Cannot delete current session, cannot delete class/section with students
- **isCurrent toggle**: When setting session as current, automatically unsets others in tenant
- **Audit logging**: All create/update/delete operations log to `ActivityLog`
- **Include relations**: GET endpoints include related data (subscriptions, counts, teacher names, etc.)
- **Error handling**: All routes wrapped in try/catch returning proper error responses

### Lint Result
- 0 errors, 1 pre-existing warning in auth.ts — all 9 new route files pass clean
