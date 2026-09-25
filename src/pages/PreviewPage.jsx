import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, ExternalLink, ShieldAlert, Radio,
  Copy, Check, ArrowLeft, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import DecisionCard from '../components/DecisionCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getFaviconUrl(favicon, originalUrl) {
  if (favicon) return favicon;
  try {
    const domain = new URL(originalUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return '';
  }
}

function getProxyUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_BASE_URL}/image-proxy?url=${encodeURIComponent(url)}`;
}

function PreviewPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Fetch preview data
  const previewQuery = useQuery({
    queryKey: ['preview-data', shortCode],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/preview/${shortCode}`);
      if (!response.ok) {
        throw new Error('Link preview not found');
      }
      const data = await response.json();
      return data.data;
    },
    retry: false
  });

  const link = previewQuery.data;

  const handleProceed = () => {
    if (!link) return;
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);
    window.location.href = `${backendUrl}/r/${shortCode}`;
  };

  const handleCopyOriginal = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.originalUrl);
      setCopied(true);
      toast.success('Original URL copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  if (previewQuery.isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', gap: 16, padding: 24, boxSizing: 'border-box'
      }}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#0EA5E9' }} />
        <p style={{ color: 'var(--c-text-3)', fontSize: 15, fontWeight: 500 }}>Analyzing webpage security and AI metrics...</p>
      </div>
    );
  }

  if (previewQuery.isError || !link) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', padding: '24px 20px', textAlign: 'center', boxSizing: 'border-box'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: '#fee2e2', display: 'grid', placeItems: 'center', marginBottom: 20
        }}>
          <ShieldAlert className="h-8 w-8" style={{ color: '#ef4444' }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-text)', margin: '0 0 8px' }}>Link Preview Error</h2>
        <p style={{ color: 'var(--c-text-3)', fontSize: 15, lineHeight: 1.6, maxWidth: 360, margin: '0 0 24px' }}>
          This link could not be loaded. It may have been disabled, deleted, or does not exist.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            minHeight: 48, padding: '0 24px', borderRadius: 12, border: '1px solid var(--c-border)',
            background: 'var(--c-surface)', color: 'var(--c-text-2)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const health = link.healthStatus ?? 'Alive';
  const isSummaryLong = Boolean(link.summary && link.summary.length > 160);

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '100vh',
      background: 'var(--c-bg)',
      paddingTop: 'calc(16px + env(safe-area-inset-top))',
      paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      paddingLeft: 16,
      paddingRight: 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 540,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>

        {/* ── Main Preview Card container ── */}
        <div style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-md)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 1. Website Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={link.favicon ? getProxyUrl(link.favicon) : getFaviconUrl('', link.originalUrl)}
              alt=""
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain border border-slate-200 flex-shrink-0 bg-white p-1"
              onError={e => { e.target.src = getFaviconUrl('', link.originalUrl); }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{
                fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--c-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {link.title || link.originalUrl}
              </h1>
              <p style={{
                fontSize: 13, color: 'var(--c-text-3)', margin: '2px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {link.originalUrl}
              </p>
            </div>
          </div>

          {/* Webpage Snapshot — Fallback cascade: real image → branded placeholder */}
          <div style={{
            width: '100%', borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--c-border)', position: 'relative'
          }} className="preview-snapshot-container">
            {link.thumbnail && !thumbnailError ? (
              <img
                src={getProxyUrl(link.thumbnail)}
                alt="Webpage preview"
                loading="lazy"
                onError={() => setThumbnailError(true)}
                style={{ width: '100%', height: '100%', minHeight: 180, maxHeight: 240, objectFit: 'cover', display: 'block' }}
              />
            ) : (() => {
              let domain = '';
              try { domain = new URL(link.originalUrl).hostname; } catch {}
              return (
                <div style={{
                  width: '100%', minHeight: 180, maxHeight: 240,
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 50%, #ddd6fe 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '24px 16px', boxSizing: 'border-box', position: 'relative'
                }}>
                  <img
                    src={link.favicon ? getProxyUrl(link.favicon) : getFaviconUrl('', link.originalUrl)}
                    alt=""
                    width={40} height={40}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: '2px solid rgba(255,255,255,0.7)',
                      background: '#fff', objectFit: 'contain', padding: 4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {domain && (
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: '#1e3a5f',
                      maxWidth: '80%', textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {domain}
                    </span>
                  )}
                  {link.contentType && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#4338ca',
                      background: 'rgba(255,255,255,0.6)', padding: '3px 10px',
                      borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {link.contentType}
                    </span>
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 2
                  }}>
                    Preview unavailable
                  </span>
                  <span style={{
                    position: 'absolute', bottom: 8, right: 12,
                    fontSize: 9, fontWeight: 700, color: 'rgba(99,102,241,0.4)',
                    letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}>
                    SmartLink
                  </span>
                </div>
              );
            })()}
          </div>

          {/* 2. AI Decision Card */}
          <DecisionCard
            recommendation={link.recommendation}
            keyHighlights={link.keyHighlights}
            bestFor={link.bestFor}
            contentType={link.contentType}
            estimatedReadTime={link.estimatedReadTime}
            readingDifficulty={link.readingDifficulty}
            targetAudience={link.targetAudience}
          />

          {/* 3. Upgraded AI Summary Card (Rendered ONLY if genuine summary exists) */}
          {link.summary && (
            <div style={{
              background: '#f0f9ff',
              borderLeft: '4px solid #0284c7',
              borderRadius: '0 14px 14px 0',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles className="h-4 w-4" style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    AI Web Analyst Summary
                  </span>
                </div>
                {link.summaryQuality && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                    background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd'
                  }}>
                    {link.summaryQuality}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 13.5, lineHeight: 1.65, margin: 0, color: '#0c4a6e', fontWeight: 450,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: isSummaryLong && !summaryExpanded ? 4 : 'unset',
                WebkitBoxOrient: 'vertical'
              }}>
                {link.summary}
              </p>
              {isSummaryLong && (
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  style={{
                    background: 'none', border: 'none', color: '#0284c7',
                    fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center',
                    gap: 4, cursor: 'pointer', padding: '2px 0 0', width: 'fit-content'
                  }}
                >
                  {summaryExpanded ? (
                    <>Show less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Read full summary <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* 4. Dynamic Category, Reading Time & Health Metadata */}
          {(() => {
            const metaCols = [];
            const cat = link.primaryCategory || link.category;
            const isGenericCat = !cat || ['general', 'technology', 'website', 'miscellaneous', 'other'].includes(String(cat).toLowerCase().trim());

            if (!isGenericCat) {
              metaCols.push(
                <div key="cat" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Category
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>
                    {cat}
                  </span>
                </div>
              );
            }
            // Reading time removed from metadata grid - shown in DecisionCard instead (avoid duplicate)
            if (health) {
              metaCols.push(
                <div key="health" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Health Status
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: health === 'Alive' ? '#16a34a' : '#d97706',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {health === 'Alive' ? <><Radio size={14} style={{color:'#16a34a'}} /> Alive</> : health === 'Redirect Changed' ? <><AlertCircle size={14} style={{color:'#d97706'}} /> Redirect</> : <><CircleX size={14} style={{color:'#d97706'}} /> Unreachable</>}
                  </span>
                </div>
              );
            }
            if (metaCols.length === 0) return null;
            return (
              <div style={{
                display: 'grid', gridTemplateColumns: `repeat(${metaCols.length}, 1fr)`, gap: 8,
                borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)',
                padding: '14px 0'
              }}>
                {metaCols}
              </div>
            );
          })()}

          {/* 5. Topics Chips (Rendered ONLY if topics exist) */}
          {link.topics && link.topics.length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Topics
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {link.topics.map(t => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                      background: 'var(--c-bg)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)'
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Continue to Website Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <button
              onClick={handleProceed}
              style={{
                width: '100%',
                minHeight: 52,
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
              onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
            >
              Continue to Website <ExternalLink className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={handleCopyOriginal}
              style={{
                width: '100%',
                minHeight: 52,
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--c-text-2)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--c-surface)'}
            >
              {copied ? <Check className="h-4.5 w-4.5" style={{ color: '#16a34a' }} /> : <Copy className="h-4.5 w-4.5" />}
              {copied ? 'Copied Link!' : 'Copy Original URL'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PreviewPage;
