# Sprint 34 Backlog - Payroll Management System

**Sprint:** Sprint 34
**Duration:** 2 weeks (Week 68-69)
**Sprint Goal:** Implement comprehensive payroll management system with automated salary disbursement
**Story Points Committed:** 30
**Team Capacity:** 30 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 27-33 (35, 30, 28, 32, 28, 30, 35) = 31.1 SP, committed 30 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 34, we will have:
1. Employee management system with bulk upload
2. Payroll calculation engine with tax/pension deductions
3. Payroll approval workflow with dual-control
4. Payslip generation and distribution
5. Compliance reporting (PAYE, PENCOM, NHF)
6. Integration with batch payments system
7. HR system integration (BambooHR)
8. Employee self-service portal
9. Payroll analytics and insights

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Payroll calculation tests passing
- [ ] HR system integration tests passing
- [ ] API documentation updated (Swagger)
- [ ] Payroll UI functional
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC: Business & Enterprise Features - Payroll Management

## FEATURE-1: Employee Management

### 📘 User Story: US-34.1.1 - Employee Data Management

**Story ID:** US-34.1.1
**Feature:** FEATURE-1 (Employee Management)
**Epic:** Business & Enterprise

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 34
**Status:** 🔄 Not Started

---

#### User Story

```
As an HR administrator
I want to manage employee data including salary structure, bank details, and deductions
So that I can maintain accurate payroll records and process payments correctly
```

---

#### Business Value

**Value Statement:**
Employee management is the foundation of payroll system. Accurate employee data ensures correct salary calculations, tax compliance, and seamless fund disbursement.

**Impact:**
- **Critical:** Accurate payroll processing depends on this
- **Compliance:** Required for PAYE, pension, NHF tracking
- **Efficiency:** Bulk upload saves hours of data entry
- **Trust:** Employees can verify their salary details

**Success Criteria:**
- Add/edit/remove employees in < 500ms
- Bulk upload 1,000 employees in < 30 seconds
- Search employees by multiple fields
- Verify bank details against CBN records
- Department and cost center tracking

---

#### Acceptance Criteria

**Employee CRUD Operations:**
- [ ] **AC1:** Add new employee with all details (name, email, phone, DOB, bank account)
- [ ] **AC2:** Edit employee information (non-salary fields)
- [ ] **AC3:** View employee profile (all fields)
- [ ] **AC4:** List all employees with pagination
- [ ] **AC5:** Search employees by name, email, phone, employee ID
- [ ] **AC6:** Filter employees by status (active, suspended, terminated)
- [ ] **AC7:** Filter employees by department
- [ ] **AC8:** Delete/archive employee (soft delete)
- [ ] **AC9:** View employee activity log (edits, actions)
- [ ] **AC10:** Bulk upload employees from CSV/Excel

**Salary Structure Management:**
- [ ] **AC11:** Define salary structure per employee (basic, allowances, deductions)
- [ ] **AC12:** Set basic salary amount
- [ ] **AC13:** Add allowances (housing, transport, lunch, performance bonus)
- [ ] **AC14:** Configure deductions (tax, pension, NHF, health insurance)
- [ ] **AC15:** Set effective date for salary structure
- [ ] **AC16:** Update salary structure (create new version, not edit)
- [ ] **AC17:** View salary structure history
- [ ] **AC18:** Copy salary structure from template
- [ ] **AC19:** Salary structure templates (by role/department)

**Bank Account Management:**
- [ ] **AC20:** Add bank account details per employee
- [ ] **AC21:** Verify account number against CBN NIP directory
- [ ] **AC22:** Support multiple bank accounts per employee
- [ ] **AC23:** Mark primary account for salary deposit
- [ ] **AC24:** Update bank account details (with approval)
- [ ] **AC25:** Bank account validation (account name match check)

**Department & Organization:**
- [ ] **AC26:** Assign employee to department
- [ ] **AC27:** Assign cost center for expense tracking
- [ ] **AC28:** Assign manager/supervisor
- [ ] **AC29:** View department headcount and payroll costs
- [ ] **AC30:** Bulk assign department to multiple employees

