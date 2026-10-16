import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './lib/store';
import { AppLayout } from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CreateCourse = lazy(() => import('./pages/CreateCourse'));
const Studio = lazy(() => import('./pages/Studio'));
const Verification = lazy(() => import('./pages/Verification'));
const Reports = lazy(() => import('./pages/Reports'));
const Upgrades = lazy(() => import('./pages/Upgrades'));
const Coverage = lazy(() => import('./pages/Coverage'));
const Resources = lazy(() => import('./pages/Resources'));
const BrandKit = lazy(() => import('./pages/BrandKit'));
const Exports = lazy(() => import('./pages/Exports'));
const Settings = lazy(() => import('./pages/Settings'));
const Team = lazy(() => import('./pages/Team'));
const Help = lazy(() => import('./pages/Help'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useStore();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

function Blank() {
  return <div className="min-h-screen bg-background" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<Blank />}><Landing /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<Blank />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<Blank />}><Register /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<Blank />}><ForgotPassword /></Suspense>} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/new" element={<CreateCourse />} />
        <Route path="/studio" element={<Navigate to="/studio/java-oop" replace />} />
        <Route path="/studio/:id" element={<Studio />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/upgrades" element={<Upgrades />} />
        <Route path="/coverage" element={<Coverage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/brand-kit" element={<BrandKit />} />
        <Route path="/exports" element={<Exports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team" element={<Team />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

