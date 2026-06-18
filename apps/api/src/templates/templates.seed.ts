import { TemplateCategory } from './template.entity';
import type { FlowGraph } from '../flows/entities/flow.entity';

interface SeedTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  graph: FlowGraph;
  isBuiltin: boolean;
}

export const BUILTIN_TEMPLATES: SeedTemplate[] = [
  {
    name: 'Web Scraper → Summarize → Email',
    description: 'Scrape a webpage, summarize the content with an LLM, and send the summary by email.',
    category: TemplateCategory.AI,
    icon: '🌐',
    isBuiltin: true,
    graph: {
      nodes: [
        { id: 'n1', type: 'web-scraper', position: { x: 100, y: 200 }, data: { label: 'Web Scraper', config: { url: '', selector: 'body' } } },
        { id: 'n2', type: 'ai-llm', position: { x: 400, y: 200 }, data: { label: 'Summarize', config: { prompt: 'Summarize this content in 3 bullet points: {{input}}', model: 'gpt-4o-mini' } } },
        { id: 'n3', type: 'email-sender', position: { x: 700, y: 200 }, data: { label: 'Send Email', config: { to: '', subject: 'Daily Summary' } } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
    },
  },
  {
    name: 'GitHub PR Review',
    description: 'Fetch open pull requests from a GitHub repo and generate an AI code review for each.',
    category: TemplateCategory.AI,
    icon: '🔍',
    isBuiltin: true,
    graph: {
      nodes: [
        { id: 'n1', type: 'api-caller', position: { x: 100, y: 200 }, data: { label: 'Fetch PRs', config: { url: 'https://api.github.com/repos/{{owner}}/{{repo}}/pulls', method: 'GET', headers: { Authorization: 'Bearer {{github_token}}' } } } },
        { id: 'n2', type: 'ai-llm', position: { x: 400, y: 200 }, data: { label: 'Review Code', config: { prompt: 'Review this pull request and identify potential issues: {{input}}', model: 'gpt-4o' } } },
        { id: 'n3', type: 'webhook-sender', position: { x: 700, y: 200 }, data: { label: 'Post Comment', config: { url: '', method: 'POST' } } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
    },
  },
  {
    name: 'Daily News Digest',
    description: 'Fetch news from an RSS feed, filter relevant items, and compile a daily digest.',
    category: TemplateCategory.AUTOMATION,
    icon: '📰',
    isBuiltin: true,
    graph: {
      nodes: [
        { id: 'n1', type: 'rss-reader', position: { x: 100, y: 200 }, data: { label: 'RSS Feed', config: { url: '', maxItems: 20 } } },
        { id: 'n2', type: 'ai-llm', position: { x: 400, y: 200 }, data: { label: 'Filter & Rank', config: { prompt: 'From these news items, select the 5 most important and explain why: {{input}}', model: 'gpt-4o-mini' } } },
        { id: 'n3', type: 'email-sender', position: { x: 700, y: 200 }, data: { label: 'Send Digest', config: { to: '', subject: 'Daily News Digest' } } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
    },
  },
  {
    name: 'API Health Monitor',
    description: 'Ping a list of API endpoints, check response times, and alert on failures.',
    category: TemplateCategory.MONITORING,
    icon: '🔔',
    isBuiltin: true,
    graph: {
      nodes: [
        { id: 'n1', type: 'api-caller', position: { x: 100, y: 200 }, data: { label: 'Health Check', config: { url: '', method: 'GET', timeout: 5000 } } },
        { id: 'n2', type: 'condition', position: { x: 400, y: 200 }, data: { label: 'Check Status', config: { condition: '{{status}} !== 200 || {{responseTime}} > 2000' } } },
        { id: 'n3', type: 'webhook-sender', position: { x: 700, y: 100 }, data: { label: 'Alert Slack', config: { url: '', method: 'POST' } } },
        { id: 'n4', type: 'logger', position: { x: 700, y: 300 }, data: { label: 'Log OK', config: { level: 'info' } } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3', label: 'fail' },
        { id: 'e3', source: 'n2', target: 'n4', label: 'pass' },
      ],
    },
  },
  {
    name: 'Data Extractor & CSV Export',
    description: 'Extract structured data from text or HTML using an LLM and format it as CSV.',
    category: TemplateCategory.DATA,
    icon: '📊',
    isBuiltin: true,
    graph: {
      nodes: [
        { id: 'n1', type: 'web-scraper', position: { x: 100, y: 200 }, data: { label: 'Scrape Data', config: { url: '', selector: 'table' } } },
        { id: 'n2', type: 'ai-llm', position: { x: 400, y: 200 }, data: { label: 'Extract Structure', config: { prompt: 'Extract all data from this content and return as JSON array with consistent keys: {{input}}', model: 'gpt-4o-mini' } } },
        { id: 'n3', type: 'transformer', position: { x: 700, y: 200 }, data: { label: 'To CSV', config: { format: 'csv' } } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
    },
  },
];
