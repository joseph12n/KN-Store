/**
 * ResetPassword — Formulario para Establecer Nueva Contraseña
 *
 * Recibe el token de la URL (vía prop) y permite al usuario
 * definir una nueva contraseña. Valida con react-hook-form:
 * mínimo 6 caracteres y coincidencia entre los dos campos.
 *
 * @param {string} token  - Token de recuperación extraído de la URL
 * @param {Function} onBack - Callback para volver al modo login
 */
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export const ResetPassword = ({ token, onBack }) => {
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async ({ password }) => {
    setFeedback({ type: '', message: '' });
    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setFeedback({
        type: 'ok',
        message: 'Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.div
      key="reset"
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Lock size={16} style={{ color: 'var(--color-accent, #6366f1)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted, #9ca3af)' }}>
            Nueva contraseña
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #9ca3af)', margin: 0, lineHeight: 1.5 }}>
          Crea una nueva contraseña segura para tu cuenta. Mínimo 6 caracteres.
        </p>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <p className={`feedback feedback--${feedback.type === 'error' ? 'error' : 'ok'}`}>
          {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {feedback.message}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Nueva contraseña */}
        <div className="field">
          <label className="field__label">Nueva contraseña</label>
          <input
            id="reset-password"
            className={`field__input${errors.password ? ' field__input--error' : ''}`}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'Debe tener al menos 6 caracteres',
              },
            })}
          />
          {errors.password && (
            <span className="field__error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: 'var(--color-error, #ef4444)' }}>
              <AlertCircle size={11} />
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="field">
          <label className="field__label">Confirmar contraseña</label>
          <input
            id="reset-confirm-password"
            className={`field__input${errors.confirmPassword ? ' field__input--error' : ''}`}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('confirmPassword', {
              required: 'Debes confirmar tu contraseña',
              validate: (value) =>
                value === passwordValue || 'Las contraseñas no coinciden',
            })}
          />
          {errors.confirmPassword && (
            <span className="field__error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: 'var(--color-error, #ef4444)' }}>
              <AlertCircle size={11} />
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          id="reset-submit-btn"
          type="submit"
          className="btn btn-primary btn-full auth-shell__submit"
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Guardando...
            </>
          ) : (
            'Guardar nueva contraseña'
          )}
        </button>
      </form>

      {/* Volver al login */}
      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--color-text-muted, #9ca3af)',
          padding: 0,
        }}
      >
        <ArrowLeft size={12} />
        Volver al login
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Motion.div>
  );
};
