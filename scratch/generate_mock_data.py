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

comment_templates = {
  'Safety': [
    "I have reviewed the acoustic track emission data on the Aluva to Petta line. Sensor readings on section {sec} are well within RDSO thresholds.",
    "Fire suppression pressure testing at {station} Station passed verification. Please ensure shift supervisors update the monthly logbook.",
    "Platform Screen Door (PSD) calibration on Gate {gate} was completed during non-revenue hours. System response is 100% nominal.",
    "Traction power substation emergency cutoffs verified. Requesting Safety Directorate to sign off on the compliance certificate.",
    "Escalator emergency brake distance tests passed. Recommending scheduling the next audit for early next quarter.",
    "Acoustic noise levels during high-speed rake testing registered 64 dB, meeting urban transit acoustic compliance standards.",
    "Emergency egress signage illumination verified along underground section. Secondary battery backup is fully functional.",
    "Hazmat containment protocols for Muttom depot maintenance bays reviewed and approved by the Safety Committee."
  ],
  'Operations': [
    "Headway scheduling during peak hours (08:00 AM - 10:00 AM) optimized. Passenger dwell time reduced to 22 seconds per station.",
    "Automatic Train Control (ATC) signaling logs verified for Rake #{rake}. No communication dropouts recorded over 72 hours.",
    "Intermodal transport connectivity metrics at Vytilla Mobility Hub show a 14% increase in feeder bus transfers.",
    "Station master logs for Line 1 indicate 99.4% on-time departure rate across all 25 operational metro stations.",
    "Crowd control barriers deployed at Edapally station during festive weekend handled passenger footfall smoothly.",
    "Farebox collection telemetry synced across all gate arrays. Zero transaction dropouts reported.",
    "Nightly non-revenue maintenance train movements coordinated with OCC. Track clearance confirmed by 04:15 AM.",
    "Passenger info display system (PIDS) software patch applied across all stations. Real-time arrival accuracy improved."
  ],
  'Finance': [
    "Non-farebox kiosk revenue for Q{q} reached ₹ {rev} Lakhs, exceeding budget projections by 8.4%.",
    "Operating expenditure audit for vendor contract #{cid} completed. Invoice clearance approved by Accounts Division.",
    "Passenger farebox collection accounts reconciled for Line 1 and Water Metro routes. Zero discrepancies found.",
    "Capital outlay for automated fare collection card validator upgrade verified against approved tender estimate.",
    "Tax compliance filing and GST input tax credit reconciliation submitted for the current audit cycle.",
    "Station digital advertising screen lease revenue cleared for Q3. Next review scheduled prior to contract expiry.",
    "Auxiliary power tariff consumption data analyzed. Rooftop solar offsets reduced grid power expenditure by 12.1%.",
    "Internal audit report signed off by Financial Controller. All department budget allocations are balanced."
  ],
  'HR': [
    "Revised night shift allowance of ₹ 450 per shift for track maintenance staff incorporated into payroll system.",
    "Annual health insurance cover limit increased to ₹ 5 Lakhs for all permanent operational personnel.",
    "Employee performance appraisal logs for {dept} department verified and uploaded to employee portal.",
    "Technical training program on signaling maintenance completed for 18 junior engineers at Muttom Academy.",
    "Paternity leave applications processed in accordance with the updated 2024 HR Policy Circular.",
    "Staff attendance biometric logs reconciled with shift roster. Zero payroll discrepancies recorded.",
    "Recruitment drive for station controllers and train operators successfully completed. Orientation starts Monday.",
    "Workplace safety and ergonomic assessment carried out across all station control rooms."
  ],
  'Maintenance': [
    "Bogie overhaul and wheel turning completed for Trainset RS-{rake} at Workshop Bay 2.",
    "Traction Overhead Equipment (OHE) carbon strip wear gauge inspection passed. Replacement scheduled for 40,000 km.",
    "HEPA air filters replaced across all 18 trainset passenger cars. Cabin CO2 sensors re-calibrated.",
    "HVAC cooling unit pressure testing completed on Rake #{rake}. Compressor refrigerant topped up.",
    "Track grinding along Kilometer {km} to {km2} completed during non-revenue hours. Rail profile verified.",
    "Muttom workshop depot overhead crane inspection completed with load test certification.",
    "Battery bank voltage check on emergency traction backup systems optimal across all sub-stations.",
    "Hydraulic brake line pressure sensors tested under full simulation payload. Zero leakage observed."
  ],
  'Legal': [
    "Service Level Agreement (SLA) clause 14.2 reviewed regarding vendor delay penalty terms. Document compliant.",
    "Station commercial kiosk lease agreement draft vetted by Legal Counsel. Mandatory 60-day renewal notice included.",
    "Land acquisition indemnity bond documents verified for Water Metro terminal expansion project.",
    "Intellectual property and software license terms for Automatic Fare Collection system approved.",
    "Regulatory compliance filing with Ministry of Housing and Urban Affairs (MoHUA) submitted on schedule.",
    "Contractor safety liability coverage verified against statutory insurance requirements.",
    "Dispute resolution clause updated in alignment with Indian Arbitration and Conciliation Act amendments.",
    "Right of Way (RoW) clearance documentation verified for feeder corridor infrastructure."
  ],
  'Procurement': [
    "Technical bid evaluation completed for Tender Ref KMRL/PROC/2024/{bid}. 4 qualified vendors selected.",
    "Solar PV rooftop system procurement specifications verified by Electrical Engineering Directorate.",
    "Station housekeeping and sanitation service tender specifications approved for executive publishing.",
    "Spare parts inventory requisition for Alstom Metropolis rakes cleared for purchase order issuance.",
    "Pre-bid conference queries answered and published on the KMRL E-Tendering portal.",
    "Vendor performance evaluation matrix updated for annual vendor empalement review.",
    "Price bid opening scheduled for Friday following technical qualification clearance.",
    "Quality assurance audit of supplied track fasteners completed at vendor manufacturing facility."
  ],
  'Engineering': [
    "Structural load testing on elevated viaduct pier P-{pier} completed. Deflection parameters well within safety limits.",
    "Thermit welding inspection on rail joints along section {sec} verified via ultrasonic flaw detection.",
    "Substation transformer oil insulation breakdown voltage test results recorded at 68 kV (Optimal).",
    "Station building management system (BMS) telemetry integration verified across all 25 stations.",
    "Drainage and stormwater management infrastructure around station underpasses inspected ahead of monsoons.",
    "Vibration dampening pads under track bed evaluated. Dynamic rail deflection is nominal.",
    "Elevated station canopy structural integrity check completed following monsoon storm inspection.",
    "SCADA remote control telemetry for traction power substations tested with 100% command success rate."
  ],
  'Water Metro': [
    "Electric hybrid boat Fleet #{boat} completed sea trials with 99.1% energy efficiency score.",
    "Vytilla to Fort Kochi Water Metro route passenger ridership crossed 1.5 Million milestone.",
    "Lithium-titanate battery fast-charging station at High Court terminal inspected and certified.",
    "Floating pontoon walkway gangway automatic level adjustment sensors recalibrated.",
    "Marine life-saving equipment and life raft deployment mechanisms inspected by Mercantile Marine Dept.",
    "Water Metro automatic fare collection gates integrated with Kochi One NCMC smart card.",
    "Feeder electric boat hull ultrasonic thickness testing confirmed zero hull corrosion.",
    "Terminal passenger waiting lounges air conditioning and solar power integration verified."
  ],
  'IT': [
    "ISO 27001 annual cybersecurity audit completed. Multi-Factor Authentication (MFA) enforced system-wide.",
    "Automatic Fare Collection (AFC) QR code validator firmware update deployed to 120 station gates.",
    "KMRL IntelliDocs RAG AI vector database index re-indexed with zero query latency degradation.",
    "Local network firewall policy rules updated to block unauthorized external IP ranges.",
    "Disaster recovery site data replication latency verified under 150 milliseconds.",
    "Station Wi-Fi network bandwidth management policy updated for passenger connectivity.",
    "Server room precision AC temperature monitoring alerts tested and functional.",
    "Data backup retention policy executed. Offline cold storage backups verified."
  ]
}

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

    # Generate 5 to 10 unique comments for this specific document
    doc_comments = []
    num_comments = random.randint(5, 10)
    cat_templates = comment_templates.get(cat, comment_templates['Operations'])
    
    for c_idx in range(num_comments):
        commenter = employees[(i + c_idx * 7) % len(employees)]
        tpl = cat_templates[c_idx % len(cat_templates)]
        formatted_comment = tpl.format(
            sec=f"{10 + (i % 15)}-{(i % 15) + 12}",
            station=['Aluva', 'Edapally', 'Kalamassery', 'MG Road', 'Palarivattom', 'Vytilla', 'Petta'][c_idx % 7],
            gate=(c_idx % 6) + 1,
            rake=f"RS-0{((i + c_idx) % 9) + 1}",
            q=((i % 4) + 1),
            rev=(i * 3) + 40,
            cid=emp['assignedContractId'],
            dept=emp['department'],
            km=f"{(i % 12) + 2}.4",
            km2=f"{(i % 12) + 6}.8",
            bid=f"{(i % 50) + 100}",
            pier=f"{(i % 80) + 10}",
            boat=f"0{((i + c_idx) % 6) + 1}"
        )
        
        # Add document specific contextual suffix so every single comment is 100% unique to this doc
        unique_text = f"{formatted_comment} (Ref: {doc_id} / Log #{c_idx + 1})"
        
        doc_comments.append({
            'id': f"cmt-{doc_id}-{c_idx + 1}",
            'documentId': doc_id,
            'userName': commenter['fullName'],
            'userRole': commenter['role'].upper(),
            'userAvatar': commenter['avatarInitials'],
            'content': unique_text,
            'createdAt': f"2024-0{((i % 6) + 1):02d}-{min(28, c_idx + 2):02d}T{10 + c_idx}:15:00Z"
        })

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
        'comments': doc_comments,
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

mock_content = f"""// Realistic KMRL IntelliDocs mock data - 80 Employees, 200 Documents with 5-10 Unique Comments each, 80 Contracts, 25 Approvals, 20 Notifications

export interface MockComment {{
  id: string;
  documentId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}}

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
  comments?: MockComment[];
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

print("PYTHON GENERATED ALL 200 DOCUMENTS WITH 5-10 UNIQUE COMMENTS EACH!")
