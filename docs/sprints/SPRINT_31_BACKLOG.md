# Sprint 31 Backlog - Customer Support System

## Sprint Overview

**Sprint Goal:** Build comprehensive customer support ticket management system with SLA tracking, multi-channel support, and knowledge base integration

**Duration:** Week 62-63 (2 weeks)
**Story Points:** 35 SP
**Sprint Velocity Target:** 35 SP (within 40-45 SP velocity)
**Team Capacity:** 80 hours (1 developer × 8 hours/day × 10 days)
**Epic:** EPIC-22 (Customer Experience)

## Sprint Objectives

1. Enable customers to create and track support tickets across multiple channels
2. Provide support agents with efficient ticket management and routing tools
3. Implement SLA tracking and escalation workflows for timely resolution
4. Build knowledge base system to enable customer self-service
5. Create comprehensive support analytics and reporting dashboard

## Business Value

### Customer Impact
- **Faster Issue Resolution:** 50% reduction in average resolution time through efficient routing
- **Self-Service:** 30% ticket deflection rate through knowledge base
- **Transparency:** Real-time ticket status tracking and communication history
- **Multi-Channel Access:** Email, in-app, phone, and web portal support

### Business Impact
- **Operational Efficiency:** 40% increase in agent productivity through automation
- **Customer Retention:** Improved CSAT scores from 3.2 to 4.5/5.0
- **Cost Savings:** ₦2M/month reduction in support costs through automation
- **Compliance:** Audit trail for all customer interactions (CBN requirement)

### Technical Impact
- **Scalability:** Handle 10K+ tickets/month with < 2s response time
- **Integration:** Seamless access to user accounts, transactions, and wallet data
- **Automation:** 60% of tickets auto-categorized and routed
- **SLA Compliance:** 95%+ SLA adherence through automated escalation

## User Stories

---

### **US-31.1.1: Support Ticket Creation & Multi-Channel Intake**

**As a** customer
**I want to** create support tickets through multiple channels (email, in-app, web)
**So that** I can get help through my preferred communication method

**Story Points:** 10
**Priority:** P0 (Critical)
**Epic:** EPIC-22 (Customer Experience)
**Dependencies:**
- User authentication system (Sprint 4)
- Email service infrastructure (Sprint 8)
- Push notification system (Sprint 9)

**Acceptance Criteria:**

**AC1:** In-app ticket creation form with required fields
- Form includes: Subject (required, 10-200 chars), Category dropdown, Priority dropdown, Description (required, 50-5000 chars), Attachments (optional, max 5 files, 10MB total)
- Categories: Account Issues, Transaction Failed, Card Problems, KYC Verification, Fees & Charges, Security Concern, Feature Request, Other
- Priority auto-suggested based on category (Security Concern → High, Feature Request → Low)
- Real-time character counter for subject and description
- File upload validation: Accept .jpg, .png, .pdf, .doc, .docx only
- File virus scanning using ClamAV before upload
- Mobile-responsive form with accessibility (WCAG 2.1 AA compliance)

**AC2:** Email-to-ticket conversion for support@ubiquitous-tribble.com
- IMAP/POP3 integration with Gmail API for email polling every 30 seconds
- Email parser extracts: sender email, subject → ticket subject, body → description, attachments
- Auto-match sender email to user account; if no match, create "Guest" ticket
- HTML email body converted to plain text, sanitized to prevent XSS
- Inline images extracted and stored as attachments
- Auto-reply email sent within 5 seconds confirming ticket creation with ticket ID
- Thread detection: replies to existing tickets append to conversation, not create new ticket
- Spam detection using SpamAssassin; mark suspected spam for manual review

**AC3:** Web portal ticket submission (public-facing, no login required)
- Anonymous ticket creation form at https://support.ubiquitous-tribble.com
- Captcha (reCAPTCHA v3) to prevent bot submissions
- Guest users provide: name, email, phone (optional), subject, description
- Email verification required before ticket created (send 6-digit OTP)
- Rate limiting: max 3 tickets per email address per 24 hours
- Ticket tracking page: enter ticket ID + email to view status
- No authentication required to view own tickets (email verification on each access)

**AC4:** Phone call logging integration
- Manual ticket creation by support agents for phone calls
- Additional fields: Caller phone number, Call duration, Call recording link (optional)
- Agent notes field (internal, not visible to customer)
- Ticket auto-tagged with "PHONE" channel
- Call metadata stored: timestamp, duration, agent who took call

**AC5:** Ticket ID generation and tracking
- Ticket ID format: `TKT-YYYYMMDD-XXXXX` (e.g., TKT-20250501-00123)
- Sequential numbering within each day (00001 to 99999)
- Ticket ID visible prominently in all customer communications
- Ticket status workflow: NEW → OPEN → IN_PROGRESS → AWAITING_CUSTOMER → RESOLVED → CLOSED
- Status transitions logged with timestamp and actor
- Customers can reopen CLOSED tickets within 7 days

**AC6:** Automatic ticket categorization using ML/rules
- Rule-based categorization:
  - Subject/description contains "password", "login", "locked" → Account Issues
  - Contains "transfer failed", "transaction pending" → Transaction Failed
  - Contains "card declined", "ATM" → Card Problems
  - Contains "BVN", "verify", "document" → KYC Verification
- If confidence < 70%, category set to "Pending Classification" for manual review
- Agent can reclassify tickets; reclassification tracked for ML model improvement
- Weekly ML model retraining based on agent corrections

**AC7:** Priority assignment and escalation triggers
- Priority levels: Low (48h SLA), Medium (24h SLA), High (8h SLA), Urgent (2h SLA)
- Auto-priority rules:
  - Category "Security Concern" → Urgent
  - User tier "VIP" (>₦5M wallet balance) → High priority minimum
  - Transaction amount >₦500K mentioned → High
  - Keywords "fraud", "unauthorized", "hacked" → Urgent
- SLA countdown timer starts immediately upon ticket creation
- SLA breach warnings at 75%, 90%, and 100% of SLA time elapsed

**AC8:** Attachment handling and storage
- File upload to AWS S3 with presigned URLs (expire in 7 days)
- Files encrypted at rest using AES-256
- Virus scanning with ClamAV before upload; infected files rejected
- Attachment retention: 90 days for closed tickets, then archived to Glacier
- Agent can download attachments; download logged for audit
- Customer can download own attachments; watermarked with "Confidential - Support Ticket TKT-XXX"

**AC9:** Ticket assignment and routing
- Auto-assignment round-robin to available agents in category team
- Category teams: account_team, transaction_team, card_team, kyc_team, general_support
- Agent availability status: Available, Busy, Break, Offline
- Ticket queue per agent; max queue size: 20 tickets
- If all agents at capacity, ticket enters global queue (FIFO)
- Agent load balancing: prioritize agents with fewer open tickets

**AC10:** Customer notifications for ticket lifecycle
- Ticket created: Email + in-app notification with ticket ID and estimated response time
- Ticket assigned: Email "Your ticket has been assigned to [Agent Name]"
- Agent response: Email + push notification "New response on ticket TKT-XXX"
- Ticket resolved: Email "Your ticket has been resolved. Reply to reopen within 7 days"
- Ticket closed: Email "Ticket closed. Rate your experience [link]"
- SLA warning (customer-facing): "We're working hard on your issue. Estimated resolution: [time]"

**AC11:** Internal agent notifications
- New ticket assigned: In-app notification + email to agent
- Ticket escalated: Email + Slack notification to escalation team
- SLA breach imminent (90%): Email to agent + manager
- Customer response: In-app notification "Customer replied to TKT-XXX"
- High-priority ticket: Slack alert to #support-urgent channel

**AC12:** Duplicate ticket detection
- On ticket creation, search last 7 days for same user + similar subject (Levenshtein distance < 30%)
- If potential duplicate found, show warning to user: "You have similar ticket TKT-XXX. Continue?"
- Agent view shows "Potential duplicates" section with links to similar tickets
- Agent can merge tickets; merged tickets show combined conversation history

**AC13:** Multi-language support for ticket creation
- Form supports English, Yoruba, Hausa, Igbo languages
- User selects language in form dropdown; preference saved to profile
- Ticket conversation maintains language; agent responses auto-translated if agent doesn't speak language
- Translation using Google Cloud Translation API
- Original language preserved; translations shown with "[Translated from English]" tag

**AC14:** Ticket metadata and context enrichment
- Auto-attach user context to ticket:
  - User ID, name, email, phone, KYC tier
  - Account balance, total transaction volume
  - Recent transactions (last 10)
  - Active cards, recent card transactions
  - Login history (last 5 logins, devices)
  - Previous tickets (last 5)
- Context visible only to agents in ticket detail view
- Agent can click user ID to view full profile in modal

**AC15:** Accessibility and mobile optimization
- Ticket creation form WCAG 2.1 AA compliant
- Screen reader compatible with ARIA labels
- Keyboard navigation support (tab through fields)
- Mobile-responsive design: form adapts to 320px min width
- Touch-friendly buttons (min 44×44px target size)
- Dark mode support based on device preference

**AC16:** Rate limiting and abuse prevention
- Max 10 tickets per user per 24 hours
- Max 100 tickets per IP address per 24 hours
- If limit exceeded, show error: "You've reached the ticket creation limit. Contact us at [phone]"
- Suspicious patterns flagged: same description, rapid-fire submissions
- Admin dashboard shows flagged users/IPs for manual review

