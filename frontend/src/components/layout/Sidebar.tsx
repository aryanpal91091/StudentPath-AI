'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, Compass, Map, Users, BookOpen,
  GraduationCap, Settings, CreditCard, FileText,
  BarChart3, Star, ChevronLeft, ChevronRight,
  LogOut
} from 'lucide-react';
import { useState } from 'react';

const studentLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities', icon: Compass, label: 'Opportunities' },
  { href: '/career-guidance', icon: Star, label: 'Career AI' },
  { href: '/roadmap', icon: Map, label: 'My Roadmap' },
  { href: '/counsellors', icon: Users, label: 'Counsellors' },
  { href: '/applications', icon: FileText, label: 'Applications' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/premium', icon: CreditCard, label: 'Go Premium', premium: true },
];

const counsellorLinks = [
  { href: '/counsellor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/counsellor/students', icon: Users, label: 'Students' },
  { href: '/counsellor/availability', icon: BookOpen, label: 'Availability' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { href: '/admin', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links =
    user?.role === 'STUDENT' ? studentLinks :
    user?.role === 'COUNSELLOR' ? counsellorLinks :
    adminLinks;

  const profile = user?.studentProfile || user?.counsellorProfile || user?.adminProfile;
  const name = (profile as any)?.name || user?.email || 'User';
  const initial = name[0]?.toUpperCase() || '?';
  const w = collapsed ? 64 : 240;

  return (
    <>
      {/* Sidebar on Desktop / Tablet (hidden on small mobile screens to rely on mobile Navbar menu) */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          width: w,
          minWidth: w,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Profile */}
        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0,
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
              }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{name}</p>
                <p style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px' : '9px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#4338ca' : '#475569',
                background: active ? '#eef2ff' : 'transparent',
                borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}>
                <link.icon size={17} style={{ flexShrink: 0, color: active ? '#4f46e5' : '#64748b' }} />
                {!collapsed && <span style={{ flex: 1 }}>{link.label}</span>}
                {!collapsed && (link as any).premium && user?.role === 'STUDENT' && !user?.studentProfile?.premiumStatus && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 99,
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    color: '#fff', fontWeight: 800, letterSpacing: '0.05em',
                  }}>PRO</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout + Collapse */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#e11d48', fontSize: 13, fontWeight: 500,
          }}>
            <LogOut size={15} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '6px', borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: 11,
          }}>
            {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={14} /><span style={{ marginLeft: 6 }}>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
