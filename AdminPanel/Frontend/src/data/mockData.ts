// Mock data for Project Saaransh - MCA e-consultation feedback analysis

export interface Consultation {
  id: number;
  title: string;
  status: 'Analysis Complete' | 'In Progress' | 'Completed' | 'Draft' | 'Closed';
  submissions: number;
  endDate: string;
  progress_percentage : number;
  description?: string;
  publishDate?: string;
}

export interface Comment {
  id: number;
  submitter: string;
  stakeholderType: 'Law Firm' | 'NGO' | 'Individual' | 'Industry Body' | 'Consulting Firm' | 'Government';
  date: string;
  stance: 'Positive' | 'Negative' | 'Neutral';
  summary: string;
  confidenceScore_based_on_ensemble_model: number;
  originalText: string;
  keywords: string[];
  consultationId: number;
  language?: string;
}

export interface WordCloudData {
  image: string;
  alt: string;
}

export interface TrendData {
  name: string;
  'Data Privacy Concerns': number;
  'CSR Compliance': number;
}

export interface AccessLog {
  id: number;
  date: string;
  ip: string;
  location: string;
  device: string;
}

// Mock consultations data
export const consultations: Consultation[] = [
  {
    id: 1,
    title: 'Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt. of India',
    status: 'In Progress',
    submissions: 2,
    endDate: '2025-10-10',
    progress_percentage: 75,
    description: 'New guidelines for CSR implementation and reporting',
    publishDate: '2025-09-01'
  },
  {
    id: 2,
    title: 'Digital Competition Bill, 2025',
    status: 'Completed',
    submissions: 5,
    endDate: '2025-08-31',
    progress_percentage: 100,
    description: 'Proposed amendments to strengthen corporate governance and transparency',
    publishDate: '2025-07-15'
  },
  
  {
    id: 3,
    title: 'Companies Amendment Bill, 2025',
    status: 'Completed',
    submissions: 1,
    endDate: '2025-07-15',
    progress_percentage: 1,
    description: 'Amendments to improve the insolvency resolution process',
    publishDate: '2025-06-01'
  }
];

// Mock comments data
export const commentsData: Record<number, Comment[]> = {
  1: [
    {
      id: 101,
      submitter: 'Abhay Raj',
      stakeholderType: 'Individual',
      date: '2025-09-10',
      stance: 'Positive',
      summary: 'The user supports the bill',
      confidenceScore_based_on_ensemble_model: 4.9,
      originalText: 'we are agree with bill passed no objections',
      keywords: ['Agree', 'No Objections'],
      consultationId: 1
    },
    {
      id: 102,
      submitter: 'Green Earth Initiative',
      stakeholderType: 'NGO',
      date: '2025-09-10',
      stance: 'Neutral',
      summary: 'The proposed amendments to the Companies Act represent a significant shift in corporate governance frameworks. The proposed timeline for compliance may be too aggressive for smaller companies particularly those in emerging sectors. The additional reporting requirements will impose substantial compliance costs',
      confidenceScore_based_on_ensemble_model: 4.1,
      originalText: 'The new CSR rules are a welcome change.',
      keywords: ['Smaller Companies', 'Environment'],
      consultationId: 1
    }
    
  ],
  2: [
  {
    id: 201,
    submitter: 'Apex Law Associates',
    stakeholderType: 'Law Firm',
    date: '2025-08-15',
    stance: 'Negative',
    summary: 'Argues Section 185 amendments are overly restrictive for startups and suggests a higher threshold.',
    confidenceScore_based_on_ensemble_model: 4.8,
    originalText: 'To the Ministry of Corporate Affairs, Regarding the Draft Companies (Amendment) Bill, 2025, our firm wishes to express significant concerns about the proposed changes to Section 185...',
    keywords: ['Section 185', 'Director Loans', 'Startup Financing'],
    consultationId: 2
  },
  {
    id: 202,
    submitter: 'Good Governance Foundation',
    stakeholderType: 'NGO',
    date: '2025-08-20',
    stance: 'Positive',
    summary: 'Supports increased disclosure norms for related party transactions to enhance transparency.',
    confidenceScore_based_on_ensemble_model: 4.2,
    originalText: 'We at the Good Governance Foundation commend the Ministry for the proposed enhancements to disclosure norms...',
    keywords: ['Disclosure Norms', 'Transparency', 'Minority Shareholders'],
    consultationId: 2
  },
  {
    id: 203,
    submitter: 'Priya Sharma',
    stakeholderType: 'Individual',
    date: '2025-08-18',
    stance: 'Neutral',
    summary: 'Expresses concern about implementation of Section 145 for small businesses due to high compliance costs.',
    confidenceScore_based_on_ensemble_model: 3.5,
    originalText: 'Sir, Section 145 ka implementation aasan nahi hoga, especially small businesses ke liye. Isse compliance costs bahut badh jayenge...',
    language: 'Hinglish',
    keywords: ['Section 145', 'Small Businesses', 'Compliance Costs'],
    consultationId: 2
  },
  {
    id: 204,
    submitter: 'Federation of Indian Industries',
    stakeholderType: 'Industry Body',
    date: '2025-08-22',
    stance: 'Negative',
    summary: 'Proposes a centralized, government-managed pool for appointing independent directors.',
    confidenceScore_based_on_ensemble_model: 4.5,
    originalText: 'While we appreciate the intent behind the new rules for independent directors, we propose an alternative mechanism...',
    keywords: ['Independent Directors', 'Centralized Pool', 'Corporate Governance'],
    consultationId: 2
  },
  {
    id: 205,
    submitter: 'ABC Consulting',
    stakeholderType: 'Consulting Firm',
    date: '2025-08-25',
    stance: 'Neutral',
    summary: 'Seeks clarification on the definition of "significant beneficial owner" to avoid compliance challenges.',
    confidenceScore_based_on_ensemble_model: 4.0,
    originalText: 'We request clarification regarding the definition of "significant beneficial owner" (SBO)...',
    keywords: ['SBO', 'Clarification', 'Compliance'],
    consultationId: 2
  }
    
  ],
  3: [
    {
      id: 301,
      submitter: 'National Creditors Association',
      stakeholderType: 'Industry Body',
      date: '2025-07-10',
      stance: 'Negative',
      summary: 'Opposes the proposed changes to the IBC.',
      confidenceScore_based_on_ensemble_model: 4.9,
      originalText: 'The proposed amendments to the IBC fundamentally weaken the position of financial creditors.',
      keywords: ['IBC', 'Creditor Rights'],
      consultationId: 3
    }
  ]
};

