export interface AssignmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
  content?: string; // Text / source code content if it's a code or text file
  isCode?: boolean;
  language?: string; // e.g. 'java', 'python', 'javascript', 'cpp', 'sql', etc.
  lineCount?: number;
}

export type AssignmentStatus = 'pendente' | 'em_andamento' | 'entregue' | 'avaliado';

export interface Assignment {
  id: string;
  title: string;
  category: string;
  studentName: string;
  classGrade: string;
  dueDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  description: string;
  status: AssignmentStatus;
  grade?: number | null; // 0 to 10
  teacherNotes?: string;
  files: AssignmentFile[];
  codeSnippet?: string; // Embedded Java / source code directly in assignment
  codeLanguage?: string; // 'java' (default), 'python', 'cpp', 'csharp', 'javascript', 'sql', etc.
  codeFileName?: string; // e.g. 'Main.java', 'Calculadora.java'
  createdAt: string;
  updatedAt: string;
}

export interface JavaAnalysisResult {
  className?: string;
  packageName?: string;
  hasMainMethod: boolean;
  imports: string[];
  methods: string[];
  lineCount: number;
  syntaxStatus: 'valid' | 'warning' | 'error';
  diagnostics: string[];
}

export interface DatabaseStatus {
  engine: string;
  status: 'online' | 'optimizing' | 'offline';
  filePath: string;
  sizeBytes: number;
  totalAssignments: number;
  totalFiles: number;
  totalCategories: number;
  totalLogs: number;
  totalCodeFiles: number;
  totalJavaFiles: number;
  totalLinesOfCode: number;
  lastBackupTime?: string;
  tables: {
    name: string;
    records: number;
    description: string;
  }[];
}

export type ActivityActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'CREATE_ASSIGNMENT'
  | 'UPDATE_ASSIGNMENT'
  | 'DELETE_ASSIGNMENT'
  | 'UPLOAD_FILE'
  | 'DELETE_FILE'
  | 'EXPORT_DATA'
  | 'RESTORE_DB'
  | 'EXECUTE_CODE'
  | 'ANALYZE_CODE'
  | 'INVASION_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'BRUTE_FORCE_LOCKOUT'
  | 'MALICIOUS_INPUT_BLOCKED'
  | 'UNAUTHORIZED_ACCESS_BLOCKED';

export interface ActivityLog {
  id: string;
  action: ActivityActionType;
  entity: string;
  description: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  status: 'sucesso' | 'aviso' | 'erro';
  securityHash: string;
}

export interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  ip: string;
  timestamp: string;
  threatLevel: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface SecurityStatus {
  firewallActive: boolean;
  rateLimiterActive: boolean;
  wafActive: boolean;
  bruteForceProtectionActive: boolean;
  blockedAttemptsCount: number;
  totalRequestsChecked: number;
  lockedOutIPs: {
    ip: string;
    reason: string;
    lockedUntil: string;
    failedAttempts: number;
  }[];
  recentSecurityEvents: SecurityEvent[];
  rulesSummary: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    apiRateLimitPerMinute: number;
    codeRunLimitPerMinute: number;
    wafInspection: string;
  };
}

export interface StatsSummary {
  totalAssignments: number;
  totalFiles: number;
  totalSizeMB: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  evaluatedCount: number;
  overdueCount: number;
  categoryBreakdown: {
    category: string;
    count: number;
    completed: number;
    color?: string;
  }[];
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  iconName?: string;
}

export interface UserSession {
  token: string;
  username: string;
  role: string;
  loginTime: string;
  expiresAt: number;
}
