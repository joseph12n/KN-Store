'use client';

import { useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import {
  ShoppingBag,
  User,
  Tag,
  Layers,
  Package,
  Users,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const navContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

const ROLE_CLASS = { Admin: 'admin', Manager: 'manager', Client: 'client' };

export default function Navbar() {
  const reduceMotion = useReducedMotion();
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();

  const isClient = user?.role === 'Client';
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

  const navItems = useMemo(() => {
    if (!user) {
      return [
        { href: '/', label: 'Tienda', icon: ShoppingBag },
        { href: '/auth', label: 'Acceso', icon: KeyRound },
      ];
    }

    if (isClient) {
      return [
        { href: '/', label: 'Catalogo', icon: ShoppingBag },
        { href: '/profile', label: 'Mi Cuenta', icon: User },
      ];
    }

    return [
      { href: '/', label: 'Tienda', icon: ShoppingBag },
      { href: '/profile', label: 'Mi Perfil', icon: User },
      { href: '/admin/categories', label: 'Categorias', icon: Tag },
      { href: '/admin/subcategories', label: 'Subcategorias', icon: Layers },
      { href: '/admin/products', label: 'Productos', icon: Package },
      ...(isAdmin ? [{ href: '/admin/users', label: 'Usuarios', icon: Users }] : []),
    ];
  }, [user, isAdmin, isClient]);

  return (
    <Motion.nav
      className="kn-nav"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="kn-nav__brand">
        <img
          className="kn-nav__logo-img"
          src="/kn-store-logo.svg"
          alt="KN Store"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <span className="kn-nav__logo">KN/</span>
      </div>

      <Motion.div
        className="kn-nav__items"
        variants={reduceMotion ? undefined : navContainerVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'show'}
      >
        {navItems.map(({ href, label, icon: Icon }) => (
          <Motion.div key={href} variants={reduceMotion ? undefined : navItemVariants}>
            <Link
              href={href}
              className={`kn-nav__btn${pathname === href ? ' is-active' : ''}`}
            >
              <Icon size={13} />
              {label}
            </Link>
          </Motion.div>
        ))}
      </Motion.div>

      <div className="kn-nav__session">
        {user ? (
          <>
            <div className="kn-nav__user">
              <span className={`role-badge role-badge--${ROLE_CLASS[user.role] ?? 'client'}`}>
                {user.role}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          </>
        ) : (
          <span className="kn-nav__anon">público</span>
        )}
      </div>
    </Motion.nav>
  );
}
