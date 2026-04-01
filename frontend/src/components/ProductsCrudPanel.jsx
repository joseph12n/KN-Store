import { useContext, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Package, Plus, RefreshCw, Edit3, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const panelV = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] } }),
};

const initialCreate = {
  name: '', sku: '', description: '', brand: '',
  price: '', costPrice: '', stock: '',
  category: '', subcategory: '', provider: '',
};

export const ProductsCrudPanel = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [createForm, setCreateForm] = useState(initialCreate);
  const [updateForm, setUpdateForm] = useState({ id: '', name: '', price: '', stock: '' });
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isManagerOrAdmin = ['Admin', 'Manager'].includes(user?.role);
  const isAdmin = user?.role === 'Admin';

  const clearFeedback = () => { setMessage(''); setError(''); };

  const loadProducts = async () => {
    setLoading(true);
    clearFeedback();
    try {
      const list = await authService.getProducts();
      setProducts(list);
      setMessage(`${list.length} productos cargados`);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      const payload = {
        ...createForm,
        price: Number(createForm.price),
        costPrice: Number(createForm.costPrice),
        stock: Number(createForm.stock),
        isAvailable: true,
      };
      if (!payload.provider) delete payload.provider;
      await authService.createProduct(payload);
      setMessage('Producto creado correctamente');
      setCreateForm(initialCreate);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Error al crear producto');
      setLoading(false);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      if (!updateForm.id.trim()) throw new Error('Indica el ID del producto');
      const payload = {};
      if (updateForm.name.trim()) payload.name = updateForm.name.trim();
      if (updateForm.price !== '') payload.price = Number(updateForm.price);
      if (updateForm.stock !== '') payload.stock = Number(updateForm.stock);
      if (Object.keys(payload).length === 0) throw new Error('Ingresa al menos un campo');
      await authService.updateProduct(updateForm.id.trim(), payload);
      setMessage('Producto actualizado');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Error al actualizar');
      setLoading(false);
    }
  };

  const softDelete = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID del producto');
      await authService.deleteProduct(deleteId.trim(), false);
      setMessage('Producto desactivado');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Error al desactivar');
      setLoading(false);
    }
  };

  const hardDelete = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!deleteId.trim()) throw new Error('Indica el ID del producto');
      await authService.deleteProduct(deleteId.trim(), true);
      setMessage('Producto eliminado permanentemente');
      await loadProducts();
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
          <p className="section-label">Catálogo</p>
          <h2>Productos</h2>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={loadProducts} disabled={loading}>
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
        {/* ── Forms ── */}
        <div className="admin-forms">
          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={0} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Plus size={14} /></div>
                <h3>Crear producto</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={createProduct}>
                  <div className="field__row">
                    <div className="field">
                      <label className="field__label">Nombre</label>
                      <input className="field__input" type="text" value={createForm.name} onChange={setCreate('name')} disabled={loading} />
                    </div>
                    <div className="field">
                      <label className="field__label">SKU</label>
                      <input className="field__input" type="text" value={createForm.sku} onChange={setCreate('sku')} disabled={loading} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field__label">Descripción</label>
                    <input className="field__input" type="text" value={createForm.description} onChange={setCreate('description')} disabled={loading} />
                  </div>
                  <div className="field__row">
                    <div className="field">
                      <label className="field__label">Marca</label>
                      <input className="field__input" type="text" value={createForm.brand} onChange={setCreate('brand')} disabled={loading} />
                    </div>
                    <div className="field">
                      <label className="field__label">Precio</label>
                      <input className="field__input" type="number" value={createForm.price} onChange={setCreate('price')} disabled={loading} />
                    </div>
                  </div>
                  <div className="field__row">
                    <div className="field">
                      <label className="field__label">Costo</label>
                      <input className="field__input" type="number" value={createForm.costPrice} onChange={setCreate('costPrice')} disabled={loading} />
                    </div>
                    <div className="field">
                      <label className="field__label">Stock</label>
                      <input className="field__input" type="number" value={createForm.stock} onChange={setCreate('stock')} disabled={loading} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field__label">ID Categoría</label>
                    <input className="field__input" type="text" value={createForm.category} onChange={setCreate('category')} placeholder="6507abc..." disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">ID Subcategoría</label>
                    <input className="field__input" type="text" value={createForm.subcategory} onChange={setCreate('subcategory')} placeholder="6507abc..." disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">ID Manager (opcional)</label>
                    <input className="field__input" type="text" value={createForm.provider} onChange={setCreate('provider')} placeholder="6507abc..." disabled={loading} />
                  </div>
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    <Plus size={13} /> Crear producto
                  </button>
                </form>
              </div>
            </Motion.div>
          )}

          {isManagerOrAdmin && (
            <Motion.div className="panel-card" custom={1} variants={panelV} initial="hidden" animate="show">
              <div className="panel-card__head">
                <div className="panel-card__icon"><Edit3 size={14} /></div>
                <h3>Actualizar producto</h3>
              </div>
              <div className="panel-card__body">
                <form onSubmit={updateProduct}>
                  <div className="field">
                    <label className="field__label">ID Producto</label>
                    <input className="field__input" type="text" value={updateForm.id} onChange={setUpdate('id')} placeholder="6507abc..." disabled={loading} />
                  </div>
                  <div className="field">
                    <label className="field__label">Nombre (opcional)</label>
                    <input className="field__input" type="text" value={updateForm.name} onChange={setUpdate('name')} disabled={loading} />
                  </div>
                  <div className="field__row">
                    <div className="field">
                      <label className="field__label">Precio (opcional)</label>
                      <input className="field__input" type="number" value={updateForm.price} onChange={setUpdate('price')} disabled={loading} />
                    </div>
                    <div className="field">
                      <label className="field__label">Stock (opcional)</label>
                      <input className="field__input" type="number" value={updateForm.stock} onChange={setUpdate('stock')} disabled={loading} />
                    </div>
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
                <h3>Eliminar producto</h3>
              </div>
              <div className="panel-card__body">
                <div className="field">
                  <label className="field__label">ID Producto</label>
                  <input className="field__input" type="text" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} placeholder="6507abc..." disabled={loading} />
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

        {/* ── Results table ── */}
        <Motion.div className="panel-card" custom={3} variants={panelV} initial="hidden" animate="show">
          <div className="panel-card__head">
            <div className="panel-card__icon"><Package size={14} /></div>
            <h3>Productos ({products.length})</h3>
          </div>
          <div className="data-table-wrap">
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon"><Package size={36} /></div>
                <h4>Sin datos</h4>
                <p>Presiona «Cargar» para obtener los productos del servidor.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Marca</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="td-id">{p._id}</td>
                      <td className="td-name">{p.name}</td>
                      <td>{p.brand || '—'}</td>
                      <td className="td-accent td-strong">
                        ${p.price != null ? Number(p.price).toLocaleString('es-CO') : '—'}
                      </td>
                      <td>{p.stock ?? '—'}</td>
                      <td>
                        <span className={`role-badge role-badge--${p.active !== false ? 'manager' : 'client'}`}>
                          {p.active !== false ? 'Activo' : 'Inactivo'}
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
