import * as React from 'react';
import * as D from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = D.Root;
export const DropdownMenuTrigger = D.Trigger;
export const DropdownMenuGroup = D.Group;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(({ className, sideOffset = 6, ...props }, ref) => (
  <D.Portal>
    <D.Content ref={ref} sideOffset={sideOffset}
      className={cn('z-50 min-w-[10rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lift data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...props} />
  </D.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof D.Item>, React.ComponentPropsWithoutRef<typeof D.Item> & { destructive?: boolean }>(({ className, destructive, ...props }, ref) => (
  <D.Item ref={ref}
    className={cn('relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground', destructive && 'text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 [&_svg]:text-red-500', className)} {...props} />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';
export const DropdownMenuLabel = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)} {...p} />;
export const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof D.Separator>, React.ComponentPropsWithoutRef<typeof D.Separator>>(({ className, ...props }, ref) => (
  <D.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
