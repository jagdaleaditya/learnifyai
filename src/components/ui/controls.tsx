// Switch, Checkbox, Progress, Slider, RadioGroup, Separator, Avatar, Skeleton
import * as React from 'react';
import * as SwitchP from '@radix-ui/react-switch';
import * as CheckboxP from '@radix-ui/react-checkbox';
import * as ProgressP from '@radix-ui/react-progress';
import * as SliderP from '@radix-ui/react-slider';
import * as RadioP from '@radix-ui/react-radio-group';
import * as SepP from '@radix-ui/react-separator';
import * as AvatarP from '@radix-ui/react-avatar';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchP.Root>, React.ComponentPropsWithoutRef<typeof SwitchP.Root>>(({ className, ...props }, ref) => (
  <SwitchP.Root ref={ref} className={cn('peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', className)} {...props}>
    <SwitchP.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
  </SwitchP.Root>
));
Switch.displayName = 'Switch';

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxP.Root>, React.ComponentPropsWithoutRef<typeof CheckboxP.Root>>(({ className, ...props }, ref) => (
  <CheckboxP.Root ref={ref} className={cn('peer h-4 w-4 shrink-0 rounded-[5px] border border-input shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', className)} {...props}>
    <CheckboxP.Indicator className="flex items-center justify-center"><Check className="h-3 w-3" strokeWidth={3} /></CheckboxP.Indicator>
  </CheckboxP.Root>
));
Checkbox.displayName = 'Checkbox';

export const Progress = React.forwardRef<React.ElementRef<typeof ProgressP.Root>, React.ComponentPropsWithoutRef<typeof ProgressP.Root> & { indicatorClassName?: string }>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressP.Root ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)} {...props}>
    <ProgressP.Indicator className={cn('h-full w-full flex-1 rounded-full bg-brand-gradient transition-all duration-500', indicatorClassName)} style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressP.Root>
));
Progress.displayName = 'Progress';

export const Slider = React.forwardRef<React.ElementRef<typeof SliderP.Root>, React.ComponentPropsWithoutRef<typeof SliderP.Root>>(({ className, ...props }, ref) => (
  <SliderP.Root ref={ref} className={cn('relative flex w-full touch-none select-none items-center', className)} {...props}>
    <SliderP.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"><SliderP.Range className="absolute h-full bg-brand-gradient" /></SliderP.Track>
    <SliderP.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-card shadow transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30" aria-label="Value" />
  </SliderP.Root>
));
Slider.displayName = 'Slider';

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioP.Root>, React.ComponentPropsWithoutRef<typeof RadioP.Root>>(({ className, ...props }, ref) => (
  <RadioP.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';
export const RadioGroupItem = RadioP.Item;

export const Separator = React.forwardRef<React.ElementRef<typeof SepP.Root>, React.ComponentPropsWithoutRef<typeof SepP.Root>>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SepP.Root ref={ref} decorative={decorative} orientation={orientation} className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...props} />
));
Separator.displayName = 'Separator';

export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarP.Root>, React.ComponentPropsWithoutRef<typeof AvatarP.Root>>(({ className, ...props }, ref) => (
  <AvatarP.Root ref={ref} className={cn('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full', className)} {...props} />
));
Avatar.displayName = 'Avatar';
export const AvatarImage = AvatarP.Image;
export const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarP.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarP.Fallback>>(({ className, ...props }, ref) => (
  <AvatarP.Fallback ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white', className)} {...props} />
));
AvatarFallback.displayName = 'AvatarFallback';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />;
}
