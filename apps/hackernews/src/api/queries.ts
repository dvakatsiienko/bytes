/* Core */
import { useQuery } from '@tanstack/react-query';

export async function getTodo1() {
    const r = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const a = await r.json();

    return a;
}

export const useTodo1Query = () => useQuery({ queryKey: [ 'todo-1' ], queryFn: getTodo1 });
