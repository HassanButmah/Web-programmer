'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/', label: 'Map', icon: '🗺️' },
  { href: '/feed', label: 'Feed', icon: '📖' },
  { href: '/explore', label: 'Explore', icon: '🏙️' },
  { href: '/trending', label: 'Trending', icon: '🔥' },
  { href: '/add', label: 'Add', icon: '✨' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMapPage = pathname === '/';

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-1 glass-card p-2">
        <Link href="/" className="px-3 py-2 mb-2 text-center">
          <span className="text-xl font-display font-bold text-balad-accent">BV</span>
        </Link>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? 'bg-balad-accent/20 text-balad-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </motion.span>
            </Link>
          );
        })}
        {user && (
          <div className="mt-2 pt-2 border-t border-white/10 px-3 py-2 text-xs text-balad-gold">
            {user.points} pts
          </div>
        )}
      </nav>

      {/* Mobile bottom bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 ${
          isMapPage ? 'pb-safe' : ''
        }`}
      >
        <div className="flex justify-around items-center py-2 px-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs ${
                  active ? 'text-balad-accent' : 'text-gray-500'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
