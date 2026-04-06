/**
 * ForgotPassword — Formulario de Recuperación de Contraseña
 *
 * Permite al usuario solicitar un enlace de reseteo a su correo.
 * Usa react-hook-form para validaciones cliente, muestra spinner
 * durante la petición y feedback de éxito/error consistente con
 * el design system de KN-Store.
 *
 * @param {Function} onBack - Callback para volver al modo login
 */
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPassword = ({ onBack }) => {
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setFeedback({ type: '', message: '' });
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setFeedback({
        type: 'ok',
        message: 'Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'No se pudo enviar el correo. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Motion.div
      key="forgot"
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Mail size={16} style={{ color: 'var(--color-accent, #6366f1)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted, #9ca3af)' }}>
            Recuperar contraseña
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #9ca3af)', margin: 0, lineHeight: 1.5 }}>
          Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
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
        <div className="field">
          <label className="field__label">Correo electrónico</label>
          <input
            id="forgot-email"
            className={`field__input${errors.email ? ' field__input--error' : ''}`}
            type="email"
            placeholder="tu@correo.com"
            disabled={isLoading}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo con formato válido',
              },
            })}
          />
          {errors.email && (
            <span className="field__error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: 'var(--color-error, #ef4444)' }}>
              <AlertCircle size={11} />
              {errors.email.message}
            </span>
          )}
        </div>

        <button
          id="forgot-submit-btn"
          type="submit"
          className="btn btn-primary btn-full auth-shell__submit"
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
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
