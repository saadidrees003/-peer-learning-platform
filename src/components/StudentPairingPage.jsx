import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import FileUpload from './FileUpload';
import PairsDisplay from './PairsDisplay';
import { generatePairs, regeneratePairs } from '../utils/pairingAlgorithm';
import { PAIRING_STRATEGIES, AVAILABLE_STRATEGIES } from '../constants/pairingStrategies';

const StudentPairingPage = () => {
  const [students, setStudents] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [stats, setStats] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(PAIRING_STRATEGIES.OPTIMAL);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDataLoaded = (studentData, file) => {
    try {
      setStudents(studentData);
      setFileName(file);
      setIsApproved(false);
      
      // Generate initial pairs
      const result = generatePairs(studentData, { pairingStrategy: PAIRING_STRATEGIES.OPTIMAL });
      setPairs(result.pairs);
      setStats(result.stats);
      setCurrentStrategy(PAIRING_STRATEGIES.OPTIMAL);
      
      showNotification(`Successfully processed ${studentData.length} students from ${file}`);
    } catch (error) {
      showNotification(`Error generating pairs: ${error.message}`, 'error');
    }
  };

  const handleEditPair = (pairId, editedStudents) => {
    try {
      const updatedPairs = pairs.map(pair => {
        if (pair.id === pairId) {
          const updatedPair = {
            ...pair,
            students: editedStudents,
            averageScore: editedStudents.reduce((sum, s) => sum + s.marks, 0) / editedStudents.length,
            scoreGap: Math.max(...editedStudents.map(s => s.marks)) - Math.min(...editedStudents.map(s => s.marks))
          };
          
          // Regenerate recommendation for the edited pair
          updatedPair.recommendation = generateRecommendationForPair(updatedPair);
          
          return updatedPair;
        }
        return pair;
      });
      
      setPairs(updatedPairs);
      setIsApproved(false);
      showNotification('Pair updated successfully');
    } catch (error) {
      showNotification(`Error updating pair: ${error.message}`, 'error');
    }
  };

  const handleApprovePairs = () => {
    setIsApproved(true);
    showNotification('All pairs approved! You can now proceed with peer learning activities.');
  };

  const handleRegeneratePairs = () => {
    try {
      const result = regeneratePairs(students, pairs, { 
        currentStrategy
      });
      
      setPairs(result.pairs);
      setStats(result.stats);
      setCurrentStrategy(result.stats.pairingStrategy);
      setIsApproved(false);
      
      showNotification(`Pairs regenerated using ${result.stats.pairingStrategy} strategy`);
    } catch (error) {
      showNotification(`Error regenerating pairs: ${error.message}`, 'error');
    }
  };

  const generateRecommendationForPair = (pair) => {
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

  const handleStrategyChange = (newStrategy) => {
    try {
      const result = generatePairs(students, { pairingStrategy: newStrategy });
      setPairs(result.pairs);
      setStats(result.stats);
      setCurrentStrategy(newStrategy);
      setIsApproved(false);
      
      showNotification(`Pairs regenerated using ${newStrategy} strategy`);
    } catch (error) {
      showNotification(`Error changing strategy: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Removed header - now handled by global navigation */}

      {/* Notification */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md
          ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
        `}>
          <div className="flex items-start space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
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
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Result Sheet
              </h2>
              {fileName && (
                <div className="text-sm text-gray-500">
                  Current file: <span className="font-medium">{fileName}</span>
                </div>
              )}
            </div>
            
            <FileUpload 
              onDataLoaded={handleDataLoaded}
              className="mb-4"
            />

            {/* Strategy Selection */}
            {students.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pairing Strategy
                </label>
                <div className="flex space-x-4">
                  {AVAILABLE_STRATEGIES.map(strategy => (
                    <label key={strategy.value} className="flex items-center">
                      <input
                        type="radio"
                        name="strategy"
                        value={strategy.value}
                        checked={currentStrategy === strategy.value}
                        onChange={(e) => handleStrategyChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{strategy.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Approval Status */}
          {isApproved && pairs.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800 font-medium">
                  Pairs Approved! Ready for peer learning activities.
                </span>
              </div>
            </div>
          )}

          {/* Pairs Display */}
          {pairs.length > 0 && (
            <PairsDisplay
              pairs={pairs}
              stats={stats}
              onEditPair={handleEditPair}
              onApprovePairs={handleApprovePairs}
              onRegeneratePairs={handleRegeneratePairs}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPairingPage;