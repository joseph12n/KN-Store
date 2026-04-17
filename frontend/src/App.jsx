import { useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
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
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AuthShellCreative } from './components/AuthShellCreative';
import { UsersCrudPanel } from './components/UsersCrudPanel';
import { PublicStoreHome } from './components/PublicStoreHome';
import { CategoriesCrudPanel } from './components/CategoriesCrudPanel';
import { SubcategoriesCrudPanel } from './components/SubcategoriesCrudPanel';
import { ProductsCrudPanel } from './components/ProductsCrudPanel';
import { MyProfilePanel } from './components/MyProfilePanel';
import { DynamicCursor } from './components/DynamicCursor';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.36, ease: [0.22, 1, 0.36, 1] };

const navContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
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

const AppContent = () => {
  const reduceMotion = useReducedMotion();
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('store');
  const [verifiedBanner, setVerifiedBanner] = useState(null); // 'success' | 'error' | null
  const isClient = user?.role === 'Client';
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

  const navItems = useMemo(() => {
    if (!user) {
      return [
        { id: 'store', label: 'Tienda', icon: ShoppingBag },
        { id: 'auth', label: 'Acceso', icon: KeyRound },
      ];
    }

    if (isClient) {
      return [
        { id: 'store', label: 'Catalogo', icon: ShoppingBag },
        { id: 'profile', label: 'Mi Cuenta', icon: User },
      ];
    }

    return [
      { id: 'store', label: 'Tienda', icon: ShoppingBag },
      { id: 'profile', label: 'Mi Perfil', icon: User },
      { id: 'categories', label: 'Categorias', icon: Tag },
      { id: 'subcategories', label: 'Subcategorias', icon: Layers },
      { id: 'products', label: 'Productos', icon: Package },
      ...(isAdmin ? [{ id: 'users', label: 'Usuarios', icon: Users }] : []),
    ];
  }, [user, isAdmin, isClient]);

  useEffect(() => {
    const allowed = new Set(navItems.map((item) => item.id));
    if (!allowed.has(tab)) {
      setTab('store');
    }
  }, [navItems, tab]);

  // Detectar resultado de verificación de correo (redirect desde el backend)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    if (verified === 'true') {
      setVerifiedBanner('success');
      // Limpiar el param de la URL sin recargar
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setVerifiedBanner(null), 5000);
    } else if (verified === 'false') {
      setVerifiedBanner('error');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setVerifiedBanner(null), 5000);
    }
  }, []);

  return (
    <>
      <Motion.nav
        className="kn-nav"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="kn-nav__brand">
          <img
            className="kn-nav__logo-img"
            src="/kn-store-logo.png"
            alt="KN Store"
            onError={(event) => {
              if (!event.currentTarget.dataset.fallbackApplied) {
                event.currentTarget.dataset.fallbackApplied = 'true';
                event.currentTarget.src = '/kn-store-logo.svg';
                return;
              }

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
          {navItems.map(({ id, label, icon: Icon }) => (
            <Motion.button
              key={id}
              type="button"
              className={`kn-nav__btn${tab === id ? ' is-active' : ''}`}
              onClick={() => setTab(id)}
              variants={reduceMotion ? undefined : navItemVariants}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Icon size={13} />
              {label}
            </Motion.button>
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

      {/* Banner de verificaci\u00f3n de correo */}
      {verifiedBanner && (
        <Motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          style={{
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            background: verifiedBanner === 'success'
              ? 'linear-gradient(135deg,#064e3b,#065f46)'
              : 'linear-gradient(135deg,#7f1d1d,#991b1b)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {verifiedBanner === 'success'
            ? '✅ Correo verificado exitosamente. ¡Ya puedes iniciar sesión!'
            : '❌ El enlace de verificación no es válido o ya fue utilizado.'}
        </Motion.div>
      )}

      <main className="kn-main">
        <AnimatePresence mode="wait">
          <Motion.div
            key={tab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {tab === 'store' && <PublicStoreHome />}
            {/* Guard: auth solo si no hay sesión activa */}
            {tab === 'auth' && !user && <AuthShellCreative />}
            {/* Guard: perfil solo si hay sesión */}
            {tab === 'profile' && user && <MyProfilePanel />}
            {/* Guard: paneles de gestión solo para Manager o Admin */}
            {tab === 'categories' && (isManager || isAdmin) && <CategoriesCrudPanel />}
            {tab === 'subcategories' && (isManager || isAdmin) && <SubcategoriesCrudPanel />}
            {tab === 'products' && (isManager || isAdmin) && <ProductsCrudPanel />}
            {/* Guard: panel de usuarios solo para Admin */}
            {tab === 'users' && isAdmin && <UsersCrudPanel />}
          </Motion.div>
        </AnimatePresence>
      </main>

      <DynamicCursor />
    </>
  );
};


function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
