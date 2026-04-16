'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { User, Mail, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';

const ROLE_CLASS = { Admin: 'admin', Manager: 'manager', Client: 'client' };

const itemV = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.36, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function MyProfilePanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div>
      <div className="section-header">
        <div>
          <p className="section-label">Sesion</p>
          <h2>Mi Cuenta</h2>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={loadProfile} disabled={loading}>
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      <p className="feedback feedback--info">
        <ShieldCheck size={14} />
        Solo puedes ver tu propio usuario desde esta vista.
      </p>

      {error && (
        <p className="feedback feedback--error">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      <div className="admin-panel">
        <div className="admin-forms">
          <Motion.div className="panel-card" custom={0} variants={itemV} initial="hidden" animate="show">
            <div className="panel-card__head">
              <div className="panel-card__icon">
                <User size={14} />
              </div>
              <h3>Datos del perfil</h3>
            </div>
            <div className="panel-card__body">
              <div className="field">
                <span className="field__label">Nombre</span>
                <p className="profile-value">{profile ? `${profile.name || ''} ${profile.last_name || ''}`.trim() : 'Cargando...'}</p>
              </div>
              <div className="field">
                <span className="field__label">Email</span>
                <p className="profile-value">{profile?.email || 'Cargando...'}</p>
              </div>
              <div className="field">
                <span className="field__label">Rol</span>
                <p>
                  <span className={`role-badge role-badge--${ROLE_CLASS[profile?.role] || 'client'}`}>
                    {profile?.role || 'Client'}
                  </span>
                </p>
              </div>
              <div className="field">
                <span className="field__label">Estado</span>
                <p className="profile-value">{profile?.active === false ? 'Inactivo' : 'Activo'}</p>
              </div>
            </div>
          </Motion.div>
        </div>

        <Motion.div className="panel-card" custom={1} variants={itemV} initial="hidden" animate="show">
          <div className="panel-card__head">
            <div className="panel-card__icon">
              <Mail size={14} />
            </div>
            <h3>Acceso por rol</h3>
          </div>
          <div className="panel-card__body">
            <ul className="profile-rules">
              <li>Client: ve su usuario y el catalogo publico de productos.</li>
              <li>Manager: puede crear y actualizar recursos del catalogo.</li>
              <li>Admin: acceso total incluyendo usuarios y eliminaciones finales.</li>
            </ul>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
