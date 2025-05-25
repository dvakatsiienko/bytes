'use client';
/* Core */
import React, { useCallback } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    MarkerType,
    Edge,
    Handle,
    Position,
    ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* Components */
import { BriefEntry } from '@/components/BriefEntry';
import { Project } from '@/components/Project';
import { ExternalLink } from '@/elements';
import { SectionHeading } from '@/components/SectionHeading';
import { ToolSection } from './parts/ToolSection';

/* Instruments */
// import * as links from '@/links';

// import { Masonry } from 'masonic';
// import { EasyMasonryComponent } from './EasyMasonryComponent';

export default function HomePage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Debug logging
    console.log('Nodes:', nodes.length);
    console.log('Edges:', edges.length);
    console.log('Sample edge:', edges[0]);

    return (
        <main className='h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={undefined}
                fitView
                className='bg-transparent'
                nodeTypes={nodeTypes}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                connectionMode={ConnectionMode.Loose}>
                <Background color='#94a3b8' gap={20} />
                <Controls className='rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm' />
                <MiniMap
                    className='rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm'
                    nodeColor='#64748b'
                />
            </ReactFlow>
        </main>
    );
}

// Types
interface NodeData {
    label: string;
    description: string;
}

interface CustomNodeProps {
    data: NodeData;
}

// Custom node components
const RouteNode = ({ data }: CustomNodeProps) => (
    <div className='min-w-48 rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-3 shadow-sm'>
        <Handle type='target' position={Position.Top} />
        <div className='text-sm font-semibold text-blue-900'>{data.label}</div>
        <div className='mt-1 text-xs text-blue-700'>{data.description}</div>
        <Handle type='source' position={Position.Bottom} />
    </div>
);

const ApiNode = ({ data }: CustomNodeProps) => (
    <div className='min-w-48 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3 shadow-sm'>
        <Handle type='target' position={Position.Top} />
        <div className='text-sm font-semibold text-green-900'>{data.label}</div>
        <div className='mt-1 text-xs text-green-700'>{data.description}</div>
        <Handle type='source' position={Position.Bottom} />
    </div>
);

const DatabaseNode = ({ data }: CustomNodeProps) => (
    <div className='min-w-48 rounded-lg border-2 border-purple-200 bg-purple-50 px-4 py-3 shadow-sm'>
        <Handle type='target' position={Position.Top} />
        <div className='text-sm font-semibold text-purple-900'>{data.label}</div>
        <div className='mt-1 text-xs text-purple-700'>{data.description}</div>
        <Handle type='source' position={Position.Bottom} />
    </div>
);

const ComponentNode = ({ data }: CustomNodeProps) => (
    <div className='min-w-48 rounded-lg border-2 border-orange-200 bg-orange-50 px-4 py-3 shadow-sm'>
        <Handle type='target' position={Position.Top} />
        <div className='text-sm font-semibold text-orange-900'>{data.label}</div>
        <div className='mt-1 text-xs text-orange-700'>{data.description}</div>
        <Handle type='source' position={Position.Bottom} />
    </div>
);

const ExternalNode = ({ data }: CustomNodeProps) => (
    <div className='min-w-48 rounded-lg border-2 border-slate-300 bg-slate-50 px-4 py-3 shadow-sm'>
        <Handle type='target' position={Position.Top} />
        <div className='text-sm font-semibold text-slate-900'>{data.label}</div>
        <div className='mt-1 text-xs text-slate-700'>{data.description}</div>
        <Handle type='source' position={Position.Bottom} />
    </div>
);

const nodeTypes = {
    route: RouteNode,
    api: ApiNode,
    database: DatabaseNode,
    component: ComponentNode,
    external: ExternalNode,
};

const initialNodes = [
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

const initialEdges = [
    // Basic test edges - simplified
    { id: 'e1', source: 'root-layout', target: 'app-sidebar' },
    { id: 'e2', source: 'root-layout', target: 'clerk-auth' },
    { id: 'e3', source: 'root-layout', target: 'chat-route' },
    { id: 'e4', source: 'root-layout', target: 'settings-route' },
    { id: 'e5', source: 'chat-route', target: 'chat-component' },
];
