# How to Use the Product Backlog

This document explains how to use the comprehensive Scrum backlog that has been created for the Ubiquitous Tribble Payment Platform.

---

## 📚 Document Structure

### 1. **PRODUCT_BACKLOG.md** (High-Level Overview)
**Location:** `docs/PRODUCT_BACKLOG.md`

**Purpose:** Product-level roadmap and sprint planning

**Contains:**
- Epic overview (17 epics)
- Story point estimates
- Priority matrix (P0, P1, P2)
- Sprint planning calendar (23 sprints)
- Business value assessments
- Dependencies between epics

**When to Use:**
- Planning which epic to work on next
- Understanding the big picture
- Estimating project timeline
- Prioritizing features
- Communicating with stakeholders

**Example Usage:**
```
Want to know: "What should I work on after authentication?"
→ Check PRODUCT_BACKLOG.md
→ See Sprint 2 focuses on EPIC-2 (Authentication)
→ Sprint 3 continues with MFA
→ Sprint 4 moves to EPIC-3 (Wallets)
```

---

### 2. **SPRINT_XX_BACKLOG.md** (Sprint-Level Detail)
**Location:** `docs/sprints/SPRINT_01_BACKLOG.md` (and future sprint files)

**Purpose:** Detailed implementation guide for a specific sprint

**Contains:**
- User stories with acceptance criteria
- Technical specifications
- Request/Response schemas
- Task breakdown
- Testing checklists
- Definition of Done
- Sprint ceremonies
- Velocity tracking

**When to Use:**
- During active development of a sprint
- When implementing a specific feature
- When writing tests
- When doing code reviews
- During daily standups

**Example Usage:**
```
Working on: "Create User Entity"
→ Open SPRINT_01_BACKLOG.md
→ Find User Story: US-1.1.1
→ Find Task: TASK-1.1.1.2
→ Follow the detailed schema
→ Check acceptance criteria
→ Run through testing checklist
```

---

## 🎯 Hierarchy Explained

```
EPIC (Business Initiative)
  ↓
FEATURE (Major Functionality)
  ↓
USER STORY (User-Facing Capability)
  ↓
TASK (Technical Implementation)
```

### Example Hierarchy:

```
EPIC-1: Core Infrastructure & Security
  │
  ├─ FEATURE-1.1: Database Architecture
  │   │
  │   ├─ US-1.1.1: Core Database Entities (13 SP)
  │   │   │
  │   │   ├─ TASK-1.1.1.1: Create Base Entity (2 SP) ✅
  │   │   ├─ TASK-1.1.1.2: Create User Entity (3 SP)
  │   │   ├─ TASK-1.1.1.3: Create Wallet Entity (2 SP)
  │   │   └─ TASK-1.1.1.4: Create Transaction Entity (3 SP)
  │   │
  │   └─ US-1.1.2: Database Migrations (8 SP)
  │
  ├─ FEATURE-1.2: Field-Level Encryption
  │   └─ US-1.2.1: Encrypt Sensitive Fields (13 SP)
  │
  └─ FEATURE-1.3: Security Infrastructure
      ├─ US-1.3.1: JWT Authentication (8 SP)
      ├─ US-1.3.2: Rate Limiting (5 SP)
      └─ US-1.3.3: Request Validation (5 SP)
```

---

## 📖 Reading a User Story

Each user story follows this format:

### **Header Section**
```markdown
### 📘 User Story: US-1.1.1 - Core Database Entities

**Story ID:** US-1.1.1
**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 1
**Status:** 🔄 In Progress
```

### **User Story Format**
```markdown
As a developer
I want to have all core database entities defined
So that I can implement business logic with consistent data models
```

### **Business Value**
```markdown
**Value Statement:** Explains WHY this story matters
**Impact:** HIGH/MEDIUM/LOW
**Dependencies:** What blocks this or depends on this
```

### **Acceptance Criteria**
```markdown
- [ ] AC1: Functional requirement
- [ ] AC2: Functional requirement
- [ ] AC3: Non-functional requirement (performance, security)
```

### **Technical Specifications**
- Database schemas
- API endpoint definitions
- Request/Response examples
- Business rules
- Constraints

