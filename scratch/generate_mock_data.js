const fs = require('fs');
const path = require('path');

const firstNames = [
  'Arun', 'Priya', 'Rajan', 'Suresh', 'Ananya', 'Deepak', 'Rajesh', 'Sunita', 'Vivek', 'Lakshmi',
  'Manoj', 'Divya', 'Karthik', 'Meera', 'Amit', 'Neha', 'Rahul', 'Shalini', 'Gautam', 'Vikram',
  'Harish', 'Pooja', 'Sandeep', 'Ritu', 'Vijay', 'Sneha', 'Nikhil', 'Anjali', 'Mahesh', 'Kavita',
  'Siddharth', 'Bhavna', 'Rohan', 'Swati', 'Alok', 'Monica', 'Varun', 'Preeti', 'Abhishek', 'Shruti',
  'Tarun', 'Archana', 'Kiran', 'Nisha', 'Aravind', 'Geetha', 'Prashanth', 'Sridevi', 'Jayesh', 'Radhika',
  'Praveen', 'Asha', 'Girish', 'Vandana', 'Venkatesh', 'Deepika', 'Manish', 'Reshma', 'Nitin', 'Reena',
  'Satish', 'Smita', 'Dinesh', 'Anitha', 'Ashok', 'Sangeetha', 'Biju', 'Bindu', 'Vinod', 'Sujatha',
  'Sudhir', 'Chitra', 'Ramesh', 'Leela', 'Unnikrishnan', 'Jayanthi', 'Subhash', 'Mini', 'Sanosh', 'Latha'
];

const lastNames = [
  'Kumar', 'Nair', 'Menon', 'Prabhu', 'Sharma', 'Verma', 'Iyer', 'Pillai', 'Swaminathan', 'Nambiar',
  'Panicker', 'Kurup', 'Sundaram', 'Joshi', 'Chakraborty', 'Gupta', 'Bhattacharya', 'Varma', 'Deshmukh', 'Bhat',
  'Kulkarni', 'Saxena', 'Raghavan', 'Hegde', 'Chawla', 'Roy', 'Naik', 'Shenoy', 'Pandey', 'Mishra',
  'Reddy', 'Rao', 'Chaudhary', 'Singhal', 'Kapur', 'Aggarwal', 'Dutta', 'Banerjee', 'Ghosh', 'Sen'
];

const departments = [
  'Operations', 'Maintenance', 'Finance', 'HR', 'Legal', 'Procurement', 'Safety', 'Engineering', 'IT', 'Water Metro'
];

const roles = ['employee', 'manager', 'admin'];
const statuses = ['approved', 'pending', 'draft', 'rejected'];
const priorities = ['low', 'medium', 'high', 'critical'];

// Generate 80 Employees with unique contract assigned
const employees = [];
const contracts = [];

for (let i = 1; i <= 80; i++) {
  const fn = firstNames[(i - 1) % firstNames.length];
  const ln = lastNames[(i - 1) % lastNames.length];
  const fullName = `${fn} ${ln}`;
  const dept = departments[(i - 1) % departments.length];
  const role = i === 1 ? 'admin' : (i <= 10 ? 'manager' : 'employee');
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 40 ? i : ''}@kmrl.in`;
  const contractId = `CNT-2024-${String(i).padStart(3, '0')}`;
  const contractName = `${dept.toUpperCase()} SERVICE & PROCUREMENT SLA #${i}`;
  const contractStatus = i % 5 === 0 ? 'expiring_soon' : (i % 7 === 0 ? 'pending_approval' : (i % 9 === 0 ? 'under_renewal' : 'active'));

  employees.push({
    id: `emp-${String(i).padStart(3, '0')}`,
    fullName,
    email,
    role,
    department: dept,
    assignedContractId: contractId,
    assignedContractName: contractName,
    assignedContractStatus: contractStatus,
    avatarInitials: `${fn[0]}${ln[0]}`,
    badge: role === 'admin' ? 'badge-muted-red font-bloom-red' : (role === 'manager' ? 'badge-muted-amber font-bloom-amber' : 'badge-muted-green font-bloom-green')
  });

  const valueAmount = (Math.floor(Math.random() * 85) + 15) * 100000;
  const isExp = contractStatus === 'expiring_soon';

  contracts.push({
    id: contractId,
    contractNumber: `KMRL/SLA/2024/${String(100 + i)}`,
    title: contractName,
    vendor: `Vendor Partner ${String.fromCharCode(65 + (i % 26))} Ltd`,
    department: dept,
    assignedEmployeeName: fullName,
    assignedEmployeeEmail: email,
    valueAmount,
    startDate: '2023-09-01',
    expiryDate: isExp ? '2024-08-30' : '2025-06-30',
    status: contractStatus,
    renewalNoticeDays: 60,
    isExpiring: isExp
  });
}

