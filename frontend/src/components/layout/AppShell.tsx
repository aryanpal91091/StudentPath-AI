'use client';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';

/**
 * AppShell wraps every authenticated page.
 * Structure:
 *   <fixed Navbar h-16>
 *   <div flex row below navbar>
 *     <sticky Sidebar>
 *     <scrollable main content>
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: '#050816' }}>
      {/* Fixed top nav */}
      <Navbar />

      {/* Body: sidebar + main — sits below the 64px navbar */}
      <div style={{
        display: 'flex',
        paddingTop: 64,        // offset for fixed navbar
        minHeight: '100vh',
      }}>
        {/* Sidebar: only rendered when logged in */}
        {isAuthenticated && <Sidebar />}

        {/* Main scrollable content */}
        <main style={{
          flex: 1,
          minWidth: 0,          // prevent flex overflow
          overflowX: 'hidden',
          padding: '24px',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
