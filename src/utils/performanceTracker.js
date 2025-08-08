/**
 * Performance tracking utility for analyzing student improvement trends
 * Handles comparison between multiple result sheets and pair effectiveness
 */

export const createPerformanceSession = (resultSheet, sessionInfo) => {
  return {
    id: generateSessionId(),
    className: sessionInfo.className,
    subject: sessionInfo.subject,
    sessionName: sessionInfo.sessionName || `Session ${Date.now()}`,
    uploadDate: new Date().toISOString(),
    students: resultSheet.map(student => ({
      ...student,
      sessionId: generateSessionId(),
      originalId: student.id
    })),
    pairs: [],
    stats: calculateSessionStats(resultSheet)
  };
};

export const comparePerformanceSessions = (previousSession, currentSession) => {
  const comparisons = [];
  const improvements = [];
  const declines = [];
  const noChange = [];

  // Match students between sessions by ID or name
  currentSession.students.forEach(currentStudent => {
    const previousStudent = findMatchingStudent(previousSession.students, currentStudent);
    
    if (previousStudent) {
      const comparison = {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        previousMarks: previousStudent.marks,
        currentMarks: currentStudent.marks,
        improvement: currentStudent.marks - previousStudent.marks,
        improvementPercentage: ((currentStudent.marks - previousStudent.marks) / previousStudent.marks * 100).toFixed(2),
        category: categorizeImprovement(previousStudent.marks, currentStudent.marks),
        previousSession: previousSession.id,
        currentSession: currentSession.id
      };

      comparisons.push(comparison);

      // Categorize improvements
      if (comparison.improvement > 0) {
        improvements.push(comparison);
      } else if (comparison.improvement < 0) {
        declines.push(comparison);
      } else {
        noChange.push(comparison);
      }
    }
  });

  return {
    comparisons,
    improvements,
    declines,
    noChange,
    summary: {
      totalStudents: comparisons.length,
      studentsImproved: improvements.length,
      studentsDeclined: declines.length,
      studentsNoChange: noChange.length,
      averageImprovement: calculateAverageImprovement(comparisons),
      significantImprovements: improvements.filter(c => parseFloat(c.improvementPercentage) >= 10).length,
      significantDeclines: declines.filter(c => parseFloat(c.improvementPercentage) <= -10).length
    }
  };
};

export const analyzePairEffectiveness = (previousSession, currentSession, pairingHistory) => {
  const pairAnalysis = [];
  
  pairingHistory.forEach(pairRecord => {
    const pairEffectiveness = {
      pairId: pairRecord.id,
      students: pairRecord.students.map(student => {
        const previous = findMatchingStudent(previousSession.students, student);
        const current = findMatchingStudent(currentSession.students, student);
        
        return {
          id: student.id,
          name: student.name,
          role: student.category, // high, medium, low
          previousMarks: previous?.marks || 0,
          currentMarks: current?.marks || 0,
          improvement: (current?.marks || 0) - (previous?.marks || 0),
          improvementPercentage: previous?.marks ? 
            (((current?.marks || 0) - previous.marks) / previous.marks * 100).toFixed(2) : 0
        };
      }),
      pairType: pairRecord.type,
      overallImprovement: 0,
      effectiveness: 'unknown'
    };

    // Calculate overall pair effectiveness
    const totalImprovement = pairEffectiveness.students.reduce(
      (sum, student) => sum + student.improvement, 0
    );
    const avgImprovement = totalImprovement / pairEffectiveness.students.length;
    
    pairEffectiveness.overallImprovement = avgImprovement;
    pairEffectiveness.effectiveness = categorizePairEffectiveness(avgImprovement);

    // Special analysis for high-low pairs (focus on weaker student improvement)
    if (pairRecord.type === 'high-low') {
      const weakerStudent = pairEffectiveness.students.find(s => s.role === 'low');
      const strongerStudent = pairEffectiveness.students.find(s => s.role === 'high');
      
      pairEffectiveness.weakerStudentImprovement = weakerStudent?.improvement || 0;
      pairEffectiveness.strongerStudentChange = strongerStudent?.improvement || 0;
      pairEffectiveness.mentoringEffectiveness = 
        (weakerStudent?.improvement || 0) > 5 ? 'effective' : 'needs_attention';
    }

    pairAnalysis.push(pairEffectiveness);
  });

  return {
    pairAnalysis,
    summary: {
      totalPairs: pairAnalysis.length,
      effectivePairs: pairAnalysis.filter(p => p.effectiveness === 'effective').length,
      ineffectivePairs: pairAnalysis.filter(p => p.effectiveness === 'ineffective').length,
      averagePairImprovement: pairAnalysis.reduce((sum, p) => sum + p.overallImprovement, 0) / pairAnalysis.length,
      highLowPairsEffective: pairAnalysis.filter(p => 
        p.pairType === 'high-low' && p.mentoringEffectiveness === 'effective'
      ).length
    }
  };
};

export const generateTrendReport = (performanceComparison, pairEffectiveness, recommendations = true) => {
  const report = {
    overview: {
      sessionComparison: performanceComparison.summary,
      pairEffectiveness: pairEffectiveness.summary,
      generatedAt: new Date().toISOString()
    },
    studentTrends: performanceComparison.comparisons.map(comparison => ({
      ...comparison,
      trend: getTrendDirection(comparison.improvement),
      riskLevel: assessRiskLevel(comparison)
    })),
    pairTrends: pairEffectiveness.pairAnalysis,
    insights: generateInsights(performanceComparison, pairEffectiveness)
  };

  if (recommendations) {
    report.recommendations = generateRecommendations(performanceComparison, pairEffectiveness);
  }

  return report;
};

