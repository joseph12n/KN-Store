'use client';

import { useContext, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Layers, Plus, RefreshCw, Edit3, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';

const panelV = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }),
};

export default function SubcategoriesCrudPanel() {
  const { user } = useContext(AuthContext);
  const [subcategories, setSubcategories] = useState([]);
  const [createForm, setCreateForm] = useState({ name: '', description: '', category: '' });
  const [updateForm, setUpdateForm] = useState({ id: '', name: '', description: '', category: '' });
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isManagerOrAdmin = ['Admin', 'Manager'].includes(user?.role);
  const isAdmin = user?.role === 'Admin';

  const clearFeedback = () => { setMessage(''); setError(''); };

  const loadSubcategories = async () => {
    setLoading(true);
    clearFeedback();
    try {
      const list = await authService.getSubcategories();
      setSubcategories(list);
      setMessage(`${list.length} subcategorías cargadas`);
    } catch (err) {
      setError(err.message || 'Error al cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  const createSubcategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      await authService.createSubcategory(createForm);
      setMessage('Subcategoría creada correctamente');
      setCreateForm({ name: '', description: '', category: '' });
      await loadSubcategories();
    } catch (err) {
      setError(err.message || 'Error al crear subcategoría');
      setLoading(false);
    }
  };

  const updateSubcategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      if (!updateForm.id.trim()) throw new Error('Indica el ID de la subcategoría');
      const payload = {};
      if (updateForm.name.trim()) payload.name = updateForm.name.trim();
      if (updateForm.description.trim()) payload.description = updateForm.description.trim();
      if (updateForm.category.trim()) payload.category = updateForm.category.trim();
      if (Object.keys(payload).length === 0) throw new Error('Ingresa al menos un campo');
      await authService.updateSubcategory(updateForm.id.trim(), payload);
      setMessage('Subcategoría actualizada');
      await loadSubcategories();
    } catch (err) {
      setError(err.message || 'Error al actualizar');
      setLoading(false);
    }
  };

  const softDelete = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID');
      await authService.deleteSubcategory(deleteId.trim(), false);
      setMessage('Subcategoría desactivada');
      await loadSubcategories();
    } catch (err) {
      setError(err.message || 'Error al desactivar');
      setLoading(false);
    }
  };

  const hardDelete = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID');
      await authService.deleteSubcategory(deleteId.trim(), true);
      setMessage('Subcategoría eliminada permanentemente');
      await loadSubcategories();
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
          <h2>Subcategorías</h2>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={loadSubcategories} disabled={loading}>
          <RefreshCw size={13} /> Cargar
        </button>
      </div>

      {message && <p className="feedback feedback--ok"><CheckCircle size={14} /> {message}</p>}
      {error && <p className="feedback feedback--error"><AlertCircle size={14} /> {error}</p>}
      {!isManagerOrAdmin && (
        <p className="feedback feedback--warn">
          <AlertTriangle size={14} /> Solo lectura con este rol.
        </p>
      )}

      <div className="admin-panel">
        <div className="admin-forms">
          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={0} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Plus size={14} /></div>
                <h3>Crear subcategoría</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={createSubcategory}>
                  <div className="field">
                    <label className="field__label">Nombre</label>
                    <input className="field__input" type="text" value={createForm.name}
                      onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Running" disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Descripción</label>
                    <input className="field__input" type="text" value={createForm.description}
                      onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Opcional" disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">ID Categoría padre</label>
                    <input className="field__input" type="text" value={createForm.category}
                      onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="6507abc..." disabled={loading} />
                  </div>
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    <Plus size={13} /> Crear subcategoría
                  </button>
                </form>
              </div>
            </Motion.div>
          )}

          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={1} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Edit3 size={14} /></div>
                <h3>Actualizar subcategoría</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={updateSubcategory}>
                  <div className="field">
                    <label className="field__label">ID Subcategoría</label>
                    <input className="field__input" type="text" value={updateForm.id}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, id: e.target.value }))}
                      placeholder="6507abc..." disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Nuevo nombre (opcional)</label>
                    <input className="field__input" type="text" value={updateForm.name}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, name: e.target.value }))}
                      disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Nueva descripción (opcional)</label>
                    <input className="field__input" type="text" value={updateForm.description}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, description: e.target.value }))}
                      disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">ID Categoría (opcional)</label>
                    <input className="field__input" type="text" value={updateForm.category}
                      onChange={(e) => setUpdateForm((p) => ({ ...p, category: e.target.value }))}
                      disabled={loading} />
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
                <h3>Eliminar subcategoría</h3>
              </div>
              <div className="panel-card__body">
                <div className="field">
                  <label className="field__label">ID Subcategoría</label>
                  <input className="field__input" type="text" value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    placeholder="6507abc..." disabled={loading} />
                </div>
                <div className="action-row">
                  <button className="btn btn-secondary btn-full" type="button" disabled={loading} onClick={softDelete}>
                    Desactivar
                  </button>
                  <button className="btn btn-danger btn-full" type="button" disabled={loading} onClick={hardDelete}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </div>

        <Motion.div className="panel-card" custom={3} variants={panelV} initial="hidden" animate="show">
          <div className="panel-card__head">
            <div className="panel-card__icon"><Layers size={14} /></div>
            <h3>Subcategorías ({subcategories.length})</h3>
          </div>
          <div className="data-table-wrap">
            {subcategories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon"><Layers size={36} /></div>
                <h4>Sin datos</h4>
                <p>Presiona «Cargar» para obtener las subcategorías.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((sub) => (
                    <tr key={sub._id}>
                      <td className="td-id">{sub._id}</td>
                      <td className="td-name">{sub.name}</td>
                      <td>{sub.description || '—'}</td>
                      <td className="td-subtle td-mono">
                        {typeof sub.category === 'object' ? sub.category?.name ?? sub.category?._id : sub.category ?? '—'}
                      </td>
                      <td>
                        <span className={`role-badge role-badge--${sub.active !== false ? 'manager' : 'client'}`}>
                          {sub.active !== false ? 'Activo' : 'Inactivo'}
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