**Compliance & Security:**
- [ ] **AC31:** Encrypt sensitive data (bank account, SSN)
- [ ] **AC32:** Audit log for all employee data changes
- [ ] **AC33:** Role-based access control (HR, Finance, Admin)
- [ ] **AC34:** Privacy: Don't expose sensitive data in logs

**Non-Functional:**
- [ ] **AC35:** Add employee: < 500ms
- [ ] **AC36:** Bulk upload: 1000 employees in < 30 seconds
- [ ] **AC37:** Search: < 100ms response time
- [ ] **AC38:** UI responsive across devices

---

#### Technical Specifications

**Employee Entity Schema:**

```typescript
@Entity('employees')
export class Employee extends BaseEntity {
  @Column('uuid')
  company_id: string;

  @Column('varchar', { unique: true })
  employee_id: string;  // E.g., EMP-001, EMP-002

  @Column('varchar')
  first_name: string;

  @Column('varchar')
  last_name: string;

  @Column('varchar')
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
  manager_id: string;  // Reference to another employee (manager)

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
    verified_at: Date;
    verification_method: string;  // nip_directory, manual_verification
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

  // Relationships
  @OneToMany(() => SalaryStructure, ss => ss.employee)
  salary_structures: SalaryStructure[];

  @OneToMany(() => Payslip, ps => ps.employee)
  payslips: Payslip[];

  @ManyToOne(() => Employee, { nullable: true })
  manager: Employee;
}
```

**Employee API Endpoints:**

```typescript
@Controller('payroll/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hr', 'finance', 'admin')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @RequirePermission('employees.create')
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    const employee = await this.employeeService.create(dto);
    return { status: 'success', data: employee };
  }

  @Get(':id')
  @RequirePermission('employees.read')
  async getEmployee(@Param('id') employeeId: string) {
    const employee = await this.employeeService.findById(employeeId);
    return { status: 'success', data: employee };
  }

  @Get()
  @RequirePermission('employees.read')
  async listEmployees(@Query() filters: EmployeeFiltersDto) {
    const employees = await this.employeeService.list(filters);
    return { status: 'success', data: employees };
  }

  @Patch(':id')
  @RequirePermission('employees.update')
  @AuditLog('EMPLOYEE_UPDATED')
  async updateEmployee(
    @Param('id') employeeId: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req
  ) {
    await this.employeeService.update(employeeId, dto, req.user.id);
    return { status: 'success', message: 'Employee updated' };
  }

  @Delete(':id')
  @RequirePermission('employees.delete')
  @AuditLog('EMPLOYEE_DELETED')
  async deleteEmployee(
    @Param('id') employeeId: string,
    @Request() req
  ) {
    await this.employeeService.softDelete(employeeId, req.user.id);
    return { status: 'success', message: 'Employee deleted' };
  }

  @Post('bulk-upload')
  @RequirePermission('employees.bulk_upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.employeeService.bulkUpload(file);
    return { status: 'success', data: result };
  }

  @Post(':id/bank-verify')
  @RequirePermission('employees.update')
  @AuditLog('BANK_ACCOUNT_VERIFIED')
  async verifyBankAccount(@Param('id') employeeId: string) {
    const result = await this.employeeService.verifyBankAccount(employeeId);
    return { status: 'success', data: result };
  }
}
```

**Create Employee Request/Response:**

