import json, random, os

first_names = [
  'Arun', 'Priya', 'Rajan', 'Suresh', 'Ananya', 'Deepak', 'Rajesh', 'Sunita', 'Vivek', 'Lakshmi',
  'Manoj', 'Divya', 'Karthik', 'Meera', 'Amit', 'Neha', 'Rahul', 'Shalini', 'Gautam', 'Vikram',
  'Harish', 'Pooja', 'Sandeep', 'Ritu', 'Vijay', 'Sneha', 'Nikhil', 'Anjali', 'Mahesh', 'Kavita',
  'Siddharth', 'Bhavna', 'Rohan', 'Swati', 'Alok', 'Monica', 'Varun', 'Preeti', 'Abhishek', 'Shruti',
  'Tarun', 'Archana', 'Kiran', 'Nisha', 'Aravind', 'Geetha', 'Prashanth', 'Sridevi', 'Jayesh', 'Radhika',
  'Praveen', 'Asha', 'Girish', 'Vandana', 'Venkatesh', 'Deepika', 'Manish', 'Reshma', 'Nitin', 'Reena',
  'Satish', 'Smita', 'Dinesh', 'Anitha', 'Ashok', 'Sangeetha', 'Biju', 'Bindu', 'Vinod', 'Sujatha',
  'Sudhir', 'Chitra', 'Ramesh', 'Leela', 'Unnikrishnan', 'Jayanthi', 'Subhash', 'Mini', 'Sanosh', 'Latha'
]

last_names = [
  'Kumar', 'Nair', 'Menon', 'Prabhu', 'Sharma', 'Verma', 'Iyer', 'Pillai', 'Swaminathan', 'Nambiar',
  'Panicker', 'Kurup', 'Sundaram', 'Joshi', 'Chakraborty', 'Gupta', 'Bhattacharya', 'Varma', 'Deshmukh', 'Bhat',
  'Kulkarni', 'Saxena', 'Raghavan', 'Hegde', 'Chawla', 'Roy', 'Naik', 'Shenoy', 'Pandey', 'Mishra',
  'Reddy', 'Rao', 'Chaudhary', 'Singhal', 'Kapur', 'Aggarwal', 'Dutta', 'Banerjee', 'Ghosh', 'Sen'
]

departments = [
  'Operations', 'Maintenance', 'Finance', 'HR', 'Legal', 'Procurement', 'Safety', 'Engineering', 'IT', 'Water Metro'
]

statuses = ['approved', 'pending', 'draft', 'rejected']
priorities = ['low', 'medium', 'high', 'critical']

employees = []
contracts = []

for i in range(1, 81):
    fn = first_names[(i - 1) % len(first_names)]
    ln = last_names[(i - 1) % len(last_names)]
    full_name = f"{fn} {ln}"
    dept = departments[(i - 1) % len(departments)]
    role = 'admin' if i == 1 else ('manager' if i <= 10 else 'employee')
    email = f"{fn.lower()}.{ln.lower()}{i if i > 40 else ''}@kmrl.in"
    contract_id = f"CNT-2024-{str(i).zfill(3)}"
    contract_name = f"{dept.upper()} SERVICE & PROCUREMENT SLA #{i}"
    
    contract_status = 'expiring_soon' if i % 5 == 0 else ('pending_approval' if i % 7 == 0 else ('under_renewal' if i % 9 == 0 else 'active'))
    
    employees.append({
        'id': f"emp-{str(i).zfill(3)}",
        'fullName': full_name,
        'email': email,
        'role': role,
        'department': dept,
        'assignedContractId': contract_id,
        'assignedContractName': contract_name,
        'assignedContractStatus': contract_status,
        'avatarInitials': f"{fn[0]}{ln[0]}",
        'badge': 'badge-muted-red font-bloom-red' if role == 'admin' else ('badge-muted-amber font-bloom-amber' if role == 'manager' else 'badge-muted-green font-bloom-green')
    })
    
    value_amount = random.randint(15, 100) * 100000
    is_exp = contract_status == 'expiring_soon'
    
    contracts.append({
        'id': contract_id,
        'contractNumber': f"KMRL/SLA/2024/{100 + i}",
        'title': contract_name,
        'vendor': f"Vendor Partner {chr(65 + (i % 26))} Ltd",
        'department': dept,
        'assignedEmployeeName': full_name,
        'assignedEmployeeEmail': email,
        'valueAmount': value_amount,
        'startDate': '2023-09-01',
        'expiryDate': '2024-08-30' if is_exp else '2025-06-30',
        'status': contract_status,
        'renewalNoticeDays': 60,
        'isExpiring': is_exp
    })

categories = ['Safety', 'Operations', 'Finance', 'HR', 'Maintenance', 'Legal', 'Procurement', 'Engineering', 'Water Metro', 'IT']
documents = []

title_bases = [
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
]

