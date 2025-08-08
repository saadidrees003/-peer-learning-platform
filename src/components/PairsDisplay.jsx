import React, { useState } from 'react';
import { 
  Users, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const PairsDisplay = ({ pairs, stats, onEditPair, onApprovePairs, onRegeneratePairs, className = '' }) => {
  const [editingPair, setEditingPair] = useState(null);
  const [editedStudents, setEditedStudents] = useState([]);

  const handleEditClick = (pair) => {
    setEditingPair(pair.id);
    setEditedStudents([...pair.students]);
  };

  const handleCancelEdit = () => {
    setEditingPair(null);
    setEditedStudents([]);
  };

  const handleSaveEdit = () => {
    if (editedStudents.length >= 2) {
      onEditPair(editingPair, editedStudents);
      setEditingPair(null);
      setEditedStudents([]);
    }
  };

  const handleStudentChange = (index, field, value) => {
    const updated = [...editedStudents];
    updated[index] = { ...updated[index], [field]: value };
    setEditedStudents(updated);
  };

  const getPerformanceIcon = (student, pairAverage) => {
    if (student.marks > pairAverage + 10) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (student.marks < pairAverage - 10) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPairTypeColor = (type) => {
    switch (type) {
      case 'high-low':
        return 'bg-blue-50 border-blue-200';
      case 'medium-medium':
        return 'bg-green-50 border-green-200';
      case 'mixed':
        return 'bg-purple-50 border-purple-200';
      case 'balanced':
        return 'bg-orange-50 border-orange-200';
      case 'random':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPairTypeLabel = (type) => {
    switch (type) {
      case 'high-low':
        return 'High-Low Pairing';
      case 'medium-medium':
        return 'Similar Level';
      case 'mixed':
        return 'Mixed Ability';
      case 'balanced':
        return 'Balanced';
      case 'random':
        return 'Random';
      case 'group-of-3':
        return 'Group of 3';
      case 'extended-pair':
        return 'Extended Pair';
      default:
        return 'Standard Pair';
    }
  };

  if (!pairs || pairs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Pairs Generated</h3>
        <p className="text-gray-500">Upload a result sheet to generate student pairs</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Pairing Results
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-sm text-blue-800">Total Students</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalPairs}</div>
            <div className="text-sm text-green-800">Pairs Created</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.performanceStats.average)}
            </div>
            <div className="text-sm text-purple-800">Average Score</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.performanceStats.range}
            </div>
            <div className="text-sm text-orange-800">Score Range</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600">Strategy:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {stats.pairingStrategy}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onApprovePairs}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve All Pairs
        </button>
        <button
          onClick={onRegeneratePairs}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate Pairs
        </button>
      </div>

      {/* Pairs List */}
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div
            key={pair.id}
            className={`border rounded-lg p-6 transition-all ${getPairTypeColor(pair.type)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Pair {pair.id.split('-')[1]}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-white rounded-full">
                      {getPairTypeLabel(pair.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Avg: {pair.averageScore} | Gap: {pair.scoreGap}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleEditClick(pair)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            {/* Students in Pair */}
            <div className="space-y-3 mb-4">
              {editingPair === pair.id ? (
                // Edit Mode
                <div className="space-y-3">
                  {editedStudents.map((student, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={student.name}
                          onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Student Name"
                        />
                        <input
                          type="text"
                          value={student.id}
                          onChange={(e) => handleStudentChange(index, 'id', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Student ID"
                        />
                        <input
                          type="number"
                          value={student.marks}
                          onChange={(e) => handleStudentChange(index, 'marks', parseFloat(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Marks"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                pair.students.map((student, index) => (
                  <div key={student.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getPerformanceIcon(student, pair.averageScore)}
                          <div>
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="text-sm text-gray-500">ID: {student.id}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-800">
                          {student.marks}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.category && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs
                              ${student.category === 'high' ? 'bg-green-100 text-green-700' : ''}
                              ${student.category === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                              ${student.category === 'low' ? 'bg-red-100 text-red-700' : ''}
                            `}>
                              {student.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recommendation */}
            {pair.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Recommendation
                    </h4>
                    <p className="text-sm text-blue-700">{pair.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PairsDisplay;