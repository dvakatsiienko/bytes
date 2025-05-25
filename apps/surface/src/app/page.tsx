'use client';
/* Core */
import React, { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls, MiniMap } from '@xyflow/react';
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

    return (
        <main className="w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                className="bg-transparent"
                nodeTypes={nodeTypes}
            >
                <Background color="#94a3b8" gap={20} />
                <Controls className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg" />
                <MiniMap
                    className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg"
                    nodeColor="#64748b"
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
    <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm min-w-48">
        <div className="font-semibold text-blue-900 text-sm">{data.label}</div>
        <div className="text-xs text-blue-700 mt-1">{data.description}</div>
    </div>
);

const ApiNode = ({ data }: CustomNodeProps) => (
    <div className="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm min-w-48">
        <div className="font-semibold text-green-900 text-sm">{data.label}</div>
        <div className="text-xs text-green-700 mt-1">{data.description}</div>
    </div>
);

const DatabaseNode = ({ data }: CustomNodeProps) => (
    <div className="px-4 py-3 bg-purple-50 border-2 border-purple-200 rounded-lg shadow-sm min-w-48">
        <div className="font-semibold text-purple-900 text-sm">{data.label}</div>
        <div className="text-xs text-purple-700 mt-1">{data.description}</div>
    </div>
);

const ComponentNode = ({ data }: CustomNodeProps) => (
    <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg shadow-sm min-w-48">
        <div className="font-semibold text-orange-900 text-sm">{data.label}</div>
        <div className="text-xs text-orange-700 mt-1">{data.description}</div>
    </div>
);

const ExternalNode = ({ data }: CustomNodeProps) => (
    <div className="px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg shadow-sm min-w-48">
        <div className="font-semibold text-slate-900 text-sm">{data.label}</div>
        <div className="text-xs text-slate-700 mt-1">{data.description}</div>
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
        position: { x: 400, y: 50 },
        data: {
            label: 'Root Layout (/)',
            description: 'Main app layout with providers (Clerk, Convex, React Query)'
        }
    },

    // Main Routes - Second Level
    {
        id: 'chat-route',
        type: 'route',
        position: { x: 100, y: 200 },
        data: {
            label: '/chat/[chatId]/[friendId]',
            description: 'Dynamic chat route with optional catch-all segments'
        }
    },
    {
        id: 'settings-route',
        type: 'route',
        position: { x: 400, y: 200 },
        data: {
            label: '/settings',
            description: 'User settings and profile management'
        }
    },
    {
        id: 'squads-route',
        type: 'route',
        position: { x: 700, y: 200 },
        data: {
            label: '/squads',
            description: 'Parallel routes with @alpha and @beta slots'
        }
    },

    // Sub-routes - Third Level
    {
        id: 'squads-alpha',
        type: 'route',
        position: { x: 600, y: 350 },
        data: {
            label: '/squads/@alpha',
            description: 'Alpha parallel route slot'
        }
    },
    {
        id: 'squads-beta',
        type: 'route',
        position: { x: 800, y: 350 },
        data: {
            label: '/squads/@beta',
            description: 'Beta parallel route slot'
        }
    },

        // API Endpoints
    {
        id: 'chat-api',
        type: 'api',
        position: { x: 100, y: 500 },
        data: {
            label: 'POST /api/chat',
            description: 'Streams AI responses using Groq/OpenRouter LLMs'
        }
    },
    {
        id: 'friends-api',
        type: 'api',
        position: { x: 400, y: 500 },
        data: {
            label: 'GET /api/friends',
            description: 'Fetches available AI friends from Prisma'
        }
    },

    // Components
    {
        id: 'chat-component',
        type: 'component',
        position: { x: 100, y: 350 },
        data: {
            label: 'Chat Component',
            description: 'Main chat interface with useChat hook'
        }
    },
    {
        id: 'message-list',
        type: 'component',
        position: { x: 250, y: 350 },
        data: {
            label: 'MessageList',
            description: 'Renders chat messages with animations'
        }
    },
    {
        id: 'app-sidebar',
        type: 'component',
        position: { x: 200, y: 50 },
        data: {
            label: 'AppSidebar',
            description: 'Navigation and theme controls'
        }
    },

        // Database & State
    {
        id: 'convex-db',
        type: 'database',
        position: { x: 100, y: 650 },
        data: {
            label: 'Convex Database',
            description: 'Real-time database for chats and friends'
        }
    },
    {
        id: 'prisma-db',
        type: 'database',
        position: { x: 400, y: 650 },
        data: {
            label: 'Prisma + PostgreSQL',
            description: 'User data and friend configurations'
        }
    },
    {
        id: 'jotai-state',
        type: 'database',
        position: { x: 250, y: 500 },
        data: {
            label: 'Jotai State',
            description: 'Client-side state management'
        }
    },

    // External Services
    {
        id: 'groq-llm',
        type: 'external',
        position: { x: 700, y: 650 },
        data: {
            label: 'Groq LLM',
            description: 'Fast inference for chat responses'
        }
    },
    {
        id: 'openrouter-llm',
        type: 'external',
        position: { x: 850, y: 650 },
        data: {
            label: 'OpenRouter',
            description: 'Multiple LLM providers access'
        }
    },
    {
        id: 'clerk-auth',
        type: 'external',
        position: { x: 600, y: 50 },
        data: {
            label: 'Clerk Auth',
            description: 'User authentication and management'
        }
    },
    {
        id: 'vercel-ai',
        type: 'external',
        position: { x: 550, y: 500 },
        data: {
            label: 'Vercel AI SDK',
            description: 'Streaming chat interface utilities'
        }
    },

    // Data Flow Nodes
    {
        id: 'convex-functions',
        type: 'database',
        position: { x: 250, y: 650 },
        data: {
            label: 'Convex Functions',
            description: 'getFriendList, getChatHistory, saveChatHistory, initChat'
        }
    }
];

