import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Edit2, Loader, ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { Card, Badge, Avatar, Button, Input } from '../../../components/ui';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../types';
import { UserEditModal } from './UserEditModal';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/useDebounce';

export function AdminUsersTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isUpdating, updateUser } = useUsers(page, 10, debouncedSearch);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (id: string, formData: any) => {
    updateUser({ id, data: formData }, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  return (
    <div className="admin-users-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em', marginBottom: 'var(--space-1)' }}>
            {t('sharedPages.admin.manageTitle', 'Users Management')}
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            {t('sharedPages.admin.manageSubtitle', 'Manage all users registered on the platform.')}
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <Input
            placeholder={t('sharedPages.admin.searchPlaceholder', 'Search by name or email...')}
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
                  {t('sharedPages.admin.headerUser', 'User')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerRole', 'Role')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerStatus', 'Status')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  {t('sharedPages.admin.headerRegistered', 'Registered')}
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em', textAlign: 'right' }}>
                  {t('sharedPages.admin.headerActions', 'Actions')}
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
                        <UserIcon size={32} />
                      </div>
                      <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        {t('sharedPages.admin.noResults', 'No users found')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {data.data.map((user: User, index: number) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--neutral-100)', backgroundColor: 'var(--neutral-0)', transition: 'background-color 0.2s' }}
                      whileHover={{ backgroundColor: 'var(--neutral-50)' }}
                    >
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Avatar src={user.avatar || undefined} name={user.name} size="md" />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: 'var(--text-sm)' }}>{user.name} {user.lastName}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <Badge variant={user.role === 'admin' ? 'primary' : user.role === 'professional' ? 'accent' : 'default'} size="sm" style={{ fontWeight: 600, padding: '4px 10px' }}>
                          {user.role}
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: user.isActive ? 'var(--success-50)' : 'var(--error-50)', color: user.isActive ? 'var(--success-600)' : 'var(--error-600)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                          {user.isActive ? t('sharedPages.admin.active', 'Active') : t('sharedPages.admin.disabled', 'Disabled')}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--neutral-600)', fontSize: 'var(--text-sm)' }}>
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={<Edit2 size={16} />}
                          onClick={() => handleEdit(user)}
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
              {t('sharedPages.admin.showingCount', { count: data.data.length, total: data.total, defaultValue: `Showing ${data.data.length} of ${data.total} users` })}
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

      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSave}
        isLoading={isUpdating}
      />
    </div>
  );
}
