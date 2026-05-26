import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Edit2, Loader, ChevronLeft, ChevronRight, CheckCircle, ShieldAlert, Star, Users
} from 'lucide-react';
import { Card, Avatar, Button, Input } from '../../../components/ui';
import { useProfessionals } from '../hooks/useProfessionals';
import type { Professional } from '../types';
import { ProfessionalEditModal } from './ProfessionalEditModal';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/useDebounce';

export function AdminProfessionalsTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isUpdating, updateProfessional } = useProfessionals(page, 10, debouncedSearch);

  const handleEdit = (pro: Professional) => {
    setSelectedPro(pro);
    setIsModalOpen(true);
  };

  const handleSave = (id: string, formData: any) => {
    updateProfessional({ id, data: formData }, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  return (
    <div className="admin-professionals-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em', marginBottom: 'var(--space-1)' }}>
            {t('sharedPages.admin.manageProsTitle', 'Professionals Management')}
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            {t('sharedPages.admin.manageProsSubtitle', 'Manage and verify service professionals.')}
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <Input
            placeholder={t('sharedPages.admin.searchProsPlaceholder', 'Search professionals...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            icon={<Search size={18} style={{ color: 'var(--neutral-400)' }} />}
            style={{ backgroundColor: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)' }}
          />
        </div>
      </div>

      {/* Main Card */}
      <Card variant="glass" padding="none" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerPro', 'Professional')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerRating', 'Rating')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerProStatus', 'Status')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerVisibility', 'Visibility')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em', textAlign: 'right' }}>
                  {t('sharedPages.admin.headerProActions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary-500)', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
                        <Users size={32} />
                      </div>
                      <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        {t('sharedPages.admin.noPros', 'No professionals found')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {data.data.map((pro: Professional, index: number) => (
                    <motion.tr 
                      key={pro.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--neutral-100)', backgroundColor: 'var(--neutral-0)', transition: 'background-color 0.2s' }}
                      whileHover={{ backgroundColor: 'var(--neutral-50)' }}
                    >
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Avatar 
                            src={pro.user?.avatar || pro.avatar || undefined} 
                            name={pro.user?.name || pro.name || 'Pro'} 
                            size="md" 
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: 'var(--text-sm)' }}>
                              {pro.user?.name || pro.name} {pro.user?.lastName || pro.lastName}
                            </p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                              {pro.user?.email || pro.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={14} fill="var(--warning-400)" color="var(--warning-400)" />
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{pro.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                            {t('sharedPages.admin.ratingCount', { count: pro.reviewCount || 0, defaultValue: `${pro.reviewCount || 0} reviews` })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: pro.verified ? 'var(--success-50)' : 'var(--warning-50)', color: pro.verified ? 'var(--success-600)' : 'var(--warning-600)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          {pro.verified ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                          {pro.verified ? t('sharedPages.admin.verified', 'Verified') : t('sharedPages.admin.pending', 'Pending')}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: pro.isVisible ? 'var(--primary-50)' : 'var(--neutral-100)', color: pro.isVisible ? 'var(--primary-600)' : 'var(--neutral-600)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                          {pro.isVisible ? t('sharedPages.admin.visible', 'Visible') : t('sharedPages.admin.hidden', 'Hidden')}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={<Edit2 size={16} />}
                          onClick={() => handleEdit(pro)}
                          style={{ color: 'var(--neutral-500)', backgroundColor: 'var(--neutral-100)' }}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {data?.total > 0 && (
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--neutral-50)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 500 }}>
              {t('sharedPages.admin.showingProsCount', { count: data.data.length, total: data.total, defaultValue: `Showing ${data.data.length} of ${data.total} pros` })}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                icon={<ChevronLeft size={16} />}
                style={{ width: '32px', height: '32px', padding: 0 }}
              />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-700)', minWidth: '40px', textAlign: 'center' }}>
                {page} / {data.totalPages || 1}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page >= (data.totalPages || 1)} 
                onClick={() => setPage(p => p + 1)}
                icon={<ChevronRight size={16} />}
                style={{ width: '32px', height: '32px', padding: 0 }}
              />
            </div>
          </div>
        )}
      </Card>

      <ProfessionalEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professional={selectedPro}
        onSave={handleSave}
        isLoading={isUpdating}
      />
    </div>
  );
}
