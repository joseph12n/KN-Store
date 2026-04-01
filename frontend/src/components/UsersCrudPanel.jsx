import { useContext, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Users, Plus, RefreshCw, Edit3, Trash2, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const panelV = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }),
};

const initialCreate = { name: '', last_name: '', email: '', password: '', role: 'Client' };
const initialUpdate = { userId: '', name: '', last_name: '', email: '', role: '', password: '' };

const ROLE_CLASS = { Admin: 'admin', Manager: 'manager', Client: 'client' };

export const UsersCrudPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [createForm, setCreateForm] = useState(initialCreate);
  const [updateForm, setUpdateForm] = useState(initialUpdate);
  const [deleteId, setDeleteId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const clearFeedback = () => { setMessage(''); setError(''); };

  const handleLoadUsers = async () => {
    setLoading(true);
    clearFeedback();
    try {
      const list = await authService.getUsers();
      setUsers(list);
      setMessage(`${list.length} usuarios cargados`);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      await authService.createUser(createForm);
      setMessage('Usuario creado correctamente');
      setCreateForm(initialCreate);
      await handleLoadUsers();
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      if (!updateForm.userId.trim()) throw new Error('Indica el ID del usuario');
      const payload = {};
      if (updateForm.name.trim()) payload.name = updateForm.name.trim();
      if (updateForm.last_name.trim()) payload.last_name = updateForm.last_name.trim();
      if (updateForm.email.trim()) payload.email = updateForm.email.trim();
      if (updateForm.role) payload.role = updateForm.role;
      if (updateForm.password) payload.password = updateForm.password;
      if (Object.keys(payload).length === 0) throw new Error('Ingresa al menos un campo');
      await authService.updateUser(updateForm.userId.trim(), payload);
      setMessage('Usuario actualizado correctamente');
      setUpdateForm(initialUpdate);
      await handleLoadUsers();
    } catch (err) {
      setError(err.message || 'Error al actualizar');
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteId.trim()) { setError('Indica el ID del usuario'); return; }
    setLoading(true);
    clearFeedback();
    try {
      await authService.deleteUser(deleteId.trim(), false);
      setMessage('Usuario desactivado (soft delete)');
      await handleLoadUsers();
    } catch (err) {
      setError(err.message || 'Error al desactivar');
      setLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!deleteId.trim()) { setError('Indica el ID del usuario'); return; }
    setLoading(true);
    clearFeedback();
    try {
      await authService.deleteUser(deleteId.trim(), true);
      setMessage('Usuario eliminado permanentemente');
      await handleLoadUsers();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
      setLoading(false);
    }
  };

  const setCreate = (key) => (e) => setCreateForm((p) => ({ ...p, [key]: e.target.value }));
  const setUpdate = (key) => (e) => setUpdateForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <div className="section-header">
        <div>
          <p className="section-label">Administración</p>
          <h2>Usuarios</h2>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={handleLoadUsers} disabled={loading}>
          <RefreshCw size={13} /> Cargar
        </button>
      </div>

      {!user && (
        <p className="feedback feedback--warn">
          <ShieldAlert size={14} /> Inicia sesión como Admin para usar este panel.
        </p>
      )}
      {user && !isAdmin && (
        <p className="feedback feedback--warn">
          <ShieldAlert size={14} /> Sesión activa como {user.role}. Las acciones de Admin fallarán con 403.
        </p>
      )}
      {message && <p className="feedback feedback--ok"><CheckCircle size={14} /> {message}</p>}
      {error && <p className="feedback feedback--error"><AlertCircle size={14} /> {error}</p>}

      <div className="admin-panel">
        {/* ── Forms ── */}
        <div className="admin-forms">
          <Motion.div className="panel-card" custom={0} variants={panelV} initial="hidden" animate="show">
            <div className="panel-card__head">
              <div className="panel-card__icon"><Plus size={14} /></div>
              <h3>Crear usuario</h3>
            </div>
            <div className="panel-card__body">
              <form onSubmit={handleCreateUser}>
                <div className="field__row">
                  <div className="field">
                    <label className="field__label">Nombre</label>
                    <input className="field__input" type="text" value={createForm.name} onChange={setCreate('name')} disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Apellido</label>
                    <input className="field__input" type="text" value={createForm.last_name} onChange={setCreate('last_name')} disabled={loading} />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Email</label>
                  <input className="field__input" type="email" value={createForm.email} onChange={setCreate('email')} disabled={loading} />
                </div>
                <div className="field">
                  <label className="field__label">Contraseña</label>
                  <input className="field__input" type="password" value={createForm.password} onChange={setCreate('password')} disabled={loading} />
                </div>
                <div className="field">
                  <label className="field__label">Rol</label>
                  <select className="field__select" value={createForm.role} onChange={setCreate('role')} disabled={loading}>
                    <option value="Client">Client</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  <Plus size={13} /> Crear usuario
                </button>
              </form>
            </div>
          </Motion.div>

          <Motion.div className="panel-card" custom={1} variants={panelV} initial="hidden" animate="show">
            <div className="panel-card__head">
              <div className="panel-card__icon"><Edit3 size={14} /></div>
              <h3>Actualizar usuario</h3>
            </div>
            <div className="panel-card__body">
              <form onSubmit={handleUpdateUser}>
                <div className="field">
                  <label className="field__label">ID Usuario</label>
                  <input className="field__input" type="text" value={updateForm.userId} onChange={setUpdate('userId')} placeholder="6507abc..." disabled={loading} />
                </div>
                <div className="field__row">
                  <div className="field">
                    <label className="field__label">Nombre</label>
                    <input className="field__input" type="text" value={updateForm.name} onChange={setUpdate('name')} disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Apellido</label>
                    <input className="field__input" type="text" value={updateForm.last_name} onChange={setUpdate('last_name')} disabled={loading} />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label">Email</label>
                  <input className="field__input" type="email" value={updateForm.email} onChange={setUpdate('email')} disabled={loading} />
                </div>
                <div className="field">
                  <label className="field__label">Contraseña (opcional)</label>
                  <input className="field__input" type="password" value={updateForm.password} onChange={setUpdate('password')} disabled={loading} />
                </div>
                <div className="field">
                  <label className="field__label">Rol (opcional)</label>
                  <select className="field__select" value={updateForm.role} onChange={setUpdate('role')} disabled={loading}>
                    <option value="">No cambiar</option>
                    <option value="Client">Client</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button className="btn btn-secondary btn-full" type="submit" disabled={loading}>
                  <Edit3 size={13} /> Actualizar
                </button>
              </form>
            </div>
          </Motion.div>

          <Motion.div className="panel-card" custom={2} variants={panelV} initial="hidden" animate="show">
            <div className="panel-card__head">
              <div className="panel-card__icon panel-card__icon--danger"><Trash2 size={14} /></div>
              <h3>Eliminar usuario</h3>
            </div>
            <div className="panel-card__body">
              <div className="field">
                <label className="field__label">ID Usuario</label>
                <input className="field__input" type="text" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} placeholder="6507abc..." disabled={loading} />
              </div>
              <div className="action-row">
                <button className="btn btn-secondary btn-full" type="button" disabled={loading} onClick={handleSoftDelete}>
                  Desactivar
                </button>
                <button className="btn btn-danger btn-full" type="button" disabled={loading} onClick={handleHardDelete}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* ── Results table ── */}
        <Motion.div className="panel-card" custom={3} variants={panelV} initial="hidden" animate="show">
          <div className="panel-card__head">
            <div className="panel-card__icon"><Users size={14} /></div>
            <h3>Usuarios ({users.length})</h3>
          </div>
          <div className="data-table-wrap">
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon"><Users size={36} /></div>
                <h4>Sin datos</h4>
                <p>Presiona «Cargar» para obtener los usuarios (requiere sesión Admin).</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="td-id">{u._id}</td>
                      <td className="td-name">{u.name} {u.last_name}</td>
                      <td className="td-email">{u.email}</td>
                      <td>
                        <span className={`role-badge role-badge--${ROLE_CLASS[u.role] ?? 'client'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge role-badge--${u.active !== false ? 'manager' : 'client'}`}>
                          {u.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Motion.div>
      </div>
    </div>
  );
};