const initialEdges = [
    // Hierarchical Route Structure
    { id: 'e1', source: 'root-layout', target: 'chat-route', type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e2', source: 'root-layout', target: 'settings-route', type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e3', source: 'root-layout', target: 'squads-route', type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e4', source: 'squads-route', target: 'squads-alpha', type: 'smoothstep', style: { stroke: '#3b82f6' } },
    { id: 'e5', source: 'squads-route', target: 'squads-beta', type: 'smoothstep', style: { stroke: '#3b82f6' } },

    // Root Layout to Global Components
    { id: 'e6', source: 'root-layout', target: 'app-sidebar', type: 'smoothstep', style: { stroke: '#f97316' } },
    { id: 'e7', source: 'root-layout', target: 'clerk-auth', type: 'smoothstep', style: { stroke: '#64748b' } },

    // Route to Component connections
    { id: 'e8', source: 'chat-route', target: 'chat-component', type: 'smoothstep', style: { stroke: '#f97316' } },
    { id: 'e9', source: 'chat-component', target: 'message-list', type: 'smoothstep', style: { stroke: '#f97316' } },

    // Component to API connections
    { id: 'e10', source: 'chat-component', target: 'chat-api', type: 'smoothstep', style: { stroke: '#10b981' } },
    { id: 'e11', source: 'app-sidebar', target: 'friends-api', type: 'smoothstep', style: { stroke: '#10b981' } },

    // API to Database connections
    { id: 'e12', source: 'chat-api', target: 'convex-db', type: 'smoothstep', style: { stroke: '#8b5cf6' } },
    { id: 'e13', source: 'friends-api', target: 'prisma-db', type: 'smoothstep', style: { stroke: '#8b5cf6' } },

    // Database to Convex Functions
    { id: 'e14', source: 'convex-db', target: 'convex-functions', type: 'smoothstep', style: { stroke: '#8b5cf6' } },

    // External service connections
    { id: 'e15', source: 'chat-api', target: 'groq-llm', type: 'smoothstep', style: { stroke: '#64748b' } },
    { id: 'e16', source: 'chat-api', target: 'openrouter-llm', type: 'smoothstep', style: { stroke: '#64748b' } },
    { id: 'e17', source: 'chat-api', target: 'vercel-ai', type: 'smoothstep', style: { stroke: '#64748b' } },

    // State management
    { id: 'e18', source: 'chat-component', target: 'jotai-state', type: 'smoothstep', style: { stroke: '#8b5cf6' } },

    // Data flow connections (dashed for real-time updates)
    { id: 'e19', source: 'convex-functions', target: 'chat-component', type: 'smoothstep', style: { stroke: '#8b5cf6', strokeDasharray: '5,5' } },
];

// export default function App() {
//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//     </div>
//   );
// }
