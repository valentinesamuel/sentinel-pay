# Sprint 34 Tickets - Payroll Management System

**Sprint:** Sprint 34
**Duration:** 2 weeks (Week 68-69)
**Total Story Points:** 30 SP
**Total Tickets:** 18 tickets (4 stories + 14 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-34-001 | Story | Employee Data Management | 8 | To Do | Developer |
| TICKET-34-002 | Task | Create Employee Entity & Database Schema | 2 | To Do | Developer |
| TICKET-34-003 | Task | Implement Employee CRUD Endpoints | 3 | To Do | Developer |
| TICKET-34-004 | Task | Implement Bulk Upload (CSV/Excel) | 3 | To Do | Developer |
| TICKET-34-005 | Story | Automated Payroll Calculation | 7 | To Do | Developer |
| TICKET-34-006 | Task | Create Payslip Entity & Database Schema | 2 | To Do | Developer |
| TICKET-34-007 | Task | Implement Payroll Calculation Service | 3 | To Do | Developer |
| TICKET-34-008 | Task | Implement Tax Calculation (PAYE) | 2 | To Do | Developer |
| TICKET-34-009 | Story | Multi-Level Approval Workflow | 5 | To Do | Developer |
| TICKET-34-010 | Task | Create Approval Workflow Schema | 2 | To Do | Developer |
| TICKET-34-011 | Task | Implement Approval Endpoints & Logic | 3 | To Do | Developer |
| TICKET-34-012 | Story | Payslip Generation & Distribution | 4 | To Do | Developer |
| TICKET-34-013 | Task | Implement Payslip PDF Generation | 2 | To Do | Developer |
| TICKET-34-014 | Task | Implement Payslip Email Distribution | 2 | To Do | Developer |
| TICKET-34-015 | Task | Compliance Reporting (PAYE, PENCOM, NHF) | 2 | To Do | Developer |
| TICKET-34-016 | Task | Batch Payments Integration | 1 | To Do | Developer |
| TICKET-34-017 | Task | API Documentation & Postman Collection | 1 | To Do | Developer |
| TICKET-34-018 | Task | Unit & Integration Tests | 2 | To Do | Developer |

---

## TICKET-34-001: Employee Data Management

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** Business & Enterprise - Payroll
**Sprint:** Sprint 34

### Description

As an HR administrator, I want to manage employee data including salary structure, bank details, and deductions, so that I can maintain accurate payroll records and process payments correctly.

### Business Value

Employee management is the foundation of payroll system. Accurate employee data ensures correct salary calculations, tax compliance, and seamless fund disbursement. HR teams need to quickly add, update, and manage employee information.

**Impact:**
- **Critical:** Accurate payroll processing depends on this
- **Compliance:** Required for PAYE, pension, NHF tracking
- **Efficiency:** Bulk upload saves hours of data entry
- **Trust:** Employees can verify their salary details

**Success Metrics:**
- Add/edit/remove employees in < 500ms
- Bulk upload 1,000 employees in < 30 seconds
- Search employees by multiple fields
- Verify bank details against CBN records
- Department and cost center tracking

### Acceptance Criteria

**Employee CRUD Operations:**
- [ ] Add new employee with all details (name, email, phone, DOB, bank account)
- [ ] Edit employee information (non-salary fields)
- [ ] View employee profile (all fields)
- [ ] List all employees with pagination (50, 100, 200 per page)
- [ ] Search employees by name, email, phone, employee ID
- [ ] Filter employees by status (active, suspended, terminated)
- [ ] Filter employees by department
- [ ] Delete/archive employee (soft delete)
- [ ] View employee activity log (edits, actions)
- [ ] Bulk upload employees from CSV/Excel

**Salary Structure Management:**
- [ ] Define salary structure per employee (basic, allowances, deductions)
- [ ] Set basic salary amount
- [ ] Add allowances (housing, transport, lunch, performance bonus)
- [ ] Configure deductions (tax, pension, NHF, health insurance)
- [ ] Set effective date for salary structure
- [ ] Update salary structure (create new version, not edit)
- [ ] View salary structure history
- [ ] Copy salary structure from template

**Bank Account Management:**
- [ ] Add bank account details per employee
- [ ] Verify account number against CBN NIP directory
- [ ] Support multiple bank accounts per employee
- [ ] Mark primary account for salary deposit
- [ ] Update bank account details (with approval)
- [ ] Bank account validation (account name match check)

**Department & Organization:**
- [ ] Assign employee to department
- [ ] Assign cost center for expense tracking
- [ ] Assign manager/supervisor
- [ ] View department headcount and payroll costs
- [ ] Bulk assign department to multiple employees

**Compliance & Security:**
- [ ] Encrypt sensitive data (bank account, SSN)
- [ ] Audit log for all employee data changes
- [ ] Role-based access control (HR, Finance, Admin)
- [ ] Privacy: Don't expose sensitive data in logs

**Non-Functional:**
- [ ] Add employee: < 500ms
- [ ] Bulk upload: 1000 employees in < 30 seconds
- [ ] Search: < 100ms response time
- [ ] UI responsive across devices
- [ ] Handle 50,000+ employees

### API Specifications

#### Create Employee

```
POST /api/v1/payroll/employees
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "employee_id": "EMP-001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "+2348012345678",
  "date_of_birth": "1990-01-15",
  "department": "Engineering",
  "cost_center": "DEPT-001",
  "hire_date": "2023-01-15",
  "bank_code": "011",
  "account_number": "1234567890",
  "account_name": "John Doe"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "emp-uuid-123",
    "employee_id": "EMP-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### List Employees

```
GET /api/v1/payroll/employees?page=1&limit=50&department=Engineering&status=active&search=john
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "emp-uuid-123",
        "employee_id": "EMP-001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.com",
        "department": "Engineering",
        "status": "active",
        "hire_date": "2023-01-15"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
}
```

#### Get Employee Details

```
GET /api/v1/payroll/employees/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": "emp-uuid-123",
    "employee_id": "EMP-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "+2348012345678",
    "date_of_birth": "1990-01-15",
    "department": "Engineering",
    "cost_center": "DEPT-001",
    "status": "active",
    "hire_date": "2023-01-15",
    "bank_code": "011",
    "account_number": "1234567890",
    "account_name": "John Doe",
    "bank_details": {
      "verified": false,
      "verified_at": null,
      "verification_method": null
    },
    "salary_structure": {
      "basic_salary": 500000,
      "allowances": {
        "housing": 100000,
        "transport": 50000
      },
      "effective_date": "2023-01-15"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Employee

```
PATCH /api/v1/payroll/employees/:id
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "department": "Sales",
  "phone": "+2348087654321"
}

Response: 200 OK
{
  "status": "success",
  "message": "Employee updated successfully"
}
```

#### Bulk Upload Employees

```
POST /api/v1/payroll/employees/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
file: <CSV/Excel file>

CSV Format:
employee_id,first_name,last_name,email,phone,dob,department,cost_center,hire_date,bank_code,account_number,account_name
EMP-001,John,Doe,john.doe@company.com,+2348012345678,1990-01-15,Engineering,DEPT-001,2023-01-15,011,1234567890,John Doe
EMP-002,Jane,Smith,jane.smith@company.com,+2348087654321,1992-03-20,Marketing,DEPT-002,2023-02-01,058,0987654321,Jane Smith

Response: 202 Accepted
{
  "status": "success",
  "data": {
    "job_id": "bulk-upload-uuid",
    "status": "processing",
    "total_records": 2,
    "created": 0,
    "failed": 0,
    "message": "Bulk upload processing started"
  }
}
```

#### Verify Bank Account

```
POST /api/v1/payroll/employees/:id/bank-verify
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "verified": true,
    "account_name_match": true,
    "verified_at": "2024-01-15T10:35:00Z",
    "verification_method": "nip_directory"
  }
}
```

### Subtasks

- [ ] TICKET-34-002: Create Employee Entity & Database Schema
- [ ] TICKET-34-003: Implement Employee CRUD Endpoints
- [ ] TICKET-34-004: Implement Bulk Upload (CSV/Excel)

### Testing Requirements

- Unit tests: 25 tests (CRUD operations, validation, filtering)
- Integration tests: 12 tests (API endpoints, database operations)
- E2E tests: 5 tests (complete employee management workflow)
- Performance tests: 3 tests (bulk upload, search)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Employee schema and CRUD endpoints working
- [ ] Bulk upload functionality implemented
- [ ] Bank account verification working
- [ ] All tests passing (45+ tests)
- [ ] API documentation updated
- [ ] Code reviewed and merged

---

## TICKET-34-002: Create Employee Entity & Database Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-34-001
**Sprint:** Sprint 34

### Description

Create the Employee entity, Salary Structure entity, and all related database tables and migrations needed for the payroll system.

### Task Details

**Entities to Create:**

```typescript
// src/payroll/entities/employee.entity.ts
@Entity('employees')
export class Employee extends BaseEntity {
  @Column('uuid')
  company_id: string;

  @Column('varchar', { unique: true })
  employee_id: string;

  @Column('varchar')
  first_name: string;

  @Column('varchar')
  last_name: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar')
  phone: string;

  @Column('date')
  date_of_birth: Date;

  @Column('varchar')
  department: string;

  @Column('varchar', { nullable: true })
  cost_center: string;

  @Column('uuid', { nullable: true })
  manager_id: string;

  @Column({ type: 'enum', enum: EmploymentStatus, default: 'active' })
  status: EmploymentStatus;

  @Column('timestamp with time zone')
  hire_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  termination_date: Date;

  @Column('varchar')
  bank_code: string;

  @Column('varchar')
  account_number: string;

  @Column('varchar')
  account_name: string;

  @Column({ type: 'jsonb', nullable: true })
  bank_details: {
    primary: boolean;
    verified: boolean;
    verified_at?: Date;
    verification_method?: string;
  };

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('uuid')
  created_by: string;

  @Column('timestamp with time zone', { nullable: true })
  updated_at: Date;

  @Column('uuid', { nullable: true })
  updated_by: string;

  @OneToMany(() => SalaryStructure, ss => ss.employee)
  salary_structures: SalaryStructure[];

  @OneToMany(() => Payslip, ps => ps.employee)
  payslips: Payslip[];

  @ManyToOne(() => Employee, { nullable: true })
  manager: Employee;
}

// src/payroll/entities/salary-structure.entity.ts
@Entity('salary_structures')
export class SalaryStructure extends BaseEntity {
  @Column('uuid')
  employee_id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  basic_salary: number;

  @Column({ type: 'jsonb' })
  allowances: {
    housing?: number;
    transport?: number;
    lunch?: number;
    performance_bonus?: number;
    custom?: Array<{ name: string; amount: number }>;
  };

  @Column({ type: 'jsonb' })
  deductions: {
    pension_rate: number;
    nhf_rate: number;
    health_insurance: number;
    custom?: Array<{ name: string; amount: number }>;
  };

  @Column('timestamp with time zone')
  effective_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  end_date: Date;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
```

**Database Migrations:**

```typescript
// src/migrations/1704931200000-CreateEmployeeTable.ts
export class CreateEmployeeTable1704931200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employees',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'company_id', type: 'uuid' },
          { name: 'employee_id', type: 'varchar', isUnique: true },
          { name: 'first_name', type: 'varchar' },
          { name: 'last_name', type: 'varchar' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'phone', type: 'varchar' },
          { name: 'date_of_birth', type: 'date' },
          { name: 'department', type: 'varchar' },
          { name: 'cost_center', type: 'varchar', isNullable: true },
          { name: 'manager_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'enum', enum: ['active', 'suspended', 'terminated'] },
          { name: 'hire_date', type: 'timestamp with time zone' },
          { name: 'termination_date', type: 'timestamp with time zone', isNullable: true },
          { name: 'bank_code', type: 'varchar' },
          { name: 'account_number', type: 'varchar' },
          { name: 'account_name', type: 'varchar' },
          { name: 'bank_details', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid' },
          { name: 'updated_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['manager_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['employee_id'] },
          { columnNames: ['company_id'] },
          { columnNames: ['department'] },
          { columnNames: ['status'] },
          { columnNames: ['email'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('employees');
  }
}
```

**Checklist:**
- [ ] Employee entity created
- [ ] SalaryStructure entity created
- [ ] Database migration created
- [ ] TypeORM configuration updated
- [ ] DTOs created (CreateEmployeeDto, UpdateEmployeeDto)
- [ ] Enums created (EmploymentStatus)

---

## TICKET-34-003: Implement Employee CRUD Endpoints

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-34-001
**Sprint:** Sprint 34

### Description

Implement all CRUD (Create, Read, Update, Delete) endpoints for employee management with proper validation, authorization, and error handling.

### Implementation Details

```typescript
// src/payroll/dto/create-employee.dto.ts
export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsOptional()
  cost_center?: string;

  @IsUUID()
  @IsOptional()
  manager_id?: string;

  @IsDateString()
  @IsNotEmpty()
  hire_date: string;

  @IsString()
  @IsNotEmpty()
  bank_code: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsString()
  @IsNotEmpty()
  account_name: string;
}

// src/payroll/controllers/employee.controller.ts
@Controller('payroll/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hr', 'finance', 'admin')
@ApiTags('Payroll - Employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @RequirePermission('employees.create')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @Request() req
  ) {
    const employee = await this.employeeService.create(dto, req.user.id);
    return { status: 'success', data: employee };
  }

  @Get(':id')
  @RequirePermission('employees.read')
  @ApiOperation({ summary: 'Get employee details' })
  async getEmployee(@Param('id', new ParseUUIDPipe()) id: string) {
    const employee = await this.employeeService.findById(id);
    return { status: 'success', data: employee };
  }

  @Get()
  @RequirePermission('employees.read')
  @ApiOperation({ summary: 'List all employees' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listEmployees(@Query() filters: EmployeeFiltersDto) {
    const { employees, pagination } = await this.employeeService.list(filters);
    return { status: 'success', data: { items: employees, pagination } };
  }

  @Patch(':id')
  @RequirePermission('employees.update')
  @AuditLog('EMPLOYEE_UPDATED')
  @ApiOperation({ summary: 'Update employee' })
  async updateEmployee(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req
  ) {
    await this.employeeService.update(id, dto, req.user.id);
    return { status: 'success', message: 'Employee updated successfully' };
  }

  @Delete(':id')
  @RequirePermission('employees.delete')
  @AuditLog('EMPLOYEE_DELETED')
  @ApiOperation({ summary: 'Soft delete employee' })
  async deleteEmployee(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req
  ) {
    await this.employeeService.softDelete(id, req.user.id);
    return { status: 'success', message: 'Employee deleted successfully' };
  }

  @Post(':id/bank-verify')
  @RequirePermission('employees.update')
  @AuditLog('BANK_ACCOUNT_VERIFIED')
  @ApiOperation({ summary: 'Verify bank account against CBN' })
  async verifyBankAccount(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.employeeService.verifyBankAccount(id);
    return { status: 'success', data: result };
  }
}

// src/payroll/services/employee.service.ts
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(SalaryStructure)
    private ssRepository: Repository<SalaryStructure>,
    private logger: Logger,
  ) {}

  async create(dto: CreateEmployeeDto, userId: string): Promise<Employee> {
    // Validate employee_id is unique
    const existing = await this.employeeRepository.findOne({
      where: { employee_id: dto.employee_id },
    });

    if (existing) {
      throw new BadRequestException('Employee ID already exists');
    }

    const employee = this.employeeRepository.create({
      ...dto,
      created_by: userId,
      is_active: true,
    });

    return await this.employeeRepository.save(employee);
  }

  async list(filters: EmployeeFiltersDto) {
    const query = this.employeeRepository.createQueryBuilder('e');

    if (filters.department) {
      query.andWhere('e.department = :department', { department: filters.department });
    }

    if (filters.status) {
      query.andWhere('e.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere(
        '(e.first_name ILIKE :search OR e.last_name ILIKE :search OR e.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.andWhere('e.is_active = true');

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [employees, total] = await query
      .orderBy('e.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, is_active: true },
      relations: ['salary_structures', 'manager'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, userId: string): Promise<void> {
    const employee = await this.findById(id);

    Object.assign(employee, {
      ...dto,
      updated_by: userId,
      updated_at: new Date(),
    });

    await this.employeeRepository.save(employee);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.employeeRepository.update(
      { id },
      {
        is_active: false,
        updated_by: userId,
        updated_at: new Date(),
      }
    );
  }

  async verifyBankAccount(id: string): Promise<any> {
    const employee = await this.findById(id);

    // Call CBN NIP API to verify
    const nipVerification = await this.callNIPDirectory(
      employee.account_number,
      employee.bank_code
    );

    if (nipVerification.success) {
      employee.bank_details = {
        ...employee.bank_details,
        verified: true,
        verified_at: new Date(),
        verification_method: 'nip_directory',
      };
      await this.employeeRepository.save(employee);
    }

    return {
      verified: nipVerification.success,
      account_name_match: nipVerification.account_name === employee.account_name,
      verified_at: employee.bank_details?.verified_at,
    };
  }

  private async callNIPDirectory(accountNumber: string, bankCode: string): Promise<any> {
    // Integration with CBN NIP directory or bank API
    // For now, mock implementation
    return { success: true, account_name: '' };
  }
}
```

**Checklist:**
- [ ] All DTOs created and validated
- [ ] Controller endpoints implemented
- [ ] Service methods implemented
- [ ] Error handling added
- [ ] Validation working
- [ ] Authorization working
- [ ] Audit logging added

---

## TICKET-34-004: Implement Bulk Upload (CSV/Excel)

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-34-001
**Sprint:** Sprint 34

### Description

Implement bulk employee upload functionality supporting CSV and Excel formats with validation, error reporting, and progress tracking.

### Implementation Details

**Bulk Upload Service:**

```typescript
@Injectable()
export class BulkUploadService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectQueue('payroll-bulk-upload')
    private bulkUploadQueue: Queue,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string
  ): Promise<{ job_id: string; status: string }> {
    // Validate file
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      throw new BadRequestException('Invalid file format. Only CSV and Excel files allowed.');
    }

    // Parse file
    let data: any[] = [];
    if (ext === 'csv') {
      data = await this.parseCSV(file.buffer.toString());
    } else {
      data = await this.parseExcel(file.buffer);
    }

    // Validate data
    const { valid, invalid, validRecords } = await this.validateRecords(data);

    if (invalid.length > 0) {
      // Store validation errors for user download
      const errorFile = await this.generateErrorReport(invalid);
      throw new BadRequestException(
        `${invalid.length} records have errors. Download error report for details.`,
        errorFile
      );
    }

    // Create bulk upload job
    const job = await this.bulkUploadQueue.add(
      'import-employees',
      {
        records: validRecords,
        userId,
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );

    return {
      job_id: job.id,
      status: 'processing',
    };
  }

  private async parseCSV(content: string): Promise<any[]> {
    const records = [];
    const lines = content.split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim();
      });
      records.push(record);
    }

    return records;
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private async validateRecords(
    records: any[]
  ): Promise<{ valid: number; invalid: any[]; validRecords: any[] }> {
    const validRecords = [];
    const invalid = [];

    for (let i = 0; i < records.length; i++) {
      const errors = [];
      const record = records[i];

      // Validate required fields
      if (!record.employee_id) errors.push('employee_id is required');
      if (!record.first_name) errors.push('first_name is required');
      if (!record.email) errors.push('email is required');
      if (!isValidEmail(record.email)) errors.push('Invalid email format');
      if (!record.bank_code) errors.push('bank_code is required');
      if (!record.account_number) errors.push('account_number is required');

      // Check uniqueness (query database)
      const existing = await this.employeeRepository.findOne({
        where: { employee_id: record.employee_id },
      });
      if (existing) errors.push('employee_id already exists');

      if (errors.length > 0) {
        invalid.push({ rowNumber: i + 2, ...record, errors });
      } else {
        validRecords.push(record);
      }
    }

    return { valid: validRecords.length, invalid, validRecords };
  }

  private async generateErrorReport(invalid: any[]): Promise<Buffer> {
    const ws = XLSX.utils.json_to_sheet(invalid);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

// Bulk upload worker
@Processor('payroll-bulk-upload')
export class BulkUploadConsumer {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  @Process('import-employees')
  async importEmployees(job: Job<{ records: any[]; userId: string }>) {
    const { records, userId } = job.data;
    let created = 0;
    let failed = 0;

    for (let i = 0; i < records.length; i++) {
      try {
        const employee = this.employeeRepository.create({
          ...records[i],
          created_by: userId,
        });
        await this.employeeRepository.save(employee);
        created++;

        // Update job progress
        job.progress((i / records.length) * 100);
      } catch (error) {
        failed++;
        // Log individual errors
      }
    }

    return { created, failed, total: records.length };
  }
}
```

**Controller Endpoint:**

```typescript
@Post('bulk-upload')
@RequirePermission('employees.bulk_upload')
@UseInterceptors(FileInterceptor('file', {
  fileFilter: (req, file, cb) => {
    if (!/\.(csv|xlsx|xls)$/i.test(file.originalname)) {
      cb(new BadRequestException('Only CSV and Excel files allowed'), false);
    } else {
      cb(null, true);
    }
  },
}))
@ApiConsumes('multipart/form-data')
async bulkUpload(
  @UploadedFile() file: Express.Multer.File,
  @Request() req
) {
  const result = await this.bulkUploadService.uploadFile(file, req.user.id);
  return { status: 'success', data: result };
}
```

**Checklist:**
- [ ] CSV parser implemented
- [ ] Excel parser implemented (ExcelJS or XLSX)
- [ ] Validation logic implemented
- [ ] Error report generation working
- [ ] Background job queue setup (Bull/RabbitMQ)
- [ ] Progress tracking working
- [ ] Performance tested (1000 records)

---

## Summary of Sprint 34 Tickets (Condensed)

**Remaining Tickets (5 more major tasks):**

| Ticket ID | Type | Title | Story Points | Key Details |
|-----------|------|-------|--------------|------------|
| TICKET-34-005 | Story | Payroll Calculation | 7 | Calculate payroll with tax, pension, deductions |
| TICKET-34-006 | Task | Payslip Entity Schema | 2 | Create payslip database entities |
| TICKET-34-007 | Task | Payroll Calculation Service | 3 | Implement PayrollCalculationService |
| TICKET-34-008 | Task | PAYE Tax Calculation | 2 | Implement FIRS tax brackets and calculation |
| TICKET-34-009 | Story | Approval Workflow | 5 | Multi-level approval (Manager → Finance) |
| TICKET-34-010 | Task | Approval Schema | 2 | Create approval database entities |
| TICKET-34-011 | Task | Approval Endpoints | 3 | Implement approval endpoints and logic |
| TICKET-34-012 | Story | Payslip Generation | 4 | Generate and distribute payslips |
| TICKET-34-013 | Task | PDF Generation | 2 | Implement payslip PDF generation (PDFKit) |
| TICKET-34-014 | Task | Email Distribution | 2 | Send payslips via email |
| TICKET-34-015 | Task | Compliance Reports | 2 | PAYE, PENCOM, NHF reports |
| TICKET-34-016 | Task | Batch Integration | 1 | Integrate with batch payments system |
| TICKET-34-017 | Task | API Documentation | 1 | Complete Swagger docs & Postman collection |
| TICKET-34-018 | Task | Tests | 2 | Unit + integration tests (85%+ coverage) |

---

## Testing Strategy

**Unit Tests (40+ tests):**
- Employee CRUD operations
- Salary structure calculations
- Tax calculations (PAYE, pension, NHF)
- Validation logic
- Error handling

**Integration Tests (20+ tests):**
- Employee API endpoints
- Bulk upload workflow
- Payroll calculation flow
- Approval workflow

**E2E Tests (5+ tests):**
- Complete payroll cycle (create employees → calculate → approve → generate payslips)
- Bulk upload to payment distribution

**Performance Tests:**
- Bulk upload: 1000 records < 30 seconds
- Payroll calculation: 1000 employees < 5 seconds
- API endpoints: < 500ms response time

---

## Database Migrations Needed

1. **employees** table (with indices, constraints)
2. **salary_structures** table
3. **payroll_runs** table
4. **payslips** table
5. **payroll_approvals** table
6. **audit_logs** table (for compliance tracking)

---

## API Documentation

All endpoints will be documented in Swagger/OpenAPI format with:
- Request/response schemas
- Error codes and messages
- Authorization requirements
- Rate limiting info
- Example cURL commands

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Total Tickets:** 18
**Total Story Points:** 30
**Sprint Status:** Not Started