### **Tasks**
```markdown
- TASK-1.1.1.1: Subtask with implementation details
- TASK-1.1.1.2: Subtask with implementation details
```

---

## 🔨 Working on a Task

### Step-by-Step Process:

#### 1. **Pick a Task**
```bash
# Open the sprint backlog
open docs/sprints/SPRINT_01_BACKLOG.md

# Find a task marked 🔄 To Do
# Change status to 🔄 In Progress
```

#### 2. **Read the Task Details**
Each task includes:
- **Description:** What to build
- **File Location:** Where to create the file
- **Schema/Code:** Implementation details
- **Acceptance Criteria:** Checklist of requirements
- **Testing Checklist:** What to test

#### 3. **Implement**
```bash
# Create the file
touch libs/database/src/entities/user.entity.ts

# Copy the schema from the task
# Implement according to specifications
# Follow the code examples provided
```

#### 4. **Test**
```markdown
Follow the Testing Checklist:
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Edge cases covered
```

#### 5. **Mark as Done**
```markdown
Check all items in Definition of Done:
- [ ] Code complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed
```

#### 6. **Update Status**
```bash
# In the sprint backlog markdown
Change: 🔄 In Progress
To:     ✅ Completed
```

---

## 📊 Story Points Guide

**Story Points** measure complexity and effort, NOT time.

### Fibonacci Scale:
- **1 SP:** Trivial (configuration change, simple fix)
- **2 SP:** Very simple (single entity, simple CRUD)
- **3 SP:** Simple (entity with relationships, basic service)
- **5 SP:** Medium (complex entity, service with business logic)
- **8 SP:** Complex (multiple files, integration, testing)
- **13 SP:** Very complex (major feature, multiple integrations)
- **21 SP:** Epic (should be broken down further)

### Sprint 1 Example:
```
US-1.1.1: Core Database Entities = 13 SP
  Why 13? Because it involves:
  - 15+ entities
  - Complex relationships
  - Database constraints
  - Extensive testing
  - High criticality

TASK-1.1.1.1: Create Base Entity = 2 SP
  Why 2? Because it's:
  - Single abstract class
  - Well-defined requirements
  - Quick to implement
  - Low risk
```

---

## 🏃 Sprint Workflow

### Before Sprint Starts:
1. Read sprint goal
2. Review all user stories
3. Understand dependencies
4. Note any risks
5. Set up environment

### During Sprint (Daily):
1. **Morning:**
   - Check sprint backlog
   - Pick next task
   - Update status to "In Progress"

2. **Work:**
   - Follow task specifications
   - Check off acceptance criteria
   - Write tests as you go

3. **Evening:**
   - Update progress
   - Mark completed tasks
   - Note any blockers
   - Plan tomorrow

### End of Sprint:
1. **Sprint Review:**
   - Demo completed features
   - Update completion percentage
   - Document what was done

2. **Sprint Retrospective:**
   - What went well?
   - What didn't go well?
   - What to improve?
   - Action items

3. **Update Velocity:**
   - Calculate completed story points
   - Update velocity for next sprint
   - Adjust future sprint plans if needed

---

## 📋 Sprint Tracking

### Burndown Chart
Track daily progress in the sprint backlog:

```markdown
| Day | Remaining SP | Completed SP | Notes |
|-----|--------------|--------------|-------|
| 1   | 45          | 0            | Started US-1.1.1 |
| 2   | 43          | 2            | Completed TASK-1.1.1.1 |
| 3   | 40          | 5            | Completed TASK-1.1.1.2 |
...
```

### Status Indicators
- 🔄 **To Do:** Not started
- 🔄 **In Progress:** Currently working
- ✅ **Completed:** Done and verified
- ⏸️ **Blocked:** Waiting on dependency
- ❌ **Cancelled:** No longer needed

---

## 🎨 Best Practices

### 1. **Follow the Format**
Don't deviate from the structure. It's designed for consistency.

### 2. **Update Frequently**
Mark tasks complete immediately. Update blockers daily.

### 3. **Write Good Commit Messages**
```bash
# Reference the task ID
git commit -m "feat: implement user entity (TASK-1.1.1.2)

- Added all required fields
- Defined relationships
- Added indexes
- Created unit tests

Closes TASK-1.1.1.2"
```

