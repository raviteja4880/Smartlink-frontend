import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Copy, Check, QrCode, BarChart3, Trash2, ExternalLink,
  Clock, Globe, Tag, Sparkles, ChevronDown, ChevronUp, X, Download, MoreVertical,
  ShieldCheck, ShieldAlert, AlertTriangle, Edit3, Save, RefreshCw, Radio, CircleX 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { linksApi } from '../services/api';

/* ── QR Code Modal ── */
function QrModal({ shortCode, qrCode, shortUrl, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 24, padding: '32px 28px 24px',
          width: '100%', maxWidth: 320,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: 'var(--shadow-xl)',
          animation: 'scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 36, height: 36, borderRadius: 8,
          border: '1px solid var(--c-border)', background: 'var(--c-surface-2)',
          cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--c-text-3)'
        }}>
          <X className="h-4 w-4" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrCode className="h-5 w-5" style={{ color: 'var(--c-primary)' }} />
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--c-text)' }}>QR Code</p>
        </div>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 12,
          border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-sm)'
        }}>
          <img src={qrCode} alt={`QR code for ${shortCode}`} width={200} height={200} style={{ display: 'block', borderRadius: 8 }} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--c-text-3)', wordBreak: 'break-all', textAlign: 'center' }}>{shortUrl}</p>
        <a
          href={qrCode}
          download={`qr-${shortCode}.png`}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '12px 20px', borderRadius: 'var(--r-md)',
            background: 'var(--c-primary-light)', border: '1px solid #BFDBFE',
            color: 'var(--c-primary-text)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            minHeight: 48, justifyContent: 'center'
          }}
        >
          <Download className="h-4 w-4" /> Download PNG
        </a>
      </div>
    </div>
  );
}

