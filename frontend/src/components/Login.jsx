import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const { login, logout, loading, user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await login(email, password);
      // El login fue exitoso, el usuario se actualizará en el contexto
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Si el usuario ya está autenticado, mostrar mensaje
  if (user) {
    return (
      <section className="panel legacy-auth-card">
        <h2>¡Bienvenido, {user.name}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p><strong>ID:</strong> {user._id}</p>

        <button
          onClick={logout}
          className="btn btn-danger legacy-auth-logout"
        >
          Cerrar Sesión
        </button>
      </section>
    );
  }

  return (
    <section className="panel legacy-auth-panel">
      <h1>Login</h1>

      {localError && (
        <div className="feedback feedback--error">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label htmlFor="email" className="field__label">
            Email:
          </label>
          <input
            id="email"
            className="field__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="password" className="field__label">
            Contraseña:
          </label>
          <input
            id="password"
            className="field__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="tu contraseña"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="legacy-auth-help">
        <p>Credenciales de prueba:</p>
        <ul>
          <li>Admin: admin@knstore.com / password123</li>
          <li>Manager: manager@knstore.com / password123</li>
          <li>Client: cliente@gmail.com / password123</li>
        </ul>
      </div>
    </section>
  );
};
