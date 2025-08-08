import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend API
});

/**
 * AI-powered student pairing service
 * Uses Claude (Anthropic) to make intelligent pairing decisions based on multiple factors
 */
export class AIPairingService {
  constructor() {
    this.model = 'claude-3-haiku-20240307'; // Fast and cost-effective for this use case
  }

  /**
   * Generate AI-powered student pairs
   * @param {Array} students - Array of student objects
   * @param {Object} options - Pairing options and preferences
   * @returns {Promise<Object>} Pairing results with AI recommendations
   */
  async generateAIPairs(students, options = {}) {
    const {
      pairingGoals = ['peer_tutoring', 'collaborative_learning'],
      additionalFactors = {},
      classContext = {},
      teacherPreferences = {}
    } = options;

    try {
      const prompt = this.constructPairingPrompt(
        students, 
        pairingGoals, 
        additionalFactors,
        classContext,
        teacherPreferences
      );

      const systemPrompt = `You are an expert educational psychologist and learning specialist. Your task is to create optimal student pairs for peer learning based on academic performance, learning styles, and other educational factors. Always provide detailed reasoning for your pairing decisions.

Please analyze the student data provided and create optimal pairs following the instructions carefully. Focus on educational psychology principles and evidence-based pairing strategies.`;

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent results
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const aiResponse = response.content[0].text;
      return this.parseAIResponse(aiResponse, students);

    } catch (error) {
      console.error('AI Pairing Service Error:', error);
      // Fallback to rule-based pairing if AI fails
      return this.fallbackPairing(students, options);
    }
  }

  /**
   * Construct detailed prompt for AI pairing analysis
   */
  constructPairingPrompt(students, goals, additionalFactors, classContext, teacherPreferences) {
    const studentsData = students.map(student => ({
      id: student.id,
      name: student.name,
      score: student.marks,
      ...additionalFactors[student.id] || {}
    }));

    return `I need you to create optimal student pairs for peer learning. Please analyze the data carefully and use educational psychology principles.

## Class Information
- **Total Students**: ${students.length}
- **Subject**: ${classContext.subject || 'General'}
- **Grade Level**: ${classContext.grade || 'Not specified'}
- **Session Duration**: ${classContext.duration || 'Not specified'}

## Learning Objectives
${goals.map(goal => `• ${goal.replace('_', ' ').charAt(0).toUpperCase() + goal.replace('_', ' ').slice(1)}`).join('\n')}

## Student Profiles
${studentsData.map(student => {
  let profile = `**${student.name}** (ID: ${student.id})
  - Academic Score: ${student.score}/100`;
  
  if (student.learningStyle) profile += `\n  - Learning Style: ${student.learningStyle}`;
  if (student.personality) profile += `\n  - Personality: ${student.personality}`;
  if (student.language) profile += `\n  - Primary Language: ${student.language}`;
  if (student.previousPerformance) profile += `\n  - Performance Trend: ${student.previousPerformance}`;
  
  return profile;
}).join('\n\n')}

## Teacher Requirements
${Object.keys(teacherPreferences).length > 0 ? 
  Object.entries(teacherPreferences).map(([key, value]) => `• ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`).join('\n') :
  'No specific requirements provided'
}

## Task
Please think step by step:

1. **Analyze** each student's strengths, needs, and learning characteristics
2. **Consider** how different personalities and learning styles complement each other
3. **Create pairs** that maximize learning potential and peer interaction
4. **Ensure** every student is paired exactly once (create one group of 3 if odd number)

Please provide your analysis and then return the results in this exact JSON format:
{
  "pairs": [
    {
      "students": [
        {"id": "student_id_1", "name": "Student Name 1", "role": "tutor|peer|mentee"},
        {"id": "student_id_2", "name": "Student Name 2", "role": "tutor|peer|mentee"}
      ],
      "rationale": "Detailed explanation of why this pairing works",
      "expectedOutcome": "What learning outcomes to expect",
      "teachingStrategy": "Recommended approach for this pair",
      "confidenceScore": 85
    }
  ],
  "overallStrategy": "Summary of the pairing approach used",
  "recommendations": [
    "Specific recommendations for implementing these pairs"
  ]
}

**IMPORTANT:** Ensure every student is paired exactly once. If odd number of students, create one group of 3.
`;
  }

  /**
   * Parse AI response and format for application use
   */
  parseAIResponse(aiResponse, originalStudents) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const aiResult = JSON.parse(jsonMatch[0]);
      
      // Transform AI pairs to application format
      const pairs = aiResult.pairs.map((pair, index) => ({
        id: `ai-pair-${index + 1}`,
        students: pair.students.map(aiStudent => {
          const originalStudent = originalStudents.find(s => s.id === aiStudent.id);
          return {
            ...originalStudent,
            aiRole: aiStudent.role,
            aiRationale: pair.rationale
          };
        }),
        type: this.determinePairType(pair.students),
        size: pair.students.length,
        rationale: pair.rationale,
        aiConfidence: pair.confidenceScore,
        expectedOutcome: pair.expectedOutcome,
        teachingStrategy: pair.teachingStrategy,
        recommendation: pair.rationale + (pair.expectedOutcome ? ` Expected outcome: ${pair.expectedOutcome}` : '')
      }));

      // Calculate statistics
      const stats = this.calculateAIStats(pairs, originalStudents, aiResult);

      return {
        pairs,
        stats,
        aiMetadata: {
          overallStrategy: aiResult.overallStrategy,
          recommendations: aiResult.recommendations || [],
          model: this.model,
          provider: 'Anthropic Claude',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.fallbackPairing(originalStudents);
    }
  }

  /**
   * Determine pair type based on student roles and scores
   */
  determinePairType(students) {
    const roles = students.map(s => s.role);
    if (roles.includes('tutor') && roles.includes('mentee')) {
      return 'ai-tutoring';
    } else if (roles.every(role => role === 'peer')) {
      return 'ai-collaborative';
    } else {
      return 'ai-mixed';
    }
  }

  /**
   * Calculate comprehensive statistics for AI-generated pairs
   */
  calculateAIStats(pairs, students, aiResult) {
    const scores = students.map(s => s.marks);
    const totalStudents = students.length;
    
    return {
      totalStudents,
      totalPairs: pairs.length,
      pairingStrategy: 'ai-powered',
      performanceStats: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        median: this.calculateMedian(scores),
        stdDev: this.calculateStandardDeviation(scores)
      },
      aiMetrics: {
        averageConfidence: pairs.reduce((sum, pair) => sum + (pair.aiConfidence || 0), 0) / pairs.length,
        pairTypes: this.countPairTypes(pairs),
        overallStrategy: aiResult.overallStrategy
      }
    };
  }

  /**
   * Fallback to rule-based pairing if AI service fails
   */
  fallbackPairing(students, options = {}) {
    console.warn('Using fallback pairing algorithm');
    
    // Simple optimal pairing as fallback
    const sorted = [...students].sort((a, b) => a.marks - b.marks);
    const pairs = [];
    
    // Pair highest with lowest for tutoring
    for (let i = 0; i < Math.floor(sorted.length / 2); i++) {
      const lowPerformer = sorted[i];
      const highPerformer = sorted[sorted.length - 1 - i];
      
      pairs.push({
        id: `fallback-pair-${i + 1}`,
        students: [lowPerformer, highPerformer],
        type: 'fallback-tutoring',
        size: 2,
        rationale: `Fallback pairing: ${highPerformer.name} (${highPerformer.marks}) mentors ${lowPerformer.name} (${lowPerformer.marks})`,
        recommendation: 'This is a fallback pairing. Consider configuring AI service for better results.'
      });
    }

    // Handle odd student
    if (sorted.length % 2 === 1) {
      const middleIndex = Math.floor(sorted.length / 2);
      if (pairs.length > 0) {
        pairs[pairs.length - 1].students.push(sorted[middleIndex]);
        pairs[pairs.length - 1].size = 3;
        pairs[pairs.length - 1].type = 'fallback-group';
      }
    }

    return {
      pairs,
      stats: {
        totalStudents: students.length,
        totalPairs: pairs.length,
        pairingStrategy: 'fallback',
        performanceStats: this.calculateBasicStats(students)
      }
    };
  }

  /**
   * Utility functions
   */
  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  calculateStandardDeviation(numbers) {
    const avg = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  calculateBasicStats(students) {
    const scores = students.map(s => s.marks);
    return {
      min: Math.min(...scores),
      max: Math.max(...scores),
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      range: Math.max(...scores) - Math.min(...scores)
    };
  }

  countPairTypes(pairs) {
    const types = {};
    pairs.forEach(pair => {
      types[pair.type] = (types[pair.type] || 0) + 1;
    });
    return types;
  }
}

export default AIPairingService;