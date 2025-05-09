import * as React from 'react';
import { type VariantProps } from 'cva';
declare function Button({ className, variant, size, asChild, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare const buttonVariants: (props?: ({
    variant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | undefined;
    size?: "default" | "sm" | "lg" | "icon" | undefined;
} & ({
    class?: import("cva").ClassValue;
    className?: never;
} | {
    class?: never;
    className?: import("cva").ClassValue;
})) | undefined) => string;
export { Button, buttonVariants };
//# sourceMappingURL=button.d.ts.map