```typescript
interface CreateEmployeeDto {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;  // ISO date
  department: string;
  cost_center?: string;
  manager_id?: string;
  hire_date: string;  // ISO date
  bank_code: string;
  account_number: string;
  account_name: string;
}

// Response
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
    "status": "active",
    "hire_date": "2023-01-15",
    "bank_code": "011",
    "account_number": "1234567890",
    "account_name": "John Doe",
    "bank_details": {
      "primary": true,
      "verified": false,
      "verified_at": null
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Bulk Upload CSV Format:**

```csv
employee_id,first_name,last_name,email,phone,dob,department,cost_center,hire_date,bank_code,account_number,account_name,basic_salary,house_allowance,transport_allowance
EMP-001,John,Doe,john.doe@company.com,+2348012345678,1990-01-15,Engineering,DEPT-001,2023-01-15,011,1234567890,John Doe,500000,100000,50000
EMP-002,Jane,Smith,jane.smith@company.com,+2348087654321,1992-03-20,Marketing,DEPT-002,2023-02-01,058,0987654321,Jane Smith,400000,80000,40000
```

---

## FEATURE-2: Payroll Calculation Engine

### 📘 User Story: US-34.2.1 - Automated Payroll Calculation

**Story ID:** US-34.2.1
**Feature:** FEATURE-2 (Payroll Calculation Engine)
**Epic:** Business & Enterprise

**Story Points:** 7
**Priority:** P0 (Critical)
**Sprint:** Sprint 34
**Status:** 🔄 Not Started

---

#### User Story

```
As a payroll manager
I want automated payroll calculation with tax, pension, and deductions
So that salary calculations are accurate, consistent, and compliant with regulations
```

---

#### Business Value

**Value Statement:**
Automated payroll calculation is the heart of the payroll system. Manual calculations are error-prone and time-consuming. Automation ensures compliance with FIRS, PENCOM, NHF requirements.

**Impact:**
- **Critical:** Salary accuracy and timeliness
- **Compliance:** FIRS PAYE tax, PENCOM pension, NHF deductions
- **Efficiency:** Calculate 1,000 employees' salaries in < 5 seconds
- **Transparency:** Employees understand their deductions

**Success Criteria:**
- Calculate 1,000 employee salaries in < 5 seconds
- Accurate PAYE tax calculation
- Accurate pension contribution (8% CPS)
- Support allowances and deductions
- Override formula builder for custom calculations

---

#### Acceptance Criteria

**Basic Salary Calculation:**
- [ ] **AC1:** Calculate gross salary = basic salary + allowances
- [ ] **AC2:** Add allowances (housing, transport, lunch, performance bonus)
- [ ] **AC3:** Apply percentage-based allowances (e.g., 20% of basic)
- [ ] **AC4:** Support flat and percentage-based bonuses

**Deduction Calculation:**
- [ ] **AC5:** Calculate PAYE tax according to FIRS rates
- [ ] **AC6:** Calculate pension contribution (8% of basic salary)
- [ ] **AC7:** Calculate NHF contribution (2.5% on qualifying transactions)
- [ ] **AC8:** Calculate health insurance deduction (5% or flat amount)
- [ ] **AC9:** Support custom deductions (loan repayment, etc.)
- [ ] **AC10:** Apply deduction limits (PAYE minimum, max pension)

**Tax Calculation (FIRS PAYE):**
- [ ] **AC11:** PAYE tax brackets per FIRS guidelines
  - 1st ₦300K: 7%
  - 2nd ₦300K: 11%
  - 3rd ₦500K: 15%
  - Above ₦1.1M: 19%
- [ ] **AC12:** Personal income tax exemption (first ₦300K non-taxable)
- [ ] **AC13:** Support tax relief percentages (standard relief)
- [ ] **AC14:** Tax exemption for certain employee categories
- [ ] **AC15:** Year-to-date tax tracking for installment calculations

**Overtime & Leave Management:**
- [ ] **AC16:** Calculate overtime pay (1.5x rate for hours > 40/week)
- [ ] **AC17:** Deduct unpaid leave (reduce gross salary for non-paid leave)
- [ ] **AC18:** Track leave balance per employee
- [ ] **AC19:** Support different leave types (sick, casual, emergency)

**Multi-Currency Support:**
- [ ] **AC20:** Convert foreign currency to NGN (USD, GBP, EUR)
- [ ] **AC21:** Use current FX rates from API
- [ ] **AC22:** Lock FX rate for payroll period

**Formula Builder:**
- [ ] **AC23:** Simple formula editor for custom calculations
- [ ] **AC24:** Support variables (basic_salary, gross_salary, etc.)
- [ ] **AC25:** Test formula with sample data
- [ ] **AC26:** Validation of formula syntax

**Payroll Run:**
- [ ] **AC27:** Calculate all employees in single payroll run
- [ ] **AC28:** Generate payroll summary (total salary, deductions, net pay)
- [ ] **AC29:** Handle employees with different pay dates
- [ ] **AC30:** Generate payment breakdown by amount (for fund allocation)

**Non-Functional:**
- [ ] **AC31:** Calculate 1000 employees in < 5 seconds
- [ ] **AC32:** Support payroll for up to 50,000 employees
- [ ] **AC33:** Audit trail of all calculations
- [ ] **AC34:** Recalculate payroll if employee data changes (before approval)

---

#### Technical Specifications

**Salary Structure Entity:**

```typescript
@Entity('salary_structures')
export class SalaryStructure extends BaseEntity {
  @Column('uuid')
  employee_id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  basic_salary: number;

