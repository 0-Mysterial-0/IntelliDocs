// Realistic KMRL IntelliDocs mock data with full text content for in-document search and copy

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
}

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc-001',
    title: 'Safety Inspection Report Q1 2024',
    category: 'Safety',
    status: 'approved',
    priority: 'high',
    uploadedBy: 'Arun Kumar',
    department: 'Operations',
    createdAt: '2024-01-15T09:00:00Z',
    fileSize: 2_456_789,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'Comprehensive safety inspection covering all KMRL stations and rolling stock for Q1 2024.',
    extractedText: `KOCHI METRO RAIL LIMITED (KMRL)
CORPORATE OFFICE: METRO BHAVAN, ERNAKULAM, KOCHI - 682017
SAFETY & OPERATIONS DIRECTORATE

DOCUMENT REF: KMRL/SAFETY/Q1/2024/089
DATE OF AUDIT: 12TH JANUARY 2024
INSPECTION TEAM: ARUN KUMAR (SR. SAFETY ENGINEER), K. S. NAIR (INSPECTOR)

1. EXECUTIVE OVERVIEW
During Q1 2024, a comprehensive safety inspection was carried out across all 25 operational metro stations along the Aluva to Petta corridor (Line 1). Overall compliance with safety protocols stands at 96.4%. No major structural or electrical hazards were detected.

2. STATION SAFETY AND ACCESS AUDIT
- Aluva Station: Emergency exit doors inspected. Alarm response time recorded at 1.4 seconds. Fire suppression pressure gauges optimal.
- Edapally Station: Platform Screen Door (PSD) sensor calibration verified. Minor alignment issue noted on PSD Gate 4; work order raised.
- MG Road Station: Escalator emergency stop buttons tested successfully. Passenger flow monitoring system operational.
- Vytilla Water Metro Hub: Intermodal transfer walkways clear of obstructions. Marine safety jackets and liferaft equipment fully certified.

3. ROLLING STOCK INSPECTION (METRO TRAINSETS)
- Trainset 04 & 11: Emergency brake response tested under full simulation payload. Deceleration parameters met RDSO standards.
- Air Conditioning & Ventilation: HEPA filters replaced across 18 trainsets. CO2 sensors operating within safe threshold (<800 ppm).

4. ACTIONABLE RECOMMENDATIONS & COMPLIANCE TIMELINE
- Action Item 1: Complete recalibration of PSD Gate 4 sensors at Edapally Station before 20th January 2024.
- Action Item 2: Conduct refresher fire drill for shift supervisors at Kalamassery Depot by 28th January 2024.

APPROVED BY: CHIEF SAFETY OFFICER, KMRL`,
  },
  {
    id: 'doc-002',
    title: 'Financial Statement March 2024',
    category: 'Finance',
    status: 'approved',
    priority: 'high',
    uploadedBy: 'Rajan Menon',
    department: 'Finance',
    createdAt: '2024-03-31T09:00:00Z',
    fileSize: 1_234_567,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'Monthly financial statement including revenue, expenses and variance analysis.',
    extractedText: `KOCHI METRO RAIL LIMITED
FINANCE & ACCOUNTS DEPARTMENT - MONTHLY FINANCIAL STATEMENT
PERIOD: MARCH 2024 (FY 2023-24)

1. REVENUE HEADS
- Passenger Fare Collection: ₹ 14.82 Crores (8.4% increase over Feb 2024)
- Non-Fare Box Revenue (Advertising & Kiosks): ₹ 3.45 Crores
- Water Metro Operations Revenue: ₹ 1.15 Crores
TOTAL MONTHLY REVENUE: ₹ 19.42 Crores

2. OPERATIONAL EXPENDITURE
- Traction Energy Costs (KSEB Tariff): ₹ 5.80 Crores
- Staff Salaries & Allowances: ₹ 4.10 Crores
- Maintenance Contracts (Rolling Stock & Track): ₹ 3.25 Crores
- Security & Housekeeping Contracts: ₹ 1.95 Crores
TOTAL OPERATIONAL EXPENDITURE: ₹ 15.10 Crores

3. NET OPERATING SURPLUS: ₹ 4.32 Crores
Cumulative Operating Surplus for FY 23-24 reaches ₹ 48.60 Crores, exceeding statutory financial projections by 6.2%.

PREPARED BY: RAJAN MENON (FINANCE MANAGER)
VERIFIED BY: CHIEF FINANCIAL OFFICER, KMRL`,
  },
  {
    id: 'doc-003',
    title: 'HR Policy Manual v3.2',
    category: 'HR',
    status: 'approved',
    priority: 'medium',
    uploadedBy: 'Priya Nair',
    department: 'Human Resources',
    createdAt: '2024-01-20T10:00:00Z',
    fileSize: 890_123,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'Updated HR policies including leave, travel, and code of conduct.',
    extractedText: `KOCHI METRO RAIL LIMITED
HUMAN RESOURCES POLICY MANUAL - VERSION 3.2 (EFFECTIVE JAN 2024)

SECTION 4: LEAVE RULES AND ENTITLEMENTS
4.1 Casual Leave (CL): All full-time employees are entitled to 12 days of CL per calendar year.
4.2 Earned Leave (EL): 30 days per annum, credited half-yearly on 1st January and 1st July.
4.3 Maternity & Paternity Leave: 26 weeks paid maternity leave; 15 days paid paternity leave.

SECTION 7: CODE OF CONDUCT & ETHICS
7.1 Confidentiality: Employees must not disclose official KMRL operational documents, financial statements, or tender evaluation records to unauthorized external parties.
7.2 Professional Conduct: Respectful communication is mandatory across all departments. Zero tolerance for workplace harassment.

PUBLISHED BY: GENERAL MANAGER (HR), KMRL METRO BHAVAN`,
  },
  {
    id: 'doc-004',
    title: 'Track Inspection Report - Blue Line',
    category: 'Maintenance',
    status: 'pending',
    priority: 'critical',
    uploadedBy: 'Arun Kumar',
    department: 'Maintenance',
    createdAt: '2024-04-02T11:00:00Z',
    fileSize: 3_456_789,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'Detailed track inspection findings for Blue Line, Km 0-25.',
    extractedText: `KOCHI METRO RAIL LIMITED - PERMANENT WAY MAINTENANCE
BLUE LINE TRACK GEOMETRY AUDIT - MARCH/APRIL 2024

SECTION INSPECTED: KMN 0+000 TO KMN 25+400 (ALUVA TO PETTA VIA PALARIVATTOM)
EQUIPMENT USED: ULTRASONIC FLAW DETECTOR (UFD) & TRACK RECORDING CAR (TRC)

FINDINGS & DEFECT CATEGORIZATION:
- Rail Wear: Vertical wear on rail heads across Curve 14 (Palarivattom S-curve) measured at 3.2 mm (threshold limit 5.0 mm).
- Weld Joint Inspection: 142 Thermit weld joints scanned. Joint #W-89 near Pathadipalam exhibits minor internal void anomaly.
- Fasteners & Elastic Rail Clips: Replacement required for 45 worn-out rubber pads near Changampuzha Park station.

IMMEDIATE ACTION REQUIRED:
Schedule night block for replacement of Thermit Weld #W-89 within 7 days. Continuous ultrasonic monitoring mandated until replacement.

SUBMITTED BY: ARUN KUMAR (TRACK MAINTENANCE ENGINEER)`,
  },
  {
    id: 'doc-005',
    title: 'Tender Document - Signal System Upgrade',
    category: 'Procurement',
    status: 'pending',
    priority: 'high',
    uploadedBy: 'Suresh Pillai',
    department: 'Procurement',
    createdAt: '2024-03-20T08:00:00Z',
    fileSize: 5_678_901,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'RFP for advanced CBTC signaling system upgrade project.',
    extractedText: `KOCHI METRO RAIL LIMITED
TENDER NOTICE NO: KMRL/PROC/SIG/2024/T-04
REQUEST FOR PROPOSAL (RFP) - SUPPLY, INSTALLATION, TESTING & COMMISSIONING OF CBTC SIGNALING SYSTEM FOR PHASE 2

1. SCOPE OF WORK
The Contractor shall design, manufacture, supply, install, test, and commission Communication-Based Train Control (CBTC) signaling and train control system for KMRL Phase 2 extension (JLN Stadium to Infopark Kakkanad, 11.2 km).

2. ELIGIBILITY CRITERIA
- Minimum average annual financial turnover of ₹ 150 Crores over the last 3 financial years.
- Prior successful execution of at least 2 CBTC metro signaling contracts in India or international transit networks.

3. IMPORTANT DATES
- Pre-bid Meeting: 10th April 2024 at Metro Bhavan Auditorium.
- Last Date of Tender Submission: 30th April 2024, 15:00 hrs IST.
- Tender Opening Date: 30th April 2024, 16:00 hrs IST.

ISSUED BY: GENERAL MANAGER (PROCUREMENT), KMRL`,
  },
  {
    id: 'doc-006',
    title: 'Board Meeting Minutes - February 2024',
    category: 'Operations',
    status: 'approved',
    priority: 'medium',
    uploadedBy: 'Suresh Prabhu',
    department: 'Operations',
    createdAt: '2024-02-28T15:00:00Z',
    fileSize: 456_789,
    mimeType: 'application/pdf',
    ocrStatus: 'Completed',
    description: 'Minutes from the February Board of Directors meeting.',
    extractedText: `MINUTES OF THE 84TH BOARD MEETING OF KOCHI METRO RAIL LIMITED
DATE: 28TH FEBRUARY 2024 | VENUE: BOARD ROOM, METRO BHAVAN, KOCHI

PRESENT:
- Managing Director, KMRL (in Chair)
- Nominee Director, Ministry of Housing & Urban Affairs (MoHUA)
- Principal Secretary, Transport Department, Govt of Kerala

KEY RESOLUTIONS PASSED:
1. Approval of Phase 2 Project Expenditure: Board formally approved revised cost estimation of ₹ 1,956 Crores for Kakkanad line.
2. Solar Power Integration: Approved Phase 3 solar rooftop installation across 10 metro stations to achieve 60% green energy self-sufficiency.
3. Multi-Modal Integration: Authorized MOU with KSRTC for unified feeder bus ticketing system linked to Kochi One Card.

MEETING CONCLUDED WITH VOTE OF THANKS AT 17:30 HRS.`,
  },
];

