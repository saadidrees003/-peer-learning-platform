/**
 * Enhanced student pairing algorithm with AI integration
 * Supports both traditional rule-based and AI-powered pairing strategies
 */

import AIPairingService from '../services/aiPairingService.js';

const aiService = new AIPairingService();

export const generatePairs = async (students, options = {}) => {
  const {
    pairingStrategy = 'optimal', // 'optimal', 'random', 'balanced', 'ai'
    maxPairSize = 2,
    allowOddGroups = true,
    aiOptions = {},
    additionalFactors = {},
    classContext = {},
    teacherPreferences = {}
  } = options;

  if (!students || students.length < 2) {
    throw new Error('At least 2 students required for pairing');
  }

  // AI-powered pairing
  if (pairingStrategy === 'ai') {
    try {
      return await aiService.generateAIPairs(students, {
        pairingGoals: aiOptions.pairingGoals || ['peer_tutoring'],
        additionalFactors,
        classContext,
        teacherPreferences
      });
    } catch (error) {
      console.warn('AI pairing failed, falling back to optimal strategy:', error);
      // Fall back to optimal strategy if AI fails
      return generateTraditionalPairs(students, { ...options, pairingStrategy: 'optimal' });
    }
  }

  // Traditional rule-based pairing
  return generateTraditionalPairs(students, options);
};

export const generateTraditionalPairs = (students, options = {}) => {
  const {
    pairingStrategy = 'optimal',
    maxPairSize = 2,
    allowOddGroups = true
  } = options;

  if (!students || students.length < 2) {
    throw new Error('At least 2 students required for pairing');
  }

  // Sort students by marks (ascending order)
  const sortedStudents = [...students].sort((a, b) => a.marks - b.marks);
  
  // Calculate performance categories
  const performanceStats = calculatePerformanceStats(sortedStudents);
  const categorizedStudents = categorizeStudents(sortedStudents, performanceStats);
  
  let pairs = [];
  
  switch (pairingStrategy) {
    case 'optimal':
      pairs = generateOptimalPairs(categorizedStudents);
      break;
    case 'balanced':
      pairs = generateBalancedPairs(categorizedStudents);
      break;
    case 'random':
      pairs = generateRandomPairs(sortedStudents);
      break;
    default:
      pairs = generateOptimalPairs(categorizedStudents);
  }

  // Handle odd number of students
  if (allowOddGroups && pairs.length * 2 < students.length) {
    const pairedStudentIds = new Set(pairs.flatMap(pair => pair.students.map(s => s.id)));
    const unpairedStudents = students.filter(s => !pairedStudentIds.has(s.id));
    
    if (unpairedStudents.length > 0) {
      // Add unpaired students to the most suitable existing pair or create a group of 3
      if (pairs.length > 0) {
        const lastPair = pairs[pairs.length - 1];
        unpairedStudents.forEach(student => {
          lastPair.students.push(student);
        });
        lastPair.size = lastPair.students.length;
        lastPair.type = lastPair.size === 3 ? 'group-of-3' : 'extended-pair';
      }
    }
  }

  // Add metadata to pairs
  pairs.forEach((pair, index) => {
    pair.id = `pair-${index + 1}`;
    pair.averageScore = calculateAverageScore(pair.students);
    pair.scoreGap = calculateScoreGap(pair.students);
    pair.recommendation = generateRecommendation(pair);
  });

  return {
    pairs,
    stats: {
      totalStudents: students.length,
      totalPairs: pairs.length,
      performanceStats,
      pairingStrategy
    }
  };
};

const calculatePerformanceStats = (sortedStudents) => {
  const marks = sortedStudents.map(s => s.marks);
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  const average = total / marks.length;
  
  const min = Math.min(...marks);
  const max = Math.max(...marks);
  const median = marks.length % 2 === 0
    ? (marks[marks.length / 2 - 1] + marks[marks.length / 2]) / 2
    : marks[Math.floor(marks.length / 2)];

  // Calculate standard deviation
  const variance = marks.reduce((sum, mark) => sum + Math.pow(mark - average, 2), 0) / marks.length;
  const stdDev = Math.sqrt(variance);

  return {
    min,
    max,
    average,
    median,
    stdDev,
    range: max - min
  };
};

const categorizeStudents = (sortedStudents, stats) => {
  const { average, stdDev } = stats;
  
  const categories = {
    low: [], // Below average - 0.5 * stdDev
    medium: [], // Around average
    high: [] // Above average + 0.5 * stdDev
  };

  sortedStudents.forEach(student => {
    if (student.marks < average - (0.5 * stdDev)) {
      categories.low.push({ ...student, category: 'low' });
    } else if (student.marks > average + (0.5 * stdDev)) {
      categories.high.push({ ...student, category: 'high' });
    } else {
      categories.medium.push({ ...student, category: 'medium' });
    }
  });

  return categories;
};