/* ── Favicon fallback utility ── */
function getFaviconUrl(favicon, originalUrl) {
  if (favicon) return favicon;
  try {
    const domain = new URL(originalUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  } catch {
    return '';
  }
}

/* ── Category color system ── */
const CATEGORY_STYLES = {
  Technology:    { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Science:       { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  Finance:       { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  Healthcare:    { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  Education:     { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Sports:        { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  Entertainment: { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8' },
  News:          { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
  Business:      { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  Lifestyle:     { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  Government:    { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' },
  Shopping:      { bg: '#FEFCE8', text: '#854D0E', border: '#FEF08A' },
  Travel:        { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  General:       { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0'  }
};

function getCategoryStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES.General;
}

const DEFAULT_APP_URL = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');

function LinkCard({ link, onDelete, appUrl = DEFAULT_APP_URL }) {
  const [copied, setCopied]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showQr, setShowQr]   = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  
  // Custom editing states for Notes and Tags
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText]           = useState(link.notes || '');
  const [isEditingTags, setIsEditingTags]   = useState(false);
  const [tagsText, setTagsText]             = useState((link.tags || []).join(', '));
  const [refreshingHealth, setRefreshingHealth] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const shortUrl = `${appUrl}/${link.shortCode}`;
  const catStyle = getCategoryStyle(link.category);

  const updateMutation = useMutation({
    mutationFn: (data) => linksApi.update(link._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link updated successfully!');
      setIsEditingNotes(false);
      setIsEditingTags(false);
    },
    onError: () => {
      toast.error('Failed to update link properties');
    }
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyOriginal = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.originalUrl);
    toast.success('Original URL copied!');
  };

  const handleDelete = () => {
    toast.confirm(
      `Delete "${link.title || link.shortCode}"?`,
      () => {
        setDeleting(true);
        onDelete(link._id);
      },
      { confirmLabel: 'Delete', danger: true }
    );
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({ notes: notesText });
  };

  const handleSaveTags = () => {
    updateMutation.mutate({ tags: tagsText });
  };

  const handleRefreshHealth = async () => {
    setRefreshingHealth(true);
    try {
      const res = await linksApi.refreshHealth(link._id);
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['links'] });
        toast.success(`Link health updated: ${res.data.data.healthStatus}`);
      } else {
        toast.error('Failed to check health status');
      }
    } catch {
      toast.error('Connection error verifying link health');
    } finally {
      setRefreshingHealth(false);
    }
  };

  const keywords = link.keywords || [];
  const topics   = link.topics   || [];
  const tags     = link.tags     || [];

  const score = link.trustScore ?? 85;
  const trustLevel = link.trustLevel ?? 'Safe';
  const recDecision = link.recommendation?.decision ?? 'YES';
  const recReason = link.recommendation?.reason ?? 'This page is safe to visit.';
  const health = link.healthStatus ?? 'Alive';

  return (
    <article className="link-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Top Header: Favicon + Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <img
          src={getFaviconUrl(link.favicon, link.originalUrl)}
          alt=""
          width={32} height={32}
          style={{
            width: 32, height: 32, borderRadius: '8px',
            border: '1px solid var(--c-border)', flexShrink: 0,
            objectFit: 'contain', background: '#fff', padding: 2
          }}
          onError={e => {
            try {
              const domain = new URL(link.originalUrl).hostname;
              e.target.src = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
            } catch {
              e.target.style.display = 'none';
            }
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="link-card-title" style={{ fontSize: 16, fontWeight: 700, margin: 0 }} title={link.title || link.shortCode}>
            {link.title || link.shortCode}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {/* Category Pill */}
            {(() => {
              const displayCat = link.primaryCategory || link.category;
              const isGeneric = !displayCat || ['general', 'technology', 'website', 'miscellaneous', 'other'].includes(String(displayCat).toLowerCase().trim());
              if (isGeneric) return null;
              return (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`
                }}>
                  {displayCat.toUpperCase()}
                </span>
              );
            })()}
            {/* Reading Time */}
            {link.estimatedReadTime && (
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock className="h-3 w-3" /> {link.estimatedReadTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Trust Score pill & safety level ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-3)' }}>Trust Rating:</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
          background: trustLevel === 'Safe' ? '#E8F5E9' : trustLevel === 'Moderate Risk' ? '#FFF3E0' : '#FFEBEE',
          color: trustLevel === 'Safe' ? '#2E7D32' : trustLevel === 'Moderate Risk' ? '#E65100' : '#C62828',
          border: `1px solid ${trustLevel === 'Safe' ? '#A5D6A7' : trustLevel === 'Moderate Risk' ? '#FFCC80' : '#FFCDD2'}`,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {trustLevel === 'Safe' ? <><Radio size={12} className="inline mr-1" style={{color:'#2E7D32'}} /> Safe</> : trustLevel === 'Moderate Risk' ? <><AlertCircle size={12} className="inline mr-1" style={{color:'#E65100'}} /> Moderate Risk</> : <><CircleX size={12} className="inline mr-1" style={{color:'#C62828'}} /> High Risk</>} ({score}%)
        </span>
      </div>

      {/* ── Health Indicator and on-demand refresh ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-3)' }}>Health:</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: health === 'Alive' ? '#E8F5E9' : health === 'Redirect Changed' ? '#FFF8E1' : '#FFEBEE',
          color: health === 'Alive' ? '#2E7D32' : health === 'Redirect Changed' ? '#F57F17' : '#C62828',
          border: `1px solid ${health === 'Alive' ? '#A5D6A7' : health === 'Redirect Changed' ? '#FFE082' : '#FFCDD2'}`
        }}>
          {health}
        </span>
        <button
          onClick={handleRefreshHealth}
          disabled={refreshingHealth}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 8, border: '1px solid var(--c-border)',
            background: 'var(--c-surface-2)', fontSize: 11, cursor: 'pointer',
            color: 'var(--c-text-2)', minHeight: 32, minWidth: 70, justifyContent: 'center'
          }}
          title="Verify destination page health"
        >
          <RefreshCw className={`h-3 w-3 ${refreshingHealth ? 'animate-spin' : ''}`} />
          Check
        </button>
      </div>

      {/* ── Conversion Stats ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-3)' }}>Vault Stats:</span>
        <span style={{ fontSize: 12, color: 'var(--c-text-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Number of preview page impressions">
          👁 <strong>{link.previewViews || 0}</strong> views
        </span>
        <span style={{ fontSize: 12, color: 'var(--c-border)' }}>|</span>
        <span style={{ fontSize: 12, color: 'var(--c-text-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }} title="Number of successful redirects to destination">
          🖱 <strong>{link.redirects || 0}</strong> redirects
        </span>
      </div>

      {/* ── Original & Short URL Stack ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--c-surface-2)', padding: 12, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', overflow: 'hidden' }}>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card-url"
            title={link.originalUrl}
            style={{ flex: 1, fontSize: 12 }}
          >
            <ExternalLink className="h-3 w-3" style={{ flexShrink: 0 }} />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{link.originalUrl}</span>
          </a>
          <button
            onClick={handleCopyOriginal}
            className="action-btn action-btn-ghost"
            style={{ minHeight: 36, padding: '0 12px', fontSize: 11 }}
            type="button"
          >
            Copy
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)' }}>Short link:</span>
          <span className="short-code-badge" style={{ fontSize: 11, padding: '2px 8px' }}>{link.shortCode}</span>
        </div>
      </div>

      {/* ── AI Preview Summary block ── */}
      {link.summary && (
        <div className="link-card-summary" style={{ margin: 0, padding: 12, borderRadius: 12 }}>
          <div className="link-card-summary-header" style={{ marginBottom: 6 }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--c-primary)' }} />
            <span style={{ fontSize: 11, color: 'var(--c-primary-text)', fontWeight: 700 }}>AI INTEL PREVIEW</span>
          </div>
          <p className="link-card-summary-text" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {link.summary}
          </p>
        </div>
      )}

      {/* ── Should You Open This? (AI Recommendation) ── */}
      <div style={{
        background: recDecision === 'YES' ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${recDecision === 'YES' ? '#C6F6D5' : '#FED7D7'}`,
        borderRadius: 12,
        padding: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {recDecision === 'YES' ? (
            <ShieldCheck className="h-4 w-4" style={{ color: '#38A169' }} />
          ) : (
            <ShieldAlert className="h-4 w-4" style={{ color: '#E53E3E' }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 700, color: recDecision === 'YES' ? '#276749' : '#9B2C2C' }}>
            Should You Open This? {recDecision}
          </span>
        </div>
        <p style={{ fontSize: 12, color: recDecision === 'YES' ? '#2F855A' : '#9B2C2C', margin: 0, lineHeight: 1.4 }}>
          {recReason}
        </p>
      </div>

      {/* ── Personal Custom Notes ── */}
      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)' }}>Personal Note</span>
          <button
            onClick={() => {
              if (isEditingNotes) handleSaveNotes();
              else setIsEditingNotes(true);
            }}
            style={{
              background: 'none', border: 'none', color: 'var(--c-primary)',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              minHeight: 36, padding: '0 8px'
            }}
            disabled={updateMutation.isPending}
          >
            {isEditingNotes ? (
              <><Save className="h-3.5 w-3.5" /> Save</>
            ) : (
              <><Edit3 className="h-3.5 w-3.5" /> {link.notes ? 'Edit' : 'Add note'}</>
            )}
          </button>
        </div>
        {isEditingNotes ? (
          <textarea
            className="create-input"
            style={{ width: '100%', minHeight: 60, padding: 8, fontSize: 12, resize: 'vertical' }}
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            placeholder="Type your notes here..."
          />
        ) : (
          <p style={{ fontSize: 12, color: link.notes ? 'var(--c-text-2)' : 'var(--c-text-4)', margin: 0, fontStyle: link.notes ? 'normal' : 'italic' }}>
            {link.notes || 'No note added yet. Explain why you saved this link.'}
          </p>
        )}
      </div>

      {/* ── Personal Custom Tags ── */}
      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)' }}>Tags</span>
          <button
            onClick={() => {
              if (isEditingTags) handleSaveTags();
              else setIsEditingTags(true);
            }}
            style={{
              background: 'none', border: 'none', color: 'var(--c-primary)',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              minHeight: 36, padding: '0 8px'
            }}
            disabled={updateMutation.isPending}
          >
            {isEditingTags ? (
              <><Save className="h-3.5 w-3.5" /> Save</>
            ) : (
              <><Edit3 className="h-3.5 w-3.5" /> Edit</>
            )}
          </button>
        </div>
        {isEditingTags ? (
          <input
            type="text"
            className="create-input"
            style={{ width: '100%', padding: 6, fontSize: 12 }}
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            placeholder="college, placements, leetcode"
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags.length > 0 ? (
              tags.map(t => (
                <span key={t} className="keyword-chip" style={{ fontSize: 11, background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
                  #{t}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 12, color: 'var(--c-text-4)', fontStyle: 'italic' }}>No tags yet.</span>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive Actions Row (Stacked/Grid for Mobile, 48px touch targets) ── */}
      <div style={{
        borderTop: '1px solid var(--c-border)', paddingTop: 14,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8
      }}>
        <button
          className={`action-btn ${copied ? 'action-btn-success' : 'action-btn-primary'}`}
          onClick={handleCopy}
          type="button"
          style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>

        {link.qrCode && (
          <button
            type="button"
            className="action-btn action-btn-ghost"
            onClick={() => setShowQr(true)}
            style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <QrCode className="h-4 w-4" /> QR
          </button>
        )}

        <Link
          to={`/analytics/${link._id}`}
          className="action-btn action-btn-ghost"
          style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
        >
          <BarChart3 className="h-4 w-4" /> Stats
        </Link>

        <button
          className="action-btn action-btn-danger"
          onClick={handleDelete}
          disabled={deleting}
          type="button"
          style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      {showQr && link.qrCode && (
        <QrModal shortCode={link.shortCode} qrCode={link.qrCode} shortUrl={shortUrl} onClose={() => setShowQr(false)} />
      )}
    </article>
  );
}

export default LinkCard;
