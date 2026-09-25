import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderHeart, Plus, Trash2, Edit3, Copy, Check, ExternalLink, X, FolderOpen, Link2, FileText, CheckSquare, Square, Loader2 } from 'lucide-react';
import { collectionsApi, linksApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function CollectionsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [copiedSlug, setCopiedSlug] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [selectedLinks, setSelectedLinks] = useState([]);

  // Fetch collections
  const collectionsQuery = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await collectionsApi.list();
      return res.data?.data || [];
    }
  });

  // Fetch all user links (to check/select inside collection)
  const linksQuery = useQuery({
    queryKey: ['all-links-for-collection'],
    queryFn: async () => {
      const res = await linksApi.list({});
      return res.data?.data || [];
    }
  });

  const collections = collectionsQuery.data || [];
  const allLinks = linksQuery.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create collection');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => collectionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update collection');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: collectionsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted');
    },
    onError: () => {
      toast.error('Failed to delete collection');
    }
  });

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setCustomSlug('');
    setSelectedLinks([]);
    setEditingCollection(null);
    setShowCreateModal(true);
  };

  const openEditModal = (col) => {
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setCustomSlug(col.customSlug || '');
    setSelectedLinks(col.links.map(l => l._id || l));
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCollection(null);
  };

  const handleLinkToggle = (id) => {
    if (selectedLinks.includes(id)) {
      setSelectedLinks(selectedLinks.filter(i => i !== id));
    } else {
      setSelectedLinks([...selectedLinks, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      customSlug: customSlug.trim() || undefined,
      links: selectedLinks
    };

    if (editingCollection) {
      updateMutation.mutate({ id: editingCollection._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id, title) => {
    toast.confirm(
      `Are you sure you want to delete the collection "${title}"?`,
      () => {
        deleteMutation.mutate(id);
      },
      { confirmLabel: 'Delete', danger: true }
    );
  };

  const handleCopyShare = async (col) => {
    const slug = col.customSlug || col._id;
    const shareUrl = `${window.location.origin}/c/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedSlug(col._id);
      toast.success('Public collection link copied!');
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      toast.error('Failed to copy public link');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title" style={{ margin: 0 }}>Smart Collections</h1>
          <p className="dashboard-subtitle">Group and share your intelligence links.</p>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 20px', borderRadius: 12, background: 'var(--c-primary)',
            color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', minHeight: 48
          }}
        >
          <Plus className="h-5 w-5" /> Create Collection
        </button>
      </div>

      {/* Collection Grid */}
      {collectionsQuery.isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--c-primary)' }} />
        </div>
      ) : collections.length === 0 ? (
        <div className="empty-state">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--c-primary-light)',
            display: 'grid', placeItems: 'center', marginBottom: 16
          }}>
            <FolderHeart className="h-7 w-7" style={{ color: 'var(--c-primary)' }} />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: 17 }}>No collections yet</p>
          <p style={{ color: 'var(--c-text-3)', fontSize: 14, marginTop: 6 }}>
            Group related links together and share them as a single landing page.
          </p>
        </div>
      ) : (
        <div className="links-grid">
          {collections.map((col) => (
            <article key={col._id} className="link-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderOpen className="h-6 w-6" style={{ color: 'var(--c-primary)' }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--c-text)' }}>{col.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => openEditModal(col)}
                    className="action-btn action-btn-ghost"
                    style={{ minHeight: 36, padding: '0 8px' }}
                    title="Edit Collection"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(col._id, col.name)}
                    className="action-btn action-btn-ghost"
                    style={{ minHeight: 36, padding: '0 8px', color: 'var(--c-error)' }}
                    title="Delete Collection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {col.description && (
                <p style={{ fontSize: 13, color: 'var(--c-text-3)', margin: 0 }}>
                  {col.description}
                </p>
              )}

              {col.customSlug && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)' }}>SLUG:</span>
                  <span className="short-code-badge" style={{ fontSize: 11 }}>c/{col.customSlug}</span>
                </div>
              )}

              {/* Collapsed Link count / summary preview */}
              <div style={{ background: 'var(--c-surface-2)', padding: 12, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Link2 className="h-3.5 w-3.5" style={{ color: 'var(--c-primary)' }} />
                  {col.links.length} {col.links.length === 1 ? 'Link' : 'Links'} inside
                </span>
                {col.links.slice(0, 3).map((l, index) => (
                  <div key={l._id || index} style={{ fontSize: 12, color: 'var(--c-text-3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    • {l.title || 'SmartLink'} ({l.category})
                  </div>
                ))}
                {col.links.length > 3 && (
                  <div style={{ fontSize: 11, color: 'var(--c-text-4)', fontStyle: 'italic' }}>
                    + {col.links.length - 3} more links
                  </div>
                )}
              </div>

              {/* Actions row: Copy public share url */}
              <button
                className={`action-btn ${copiedSlug === col._id ? 'action-btn-success' : 'action-btn-primary'}`}
                style={{ width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => handleCopyShare(col)}
              >
                {copiedSlug === col._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedSlug === col._id ? 'Copied Public Link!' : 'Copy Shareable Link'}
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Popup */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)'
              }}
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 24, padding: 24,
                width: '100%', maxWidth: 500,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)', zIndex: 1001,
                display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>
                  {editingCollection ? 'Edit Collection' : 'Create Collection'}
                </h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="auth-label">Collection Name *</label>
                  <input
                    type="text"
                    className="create-input"
                    placeholder="e.g. Placement Preparation"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="auth-label">Description (Optional)</label>
                  <textarea
                    className="create-input"
                    placeholder="Brief description of these links..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label className="auth-label">Custom Slug (Optional, URL-friendly)</label>
                  <input
                    type="text"
                    className="create-input"
                    placeholder="e.g. placement (yields /c/placement)"
                    value={customSlug}
                    onChange={e => setCustomSlug(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Choose links chooser matrix */}
                <div>
                  <label className="auth-label" style={{ marginBottom: 6, display: 'block' }}>Select Links to Group *</label>
                  {linksQuery.isLoading ? (
                    <div style={{ padding: 12, textAlign: 'center' }}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : allLinks.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--c-text-4)', fontStyle: 'italic', margin: '4px 0 0' }}>
                      No links available in vault yet. Create some first!
                    </p>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 8,
                      maxHeight: 180, overflowY: 'auto', border: '1px solid var(--c-border)',
                      padding: 10, borderRadius: 12, background: 'var(--c-surface-2)'
                    }}>
                      {allLinks.map(link => {
                        const checked = selectedLinks.includes(link._id);
                        return (
                          <button
                            key={link._id}
                            type="button"
                            onClick={() => handleLinkToggle(link._id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              background: 'none', border: 'none', cursor: 'pointer',
                              textAlign: 'left', width: '100%', padding: '6px 4px'
                            }}
                          >
                            {checked ? (
                              <CheckSquare className="h-4 w-4" style={{ color: 'var(--c-primary)', flexShrink: 0 }} />
                            ) : (
                              <Square className="h-4 w-4" style={{ color: 'var(--c-text-4)', flexShrink: 0 }} />
                            )}
                            <div style={{ overflow: 'hidden' }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--c-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {link.title || 'Untitled Link'}
                              </p>
                              <p style={{ margin: 0, fontSize: 10, color: 'var(--c-text-3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {link.originalUrl}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="create-btn"
                  disabled={createMutation.isPending || updateMutation.isPending || name.trim() === ''}
                  style={{ marginTop: 12, minHeight: 48 }}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  ) : (
                    editingCollection ? 'Update Collection' : 'Create Collection'
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollectionsPage;