const generateOptimalPairs = (categorizedStudents) => {
  const { low, medium, high } = categorizedStudents;
  const pairs = [];
  
  // Create copies to avoid mutating original arrays
  const lowStudents = [...low];
  const mediumStudents = [...medium];
  const highStudents = [...high];

  // Strategy 1: Pair high performers with low performers
  while (lowStudents.length > 0 && highStudents.length > 0) {
    const lowStudent = lowStudents.shift();
    const highStudent = highStudents.pop(); // Take highest performing
    
    pairs.push({
      students: [lowStudent, highStudent],
      type: 'high-low',
      size: 2,
      rationale: 'High performer mentors low performer'
    });
  }

  // Strategy 2: Pair remaining medium performers with either high or low
  while (mediumStudents.length > 1) {
    const student1 = mediumStudents.shift();
    const student2 = mediumStudents.shift();
    
    pairs.push({
      students: [student1, student2],
      type: 'medium-medium',
      size: 2,
      rationale: 'Similar level collaboration'
    });
  }

  // Strategy 3: Handle remaining students
  const remaining = [...lowStudents, ...mediumStudents, ...highStudents];
  while (remaining.length > 1) {
    const student1 = remaining.shift();
    const student2 = remaining.shift();
    
    pairs.push({
      students: [student1, student2],
      type: 'mixed',
      size: 2,
      rationale: 'Mixed ability pairing'
    });
  }

  return pairs;
};

const generateBalancedPairs = (categorizedStudents) => {
  const allStudents = [
    ...categorizedStudents.low,
    ...categorizedStudents.medium,
    ...categorizedStudents.high
  ];
  
  // Shuffle for balanced distribution
  const shuffled = shuffleArray(allStudents);
  const pairs = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairs.push({
        students: [shuffled[i], shuffled[i + 1]],
        type: 'balanced',
        size: 2,
        rationale: 'Balanced random pairing'
      });
    }
  }
  
  return pairs;
};

const generateRandomPairs = (students) => {
  const shuffled = shuffleArray([...students]);
  const pairs = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      pairs.push({
        students: [shuffled[i], shuffled[i + 1]],
        type: 'random',
        size: 2,
        rationale: 'Random pairing'
      });
    }
  }
  
  return pairs;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateAverageScore = (students) => {
  const total = students.reduce((sum, student) => sum + student.marks, 0);
  return Math.round((total / students.length) * 100) / 100;
};

const calculateScoreGap = (students) => {
  if (students.length < 2) return 0;
  const marks = students.map(s => s.marks);
  const max = Math.max(...marks);
  const min = Math.min(...marks);
  return Math.round((max - min) * 100) / 100;
};

const generateRecommendation = (pair) => {
  const gap = pair.scoreGap;
  const avgScore = pair.averageScore;
  
  if (gap > 20) {
    return `High score gap (${gap} points) - Strong mentoring opportunity. Higher scorer should guide lower scorer.`;
  } else if (gap < 5) {
    return `Similar performance levels - Focus on collaborative problem-solving and peer review.`;
  } else if (avgScore > 80) {
    return `High-performing pair - Challenge them with advanced problems and peer teaching roles.`;
  } else if (avgScore < 50) {
    return `Both students need support - Consider additional teacher guidance alongside peer learning.`;
  } else {
    return `Balanced pairing - Encourage mutual support and knowledge sharing.`;
  }
};

export const regeneratePairs = async (students, currentPairs, options = {}) => {
  // Avoid previous pairings if possible
  const previousPairings = new Set();
  currentPairs.forEach(pair => {
    if (pair.students.length === 2) {
      const [s1, s2] = pair.students;
      previousPairings.add(`${s1.id}-${s2.id}`);
      previousPairings.add(`${s2.id}-${s1.id}`);
    }
  });

  // Try different strategies for regeneration
  const strategies = ['ai', 'balanced', 'optimal', 'random'];
  const excludeStrategy = options.currentStrategy || 'optimal';
  const availableStrategies = strategies.filter(s => s !== excludeStrategy);
  
  const selectedStrategy = availableStrategies[Math.floor(Math.random() * availableStrategies.length)];
  
  // Add context about previous pairings for AI
  const enhancedOptions = {
    ...options,
    pairingStrategy: selectedStrategy,
    teacherPreferences: {
      ...options.teacherPreferences,
      avoidPreviousPairings: Array.from(previousPairings),
      regenerationReason: 'Teacher requested different pairing approach'
    }
  };
  
  return await generatePairs(students, enhancedOptions);
};