  @Column({ type: 'jsonb' })
  allowances: {
    housing?: number | { percentage: number; base: string };
    transport?: number | { percentage: number; base: string };
    lunch?: number;
    performance_bonus?: number;
    custom?: { name: string; amount: number }[];
  };

  @Column({ type: 'jsonb' })
  deductions: {
    pension_rate: number;  // 8% = 8
    nhf_rate: number;      // 2.5% = 2.5
    health_insurance: number;
    custom?: { name: string; amount: number }[];
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

  // Relationships
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}

@Entity('payroll_runs')
export class PayrollRun extends BaseEntity {
  @Column('uuid')
  company_id: string;

  @Column('varchar')
  payroll_period: string;  // YYYY-MM

  @Column('date')
  payment_date: Date;

  @Column('date', { nullable: true })
  salary_effective_date: Date;

  @Column({ type: 'enum', enum: PayrollStatus, default: 'draft' })
  status: PayrollStatus;  // DRAFT, PENDING_APPROVAL, APPROVED, PROCESSING, COMPLETED, FAILED

  @Column('decimal', { precision: 18, scale: 2 })
  total_gross_salary: number;

  @Column('decimal', { precision: 18, scale: 2 })
  total_deductions: number;

  @Column('decimal', { precision: 18, scale: 2 })
  total_net_salary: number;

  @Column({ type: 'jsonb' })
  summary: {
    total_paye_tax: number;
    total_pension: number;
    total_nhf: number;
    total_health_insurance: number;
    employee_count: number;
  };

  @Column('uuid', { nullable: true })
  submitted_by: string;

  @Column('timestamp with time zone', { nullable: true })
  submitted_at: Date;

  @Column('uuid', { nullable: true })
  approved_by: string;

  @Column('timestamp with time zone', { nullable: true })
  approved_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  processed_at: Date;

  @Column('timestamp with time zone')
  created_at: Date;

  // Relationships
  @OneToMany(() => Payslip, ps => ps.payroll_run)
  payslips: Payslip[];

  @OneToMany(() => PayrollApproval, pa => pa.payroll_run)
  approvals: PayrollApproval[];
}

@Entity('payslips')
export class Payslip extends BaseEntity {
  @Column('uuid')
  payroll_run_id: string;

  @Column('uuid')
  employee_id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  basic_salary: number;

  @Column('decimal', { precision: 15, scale: 2 })
  total_allowances: number;

  @Column('decimal', { precision: 15, scale: 2 })
  gross_salary: number;

  @Column('decimal', { precision: 15, scale: 2 })
  paye_tax: number;

  @Column('decimal', { precision: 15, scale: 2 })
  pension_contribution: number;

  @Column('decimal', { precision: 15, scale: 2 })
  nhf_contribution: number;

  @Column('decimal', { precision: 15, scale: 2 })
  health_insurance: number;

