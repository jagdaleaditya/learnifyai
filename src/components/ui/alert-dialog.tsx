import * as React from 'react';
import * as A from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export const AlertDialog = A.Root;
export const AlertDialogTrigger = A.Trigger;
export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof A.Content>, React.ComponentPropsWithoutRef<typeof A.Content>>(({ className, ...props }, ref) => (
  <A.Portal>
    <A.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <A.Content ref={ref} className={cn('fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-card p-6 shadow-lift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...props} />
  </A.Portal>
));
AlertDialogContent.displayName = 'AlertDialogContent';
export const AlertDialogHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col gap-1.5', className)} {...p} />;
export const AlertDialogFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...p} />;
export const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof A.Title>, React.ComponentPropsWithoutRef<typeof A.Title>>(({ className, ...props }, ref) => <A.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />);
AlertDialogTitle.displayName = 'AlertDialogTitle';
export const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof A.Description>, React.ComponentPropsWithoutRef<typeof A.Description>>(({ className, ...props }, ref) => <A.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />);
AlertDialogDescription.displayName = 'AlertDialogDescription';
export const AlertDialogAction = React.forwardRef<React.ElementRef<typeof A.Action>, React.ComponentPropsWithoutRef<typeof A.Action> & { destructive?: boolean }>(({ className, destructive, ...props }, ref) => <A.Action ref={ref} className={cn(buttonVariants({ variant: destructive ? 'destructive' : 'default' }), className)} {...props} />);
AlertDialogAction.displayName = 'AlertDialogAction';
export const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof A.Cancel>, React.ComponentPropsWithoutRef<typeof A.Cancel>>(({ className, ...props }, ref) => <A.Cancel ref={ref} className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />);
AlertDialogCancel.displayName = 'AlertDialogCancel';
