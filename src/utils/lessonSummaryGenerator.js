/**
 * Lesson summary generator using rule-based text processing
 * Creates grade-appropriate summaries from extracted PDF text
 */

export const generateLessonSummary = async (extractedText, options = {}) => {
  const {
    gradeLevel = 'elementary',
    maxSentences = 5,
    className = '',
    subject = '',
    pageRanges = []
  } = options;

  try {
    console.log('Starting lesson summary generation...', {
      textLength: extractedText.length,
      gradeLevel,
      maxSentences,
      className,
      subject,
      pageRanges
    });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clean and prepare text
    const cleanedText = cleanText(extractedText);
    
    if (cleanedText.length < 100) {
      throw new Error('Insufficient text content for summary generation');
    }

    // Extract key information using rule-based approach
    const keyInfo = extractKeyInformation(cleanedText);
    
    // Generate summary based on grade level
    const summary = createGradeAppropriateSummary(keyInfo, gradeLevel, maxSentences);
    
    // Generate teaching suggestions
    const suggestions = generateTeachingSuggestions(keyInfo, gradeLevel);
    
    // Create vocabulary list
    const vocabulary = extractVocabulary(cleanedText, gradeLevel);

    return {
      success: true,
      summary: {
        id: generateSummaryId(),
        title: generateSummaryTitle(keyInfo, subject),
        content: summary,
        gradeLevel,
        subject,
        className,
        pageRanges: pageRanges.join(', ') || 'All pages',
        wordCount: summary.split(' ').length,
        readingTime: Math.ceil(summary.split(' ').length / 150), // ~150 words per minute
        keyTopics: keyInfo.topics,
        vocabulary,
        teachingSuggestions: suggestions,
        createdAt: new Date().toISOString(),
        extractedFrom: `${extractedText.length} characters of text`
      }
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate lesson summary'
    };
  }
};

const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters
    .replace(/\b\d+\b/g, '') // Remove standalone numbers (page numbers, etc.)
    .replace(/\s+/g, ' ')
    .trim();
};

const extractKeyInformation = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Simple keyword extraction for topics
  const keywords = extractKeywords(text);
  const topics = identifyTopics(keywords);
  
  // Extract important sentences (longer sentences with key terms)
  const importantSentences = sentences
    .filter(sentence => sentence.length > 20 && sentence.length < 200)
    .filter(sentence => keywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    ))
    .slice(0, 10);

  return {
    sentences: importantSentences,
    keywords,
    topics,
    totalSentences: sentences.length,
    textLength: text.length
  };
};

const extractKeywords = (text) => {
  // Simple frequency-based keyword extraction
  const words = text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
};

const identifyTopics = (keywords) => {
  // Basic topic identification based on keywords
  const topics = [];
  
  // Science topics
  if (keywords.some(k => ['science', 'experiment', 'hypothesis', 'theory', 'research'].includes(k))) {
    topics.push('Science');
  }
  
  // Math topics
  if (keywords.some(k => ['number', 'calculate', 'equation', 'solve', 'math', 'mathematics'].includes(k))) {
    topics.push('Mathematics');
  }
  
  // History topics
  if (keywords.some(k => ['history', 'ancient', 'civilization', 'century', 'timeline'].includes(k))) {
    topics.push('History');
  }
  
  // Literature topics
  if (keywords.some(k => ['story', 'character', 'plot', 'author', 'poem', 'literature'].includes(k))) {
    topics.push('Literature');
  }
  
  // Default to general topics if none found
  if (topics.length === 0) {
    topics.push('General Knowledge');
  }
  
  return topics;
};

const createGradeAppropriateSummary = (keyInfo, gradeLevel, maxSentences) => {
  const sentences = keyInfo.sentences.slice(0, maxSentences);
  
  if (gradeLevel === 'elementary') {
    return sentences
      .map(sentence => simplifyForElementary(sentence))
      .join(' ');
  } else if (gradeLevel === 'middle') {
    return sentences
      .map(sentence => simplifyForMiddleSchool(sentence))
      .join(' ');
  } else {
    return sentences.join(' ');
  }
};

const simplifyForElementary = (sentence) => {
  return sentence
    .replace(/\b(consequently|therefore|furthermore|moreover|nevertheless)\b/gi, 'So')
    .replace(/\b(utilize|employ)\b/gi, 'use')
    .replace(/\b(demonstrate|illustrate)\b/gi, 'show')
    .replace(/\b(comprehend|understand)\b/gi, 'know')
    .replace(/\b(approximately|roughly)\b/gi, 'about')
    .trim();
};

const simplifyForMiddleSchool = (sentence) => {
  return sentence
    .replace(/\b(consequently)\b/gi, 'therefore')
    .replace(/\b(utilize)\b/gi, 'use')
    .replace(/\b(demonstrate)\b/gi, 'show')
    .trim();
};

const generateTeachingSuggestions = (keyInfo, gradeLevel) => {
  const suggestions = [];
  
  if (gradeLevel === 'elementary') {
    suggestions.push('Ask students to draw pictures about what they learned');
    suggestions.push('Have students act out the main ideas');
    suggestions.push('Create simple games based on the content');
    suggestions.push('Use storytelling to explain difficult concepts');
  } else if (gradeLevel === 'middle') {
    suggestions.push('Organize group discussions about the main topics');
    suggestions.push('Create mind maps of the key concepts');
    suggestions.push('Ask students to find real-world examples');
    suggestions.push('Have students write their own questions about the content');
  } else {
    suggestions.push('Facilitate debates on controversial topics');
    suggestions.push('Assign research projects on related subjects');
    suggestions.push('Connect the content to current events');
    suggestions.push('Have students create presentations on sub-topics');
  }
  
  return suggestions.slice(0, 3);
};

const extractVocabulary = (text, gradeLevel) => {
  const words = text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !isStopWord(word))
    .filter(word => /^[a-zA-Z]+$/.test(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const vocabularyList = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => ({
      word: capitalizeFirst(word),
      definition: generateSimpleDefinition(word, gradeLevel)
    }));

  return vocabularyList;
};

const generateSimpleDefinition = (word, gradeLevel) => {
  // This is a mock definition generator
  // In a real implementation, you'd use a dictionary API
  const definitions = {
    'elementary': `A ${word} is something important in this lesson.`,
    'middle': `${capitalizeFirst(word)} refers to a key concept we're studying.`,
    'high': `${capitalizeFirst(word)} is a term that describes an important idea in this subject.`
  };
  
  return definitions[gradeLevel] || definitions['middle'];
};

const isStopWord = (word) => {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as',
    'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might',
    'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'me',
    'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
    'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
    'whom', 'whose', 'this', 'that', 'these', 'those', 'am', 'is',
    'are', 'was', 'were', 'being', 'been', 'be', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should',
    'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s',
    'we\'re', 'they\'re', 'i\'ve', 'you\'ve', 'we\'ve', 'they\'ve',
    'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d', 'i\'ll',
    'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t',
    'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t',
    'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t',
    'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s',
    'that\'s', 'who\'s', 'what\'s', 'here\'s', 'there\'s', 'when\'s',
    'where\'s', 'why\'s', 'how\'s'
  ]);
  
  return stopWords.has(word.toLowerCase());
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const generateSummaryId = () => {
  return 'summary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const generateSummaryTitle = (keyInfo, subject) => {
  const topics = keyInfo.topics.join(' & ');
  const subjectText = subject ? `${subject}: ` : '';
  return `${subjectText}${topics} - Lesson Summary`;
};