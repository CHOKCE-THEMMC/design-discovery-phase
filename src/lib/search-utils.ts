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
 * Check if query matches using various strategies
 */
function matchScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match - highest score
  if (textLower === queryLower) return 1.0;
  
  // Contains exact phrase - very high score
  if (textLower.includes(queryLower)) return 0.9;
  
  // Word boundary match - high score
  const queryWords = tokenize(query);
  const textWords = tokenize(text);
  
  let wordMatchCount = 0;
  let fuzzyMatchCount = 0;
  
  for (const queryWord of queryWords) {
    // Exact word match
    if (textWords.includes(queryWord)) {
      wordMatchCount++;
      continue;
    }
    
    // Check for fuzzy matches
    for (const textWord of textWords) {
      // Prefix match
      if (textWord.startsWith(queryWord) || queryWord.startsWith(textWord)) {
        fuzzyMatchCount += 0.7;
        break;
      }
      
      // Similarity match (for typos)
      const similarity = stringSimilarity(queryWord, textWord);
      if (similarity > 0.75) {
        fuzzyMatchCount += similarity * 0.5;
        break;
      }
    }
  }
  
  if (queryWords.length === 0) return 0;
  
  const exactScore = wordMatchCount / queryWords.length;
  const fuzzyScore = fuzzyMatchCount / queryWords.length;
  
  return exactScore * 0.6 + fuzzyScore * 0.3;
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
