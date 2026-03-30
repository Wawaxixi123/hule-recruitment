// Mock data for Hule AI Recruitment Platform

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  level: string;
  status: "active" | "paused" | "closed" | "draft";
  headcount: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  salary?: string;
  aiScore?: number;
}

export interface WorkHistory {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationHistory {
  school: string;
  major: string;
  degree: string;
  period: string;
}

export interface InterviewRecord {
  round: string;
  date: string;
  interviewer: string;
  result: "pass" | "fail" | "pending";
  feedback?: string;
  score?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentTitle: string;
  currentCompany: string;
  experience: number;
  education: string;
  location: string;
  jobId: string;
  jobTitle: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  aiScore: number;
  aiScoreDetails: {
    coreSkills: number;
    businessMatch: number;
    projectComplexity: number;
    levelMatch: number;
    growthPotential: number;
    stability: number;
  };
  dimensions: Record<string, number>;
  evidence?: Record<string, string[]>;
  tags: string[];
  riskTags?: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  summary?: string;
  aiConclusion?: string;
  strengths?: string[];
  weaknesses?: string[];
  appliedAt: string;
  resumeUrl?: string;
  avatar?: string;
  manualScore?: number;
  manualNote?: string;
  skills?: string[];
  workHistory?: WorkHistory[];
  educationHistory?: EducationHistory[];
  interviews?: InterviewRecord[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  round: number;
  roundName: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  scheduledAt: string;
  duration?: number;
  interviewers: string[];
  type: "online" | "onsite" | "phone";
  score?: number;
  feedback?: string;
  questions?: InterviewQuestion[];
}

export interface InterviewQuestion {
  id: string;
  type: "basic" | "deep" | "reverse" | "risk" | "management" | "business";
  question: string;
  dimension: string;
  answer?: string;
  score?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: "official" | "team" | "personal";
  category: string;
  usageCount: number;
  accuracy?: number;
  status: "published" | "draft" | "reviewing";
  author: string;
  createdAt: string;
  tags: string[];
}

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: "job-001",
    title: "高级AI产品经理",
    department: "产品部",
    location: "北京",
    type: "full-time",
    level: "P7",
    status: "active",
    headcount: 2,
    applied: 48,
    shortlisted: 12,
    interviewed: 6,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-15",
    skills: ["产品规划", "AI/ML", "数据分析", "用户研究", "敏捷开发"],
    salary: "30-50K",
    aiScore: 92,
    description: "负责AI产品线的规划与落地，推动AI能力在产品中的深度应用。",
    requirements: [
      "5年以上产品经理经验",
      "有AI/ML产品经验优先",
      "强数据分析能力",
      "优秀的跨部门协作能力",
    ],
  },
  {
    id: "job-002",
    title: "机器学习工程师",
    department: "技术部",
    location: "上海",
    type: "full-time",
    level: "P6",
    status: "active",
    headcount: 3,
    applied: 73,
    shortlisted: 18,
    interviewed: 8,
    createdAt: "2024-02-20",
    updatedAt: "2024-03-10",
    skills: ["Python", "PyTorch", "NLP", "推荐系统", "大模型"],
    salary: "35-60K",
    aiScore: 88,
    description: "负责核心算法研发，推动大模型在招聘场景的落地应用。",
    requirements: [
      "3年以上ML工程师经验",
      "熟悉PyTorch/TensorFlow",
      "有NLP项目经验",
      "计算机相关专业硕士及以上",
    ],
  },
  {
    id: "job-003",
    title: "HRBP",
    department: "人力资源部",
    location: "北京",
    type: "full-time",
    level: "P5",
    status: "active",
    headcount: 1,
    applied: 31,
    shortlisted: 8,
    interviewed: 4,
    createdAt: "2024-03-05",
    updatedAt: "2024-03-18",
    skills: ["招聘管理", "员工关系", "组织发展", "数据分析"],
    salary: "20-35K",
    aiScore: 85,
    description: "支持业务部门的人才招募与员工发展，推动HR数字化转型。",
    requirements: [
      "3年以上HRBP经验",
      "熟悉互联网行业",
      "有招聘系统使用经验",
      "优秀的沟通协调能力",
    ],
  },
  {
    id: "job-004",
    title: "前端工程师",
    department: "技术部",
    location: "深圳",
    type: "full-time",
    level: "P5",
    status: "active",
    headcount: 2,
    applied: 56,
    shortlisted: 14,
    interviewed: 5,
    createdAt: "2024-02-28",
    updatedAt: "2024-03-12",
    skills: ["React", "TypeScript", "Next.js", "性能优化", "设计系统"],
    salary: "25-45K",
    aiScore: 90,
  },
  {
    id: "job-005",
    title: "数据分析师",
    department: "数据部",
    location: "北京",
    type: "full-time",
    level: "P5",
    status: "paused",
    headcount: 1,
    applied: 22,
    shortlisted: 5,
    interviewed: 2,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
    skills: ["SQL", "Python", "数据可视化", "A/B测试", "商业分析"],
    salary: "20-35K",
    aiScore: 78,
  },
];

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: "cand-001",
    name: "李明远",
    email: "liming@example.com",
    phone: "138****8888",
    currentTitle: "高级产品经理",
    currentCompany: "字节跳动",
    experience: 6,
    education: "北京大学 · 计算机科学 · 硕士",
    location: "北京",
    jobId: "job-001",
    jobTitle: "高级AI产品经理",
    status: "interview",
    aiScore: 91,
    aiScoreDetails: {
      coreSkills: 92,
      businessMatch: 88,
      projectComplexity: 90,
      levelMatch: 95,
      growthPotential: 87,
      stability: 82,
    },
    tags: ["AI产品", "数据驱动", "跨部门协作", "大厂背景"],
    riskTags: ["跳槽频率偏高"],
    recommendation: "strong_yes",
    summary: "具备扎实的AI产品经验，在字节跳动主导过多个亿级用户产品的AI化改造，数据分析能力突出，与岗位高度匹配。",
    aiConclusion: "李明远在字节跳动担任高级产品经理6年，主导过今日头条、抖音等亿级用户产品的AI推荐系统改造，核心技能与岗位高度匹配。数据分析能力突出，曾通过A/B测试将推荐点击率提升23%。主要风险在于跳槽频率偏高（3年3家），建议在面试中重点探讨职业规划稳定性。综合评估：强烈推荐进入终面。",
    dimensions: { coreSkill: 92, businessMatch: 88, projectComplexity: 90, levelMatch: 95, growthPotential: 87, stability: 72 },
    evidence: {
      coreSkill: ["主导今日头条推荐系统AI化改造，DAU提升15%", "具备Python数据分析能力，熟悉ML产品化流程", "发表过2篇AI产品设计相关文章"],
      businessMatch: ["6年互联网产品经验，与岗位要求高度吻合", "有AI/ML产品从0到1的完整经历"],
      stability: ["3年内换了3家公司，平均在职时长约1年", "需要在面试中确认离职原因"]
    },
    strengths: ["AI产品规划经验丰富", "数据分析能力强", "有大规模团队协作经验"],
    weaknesses: ["跳槽频率略高（3年3家）", "管理经验相对有限"],
    skills: ["AI产品规划", "数据分析", "用户研究", "A/B测试", "Python", "跨部门协作"],
    workHistory: [
      { title: "高级产品经理", company: "字节跳动", period: "2021.06 - 至今", description: "负责今日头条推荐系统AI化改造，主导多个亿级用户产品的AI功能落地，通过A/B测试将推荐点击率提升23%。" },
      { title: "产品经理", company: "快手", period: "2020.03 - 2021.05", description: "负责短视频推荐算法产品化，与算法团队协作推动模型迭代，用户留存率提升18%。" },
      { title: "产品经理", company: "百度", period: "2018.07 - 2020.02", description: "参与搜索推荐产品设计，负责用户行为分析和产品迭代。" }
    ],
    educationHistory: [
      { school: "北京大学", major: "计算机科学", degree: "硕士", period: "2016 - 2018" },
      { school: "北京航空航天大学", major: "软件工程", degree: "本科", period: "2012 - 2016" }
    ],
    interviews: [
      { round: "HR初面", date: "2024-03-15", interviewer: "张晓雯", result: "pass", score: 88, feedback: "候选人表达清晰，AI产品经验丰富，对行业趋势有深刻理解。建议进入技术面。" }
    ],
    appliedAt: "2024-03-10",
  },
  {
    id: "cand-002",
    name: "王晓婷",
    email: "wangxt@example.com",
    currentTitle: "产品总监",
    currentCompany: "美团",
    experience: 8,
    education: "清华大学 · 工业工程 · 硕士",
    location: "北京",
    jobId: "job-001",
    jobTitle: "高级AI产品经理",
    status: "interview",
    aiScore: 87,
    aiScoreDetails: {
      coreSkills: 85,
      businessMatch: 90,
      projectComplexity: 88,
      levelMatch: 80,
      growthPotential: 92,
      stability: 95,
    },
    tags: ["战略思维", "团队管理", "业务增长", "O2O"],
    riskTags: ["AI专项经验偏少"],
    recommendation: "yes",
    summary: "管理经验丰富，业务理解深刻，但AI专项经验相对不足，需要在面试中重点验证AI能力。",
    aiConclusion: "王晓婷在美团担任产品总监8年，管理过15人产品团队，业务增长思维强，稳定性高。但AI专项经验相对不足，主要经验集中在O2O业务。建议在技术面重点验证其AI能力学习意愿和技术理解深度。综合评估：推荐进入下一轮。",
    dimensions: { coreSkill: 85, businessMatch: 90, projectComplexity: 88, levelMatch: 80, growthPotential: 92, stability: 95 },
    evidence: {
      businessMatch: ["8年互联网产品经验，业务理解深刻", "主导美团外卖增长产品，GMV提升40%"],
      coreSkill: ["AI专项经验相对不足，主要经验在O2O业务", "有数据分析经验但缺少ML产品化实践"]
    },
    strengths: ["管理经验丰富", "业务增长思维强", "稳定性高"],
    weaknesses: ["AI/ML专项经验不足", "技术背景相对薄弱"],
    skills: ["产品管理", "业务增长", "团队管理", "数据分析", "O2O产品"],
    workHistory: [
      { title: "产品总监", company: "美团", period: "2016.03 - 至今", description: "负责美团外卖增长产品线，管理15人产品团队，主导GMV提升40%的增长项目。" }
    ],
    educationHistory: [
      { school: "清华大学", major: "工业工程", degree: "硕士", period: "2014 - 2016" }
    ],
    interviews: [],
    appliedAt: "2024-03-08",
  },
  {
    id: "cand-003",
    name: "张宇轩",
    email: "zhangyx@example.com",
    currentTitle: "ML工程师",
    currentCompany: "阿里巴巴",
    experience: 4,
    education: "上海交通大学 · 人工智能 · 硕士",
    location: "上海",
    jobId: "job-002",
    jobTitle: "机器学习工程师",
    status: "screening",
    aiScore: 94,
    aiScoreDetails: {
      coreSkills: 96,
      businessMatch: 92,
      projectComplexity: 95,
      levelMatch: 90,
      growthPotential: 94,
      stability: 88,
    },
    tags: ["NLP", "大模型", "PyTorch", "推荐系统", "高潜力"],
    recommendation: "strong_yes",
    summary: "技术能力顶尖，在阿里主导了多个NLP和推荐系统项目，与岗位要求高度契合，是强推候选人。",
    aiConclusion: "张宇轩在阿里巴巴担任ML工程师4年，主导了多个NLP和推荐系统项目，技术能力顶尖。熟悉PyTorch、大模型微调等核心技术，与岗位要求高度契合。综合评估：强烈推荐，建议优先安排面试。",
    dimensions: { coreSkill: 96, businessMatch: 92, projectComplexity: 95, levelMatch: 90, growthPotential: 94, stability: 88 },
    evidence: {
      coreSkill: ["主导阿里NLP平台建设，服务10+业务线", "熟悉PyTorch、Transformer架构", "有大模型微调实战经验"]
    },
    strengths: ["核心技术能力突出", "大模型实战经验丰富", "项目复杂度高"],
    weaknesses: ["业务理解有待加强", "沟通表达需要验证"],
    skills: ["Python", "PyTorch", "NLP", "大模型", "推荐系统", "Transformer"],
    workHistory: [
      { title: "ML工程师", company: "阿里巴巴", period: "2020.07 - 至今", description: "负责NLP平台建设，主导大模型微调项目，服务10+业务线。" }
    ],
    educationHistory: [
      { school: "上海交通大学", major: "人工智能", degree: "硕士", period: "2018 - 2020" }
    ],
    interviews: [],
    appliedAt: "2024-03-12",
  },
  {
    id: "cand-004",
    name: "陈思雨",
    email: "chensy@example.com",
    currentTitle: "算法工程师",
    currentCompany: "腾讯",
    experience: 3,
    education: "浙江大学 · 计算机科学 · 硕士",
    location: "深圳",
    jobId: "job-002",
    jobTitle: "机器学习工程师",
    status: "screening",
    aiScore: 82,
    aiScoreDetails: {
      coreSkills: 85,
      businessMatch: 78,
      projectComplexity: 80,
      levelMatch: 88,
      growthPotential: 90,
      stability: 85,
    },
    tags: ["计算机视觉", "深度学习", "腾讯背景"],
    riskTags: ["NLP经验较少"],
    recommendation: "yes",
    summary: "技术基础扎实，但主要经验在CV方向，NLP经验相对不足，需要评估转型意愿和学习能力。",
    aiConclusion: "陈思雨技术基础扎实，腾讯3年CV方向经验，但NLP经验相对不足。建议在面试中重点评估其转型意愿和学习能力。综合评估：推荐，需要面试验证。",
    dimensions: { coreSkill: 85, businessMatch: 78, projectComplexity: 80, levelMatch: 88, growthPotential: 90, stability: 85 },
    evidence: {
      coreSkill: ["腾讯CV方向3年经验，技术基础扎实", "NLP项目经验较少，需要评估转型意愿"]
    },
    strengths: ["技术基础扎实", "学习能力强", "腾讯大厂经验"],
    weaknesses: ["NLP经验不足", "主方向与岗位有偏差"],
    skills: ["Python", "PyTorch", "计算机视觉", "深度学习", "TensorFlow"],
    workHistory: [
      { title: "算法工程师", company: "腾讯", period: "2021.07 - 至今", description: "负责CV算法研发，主导人脸识别和目标检测项目。" }
    ],
    educationHistory: [
      { school: "浙江大学", major: "计算机科学", degree: "硕士", period: "2019 - 2021" }
    ],
    interviews: [],
    appliedAt: "2024-03-11",
  },
  {
    id: "cand-005",
    name: "刘佳琪",
    email: "liujq@example.com",
    currentTitle: "HRBP",
    currentCompany: "滴滴",
    experience: 5,
    education: "中国人民大学 · 人力资源管理 · 本科",
    location: "北京",
    jobId: "job-003",
    jobTitle: "HRBP",
    status: "offer",
    aiScore: 89,
    aiScoreDetails: {
      coreSkills: 90,
      businessMatch: 88,
      projectComplexity: 85,
      levelMatch: 92,
      growthPotential: 86,
      stability: 90,
    },
    tags: ["招聘管理", "员工关系", "互联网经验", "数据分析"],
    recommendation: "strong_yes",
    summary: "HRBP经验丰富，在滴滴负责过技术团队的全流程招聘，熟悉互联网行业，与岗位高度匹配。",
    aiConclusion: "刘佳琪在滴滴担任HRBP 5年，负责技术团队全流程招聘，熟悉互联网行业招聘节奏，数据驱动思维强。与岗位高度匹配，综合评估：强烈推荐。",
    dimensions: { coreSkill: 90, businessMatch: 88, projectComplexity: 85, levelMatch: 92, growthPotential: 86, stability: 90 },
    evidence: {
      coreSkill: ["5年HRBP经验，负责过500人规模技术团队招聘", "熟悉互联网行业招聘节奏和候选人市场"]
    },
    strengths: ["HRBP经验丰富", "互联网行业背景", "数据驱动思维"],
    weaknesses: ["HR数字化工具使用经验有限"],
    skills: ["招聘管理", "员工关系", "组织发展", "数据分析", "HRIS系统"],
    workHistory: [
      { title: "HRBP", company: "滴滴出行", period: "2019.03 - 至今", description: "负责技术团队全流程招聘，管理500人规模团队的HR事务，推动HR数字化转型。" }
    ],
    educationHistory: [
      { school: "中国人民大学", major: "人力资源管理", degree: "本科", period: "2015 - 2019" }
    ],
    interviews: [
      { round: "HR初面", date: "2024-03-10", interviewer: "张晓雯", result: "pass", score: 90, feedback: "候选人经验丰富，与岗位高度匹配。" },
      { round: "业务面", date: "2024-03-15", interviewer: "部门总监", result: "pass", score: 88, feedback: "业务理解深刻，推荐进入终面。" }
    ],
    appliedAt: "2024-03-05",
  },
  {
    id: "cand-006",
    name: "赵鹏飞",
    email: "zhaopf@example.com",
    currentTitle: "前端架构师",
    currentCompany: "网易",
    experience: 7,
    education: "华中科技大学 · 软件工程 · 本科",
    location: "广州",
    jobId: "job-004",
    jobTitle: "前端工程师",
    status: "new",
    aiScore: 76,
    aiScoreDetails: {
      coreSkills: 88,
      businessMatch: 70,
      projectComplexity: 82,
      levelMatch: 65,
      growthPotential: 72,
      stability: 80,
    },
    tags: ["React", "架构设计", "性能优化"],
    riskTags: ["级别偏高", "薪资期望可能超出范围"],
    recommendation: "maybe",
    summary: "技术能力强，但当前级别偏高，薪资期望可能超出岗位范围，需要在面试中确认期望和意愿。",
    aiConclusion: "赵鹏飞技术能力强，但当前级别（前端架构师）与岗位（P5前端工程师）存在明显落差，薪资期望可能超出范围。建议在初面中直接确认薪资期望和降级意愿。综合评估：待定，需要面试确认。",
    dimensions: { coreSkill: 88, businessMatch: 70, projectComplexity: 82, levelMatch: 65, growthPotential: 72, stability: 80 },
    evidence: {
      levelMatch: ["当前职级为前端架构师，岗位要求P5，存在明显落差", "薪资期望可能超出岗位范围"]
    },
    strengths: ["技术能力突出", "架构经验丰富"],
    weaknesses: ["级别与岗位不匹配", "薪资期望风险"],
    skills: ["React", "TypeScript", "架构设计", "性能优化", "工程化"],
    workHistory: [
      { title: "前端架构师", company: "网易", period: "2017.03 - 至今", description: "负责前端架构设计，主导设计系统建设，推动前端工程化实践。" }
    ],
    educationHistory: [
      { school: "华中科技大学", major: "软件工程", degree: "本科", period: "2013 - 2017" }
    ],
    interviews: [],
    appliedAt: "2024-03-14",
  },
];

