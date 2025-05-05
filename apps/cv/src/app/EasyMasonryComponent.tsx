'use client'
import { Masonry } from '@/components/service/Masonry';
import * as React from 'react';

let i = 0;
const items = Array.from(Array(5000), () => ({ id: i++ }));

export const EasyMasonryComponent = (props) => <Masonry items={items} render={MasonryCard} />;

const MasonryCard = ({ index, data: { id }, width }) => (
    <div>
        <div>Index: {index}</div>
        <pre>ID: {id}</pre>
        <div>Column width: {width}</div>
    </div>
);