  @Column('decimal', { precision: 15, scale: 2 })
  other_deductions: number;

  @Column('decimal', { precision: 15, scale: 2 })
  total_deductions: number;

  @Column('decimal', { precision: 15, scale: 2 })
  net_salary: number;

  @Column({ type: 'jsonb' })
  allowances_breakdown: {
    housing: number;
    transport: number;
    lunch: number;
    performance_bonus: number;
    [key: string]: number;
  };

  @Column({ type: 'jsonb' })
  deductions_breakdown: {
    paye_tax: number;
    pension: number;
    nhf: number;
    health_insurance: number;
    [key: string]: number;
  };

  @Column('timestamp with time zone')
  created_at: Date;

  // Relationships
  @ManyToOne(() => PayrollRun)
  @JoinColumn({ name: 'payroll_run_id' })
  payroll_run: PayrollRun;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
```

**Payroll Calculation Service:**

```typescript
@Injectable()
export class PayrollCalculationService {
  constructor(
    @InjectRepository(Payslip) private payslipRepository: Repository<Payslip>,
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    @InjectRepository(SalaryStructure) private ssRepository: Repository<SalaryStructure>,
  ) {}

  async calculatePayroll(payrollRun: PayrollRun): Promise<Payslip[]> {
    const employees = await this.employeeRepository.find({
      where: { status: 'active', is_active: true },
      relations: ['salary_structures'],
    });

    const payslips: Payslip[] = [];

    for (const employee of employees) {
      const payslip = await this.calculateEmployeePayslip(
        employee,
        payrollRun
      );
      payslips.push(payslip);
    }

    return payslips;
  }

  async calculateEmployeePayslip(
    employee: Employee,
    payrollRun: PayrollRun
  ): Promise<Payslip> {
    const salaryStructure = await this.getSalaryStructure(
      employee.id,
      payrollRun.salary_effective_date
    );

    // Calculate allowances
    const allowances = this.calculateAllowances(
      salaryStructure.basic_salary,
      salaryStructure.allowances
    );
    const grossSalary = salaryStructure.basic_salary + allowances;

    // Calculate deductions
    const payeTax = this.calculatePayeTax(grossSalary);
    const pension = this.calculatePension(salaryStructure.basic_salary);
    const nhf = this.calculateNHF(salaryStructure.basic_salary);
    const healthInsurance = this.calculateHealthInsurance(
      salaryStructure.basic_salary
    );

    const totalDeductions = payeTax + pension + nhf + healthInsurance;
    const netSalary = grossSalary - totalDeductions;

    const payslip = new Payslip();
    payslip.payroll_run_id = payrollRun.id;
    payslip.employee_id = employee.id;
    payslip.basic_salary = salaryStructure.basic_salary;
    payslip.total_allowances = allowances;
    payslip.gross_salary = grossSalary;
    payslip.paye_tax = payeTax;
    payslip.pension_contribution = pension;
    payslip.nhf_contribution = nhf;
    payslip.health_insurance = healthInsurance;
    payslip.total_deductions = totalDeductions;
    payslip.net_salary = netSalary;

    return await this.payslipRepository.save(payslip);
  }

