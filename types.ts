
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  INSTALL = 'INSTALL',
  DATABASE = 'DATABASE',
  LOGIN = 'LOGIN',
  CONTACT = 'CONTACT'
}

export interface UserProfile {
  id: number;
  username: string;
  passwordHash: string; // SHA-256 Hash
  role: 'Athlete' | 'Coach' | 'Admin';
  created: string;
  avatarColor?: string;
  lastLogin?: string;
}

export interface Drill {
  name: string;
  reps: string;
  description: string;
  targetMuscle: string;
  audioGuidance?: string; // Text to speak
}

export interface TrainingDay {
  day: string; // "Mon", "Tue"
  focus: string; // "Explosive Power"
  drills: string[];
  intensity: 'Low' | 'Medium' | 'High';
}

export interface MuscleGroupStatus {
  muscle: string;
  status: 'Strong' | 'Average' | 'Weak';
  score: number; // 0-100
  observation: string;
}

export interface TimeSeriesPoint {
  time: string; // "00:01"
  velocity: number;
  force: number;
  efficiency: number;
}

export interface AdvancedMetrics {
  verticalOscillation: number; // cm
  strideRate: number; // spm
  groundContactTime: number; // ms
  symmetryScore: number; // %
  efficiencyIndex: number; // 0-100
  
  // Sport Specific - Soccer
  kickVelocity?: number; // km/h
  explosivePower?: number; // Watts
  plantFootStability?: number; // 0-100%
  shotAccuracyProb?: number; // 0-100%

  // Sport Specific - Swimming
  strokeLength?: number; // meters
  swolfScore?: number; // score
  hydrodynamicDrag?: number; // Coefficient (lower is better)
  catchEfficiency?: number; // %

  // Sport Specific - Boxing
  punchVelocity?: number; // m/s
  impactForce?: number; // Newtons
  reactionTime?: number; // ms
  guardIntegrity?: number; // 0-100%
  kineticChainEfficiency?: number; // % (Energy transfer)
  retractionSpeed?: number; // m/s (Defense)
  
  // Sport Specific - Athletics
  groundReactionForce?: number; // Multiplier of Bodyweight (e.g., 2.5x)
  elasticRecoil?: number; // %
}

export interface SkeletonPoint {
  x: number;
  y: number;
  confidence: number;
  label: 'head' | 'shoulder_l' | 'shoulder_r' | 'hip_l' | 'hip_r' | 'knee_l' | 'knee_r' | 'ankle_l' | 'ankle_r';
}

export type SportType = 'Athletics' | 'Swimming' | 'Soccer' | 'Boxing' | 'Other';

export interface BiomechanicsAnalysis {
  athleteType: SportType;
  summary: string;
  speedTips: string[];
  muscleGroups: MuscleGroupStatus[];
  suggestedDrills: Drill[];
  projectedImprovement: string;
  advancedMetrics?: AdvancedMetrics;
  timeSeriesData?: TimeSeriesPoint[]; // New: Temporal analysis
  trainingSchedule?: TrainingDay[]; // New: AI Periodization
  
  // Learning loop fields
  confidenceScore?: number;
  processingMethod?: 'Cloud Gemini' | 'Local Neural Engine' | 'Vector Vision v1.0';
}

export interface AnalysisRecord {
  id: number;
  userId: number; // Foreign Key
  date: string;
  data: BiomechanicsAnalysis;
  videoBlob?: Blob; // Store the actual video (if quota allows)
  userRating?: number; // 1-5 stars
  userFeedback?: string;
}

// Chart data types
export interface RadarDataPoint {
  subject: string;
  A: number; // Current
  fullMark: number;
}
