
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ email: z.string().email('Should be valid email.') });

export const resolver = zodResolver(schema);

/* Types */
export type FormShape = z.infer<typeof schema>;
