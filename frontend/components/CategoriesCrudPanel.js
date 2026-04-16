'use client';

import { useContext, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Tag, Plus, RefreshCw, Edit3, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';

const panelV = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }),
};

export default function CategoriesCrudPanel() {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [updateForm, setUpdateForm] = useState({ id: '', name: '', description: '' });
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isManagerOrAdmin = ['Admin', 'Manager'].includes(user?.role);
  const isAdmin = user?.role === 'Admin';

  const clearFeedback = () => { setMessage(''); setError(''); };

  const loadCategories = async () => {
    setLoading(true);
    clearFeedback();
    try {
      const list = await authService.getCategories();
      setCategories(list);
      setMessage(`${list.length} categorías cargadas`);
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      await authService.createCategory(createForm);
      setMessage('Categoría creada correctamente');
      setCreateForm({ name: '', description: '' });
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Error al crear categoría');
      setLoading(false);
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      if (!updateForm.id.trim()) throw new Error('Indica el ID de la categoría');
      const payload = {};
      if (updateForm.name.trim()) payload.name = updateForm.name.trim();
      if (updateForm.description !== '') payload.description = updateForm.description;
      if (Object.keys(payload).length === 0) throw new Error('Ingresa al menos un campo');
      await authService.updateCategory(updateForm.id.trim(), payload);
      setMessage('Categoría actualizada');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Error al actualizar');
      setLoading(false);
    }
  };

  const softDeleteCategory = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID de la categoría');
      await authService.deleteCategory(deleteId.trim(), false);
      setMessage('Categoría desactivada');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Error al desactivar');
      setLoading(false);
    }
  };

  const hardDeleteCategory = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID de la categoría');
      await authService.deleteCategory(deleteId.trim(), true);
      setMessage('Categoría eliminada permanentemente');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <p className="section-label">Catálogo</p>
          <h2>Categorías</h2>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={loadCategories} disabled={loading}>
          <RefreshCw size={13} />
          Cargar
        </button>
      </div>

      {message && <p className="feedback feedback--ok"><CheckCircle size={14} /> {message}</p>}
      {error && <p className="feedback feedback--error"><AlertCircle size={14} /> {error}</p>}
      {!isManagerOrAdmin && (
        <p className="feedback feedback--warn">
          <AlertTriangle size={14} /> Solo lectura con este rol. Login como Manager o Admin para editar.
        </p>
      )}

      <div className="admin-panel">
        <div className="admin-forms">
          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={0} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Plus size={14} /></div>
                <h3>Crear categoría</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={createCategory}>
                  <div className="field">
                    <label className="field__label">Nombre</label>
                    <input
                      className="field__input"
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Zapatillas"
                      disabled={loading}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Descripción</label>
                    <input
                      className="field__input"
                      type="text"
                      value={createForm.description}
                      onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Descripción opcional"
                      disabled={loading}
                    />
                  </div>
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    <Plus size={13} /> Crear categoría
                  </button>
                </form>
              </div>
            </Motion.div>
          )}

          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={1} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Edit3 size={14} /></div>
                <h3>Actualizar categoría</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={updateCategory}>
                  <div className="field">
                    <label className="field__label">ID Categoría</label>
                    <input
                      className="field__input"
                      type="text"
                      value={updateForm.id}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, id: e.target.value }))}
                      placeholder="6507abc..."
                      disabled={loading}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Nuevo nombre (opcional)</label>
                    <input
                      className="field__input"
                      type="text"
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, name: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Nueva descripción (opcional)</label>
                    <input
                      className="field__input"
                      type="text"
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, description: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <button className="btn btn-secondary btn-full" type="submit" disabled={loading}>
                    <Edit3 size={13} /> Actualizar
                  </button>
                </form>
              </div>
            </Motion.div>
          )}

          {isAdmin && (
            <Motion.div className="panel-card" custom={2} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon panel-card__icon--danger"><Trash2 size={14} /></div>
                <h3>Eliminar categoría</h3>
              </div>
              <div className="panel-card__body">
                <div className="field">
                  <label className="field__label">ID Categoría</label>
                  <input
                    className="field__input"
                    type="text"
                    value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    placeholder="6507abc..."
                    disabled={loading}
                  />
                </div>
                <div className="action-row">
                  <button className="btn btn-secondary btn-full" type="button" disabled={loading} onClick={softDeleteCategory}>
                    Desactivar
                  </button>
                  <button className="btn btn-danger btn-full" type="button" disabled={loading} onClick={hardDeleteCategory}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </div>

        <Motion.div className="panel-card" custom={3} variants={panelV} initial="hidden" animate="show">
          <div className="panel-card__head">
            <div className="panel-card__icon"><Tag size={14} /></div>
            <h3>Categorías ({categories.length})</h3>
          </div>
          <div className="data-table-wrap">
            {categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon"><Tag size={36} /></div>
                <h4>Sin datos</h4>
                <p>Presiona «Cargar» para obtener las categorías del servidor.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="td-id">{cat._id}</td>
                      <td className="td-name">{cat.name}</td>
                      <td>{cat.description || '—'}</td>
                      <td>
                        <span className={`role-badge role-badge--${cat.active !== false ? 'manager' : 'client'}`}>
                          {cat.active !== false ? 'Activo' : 'Inactivo'}
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
}
