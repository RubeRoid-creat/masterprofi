# Technical Specification for Cursor AI

## CRM System "MasterProfi" for Service Management

## 1. PROJECT OVERVIEW

### 1.1. System Architecture

```typescript
interface CRMConfig {
  system: "MasterProfi CRM",
  type: "Multi-tenant SaaS",
  users: ["admin", "manager", "support", "master"],
  coreModules: [
    "customer_management",
    "order_workflow", 
    "service_analytics",
    "mlm_administration",
    "financial_control"
  ]
}
```

### 1.2. Technical Stack

```typescript
const TechStack = {
  frontend: "React 18 + TypeScript + Material-UI",
  backend: "NestJS + PostgreSQL",
  realtime: "Socket.io",
  storage: "AWS S3",
  caching: "Redis",
  search: "Elasticsearch",
  auth: "JWT + RBAC"
}
```

## 2. MODULE SPECIFICATION

### 2.1. DASHBOARD MODULE

#### Component: Main Dashboard

```typescript
// Cursor prompt for admin dashboard
"Create comprehensive admin dashboard with:
- Key metrics cards (orders today, revenue, active masters, customer satisfaction)
- Real-time order status distribution chart
- Revenue trends graph (daily, weekly, monthly)
- Top performing masters leaderboard
- Geographic service coverage map
- Recent activity feed
- System health monitoring
- Quick action buttons

Data Visualization:
- Use Chart.js for graphs
- React Leaflet for maps
- Material-UI grid system
- Responsive design for all screen sizes
- Dark/light theme support

API Integration:
- RTK Query for data fetching
- WebSocket for real-time updates
- Cached data with stale-while-revalidate"
```

### 2.2. CUSTOMER MANAGEMENT MODULE

#### Component: Customer Database

```typescript
// Cursor prompt for customer management
"Build customer management interface with:
- Advanced data table with sorting, filtering, pagination
- Customer profile view (personal info, appliance history, communication log)
- Quick actions (send notification, create order, add note)
- Customer segmentation (by location, appliance type, value)
- Bulk operations (import/export, mass messaging)
- Duplicate detection and merging
- Customer lifetime value calculation

Features:
- React Table v8 for data grid
- Full-text search with Elasticsearch
- CSV import/export functionality
- Audit trail for all changes
- Privacy compliance (GDPR/152-FZ)"
```

#### Component: Customer Profile

```typescript
// Cursor prompt for customer profile
"Create detailed customer profile page with tabs:
- Overview: summary and quick stats
- Order History: complete service history with ratings
- Appliances: registered devices with service records
- Communications: email, SMS, call history
- Notes: internal notes and follow-ups
- Documents: contracts, warranties, invoices
- Preferences: communication preferences, service reminders

Integration:
- SendGrid for email integration
- Twilio for SMS/call logging
- Document upload with preview
- Timeline view for customer journey"
```

### 2.3. ORDER MANAGEMENT MODULE

#### Component: Order Workflow

```typescript
// Cursor prompt for order management
"Build Kanban-style order board with:
- Drag-and-drop status columns (New, Assigned, In Progress, Completed, Cancelled)
- Order cards showing: customer, appliance, urgency, assigned master
- Quick assignment to available masters
- Priority management and SLA tracking
- Bulk status updates
- Automated status transitions
- Escalation rules for delayed orders

Technical:
- React DnD for drag-and-drop
- Real-time updates via Socket.io
- Conflict resolution for concurrent edits
- Offline capability with sync"
```

#### Component: Order Details

```typescript
// Cursor prompt for order details
"Create comprehensive order details page with:
- Order header (status, timeline, priority badge)
- Customer information with quick contact
- Appliance details and problem description
- Assigned master with performance stats
- Cost breakdown (parts, labor, travel)
- Chat history between master and customer
- Photo gallery of issues and repairs
- Digital signatures and documents
- Audit log of all changes

Features:
- Cost calculator with parts database
- Photo viewer with annotations
- PDF generation for invoices and reports
- Email integration for customer updates"
```

### 2.4. MASTER MANAGEMENT MODULE

#### Component: Masters Directory

```typescript
// Cursor prompt for masters management
"Build masters management system with:
- Master profiles with verification status
- Skills and certifications management
- Performance metrics (completion rate, rating, response time)
- Availability scheduling and calendar
- Service area configuration on map
- Commission structure and payout settings
- Document management (certificates, insurance)
- Training and onboarding progress

Advanced Features:
- AI-based master matching for orders
- Performance analytics and insights
- Capacity planning and workload balancing
- Quality assurance scoring"
```

#### Component: MLM Network Administration

```typescript
// Cursor prompt for MLM admin
"Create MLM network administration panel with:
- Hierarchical tree visualization of entire network
- Team performance analytics by level
- Commission calculation and audit
- Recruitment funnel analysis
- Bonus program management
- Payout scheduling and tracking
- Compliance monitoring
- Network growth forecasting

Visualization:
- D3.js for interactive tree diagrams
- Charts for commission distribution
- Geographic network density maps
- Time-series growth analysis"
```

