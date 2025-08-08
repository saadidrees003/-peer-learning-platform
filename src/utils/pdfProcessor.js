/**
 * PDF text extraction utility using PDF.js
 * Handles text extraction from specific page ranges
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (pdfFile, pageRanges = []) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    // Parse page ranges or use all pages
    const pagesToExtract = pageRanges.length > 0 
      ? parsePageRanges(pageRanges, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);
    
    // Extract text from specified pages
    const pageTexts = [];
    for (const pageNum of pagesToExtract) {
      if (pageNum <= totalPages && pageNum >= 1) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items into readable text
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        pageTexts.push({
          pageNumber: pageNum,
          text: pageText
        });
      }
    }
    
    return {
      success: true,
      totalPages,
      extractedPages: pageTexts,
      fullText: pageTexts.map(p => p.text).join('\n\n')
    };
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract text from PDF',
      totalPages: 0,
      extractedPages: [],
      fullText: ''
    };
  }
};

export const parsePageRanges = (ranges, totalPages) => {
  const pages = new Set();
  
  ranges.forEach(range => {
    const trimmedRange = range.trim();
    
    if (trimmedRange.includes('-')) {
      // Handle ranges like "1-5", "10-15"
      const [start, end] = trimmedRange.split('-').map(num => parseInt(num.trim()));
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          pages.add(i);
        }
      }
    } else {
      // Handle single pages like "3", "7"
      const pageNum = parseInt(trimmedRange);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  });
  
  return Array.from(pages).sort((a, b) => a - b);
};

export const validatePageRanges = (rangeString, totalPages) => {
  if (!rangeString.trim()) {
    return {
      valid: true,
      pages: [],
      message: 'No pages specified - will use all pages'
    };
  }
  
  const ranges = rangeString.split(',').map(r => r.trim()).filter(r => r);
  const errors = [];
  
  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(num => parseInt(num.trim()));
      
      if (isNaN(start) || isNaN(end)) {
        errors.push(`Invalid range format: "${range}"`);
      } else if (start <= 0 || end <= 0) {
        errors.push(`Page numbers must be positive: "${range}"`);
      } else if (start > end) {
        errors.push(`Invalid range (start > end): "${range}"`);
      } else if (start > totalPages || end > totalPages) {
        errors.push(`Page range exceeds document (${totalPages} pages): "${range}"`);
      }
    } else {
      const pageNum = parseInt(range);
      if (isNaN(pageNum)) {
        errors.push(`Invalid page number: "${range}"`);
      } else if (pageNum <= 0) {
        errors.push(`Page numbers must be positive: "${range}"`);
      } else if (pageNum > totalPages) {
        errors.push(`Page ${pageNum} exceeds document (${totalPages} pages)`);
      }
    }
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      pages: [],
      message: errors.join('; ')
    };
  }
  
  const pages = parsePageRanges(ranges, totalPages);
  return {
    valid: true,
    pages,
    message: `Will extract ${pages.length} page(s): ${pages.join(', ')}`
  };
};

export const getPDFInfo = async (pdfFile) => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const metadata = await pdf.getMetadata();
    
    return {
      success: true,
      totalPages: pdf.numPages,
      title: metadata.info.Title || 'Untitled',
      author: metadata.info.Author || 'Unknown',
      subject: metadata.info.Subject || '',
      creator: metadata.info.Creator || '',
      creationDate: metadata.info.CreationDate || null,
      modificationDate: metadata.info.ModDate || null
    };
  } catch (error) {
    console.error('PDF info extraction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to extract PDF information',
      totalPages: 0
    };
  }
};