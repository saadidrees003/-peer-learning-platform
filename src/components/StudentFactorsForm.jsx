import React, { useState } from 'react';
import { Plus, Minus, Brain, Users, Globe, TrendingUp } from 'lucide-react';

const StudentFactorsForm = ({ students, onFactorsUpdate, className = '' }) => {
  const [additionalFactors, setAdditionalFactors] = useState({});
  const [classContext, setClassContext] = useState({
    subject: '',
    grade: '',
    duration: '',
    classSize: students?.length || 0
  });
  const [teacherPreferences, setTeacherPreferences] = useState({
    pairingGoal: 'peer_tutoring',
    allowMixedLanguages: true,
    prioritizePersonality: false,
    balanceGenders: false
  });

  const handleStudentFactorChange = (studentId, factor, value) => {
    setAdditionalFactors(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [factor]: value
      }
    }));
  };

  const handleContextChange = (field, value) => {
    setClassContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field, value) => {
    setTeacherPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onFactorsUpdate({
      additionalFactors,
      classContext,
      teacherPreferences
    });
  };

  if (!students || students.length === 0) {
    return (
      <div className={`p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">Upload student data first to configure additional factors</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2" />
        AI Pairing Configuration
      </h3>

      {/* Class Context */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Class Context
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
            <input
              type="text"
              value={classContext.subject}
              onChange={(e) => handleContextChange('subject', e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Grade</label>
            <input
              type="text"
              value={classContext.grade}
              onChange={(e) => handleContextChange('grade', e.target.value)}
              placeholder="e.g., Grade 3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Session Duration</label>
            <select
              value={classContext.duration}
              onChange={(e) => handleContextChange('duration', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select duration</option>
              <option value="30min">30 minutes</option>
              <option value="45min">45 minutes</option>
              <option value="60min">1 hour</option>
              <option value="90min">1.5 hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Class Size</label>
            <input
              type="number"
              value={classContext.classSize}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Teacher Preferences */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Pairing Preferences
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Primary Goal</label>
            <select
              value={teacherPreferences.pairingGoal}
              onChange={(e) => handlePreferencesChange('pairingGoal', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="peer_tutoring">Peer Tutoring (High-Low)</option>
              <option value="collaborative_learning">Collaborative Learning (Similar Levels)</option>
              <option value="mixed_ability">Mixed Ability Groups</option>
              <option value="skill_development">Skill Development Focus</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={teacherPreferences.allowMixedLanguages}
                onChange={(e) => handlePreferencesChange('allowMixedLanguages', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Mixed Languages</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={teacherPreferences.balanceGenders}
                onChange={(e) => handlePreferencesChange('balanceGenders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Balance Genders</span>
            </label>
          </div>
        </div>
      </div>

      {/* Student-Specific Factors */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Additional Student Factors (Optional)
        </h4>
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{student.name}</span>
                  <span className="text-sm text-gray-500">Score: {student.marks}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Learning Style</label>
                    <select
                      value={additionalFactors[student.id]?.learningStyle || ''}
                      onChange={(e) => handleStudentFactorChange(student.id, 'learningStyle', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Not specified</option>
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="read_write">Read/Write</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Personality</label>
                    <select
                      value={additionalFactors[student.id]?.personality || ''}
                      onChange={(e) => handleStudentFactorChange(student.id, 'personality', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Not specified</option>
                      <option value="extrovert">Extrovert</option>
                      <option value="introvert">Introvert</option>
                      <option value="ambivert">Ambivert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Primary Language</label>
                    <select
                      value={additionalFactors[student.id]?.language || ''}
                      onChange={(e) => handleStudentFactorChange(student.id, 'language', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Not specified</option>
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="arabic">Arabic</option>
                      <option value="urdu">Urdu</option>
                      <option value="chinese">Chinese</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Performance Trend</label>
                    <select
                      value={additionalFactors[student.id]?.previousPerformance || ''}
                      onChange={(e) => handleStudentFactorChange(student.id, 'previousPerformance', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Not specified</option>
                      <option value="improving">Improving</option>
                      <option value="stable">Stable</option>
                      <option value="declining">Declining</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setAdditionalFactors({});
            setClassContext({
              subject: '',
              grade: '',
              duration: '',
              classSize: students?.length || 0
            });
            setTeacherPreferences({
              pairingGoal: 'peer_tutoring',
              allowMixedLanguages: true,
              prioritizePersonality: false,
              balanceGenders: false
            });
          }}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply AI Configuration
        </button>
      </div>
    </div>
  );
};

export default StudentFactorsForm;