**AC17:** Ticket search and filter for customers
- Customer portal shows "My Tickets" with list of all tickets
- Filter by status: All, Open, Resolved, Closed
- Filter by date range: Last 7 days, 30 days, 90 days, All time
- Sort by: Newest first, Oldest first, Last updated
- Search by ticket ID or keywords in subject/description
- Pagination: 20 tickets per page

**AC18:** Email formatting and templates
- Auto-reply email template:
  ```
  Subject: [Ticket TKT-XXX] We've received your request

  Hi [Customer Name],

  Thank you for contacting Ubiquitous Tribble Support.

  Your ticket has been created:
  Ticket ID: TKT-XXX
  Subject: [Subject]
  Priority: [Priority]
  Estimated Response Time: [SLA Time]

  You can track your ticket status at: [Link]

  Our team will respond within [SLA Time].

  Best regards,
  Ubiquitous Tribble Support Team
  ```
- All emails include: Ticket ID in subject, unsubscribe link (for non-critical emails), company logo
- HTML emails with plain-text fallback

**AC19:** Performance requirements
- Ticket creation API response time < 500ms (95th percentile)
- Email-to-ticket conversion < 30 seconds from email receipt
- File upload supports concurrent uploads (5 files in parallel)
- Handle 1000 tickets/hour creation rate during peak hours
- Database queries optimized with indexes on user_id, status, category, created_at

**AC20:** Data validation and sanitization
- Subject: Strip HTML tags, max 200 chars, trim whitespace
- Description: Allow basic markdown (bold, italic, lists), sanitize HTML to prevent XSS
- Email: Validate format using regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone: Validate Nigerian format (234XXXXXXXXXX), international format allowed
- Attachment filename: Remove special chars, max 255 chars
- All inputs SQL injection protected using parameterized queries

**AC21:** Audit logging
- Log all ticket lifecycle events: created, assigned, updated, resolved, closed, reopened
- Log format: `[timestamp] [user_id] [action] [ticket_id] [details]`
- Logs stored in separate audit_logs table, immutable
- Retention: 7 years (regulatory compliance)
- Admin can export audit logs for specific ticket as CSV

**AC22:** Integration with transaction system
- If ticket mentions transaction reference (format: TXN-XXX), auto-link to transaction
- Linked transaction details shown in ticket context panel
- Agent can click to view full transaction details
- If transaction in FAILED/PENDING status, show "Related transaction issue" tag
- Agent can refund directly from ticket interface (permission required)

**AC23:** Ticket collaboration features
- Agents can add internal notes (not visible to customer)
- Internal notes support @mentions to notify other agents
- Agent can assign ticket to another agent with transfer note
- Transfer logged: "Ticket transferred from [Agent A] to [Agent B]: [Reason]"
- Previous agent removed from ticket; new agent notified

**AC24:** Service Level Agreement (SLA) configuration
- SLA matrix configurable per priority:
  - Urgent: 2h first response, 8h resolution
  - High: 8h first response, 24h resolution
  - Medium: 24h first response, 48h resolution
  - Low: 48h first response, 120h resolution
- Business hours: Mon-Fri 8AM-6PM WAT, exclude public holidays
- SLA paused when status = AWAITING_CUSTOMER
- SLA timer visible to both agent and customer

**AC25:** Error handling and edge cases
- If email server down, queue emails for retry (max 3 attempts, exponential backoff)
- If attachment upload fails, save ticket without attachment, notify user
- If categorization service fails, default to "General Support" category
- If notification service fails, ticket still created, notifications queued for retry
- Graceful degradation: if S3 down, save attachments to local filesystem temporarily

**AC26:** Testing requirements
- Unit tests: Form validation, email parsing, categorization logic, SLA calculation (35 tests)
- Integration tests: Ticket creation API, email-to-ticket flow, attachment upload (15 tests)
- E2E tests: User creates ticket via in-app form, email, web portal; receives confirmation (8 tests)
- Performance tests: 1000 tickets/hour creation, concurrent file uploads
- Security tests: XSS prevention, SQL injection protection, file upload validation

**AC27:** Monitoring and alerting
- CloudWatch metrics: ticket_creation_count, ticket_creation_latency, email_processing_time
- Alert if email processing time > 60 seconds
- Alert if ticket creation error rate > 5%
- Alert if SLA breach rate > 10% in 1 hour
- Dashboard shows: tickets created per channel, average creation time, error rate

**AC28:** Customer feedback loop
- After ticket closed, send CSAT survey via email (scale 1-5)
- Survey questions: "How satisfied are you with the resolution?", "How would you rate the agent's professionalism?"
- Survey response rate tracked; target 40%+
- Low ratings (1-2) trigger manager review
- Feedback stored with ticket for quality analysis

**AC29:** Regulatory compliance
- All customer communications encrypted in transit (TLS 1.3) and at rest (AES-256)
- PII data in tickets subject to NDPR (Nigeria Data Protection Regulation)
- Customer can request ticket data export (JSON format) via privacy portal
- Customer can request ticket deletion (soft delete, retained for 30 days then hard delete)
- Deletion logged in audit trail

**AC30:** Documentation requirements
- API documentation: POST /api/tickets (create ticket), GET /api/tickets/:id (get ticket details)
- Customer-facing guide: "How to Create a Support Ticket" with screenshots
- Agent training manual: Ticket creation best practices, categorization guidelines
- System architecture diagram: email flow, attachment storage, notification flow

---

### **US-31.1.2: Agent Ticket Management & Response System**

**As a** support agent
**I want to** view, respond to, and manage support tickets efficiently
**So that** I can resolve customer issues quickly and meet SLA targets

**Story Points:** 9
**Priority:** P0 (Critical)
**Epic:** EPIC-22 (Customer Experience)
**Dependencies:**
- US-31.1.1 (Ticket Creation)
- RBAC system (Sprint 7)

**Acceptance Criteria:**

**AC1:** Agent dashboard with ticket queue
- Dashboard shows assigned tickets in table format
- Columns: Ticket ID, Subject, Customer Name, Priority, Status, SLA Remaining, Created At, Last Updated
- Color-coded SLA indicator: Green (>50% remaining), Yellow (25-50%), Red (<25%), Flashing Red (breached)
- Default sort: SLA Remaining (ascending) to prioritize urgent tickets
- Pagination: 50 tickets per page
- Ticket count badges: Open (X), In Progress (Y), Awaiting Customer (Z)

**AC2:** Advanced filtering and search
- Filter by status: All, New, Open, In Progress, Awaiting Customer, Resolved
- Filter by priority: All, Urgent, High, Medium, Low
- Filter by category: All categories + individual categories
- Filter by assignment: My Tickets, Unassigned, All Tickets (manager view)
- Filter by SLA status: All, Within SLA, SLA Warning, SLA Breached
- Date range filter: Today, Last 7 days, Last 30 days, Custom range
- Search by: Ticket ID, customer name, customer email, keywords in subject/description
- Multiple filters combinable (e.g., Open + High Priority + Transaction Failed)

**AC3:** Ticket detail view with complete context
- Single-page ticket view with three panels: Conversation, Context, Actions
- **Conversation panel:**
  - Chronological message thread (customer messages, agent responses, internal notes)
  - Message format: Avatar, sender name, timestamp, message body
  - Customer messages in white background, agent responses in blue, internal notes in yellow
  - Rich text editor for agent responses: bold, italic, lists, links, code blocks
  - Attachment display: thumbnails for images, file icons for documents, download button
- **Context panel:**
  - Customer profile: name, email, phone, KYC tier, account balance, join date
  - Recent transactions: last 10 with amount, status, date
  - Active cards: card number (masked), status, balance
  - Previous tickets: last 5 with ID, subject, resolution
  - User risk score: low/medium/high based on fraud detection
- **Actions panel:**
  - Change status dropdown, change priority, change category
  - Assign to agent dropdown, escalate button
  - Add internal note, add tags
  - Merge with another ticket, create linked ticket
  - Refund transaction button (if transaction linked)

**AC4:** Response composition with rich text editor
- WYSIWYG editor with formatting: bold, italic, underline, strikethrough
- Text alignment: left, center, right, justify
- Lists: bulleted, numbered
- Links: insert hyperlink with validation
- Code blocks: syntax highlighting for JSON, logs
- Emoji support via picker
- File attachment: drag-and-drop or browse, max 5 files, 10MB total
- Response templates dropdown (see AC7)
- Character counter: warn at 4500/5000 chars
- Auto-save draft every 30 seconds to prevent data loss

**AC5:** Response submission and customer notification
- "Send" button submits response, updates ticket status to IN_PROGRESS
- "Send and Close" button submits response, updates status to RESOLVED
- Confirmation modal: "Are you sure you want to close this ticket?"
- Customer receives email notification within 30 seconds with response content
- In-app notification and push notification sent if customer online
- Response timestamped and logged in conversation thread
- Agent avatar and name displayed with response

**AC6:** Internal notes and team collaboration
- "Add Internal Note" button opens modal with text editor
- Internal notes NOT visible to customer, marked with "Internal" tag
- Agent can @mention other agents: type "@" shows autocomplete dropdown
- Mentioned agents receive notification: "You were mentioned in ticket TKT-XXX"
- Internal notes support same rich text formatting as customer responses
- Notes timestamped, show agent name and avatar

**AC7:** Predefined response templates
- Templates library accessible from response editor
- Template categories: Greetings, Account Issues, Transaction Failed, Apologies, Closing
- Example templates:
  - "Account Locked": "Hi {customer_name}, your account was locked due to {reason}. To unlock, please {steps}."
  - "Transaction Failed": "Your transaction {txn_id} failed because {reason}. We've refunded the amount to your wallet."
  - "Generic Apology": "We sincerely apologize for the inconvenience. Our team is working to resolve this issue."
- Templates support variables: {customer_name}, {ticket_id}, {txn_id}, {agent_name}
- Agent can edit template before sending
- Admin can create/edit/delete templates via admin panel

**AC8:** Ticket status management
- Status transitions:
  - NEW → OPEN (agent views ticket)
  - OPEN → IN_PROGRESS (agent sends first response)
  - IN_PROGRESS → AWAITING_CUSTOMER (agent requests more info)
  - AWAITING_CUSTOMER → IN_PROGRESS (customer responds)
  - IN_PROGRESS → RESOLVED (agent marks resolved)
  - RESOLVED → CLOSED (auto-close after 7 days or customer confirms)
  - CLOSED → OPEN (customer reopens within 7 days)
- Status change logged with timestamp and agent name
- Automatic transitions:
  - Auto-open when agent views NEW ticket (optional, configurable)
  - Auto-close RESOLVED tickets after 7 days of no customer response
  - Auto-AWAITING_CUSTOMER when agent response includes "Please provide..."

**AC9:** Priority and category changes
- Agent can change priority with dropdown: Urgent, High, Medium, Low
- Priority change requires reason in modal: "Why are you changing priority?"
- SLA timer recalculated based on new priority
- Agent can change category with dropdown (all categories)
- Category change suggestions: if ticket content suggests different category, show hint
- All changes logged in ticket activity timeline

**AC10:** Ticket assignment and transfer
- "Assign to" dropdown shows all agents in current category team
- Agent can self-assign unassigned tickets
- Agent can transfer ticket to another agent with transfer note (required)
- Transfer note format: "Transferring to [Agent] because [reason]"
- Original agent unassigned, new agent receives notification
- Transfer logged in activity timeline
- Manager can bulk-reassign tickets (select multiple, assign to agent)

**AC11:** Escalation workflow
- "Escalate" button opens escalation modal
- Escalation reasons: SLA Breach, Complex Issue, Customer VIP, Fraud Concern
- Escalation note required: explain why escalating
- Ticket assigned to escalation team (tier 2 support)
- Priority auto-increased (Medium → High, High → Urgent)
- Escalation logged with timestamp, reason, agent name
- Manager notified via email and Slack

**AC12:** Tagging system
- Agent can add tags to tickets: Billing, Refund, Bug, Feature Request, Duplicate, etc.
- Tag autocomplete from predefined tag library (100+ tags)
- Agent can create new tags; new tags require manager approval
- Multiple tags per ticket (max 10)
- Tags displayed as colored badges in ticket list and detail view
- Filter tickets by tag in dashboard
- Tag analytics: most common tags, tag frequency over time

**AC13:** Activity timeline and audit trail
- Right sidebar shows activity timeline in chronological order
- Timeline events:
  - Ticket created by {user} via {channel}
  - Assigned to {agent}
  - Status changed from {old} to {new} by {agent}
  - Priority changed from {old} to {new} by {agent}
  - Response sent by {agent}
  - Internal note added by {agent}
  - Escalated to {team} by {agent}
  - Merged with ticket {id} by {agent}
  - Closed by {agent}
- Each event timestamped with relative time (e.g., "2 hours ago")
- Hover shows exact timestamp
- Activity export as CSV for audit purposes

**AC14:** SLA timer and warnings
- SLA timer displayed prominently in ticket detail header
- Timer format: "XX hours YY minutes remaining"
- Color-coded: Green (>50%), Yellow (25-50%), Red (<25%), Flashing Red (breached)
- Timer pauses when status = AWAITING_CUSTOMER
- Timer resumes when customer responds
- SLA breach notification: email + Slack to agent and manager
- Agent can request SLA extension (manager approval required)

**AC15:** Keyboard shortcuts for efficiency
- `Ctrl+R`: Focus response editor
- `Ctrl+Enter`: Send response
- `Ctrl+Shift+Enter`: Send and close ticket
- `Ctrl+N`: Add internal note
- `Esc`: Close modals
- `J/K`: Navigate to next/previous ticket in list
- `Enter`: Open selected ticket
- `Ctrl+F`: Focus search box
- Shortcuts documented in help modal (press `?` to show)

**AC16:** Bulk actions for multiple tickets
- Checkbox column in ticket list for multi-select
- "Select All" checkbox selects all tickets on current page
- Bulk actions dropdown: Assign to agent, Change status, Change priority, Add tag, Export
- Bulk assign: select multiple tickets, assign to single agent
- Bulk status change: mark multiple tickets as RESOLVED
- Bulk tag: add tag to multiple tickets
- Confirmation modal for bulk actions: "Are you sure you want to change status of 15 tickets?"
- Bulk action limit: max 100 tickets per action

**AC17:** Customer communication history
- "Customer History" tab in ticket detail view
- Shows all tickets ever created by this customer (chronological)
- Filter history by status, date range
- Click any historical ticket to view full details in new tab
- Shows resolution summary for closed tickets
- Useful for identifying repeat issues or escalation patterns

**AC18:** Response time tracking
- Timer starts when ticket assigned to agent
- "Time to First Response" metric calculated: assigned_at → first_response_at
- "Time to Resolution" metric: created_at → resolved_at
- Agent dashboard shows personal metrics: Avg first response time, Avg resolution time
- Metrics color-coded vs. team average: Green (better), Yellow (average), Red (worse)
- Manager dashboard shows team metrics and individual agent leaderboard

**AC19:** Attachment handling in responses
- Agent can attach files to responses: screenshots, documents, guides
- Drag-and-drop file upload to response editor
- File preview before sending (images show thumbnail)
- Supported formats: .jpg, .png, .pdf, .doc, .docx, .xlsx, .zip
- Max 5 files per response, 10MB total
- Files uploaded to S3, virus scanned with ClamAV
- Customer receives download links in email notification

**AC20:** Ticket merging and linking
- "Merge with ticket" button opens search modal
- Search for duplicate/related tickets by ID or keywords
- Select ticket to merge into; current ticket conversation appended
- Merged ticket status auto-updated to CLOSED with note "Merged into TKT-XXX"
- Customers of merged ticket notified: "Your ticket merged with TKT-XXX for faster resolution"
- Merged ticket conversation maintains original timestamps and authors
- "Link to ticket" creates soft link without merging (for related issues)

**AC21:** Refund and transaction actions
- If ticket linked to failed/disputed transaction, "Refund" button visible
- Refund button opens modal: Amount (pre-filled), Reason (required), Confirmation
- Refund requires manager approval if amount > ₦50K
- Refund processed via wallet service API
- Refund confirmation posted to ticket conversation automatically
- Customer notified via email: "Refund of ₦X processed for transaction TXN-XXX"
- Refund logged in transaction audit trail

**AC22:** Agent availability status
- Agent status dropdown: Available, Busy, On Break, Offline
- Status displayed in agent profile and team roster
- Auto-status changes:
  - Online → Available when agent logs in
  - Available → Busy when agent working on ticket
  - Any status → Offline after 30 min inactivity
- Offline agents don't receive new ticket assignments
- Manager can view team availability dashboard

**AC23:** Real-time updates with WebSockets
- Ticket list auto-refreshes when new ticket assigned (no page reload)
- Ticket detail view shows live updates when customer responds
- New customer message appears in conversation thread immediately
- Toast notification: "New message from customer"
- Ticket count badges update in real-time
- WebSocket connection status indicator (connected/disconnected)

**AC24:** Performance optimization
- Ticket list renders with virtual scrolling for 1000+ tickets
- Lazy-load ticket details when opened (not on list view)
- Image thumbnails lazy-loaded as user scrolls
- Response editor debounced auto-save (300ms delay)
- API pagination: fetch 50 tickets per request
- Client-side caching: cache ticket details for 5 minutes
- Optimistic UI updates: status changes reflect immediately before server confirmation

**AC25:** Error handling and validation
- If response empty, show error: "Response cannot be empty"
- If attachment upload fails, show retry button
- If API request fails, show error toast with retry option
- If WebSocket disconnects, show reconnection attempt notification
- If customer deleted account, show warning: "Customer account deleted. Limited actions available."
- If ticket already closed, warn before reopening: "This ticket was closed. Are you sure you want to reopen?"

**AC26:** Testing requirements
- Unit tests: Status transitions, SLA calculation, template variable replacement (30 tests)
- Integration tests: Send response API, update status API, ticket assignment (12 tests)
- E2E tests: Agent views ticket, sends response, changes status, escalates (10 tests)
- Performance tests: Load 1000 tickets in list, render ticket detail, send response
- Accessibility tests: Keyboard navigation, screen reader compatibility

**AC27:** Monitoring and analytics
- CloudWatch metrics: response_sent_count, avg_response_time, ticket_resolution_rate
- Dashboard: tickets resolved per agent, average response time, SLA compliance rate
- Alert if average response time > 1 hour
- Alert if SLA compliance rate < 90%
- Weekly report emailed to manager: team performance summary

**AC28:** Documentation
- Agent user guide: "How to Respond to Tickets" with screenshots
- Video tutorial: Ticket management walkthrough (5 min)
- API documentation: POST /api/tickets/:id/responses, PATCH /api/tickets/:id
- Admin guide: Configure response templates, manage tags

---

### **US-31.2.1: Knowledge Base & Self-Service Portal**

**As a** customer
**I want to** search a knowledge base for answers to common questions
**So that** I can resolve issues quickly without creating a support ticket

**Story Points:** 8
**Priority:** P1 (High)
**Epic:** EPIC-22 (Customer Experience)
**Dependencies:**
- Content Management System (basic CMS for article creation)
- Search infrastructure (Elasticsearch or PostgreSQL full-text search)

**Acceptance Criteria:**

**AC1:** Public knowledge base portal at https://help.ubiquitous-tribble.com
- Public-facing website, no login required
- Homepage shows: Search bar, Featured Articles (5), Popular Categories (8)
- Categories: Getting Started, Account Management, Transactions, Cards, KYC/Verification, Fees, Security, Troubleshooting
- Responsive design: mobile (320px+), tablet (768px+), desktop (1024px+)
- Light/dark mode toggle based on device preference
- Multi-language support: English, Yoruba, Hausa, Igbo

**AC2:** Article creation and management (admin interface)
- Admin portal for creating/editing/deleting articles
- Article fields: Title (required, 10-200 chars), Category (dropdown), Tags (multi-select), Content (rich text editor), Status (Draft/Published), Author, Created At, Updated At
- Rich text editor supports: Headings (H2-H6), bold, italic, lists, links, images, code blocks, tables, callout boxes (info/warning/error)
- Image upload to S3, max 2MB per image, auto-resize to 800px width
- Article preview before publishing
- Version history: track all edits, revert to previous version

**AC3:** Article content structure and best practices
- Article template with sections: Overview, Step-by-Step Instructions, Screenshots/Videos, Related Articles, Still Need Help?
- "Still Need Help?" section includes: "Create a Support Ticket" button, "Contact Us" phone/email
- Article length: 300-3000 words recommended
- Screenshots annotated with arrows, highlights to guide users
- Video embeds from YouTube/Vimeo (iframe embeds)
- Callout boxes for important notes: [INFO], [WARNING], [TIP]

**AC4:** Full-text search with Elasticsearch
- Search bar auto-suggests articles as user types (debounced 300ms)
- Search query supports: Exact phrases ("transfer money"), wildcards (card*), fuzzy search (typo tolerance)
- Search algorithm ranks results by: relevance score, popularity (view count), recency (updated_at)
- Search results show: Title, snippet (first 200 chars with highlighted keywords), category, last updated date
- "No results found" page suggests: popular articles, contact support
- Search analytics: track popular queries, no-result queries for content gap analysis

**AC5:** Category browsing and navigation
- Category page lists all articles in category (sorted by popularity)
- Article card shows: Title, snippet (150 chars), view count, last updated
- Pagination: 20 articles per page
- Breadcrumb navigation: Home > Category > Article
- Sidebar shows: Related Categories, Popular Articles in Category

**AC6:** Article detail page
- Article layout: Title, author, last updated date, estimated read time, content
- Estimated read time: words / 200 wpm (average reading speed)
- Table of contents (TOC) auto-generated from headings (H2, H3)
- Sticky TOC sidebar on desktop, collapsible on mobile
- Progress bar at top showing scroll progress
- "Was this article helpful?" thumbs up/down widget at bottom
- Related articles section (3-5 articles) based on category and tags

**AC7:** Article rating and feedback
- "Was this article helpful?" widget: Yes (thumbs up) / No (thumbs down)
- If user clicks "No", show modal: "What went wrong?" with checkboxes (Inaccurate, Outdated, Confusing, Missing Info, Other)
- Optional comment field (max 500 chars)
- Feedback stored with article_id, user_id (if logged in), rating, reason, comment, timestamp
- Admin dashboard shows article ratings, low-rated articles flagged for review
- Target: 80%+ positive ratings

**AC8:** View count and popularity tracking
- View count incremented on each unique article view (per user session)
- "Popular Articles" section shows top 10 most-viewed articles
- "Trending Articles" shows articles with highest view count in last 7 days
- Admin analytics dashboard: Article views over time (chart), top articles by category
- Export analytics as CSV

**AC9:** Search suggestions and autocomplete
- As user types in search bar, show dropdown with 5 suggested articles
- Suggestions based on: Title match, keyword match in content
- Debounced search (300ms) to reduce API calls
- "See all results for '[query]'" link at bottom of dropdown
- Recent searches stored in localStorage (max 10), shown when search bar focused

**AC10:** Article recommendations based on ticket history
- When customer logs in, show "Recommended for You" section
- Recommendations based on previous support tickets (category, tags)
- If customer had "Transaction Failed" ticket, recommend "Why Transactions Fail" article
- Algorithm: ticket_category → article_category match, weighted by recency
- Max 5 recommendations, refresh daily

**AC11:** Embedded help widget in mobile app
- "Help" icon in app navigation opens in-app help modal
- Modal shows: Search bar, Featured Articles, "Contact Support" button
- Search within modal, results open in WebView (full article)
- User can create ticket directly from help modal if no answer found
- Track help widget usage: searches, article views, ticket creations from widget

**AC12:** Multi-language support with translation
- Articles created in English (primary language)
- Admin can add translations manually (Yoruba, Hausa, Igbo)
- Language selector in header: dropdown shows available languages
- User preference saved in cookie/localStorage
- If translation not available, show English version with notice: "This article is not yet available in [Language]"
- Machine translation option (Google Translate API) for quick translation, marked as "Auto-translated"

**AC13:** Article versioning and update notifications
- Every article edit creates new version (stored in article_versions table)
- Version metadata: version_number, edited_by, edited_at, change_summary
- Admin can compare versions: side-by-side diff view highlighting changes
- Revert to previous version with confirmation modal
- Major updates (flagged by admin) trigger notification to users who bookmarked article
- "Updated on [Date]" badge on recently updated articles (updated within last 7 days)

**AC14:** Article bookmarking (for logged-in users)
- Bookmark icon on article page (heart or star)
- Click to bookmark/unbookmark
- "My Bookmarks" page shows all bookmarked articles
- Sort bookmarks by: Recently added, Alphabetical, Category
- Export bookmarks as PDF (article titles + links)

**AC15:** Related articles and cross-linking
- "Related Articles" section at bottom of article (3-5 articles)
- Related articles algorithm: same category + overlapping tags + high rating
- Admin can manually link related articles
- In-article cross-linking: insert links to other articles in content (e.g., "Learn more about [Article Title]")
- Automatic broken link detection: weekly cron job checks for dead links, alerts admin

**AC16:** Print-friendly and PDF export
- "Print" button generates print-friendly version: removes header/footer/sidebar, optimizes for A4 page
- CSS @media print styles for clean printing
- "Download as PDF" button converts article to PDF using Puppeteer
- PDF includes: Title, author, date, content with images, footer with "Ubiquitous Tribble Knowledge Base"
- PDF download logged for analytics

**AC17:** Accessibility (WCAG 2.1 AA compliance)
- All images have alt text describing content
- Heading hierarchy (H1 for title, H2 for sections, H3 for subsections)
- Keyboard navigation: Tab through links, Enter to open
- Screen reader compatible: ARIA labels, landmarks (nav, main, aside, footer)
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- Focus indicators visible for keyboard navigation
- Skip to main content link for screen readers

**AC18:** Performance and caching
- Articles cached in CDN (CloudFront) with 24-hour TTL
- Cache invalidation on article update/publish
- Page load time < 2 seconds (95th percentile)
- Images lazy-loaded as user scrolls
- Critical CSS inlined, non-critical CSS loaded async
- Preload fonts to reduce font flash
- Service worker for offline article viewing (PWA)

**AC19:** SEO optimization
- Meta tags: title, description (150 chars), keywords, og:image (Open Graph for social sharing)
- Structured data (JSON-LD schema): Article type, headline, datePublished, author, image
- Canonical URLs to prevent duplicate content
- XML sitemap auto-generated daily, submitted to Google Search Console
- robots.txt allows all crawlers
- 301 redirects for article URL changes (slug changes)
- Target: Top 10 Google results for "ubiquitous tribble [topic]" searches

**AC20:** Analytics and insights
- Track metrics: Page views, unique visitors, bounce rate, avg time on page, search queries
- Google Analytics integration (GA4)
- Custom events: article_viewed, search_performed, feedback_submitted, ticket_created_from_article
- Admin dashboard: Top articles, search queries with no results, articles with low ratings
- A/B testing: test different article titles, layouts to optimize engagement
- Monthly report: articles created, views, deflection rate (tickets avoided via KB)

**AC21:** Content approval workflow
- Article statuses: Draft, Pending Review, Approved, Published, Archived
- Author creates article → Draft
- Author submits for review → Pending Review, notifies reviewer
- Reviewer approves/rejects with comments
- If approved → Published (live on KB)
- If rejected → back to Draft with feedback
- All status changes logged in article history

**AC22:** Article categorization and tagging
- Hierarchical categories: Parent category (Transactions) > Subcategory (Bank Transfers, Card Payments)
- Max 2 levels deep to avoid complexity
- Tags: Freeform, multi-select, max 10 per article
- Popular tags auto-suggested when typing (autocomplete)
- Tag cloud on homepage shows most used tags (size based on frequency)
- Filter articles by tag: click tag shows all articles with that tag

**AC23:** Video tutorials and multimedia
- Embed YouTube/Vimeo videos using iframe
- Video thumbnail with play button overlay
- Video transcript below video for accessibility
- Upload video directly to S3 (max 100MB, .mp4 format)
- Video player with playback controls: play/pause, volume, fullscreen, speed (0.5x, 1x, 1.5x, 2x)
- Track video views, completion rate (% watched)

**AC24:** Contact support integration
- "Still need help?" section on every article
- "Create Support Ticket" button pre-fills category based on article category
- If user searched before viewing article, search query attached to ticket for context
- Track ticket deflection rate: % of users who viewed article vs. created ticket
- Target: 30% ticket deflection rate