// Mock Interviews
export const mockInterviews: Interview[] = [
  {
    id: "int-001",
    candidateId: "cand-001",
    candidateName: "李明远",
    jobId: "job-001",
    jobTitle: "高级AI产品经理",
    round: 1,
    roundName: "HR初面",
    status: "completed",
    scheduledAt: "2024-03-15 14:00",
    duration: 60,
    interviewers: ["张晓雯"],
    type: "online",
    score: 88,
    feedback: "候选人表达清晰，AI产品经验丰富，对行业趋势有深刻理解。建议进入技术面。",
  },
  {
    id: "int-002",
    candidateId: "cand-001",
    candidateName: "李明远",
    jobId: "job-001",
    jobTitle: "高级AI产品经理",
    round: 2,
    roundName: "技术面",
    status: "scheduled",
    scheduledAt: "2024-03-20 15:00",
    interviewers: ["王工", "李总监"],
    type: "online",
  },
  {
    id: "int-003",
    candidateId: "cand-002",
    candidateName: "王晓婷",
    jobId: "job-001",
    jobTitle: "高级AI产品经理",
    round: 1,
    roundName: "HR初面",
    status: "completed",
    scheduledAt: "2024-03-14 10:00",
    duration: 45,
    interviewers: ["张晓雯"],
    type: "online",
    score: 82,
    feedback: "管理经验丰富，但AI专项能力需要进一步验证。",
  },
  {
    id: "int-004",
    candidateId: "cand-005",
    candidateName: "刘佳琪",
    jobId: "job-003",
    jobTitle: "HRBP",
    round: 3,
    roundName: "终面",
    status: "scheduled",
    scheduledAt: "2024-03-21 11:00",
    interviewers: ["HRD陈总"],
    type: "onsite",
  },
];