  private calculatePayeTax(grossSalary: number): number {
    // FIRS PAYE tax brackets (2024 rates)
    const taxableIncome = grossSalary;  // After personal exemption

    if (taxableIncome <= 300000) return taxableIncome * 0.07;
    if (taxableIncome <= 600000) return (300000 * 0.07) + ((taxableIncome - 300000) * 0.11);
    if (taxableIncome <= 1100000) return (300000 * 0.07) + (300000 * 0.11) + ((taxableIncome - 600000) * 0.15);
    return (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + ((taxableIncome - 1100000) * 0.19);
  }

  private calculatePension(basicSalary: number): number {
    // CPS: 8% of basic salary
    return basicSalary * 0.08;
  }

  private calculateNHF(basicSalary: number): number {
    // NHF: 2.5% on qualifying transactions, simplified as 2.5% of monthly
    return basicSalary * 0.025;
  }

  private calculateHealthInsurance(basicSalary: number): number {
    // Health insurance: 5% of basic salary
    return basicSalary * 0.05;
  }

  private calculateAllowances(
    basicSalary: number,
    allowances: any
  ): number {
    let total = 0;

    if (allowances.housing) {
      total += typeof allowances.housing === 'number'
        ? allowances.housing
        : basicSalary * (allowances.housing.percentage / 100);
    }

    // Similar for other allowances...

    return total;
  }

  private async getSalaryStructure(
    employeeId: string,
    effectiveDate: Date
  ): Promise<SalaryStructure> {
    return await this.ssRepository.findOne({
      where: {
        employee_id: employeeId,
        effective_date: LessThanOrEqual(effectiveDate),
        end_date: IsNull() || MoreThanOrEqual(effectiveDate),
      },
      order: { effective_date: 'DESC' },
    });
  }
}
```

**Calculate Payroll API:**

```typescript
@Controller('payroll/runs')
export class PayrollRunController {
  constructor(private payrollService: PayrollService) {}

  @Post()
  @RequirePermission('payroll.create')
  async createPayrollRun(@Body() dto: CreatePayrollRunDto) {
    const payrollRun = await this.payrollService.createPayrollRun(dto);
    return { status: 'success', data: payrollRun };
  }

  @Post(':id/calculate')
  @RequirePermission('payroll.calculate')
  async calculatePayroll(@Param('id') payrollRunId: string) {
    const result = await this.payrollService.calculatePayroll(payrollRunId);
    return { status: 'success', data: result };
  }

  @Get(':id/summary')
  @RequirePermission('payroll.read')
  async getPayrollSummary(@Param('id') payrollRunId: string) {
    const summary = await this.payrollService.getPayrollSummary(payrollRunId);
    return { status: 'success', data: summary };
  }