**AC25:** Error handling and fallbacks
- If search service down, show cached popular articles
- If article not found (deleted/unpublished), show 404 page with search bar
- If image load fails, show placeholder image
- If translation service down, fall back to English version
- Graceful degradation for JavaScript-disabled browsers (basic HTML content)

**AC26:** Testing requirements
- Unit tests: Search algorithm, article ranking, feedback submission (20 tests)
- Integration tests: Create article API, publish article, search articles (10 tests)
- E2E tests: User searches KB, views article, submits feedback, creates ticket (8 tests)
- Accessibility tests: Screen reader compatibility, keyboard navigation, color contrast
- Performance tests: Page load time, search response time, concurrent users

**AC27:** Documentation
- Content author guide: "How to Write Effective KB Articles" with best practices
- Admin guide: Article creation, approval workflow, analytics dashboard
- API documentation: GET /api/kb/articles, POST /api/kb/articles/:id/feedback

---

### **US-31.3.1: Support Analytics & Reporting Dashboard**

**As a** support manager
**I want to** view comprehensive analytics and reports on support performance
**So that** I can identify bottlenecks, optimize workflows, and improve customer satisfaction

**Story Points:** 8
**Priority:** P1 (High)
**Epic:** EPIC-22 (Customer Experience)
**Dependencies:**
- Data warehouse or analytics database (separate from transactional DB)
- Charting library (Chart.js or Recharts)

**Acceptance Criteria:**

**AC1:** Manager analytics dashboard overview page
- Dashboard accessible at /admin/support/analytics (requires SUPPORT_MANAGER role)
- Top KPI cards (24-hour snapshot):
  - Total Tickets Created: 1,234 (↑12% vs. yesterday)
  - Open Tickets: 567 (↓5%)
  - Avg First Response Time: 2.3 hours (↓15%, green indicator)
  - Avg Resolution Time: 18.5 hours (↑8%, red indicator)
  - SLA Compliance Rate: 94.2% (target: 95%, yellow indicator)
  - CSAT Score: 4.5/5.0 (↑0.2)
- Each KPI card shows: current value, trend (up/down arrow), % change, comparison period selector (vs. yesterday, last week, last month)

**AC2:** Ticket volume trends chart
- Line chart showing ticket creation volume over time
- Date range selector: Last 7 days, 30 days, 90 days, Custom range (date picker)
- Granularity options: Hourly (for 7 days), Daily (for 30 days), Weekly (for 90 days)
- Multiple series: Total tickets, Open tickets, Resolved tickets
- Toggle series on/off by clicking legend
- Hover tooltip shows exact values for each date
- Export chart as PNG image or CSV data
- Insights panel: "Peak hours: 2PM-4PM WAT (32% of tickets)", "Slowest day: Sunday (18% of weekly volume)"

**AC3:** Ticket distribution by category (pie chart)
- Pie chart showing % breakdown: Account Issues (28%), Transaction Failed (22%), Card Problems (15%), etc.
- Hover shows: Category name, count, percentage
- Click slice to drill down: view tickets in that category
- Color-coded: consistent colors per category across all charts
- "Other" category for categories <5% (grouped)
- Export as PNG or CSV

**AC4:** Ticket distribution by priority (bar chart)
- Horizontal bar chart: Urgent (45), High (123), Medium (567), Low (499)
- Bars color-coded: Urgent (red), High (orange), Medium (yellow), Low (green)
- Click bar to filter ticket list by that priority
- Show average resolution time per priority as secondary metric (on same chart)
- Export as PNG or CSV

**AC5:** Ticket distribution by channel (donut chart)
- Donut chart: In-App (45%), Email (30%), Web Portal (20%), Phone (5%)
- Center shows total ticket count
- Hover shows channel name, count, percentage
- Insights: "Email tickets have 2x higher resolution time vs. in-app"
- Export as PNG or CSV

**AC6:** SLA compliance tracking
- SLA compliance rate: % of tickets resolved within SLA target
- Breakdown by priority: Urgent (88%), High (92%), Medium (96%), Low (98%)
- SLA breach table: List of breached tickets with ID, customer, priority, breach time, assigned agent
- Click ticket ID to view full ticket details
- Filter breaches by date range, category, agent
- Target line at 95% on chart
- Alert if compliance rate drops below 90%

**AC7:** Agent performance metrics table
- Table columns: Agent Name, Tickets Assigned, Tickets Resolved, Avg First Response Time, Avg Resolution Time, CSAT Score, SLA Compliance %
- Sort by any column (ascending/descending)
- Color-coded cells: Green (above average), Yellow (average), Red (below average)
- Click agent name to view individual agent dashboard (see AC15)
- Filter by team/category
- Export as CSV for performance reviews

**AC8:** Response time analysis
- Time to First Response: Box plot showing distribution (min, Q1, median, Q3, max)
- Breakdown by priority, category, channel
- Trend over time: line chart showing avg first response time per day (last 30 days)
- Target line: 2 hours for High priority, 4 hours for Medium
- Outlier detection: tickets with >24h first response time highlighted
- Drill-down: click outlier to view ticket details and identify root cause

**AC9:** Resolution time analysis
- Time to Resolution: Histogram showing distribution (0-4h, 4-8h, 8-24h, 24-48h, >48h)
- Breakdown by priority, category, agent
- Trend over time: line chart showing avg resolution time per week (last 12 weeks)
- Comparison: current period vs. previous period (e.g., this month vs. last month)
- Top 10 longest-open tickets table with ID, subject, open days, assigned agent
- Click ticket to investigate delays

**AC10:** Customer satisfaction (CSAT) analysis
- CSAT score: Average rating (1-5 scale) with trend
- Rating distribution: Bar chart showing count of 1-star, 2-star, ..., 5-star ratings
- CSAT by agent: Table showing agent name, CSAT score, response count
- Low CSAT tickets: List of 1-2 star ratings with ticket ID, customer comment, agent
- Word cloud of feedback comments (size = frequency) to identify themes
- CSAT trend over time: line chart (weekly avg)

**AC11:** Ticket backlog and aging report
- Backlog table: Open tickets grouped by age (0-1 day, 1-3 days, 3-7 days, 7-14 days, >14 days)
- Count and % per age bucket
- Oldest ticket highlighted with alert: "Ticket TKT-XXX open for 23 days"
- Filter by category, priority, agent
- Backlog trend: line chart showing open ticket count over last 90 days
- Actionable insights: "Backlog increased 15% this week. Consider additional resources."

**AC12:** Hourly ticket heatmap
- Heatmap showing ticket creation by hour (X-axis) and day of week (Y-axis)
- Color intensity: darker = more tickets
- Identify peak hours for staffing optimization
- Overlay agent availability to show gaps
- Example insight: "Peak hours 2-4PM have 3 agents, recommend 5 agents for optimal coverage"

**AC13:** Category and tag analysis
- Tag frequency: Table showing tag name, count, % of total tickets
- Tag trend: chart showing tag usage over time (e.g., "Bug" tag increasing)
- Category performance: Table with category, avg resolution time, SLA compliance, CSAT
- Identify problem categories: categories with low CSAT or high resolution time
- Drill-down: click category to view all tickets

**AC14:** Ticket deflection and self-service metrics
- Knowledge base impact: % of users who viewed KB article before creating ticket
- Ticket deflection rate: (KB views) / (KB views + Tickets created) × 100%
- Target: 30% deflection rate
- Top deflecting articles: KB articles that resulted in NO ticket creation
- Search queries with no KB results: identify content gaps
- Chart: KB views vs. Ticket creations over time

**AC15:** Individual agent dashboard (drill-down)
- Agent name, photo, contact info
- Personal KPIs: Tickets assigned, resolved, avg response time, CSAT, SLA compliance
- Ticket list: Agent's current open tickets with status, SLA remaining
- Performance trend: Chart showing agent metrics over last 12 weeks
- Comparison to team average: "Your avg response time is 15% faster than team"
- Feedback summary: Recent CSAT ratings with customer comments
- Goals and targets: Set by manager (e.g., "Resolve 50 tickets this week")

**AC16:** Custom report builder
- Drag-and-drop interface to build custom reports
- Select dimensions: Date, Category, Priority, Channel, Agent, Status
- Select metrics: Count, Avg Response Time, Avg Resolution Time, CSAT
- Filters: Date range, category, priority, agent, status
- Visualizations: Table, Line chart, Bar chart, Pie chart
- Save report template for future use (e.g., "Weekly Management Report")
- Schedule report: Send via email daily/weekly/monthly

**AC17:** Export and sharing
- Export all reports and charts as PNG (charts), CSV (data), PDF (full dashboard)
- PDF includes: Dashboard snapshot, all charts, summary insights, date range
- Share report via email: Enter recipient emails, subject, message
- Schedule automated email reports: Daily digest, weekly summary, monthly review
- Email format: HTML with embedded charts, link to full dashboard

**AC18:** Real-time data refresh
- Dashboard data refreshes every 5 minutes automatically (WebSocket updates)
- Manual refresh button to force immediate update
- Last updated timestamp displayed: "Last updated: 2 minutes ago"
- Real-time alerts: If SLA compliance drops below 90%, show banner alert
- Live ticket count: Open tickets count updates in real-time as tickets resolved

**AC19:** Benchmarking and targets
- Set targets per metric: SLA compliance (95%), CSAT (4.5/5.0), Avg response time (2h)
- Visual indicators: Green (above target), Yellow (near target), Red (below target)
- Historical comparison: This month vs. last month, this quarter vs. last quarter
- Industry benchmarks: Compare against fintech industry averages (if available)
- Goal tracking: Track progress toward quarterly/annual support goals

