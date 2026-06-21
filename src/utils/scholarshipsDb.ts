export interface StudentProfile {
  name: string;
  age: number;
  gender: string; // 'Male' | 'Female' | 'Other'
  state: string;
  category: string; // 'General' | 'OBC' | 'SC' | 'ST'
  familyIncome: number;
  educationLevel: string; // 'School' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'PhD'
  currentCourse: string;
  percentageOrCgpa: number; // 0 - 100 scale or 0 - 10 scale (normalized to 100)
  disabilityStatus: boolean;
  minorityStatus: boolean;
}

export interface Scholarship {
  id: string;
  name: string;
  sponsor: string;
  type: 'Government' | 'Private' | 'Merit-Based' | 'Need-Based' | 'International' | 'State-Specific';
  benefitAmount: string;
  deadline: string;
  requiredDocuments: string[];
  officialLink: string;
  description: string;
  criteria: {
    minAge?: number;
    maxAge?: number;
    genders?: string[];
    states?: string[];
    categories?: string[];
    maxIncome?: number;
    educationLevels?: string[];
    minPercentage?: number;
    requiresDisability?: boolean;
    requiresMinority?: boolean;
  };
}

export interface MatchResult {
  scholarship: Scholarship;
  isEligible: boolean;
  score: number; // 0 to 100
  reasons: string[];
  steps: string[];
}

