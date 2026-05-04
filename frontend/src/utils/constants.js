// frontend/src/utils/constants.js
export const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const RESOURCE_TYPES = [
  { value: 'syllabus', label: 'Syllabus', icon: '📋' },
  { value: 'notes', label: 'Notes', icon: '📝' },
  { value: 'question_paper', label: 'Question Paper', icon: '📄' },
  { value: 'lab_schedule', label: 'Lab Schedule', icon: '🔬' },
  { value: 'event', label: 'Event', icon: '📅' },
];

export const ACHIEVEMENTS = [
  { id: 'first_login', title: 'Welcome!', description: 'First login to the platform', icon: '👋', points: 10 },
  { id: 'first_question', title: 'Questioner', description: 'Generate your first question', icon: '❓', points: 20 },
  { id: 'streak_3', title: '3-Day Streak', description: 'Study for 3 consecutive days', icon: '🔥', points: 30 },
  { id: 'streak_7', title: 'Weekly Warrior', description: '7-day study streak', icon: '⚡', points: 50 },
  { id: 'streak_30', title: 'Monthly Master', description: '30-day study streak', icon: '👑', points: 100 },
  { id: 'questions_10', title: 'Quiz Creator', description: 'Generate 10 questions', icon: '✍️', points: 25 },
  { id: 'questions_50', title: 'Question Bank', description: 'Generate 50 questions', icon: '📚', points: 50 },
  { id: 'pomodoro_10', title: 'Focus Master', description: 'Complete 10 Pomodoro sessions', icon: '🍅', points: 40 },
  { id: 'resources_20', title: 'Knowledge Seeker', description: 'Access 20 resources', icon: '🔍', points: 30 },
  { id: 'discussions_5', title: 'Collaborator', description: 'Join 5 discussions', icon: '💬', points: 20 },
];

export const STUDY_TIPS = [
  'Take regular breaks using the Pomodoro technique',
  'Review your notes within 24 hours of learning',
  'Teach concepts to others to reinforce understanding',
  'Use active recall instead of passive reading',
  'Create mind maps for complex topics',
  'Practice with past question papers',
  'Study in a distraction-free environment',
  'Set specific goals for each study session',
];

export const APP_VERSION = '2.0.0';
export const APP_NAME = 'Smart Academic Portal';
export const TEAM_NAME = 'Mystic Coders';