**AC20:** Drill-down and root cause analysis
- Click any chart/metric to drill down to ticket-level details
- Example: Click "High Priority" bar → view all high-priority tickets in table
- Filter tickets by any combination of dimensions
- Root cause tagging: Tag tickets with root cause (system bug, user error, etc.)
- Root cause analysis report: Group tickets by root cause, identify patterns
- Example insight: "30% of 'Transaction Failed' tickets caused by insufficient balance"

**AC21:** Predictive analytics and forecasting
- Forecast ticket volume for next 7 days based on historical trends (simple moving average or linear regression)
- Show prediction with confidence interval (shaded area on chart)
- Anomaly detection: Alert if ticket volume spikes >30% above forecast
- Example alert: "Ticket volume today 45% above forecast. Check for system issues."
- Staffing recommendations: Based on forecasted volume, suggest agent count needed

**AC22:** Accessibility and responsiveness
- Dashboard responsive on desktop (1920px), laptop (1366px), tablet (768px)
- Mobile view shows simplified KPI cards, charts collapse to tables
- Keyboard navigation: Tab through charts, Enter to drill down
- Screen reader compatible: ARIA labels for charts, alt text for images
- High contrast mode option for visually impaired users

**AC23:** Performance optimization
- Dashboard loads in < 3 seconds (95th percentile)
- Data aggregation pre-computed in data warehouse (nightly batch job)
- Charts render client-side from JSON data (reduce server load)
- Pagination for large tables (100 rows per page)
- Lazy-load charts: only render visible charts, load others on scroll
- Caching: Cache dashboard data for 5 minutes in Redis

**AC24:** Role-based access control
- SUPPORT_MANAGER role: Full access to all analytics, all agents
- SUPPORT_TEAM_LEAD role: Access to team metrics, own team agents only
- SUPPORT_AGENT role: Access to personal dashboard only (AC15)
- ADMIN role: Full access + ability to configure targets, create custom reports
- Audit log: Track who accessed dashboard, which reports exported

**AC25:** Monitoring and alerting
- CloudWatch metrics: dashboard_load_time, chart_render_time, query_execution_time
- Alert if dashboard load time > 5 seconds
- Alert if query execution time > 10 seconds (optimize query)
- Error tracking: Sentry for frontend errors, CloudWatch for backend errors
- Uptime monitoring: Pingdom to check dashboard availability every 5 minutes

**AC26:** Testing requirements
- Unit tests: KPI calculation, data aggregation, chart data formatting (25 tests)
- Integration tests: Fetch analytics data API, export report, schedule email (10 tests)
- E2E tests: Manager views dashboard, drills down into category, exports PDF (8 tests)
- Performance tests: Load dashboard with 100K tickets, render charts, handle concurrent users
- Accessibility tests: Keyboard navigation, screen reader, color contrast

**AC27:** Documentation
- Manager user guide: "How to Use the Support Analytics Dashboard" with screenshots
- Video tutorial: Dashboard walkthrough, custom report builder demo (10 min)
- API documentation: GET /api/support/analytics, GET /api/support/agents/:id/metrics
- Admin guide: Set targets, configure alerts, schedule reports

---

## Technical Implementation

### Database Schema

```sql
-- Support Tickets Table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(50) UNIQUE NOT NULL, -- Format: TKT-YYYYMMDD-XXXXX
  user_id UUID REFERENCES users(id), -- NULL for guest tickets
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, URGENT
  status VARCHAR(30) NOT NULL, -- NEW, OPEN, IN_PROGRESS, AWAITING_CUSTOMER, RESOLVED, CLOSED
  channel VARCHAR(20) NOT NULL, -- IN_APP, EMAIL, WEB, PHONE

  -- Assignment and routing
  assigned_agent_id UUID REFERENCES users(id),
  assigned_team VARCHAR(50),

  -- SLA tracking
  sla_deadline TIMESTAMP,
  sla_breached BOOLEAN DEFAULT FALSE,
  sla_paused_at TIMESTAMP,
  sla_time_paused_ms BIGINT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Guest ticket fields
  guest_name VARCHAR(100),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),

  -- Metadata
  linked_transaction_id UUID REFERENCES transactions(id),
  tags TEXT[], -- Array of tag strings

  -- Ratings
  csat_rating INTEGER CHECK (csat_rating BETWEEN 1 AND 5),
  csat_feedback TEXT,
  csat_submitted_at TIMESTAMP,

  INDEX idx_tickets_user (user_id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_category (category),
  INDEX idx_tickets_priority (priority),
  INDEX idx_tickets_assigned_agent (assigned_agent_id),
  INDEX idx_tickets_created_at (created_at DESC),
  INDEX idx_tickets_sla_deadline (sla_deadline)
);

-- Ticket Messages (Conversation)
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id), -- NULL for system messages
  sender_type VARCHAR(20) NOT NULL, -- CUSTOMER, AGENT, SYSTEM
  message_body TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to customer
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_messages_ticket (ticket_id, created_at DESC)
);

-- Ticket Attachments
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_url VARCHAR(1000) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  virus_scan_status VARCHAR(20), -- PENDING, CLEAN, INFECTED
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_attachments_ticket (ticket_id)
);

-- Ticket Activity Log (Audit Trail)
CREATE TABLE ticket_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id), -- NULL for system actions
  action VARCHAR(50) NOT NULL, -- CREATED, ASSIGNED, STATUS_CHANGED, PRIORITY_CHANGED, etc.
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_activity_ticket (ticket_id, created_at DESC)
);

-- Knowledge Base Articles
CREATE TABLE kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL, -- URL-friendly version of title
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  content TEXT NOT NULL, -- HTML content
  status VARCHAR(20) NOT NULL, -- DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED
  author_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),

  -- Analytics
  view_count BIGINT DEFAULT 0,
  helpful_count BIGINT DEFAULT 0,
  not_helpful_count BIGINT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,

  -- SEO
  meta_description VARCHAR(160),
  meta_keywords TEXT[],

  INDEX idx_articles_category (category),
  INDEX idx_articles_status (status),
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_view_count (view_count DESC)
);

-- Full-text search index for articles (PostgreSQL)
CREATE INDEX idx_articles_fulltext ON kb_articles USING gin(to_tsvector('english', title || ' ' || content));

-- KB Article Versions
CREATE TABLE kb_article_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  change_summary VARCHAR(500),
  edited_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (article_id, version_number),
  INDEX idx_versions_article (article_id, version_number DESC)
);

-- KB Article Feedback
CREATE TABLE kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- NULL for anonymous feedback
  rating VARCHAR(10) NOT NULL, -- HELPFUL, NOT_HELPFUL
  reason TEXT[], -- Array of reasons (INACCURATE, OUTDATED, CONFUSING, etc.)
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_feedback_article (article_id)
);

-- KB Article Translations
CREATE TABLE kb_article_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL, -- en, yo, ha, ig
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  translated_by UUID REFERENCES users(id),
  is_machine_translated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (article_id, language),
  INDEX idx_translations_article_lang (article_id, language)
);

-- Support Response Templates
CREATE TABLE response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  content TEXT NOT NULL, -- Supports variables: {customer_name}, {ticket_id}, etc.
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  usage_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_templates_category (category)
);

-- Support Analytics (Materialized View - refreshed nightly)
CREATE MATERIALIZED VIEW support_analytics_daily AS
SELECT
  DATE(created_at) AS date,
  category,
  priority,
  channel,
  COUNT(*) AS tickets_created,
  COUNT(*) FILTER (WHERE status IN ('RESOLVED', 'CLOSED')) AS tickets_resolved,
  AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600) AS avg_first_response_hours,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_resolution_hours,
  COUNT(*) FILTER (WHERE sla_breached = TRUE) AS sla_breaches,
  AVG(csat_rating) AS avg_csat_rating
FROM support_tickets
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), category, priority, channel;

CREATE UNIQUE INDEX idx_analytics_daily_unique ON support_analytics_daily (date, category, priority, channel);

-- Refresh materialized view nightly at 2 AM
-- (Scheduled via cron job or pg_cron extension)
```

### API Endpoints

```typescript
// Ticket Creation & Management
POST   /api/support/tickets                    // Create new ticket
GET    /api/support/tickets                    // List tickets (with filters)
GET    /api/support/tickets/:id                // Get ticket details
PATCH  /api/support/tickets/:id                // Update ticket (status, priority, etc.)
DELETE /api/support/tickets/:id                // Delete ticket (soft delete)

// Ticket Messages
POST   /api/support/tickets/:id/messages       // Add message (customer response or agent response)
GET    /api/support/tickets/:id/messages       // Get all messages for ticket

// Ticket Actions
POST   /api/support/tickets/:id/assign         // Assign ticket to agent
POST   /api/support/tickets/:id/escalate       // Escalate ticket
POST   /api/support/tickets/:id/merge          // Merge with another ticket
POST   /api/support/tickets/:id/reopen         // Reopen closed ticket

// Attachments
POST   /api/support/tickets/:id/attachments    // Upload attachment
GET    /api/support/attachments/:id/download   // Download attachment

// CSAT Ratings
POST   /api/support/tickets/:id/csat           // Submit CSAT rating

// Knowledge Base
GET    /api/kb/articles                        // List articles (public)
GET    /api/kb/articles/:slug                  // Get article by slug (public)
POST   /api/kb/articles                        // Create article (admin)
PATCH  /api/kb/articles/:id                    // Update article (admin)
DELETE /api/kb/articles/:id                    // Delete article (admin)
POST   /api/kb/articles/:id/feedback           // Submit article feedback
GET    /api/kb/search                          // Search articles

// Response Templates
GET    /api/support/templates                  // List templates
POST   /api/support/templates                  // Create template (admin)

// Analytics
GET    /api/support/analytics/overview         // Dashboard overview KPIs
GET    /api/support/analytics/tickets          // Ticket volume trends
GET    /api/support/analytics/agents           // Agent performance metrics
GET    /api/support/analytics/sla              // SLA compliance report
GET    /api/support/analytics/csat             // CSAT analysis
```