export const SCHOLARSHIPS: Scholarship[] = [
  // ─── CENTRAL GOVERNMENT SCHOLARSHIPS ───────────────────────────────
  {
    id: "nsp-pmss",
    name: "Prime Minister's Scholarship Scheme (PMSS)",
    sponsor: "Ministry of Defence, Govt of India",
    type: "Government",
    benefitAmount: "₹36,000/year (Boys) & ₹42,000/year (Girls)",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Ex-Servicemen/CAPF Certificate", "Marksheet of 12th", "Bank Passbook"],
    officialLink: "https://scholarships.gov.in",
    description: "Financial support for wards and widows of ex-servicemen, ex-coast guard, and CAPF personnel to pursue professional degree courses.",
    criteria: {
      minPercentage: 60,
      educationLevels: ["Undergraduate", "Postgraduate"],
      genders: ["Male", "Female"]
    }
  },
  {
    id: "nsp-central-sc",
    name: "Central Sector Scholarship for College & University Students",
    sponsor: "Ministry of Education, Govt of India",
    type: "Government",
    benefitAmount: "₹10,000–₹20,000/year for 3 years",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "12th Marksheet", "College Admission Receipt"],
    officialLink: "https://scholarships.gov.in",
    description: "Merit-based scholarship for students scoring above 80th percentile in 12th board exams pursuing higher education at recognized institutions.",
    criteria: {
      minPercentage: 80,
      maxIncome: 800000,
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "postmatric-sc",
    name: "Post-Matric Scholarship for SC Students",
    sponsor: "Ministry of Social Justice & Empowerment",
    type: "Government",
    benefitAmount: "Full Tuition Fee + Maintenance Allowance ₹3,000–₹13,000/month",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate (SC)", "Income Certificate", "Marksheet", "Fee Receipt"],
    officialLink: "https://scholarships.gov.in",
    description: "Centrally sponsored scheme providing financial assistance to SC students for post-matriculation studies to enable completion of higher education.",
    criteria: {
      categories: ["SC"],
      maxIncome: 250000,
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate", "PhD"]
    }
  },
  {
    id: "postmatric-st",
    name: "Post-Matric Scholarship for ST Students",
    sponsor: "Ministry of Tribal Affairs",
    type: "Government",
    benefitAmount: "Full Tuition Fee + Maintenance Allowance up to ₹13,000/month",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate (ST)", "Income Certificate", "Marksheet"],
    officialLink: "https://scholarships.gov.in",
    description: "Financial assistance to ST students studying at post-matriculation level to encourage higher education and reduce dropout rates.",
    criteria: {
      categories: ["ST"],
      maxIncome: 250000,
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate", "PhD"]
    }
  },
  {
    id: "postmatric-obc",
    name: "Post-Matric Scholarship for OBC Students",
    sponsor: "Ministry of Social Justice & Empowerment",
    type: "State-Specific",
    benefitAmount: "Full Tuition Fee Reimbursement + Monthly Allowance",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate (OBC)", "Income Certificate", "Marksheet"],
    officialLink: "https://scholarships.gov.in",
    description: "Financial assistance to OBC students studying at post-matriculation or post-secondary stages to enable them to complete their education.",
    criteria: {
      categories: ["OBC"],
      maxIncome: 300000,
      educationLevels: ["Undergraduate", "Postgraduate", "PhD"],
      states: ["Maharashtra", "Karnataka", "Delhi", "Uttar Pradesh", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal"]
    }
  },
  {
    id: "prematric-minority",
    name: "Pre-Matric Scholarship for Minorities",
    sponsor: "Ministry of Minority Affairs",
    type: "Government",
    benefitAmount: "₹5,700–₹10,700/year (Admission + Tuition + Maintenance)",
    deadline: "2026-09-30",
    requiredDocuments: ["Aadhaar Card", "Minority Community Declaration", "Income Certificate", "School ID Card"],
    officialLink: "https://scholarships.gov.in",
    description: "Financial support to students belonging to notified minority communities (Muslim, Sikh, Christian, Buddhist, Jain, Parsi) studying in Classes I–X.",
    criteria: {
      requiresMinority: true,
      maxIncome: 100000,
      educationLevels: ["School"]
    }
  },
  {
    id: "postmatric-minority",
    name: "Post-Matric Scholarship for Minorities",
    sponsor: "Ministry of Minority Affairs",
    type: "Government",
    benefitAmount: "₹20,000/year + Full Tuition Fees (up to ₹3 Lakh)",
    deadline: "2026-10-15",
    requiredDocuments: ["Aadhaar Card", "Minority Declaration", "Income Certificate", "Marksheet"],
    officialLink: "https://scholarships.gov.in",
    description: "Assistance to meritorious students belonging to minority communities for post-matriculation and professional courses.",
    criteria: {
      requiresMinority: true,
      maxIncome: 200000,
      minPercentage: 50,
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "moma-merit-means",
    name: "MOMA Merit-cum-Means Scholarship for Minorities",
    sponsor: "Ministry of Minority Affairs",
    type: "Government",
    benefitAmount: "₹25,000/year + Course Fee (up to ₹5 Lakh/year)",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Minority Declaration", "Income Certificate", "Marksheet", "Admission Letter"],
    officialLink: "https://scholarships.gov.in",
    description: "Merit-based financial assistance for minority community students admitted to professional and technical courses at recognized institutions.",
    criteria: {
      requiresMinority: true,
      maxIncome: 250000,
      minPercentage: 50,
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "national-overseas-sc",
    name: "National Overseas Scholarship for SC Students",
    sponsor: "Ministry of Social Justice & Empowerment",
    type: "International",
    benefitAmount: "Full Tuition + $15,400 USD Annual Allowance + Air Travel",
    deadline: "2026-07-15",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate (SC)", "Income Certificate", "Degree Marksheet", "Foreign University Offer Letter"],
    officialLink: "https://nosmsje.gov.in",
    description: "Provides financial assistance to selected SC/ST students for pursuing Master's and PhD programmes at top universities abroad.",
    criteria: {
      categories: ["SC", "ST"],
      maxIncome: 800000,
      educationLevels: ["Postgraduate", "PhD"],
      minPercentage: 60,
      maxAge: 35
    }
  },
  {
    id: "disability-nhfdf",
    name: "NHFDC Scholarship for Students with Disabilities",
    sponsor: "National Handicapped Finance & Development Corporation",
    type: "Government",
    benefitAmount: "₹30,000/year + Maintenance Allowance",
    deadline: "2026-11-15",
    requiredDocuments: ["Aadhaar Card", "Disability Certificate (40%+)", "Marksheet", "Income Certificate"],
    officialLink: "http://www.nhfdc.nic.in",
    description: "Financial aid to students with 40%+ disability for pursuing professional or technical degree/diploma courses.",
    criteria: {
      requiresDisability: true,
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "pragati-girls",
    name: "AICTE Pragati Scholarship for Girls",
    sponsor: "AICTE, Govt of India",
    type: "Government",
    benefitAmount: "₹50,000/year for up to 4 years",
    deadline: "2026-12-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "AICTE Approved Institution Proof", "Marksheet"],
    officialLink: "https://www.aicte-india.org/schemes/students-development-schemes/PRAGATI",
    description: "Encourages girls from economically weaker sections to pursue technical education at AICTE-approved institutions.",
    criteria: {
      genders: ["Female"],
      maxIncome: 800000,
      educationLevels: ["Diploma", "Undergraduate"]
    }
  },
  {
    id: "saksham-pwd",
    name: "AICTE Saksham Scholarship for Differently Abled",
    sponsor: "AICTE, Govt of India",
    type: "Government",
    benefitAmount: "₹50,000/year for up to 4 years",
    deadline: "2026-12-31",
    requiredDocuments: ["Aadhaar Card", "Disability Certificate (40%+)", "Income Certificate", "AICTE Institution Proof"],
    officialLink: "https://www.aicte-india.org/schemes/students-development-schemes/SAKSHAM",
    description: "Financial support to differently abled students pursuing technical education at AICTE-approved institutions.",
    criteria: {
      requiresDisability: true,
      maxIncome: 800000,
      educationLevels: ["Diploma", "Undergraduate"]
    }
  },
  {
    id: "ishan-uday-ne",
    name: "Ishan Uday – Scholarship for North-Eastern Region",
    sponsor: "UGC, Ministry of Education",
    type: "Government",
    benefitAmount: "₹5,400–₹7,800/month (varies by course type)",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Domicile Certificate (NE State)", "12th Marksheet", "Admission Letter"],
    officialLink: "https://scholarships.gov.in",
    description: "Special scholarship for students from North-Eastern states pursuing undergraduate courses at government-approved institutions.",
    criteria: {
      maxIncome: 450000,
      educationLevels: ["Undergraduate"],
      states: ["Assam", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"]
    }
  },
  {
    id: "inspire-dbt",
    name: "INSPIRE – Innovation in Science Pursuit for Inspired Research",
    sponsor: "Department of Science & Technology, Govt of India",
    type: "Merit-Based",
    benefitAmount: "₹80,000/year (SHE) + ₹20,000 Summer Attachment",
    deadline: "2026-10-31",
    requiredDocuments: ["12th Marksheet (Top 1% in Board)", "Admission Letter (B.Sc/BS/Integrated MS)", "Bank Passbook"],
    officialLink: "https://www.online-inspire.gov.in",
    description: "Attract talented youth to study basic and natural sciences at the undergraduate level through assured opportunity for summer attachment and mentoring.",
    criteria: {
      minPercentage: 90,
      educationLevels: ["Undergraduate"]
    }
  },
  {
    id: "kvpy-fellowship",
    name: "KVPY Fellowship (now integrated into INSPIRE)",
    sponsor: "Department of Science & Technology",
    type: "Merit-Based",
    benefitAmount: "₹5,000–₹7,000/month + ₹20,000/year Contingency",
    deadline: "2026-09-30",
    requiredDocuments: ["12th/Graduation Marksheet", "KVPY/INSPIRE Exam Score", "Institution Enrollment Proof"],
    officialLink: "https://www.online-inspire.gov.in",
    description: "Research fellowship for highly talented students with aptitude for scientific research, now folded into the INSPIRE programme.",
    criteria: {
      minPercentage: 85,
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "nmmss",
    name: "National Means-cum-Merit Scholarship (NMMSS)",
    sponsor: "Ministry of Education",
    type: "Government",
    benefitAmount: "₹12,000/year (Class 9 to 12)",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Class 8 Marksheet", "NMMSS Exam Scorecard"],
    officialLink: "https://scholarships.gov.in",
    description: "Scholarship for meritorious students from economically weaker sections to arrest dropouts at Class 8 and encourage continuation up to Class 12.",
    criteria: {
      maxIncome: 350000,
      educationLevels: ["School"],
      minPercentage: 55
    }
  },

  // ─── STATE-SPECIFIC SCHOLARSHIPS ───────────────────────────────────
  {
    id: "maha-rajarshi-shahu",
    name: "Rajarshi Shahu Maharaj Scholarship (Maharashtra)",
    sponsor: "Govt of Maharashtra",
    type: "State-Specific",
    benefitAmount: "Full Tuition Fee Reimbursement + Exam Fees",
    deadline: "2026-12-31",
    requiredDocuments: ["Aadhaar Card", "Domicile Certificate", "Caste Certificate", "Income Certificate", "Fee Receipt"],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    description: "For OBC, VJNT, SBC students domiciled in Maharashtra pursuing professional courses with family income up to ₹8 Lakh.",
    criteria: {
      categories: ["OBC"],
      maxIncome: 800000,
      states: ["Maharashtra"],
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "maha-ebc",
    name: "EBC Fee Reimbursement Scheme (Maharashtra)",
    sponsor: "Govt of Maharashtra",
    type: "State-Specific",
    benefitAmount: "Up to ₹25,000 Tuition Fee Reimbursement",
    deadline: "2026-12-31",
    requiredDocuments: ["Aadhaar Card", "Domicile Certificate", "Income Certificate", "Fee Receipt"],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    description: "Fee reimbursement for economically backward class (open category) students domiciled in Maharashtra with family income under ₹8 Lakh.",
    criteria: {
      categories: ["General"],
      maxIncome: 800000,
      states: ["Maharashtra"],
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "ts-epass",
    name: "Telangana ePASS Scholarship",
    sponsor: "Govt of Telangana",
    type: "State-Specific",
    benefitAmount: "Full Tuition Fee + ₹10,000–₹20,000/year Maintenance",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Marksheet", "Bonafide Certificate"],
    officialLink: "https://telanganaepass.cgg.gov.in",
    description: "Post-matric scholarship for SC, ST, BC, EBC, Disabled, and Minority students of Telangana state.",
    criteria: {
      categories: ["SC", "ST", "OBC"],
      maxIncome: 200000,
      states: ["Telangana"],
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "karnataka-vidyasiri",
    name: "Karnataka Vidyasiri Scholarship",
    sponsor: "Govt of Karnataka",
    type: "State-Specific",
    benefitAmount: "₹10,000–₹20,000/year (varies by course)",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "SSC/HSC Marksheet"],
    officialLink: "https://karepass.cgg.gov.in",
    description: "Post-matric scholarship scheme for SC/ST/OBC Category-1 students of Karnataka pursuing professional and non-professional courses.",
    criteria: {
      categories: ["SC", "ST", "OBC"],
      maxIncome: 250000,
      states: ["Karnataka"],
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "up-scholarship",
    name: "Uttar Pradesh Post-Matric Scholarship",
    sponsor: "Govt of Uttar Pradesh",
    type: "State-Specific",
    benefitAmount: "Full Tuition Fee + Maintenance Allowance",
    deadline: "2026-12-15",
    requiredDocuments: ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Fee Receipt", "Bank Passbook"],
    officialLink: "https://scholarship.up.gov.in",
    description: "Scholarship for SC/ST/OBC/General (EWS) students of UP pursuing post-matric and higher education courses.",
    criteria: {
      categories: ["SC", "ST", "OBC", "General"],
      maxIncome: 300000,
      states: ["Uttar Pradesh"],
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "kerala-snehapoorvam",
    name: "Snehapoorvam Scholarship (Kerala)",
    sponsor: "Kerala Social Security Mission",
    type: "State-Specific",
    benefitAmount: "₹300 - ₹1000 per month",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar", "Income Certificate", "Institution Certificate"],
    officialLink: "http://socialsecuritymission.gov.in/",
    description: "Financial support for orphans and vulnerable children living in families, from school up to degree level.",
    criteria: {
      states: ["Kerala"],
      educationLevels: ["School", "Undergraduate"]
    }
  },
  {
    id: "mp-awass",
    name: "Awas Sahayata Scheme (Madhya Pradesh)",
    sponsor: "Govt of Madhya Pradesh",
    type: "State-Specific",
    benefitAmount: "Up to ₹20,000/year for rent",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar", "Domicile Certificate", "SC/ST Certificate", "Rent Agreement"],
    officialLink: "https://scholarshipportal.mp.nic.in",
    description: "Housing/rent allowance for SC/ST students studying away from their hometowns in MP.",
    criteria: {
      categories: ["SC", "ST"],
      states: ["Madhya Pradesh"],
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "bihar-pms",
    name: "Bihar Post Matric Scholarship",
    sponsor: "Govt of Bihar",
    type: "State-Specific",
    benefitAmount: "Tuition Fee + Maintenance Allowance",
    deadline: "2026-12-31",
    requiredDocuments: ["Aadhaar", "Caste Certificate", "Income Certificate", "Bonafide Certificate"],
    officialLink: "https://pmsonline.bih.nic.in",
    description: "Scholarship for BC/EBC/SC/ST students of Bihar pursuing post-matriculation courses.",
    criteria: {
      categories: ["SC", "ST", "OBC"],
      maxIncome: 250000,
      states: ["Bihar"],
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "wb-kanyashree",
    name: "Kanyashree Prakalpa (West Bengal)",
    sponsor: "Govt of West Bengal",
    type: "State-Specific",
    benefitAmount: "₹25,000 one-time grant",
    deadline: "2026-08-31",
    requiredDocuments: ["Aadhaar", "Unmarried Declaration", "Bank Account Details", "Institution Certificate"],
    officialLink: "https://www.wbkanyashree.gov.in",
    description: "Financial assistance to girls to prevent child marriage and encourage higher education.",
    criteria: {
      genders: ["Female"],
      states: ["West Bengal"],
      educationLevels: ["School", "Undergraduate"]
    }
  },
  {
    id: "tn-bcmb",
    name: "BC/MBC/DNC Scholarship (Tamil Nadu)",
    sponsor: "Govt of Tamil Nadu",
    type: "State-Specific",
    benefitAmount: "Full Tuition Fee + Examination Fee Reimbursement",
    deadline: "2026-12-15",
    requiredDocuments: ["Aadhaar", "Caste Certificate", "Income Certificate", "Previous Marksheet"],
    officialLink: "https://www.bcmbcmw.tn.gov.in",
    description: "Scholarship for BC/MBC/DNC students pursuing degree/diploma/professional courses in TN.",
    criteria: {
      categories: ["OBC"],
      maxIncome: 200000,
      states: ["Tamil Nadu"],
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "rajasthan-cm",
    name: "Chief Minister Higher Education Scholarship (Rajasthan)",
    sponsor: "Govt of Rajasthan",
    type: "State-Specific",
    benefitAmount: "₹5,000/year (₹500/month for 10 months)",
    deadline: "2026-11-30",
    requiredDocuments: ["Aadhaar", "12th Marksheet", "Income Certificate", "Bhamashah/Jan Aadhaar Card"],
    officialLink: "https://hte.rajasthan.gov.in",
    description: "Merit-cum-need scholarship for students passing Rajasthan Board 12th exams and pursuing higher education.",
    criteria: {
      maxIncome: 250000,
      states: ["Rajasthan"],
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },

  // ─── PRIVATE & CORPORATE SCHOLARSHIPS ──────────────────────────────
  {
    id: "reliance-ug",
    name: "Reliance Foundation Undergraduate Scholarship",
    sponsor: "Reliance Foundation",
    type: "Private",
    benefitAmount: "Up to ₹2,00,000 over course duration",
    deadline: "2026-09-15",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "12th Marksheet", "Current Course Fee Receipt"],
    officialLink: "https://www.reliancefoundation.org",
    description: "Supports meritorious students from across India to pursue undergraduate education in STEM, humanities, and social sciences.",
    criteria: {
      minPercentage: 60,
      maxIncome: 1500000,
      educationLevels: ["Undergraduate"]
    }
  },
  {
    id: "reliance-pg",
    name: "Reliance Foundation Postgraduate Scholarship",
    sponsor: "Reliance Foundation",
    type: "Private",
    benefitAmount: "Up to ₹6,00,000 over PG duration",
    deadline: "2026-09-15",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Graduation Marksheet", "PG Admission Letter"],
    officialLink: "https://www.reliancefoundation.org",
    description: "Financial aid for students pursuing postgraduate studies in AI, Computer Science, Mathematics, and Electrical Engineering at premier institutions.",
    criteria: {
      minPercentage: 60,
      maxIncome: 1500000,
      educationLevels: ["Postgraduate"]
    }
  },
  {
    id: "tata-pankh",
    name: "Tata Capital Pankh Scholarship",
    sponsor: "Tata Capital",
    type: "Need-Based",
    benefitAmount: "Up to ₹50,000 (80% of Tuition Fees)",
    deadline: "2026-08-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Marksheet", "Admission Letter"],
    officialLink: "https://www.buddy4study.com/page/tata-capital-pankh-scholarship-program",
    description: "Financial aid to students from economically weaker sections to complete their graduation in any stream.",
    criteria: {
      minPercentage: 60,
      maxIncome: 400000,
      educationLevels: ["Diploma", "Undergraduate"]
    }
  },
  {
    id: "kotak-kanya",
    name: "Kotak Kanya Scholarship",
    sponsor: "Kotak Mahindra Group",
    type: "Need-Based",
    benefitAmount: "Up to ₹1,50,000/year for course duration",
    deadline: "2026-09-30",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "12th Marksheet", "Admission Proof"],
    officialLink: "https://www.buddy4study.com/page/kotak-kanya-scholarship",
    description: "Supports meritorious girl students from underprivileged families pursuing professional graduation courses.",
    criteria: {
      genders: ["Female"],
      minPercentage: 75,
      maxIncome: 600000,
      educationLevels: ["Undergraduate"]
    }
  },
  {
    id: "loreal-women-science",
    name: "L'Oréal India For Young Women in Science Scholarship",
    sponsor: "L'Oréal India",
    type: "Merit-Based",
    benefitAmount: "₹2,50,000 for BSc/BTech graduation studies",
    deadline: "2026-09-30",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "12th Marksheet", "Admission Letter in Science/Tech"],
    officialLink: "https://www.buddy4study.com/page/loreal-india-for-young-women-in-science-scholarship",
    description: "Encourages young women to pursue careers in science and technology by funding their BSc/BTech college degrees.",
    criteria: {
      genders: ["Female"],
      minPercentage: 85,
      maxIncome: 600000,
      educationLevels: ["Undergraduate"]
    }
  },
  {
    id: "aditya-birla",
    name: "Aditya Birla Scholarship",
    sponsor: "Aditya Birla Group",
    type: "Merit-Based",
    benefitAmount: "₹1,80,000/year for IIM/IIT/BITS/XLRI students",
    deadline: "2026-08-31",
    requiredDocuments: ["Admission Letter to IIM/IIT/BITS/XLRI/Law NLU", "10th & 12th Marksheets", "Entrance Exam Scorecard"],
    officialLink: "https://www.adityabirlascholars.net",
    description: "Prestigious scholarship for top-performing students admitted to IIMs, IITs, BITS Pilani, XLRI, and top NLUs.",
    criteria: {
      minPercentage: 85,
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "opjems",
    name: "O.P. Jindal Engineering & Management Scholarship (OPJEMS)",
    sponsor: "O.P. Jindal Group",
    type: "Merit-Based",
    benefitAmount: "₹1,25,000–₹3,00,000/year",
    deadline: "2026-09-30",
    requiredDocuments: ["Institute ID Card", "Marksheets", "OPJEMS Application Form"],
    officialLink: "https://www.opjems.com",
    description: "For meritorious students at top engineering and management institutions including IITs, NITs, and IIMs.",
    criteria: {
      minPercentage: 75,
      educationLevels: ["Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "sitaram-jindal",
    name: "Sitaram Jindal Foundation Scholarship",
    sponsor: "Sitaram Jindal Foundation",
    type: "Need-Based",
    benefitAmount: "₹1,500–₹12,000/month depending on course",
    deadline: "2026-10-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Marksheet", "Admission Letter"],
    officialLink: "https://www.sitaramjindalfoundation.org",
    description: "Financial support for meritorious and economically weak students pursuing ITI, diploma, graduation, and post-graduation.",
    criteria: {
      minPercentage: 60,
      maxIncome: 250000,
      educationLevels: ["Diploma", "Undergraduate", "Postgraduate"]
    }
  },
  {
    id: "samsung-star",
    name: "Samsung Star Scholar Program",
    sponsor: "Samsung India",
    type: "Private",
    benefitAmount: "₹1,00,000 one-time + mentorship + internship",
    deadline: "2026-10-15",
    requiredDocuments: ["12th Marksheet", "IIT/NIT JEE Score", "College Admission Proof"],
    officialLink: "https://www.samsung.com/in/about-us/sustainability/corporate-citizenship/",
    description: "For students admitted to IITs and NITs pursuing BTech in CS, EE, ECE, or Mechanical Engineering.",
    criteria: {
      minPercentage: 75,
      maxIncome: 450000,
      educationLevels: ["Undergraduate"]
    }
  },
  {
    id: "colgate-keep-india-smiling",
    name: "Colgate Keep India Smiling Scholarship",
    sponsor: "Colgate-Palmolive India",
    type: "Need-Based",
    benefitAmount: "Up to ₹75,000/year",
    deadline: "2026-08-31",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Marksheet", "Admission Letter"],
    officialLink: "https://www.buddy4study.com/page/colgate-keep-india-smiling-foundational-scholarship",
    description: "Need-based financial assistance for students from underprivileged backgrounds pursuing professional undergraduate degrees.",
    criteria: {
      minPercentage: 50,
      maxIncome: 500000,
      educationLevels: ["Diploma", "Undergraduate"]
    }
  },
  {
    id: "hdfc-badhte-kadam",
    name: "HDFC Bank Parivartan – Badhte Kadam Scholarship",
    sponsor: "HDFC Bank",
    type: "Need-Based",
    benefitAmount: "Up to ₹75,000/year",
    deadline: "2026-09-30",
    requiredDocuments: ["Aadhaar Card", "Income Certificate", "Marksheet", "Fee Receipt", "Disability Certificate (if applicable)"],
    officialLink: "https://www.buddy4study.com/page/hdfc-bank-parivartan-ecss-programme",
    description: "For economically underprivileged students, women, and students with disabilities pursuing school, diploma, or UG courses.",
    criteria: {
      minPercentage: 55,
      maxIncome: 300000,
      educationLevels: ["School", "Diploma", "Undergraduate"]
    }
  },

  // ─── INTERNATIONAL SCHOLARSHIPS ────────────────────────────────────
  {
    id: "inlaks-shivdasani",
    name: "Inlaks Shivdasani Foundation Scholarship",
    sponsor: "Inlaks Shivdasani Foundation",
    type: "International",
    benefitAmount: "Up to $100,000 USD (Fees + Living + Travel)",
    deadline: "2026-08-15",
    requiredDocuments: ["Curriculum Vitae (CV)", "Offer Letter", "Transcripts", "Two Letters of Recommendation"],
    officialLink: "https://www.inlaksfoundation.org",
    description: "Supports outstanding young Indian students to study at top universities in North America and Europe for Master's or PhD.",
    criteria: {
      educationLevels: ["Postgraduate", "PhD"],
      minPercentage: 70,
      maxAge: 30
    }
  },
  {
    id: "narotam-sekhsaria",
    name: "Narotam Sekhsaria Scholarship for Higher Studies Abroad",
    sponsor: "Narotam Sekhsaria Foundation",
    type: "International",
    benefitAmount: "Interest-free loan up to ₹20,00,000",
    deadline: "2026-04-30",
    requiredDocuments: ["GRE/GMAT Scores", "Offer Letter from Foreign University", "Graduation Marksheet", "SOP"],
    officialLink: "https://www.nsfroundation.co.in",
    description: "Interest-free loans for meritorious Indian students admitted to top-ranked universities abroad for postgraduate studies.",
    criteria: {
      educationLevels: ["Postgraduate"],
      minPercentage: 65,
      maxAge: 30
    }
  },
  {
    id: "tata-trusts-overseas",
    name: "J.N. Tata Endowment Loan Scholarship",
    sponsor: "J.N. Tata Endowment Trust",
    type: "International",
    benefitAmount: "Loan ₹10,00,000 + Gift up to ₹7,50,000 (on merit)",
    deadline: "2026-03-15",
    requiredDocuments: ["Graduation Marksheet", "Foreign University Offer Letter", "GRE/GMAT/IELTS Score", "SOP"],
    officialLink: "https://www.jntataendowment.org",
    description: "One of India's oldest scholarship trusts, providing loan scholarships to Indian graduates for higher studies abroad with partial gift-based conversion.",
    criteria: {
      educationLevels: ["Postgraduate", "PhD"],
      minPercentage: 60,
      maxAge: 45
    }
  },
  {
    id: "fulbright-nehru",
    name: "Fulbright-Nehru Master's Fellowship",
    sponsor: "United States-India Educational Foundation (USIEF)",
    type: "International",
    benefitAmount: "Full Tuition + Living Expenses + J-1 Visa + Travel (2 years)",
    deadline: "2026-06-15",
    requiredDocuments: ["Graduation Degree", "GRE Score", "TOEFL/IELTS Score", "3 Letters of Recommendation", "SOP"],
    officialLink: "https://www.usief.org.in",
    description: "Fully-funded fellowship for outstanding Indian professionals and students to pursue a Master's degree at select US universities.",
    criteria: {
      educationLevels: ["Postgraduate"],
      minPercentage: 60,
      maxAge: 30
    }
  },
  {
    id: "commonwealth-uk",
    name: "Commonwealth Scholarship (UK)",
    sponsor: "UK Foreign & Commonwealth Office",
    type: "International",
    benefitAmount: "Full Tuition + Living + Travel + Thesis Grant (UK University)",
    deadline: "2026-12-01",
    requiredDocuments: ["Bachelor's Degree", "English Proficiency (IELTS 6.5+)", "2 References", "Study Plan"],
    officialLink: "https://cscuk.fcdo.gov.uk",
    description: "Fully-funded scholarship for students from Commonwealth countries to pursue Master's or PhD at UK universities.",
    criteria: {
      educationLevels: ["Postgraduate", "PhD"],
      minPercentage: 60,
      maxAge: 40
    }
  },
  {
    id: "chevening-uk",
    name: "Chevening Scholarship (UK)",
    sponsor: "UK Government / Foreign & Commonwealth Office",
    type: "International",
    benefitAmount: "Full Tuition + Monthly Stipend £1,133+ + Travel + Visa",
    deadline: "2026-11-07",
    requiredDocuments: ["Bachelor's Degree", "2+ Years Work Experience", "English Proficiency", "3 University Choices"],
    officialLink: "https://www.chevening.org",
    description: "The UK Government's flagship global scholarship for emerging leaders to study one-year Master's at any UK university.",
    criteria: {
      educationLevels: ["Postgraduate"],
      minPercentage: 55
    }
  },
  {
    id: "australia-awards",
    name: "Australia Awards Scholarships",
    sponsor: "Department of Foreign Affairs and Trade (Australia)",
    type: "International",
    benefitAmount: "Full Tuition + Return Air Travel + Living Allowance + Health Cover",
    deadline: "2026-04-30",
    requiredDocuments: ["Degree Certificate", "English Proficiency (IELTS/PTE)", "Work Experience Proof", "Referee Reports"],
    officialLink: "https://www.dfat.gov.au/people-to-people/australia-awards",
    description: "Long-term awards administered by the Department of Foreign Affairs and Trade for study in Australia.",
    criteria: {
      educationLevels: ["Undergraduate", "Postgraduate", "PhD"],
      minPercentage: 60,
      maxAge: 45
    }
  },
  {
    id: "vanier-canada",
    name: "Vanier Canada Graduate Scholarships",
    sponsor: "Government of Canada",
    type: "International",
    benefitAmount: "$50,000 CAD per year for three years",
    deadline: "2026-11-01",
    requiredDocuments: ["Transcripts", "Research Proposal", "Leadership Reference", "Institutional Nomination"],
    officialLink: "https://vanier.gc.ca/en/home-accueil.html",
    description: "Highly prestigious scholarship for doctoral students studying at Canadian universities.",
    criteria: {
      educationLevels: ["PhD"],
      minPercentage: 80
    }
  },
  {
    id: "erasmus-mundus",
    name: "Erasmus Mundus Joint Masters Scholarships",
    sponsor: "European Union",
    type: "International",
    benefitAmount: "Full Tuition + €1,000/month Living Allowance + Travel",
    deadline: "2026-02-15",
    requiredDocuments: ["Bachelor's Degree", "Motivation Letter", "CV (Europass)", "Recommendation Letters"],
    officialLink: "https://erasmus-plus.ec.europa.eu/",
    description: "Prestigious integrated, international study programmes jointly delivered by an international consortium of European higher education institutions.",
    criteria: {
      educationLevels: ["Postgraduate"],
      minPercentage: 65
    }
  },
  {
    id: "eiffel-france",
    name: "Eiffel Excellence Scholarship (France)",
    sponsor: "French Ministry for Europe and Foreign Affairs",
    type: "International",
    benefitAmount: "Monthly allowance of €1,181 (Master's) + Travel + Health Insurance",
    deadline: "2026-01-10",
    requiredDocuments: ["Academic Transcripts", "Language Certificate", "Motivation Letter", "French Institution Nomination"],
    officialLink: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    description: "Attracts top foreign students to enroll in French higher education institutions at master's and PhD levels.",
    criteria: {
      educationLevels: ["Postgraduate", "PhD"],
      minPercentage: 70,
      maxAge: 30
    }
  }
];

export function checkEligibility(profile: StudentProfile, scholarship: Scholarship): MatchResult {
  const reasons: string[] = [];
  const steps: string[] = [];
  let score = 100;
  
  // Normalize GPA if needed (if <= 10, scale to 100)
  const studentMarks = profile.percentageOrCgpa <= 10 ? profile.percentageOrCgpa * 9.5 : profile.percentageOrCgpa;

  // 1. Age criteria
  if (scholarship.criteria.minAge && profile.age < scholarship.criteria.minAge) {
    score -= 25;
    reasons.push(`Minimum age required is ${scholarship.criteria.minAge} (You are ${profile.age})`);
  }
  if (scholarship.criteria.maxAge && profile.age > scholarship.criteria.maxAge) {
    score -= 25;
    reasons.push(`Maximum age limit is ${scholarship.criteria.maxAge} (You are ${profile.age})`);
  }

  // 2. Gender criteria
  if (scholarship.criteria.genders && !scholarship.criteria.genders.includes(profile.gender)) {
    score -= 40;
    reasons.push(`This scholarship is reserved for: ${scholarship.criteria.genders.join(', ')}`);
  }

  // 3. State criteria
  if (scholarship.criteria.states && !scholarship.criteria.states.includes(profile.state)) {
    score -= 30;
    reasons.push(`Only available to residents of: ${scholarship.criteria.states.join(', ')} (You are in ${profile.state})`);
    steps.push(`Look for scholarships specific to your home state: ${profile.state}.`);
  }

  // 4. Caste Category criteria
  if (scholarship.criteria.categories && !scholarship.criteria.categories.includes(profile.category)) {
    score -= 35;
    reasons.push(`Category reservation: ${scholarship.criteria.categories.join(', ')} (Your category: ${profile.category})`);
  }

  // 5. Income criteria
  if (scholarship.criteria.maxIncome && profile.familyIncome > scholarship.criteria.maxIncome) {
    score -= 40;
    reasons.push(`Annual income limit is ₹${scholarship.criteria.maxIncome.toLocaleString()} (Your income: ₹${profile.familyIncome.toLocaleString()})`);
    steps.push("Submit an official income certificate highlighting dependent assets or apply for merit-based only awards.");
  }

  // 6. Education Level criteria
  if (scholarship.criteria.educationLevels && !scholarship.criteria.educationLevels.includes(profile.educationLevel)) {
    score -= 30;
    reasons.push(`Available for: ${scholarship.criteria.educationLevels.join(', ')} level (You are ${profile.educationLevel})`);
  }

  // 7. Academic Mark criteria
  if (scholarship.criteria.minPercentage && studentMarks < scholarship.criteria.minPercentage) {
    score -= 30;
    reasons.push(`Minimum grade requirement: ${scholarship.criteria.minPercentage}% (Your grade: ${studentMarks}%)`);
    steps.push(`Maintain or raise your academic standing above ${scholarship.criteria.minPercentage}% in your current semester.`);
  }

  // 8. Disability criteria
  if (scholarship.criteria.requiresDisability && !profile.disabilityStatus) {
    score -= 50;
    reasons.push("Only open to students with physical or learning disabilities");
  }

  // 9. Minority criteria
  if (scholarship.criteria.requiresMinority && !profile.minorityStatus) {
    score -= 40;
    reasons.push("Only open to religious or linguistic minority groups");
  }

  // If eligible, make sure score is high, otherwise cap it
  const isEligible = reasons.length === 0;
  if (!isEligible) {
    score = Math.max(10, score);
  } else {
    // Give bonus match details if student is exceptionally high achieving or low income
    if (studentMarks >= 90) score = 100;
    else score = Math.min(98, 70 + Math.round((studentMarks - 50) * 0.6));
  }

  // Default steps if eligible
  if (isEligible) {
    steps.push("Gather your required documents: " + scholarship.requiredDocuments.join(', ') + ".");
    steps.push(`Draft a Statement of Purpose (SOP) tailored for the sponsor: ${scholarship.sponsor}.`);
    steps.push(`Visit the official portal link to submit your details before ${scholarship.deadline}.`);
  }

  return {
    scholarship,
    isEligible,
    score,
    reasons,
    steps
  };
}

export function matchScholarships(profile: StudentProfile): { eligible: MatchResult[], ineligible: MatchResult[] } {
  const eligible: MatchResult[] = [];
  const ineligible: MatchResult[] = [];
  
  const scholarshipsList = [...SCHOLARSHIPS];
  
  for (const s of scholarshipsList) {
    const result = checkEligibility(profile, s);
    if (result.isEligible) {
      eligible.push(result);
    } else {
      ineligible.push(result);
    }
  }

  // Sort eligible by score desc
  eligible.sort((a, b) => b.score - a.score);
  // Sort ineligible by score desc
  ineligible.sort((a, b) => b.score - a.score);

  return { eligible, ineligible };
}

// Fallback profile if localStorage is empty
export const DEFAULT_PROFILE: StudentProfile = {
  name: "Arjun Sharma",
  age: 20,
  gender: "Male",
  state: "Maharashtra",
  category: "OBC",
  familyIncome: 180000,
  educationLevel: "Undergraduate",
  currentCourse: "B.Tech in Computer Science",
  percentageOrCgpa: 82,
  disabilityStatus: false,
  minorityStatus: false
};
