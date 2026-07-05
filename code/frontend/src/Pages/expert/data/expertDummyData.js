// src/data/expertDummyData.js
// Dummy data used when no Firebase user is logged in (dev / demo mode)

const now = new Date();
const days = (n) => new Date(now.getTime() + n * 86400000);

export const DUMMY_PROFILE = {
  id: 'demo-expert-1',
  name: 'Dr. Chamara Perera',
  specialization: 'Soil Science & Crop Management',
  experience: 12,
  bio: 'PhD in Agricultural Sciences from University of Peradeniya. Specializing in sustainable rice cultivation and soil health management across Sri Lanka\'s wet zone.',
  availVideo: true,
  availPhone: true,
  availChat: false,
  rating: 4.8,
};

export const DUMMY_STATS = {
  totalConsultations: 47,
  thisMonth: 8,
  rating: 4.8,
  activeFarmers: 12,
};

export const DUMMY_CONSULTATIONS = [
  {
    id: 'c1',
    topic: 'Rice Crop Disease Identification',
    farmerName: 'Sunil Jayawardena',
    type: 'video',
    status: 'pending',
    scheduledAt: days(1),
    district: 'Kurunegala',
  },
  {
    id: 'c2',
    topic: 'Soil pH Testing & Fertilizer Advice',
    farmerName: 'Priya Kumari',
    type: 'phone',
    status: 'confirmed',
    scheduledAt: days(2),
    district: 'Kandy',
  },
  {
    id: 'c3',
    topic: 'Paddy Field Irrigation Planning',
    farmerName: 'Nimal Fernando',
    type: 'chat',
    status: 'pending',
    scheduledAt: days(3),
    district: 'Polonnaruwa',
  },
  {
    id: 'c4',
    topic: 'Pest Control for Vegetable Farm',
    farmerName: 'Kasun Rathnayake',
    type: 'video',
    status: 'confirmed',
    scheduledAt: days(-1),
    district: 'Gampaha',
  },
];

export const DUMMY_QUESTIONS = [
  {
    id: 'q1',
    question: 'My paddy leaves are turning yellow from the tips. What could be causing this and how can I fix it?',
    farmerName: 'Sunil Jayawardena',
    replyCount: 2,
    createdAt: new Date(now.getTime() - 2 * 3600000),
    tags: ['rice', 'disease'],
  },
  {
    id: 'q2',
    question: 'What is the best time to apply urea fertilizer for maize crops in the dry zone?',
    farmerName: 'Anura Silva',
    replyCount: 0,
    createdAt: new Date(now.getTime() - 5 * 3600000),
    tags: ['maize', 'fertilizer'],
  },
  {
    id: 'q3',
    question: 'How do I control whitefly infestation on my tomato plants organically?',
    farmerName: 'Dilani Perera',
    replyCount: 1,
    createdAt: new Date(now.getTime() - 86400000),
    tags: ['tomato', 'pest'],
  },
  {
    id: 'q4',
    question: 'Is it safe to plant brinjal immediately after a rice crop without fallow period?',
    farmerName: 'Rohan Bandara',
    replyCount: 3,
    createdAt: new Date(now.getTime() - 2 * 86400000),
    tags: ['crop rotation'],
  },
];

export const DUMMY_ARTICLES = [
  {
    id: 'a1',
    title: 'Best Practices for Wet Season Rice Cultivation in Sri Lanka',
    content: 'Comprehensive guide covering land preparation, seed selection, water management and pest control...',
    views: 1240,
    likes: 87,
    createdAt: new Date('2025-12-10'),
  },
  {
    id: 'a2',
    title: 'Understanding Soil pH and Its Effect on Crop Yield',
    content: 'Soil pH is one of the most critical factors affecting nutrient availability...',
    views: 834,
    likes: 61,
    createdAt: new Date('2025-11-22'),
  },
  {
    id: 'a3',
    title: 'Organic Pest Control Methods for Smallholder Farmers',
    content: 'Affordable and eco-friendly pest control strategies using locally available materials...',
    views: 612,
    likes: 44,
    createdAt: new Date('2026-01-05'),
  },
];

export const DUMMY_FARMERS = [
  { id: 'f1', name: 'Sunil Jayawardena', cropType: 'Rice & Vegetables', location: 'Kurunegala', status: 'active', sessions: 6 },
  { id: 'f2', name: 'Priya Kumari', cropType: 'Tea & Spices', location: 'Kandy', status: 'active', sessions: 3 },
  { id: 'f3', name: 'Nimal Fernando', cropType: 'Paddy', location: 'Polonnaruwa', status: 'active', sessions: 8 },
  { id: 'f4', name: 'Kasun Rathnayake', cropType: 'Mixed Vegetables', location: 'Gampaha', status: 'inactive', sessions: 2 },
];

export const DUMMY_OVERVIEW = {
  stats: DUMMY_STATS,
  consultations: DUMMY_CONSULTATIONS.slice(0, 3),
  questions: DUMMY_QUESTIONS.slice(0, 3),
};