### 2.5. FINANCIAL MODULE

#### Component: Financial Dashboard

```typescript
// Cursor prompt for financial management
"Build financial control center with:
- Revenue analytics (daily, weekly, monthly trends)
- Expense tracking and categorization
- Profit margin analysis by service type
- Accounts receivable aging report
- Tax calculation and reporting
- Payout management to masters
- Financial forecasting
- Audit trail for all transactions

Integration:
- YooKassa payment processing
- Bank statement import
- Automated invoice generation
- Tax form preparation"
```

#### Component: Commission Calculator

```typescript
// Cursor prompt for commission system
"Create advanced commission calculation engine with:
- Multi-level commission rules (3%, 2%, 1%)
- Bonus tiers and performance incentives
- Holdback and reserve calculations
- Tax withholding automation
- Dispute resolution handling
- Payout scheduling with approval workflow
- Commission statement generation
- Historical commission analysis"
```

### 2.6. SERVICE ANALYTICS MODULE

#### Component: Analytics Dashboard

```typescript
// Cursor prompt for analytics
"Build comprehensive analytics platform with:
- Custom report builder with drag-and-drop
- Pre-built templates (sales, service, financial, operational)
- Data visualization library (charts, graphs, heatmaps)
- KPI tracking and alerting
- Predictive analytics for demand forecasting
- Customer behavior analysis
- Master performance benchmarking
- Service quality metrics

Technology:
- Apache ECharts for visualizations
- Custom SQL query builder
- Scheduled report generation
- Export to PDF/Excel/CSV"
```

## 3. TECHNICAL COMPONENTS

### 3.1. DATA TABLE COMPONENT

```typescript
// Cursor prompt for reusable data table
"Create advanced React data table component with:
- Server-side pagination, sorting, filtering
- Column customization (show/hide, reorder, resize)
- Bulk actions with selection
- Export functionality (CSV, Excel, PDF)
- Inline editing with validation
- Row grouping and aggregation
- Virtual scrolling for large datasets
- Accessibility (keyboard navigation, screen readers)

Props Interface:
- data: any[]
- columns: ColumnDef[]
- pagination: PaginationState
- sorting: SortingState
- onRowClick: (row: any) => void
- rowActions?: Action[]"
```

### 3.2. FORM BUILDER COMPONENT

```typescript
// Cursor prompt for dynamic forms
"Build JSON-schema form builder with:
- Field types (text, number, date, select, file, etc.)
- Conditional logic and validation
- Multi-step form wizard
- File upload with progress
- Auto-save and draft functionality
- Integration with form libraries (React Hook Form)
- Custom field components
- Form analytics and abandonment tracking"
```

### 3.3. NOTIFICATION SYSTEM

```typescript
// Cursor prompt for notifications
"Create real-time notification system with:
- In-app notification center
- Email/SMS/Push notification templates
- Notification preferences per user
- Scheduled notifications
- Notification analytics (open rates, CTR)
- Bulk notification sending
- A/B testing for notification content
- Do-not-disturb scheduling"
```

## 4. API DESIGN

### 4.1. REST API Structure

```typescript
// Cursor prompt for API services
"Implement NestJS REST API with:

Customer Endpoints:
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/{id}
PUT    /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
POST   /api/v1/customers/{id}/orders
GET    /api/v1/customers/{id}/history

Order Endpoints:
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/{id}
PUT    /api/v1/orders/{id}/status
POST   /api/v1/orders/{id}/assign
GET    /api/v1/orders/{id}/chat

Master Endpoints:
GET    /api/v1/masters
POST   /api/v1/masters
GET    /api/v1/masters/{id}/performance
PUT    /api/v1/masters/{id}/availability

Financial Endpoints:
GET    /api/v1/finance/overview
GET    /api/v1/finance/commissions
POST   /api/v1/finance/payouts
GET    /api/v1/finance/reports

Features:
- Role-based access control
- Request validation with class-validator
- Response transformation
- Rate limiting
- Comprehensive logging"
```

### 4.2. Real-time Events

```typescript
// Cursor prompt for WebSocket events
"Implement Socket.io real-time events:

Order Events:
- order:created
- order:status_changed
- order:assigned
- order:completed

Chat Events:
- chat:message_sent
- chat:typing_started
- chat:typing_stopped

Notification Events:
- notification:new
- notification:read

System Events:
- system:alert
- system:maintenance

Features:
- Room-based subscriptions
- Event acknowledgment
- Connection state management
- Reconnection handling"
```

## 5. DATABASE SCHEMA

### 5.1. Core Tables Design

```sql
-- Cursor prompt for database schema
"Design PostgreSQL schema for CRM:

Users & Authentication:
- users (id, email, phone, role, created_at)
- user_profiles (user_id, first_name, last_name, avatar)
- user_sessions (user_id, token, expires_at, device_info)

Customers:
- customers (id, user_id, company_name, tax_id, created_at)
- customer_contacts (id, customer_id, type, value, is_primary)
- customer_addresses (id, customer_id, type, address, coordinates)

Orders:
- orders (id, customer_id, master_id, status, priority, created_at)
- order_items (id, order_id, appliance_type, problem_description)
- order_status_history (id, order_id, status, changed_by, timestamp)
- order_payments (id, order_id, amount, method, status)

Masters & MLM:
- masters (id, user_id, rank, commission_rate, is_active)
- master_skills (master_id, skill_id, certification_level)
- mlm_network (user_id, sponsor_id, level, created_at)
- commissions (id, master_id, order_id, amount, level, status)

Financial:
- transactions (id, type, amount, currency, status, created_at)
- payout_requests (id, master_id, amount, status, processed_at)
- invoices (id, order_id, number, amount, due_date, status)

Include:
- Proper indexes for performance
- Foreign key constraints
- Soft delete pattern
- Audit triggers
- Partitioning for large tables"
```

## 6. SECURITY & COMPLIANCE

### 6.1. Authentication & Authorization

```typescript
// Cursor prompt for security
"Implement comprehensive security:

Authentication:
- JWT with refresh tokens
- Two-factor authentication
- Session management
- Password policy enforcement

Authorization:
- Role-based access control (RBAC)
- Permission granularity
- Resource-level permissions
- Audit logging

Data Protection:
- Encryption at rest for sensitive data
- SSL/TLS for all communications
- API rate limiting
- SQL injection prevention
- XSS and CSRF protection

Compliance:
- GDPR/152-FZ data handling
- Privacy policy integration
- Data retention policies
- Right to be forgotten implementation"
```

## 7. INTEGRATION PATTERNS

### 7.1. Third-party Integrations

```typescript
// Cursor prompt for integrations
"Implement integration services:

Payment Gateway:
- YooKassa for payment processing
- Webhook handling for payment status
- Refund and dispute management
- Reconciliation automation

Communication:
- SendGrid for email delivery
- Twilio for SMS/voice
- Telegram Bot API for notifications
- WhatsApp Business API

Maps & Location:
- Yandex Maps for geocoding
- Distance matrix for travel time
- Service area validation
- Route optimization

Analytics:
- Google Analytics 4
- Yandex.Metrika
- Custom event tracking
- Funnel analysis"
```

## 8. PERFORMANCE OPTIMIZATION

### 8.1. Frontend Optimization

```typescript
// Cursor prompt for performance
"Optimize frontend performance:

Code Splitting:
- Route-based code splitting with React.lazy
- Component-level lazy loading
- Prefetching for likely navigation

Caching:
- React Query for server state
- Local storage for user preferences
- CDN for static assets

Rendering:
- Virtual scrolling for large lists
- Memoization of expensive components
- Debounced search inputs
- Optimized re-renders

Assets:
- Image compression and lazy loading
- Font optimization
- Bundle analysis and tree shaking"
```

### 8.2. Backend Optimization

```typescript
// Cursor prompt for backend performance
"Optimize backend performance:

Database:
- Query optimization with EXPLAIN
- Appropriate indexing strategy
- Connection pooling
- Read replicas for reporting

Caching:
- Redis for frequent queries
- Database query result caching
- CDN for static content

API:
- Request batching
- Response compression
- Pagination for large datasets
- Background job processing"
```

## 9. TESTING STRATEGY

### 9.1. Test Implementation

```typescript
// Cursor prompt for testing
"Implement comprehensive testing:

Unit Tests:
- Jest for utility functions
- React Testing Library for components
- Test coverage reporting

Integration Tests:
- API endpoint testing with Supertest
- Database integration tests
- Third-party service mocking

E2E Tests:
- Cypress for critical user flows
- Cross-browser testing
- Mobile responsiveness testing

Performance Tests:
- Lighthouse CI for frontend
- Load testing for APIs
- Memory leak detection"
```

## 10. DEPLOYMENT & DevOps

### 10.1. Infrastructure as Code

```typescript
// Cursor prompt for deployment
"Set up deployment infrastructure:

Docker Configuration:
- Multi-stage Dockerfile for frontend/backend
- Docker Compose for local development
- Health checks and graceful shutdown

CI/CD Pipeline:
- GitHub Actions for automated testing
- Automated deployments to staging/production
- Database migration automation
- Rollback procedures

Monitoring:
- Application performance monitoring
- Error tracking with Sentry
- Uptime monitoring
- Log aggregation and analysis

Backup & Recovery:
- Automated database backups
- Point-in-time recovery
- Disaster recovery procedures"
```

---

This TS provides Cursor AI with detailed specifications for building a comprehensive CRM system for the "MasterProfi" service platform, covering all aspects from user management to financial controls and analytics.