// Mock Skills
export const mockSkills: Skill[] = [
  {
    id: "skill-001",
    name: "AI产品经理核心能力评估",
    description: "专为AI产品经理岗位设计的综合评估模型，覆盖技术理解、产品思维、数据分析等核心维度。",
    type: "official",
    category: "产品",
    usageCount: 1248,
    accuracy: 87,
    status: "published",
    author: "葫乐官方",
    createdAt: "2024-01-01",
    tags: ["AI", "产品经理", "官方认证"],
  },
  {
    id: "skill-002",
    name: "机器学习工程师技术筛选",
    description: "基于大量ML工程师招聘数据训练的筛选模型，重点评估算法能力、工程实践和项目复杂度。",
    type: "official",
    category: "技术",
    usageCount: 892,
    accuracy: 91,
    status: "published",
    author: "葫乐官方",
    createdAt: "2024-01-01",
    tags: ["机器学习", "算法", "官方认证"],
  },
  {
    id: "skill-003",
    name: "互联网HRBP综合评估",
    description: "针对互联网行业HRBP岗位的专项评估，重点考察招聘管理、员工关系和数字化工具使用能力。",
    type: "team",
    category: "HR",
    usageCount: 234,
    accuracy: 83,
    status: "published",
    author: "张晓雯",
    createdAt: "2024-02-15",
    tags: ["HRBP", "互联网", "团队共享"],
  },
  {
    id: "skill-004",
    name: "高潜力候选人识别模型",
    description: "通过成长轨迹、学习能力、项目挑战度等维度识别高潜力候选人，适用于校招和社招。",
    type: "team",
    category: "通用",
    usageCount: 567,
    accuracy: 79,
    status: "published",
    author: "李HR总监",
    createdAt: "2024-02-01",
    tags: ["高潜力", "成长性", "通用"],
  },
  {
    id: "skill-005",
    name: "前端工程师技术深度评估",
    description: "评估前端工程师的技术深度，包括框架原理、性能优化、工程化实践等维度。",
    type: "personal",
    category: "技术",
    usageCount: 45,
    status: "draft",
    author: "张晓雯",
    createdAt: "2024-03-10",
    tags: ["前端", "React", "个人"],
  },
];