// Word cloud data by consultation and stance
export const wordCloudData: Record<number, Record<string, WordCloudData[]>> = {
  1: {
    'All': [
      { image: '/data/WordCloud/1/All/wordcloud_all.png', alt: 'Word Cloud - All Sentiments' }
    ],
    'Positive': [
      { image: '/data/WordCloud/1/Positive/wordcloud_positive.png', alt: 'Word Cloud - Positive Sentiments' }
    ],
    'Negative': [
      { image: '/data/WordCloud/1/Negative/wordcloud_negative.png', alt: 'Word Cloud - Negative Sentiments' }
    ],
    'Neutral': [
      { image: '/data/WordCloud/1/Neutral/wordcloud_neutral.png', alt: 'Word Cloud - Neutral Sentiments' }
    ]
  },
  2: {
    'All': [
      { image: '/data/WordCloud/2/All/wordcloud_all.png', alt: 'Word Cloud - All Sentiments' }
    ],
    'Positive': [
      { image: '/data/WordCloud/2/Positive/wordcloud_positive.png', alt: 'Word Cloud - Positive Sentiments' }
    ],
    'Negative': [
      { image: '/data/WordCloud/2/Negative/wordcloud_negative.png', alt: 'Word Cloud - Negative Sentiments' }
    ],
    'Neutral': [
      { image: '/data/WordCloud/2/Neutral/wordcloud_neutral.png', alt: 'Word Cloud - Neutral Sentiments' }
    ]
  },
  3: {
    'All': [
      { image: '/data/WordCloud/3/All/wordcloud_all.png', alt: 'Word Cloud - All Sentiments' }
    ],
    'Positive': [
      { image: '/data/WordCloud/3/Positive/wordcloud_positive.png', alt: 'Word Cloud - Positive Sentiments' }
    ],
    'Negative': [
      { image: '/data/WordCloud/3/Negative/wordcloud_negative.png', alt: 'Word Cloud - Negative Sentiments' }
    ],
    'Neutral': [
      { image: '/data/WordCloud/3/Neutral/wordcloud_neutral.png', alt: 'Word Cloud - Neutral Sentiments' }
    ]
  }
};

// Trend analysis data
export const trendAnalysisData: TrendData[] = [
  { name: 'Jul 2025', 'Data Privacy Concerns': 2, 'CSR Compliance': 1 },
  { name: 'Aug 2025', 'Data Privacy Concerns': 3, 'CSR Compliance': 2 },
  { name: 'Sep 2025', 'Data Privacy Concerns': 2, 'CSR Compliance': 1 },
  { name: 'Oct 2025', 'Data Privacy Concerns': 1, 'CSR Compliance': 0 }
];

// Access logs data
export const accessLogs: AccessLog[] = [
  {
    id: 1,
    date: '2025-10-01 16:17:05',
    ip: '103.22.201.12',
    location: 'Delhi, India',
    device: 'Chrome on Windows'
  },
  {
    id: 2,
    date: '2025-09-19 11:45:12',
    ip: '103.22.201.12',
    location: 'Delhi, India',
    device: 'Chrome on Windows'
  },
  {
    id: 3,
    date: '2025-09-18 09:22:34',
    ip: '45.115.18.2',
    location: 'Mumbai, India',
    device: 'Safari on macOS'
  }
];

// Stance colors for consistent theming
export const STANCE_COLORS = {
  'Positive': '#22c55e',
  'Negative': '#ef4444',
  'Neutral': '#f97316'
};

export const STANCE_BG_COLORS = {
  'Positive': 'bg-success/10 text-success border-success/20',
  'Negative': 'bg-destructive/10 text-destructive border-destructive/20',
  'Neutral': 'bg-warning/10 text-warning border-warning/20'
};
