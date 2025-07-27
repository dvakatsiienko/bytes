'use client';

import { useCallback } from 'react';
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '@/elements/FlowNode';

/* Data */
import { initialEdges, initialNodes } from '@/data/flowData';

export default function HomePage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <main className='h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <ReactFlow
        className='bg-transparent'
        connectionMode={ConnectionMode.Loose}
        edges={edges}
        elementsSelectable={true}
        fitView
        nodes={nodes}
        nodesConnectable={true}
        nodesDraggable={true}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}>
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
