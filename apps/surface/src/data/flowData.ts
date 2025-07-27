/* Types */
import type { Edge, Node } from '@xyflow/react';

import type { NodeData } from '@/elements/FlowNode';

export const initialNodes: Node<NodeData>[] = [
  // Root Layout - Top Level
  {
    data: {
      description:
        'Main app layout with providers (Clerk, Convex, React Query)',
      label: 'Root Layout (/)',
    },
    id: 'root-layout',
    position: { x: 600, y: 50 },
    type: 'route',
  },

  // Global Components - Level 1.5
  {
    data: {
      description: 'Navigation and theme controls',
      label: 'AppSidebar',
    },
    id: 'app-sidebar',
    position: { x: 300, y: 150 },
    type: 'component',
  },
  {
    data: {
      description: 'User authentication and management',
      label: 'Clerk Auth',
    },
    id: 'clerk-auth',
    position: { x: 900, y: 150 },
    type: 'external',
  },

  // Main Routes - Second Level
  {
    data: {
      description: 'Dynamic chat route with optional catch-all segments',
      label: '/chat/[chatId]/[friendId]',
    },
    id: 'chat-route',
    position: { x: 150, y: 300 },
    type: 'route',
  },
  {
    data: {
      description: 'User settings and profile management',
      label: '/settings',
    },
    id: 'settings-route',
    position: { x: 600, y: 300 },
    type: 'route',
  },
  {
    data: {
      description: 'Parallel routes with @alpha and @beta slots',
      label: '/squads',
    },
    id: 'squads-route',
    position: { x: 1050, y: 300 },
    type: 'route',
  },

  // Sub-routes - Third Level
  {
    data: {
      description: 'Alpha parallel route slot',
      label: '/squads/@alpha',
    },
    id: 'squads-alpha',
    position: { x: 900, y: 450 },
    type: 'route',
  },
  {
    data: {
      description: 'Beta parallel route slot',
      label: '/squads/@beta',
    },
    id: 'squads-beta',
    position: { x: 1200, y: 450 },
    type: 'route',
  },

  // Components - Third Level
  {
    data: {
      description: 'Main chat interface with useChat hook',
      label: 'Chat Component',
    },
    id: 'chat-component',
    position: { x: 10, y: 450 },
    type: 'component',
  },
  {
    data: {
      description: 'Renders chat messages with animations',
      label: 'MessageList',
    },
    id: 'message-list',
    position: { x: 400, y: 450 },
    type: 'component',
  },

  // API Endpoints - Fourth Level
  {
    data: {
      description: 'Streams AI responses using Groq/OpenRouter LLMs',
      label: 'POST /api/chat',
    },
    id: 'chat-api',
    position: { x: 10, y: 600 },
    type: 'api',
  },
  {
    data: {
      description: 'Fetches available AI friends from Prisma',
      label: 'GET /api/friends',
    },
    id: 'friends-api',
    position: { x: 350, y: 600 },
    type: 'api',
  },

  // State Management - Fourth Level
  {
    data: {
      description: 'Client-side state management',
      label: 'Jotai State',
    },
    id: 'jotai-state',
    position: { x: 650, y: 600 },
    type: 'database',
  },
  {
    data: {
      description: 'Streaming chat interface utilities',
      label: 'Vercel AI SDK',
    },
    id: 'vercel-ai',
    position: { x: 900, y: 600 },
    type: 'external',
  },

  // Database Layer - Fifth Level
  {
    data: {
      description: 'Real-time database for chats and friends',
      label: 'Convex Database',
    },
    id: 'convex-db',
    position: { x: 10, y: 750 },
    type: 'database',
  },
  {
    data: {
      description: 'getFriendList, getChatHistory, saveChatHistory, initChat',
      label: 'Convex Functions',
    },
    id: 'convex-functions',
    position: { x: 300, y: 750 },
    type: 'database',
  },
  {
    data: {
      description: 'User data and friend configurations',
      label: 'Prisma + PostgreSQL',
    },
    id: 'prisma-db',
    position: { x: 650, y: 750 },
    type: 'database',
  },

  // External LLM Services - Fifth Level
  {
    data: {
      description: 'Fast inference for chat responses',
      intent: 'external',
      label: 'Groq LLM',
    },
    id: 'groq-llm',
    position: { x: 900, y: 750 },
    type: 'external',
  },
  {
    data: {
      description: 'Multiple LLM providers access',
      label: 'OpenRouter',
    },
    id: 'openrouter-llm',
    position: { x: 1150, y: 750 },
    type: 'external',
  },
];

export const initialEdges: Edge[] = [
  // Root layout connections
  { id: 'e1', source: 'root-layout', target: 'app-sidebar' },
  { id: 'e2', source: 'root-layout', target: 'clerk-auth' },
  { id: 'e3', source: 'root-layout', target: 'chat-route' },
  { id: 'e4', source: 'root-layout', target: 'settings-route' },
  { id: 'e5', source: 'root-layout', target: 'squads-route' },

  // Chat flow connections
  { id: 'e6', source: 'chat-route', target: 'chat-component' },
  { id: 'e7', source: 'chat-component', target: 'chat-api' },
  { id: 'e8', source: 'chat-api', target: 'convex-db' },
  { id: 'e9', source: 'chat-api', target: 'groq-llm' },
  { id: 'e10', source: 'chat-api', target: 'openrouter-llm' },

  // Friends flow connections
  { id: 'e11', source: 'chat-component', target: 'friends-api' },
  { id: 'e12', source: 'friends-api', target: 'prisma-db' },

  // Squads connections
  { id: 'e13', source: 'squads-route', target: 'squads-alpha' },
  { id: 'e14', source: 'squads-route', target: 'squads-beta' },

  // State management connections
  { id: 'e15', source: 'chat-component', target: 'jotai-state' },
  { id: 'e16', source: 'chat-component', target: 'vercel-ai' },

  // Convex functions connections
  { id: 'e17', source: 'convex-db', target: 'convex-functions' },

  // Message list connection
  { id: 'e18', source: 'chat-component', target: 'message-list' },
];
