'use client';
/* Core */
import Image from 'next/image';
import { cx } from 'cva';

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
import React, { useCallback } from 'react';

import { addEdge, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function HomePage() {
    // const briefSectionCn = cx('grid grid-cols-[minmax(auto,max-content)_auto] gap-x-4');
    //   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <main
            style={{ width: '100vw', height: '100vh' }}
            className={
                cx('grid h-screen w-screen')
                // 'prose-custom prose-style mx-auto',
                // todo do something with txt size and line height
                // 'max-w-8xl text-sm/snug',
                // '
            }>
            {/* test */}
            {/* <div style={{ width: '100vw', height: '100vh' }}> */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            />
            {/* </div> */}
        </main>
    );
}

const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
// export default function App() {
//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//     </div>
//   );
// }
