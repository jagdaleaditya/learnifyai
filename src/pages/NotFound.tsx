import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/common';

export default function NotFound() {
  return (
    <EmptyState className="mt-10" icon={Compass} title="Page not found" description="The page you’re looking for doesn’t exist or has moved."
      action={<div className="flex gap-2"><Button variant="outline" asChild><Link to="/courses">My courses</Link></Button><Button variant="gradient" asChild><Link to="/dashboard">Go to dashboard</Link></Button></div>} />
  );
}
