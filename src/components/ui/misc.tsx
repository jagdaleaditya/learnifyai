// Accordion, Popover, Table
import * as React from 'react';
import * as Acc from '@radix-ui/react-accordion';
import * as Pop from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = Acc.Root;
export const AccordionItem = React.forwardRef<React.ElementRef<typeof Acc.Item>, React.ComponentPropsWithoutRef<typeof Acc.Item>>(({ className, ...props }, ref) => (
  <Acc.Item ref={ref} className={cn('border-b last:border-b-0', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';
export const AccordionTrigger = React.forwardRef<React.ElementRef<typeof Acc.Trigger>, React.ComponentPropsWithoutRef<typeof Acc.Trigger>>(({ className, children, ...props }, ref) => (
  <Acc.Header className="flex">
    <Acc.Trigger ref={ref} className={cn('flex flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180', className)} {...props}>
      {children}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </Acc.Trigger>
  </Acc.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';
export const AccordionContent = React.forwardRef<React.ElementRef<typeof Acc.Content>, React.ComponentPropsWithoutRef<typeof Acc.Content>>(({ className, children, ...props }, ref) => (
  <Acc.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
    <div className={cn('pb-4 text-muted-foreground', className)}>{children}</div>
  </Acc.Content>
));
AccordionContent.displayName = 'AccordionContent';

export const Popover = Pop.Root;
export const PopoverTrigger = Pop.Trigger;
export const PopoverContent = React.forwardRef<React.ElementRef<typeof Pop.Content>, React.ComponentPropsWithoutRef<typeof Pop.Content>>(({ className, align = 'end', sideOffset = 8, ...props }, ref) => (
  <Pop.Portal>
    <Pop.Content ref={ref} align={align} sideOffset={sideOffset}
      className={cn('z-50 w-80 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lift outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)} {...props} />
  </Pop.Portal>
));
PopoverContent.displayName = 'PopoverContent';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...p }, ref) => (
  <div className="relative w-full overflow-x-auto"><table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...p} /></div>
));
Table.displayName = 'Table';
export const THead = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('[&_tr]:border-b', className)} {...p} />;
export const TBody = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...p} />;
export const TR = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...p} />;
export const TH = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn('h-10 whitespace-nowrap px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground', className)} {...p} />;
export const TD = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-4 py-3 align-middle', className)} {...p} />;