export const MOCK_ANALYTICS = {
  total_documents: 1247,
  uploads_today: 23,
  pending_approvals: 18,
  duplicate_documents: 7,
  ocr_processed: 1182,
  ai_processed: 1089,
  storage_used_bytes: 52_428_800_000,
  storage_total_bytes: 107_374_182_400,
  active_users: 47,
  monthly_uploads: [
    { month: 'Mar', count: 145 }, { month: 'Apr', count: 178 },
    { month: 'May', count: 203 }, { month: 'Jun', count: 189 },
    { month: 'Jul', count: 234 }, { month: 'Aug', count: 298 },
  ],
  category_distribution: [
    { category: 'Finance', count: 234 }, { category: 'Operations', count: 312 },
    { category: 'HR', count: 156 }, { category: 'Safety', count: 189 },
    { category: 'Legal', count: 98 }, { category: 'Procurement', count: 178 },
    { category: 'Maintenance', count: 80 },
  ],
  department_activity: [
    { department: 'Operations', documents: 312, storage_gb: 12.3 },
    { department: 'Finance', documents: 234, storage_gb: 8.7 },
    { department: 'HR', documents: 156, storage_gb: 5.2 },
    { department: 'Maintenance', documents: 180, storage_gb: 7.1 },
    { department: 'Legal', documents: 98, storage_gb: 4.5 },
    { department: 'Procurement', documents: 267, storage_gb: 14.8 },
  ],
  approval_stats: { total: 234, approved: 189, rejected: 23, pending: 18, avg_decision_hours: 4.2 },
  recent_activity: [
    { user: 'Rajan Menon', action: 'Approved', document: 'Financial Statement Q2', time: '2 min ago' },
    { user: 'Priya Nair', action: 'Uploaded', document: 'HR Policy Update', time: '15 min ago' },
    { user: 'Arun Kumar', action: 'Commented on', document: 'Maintenance Schedule', time: '1 hr ago' },
  ],
};

export const mockData = {
  documents: MOCK_DOCUMENTS,
  analytics: MOCK_ANALYTICS,
};

export default mockData;
