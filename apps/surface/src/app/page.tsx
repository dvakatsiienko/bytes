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
    ConnectionMode,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* Components */
import { nodeTypes } from '@/components/FlowNodes';

/* Data */
import { initialNodes, initialEdges } from '@/data/flowData';

export default function HomePage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    // const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    // const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);join

    return (
        <main className='h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                className='bg-transparent'
                nodeTypes={nodeTypes}
                nodesDraggable={true}
                nodesConnectable={true}
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