### 4. **Don't Skip Tests**
Every acceptance criterion must be tested.

### 5. **Ask Questions**
If a specification is unclear, document the question and make a decision.

### 6. **Document Decisions**
Add to the "Notes & Decisions" section:
```markdown
**Decision:** Use bcrypt with 12 rounds for password hashing
**Reason:** Balance between security and performance
**Date:** 2024-01-15
```

---

## 🚀 Getting Started

### Sprint 1 Quick Start:

1. **Read Sprint Goal**
   ```
   Sprint 1 Goal: Implement security infrastructure
   and core database entities
   ```

2. **Review User Stories**
   - Understand what needs to be built
   - Note dependencies
   - Check story points

3. **Start with First Task**
   ```bash
   # Task already completed ✅
   TASK-1.1.1.1: Create Base Entity

   # Next task 🔄
   TASK-1.1.1.2: Create User Entity
   ```

4. **Follow Task Steps**
   - Read description
   - Check file location
   - Copy schema
   - Implement
   - Test
   - Mark done

5. **Move to Next Task**
   Repeat until sprint complete!

---

## 📞 Need Help?

### Understanding the Backlog:
- **Question:** "What's the difference between a story and a task?"
  - **Answer:** Story = what the user gets, Task = how you build it

- **Question:** "Can I skip acceptance criteria?"
  - **Answer:** No. AC defines when you're done.

- **Question:** "What if a task is too big?"
  - **Answer:** Break it into smaller subtasks.

### Technical Questions:
- Check the technical specifications in the task
- Review the code examples provided
- Look at the testing checklist
- Check the Definition of Done

---

## 🎯 Success Metrics

### Story is Done When:
- [ ] All acceptance criteria checked
- [ ] All tests passing
- [ ] Code reviewed (self-review for solo)
- [ ] Documentation updated
- [ ] No blockers remaining

### Sprint is Done When:
- [ ] All committed stories completed
- [ ] Sprint goal achieved
- [ ] Demo completed
- [ ] Retrospective completed
- [ ] Next sprint planned

---

## 📈 Velocity Tracking

### After Each Sprint:
```markdown
Sprint 0: 40 SP completed → Velocity = 40
Sprint 1: 45 SP committed → Expected velocity = 42.5

If Sprint 1 completes 45 SP:
  New velocity = (40 + 45) / 2 = 42.5 SP

If Sprint 1 completes 35 SP:
  New velocity = (40 + 35) / 2 = 37.5 SP
  Adjust Sprint 2 commitment to ~38 SP
```

### Use Velocity to:
- Plan realistic sprint commitments
- Estimate project completion
- Identify improvement areas
- Track team growth

---

## 📚 Additional Resources

### Files to Reference:
- `docs/PRODUCT_BACKLOG.md` - High-level roadmap
- `docs/sprints/SPRINT_01_BACKLOG.md` - Current sprint details
- `docs/security/README.md` - Security implementation guides
- `README.md` - Project overview

### Next Sprints:
After completing Sprint 1, similar detailed backlogs should be created for:
- Sprint 2: User Authentication & Authorization
- Sprint 3: Multi-Factor Authentication
- Sprint 4: Wallet Core & Ledger
- ... (continue through Sprint 23)

---

## ✨ Summary

**The backlog is your implementation guide.**

- **Epics** tell you what to build (business goals)
- **Features** group related functionality
- **User Stories** define user value
- **Tasks** provide implementation steps
- **Acceptance Criteria** define "done"
- **Tests** verify correctness

Follow the structure, check off the items, and you'll build a production-grade payment platform step by step.

**Good luck with Sprint 1! 🚀**

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  QUICK REFERENCE - WORKING WITH BACKLOG                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📖 Read:        docs/sprints/SPRINT_01_BACKLOG.md         │
│  🎯 Find Task:   Search for "🔄 To Do"                      │
│  ✍️  Implement:  Follow technical specifications            │
│  ✅ Test:        Check all items in testing checklist       │
│  ✔️  Complete:   Mark as ✅ and update progress             │
│                                                              │
│  💡 Remember:                                                │
│     - Update status daily                                    │
│     - Follow acceptance criteria                             │
│     - Write tests                                            │
│     - Document decisions                                     │
│     - Commit with task ID                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
