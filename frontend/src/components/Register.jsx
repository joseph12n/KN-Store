import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

// Registro público para validar POST /api/users/register desde UI.
export const Register = () => {
  const { register, loading } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.last_name || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar términos para probar el autoregistro.');
      return;
    }

    try {
      // El backend devuelve token, por lo que el usuario queda autenticado.
      await register(form);
      setSuccess('Registro exitoso. Se inició sesión automáticamente.');
    } catch (err) {
      setError(err.message || 'No se pudo registrar el usuario');
    }
  };

  return (
    <section className="panel">
      <h2>Autoregistro (Público)</h2>
      <p className="panel-text">Este flujo no requiere sesión y crea usuarios con rol Client.</p>

      {error && <p className="error-box">{error}</p>}
      {success && <p className="ok-box">{success}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Nombre
          <input name="name" value={form.name} onChange={onChange} type="text" />
        </label>

        <label>
          Apellido
          <input name="last_name" value={form.last_name} onChange={onChange} type="text" />
        </label>

        <label>
          Email
          <input name="email" value={form.email} onChange={onChange} type="email" />
        </label>

        <label>
          Contraseña
          <input name="password" value={form.password} onChange={onChange} type="password" />
        </label>

        <label className="inline-check">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
          />
          Acepto términos de prueba
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>
    </section>
  );
};