for i in range(1, 201):
    is_dup = i > 180
    orig_index = (i - 180) if is_dup else i
    cat = categories[(i - 1) % len(categories)]
    emp = employees[(i - 1) % len(employees)]
    
    doc_id = f"doc-{str(i).zfill(3)}"
    orig_id = f"doc-{str(orig_index).zfill(3)}"
    
    base_t = title_bases[(i - 1) % len(title_bases)]
    title = f"{base_t} (DUPLICATE REVISION #{i - 180})" if is_dup else f"{base_t} #{i}"
    st = statuses[(i - 1) % len(statuses)]
    pr = priorities[(i - 1) % len(priorities)]
    
    text_body = f"""KOCHI METRO RAIL LIMITED (KMRL)
CORPORATE OFFICE: METRO BHAVAN, ERNAKULAM, KOCHI - 682017
{cat.upper()} DIRECTORATE · DOCUMENT REF: KMRL/{cat.upper()}/2024/{str(i).zfill(3)}

1. EXECUTIVE SUMMARY & BACKGROUND
This official document details the {cat.lower()} protocols, compliance checks, and operational telemetry for Kochi Metro Rail Limited. Assigned officer: {emp['fullName']} ({emp['department']} Department, Email: {emp['email']}). Contract Reference: {emp['assignedContractId']}.

2. TECHNICAL SPECIFICATIONS & OPERATIONAL AUDIT
- Infrastructure Monitoring: All relevant track infrastructure, station equipment, and rolling stock rakes were subjected to rigorous diagnostic evaluation.
- Compliance Verification: Operating parameters met 100% compliance standards specified by RDSO, Ministry of Housing and Urban Affairs (MoHUA), and KMRL Executive Board directives.
- Performance Metrics: Overall equipment effectiveness (OEE) recorded at 98.4%, with sensor latency under 2.1 milliseconds.

3. FINANCIAL & CONTRACTUAL IMPLICATIONS
- Budget Allocation: Projected annual outlay for this operational activity is estimated at ₹ {random.randint(10, 60) * 100000}.
- Vendor Responsibilities: Service Level Agreements (SLAs) mandate a maximum 60-minute emergency response window with liquidated damages of ₹ 50,000 per violation.

4. ACTIONABLE DIRECTIVES & APPROVAL STATUS
- Directive 1: Execute scheduled maintenance window during non-revenue hours (01:00 AM - 04:00 AM).
- Directive 2: Submit bi-weekly compliance telemetry logs to {emp['department']} Directorate.

RECORD AUTHORIZED BY: {emp['fullName'].upper()} (KMRL INTELLIDOCS)
STATUS: {st.upper()} · PRIORITY: {pr.upper()}"""

    doc_obj = {
        'id': doc_id,
        'title': title,
        'category': cat,
        'status': st,
        'priority': pr,
        'uploadedBy': emp['fullName'],
        'department': emp['department'],
        'createdAt': f"2024-0{((i % 6) + 1):02d}-15T10:00:00Z",
        'fileSize': random.randint(500000, 3500000),
        'mimeType': 'application/pdf',
        'ocrStatus': 'Completed',
        'description': f"Official {cat} document for KMRL operations. Assigned to {emp['fullName']}.",
        'extractedText': text_body,
        'aiSummary': {
            'executiveSummary': f"Executive Overview of {title}: Fully processed and verified under KMRL {cat.upper()} Protocols. Overall operational compliance recorded at 98.4%. Assigned officer: {emp['fullName']}.",
            'keyFindings': [
                f"1. Operational Telemetry: {cat} parameters verified compliant with RDSO standards.",
                f"2. Infrastructure Health: Inspection completed across 25 stations with 99.2% sensor accuracy.",
                f"3. Risk Audit: No critical safety hazards detected during Q3 audit cycle."
            ],
            'actionItems': [
                f"Complete preventative maintenance window for {emp['department']} department by end of month.",
                f"Submit bi-weekly telemetry compliance logs to KMRL Executive Directorate."
            ],
            'riskLevel': 'Low' if pr in ['low', 'medium'] else ('High' if pr == 'high' else 'Critical'),
            'department': emp['department'],
            'tags': [cat.lower(), emp['department'].lower(), 'kmrl', '2024']
        },
        'tags': [cat.lower(), emp['department'].lower(), 'kmrl', '2024'],
        'isDuplicate': is_dup,
        'duplicateOfId': orig_id if is_dup else None,
        'duplicateOfTitle': f"{base_t} #{orig_index} (ORIGINAL)" if is_dup else None,
        'similarityScore': round(90.0 + random.random() * 9.5, 1) if is_dup else None,
        'assignedToUser': emp['fullName'],
        'assignedContractId': emp['assignedContractId']
    }
    documents.append(doc_obj)

approvals = []
for i in range(1, 26):
    doc = documents[i * 4]
    emp = employees[i % len(employees)]
    approvals.append({
        'id': f"app-{str(i).zfill(3)}",
        'documentId': doc['id'],
        'documentTitle': doc['title'],
        'category': doc['category'],
        'requestedBy': doc['uploadedBy'],
        'department': doc['department'],
        'approver': emp['fullName'],
        'status': 'pending' if i % 3 == 0 else ('rejected' if i % 4 == 0 else 'approved'),
        'dateRequested': f"2024-0{((i % 6) + 1):02d}-10T12:00:00Z",
        'priority': doc['priority']
    })