// Generate 200 Documents (including 20 duplicates)
const categories = ['Safety', 'Operations', 'Finance', 'HR', 'Maintenance', 'Legal', 'Procurement', 'Engineering', 'Water Metro', 'IT'];
const documents = [];

for (let i = 1; i <= 200; i++) {
  const isDup = i > 180; // 20 duplicates (docs 181 to 200)
  const origIndex = isDup ? (i - 180) : i;
  const cat = categories[(i - 1) % categories.length];
  const emp = employees[(i - 1) % employees.length];

  const docId = `doc-${String(i).padStart(3, '0')}`;
  const origId = `doc-${String(origIndex).padStart(3, '0')}`;

  const titleBase = [
    'Safety Audit & Track Inspection Report',
    'Rolling Stock Preventive Maintenance Protocol',
    'Q1 Quarterly Financial Audit & Revenue Breakdown',
    'HR Employee Benefit Policy & Night Shift Allowance',
    'Water Metro Phase 2 Electric Boat SLA',
    'Automatic Fare Collection (AFC) QR Upgrade Tender',
    'Overhead Equipment (OHE) Traction Maintenance Schedule',
    'Muttom Depot Solar PV Rooftop Installation Bid',
    'Station Housekeeping & Sanitation Operations SLA',
    'IT Network & Cybersecurity Vulnerability Audit'
  ][(i - 1) % 10];

  const title = isDup ? `${titleBase} (DUPLICATE REVISION #${i - 180})` : `${titleBase} #${i}`;
  const status = statuses[(i - 1) % statuses.length];
  const priority = priorities[(i - 1) % priorities.length];

  const textBody = `KOCHI METRO RAIL LIMITED (KMRL)
CORPORATE OFFICE: METRO BHAVAN, ERNAKULAM, KOCHI - 682017
${cat.toUpperCase()} DIRECTORATE · DOCUMENT REF: KMRL/${cat.toUpperCase()}/2024/${String(i).padStart(3, '0')}

1. EXECUTIVE SUMMARY & BACKGROUND
This official document details the ${cat.toLowerCase()} protocols, compliance checks, and operational telemetry for Kochi Metro Rail Limited. Assigned officer: ${emp.fullName} (${emp.department} Department, Email: ${emp.email}). Contract Reference: ${emp.assignedContractId}.

2. TECHNICAL SPECIFICATIONS & OPERATIONAL AUDIT
- Infrastructure Monitoring: All relevant track infrastructure, station equipment, and rolling stock rakes were subjected to rigorous diagnostic evaluation.
- Compliance Verification: Operating parameters met 100% compliance standards specified by RDSO, Ministry of Housing and Urban Affairs (MoHUA), and KMRL Executive Board directives.
- Performance Metrics: Overall equipment effectiveness (OEE) recorded at 98.4%, with sensor latency under 2.1 milliseconds.

3. FINANCIAL & CONTRACTUAL IMPLICATIONS
- Budget Allocation: Projected annual outlay for this operational activity is estimated at ₹ ${(Math.floor(Math.random() * 50) + 10) * 100000}.
- Vendor Responsibilities: Service Level Agreements (SLAs) mandate a maximum 60-minute emergency response window with liquidated damages of ₹ 50,000 per violation.

4. ACTIONABLE DIRECTIVES & APPROVAL STATUS
- Directive 1: Execute scheduled maintenance window during non-revenue hours (01:00 AM - 04:00 AM).
- Directive 2: Submit bi-weekly compliance telemetry logs to ${emp.department} Directorate.

RECORD AUTHORIZED BY: ${emp.fullName.toUpperCase()} (KMRL INTELLIDOCS)
STATUS: ${status.toUpperCase()} · PRIORITY: ${priority.toUpperCase()}`;

  documents.push({
    id: docId,
    title,
    category: cat,
    status,
    priority,
    uploadedBy: emp.fullName,
    department: emp.department,
    createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
    fileSize: Math.floor(Math.random() * 3000000) + 500000,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: `Official ${cat} document for KMRL operations. Assigned to ${emp.fullName}.`,
    extractedText: textBody,
    tags: [cat.toLowerCase(), emp.department.toLowerCase(), 'kmrl', '2024'],
    isDuplicate: isDup,
    duplicateOfId: isDup ? origId : undefined,
    duplicateOfTitle: isDup ? `${titleBase} #${origIndex} (ORIGINAL)` : undefined,
    similarityScore: isDup ? Number((90 + Math.random() * 9.5).toFixed(1)) : undefined,
    assignedToUser: emp.fullName,
    assignedContractId: emp.assignedContractId
  });
}

// Generate 25 Approvals
const approvals = [];
for (let i = 1; i <= 25; i++) {
  const doc = documents[i * 4];
  const emp = employees[i % employees.length];

  approvals.push({
    id: `app-${String(i).padStart(3, '0')}`,
    documentId: doc.id,
    documentTitle: doc.title,
    category: doc.category,
    requestedBy: doc.uploadedBy,
    department: doc.department,
    approver: emp.fullName,
    status: i % 3 === 0 ? 'pending' : (i % 4 === 0 ? 'rejected' : 'approved'),
    dateRequested: new Date(Date.now() - (i * 43200000)).toISOString(),
    priority: doc.priority
  });
}

// Generate 20 Notifications
const notifications = [];
for (let i = 1; i <= 20; i++) {
  const types = ['info', 'warning', 'success', 'alert'];
  const t = types[i % 4];

  notifications.push({
    id: `notif-${String(i).padStart(3, '0')}`,
    title: i % 2 === 0 ? `OCR Extraction Completed #${i}` : `Contract Renewal Notice #${i}`,
    message: i % 2 === 0 ? `EasyOCR processed document doc-${String(i).padStart(3, '0')} with 98.4% accuracy.` : `Contract SLA #${i} requires executive review within 30 days.`,
    type: t,
    createdAt: new Date(Date.now() - (i * 3600000 * 2)).toISOString(),
    read: i > 5,
    link: `/documents/doc-${String(i).padStart(3, '0')}`
  });
}

const mockDataContent = `// Realistic KMRL IntelliDocs mock data - 80 Employees, 200 Documents, 80 Contracts, 25 Approvals, 20 Notifications

export interface MockDocument {
  id: string;
  title: string;
  category: string;
  status: 'approved' | 'pending' | 'draft' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  uploadedBy: string;
  department: string;
  createdAt: string;
  fileSize: number;
  mimeType: string;
  ocrStatus: string;
  description?: string;
  extractedText?: string;
  tags?: string[];
  isDuplicate?: boolean;
  duplicateOfId?: string;
  duplicateOfTitle?: string;
  similarityScore?: number;
  assignedToUser?: string;
  assignedContractId?: string;
}

export interface MockEmployee {
  id: string;
  fullName: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  assignedContractId: string;
  assignedContractName: string;
  assignedContractStatus: string;
  avatarInitials: string;
  badge: string;
}

export interface MockContract {
  id: string;
  contractNumber: string;
  title: string;
  vendor: string;
  department: string;
  assignedEmployeeName: string;
  assignedEmployeeEmail: string;
  valueAmount: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'pending_approval' | 'expiring_soon' | 'under_renewal' | 'approved' | 'terminated';
  renewalNoticeDays: number;
  isExpiring: boolean;
}

export interface MockApproval {
  id: string;
  documentId: string;
  documentTitle: string;
  category: string;
  requestedBy: string;
  department: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  dateRequested: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  createdAt: string;
  read: boolean;
  link?: string;
}

export const MOCK_EMPLOYEES: MockEmployee[] = ${JSON.stringify(employees, null, 2)};
export const MOCK_CONTRACTS: MockContract[] = ${JSON.stringify(contracts, null, 2)};
export const MOCK_DOCUMENTS: MockDocument[] = ${JSON.stringify(documents, null, 2)};
export const MOCK_APPROVALS: MockApproval[] = ${JSON.stringify(approvals, null, 2)};
export const MOCK_NOTIFICATIONS: MockNotification[] = ${JSON.stringify(notifications, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../frontend/src/data/mockData.ts'), mockDataContent, 'utf8');
console.log('Successfully generated 80 Employees, 80 Contracts, 200 Documents, 25 Approvals, 20 Notifications!');
