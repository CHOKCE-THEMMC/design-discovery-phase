import { Material } from "@/hooks/use-materials";

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function stringSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Tokenize a string into searchable words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\\w\\s]/g, ' ')
    .split(/\\s+/)
    .filter((word) => word.length > 1);
}

/**
 * Check if query matches using various strategies with improved specificity
 */
function matchScore(query: string, text: string): number {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();
  
  if (!queryLower || !textLower) return 0;
  
  // Exact match - highest score
  if (textLower === queryLower) return 1.0;
  
  // Check for exact phrase match at word boundaries
  const phraseRegex = new RegExp(`\\b${escapeRegex(queryLower)}\\b`, 'i');
  if (phraseRegex.test(textLower)) return 0.95;
  
  // Contains exact phrase - very high score
  if (textLower.includes(queryLower)) return 0.85;
  
  // Word boundary match - high score
  const queryWords = tokenize(query);
  const textWords = tokenize(text);
  
  if (queryWords.length === 0) return 0;
  
  let exactWordMatches = 0;
  let prefixMatches = 0;
  let fuzzyMatches = 0;
  let consecutiveBonus = 0;
  
  // Track consecutive word matches for phrase-like queries
  let lastMatchIndex = -2;
  
  for (let i = 0; i < queryWords.length; i++) {
    const queryWord = queryWords[i];
    let bestMatchScore = 0;
    let matchIndex = -1;
    
    for (let j = 0; j < textWords.length; j++) {
      const textWord = textWords[j];
      
      // Exact word match
      if (textWord === queryWord) {
        if (bestMatchScore < 1) {
          bestMatchScore = 1;
          matchIndex = j;
        }
        continue;
      }
      
      // Strong prefix match (query word starts the text word)
      if (textWord.startsWith(queryWord) && queryWord.length >= 3) {
        const prefixScore = 0.85 + (queryWord.length / textWord.length) * 0.1;
        if (prefixScore > bestMatchScore) {
          bestMatchScore = prefixScore;
          matchIndex = j;
        }
        continue;
      }
      
      // Reverse prefix match (text word starts the query word)
      if (queryWord.startsWith(textWord) && textWord.length >= 3) {
        const prefixScore = 0.7 + (textWord.length / queryWord.length) * 0.1;
        if (prefixScore > bestMatchScore) {
          bestMatchScore = prefixScore;
          matchIndex = j;
        }
        continue;
      }
      
      // Similarity match (for typos) - only for longer words
      if (queryWord.length >= 4 && textWord.length >= 4) {
        const similarity = stringSimilarity(queryWord, textWord);
        if (similarity > 0.8) {
          const fuzzyScore = similarity * 0.6;
          if (fuzzyScore > bestMatchScore) {
            bestMatchScore = fuzzyScore;
            matchIndex = j;
          }
        }
      }
    }
    
    if (bestMatchScore >= 1) {
      exactWordMatches++;
    } else if (bestMatchScore >= 0.7) {
      prefixMatches += bestMatchScore;
    } else if (bestMatchScore > 0) {
      fuzzyMatches += bestMatchScore;
    }
    
    // Bonus for consecutive matches (phrase-like matching)
    if (matchIndex !== -1 && matchIndex === lastMatchIndex + 1) {
      consecutiveBonus += 0.1;
    }
    lastMatchIndex = matchIndex;
  }
  
  // Calculate weighted score
  const exactScore = (exactWordMatches / queryWords.length) * 0.7;
  const prefixScore = (prefixMatches / queryWords.length) * 0.5;
  const fuzzyScore = (fuzzyMatches / queryWords.length) * 0.3;
  
  // Combine scores with consecutive bonus
  const baseScore = exactScore + prefixScore + fuzzyScore + consecutiveBonus;
  
  // Apply length penalty for very short queries matching long text
  const lengthRatio = queryLower.length / textLower.length;
  const lengthPenalty = lengthRatio < 0.1 ? 0.7 : lengthRatio < 0.2 ? 0.85 : 1;
  
  return Math.min(baseScore * lengthPenalty, 1.0);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface SearchResult<T> {
  item: T;
  score: number;
}

/**
 * Advanced search function for materials with relevance scoring
 */
export function searchMaterials(
  materials: Material[],
  query: string,
  options?: {
    minScore?: number;
    limit?: number;
  }
): SearchResult<Material>[] {
  if (!query.trim()) {
    return materials.map((item) => ({ item, score: 1 }));
  }

  const minScore = options?.minScore ?? 0.1;
  const limit = options?.limit;

  const results: SearchResult<Material>[] = [];

  for (const material of materials) {
    // Calculate scores for different fields with weights
    const titleScore = matchScore(query, material.title) * 1.0; // Title is most important
    const authorScore = matchScore(query, material.author) * 0.7;
    const descriptionScore = matchScore(query, material.description || '') * 0.4;
    const departmentScore = matchScore(query, material.department) * 0.5;
    const typeScore = matchScore(query, material.type.replace('-', ' ')) * 0.3;

    // Combine scores with weights
    const combinedScore = Math.max(
      titleScore,
      authorScore,
      descriptionScore,
      departmentScore,
      typeScore
    );

    // Boost score for popular materials
    const popularityBoost = Math.min(material.downloads / 100, 0.1);
    const finalScore = combinedScore + popularityBoost;

    if (finalScore >= minScore) {
      results.push({ item: material, score: finalScore });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  if (limit) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Filter and sort materials with improved search
 */
export function filterAndSortMaterials(
  materials: Material[],
  filters: {
    searchQuery: string;
    department: string;
    year: string;
    type?: string;
    sortBy: string;
  }
): Material[] {
  const { searchQuery, department, year, type, sortBy } = filters;

  // First apply search with scoring
  let searchResults = searchMaterials(materials, searchQuery);

  // Apply filters
  let result = searchResults
    .filter(({ item }) => {
      const matchesDepartment =
        department === 'All Departments' || item.department === department;
      const matchesYear =
        year === 'All Years' || item.year.toString() === year;
      const matchesType = !type || type === 'all' || item.type === type;
      return matchesDepartment && matchesYear && matchesType;
    })
    .map(({ item, score }) => ({ item, score }));

  // If there's a search query, we've already sorted by relevance
  // Otherwise, apply the selected sort
  if (!searchQuery.trim()) {
    if (sortBy === 'newest') {
      result.sort((a, b) => b.item.year - a.item.year);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.item.year - b.item.year);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.item.downloads - a.item.downloads);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.item.title.localeCompare(b.item.title));
    }
  } else if (sortBy !== 'relevance') {
    // For non-relevance sort, we need to re-sort but keep some relevance weighting
    if (sortBy === 'newest') {
      result.sort((a, b) => b.item.year - a.item.year || b.score - a.score);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.item.year - b.item.year || b.score - a.score);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.item.downloads - a.item.downloads || b.score - a.score);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.item.title.localeCompare(b.item.title) || b.score - a.score);
    }
  }

  return result.map(({ item }) => item);
}
