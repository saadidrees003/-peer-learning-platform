import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUpload = ({ onDataLoaded, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateData = (data) => {
    if (!data || data.length === 0) {
      throw new Error('File is empty or invalid');
    }

    // Check if required columns exist
    const firstRow = data[0];
    const hasName = Object.keys(firstRow).some(key => 
      key.toLowerCase().includes('name') || 
      key.toLowerCase().includes('student')
    );
    const hasId = Object.keys(firstRow).some(key => 
      key.toLowerCase().includes('id') || 
      key.toLowerCase().includes('roll')
    );
    const hasMarks = Object.keys(firstRow).some(key => 
      key.toLowerCase().includes('mark') || 
      key.toLowerCase().includes('score') || 
      key.toLowerCase().includes('grade')
    );

    if (!hasName || !hasId || !hasMarks) {
      throw new Error('File must contain columns for student name, ID, and marks/scores');
    }

    return true;
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError('');

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        throw new Error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      }

      let data = [];

      if (fileExtension === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { 
          header: true, 
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });
        
        if (result.errors.length > 0) {
          throw new Error('Error parsing CSV: ' + result.errors[0].message);
        }
        
        data = result.data;
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }

      validateData(data);
      
      // Clean and standardize the data
      const cleanedData = data.map((row, index) => {
        const nameKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('name') || 
          key.toLowerCase().includes('student')
        );
        const idKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('id') || 
          key.toLowerCase().includes('roll')
        );
        const marksKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('mark') || 
          key.toLowerCase().includes('score') || 
          key.toLowerCase().includes('grade')
        );

        const marks = parseFloat(row[marksKey]);
        if (isNaN(marks)) {
          throw new Error(`Invalid marks value "${row[marksKey]}" for student ${row[nameKey]} at row ${index + 1}`);
        }

        return {
          id: row[idKey]?.toString() || `student-${index + 1}`,
          name: row[nameKey]?.toString() || `Student ${index + 1}`,
          marks: marks,
          originalRow: index + 1
        };
      });

      onDataLoaded(cleanedData, file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <FileSpreadsheet className="h-12 w-12 text-gray-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isProcessing ? 'Processing file...' : 'Upload Result Sheet'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select CSV/Excel file
              </p>
              <p className="text-xs text-gray-400 mt-2">
                File should contain student names, IDs, and marks
              </p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;