// Analytics data
export const analyticsData = {
  funnel: [
    { stage: "简历投递", count: 230, rate: 100 },
    { stage: "AI筛选通过", count: 87, rate: 37.8 },
    { stage: "HR初筛", count: 52, rate: 22.6 },
    { stage: "一面", count: 28, rate: 12.2 },
    { stage: "二面", count: 16, rate: 7.0 },
    { stage: "终面", count: 9, rate: 3.9 },
    { stage: "Offer", count: 6, rate: 2.6 },
  ],
  aiAdoptionRate: 73,
  manualCorrectionRate: 18,
  avgTimeToHire: 23,
  offerAcceptRate: 85,
  monthlyTrend: [
    { month: "10月", applications: 45, hires: 2 },
    { month: "11月", applications: 62, hires: 3 },
    { month: "12月", applications: 38, hires: 1 },
    { month: "1月", applications: 71, hires: 4 },
    { month: "2月", applications: 55, hires: 3 },
    { month: "3月", applications: 89, hires: 5 },
  ],
  skillHeatmap: [
    { skill: "Python", demand: 92, supply: 78 },
    { skill: "React", demand: 85, supply: 82 },
    { skill: "NLP", demand: 88, supply: 45 },
    { skill: "产品规划", demand: 76, supply: 68 },
    { skill: "数据分析", demand: 82, supply: 71 },
    { skill: "大模型", demand: 95, supply: 32 },
  ],
};