### TypeScript Implementation - Ticket Creation Service

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketMessage, TicketAttachment } from './entities';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notifications/notification.service';
import { VirusScanService } from '../security/virus-scan.service';
import { generateTicketId, calculateSLADeadline } from './utils';

export interface CreateTicketDto {
  userId?: string; // Optional for guest tickets
  subject: string;
  description: string;
  category: string;
  priority?: string; // Auto-suggested if not provided
  channel: 'IN_APP' | 'EMAIL' | 'WEB' | 'PHONE';
  attachments?: Express.Multer.File[];
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  linkedTransactionId?: string;
}

@Injectable()
export class TicketCreationService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepo: Repository<SupportTicket>,
    @InjectRepository(TicketMessage)
    private messageRepo: Repository<TicketMessage>,
    @InjectRepository(TicketAttachment)
    private attachmentRepo: Repository<TicketAttachment>,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private virusScanService: VirusScanService,
  ) {}

  async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    // Validation
    this.validateTicketDto(dto);

    // Check for duplicate tickets (same user, similar subject in last 7 days)
    const duplicates = await this.findDuplicateTickets(dto.userId, dto.subject);
    if (duplicates.length > 0) {
      // Log warning but continue (user already warned in frontend)
      console.warn(`Potential duplicate ticket for user ${dto.userId}. Similar: ${duplicates.map(t => t.ticket_id).join(', ')}`);
    }

    // Auto-suggest priority if not provided
    const priority = dto.priority || this.suggestPriority(dto.category, dto.description);

    // Generate ticket ID
    const ticketId = generateTicketId();

    // Calculate SLA deadline based on priority
    const slaDeadline = calculateSLADeadline(priority);

    // Create ticket
    const ticket = this.ticketRepo.create({
      ticket_id: ticketId,
      user_id: dto.userId || null,
      subject: dto.subject.trim(),
      description: dto.description.trim(),
      category: dto.category,
      priority,
      status: 'NEW',
      channel: dto.channel,
      sla_deadline: slaDeadline,
      guest_name: dto.guestName,
      guest_email: dto.guestEmail,
      guest_phone: dto.guestPhone,
      linked_transaction_id: dto.linkedTransactionId,
    });

    const savedTicket = await this.ticketRepo.save(ticket);

    // Create initial message (customer's description)
    const initialMessage = this.messageRepo.create({
      ticket_id: savedTicket.id,
      sender_id: dto.userId || null,
      sender_type: 'CUSTOMER',
      message_body: dto.description,
      is_internal: false,
    });
    await this.messageRepo.save(initialMessage);

    // Handle attachments if any
    if (dto.attachments && dto.attachments.length > 0) {
      await this.handleAttachments(savedTicket.id, initialMessage.id, dto.attachments);
    }

    // Auto-assign ticket to agent
    await this.autoAssignTicket(savedTicket);

    // Send notifications
    await this.sendTicketCreatedNotifications(savedTicket, dto);

    // Log activity
    await this.logActivity(savedTicket.id, null, 'CREATED', null, null, `Ticket created via ${dto.channel}`);

    return savedTicket;
  }

  private validateTicketDto(dto: CreateTicketDto): void {
    if (dto.subject.length < 10 || dto.subject.length > 200) {
      throw new BadRequestException('Subject must be 10-200 characters');
    }
    if (dto.description.length < 50 || dto.description.length > 5000) {
      throw new BadRequestException('Description must be 50-5000 characters');
    }
    const validCategories = ['Account Issues', 'Transaction Failed', 'Card Problems', 'KYC Verification', 'Fees & Charges', 'Security Concern', 'Feature Request', 'Other'];
    if (!validCategories.includes(dto.category)) {
      throw new BadRequestException('Invalid category');
    }
    if (!dto.userId && (!dto.guestEmail || !dto.guestName)) {
      throw new BadRequestException('Guest tickets require name and email');
    }
    if (dto.attachments && dto.attachments.length > 5) {
      throw new BadRequestException('Maximum 5 attachments allowed');
    }
    const totalSize = dto.attachments?.reduce((sum, file) => sum + file.size, 0) || 0;
    if (totalSize > 10 * 1024 * 1024) {
      throw new BadRequestException('Total attachment size must be < 10MB');
    }
  }

  private async findDuplicateTickets(userId: string, subject: string): Promise<SupportTicket[]> {
    if (!userId) return [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userTickets = await this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.user_id = :userId', { userId })
      .andWhere('ticket.created_at > :sevenDaysAgo', { sevenDaysAgo })
      .getMany();

    // Simple Levenshtein distance check (basic duplicate detection)
    return userTickets.filter(ticket => {
      const distance = this.levenshteinDistance(ticket.subject.toLowerCase(), subject.toLowerCase());
      const similarity = 1 - distance / Math.max(ticket.subject.length, subject.length);
      return similarity > 0.7; // 70% similarity threshold
    });
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }
    return matrix[b.length][a.length];
  }

  private suggestPriority(category: string, description: string): string {
    const descLower = description.toLowerCase();

    // Urgent keywords
    if (
      category === 'Security Concern' ||
      descLower.includes('fraud') ||
      descLower.includes('unauthorized') ||
      descLower.includes('hacked')
    ) {
      return 'URGENT';
    }

    // High priority for large amounts
    if (descLower.match(/₦?\s*[5-9]\d{5,}/) || descLower.includes('500') && descLower.includes('000')) {
      return 'HIGH';
    }

    // Low priority for feature requests
    if (category === 'Feature Request') {
      return 'LOW';
    }

    // Default to MEDIUM
    return 'MEDIUM';
  }

  private async handleAttachments(
    ticketId: string,
    messageId: string,
    files: Express.Multer.File[],
  ): Promise<void> {
    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(`File type ${file.mimetype} not allowed`);
      }

      // Virus scan
      const scanResult = await this.virusScanService.scanFile(file.buffer);
      if (scanResult.status === 'INFECTED') {
        throw new BadRequestException(`File ${file.originalname} contains malware`);
      }

      // Upload to S3
      const s3Key = `support-attachments/${ticketId}/${messageId}/${file.originalname}`;
      const s3Url = await this.uploadToS3(s3Key, file.buffer, file.mimetype);

      // Save attachment record
      const attachment = this.attachmentRepo.create({
        ticket_id: ticketId,
        message_id: messageId,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        s3_key: s3Key,
        s3_url: s3Url,
        virus_scan_status: 'CLEAN',
      });
      await this.attachmentRepo.save(attachment);
    }
  }

  private async uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<string> {
    // Implementation using AWS SDK v3
    // Return presigned URL or public URL
    // Placeholder:
    return `https://s3.amazonaws.com/ubiquitous-tribble-support/${key}`;
  }

  private async autoAssignTicket(ticket: SupportTicket): Promise<void> {
    // Determine team based on category
    const teamMap = {
      'Account Issues': 'account_team',
      'Transaction Failed': 'transaction_team',
      'Card Problems': 'card_team',
      'KYC Verification': 'kyc_team',
    };
    const team = teamMap[ticket.category] || 'general_support';

    // Find available agents in team (round-robin)
    // Placeholder: In real implementation, query agents table
    const assignedAgentId = await this.getNextAvailableAgent(team);

    if (assignedAgentId) {
      ticket.assigned_agent_id = assignedAgentId;
      ticket.assigned_team = team;
      ticket.status = 'OPEN';
      await this.ticketRepo.save(ticket);

      await this.logActivity(ticket.id, null, 'ASSIGNED', null, assignedAgentId, `Auto-assigned to agent ${assignedAgentId}`);

      // Notify agent
      await this.notificationService.sendInAppNotification(assignedAgentId, {
        title: 'New Ticket Assigned',
        body: `Ticket ${ticket.ticket_id}: ${ticket.subject}`,
        link: `/support/tickets/${ticket.id}`,
      });
    }
  }

  private async getNextAvailableAgent(team: string): Promise<string | null> {
    // Placeholder: Round-robin assignment logic
    // Query agents in team with status 'AVAILABLE', sort by ticket count (ascending)
    return 'agent-uuid-placeholder';
  }

  private async sendTicketCreatedNotifications(ticket: SupportTicket, dto: CreateTicketDto): Promise<void> {
    const customerEmail = dto.guestEmail || (dto.userId ? await this.getUserEmail(dto.userId) : null);
    const customerName = dto.guestName || (dto.userId ? await this.getUserName(dto.userId) : 'Customer');

    if (customerEmail) {
      // Send email confirmation
      await this.emailService.send({
        to: customerEmail,
        subject: `[Ticket ${ticket.ticket_id}] We've received your request`,
        template: 'ticket_created',
        context: {
          customerName,
          ticketId: ticket.ticket_id,
          subject: ticket.subject,
          priority: ticket.priority,
          slaTime: this.formatSLATime(ticket.sla_deadline),
          trackingLink: `https://support.ubiquitous-tribble.com/tickets/${ticket.ticket_id}`,
        },
      });
    }

    // Send in-app notification if user logged in
    if (dto.userId) {
      await this.notificationService.sendInAppNotification(dto.userId, {
        title: 'Support Ticket Created',
        body: `Your ticket ${ticket.ticket_id} has been created. We'll respond within ${this.formatSLATime(ticket.sla_deadline)}.`,
        link: `/support/tickets/${ticket.id}`,
      });
    }
  }

  private async getUserEmail(userId: string): Promise<string> {
    // Query user service
    return 'user@example.com';
  }

  private async getUserName(userId: string): Promise<string> {
    return 'User Name';
  }

  private formatSLATime(deadline: Date): string {
    const hours = Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
    return hours < 24 ? `${hours} hours` : `${Math.floor(hours / 24)} days`;
  }

  private async logActivity(
    ticketId: string,
    actorId: string | null,
    action: string,
    oldValue: string | null,
    newValue: string | null,
    notes: string,
  ): Promise<void> {
    // Insert into ticket_activity_log table
    // Placeholder implementation
  }
}
```

### SLA Calculation Utility

```typescript
export function calculateSLADeadline(priority: string): Date {
  const now = new Date();
  let hoursToAdd: number;

  switch (priority) {
    case 'URGENT':
      hoursToAdd = 2;
      break;
    case 'HIGH':
      hoursToAdd = 8;
      break;
    case 'MEDIUM':
      hoursToAdd = 24;
      break;
    case 'LOW':
      hoursToAdd = 48;
      break;
    default:
      hoursToAdd = 24;
  }

  // Calculate deadline considering business hours (Mon-Fri 8AM-6PM WAT)
  // Simplified version: just add hours (real implementation would skip weekends/holidays)
  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
}

