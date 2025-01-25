/* Core */
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const baseSchema = z.object({
    email:           z.string().email('Should be a valid email.'),
    password:        z.string().min(4, 'Minimum 4 characters.'),
    name:            z.string().min(4, 'Minimum 4 characters.'),
    confirmPassword: z.string().min(4, 'Minimum 4 characters.'),
});

export const createResolver = (isLogin: boolean) => {
    if (isLogin) {
        return zodResolver(baseSchema.pick({ email: true, password: true }));
    }

    if (!isLogin) {
        return zodResolver(baseSchema.superRefine(({ confirmPassword, password }, ctx) => {
                if (confirmPassword !== password) {
                    ctx.addIssue({
                        code:    'custom',
                        message: 'The passwords did not match',
                    });
                }
            }));
    }
};

/* Types */
export type FormShape = z.infer<typeof baseSchema>;
