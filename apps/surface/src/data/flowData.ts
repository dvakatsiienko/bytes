/* Types */
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '@/elements/FlowNode';

export const initialNodes: Node<NodeData>[] = [
    // Root Layout - Top Level
    {
        id: 'root-layout',
        type: 'route',
        position: { x: 600, y: 50 },
        data: {
            label: 'Root Layout (/)',
            description: 'Main app layout with providers (Clerk, Convex, React Query)',
        },
    },

    // Global Components - Level 1.5
    {
        id: 'app-sidebar',
        type: 'component',
        position: { x: 300, y: 150 },
        data: {
            label: 'AppSidebar',
            description: 'Navigation and theme controls',
        },
    },
    {
        id: 'clerk-auth',
        type: 'external',
        position: { x: 900, y: 150 },
        data: {
            label: 'Clerk Auth',
            description: 'User authentication and management',
        },
    },

    // Main Routes - Second Level
    {
        id: 'chat-route',
        type: 'route',
        position: { x: 150, y: 300 },
        data: {
            label: '/chat/[chatId]/[friendId]',
            description: 'Dynamic chat route with optional catch-all segments',
        },
    },
    {
        id: 'settings-route',
        type: 'route',
        position: { x: 600, y: 300 },
        data: {
            label: '/settings',
            description: 'User settings and profile management',
        },
    },
    {
        id: 'squads-route',
        type: 'route',
        position: { x: 1050, y: 300 },
        data: {
            label: '/squads',
            description: 'Parallel routes with @alpha and @beta slots',
        },
    },

    // Sub-routes - Third Level
    {
        id: 'squads-alpha',
        type: 'route',
        position: { x: 900, y: 450 },
        data: {
            label: '/squads/@alpha',
            description: 'Alpha parallel route slot',
        },
    },
    {
        id: 'squads-beta',
        type: 'route',
        position: { x: 1200, y: 450 },
        data: {
            label: '/squads/@beta',
            description: 'Beta parallel route slot',
        },
    },

    // Components - Third Level
    {
        id: 'chat-component',
        type: 'component',
        position: { x: 10, y: 450 },
        data: {
            label: 'Chat Component',
            description: 'Main chat interface with useChat hook',
        },
    },
    {
        id: 'message-list',
        type: 'component',
        position: { x: 400, y: 450 },
        data: {
            label: 'MessageList',
            description: 'Renders chat messages with animations',
        },
    },

    // API Endpoints - Fourth Level
    {
        id: 'chat-api',
        type: 'api',
        position: { x: 10, y: 600 },
        data: {
            label: 'POST /api/chat',
            description: 'Streams AI responses using Groq/OpenRouter LLMs',
        },
    },
    {
        id: 'friends-api',
        type: 'api',
        position: { x: 350, y: 600 },
        data: {
            label: 'GET /api/friends',
            description: 'Fetches available AI friends from Prisma',
        },
    },

    // State Management - Fourth Level
    {
        id: 'jotai-state',
        type: 'database',
        position: { x: 650, y: 600 },
        data: {
            label: 'Jotai State',
            description: 'Client-side state management',
        },
    },
    {
        id: 'vercel-ai',
        type: 'external',
        position: { x: 900, y: 600 },
        data: {
            label: 'Vercel AI SDK',
            description: 'Streaming chat interface utilities',
        },
    },

    // Database Layer - Fifth Level
    {
        id: 'convex-db',
        type: 'database',
        position: { x: 10, y: 750 },
        data: {
            label: 'Convex Database',
            description: 'Real-time database for chats and friends',
        },
    },
    {
        id: 'convex-functions',
        type: 'database',
        position: { x: 300, y: 750 },
        data: {
            label: 'Convex Functions',
            description: 'getFriendList, getChatHistory, saveChatHistory, initChat',
        },
    },
    {
        id: 'prisma-db',
        type: 'database',
        position: { x: 650, y: 750 },
        data: {
            label: 'Prisma + PostgreSQL',
            description: 'User data and friend configurations',
        },
    },

    // External LLM Services - Fifth Level
    {
        id: 'groq-llm',
        type: 'external',
        position: { x: 900, y: 750 },
        data: {
            label: 'Groq LLM',
            description: 'Fast inference for chat responses',
            intent: 'external',
        },
    },
    {
        id: 'openrouter-llm',
        type: 'external',
        position: { x: 1150, y: 750 },
        data: {
            label: 'OpenRouter',
            description: 'Multiple LLM providers access',
        },
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