notifications = []
for i in range(1, 21):
    types = ['info', 'warning', 'success', 'alert']
    t = types[i % 4]
    notifications.append({
        'id': f"notif-{str(i).zfill(3)}",
        'title': f"OCR Extraction Completed #{i}" if i % 2 == 0 else f"Contract Renewal Notice #{i}",
        'message': f"EasyOCR processed document doc-{str(i).zfill(3)} with 98.4% accuracy." if i % 2 == 0 else f"Contract SLA #{i} requires executive review within 30 days.",
        'type': t,
        'createdAt': f"2024-0{((i % 6) + 1):02d}-12T08:00:00Z",
        'read': i > 5,
        'link': f"/documents/doc-{str(i).zfill(3)}"
    })

mock_content = f"""// Realistic KMRL IntelliDocs mock data - 80 Employees, 200 Documents with OCR + AI Summaries, 80 Contracts, 25 Approvals, 20 Notifications

export interface MockDocument {{
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
  aiSummary?: {{
    executiveSummary: string;
    keyFindings: string[];
    actionItems: string[];
    riskLevel: string;
    department: string;
    tags: string[];
  }};
  tags?: string[];
  isDuplicate?: boolean;
  duplicateOfId?: string;
  duplicateOfTitle?: string;
  similarityScore?: number;
  assignedToUser?: string;
  assignedContractId?: string;
}}

export interface MockEmployee {{
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
}}

export interface MockContract {{
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
}}

export interface MockApproval {{
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
}}

export interface MockNotification {{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  createdAt: string;
  read: boolean;
  link?: string;
}}

export const MOCK_EMPLOYEES: MockEmployee[] = {json.dumps(employees, indent=2)};
export const MOCK_CONTRACTS: MockContract[] = {json.dumps(contracts, indent=2)};
export const MOCK_DOCUMENTS: MockDocument[] = {json.dumps(documents, indent=2)};
export const MOCK_APPROVALS: MockApproval[] = {json.dumps(approvals, indent=2)};
export const MOCK_NOTIFICATIONS: MockNotification[] = {json.dumps(notifications, indent=2)};

export const MOCK_ANALYTICS = {{
  total_documents: 200,
  uploads_today: 23,
  pending_approvals: 18,
  duplicate_documents: 20,
  ocr_processed: 194,
  ai_processed: 188,
  storage_used_bytes: 52_428_800_000,
  storage_total_bytes: 107_374_182_400,
  active_users: 80,
  monthly_uploads: [
    {{ month: 'Mar', count: 24 }},
    {{ month: 'Apr', count: 32 }},
    {{ month: 'May', count: 41 }},
    {{ month: 'Jun', count: 52 }},
    {{ month: 'Jul', count: 68 }},
    {{ month: 'Aug', count: 200 }},
  ],
  category_distribution: [
    {{ category: 'Finance', count: 20 }},
    {{ category: 'Operations', count: 20 }},
    {{ category: 'HR', count: 20 }},
    {{ category: 'Safety', count: 20 }},
    {{ category: 'Legal', count: 20 }},
    {{ category: 'Procurement', count: 20 }},
    {{ category: 'Maintenance', count: 20 }},
    {{ category: 'Engineering', count: 20 }},
    {{ category: 'Water Metro', count: 20 }},
    {{ category: 'IT', count: 20 }},
  ],
  department_activity: [
    {{ department: 'Operations', documents: 20, storage_gb: 12.3 }},
    {{ department: 'Finance', documents: 20, storage_gb: 8.7 }},
    {{ department: 'HR', documents: 20, storage_gb: 5.2 }},
    {{ department: 'Maintenance', documents: 20, storage_gb: 7.1 }},
    {{ department: 'Legal', documents: 20, storage_gb: 4.5 }},
    {{ department: 'Procurement', documents: 20, storage_gb: 14.8 }},
  ],
  approval_stats: {{ total: 25, approved: 15, rejected: 3, pending: 7, avg_decision_hours: 4.2 }},
  recent_activity: [
    {{ user: 'Rajan Menon', action: 'Approved', document: 'Financial Statement Q2', time: '2 min ago' }},
    {{ user: 'Priya Nair', action: 'Uploaded', document: 'HR Policy Update', time: '15 min ago' }},
    {{ user: 'Arun Kumar', action: 'Commented on', document: 'Maintenance Schedule', time: '1 hr ago' }},
  ],
}};
"""

target_path = os.path.join(os.path.dirname(__file__), '../frontend/src/data/mockData.ts')
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(mock_content)

print("PYTHON GENERATED ALL 200 DOCUMENTS WITH OCR AND AI SUMMARY SUCCESSFULLY!")
