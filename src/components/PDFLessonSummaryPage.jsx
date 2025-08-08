import React, { useState } from 'react';
import { BookOpen, FileText, Settings, CheckCircle, AlertTriangle, Clock, Users, Lightbulb } from 'lucide-react';
import PDFUpload from './PDFUpload';
import { extractTextFromPDF, validatePageRanges, getPDFInfo } from '../utils/pdfProcessor';
import { generateLessonSummary } from '../utils/lessonSummaryGenerator';

const PDFLessonSummaryPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [pageRanges, setPageRanges] = useState('');
  const [gradeLevel, setGradeLevel] = useState('elementary');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [summary, setSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePDFLoaded = async (fileInfo) => {
    if (!fileInfo) {
      setPdfFile(null);
      setPdfInfo(null);
      setSummary(null);
      return;
    }

    setPdfFile(fileInfo);
    setIsProcessing(true);

    try {
      const info = await getPDFInfo(fileInfo.file);
      if (info.success) {
        setPdfInfo(info);
        showNotification(`PDF loaded successfully: ${info.totalPages} pages`);
      } else {
        throw new Error(info.error);
      }
    } catch (error) {
      showNotification(`Error loading PDF: ${error.message}`, 'error');
      setPdfFile(null);
      setPdfInfo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!pdfFile || !pdfInfo) {
      showNotification('Please upload a PDF first', 'error');
      return;
    }

    setIsProcessing(true);
    setSummary(null);

    try {
      // Validate page ranges
      const pageRangeList = pageRanges.trim() ? pageRanges.split(',').map(r => r.trim()) : [];
      const validation = validatePageRanges(pageRanges, pdfInfo.totalPages);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      showNotification('Extracting text from PDF...', 'info');

      // Extract text from PDF
      const extractionResult = await extractTextFromPDF(pdfFile.file, pageRangeList);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error);
      }

      if (!extractionResult.fullText.trim()) {
        throw new Error('No text content found in the specified pages');
      }

      showNotification('Generating lesson summary...', 'info');

      // Generate lesson summary
      const summaryResult = await generateLessonSummary(extractionResult.fullText, {
        gradeLevel,
        className,
        subject,
        pageRanges: validation.pages.length > 0 ? validation.pages : ['All pages']
      });

      if (!summaryResult.success) {
        throw new Error(summaryResult.error);
      }

      setSummary(summaryResult.summary);
      showNotification('Lesson summary generated successfully!');

    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSummary = () => {
    if (!summary) return;

    const updatedSummaries = [...savedSummaries, summary];
    setSavedSummaries(updatedSummaries);
    
    // In a real app, this would be saved to a backend
    localStorage.setItem('lessonSummaries', JSON.stringify(updatedSummaries));
    
    showNotification('Summary saved successfully!');
  };

  const getValidationMessage = () => {
    if (!pdfInfo || !pageRanges.trim()) return null;
    
    const validation = validatePageRanges(pageRanges, pdfInfo.totalPages);
    return validation;
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="bg-gray-50">
      {/* Removed header - now handled by global navigation */}

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
              <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
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
          {/* PDF Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Upload PDF Book
            </h2>
            <PDFUpload onPDFLoaded={handlePDFLoaded} />
            
            {pdfInfo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">PDF Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Title:</span>
                    <span className="text-blue-600 ml-2">{pdfInfo.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Pages:</span>
                    <span className="text-blue-600 ml-2">{pdfInfo.totalPages}</span>
                  </div>
                  {pdfInfo.author && (
                    <div>
                      <span className="font-medium text-blue-700">Author:</span>
                      <span className="text-blue-600 ml-2">{pdfInfo.author}</span>
                    </div>
                  )}
                  {pdfInfo.subject && (
                    <div>
                      <span className="font-medium text-blue-700">Subject:</span>
                      <span className="text-blue-600 ml-2">{pdfInfo.subject}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Section */}
          {pdfFile && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Lesson Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Page Ranges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Ranges (Optional)
                  </label>
                  <input
                    type="text"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="e.g., 1-5, 8, 12-15"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use all pages. Use commas to separate ranges.
                  </p>
                  {validationMessage && (
                    <p className={`text-xs mt-1 ${
                      validationMessage.valid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validationMessage.message}
                    </p>
                  )}
                </div>

                {/* Grade Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="elementary">Elementary (K-5)</option>
                    <option value="middle">Middle School (6-8)</option>
                    <option value="high">High School (9-12)</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics, Science, History"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., 3-A, Grade 5 Mathematics"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerateSummary}
                  disabled={isProcessing || !pdfFile}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Generate Lesson Summary
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Summary Display */}
          {summary && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Generated Lesson Summary
                </h2>
                <button
                  onClick={handleSaveSummary}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Summary
                </button>
              </div>

              <div className="space-y-6">
                {/* Summary Header */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {summary.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {summary.gradeLevel} Level
                    </div>
                    {summary.className && (
                      <div>Class: {summary.className}</div>
                    )}
                    <div>Pages: {summary.pageRanges}</div>
                    <div>{summary.wordCount} words</div>
                    <div>{summary.readingTime} min read</div>
                  </div>
                </div>

                {/* Main Content */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Summary</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {summary.content}
                    </p>
                  </div>
                </div>

                {/* Key Topics */}
                {summary.keyTopics && summary.keyTopics.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary */}
                {summary.vocabulary && summary.vocabulary.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Key Vocabulary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {summary.vocabulary.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{item.word}</div>
                          <div className="text-sm text-gray-600 mt-1">{item.definition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teaching Suggestions */}
                {summary.teachingSuggestions && summary.teachingSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Teaching Suggestions</h4>
                    <ul className="space-y-2">
                      {summary.teachingSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFLessonSummaryPage;