import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Loader, Scissors, Tag, Layers, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { useServiceCategories } from '../hooks/useServiceCategories';
import type { ServiceCategory } from '../types';
import { ServiceCategoryModal } from './ServiceCategoryModal';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { apiClient } from '../../../services/api';

export function AdminServicesTable() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories, isLoading, isMutating, createCategory, updateCategory, deleteCategory } = useServiceCategories();

  // ─── Category Requests state ─────────────────────────────────────────────────
  const [catRequests, setCatRequests] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catReviewing, setCatReviewing] = useState<number | null>(null);

  const fetchCatRequests = async () => {
    setCatLoading(true);
    try {
      const res = await apiClient.get('/admin/category-requests', { params: { status: 'pending' } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCatRequests(list);
    } catch { /* silencioso */ }
    finally { setCatLoading(false); }
  };

  useEffect(() => { fetchCatRequests(); }, []);

  const reviewCatRequest = async (id: number, status: 'approved' | 'rejected') => {
    setCatReviewing(id);
    try {
      await apiClient.patch(`/admin/category-requests/${id}/review`, { action: status });
      fetchCatRequests();
    } catch { /* silencioso */ }
    finally { setCatReviewing(null); }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: t('sharedPages.admin.delConfirmTitle', 'Are you sure?'),
      text: t('sharedPages.admin.delConfirmText', 'This action cannot be undone!'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--error-500)',
      cancelButtonColor: 'var(--neutral-500)',
      confirmButtonText: t('sharedPages.admin.delConfirmBtn', 'Yes, delete it')
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCategory(id);
      }
    });
  };

  const handleSave = (formData: any) => {
    if (selectedCategory) {
      updateCategory({ id: selectedCategory.id, data: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createCategory(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  return (
    <div className="admin-services-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em', marginBottom: 'var(--space-1)' }}>
            {t('sharedPages.admin.svcTitle', 'Service Categories')}
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            Configura las categorías de servicios disponibles en el marketplace.
          </p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />} 
          onClick={handleAdd}
          style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', boxShadow: 'var(--shadow-md)' }}
        >
          {t('sharedPages.admin.addCat', 'Add Category')}
        </Button>
      </div>

      {/* Main Card */}
      <Card variant="glass" padding="none" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Loader className="spin" size={32} style={{ color: 'var(--primary-500)', margin: '0 auto' }} />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
                <Layers size={32} />
              </div>
              <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                {t('sharedPages.admin.noCats', 'No categories configured')}
              </p>
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                    Categoría
                  </th>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                    Identificador
                  </th>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                    Descripción
                  </th>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                    Estado
                  </th>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em', textAlign: 'right' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {categories.map((cat: ServiceCategory, index: number) => (
                    <motion.tr 
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--neutral-100)', backgroundColor: 'var(--neutral-0)', transition: 'background-color 0.2s' }}
                      whileHover={{ backgroundColor: 'var(--neutral-50)' }}
                    >
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ padding: '8px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--primary-600)' }}>
                            <Scissors size={18} />
                          </div>
                          <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: 'var(--text-sm)' }}>{cat.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <Badge variant="default" size="sm" style={{ fontWeight: 600, padding: '4px 10px', backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={12} /> {cat.category}
                          </span>
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--neutral-500)', fontSize: 'var(--text-xs)', maxWidth: '250px' }}>
                        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cat.description || t('sharedPages.admin.noDesc', 'No description')}
                        </p>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: cat.isActive ? 'var(--success-50)' : 'var(--error-50)', color: cat.isActive ? 'var(--success-600)' : 'var(--error-600)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                          {cat.isActive ? t('sharedPages.admin.active', 'Active') : t('sharedPages.admin.disabled', 'Disabled')}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            icon={<Edit2 size={16} />}
                            onClick={() => handleEdit(cat)}
                            style={{ color: 'var(--neutral-500)', backgroundColor: 'var(--neutral-100)' }}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(cat.id)}
                            style={{ color: 'var(--error-500)', backgroundColor: 'var(--error-50)' }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Solicitudes de Categorías ──────────────────────────────────────── */}
      <Card style={{ marginTop: 24, boxShadow: 'var(--shadow-md)', border: '1px solid var(--neutral-200)' }} padding="none">
        <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            <Tag size={18} />
            Solicitudes de nuevas categorías
            {catRequests.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-500)', color: '#fff',
                borderRadius: 999, fontSize: '0.72rem', fontWeight: 800,
                width: 22, height: 22, marginLeft: 4,
              }}>{catRequests.length}</span>
            )}
          </h2>
          <Button size="sm" variant="ghost" onClick={fetchCatRequests} disabled={catLoading}>
            {catLoading ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Actualizar'}
          </Button>
        </div>

        <div style={{ padding: '12px 20px 20px' }}>
          {catLoading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)', margin: '0 auto' }} />
            </div>
          ) : catRequests.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--neutral-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={32} opacity={0.3} />
              <span style={{ fontWeight: 500 }}>Sin solicitudes pendientes</span>
            </div>
          ) : catRequests.map((req: any) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, border: '1px solid var(--neutral-200)', borderRadius: 12, marginBottom: 12, background: 'var(--neutral-50)' }}
            >
              {/* Icono */}
              <div style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', padding: 10, borderRadius: '50%', flexShrink: 0 }}>
                <Tag size={16} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--neutral-900)' }}>
                  {req.category || req.name}
                </p>
                {req.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', margin: '0 0 8px' }}>{req.description}</p>
                )}
                <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--neutral-500)', margin: 0 }}>
                  <Clock size={11} />
                  {new Date(req.createdAt).toLocaleString('es-CO')}
                  {req.professional?.user && (
                    <> &bull; <strong>{req.professional.user.name} {req.professional.user.lastName}</strong></>
                  )}
                </p>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => reviewCatRequest(req.id, 'approved')}
                  disabled={catReviewing === req.id}
                  title="Aprobar"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-600)',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                    opacity: catReviewing === req.id ? 0.5 : 1,
                  }}
                >
                  {catReviewing === req.id
                    ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <><CheckCircle size={16} /> Aprobar</>}
                </button>
                <button
                  onClick={() => reviewCatRequest(req.id, 'rejected')}
                  disabled={catReviewing === req.id}
                  title="Rechazar"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-600)',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                    opacity: catReviewing === req.id ? 0.5 : 1,
                  }}
                >
                  <XCircle size={16} /> Rechazar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <ServiceCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
        isLoading={isMutating}
      />
    </div>
  );
}