  @Get(':id/payslips')
  @RequirePermission('payroll.read')
  async getPayslips(@Param('id') payrollRunId: string) {
    const payslips = await this.payrollService.getPayslips(payrollRunId);
    return { status: 'success', data: payslips };
  }
}
```

---

## FEATURE-3: Payroll Approval Workflow

### 📘 User Story: US-34.3.1 - Multi-Level Approval System

**Story ID:** US-34.3.1
**Feature:** FEATURE-3 (Payroll Approval Workflow)
**Epic:** Business & Enterprise

**Story Points:** 5
**Priority:** P0 (Critical)
**Sprint:** Sprint 34
**Status:** 🔄 Not Started

---

#### User Story

```
As a finance manager
I want a multi-level approval workflow for payroll
So that large payrolls require multiple approvals and maintain financial controls
```

---

#### Acceptance Criteria

**Approval Workflow:**
- [ ] **AC1:** HR submits payroll for approval (status = PENDING_APPROVAL)
- [ ] **AC2:** Manager reviews payroll (view payroll summary, individual payslips)
- [ ] **AC3:** Manager approves or rejects (with comments)
- [ ] **AC4:** Dual approval for payroll > ₦5M (requires 2 approvers)
- [ ] **AC5:** Finance reviews and approves fund allocation
- [ ] **AC6:** Notifications to all approvers at each stage
- [ ] **AC7:** Approval history and timeline visible
- [ ] **AC8:** Cannot modify payroll after approval
- [ ] **AC9:** Re-calculate option if employee data changes before approval
- [ ] **AC10:** Reject with reason and resubmit workflow

**Access Control:**
- [ ] **AC11:** Role-based approval (Manager, Finance Lead, CFO)
- [ ] **AC12:** Approval chain: HR → Manager → Finance → CFO (for large payrolls)
- [ ] **AC13:** Cannot approve own submission (segregation of duties)
- [ ] **AC14:** Approval audit log

**Non-Functional:**
- [ ] **AC15:** Approval action < 500ms
- [ ] **AC16:** Notifications sent within 5 minutes

---

## FEATURE-4: Payslip Generation & Distribution

### 📘 User Story: US-34.4.1 - Automated Payslip Generation

**Story ID:** US-34.4.1
**Feature:** FEATURE-4 (Payslip Generation & Distribution)
**Epic:** Business & Enterprise

**Story Points:** 4
**Priority:** P1 (High)
**Sprint:** Sprint 34
**Status:** 🔄 Not Started

---

#### User Story

```
As an HR manager
I want to generate and distribute payslips to employees
So that employees receive timely, professional salary documentation
```

---

#### Acceptance Criteria

**Payslip Generation:**
- [ ] **AC1:** Auto-generate PDF payslip after payroll completion
- [ ] **AC2:** Professional payslip template with company branding
- [ ] **AC3:** Show gross salary, deductions breakdown, net salary
- [ ] **AC4:** Show allowances breakdown
- [ ] **AC5:** Show YTD salary and deductions
- [ ] **AC6:** Include company details (name, address, tax ID)
- [ ] **AC7:** Include employee details and period
- [ ] **AC8:** Generate 1000 payslips in < 15 seconds

**Distribution:**
- [ ] **AC9:** Email payslips securely to employees
- [ ] **AC10:** Bulk email option (send all payslips at once)
- [ ] **AC11:** Email includes secure link to view payslip
- [ ] **AC12:** SMS notification of salary deposit
- [ ] **AC13:** Digital payslip repository for employee access
- [ ] **AC14:** Download payslip as PDF
- [ ] **AC15:** Resend payslip option

**Non-Functional:**
- [ ] **AC16:** Payslips sent within 1 hour of approval
- [ ] **AC17:** Emails delivered within 5 minutes

---

## Summary of Sprint 34 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-34.1.1 | Employee Data Management | 8 | P0 | To Do |
| US-34.2.1 | Automated Payroll Calculation | 7 | P0 | To Do |
| US-34.3.1 | Multi-Level Approval System | 5 | P0 | To Do |
| US-34.4.1 | Automated Payslip Generation | 4 | P1 | To Do |
| US-34.5.1 | Compliance Reporting | 4 | P0 | To Do |
| US-34.6.1 | Batch Payments Integration | 2 | P0 | To Do |
| **Total** | | **30** | | |

---

## Dependencies

**External:**
- ExcelJS for file upload/export
- PDFKit for payslip generation
- EmailJS or SendGrid for email delivery
- BambooHR API (optional HR integration)

**Internal:**
- Batch payments system (Sprint 27)
- Authentication & Authorization (Sprint 1-3)
- Notification system (Sprint 7)
- Wallet system (Sprint 4-5)

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-34.1 | Payroll calculation accuracy issues | Low | Critical | Extensive unit tests, tax calculation verification |
| RISK-34.2 | Large payroll processing performance | Medium | Medium | Database indexing, batch processing, caching |
| RISK-34.3 | Approval workflow complexity | Medium | High | Clear SOP, audit logging, robust testing |
| RISK-34.4 | Bank account verification failures | Medium | High | Fall back to manual verification, robust error handling |
| RISK-34.5 | CSV upload data quality issues | High | Medium | Comprehensive validation, error reporting, preview |

---

## Notes & Decisions

**Technical Decisions:**
1. **PDF generation:** PDFKit for flexibility and branding customization
2. **Excel upload:** ExcelJS for comprehensive CSV/Excel support
3. **Tax calculation:** Hardcoded FIRS brackets (can be externalized to config later)
4. **Approval workflow:** Database-driven workflow (not using external BPM)
5. **Email delivery:** SendGrid for reliability and deliverability

**Open Questions:**
1. ❓ Should payroll calculations include overtime? **Decision: Yes, optional field**
2. ❓ How many approval levels? **Decision: Configurable, default 2-3 levels**
3. ❓ Should employees access payslips via main app or separate portal? **Decision: Integrated in main app with role-based access**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable automated payroll processing with compliance, approval workflow, and employee self-service