// Helper functions
const generateSessionId = () => {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const calculateSessionStats = (students) => {
  const marks = students.map(s => s.marks);
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  const average = total / marks.length;
  const min = Math.min(...marks);
  const max = Math.max(...marks);
  
  return {
    totalStudents: students.length,
    averageMarks: Math.round(average * 100) / 100,
    minMarks: min,
    maxMarks: max,
    range: max - min,
    median: calculateMedian(marks)
  };
};

const findMatchingStudent = (students, targetStudent) => {
  // First try to match by ID
  let match = students.find(s => s.id === targetStudent.id || s.originalId === targetStudent.id);
  
  // If no ID match, try matching by name
  if (!match) {
    match = students.find(s => 
      s.name.toLowerCase().trim() === targetStudent.name.toLowerCase().trim()
    );
  }
  
  return match;
};

const categorizeImprovement = (previousMarks, currentMarks) => {
  const improvement = currentMarks - previousMarks;
  const improvementPercentage = (improvement / previousMarks) * 100;

  if (improvementPercentage >= 20) return 'significant_improvement';
  if (improvementPercentage >= 10) return 'good_improvement';
  if (improvementPercentage >= 5) return 'slight_improvement';
  if (improvementPercentage >= -5) return 'no_change';
  if (improvementPercentage >= -10) return 'slight_decline';
  if (improvementPercentage >= -20) return 'concerning_decline';
  return 'significant_decline';
};

const calculateAverageImprovement = (comparisons) => {
  if (comparisons.length === 0) return 0;
  const totalImprovement = comparisons.reduce((sum, comp) => sum + comp.improvement, 0);
  return Math.round((totalImprovement / comparisons.length) * 100) / 100;
};

const categorizePairEffectiveness = (avgImprovement) => {
  if (avgImprovement >= 5) return 'effective';
  if (avgImprovement >= 0) return 'neutral';
  return 'ineffective';
};

const calculateMedian = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const getTrendDirection = (improvement) => {
  if (improvement > 5) return 'upward';
  if (improvement < -5) return 'downward';
  return 'stable';
};

const assessRiskLevel = (comparison) => {
  const percentage = parseFloat(comparison.improvementPercentage);
  if (percentage <= -20) return 'high_risk';
  if (percentage <= -10) return 'moderate_risk';
  if (comparison.currentMarks < 50) return 'low_performance';
  return 'normal';
};

const generateInsights = (performanceComparison, pairEffectiveness) => {
  const insights = [];
  
  const { summary } = performanceComparison;
  
  // Overall performance insights
  if (summary.studentsImproved > summary.studentsDeclined) {
    insights.push({
      type: 'positive',
      message: `More students improved (${summary.studentsImproved}) than declined (${summary.studentsDeclined})`,
      priority: 'medium'
    });
  } else if (summary.studentsDeclined > summary.studentsImproved) {
    insights.push({
      type: 'concerning',
      message: `More students declined (${summary.studentsDeclined}) than improved (${summary.studentsImproved})`,
      priority: 'high'
    });
  }

  // Significant improvements insight
  if (summary.significantImprovements > 0) {
    insights.push({
      type: 'positive',
      message: `${summary.significantImprovements} student(s) showed significant improvement (≥10%)`,
      priority: 'low'
    });
  }

  // Pair effectiveness insights
  const pairSummary = pairEffectiveness.summary;
  if (pairSummary.effectivePairs > pairSummary.ineffectivePairs) {
    insights.push({
      type: 'positive',
      message: `Most pairs (${pairSummary.effectivePairs}/${pairSummary.totalPairs}) are showing positive results`,
      priority: 'medium'
    });
  }

  return insights;
};

const generateRecommendations = (performanceComparison, pairEffectiveness) => {
  const recommendations = [];
  
  // Students needing attention
  const strugglingStudents = performanceComparison.comparisons.filter(c => 
    c.category === 'concerning_decline' || c.category === 'significant_decline'
  );
  
  if (strugglingStudents.length > 0) {
    recommendations.push({
      type: 'student_support',
      priority: 'high',
      title: 'Students Need Additional Support',
      description: `${strugglingStudents.length} student(s) showing concerning decline`,
      action: 'Consider additional tutoring or different pairing strategies',
      students: strugglingStudents.map(s => s.studentName)
    });
  }

  // Ineffective pairs
  const ineffectivePairs = pairEffectiveness.pairAnalysis.filter(p => p.effectiveness === 'ineffective');
  
  if (ineffectivePairs.length > 0) {
    recommendations.push({
      type: 'pair_adjustment',
      priority: 'medium',
      title: 'Consider Re-pairing Students',
      description: `${ineffectivePairs.length} pair(s) not showing expected improvement`,
      action: 'Review and potentially reassign these pairs',
      pairs: ineffectivePairs.map(p => p.pairId)
    });
  }

  // High-performing pairs to maintain
  const effectivePairs = pairEffectiveness.pairAnalysis.filter(p => p.effectiveness === 'effective');
  
  if (effectivePairs.length > 0) {
    recommendations.push({
      type: 'maintain_success',
      priority: 'low',
      title: 'Continue Successful Pairs',
      description: `${effectivePairs.length} pair(s) showing excellent results`,
      action: 'Maintain these pairings and use as models for other pairs',
      pairs: effectivePairs.map(p => p.pairId)
    });
  }

  return recommendations;
};