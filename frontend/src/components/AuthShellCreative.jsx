import { useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { KeyRound, UserPlus, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ForgotPassword } from './ForgotPassword';
import { ResetPassword } from './ResetPassword';

const initialRegisterState = { name: '', last_name: '', email: '', password: '' };

const formVariant = (dir) => ({
  initial: { opacity: 0, x: dir * 22 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: dir * -16 },
});

export const AuthShellCreative = () => {
  const reduceMotion = useReducedMotion();
  const { login, register, loading } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [resetToken, setResetToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Detectar token de reseteo en la URL al montar el componente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
    }
  }, []);

  const roleHints = useMemo(
    () => [
      { role: 'Admin', desc: 'Control total del catálogo y gestión de usuarios.' },
      { role: 'Manager', desc: 'Gestión operativa del catálogo y stock.' },
      { role: 'Client', desc: 'Compras, perfil y experiencia personalizada.' },
    ],
    []
  );

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

  const handleModeChange = (next) => {
    setFeedback({ type: '', message: '' });
    setMode(next);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!loginForm.email || !loginForm.password) {
      setFeedback({ type: 'error', message: 'Completa email y contraseña.' });
      return;
    }

    try {
      await login(loginForm.email, loginForm.password);
      setFeedback({ type: 'ok', message: 'Sesión iniciada correctamente.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'No se pudo iniciar sesión.' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!registerForm.name || !registerForm.last_name || !registerForm.email || !registerForm.password) {
      setFeedback({ type: 'error', message: 'Completa todos los campos.' });
      return;
    }

    try {
      await register(registerForm);
      setFeedback({ type: 'ok', message: 'Cuenta creada e ingreso exitoso.' });
      setRegisterForm(initialRegisterState);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'No se pudo completar el registro.' });
    }
  };

  return (
    <section className="auth-shell">
      {/* ── Visual panel (left) ── */}
      <div className="auth-shell__visual">
        <Motion.p
          className="auth-shell__eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.06 }}
        >
          KN-Store — Identity Access
        </Motion.p>

        <Motion.h2
          className="auth-shell__title"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.14 }}
        >
          Un acceso con
          <br />
          <mark className="auth-shell__mark">carácter propio.</mark>
        </Motion.h2>

        <Motion.ul
          className="auth-shell__roles"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.24 }}
        >
          {roleHints.map(({ role, desc }) => (
            <li key={role}>
              <span className="role-dot" />
              <div>
                <strong className="auth-shell__role-title">
                  {role}
                </strong>
                <br />
                {desc}
              </div>
            </li>
          ))}
        </Motion.ul>
      </div>

      {/* ── Form panel (right) ── */}
      <div className="auth-shell__form-wrap">
        <div className="auth-shell__hint-row">
          <ShieldCheck size={18} className="auth-shell__hint-icon" />
          <p className="auth-shell__hint-text">
            {mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </p>
        </div>

        {/* Mode switch — solo visible en login/register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-shell__switch" role="tablist" aria-label="Modo de autenticación">
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => handleModeChange('login')}
            >
              <KeyRound size={12} className="auth-shell__switch-icon" />
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => handleModeChange('register')}
            >
              <UserPlus size={12} className="auth-shell__switch-icon" />
              Registro
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback.message && (
          <p className={`feedback feedback--${feedback.type === 'error' ? 'error' : 'ok'}`}>
            {feedback.type === 'error'
              ? <AlertCircle size={14} />
              : <CheckCircle size={14} />}
            {feedback.message}
          </p>
        )}

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <Motion.form
              key="login"
              onSubmit={handleLogin}
              {...formVariant(1)}
              transition={transition}
            >
              <div className="field">
                <label className="field__label">Email</label>
                <input
                  className="field__input"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="manager@knstore.com"
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label className="field__label">Contraseña</label>
                <input
                  className="field__input"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button className="btn btn-primary btn-full auth-shell__submit" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar al sistema'}
              </button>

              {/* Enlace recuperación de contraseña */}
              <button
                id="forgot-password-link"
                type="button"
                onClick={() => handleModeChange('forgot')}
                style={{
                  marginTop: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--color-text-muted, #9ca3af)',
                  textDecoration: 'underline',
                  padding: 0,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </Motion.form>
          )}

          {mode === 'register' && (
            <Motion.form
              key="register"
              onSubmit={handleRegister}
              {...formVariant(-1)}
              transition={transition}
            >
              <div className="field__row">
                <div className="field">
                  <label className="field__label">Nombre</label>
                  <input
                    className="field__input"
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div className="field">
                  <label className="field__label">Apellido</label>
                  <input
                    className="field__input"
                    type="text"
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, last_name: e.target.value }))}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field__label">Email</label>
                <input
                  className="field__input"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label className="field__label">Contraseña</label>
                <input
                  className="field__input"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <button className="btn btn-primary btn-full auth-shell__submit" type="submit" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </Motion.form>
          )}

          {mode === 'forgot' && (
            <ForgotPassword
              key="forgot"
              onBack={() => handleModeChange('login')}
            />
          )}

          {mode === 'reset' && (
            <ResetPassword
              key="reset"
              token={resetToken}
              onBack={() => handleModeChange('login')}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
