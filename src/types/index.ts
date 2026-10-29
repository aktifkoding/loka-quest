export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "player" | "educator" | "admin";
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface CulturalRegion {
  id: string;
  slug: string;
  name: string;
  description: string;
  geographic_context: string;
  image_url: string | null;
  sort_order: number;
  status: "draft" | "review" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CulturalContent {
  id: string;
  region_id: string;
  title: string;
  description: string;
  content_type: "tradition" | "artifact" | "practice" | "story";
  body: string;
  media_url: string | null;
  media_type: string | null;
  source_id: string | null;
  sort_order: number;
  status: "draft" | "review" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CulturalSource {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  year: number | null;
  url: string | null;
  license: string | null;
  attribution: string;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  region_id: string;
  slug: string;
  title: string;
  description: string;
  learning_objectives: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  xp_reward: number;
  status: "draft" | "review" | "published" | "archived";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MissionQuestion {
  id: string;
  mission_id: string;
  question_type: "multiple_choice" | "sequencing" | "matching" | "identification";
  prompt: string;
  options: Record<string, unknown>;
  correct_answer: Record<string, unknown>;
  explanation: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MissionAttempt {
  id: string;
  mission_id: string;
  profile_id: string;
  score: number;
  xp_earned: number;
  completed: boolean;
  answers: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: Record<string, unknown>;
  is_correct: boolean;
  created_at: string;
}

export interface PlayerProgress {
  id: string;
  profile_id: string;
  total_xp: number;
  missions_completed: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
  xp_bonus: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  profile_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface CulturalArtifact {
  id: string;
  name: string;
  description: string;
  region_id: string;
  image_url: string | null;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  created_at: string;
  updated_at: string;
}

export interface UserArtifact {
  id: string;
  profile_id: string;
  artifact_id: string;
  acquired_at: string;
}

export interface LearningAssessment {
  id: string;
  title: string;
  description: string;
  assessment_type: "pre" | "post";
  questions: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  profile_id: string;
  answers: Record<string, unknown>;
  score: number;
  submitted_at: string;
}

export interface EducatorGroup {
  id: string;
  name: string;
  description: string | null;
  educator_id: string;
  created_at: string;
  updated_at: string;
}

export interface EducatorGroupMember {
  id: string;
  group_id: string;
  profile_id: string;
  joined_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}
