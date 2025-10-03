import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSearchResults, textSearch, paginate } from './mockApi';
import type { SearchQA } from '../types';

// Mock Math.random to prevent random test failures from simulated network errors
const originalRandom = Math.random;

// Mock the data import
vi.mock('../data/search.json', () => ({
  default: [
    {
      id: 'Q001',
      question: 'How do we deploy to staging?',
      answer: 'Push to main branch triggers staging deploy',
      confidence: 0.93,
      citations: [
        { source: 'GitHub', title: 'Deploy pipeline', url: 'https://example.com', date: '2025-08-17T10:03:22Z' }
      ],
      related: ['How do we rollback?'],
      date: '2025-08-17T10:05:00Z',
      topics: ['deployment', 'CI/CD'],
      sourceTypes: ['GitHub', 'Confluence']
    },
    {
      id: 'Q002',
      question: 'How do we handle database backups?',
      answer: 'Automated daily via RDS snapshots',
      confidence: 0.88,
      citations: [
        { source: 'Confluence', title: 'RDS Backups', url: 'https://example.com', date: '2025-06-22T12:40:00Z' }
      ],
      related: [],
      date: '2025-09-14T14:25:00Z',
      topics: ['database', 'security'],
      sourceTypes: ['Confluence', 'Slack']
    },
    {
      id: 'Q003',
      question: 'What is our branching strategy?',
      answer: 'Trunk-based development with feature branches',
      confidence: 0.9,
      citations: [
        { source: 'Notion', title: 'Git Workflow', url: 'https://example.com', date: '2025-05-09T09:10:00Z' }
      ],
      related: [],
      date: '2025-05-09T09:12:00Z',
      topics: ['process', 'CI/CD'],
      sourceTypes: ['Notion']
    }
  ]
}));

describe('mockApi - fetchSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random to always succeed (return value > 0.2 to avoid error)
    Math.random = () => 0.5;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('returns all results when no query or filters', async () => {
    const result = await fetchSearchResults('');
    expect(result.data).toHaveLength(3);
    expect(result.data[0].id).toBe('Q001');
  });

  it('performs fuzzy search with query', async () => {
    const result = await fetchSearchResults('deploy');
    expect(result.data.length).toBeGreaterThan(0);
    
    // Should find "deploy" matches
    const hasDeployMatch = result.data.some(
      item => item.question.toLowerCase().includes('deploy') || 
              item.answer.toLowerCase().includes('deploy')
    );
    expect(hasDeployMatch).toBe(true);
  });

  it('handles typos with fuzzy matching', async () => {
    const result = await fetchSearchResults('deploymen'); // missing 't'
    expect(result.data.length).toBeGreaterThan(0);
    
    // Should still find deployment-related content
    const hasMatch = result.data.some(
      item => item.topics.includes('deployment')
    );
    expect(hasMatch).toBe(true);
  });

  it('filters by source type', async () => {
    const result = await fetchSearchResults('', { source: 'GitHub' });
    
    // All results should include GitHub in sourceTypes or citations
    result.data.forEach(item => {
      const hasGitHub = item.sourceTypes.includes('GitHub') ||
                       item.citations.some(c => c.source === 'GitHub');
      expect(hasGitHub).toBe(true);
    });
  });

  it('filters by date range', async () => {
    const result = await fetchSearchResults('', {
      startDate: '2025-08-01',
      endDate: '2025-09-30'
    });

    result.data.forEach(item => {
      const date = new Date(item.date).getTime();
      const start = new Date('2025-08-01').getTime();
      const end = new Date('2025-09-30T23:59:59').getTime();
      expect(date).toBeGreaterThanOrEqual(start);
      expect(date).toBeLessThanOrEqual(end);
    });
  });

  it('combines fuzzy search with filters', async () => {
    const result = await fetchSearchResults('backup', { source: 'Confluence' });
    
    if (result.data.length > 0) {
      result.data.forEach(item => {
        const hasConfluence = item.sourceTypes.includes('Confluence') ||
                             item.citations.some(c => c.source === 'Confluence');
        expect(hasConfluence).toBe(true);
      });
    }
  });

  it('overrides confidence scores when query is present', async () => {
    const result = await fetchSearchResults('deploy');
    
    if (result.data.length > 0) {
      // Confidence should be within the clamped range for fuzzy results
      result.data.forEach(item => {
        expect(item.confidence).toBeGreaterThanOrEqual(0.6);
        expect(item.confidence).toBeLessThanOrEqual(0.99);
      });
    }
  });

  it('sorts results by confidence descending', async () => {
    const result = await fetchSearchResults('deploy');
    
    if (result.data.length > 1) {
      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].confidence).toBeGreaterThanOrEqual(result.data[i + 1].confidence);
      }
    }
  });
});

describe('textSearch helper', () => {
  const items = [
    { id: 1, name: 'React Tutorial' },
    { id: 2, name: 'Vue Guide' },
    { id: 3, name: 'React Patterns' }
  ];

  it('returns all items when query is empty', () => {
    const result = textSearch(items, '', (item) => item.name);
    expect(result).toHaveLength(3);
  });

  it('filters items by query', () => {
    const result = textSearch(items, 'React', (item) => item.name);
    expect(result).toHaveLength(2);
    expect(result.every(item => item.name.includes('React'))).toBe(true);
  });

  it('is case insensitive', () => {
    const result = textSearch(items, 'react', (item) => item.name);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for no matches', () => {
    const result = textSearch(items, 'Angular', (item) => item.name);
    expect(result).toHaveLength(0);
  });
});

describe('paginate helper', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('paginates items correctly', () => {
    const result = paginate(items, 1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe(1);
    expect(result.total).toBe(25);
    expect(result.hasMore).toBe(true);
  });

  it('handles last page correctly', () => {
    const result = paginate(items, 3, 10);
    expect(result.data).toHaveLength(5);
    expect(result.data[0].id).toBe(21);
    expect(result.hasMore).toBe(false);
  });

  it('handles empty results', () => {
    const result = paginate([], 1, 10);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('calculates page metadata correctly', () => {
    const result = paginate(items, 2, 10);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.total).toBe(25);
  });
});