export function generateTicketId(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
  const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `TKT-${dateStr}-${randomNum}`;
}
```

---

## Testing Strategy

### Unit Tests (80 tests total)
- Ticket creation validation (10 tests)
- Priority suggestion algorithm (8 tests)
- SLA deadline calculation (10 tests)
- Duplicate detection (Levenshtein distance) (6 tests)
- Ticket ID generation (4 tests)
- Email parsing and sanitization (10 tests)
- Response template variable replacement (8 tests)
- KB article search ranking (12 tests)
- Analytics data aggregation (12 tests)

### Integration Tests (42 tests total)
- Create ticket via API (in-app, email, web) (9 tests)
- Attach files to ticket, virus scan (6 tests)
- Assign ticket to agent, auto-routing (6 tests)
- Agent sends response, customer receives notification (6 tests)
- Escalate ticket, change priority, SLA recalculation (6 tests)
- Create KB article, publish, search (6 tests)
- Submit CSAT rating, analytics update (3 tests)

### E2E Tests (24 tests total)
- Customer creates ticket in-app, receives email confirmation (3 tests)
- Email to support@ converts to ticket, customer gets auto-reply (3 tests)
- Guest submits ticket on web portal, tracks status (3 tests)
- Agent views ticket, sends response, customer replies (4 tests)
- Agent escalates ticket, manager receives notification (2 tests)
- Customer searches KB, views article, provides feedback (3 tests)
- Manager views analytics dashboard, exports report (3 tests)
- Ticket SLA breaches, alerts triggered (3 tests)

### Performance Tests
- Handle 1000 tickets/hour creation rate
- Process 10K ticket list with pagination < 2s
- Search KB with 10K articles < 500ms
- Dashboard loads with 100K tickets < 3s
- Concurrent agent responses (50 agents) < 1s

### Security Tests
- XSS prevention in ticket description/responses
- SQL injection protection in search queries
- File upload validation (type, size, virus scan)
- RBAC: customers can't access other customers' tickets
- RBAC: agents can only access assigned tickets

---

## Risk Register

| Risk ID | Description | Impact | Probability | Mitigation |
|---------|-------------|--------|-------------|------------|
| R31.1 | Email server downtime causes tickets lost | High | Low | Queue emails in Redis, retry with exponential backoff (max 3 attempts) |
| R31.2 | Virus scan service slow (>5s) delays ticket creation | Medium | Medium | Async virus scanning, allow ticket creation, scan in background, notify if infected |
| R31.3 | SLA calculation incorrect due to timezone issues | High | Low | Use UTC for all timestamps, convert to WAT for display only, extensive timezone unit tests |
| R31.4 | Agent workload imbalance (some agents overloaded) | Medium | Medium | Monitor agent queue size, rebalance tickets weekly, alert manager if imbalance >30% |
| R31.5 | KB articles outdated, customers get wrong info | Medium | Medium | Quarterly content audit, flag articles not updated in 6 months, auto-notification to authors |
| R31.6 | Search returns irrelevant results (poor ranking) | Medium | Medium | A/B test search algorithms, collect click-through rate data, retrain ML models monthly |
| R31.7 | Analytics queries slow (>10s) due to large dataset | Medium | High | Use materialized views refreshed nightly, implement query caching, database indexing optimization |
| R31.8 | CSAT survey response rate low (<20%) | Low | High | Incentivize surveys (e.g., "Enter raffle for ₦10K"), A/B test survey timing (immediate vs. 1 day later) |
| R31.9 | Duplicate tickets not detected (different wording) | Low | Medium | Improve Levenshtein distance threshold tuning, implement ML-based semantic similarity (future) |
| R31.10 | Ticket creation spam/abuse (bot attacks) | Medium | Low | Implement reCAPTCHA v3, rate limiting (10 tickets/user/day), IP blocking for flagged IPs |

---

## Dependencies

### Internal Dependencies
- **User Authentication System (Sprint 4):** Required to identify user creating ticket, link to user profile
- **Email Service Infrastructure (Sprint 8):** Required for email-to-ticket conversion, notifications
- **Push Notification System (Sprint 9):** Required for real-time in-app notifications
- **RBAC System (Sprint 7):** Required for agent/manager access control
- **Transaction System (Sprint 1-3):** Required to link tickets to failed transactions, enable refunds

### External Dependencies
- **AWS S3:** File attachment storage (images, documents)
- **ClamAV:** Open-source virus scanning for attachments
- **Elasticsearch or PostgreSQL Full-Text Search:** KB article search
- **Gmail API or IMAP/POP3:** Email polling for support@ubiquitous-tribble.com
- **Google Cloud Translation API:** Multi-language support for KB articles
- **Chart.js or Recharts:** Frontend charting library for analytics dashboard
- **Redis:** Caching for dashboard data, email retry queue

---

## Definition of Done

- [ ] All 4 user stories implemented with acceptance criteria met
- [ ] Database schema created with indexes for performance
- [ ] API endpoints implemented and documented (Swagger/OpenAPI)
- [ ] Frontend components: Ticket creation forms (in-app, web), agent dashboard, KB portal, analytics dashboard
- [ ] Email templates created: Ticket created, Agent response, Ticket resolved, CSAT survey
- [ ] Response templates library (minimum 20 templates)
- [ ] Knowledge base seeded with 50 initial articles (Getting Started, FAQs)
- [ ] 146 tests passed (80 unit, 42 integration, 24 E2E)
- [ ] Security audit: XSS, SQL injection, file upload validation
- [ ] Performance benchmarks met: Ticket creation <500ms, Dashboard load <3s, Search <500ms
- [ ] Monitoring and alerts configured: SLA breach alerts, dashboard load time alerts
- [ ] Documentation: API docs, agent user guide, KB content guide, admin guide
- [ ] Code review completed by tech lead
- [ ] Deployed to staging environment and QA tested
- [ ] Load testing: 1000 tickets/hour, 50 concurrent agents
- [ ] Accessibility audit: WCAG 2.1 AA compliance verified
- [ ] Manager sign-off on analytics dashboard features
- [ ] Customer beta testing (10 users) with feedback incorporated

---

## Sprint Metrics

**Planned Capacity:** 80 hours (8 hours/day × 10 days)
**Story Points:** 35 SP
**Estimated Development Cost:** $7,000 (1 developer × 2 weeks × $3,500/week)
**Expected Business Impact:**
- **Ticket Deflection Rate:** 30% (via KB self-service)
- **Cost Savings:** ₦2M/month (reduced agent hiring needs)
- **CSAT Improvement:** 3.2 → 4.5/5.0 (40% increase)
- **Operational Efficiency:** 40% increase in agent productivity

---

## Sprint Backlog Priority

1. **US-31.1.1** (10 SP) - Ticket creation and multi-channel intake (P0, foundational)
2. **US-31.1.2** (9 SP) - Agent ticket management and response (P0, core workflow)
3. **US-31.2.1** (8 SP) - Knowledge base and self-service (P1, ticket deflection)
4. **US-31.3.1** (8 SP) - Support analytics and reporting (P1, manager visibility)

**Sprint Timeline:**
- **Days 1-4:** US-31.1.1 (Ticket Creation)
- **Days 5-8:** US-31.1.2 (Agent Management)
- **Days 9-11:** US-31.2.1 (Knowledge Base)
- **Days 12-14:** US-31.3.1 (Analytics)
- **Day 15:** Testing, bug fixes, documentation

---

## Notes

- **Compliance:** All customer data encrypted (TLS 1.3 in transit, AES-256 at rest), NDPR compliant
- **Scalability:** Architecture supports 10K+ tickets/month, horizontal scaling via load balancer
- **Future Enhancements:**
  - Live chat integration (Sprint 32)
  - AI-powered ticket categorization (ML model, Sprint 33)
  - Chatbot for common queries (Sprint 34)
  - WhatsApp support channel (Sprint 35)
- **Regulatory Requirements:** 7-year audit log retention for CBN compliance
- **Multi-tenancy:** System designed for single-tenant (Ubiquitous Tribble only), can be extended to multi-tenant for white-label offering (future)
