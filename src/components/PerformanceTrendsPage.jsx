import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';
import FileUpload from './FileUpload';
import { comparePerformanceSessions, analyzePairEffectiveness, generateTrendReport, createPerformanceSession } from '../utils/performanceTracker';

const PerformanceTrendsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedPreviousSession, setSelectedPreviousSession] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [trendReport, setTrendReport] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load sessions from localStorage on component mount
    const savedSessions = localStorage.getItem('performanceSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDataLoaded = (studentData, fileName) => {
    const sessionInfo = {
      className: 'Class 3-A', // Could be made configurable
      subject: 'Mathematics', // Could be made configurable
      sessionName: fileName
    };

    const newSession = createPerformanceSession(studentData, sessionInfo);
    setCurrentSession(newSession);
    
    showNotification(`Loaded ${studentData.length} students from ${fileName}`);
  };

  const saveCurrentSession = () => {
    if (!currentSession) return;

    const updatedSessions = [...sessions, currentSession];
    setSessions(updatedSessions);
    localStorage.setItem('performanceSessions', JSON.stringify(updatedSessions));
    
    showNotification('Performance session saved successfully!');
  };

  const generateTrends = async () => {
    if (!currentSession || !selectedPreviousSession) {
      showNotification('Please select both current and previous sessions', 'error');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const previousSession = sessions.find(s => s.id === selectedPreviousSession);
      if (!previousSession) {
        throw new Error('Previous session not found');
      }

      // Get pairing history (if available)
      const pairingHistory = localStorage.getItem('pairingHistory');
      const pairs = pairingHistory ? JSON.parse(pairingHistory) : [];

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Compare performance between sessions
      const performanceComparison = comparePerformanceSessions(previousSession, currentSession);
      
      // Analyze pair effectiveness
      const pairEffectiveness = analyzePairEffectiveness(previousSession, currentSession, pairs);
      
      // Generate comprehensive trend report
      const report = generateTrendReport(performanceComparison, pairEffectiveness);
      
      setTrendReport(report);
      showNotification('Performance trends analysis completed!');
      
    } catch (error) {
      showNotification(`Error generating trends: ${error.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'upward':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'downward':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high_risk':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate_risk':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low_performance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getImprovementColor = (improvement) => {
    if (improvement > 10) return 'text-green-700 bg-green-100';
    if (improvement > 0) return 'text-green-600 bg-green-50';
    if (improvement < -10) return 'text-red-700 bg-red-100';
    if (improvement < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md
          ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'}
        `}>
          <div className="flex items-start space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 
                notification.type === 'error' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Upload New Results Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Result Sheet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a new result sheet to compare with previous performance data and track student improvements.
            </p>
            
            <FileUpload onDataLoaded={handleDataLoaded} />
            
            {currentSession && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-blue-800">Current Session Loaded</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      {currentSession.sessionName} • {currentSession.students.length} students
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Average: {currentSession.stats.averageMarks} | Range: {currentSession.stats.minMarks}-{currentSession.stats.maxMarks}
                    </p>
                  </div>
                  <button
                    onClick={saveCurrentSession}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Session Selection & Analysis */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Trends Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Session (Baseline)
                  </label>
                  <select
                    value={selectedPreviousSession}
                    onChange={(e) => setSelectedPreviousSession(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select previous session...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.sessionName} ({session.students.length} students) - {new Date(session.uploadDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Session
                  </label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50">
                    {currentSession ? `${currentSession.sessionName} (${currentSession.students.length} students)` : 'No session loaded'}
                  </div>
                </div>
              </div>

              <button
                onClick={generateTrends}
                disabled={isAnalyzing || !currentSession || !selectedPreviousSession}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Performance...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Trends Analysis
                  </>
                )}
              </button>
            </div>
          )}

          {/* Trends Report Display */}
          {trendReport && (
            <div className="space-y-6">
              
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Students Improved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {trendReport.overview.sessionComparison.studentsImproved}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Students Declined</p>
                      <p className="text-2xl font-bold text-red-600">
                        {trendReport.overview.sessionComparison.studentsDeclined}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Effective Pairs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {trendReport.overview.pairEffectiveness.effectivePairs}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Improvement</p>
                      <p className={`text-2xl font-bold ${
                        trendReport.overview.sessionComparison.averageImprovement > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trendReport.overview.sessionComparison.averageImprovement > 0 ? '+' : ''}
                        {trendReport.overview.sessionComparison.averageImprovement}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Student Trends */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Performance Trends</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 text-sm font-medium text-gray-600">Student</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-600">Previous</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-600">Current</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-600">Change</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Trend</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendReport.studentTrends.map((student, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{student.studentName}</div>
                          </td>
                          <td className="p-3 text-right text-gray-600">{student.previousMarks}</td>
                          <td className="p-3 text-right text-gray-600">{student.currentMarks}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getImprovementColor(student.improvement)}`}>
                              {student.improvement > 0 ? '+' : ''}{student.improvement}
                              <span className="ml-1 text-xs">({student.improvementPercentage}%)</span>
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {getTrendIcon(student.trend)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs border ${getRiskLevelColor(student.riskLevel)}`}>
                              {student.riskLevel.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              {trendReport.recommendations && trendReport.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Recommendations
                  </h3>
                  
                  <div className="space-y-4">
                    {trendReport.recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {rec.priority === 'high' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          ) : rec.priority === 'medium' ? (
                            <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className={`font-medium ${
                              rec.priority === 'high' ? 'text-red-800' :
                              rec.priority === 'medium' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {rec.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              rec.priority === 'high' ? 'text-red-700' :
                              rec.priority === 'medium' ? 'text-yellow-700' :
                              'text-blue-700'
                            }`}>
                              {rec.description}
                            </p>
                            <p className={`text-sm font-medium mt-2 ${
                              rec.priority === 'high' ? 'text-red-800' :
                              rec.priority === 'medium' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              Action: {rec.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Sessions List */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Performance Sessions</h3>
              
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{session.sessionName}</div>
                      <div className="text-sm text-gray-500">
                        {session.students.length} students • 
                        Avg: {session.stats.averageMarks} • 
                        {new Date(session.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.className} - {session.subject}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrendsPage;