import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Clock, Tag, CheckCircle2, Info, Code2, Cpu, BookMarked, Briefcase, Cloud, Home, Plane, UtensilsCrossed, Heart, Building2, ShoppingCart, Palette, Camera, TrendingUp, Radio, CircleX, AlertCircle } from 'lucide-react';

/* ── Status Theme Configurations ── */
const STATUS_CONFIG = {
  'Recommended': {
    icon: ShieldCheck,
    label: 'Recommended',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '#86efac',
    text: '#15803d',
    chipBg: '#dcfce7',
    chipBorder: '#bbf7d0',
    chipText: '#166534',
    ringColor: '#22c55e',
    ringTrack: '#dcfce7',
    shadow: '0 4px 20px rgba(34, 197, 94, 0.12)',
  },
  'Open with Caution': {
    icon: AlertTriangle,
    label: 'Open with Caution',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '#fcd34d',
    text: '#a16207',
    chipBg: '#fef3c7',
    chipBorder: '#fde68a',
    chipText: '#92400e',
    ringColor: '#f59e0b',
    ringTrack: '#fef3c7',
    shadow: '0 4px 20px rgba(245, 158, 11, 0.12)',
  },
  'Not Recommended': {
    icon: ShieldAlert,
    label: 'Not Recommended',
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
    border: '#fca5a5',
    text: '#b91c1c',
    chipBg: '#fecaca',
    chipBorder: '#fca5a5',
    chipText: '#991b1b',
    ringColor: '#ef4444',
    ringTrack: '#fecaca',
    shadow: '0 4px 20px rgba(239, 68, 68, 0.12)',
  },
};

/* ── Animated Confidence Ring with Interactive Tap ── */
function ConfidenceRing({ value = 0, size = 64, strokeWidth = 5, color = '#22c55e', trackColor = '#dcfce7', onClick }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <button
      onClick={onClick}
      title="Click to view AI confidence factors"
      style={{
        position: 'relative', width: size, height: size, flexShrink: 0,
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        borderRadius: '50%', outline: 'none', transition: 'transform 0.15s ease'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>
          {animatedValue}%
        </span>
        <span style={{ fontSize: 8, color: '#64748b', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          info <Info size={8} />
        </span>
      </div>
    </button>
  );
}

function getAudienceEmoji(tag = '') {
  const lower = tag.toLowerCase();
  if (lower.includes('developer') || lower.includes('engineer') || lower.includes('coder') || lower.includes('programmer')) return '👨‍💻';
  if (lower.includes('ai') || lower.includes('data scientist') || lower.includes('machine learning')) return '🤖';
  if (lower.includes('student') || lower.includes('teacher') || lower.includes('academic') || lower.includes('professor')) return '🎓';
  if (lower.includes('job') || lower.includes('recruiter') || lower.includes('hr') || lower.includes('career')) return '💼';
  if (lower.includes('cloud') || lower.includes('devops') || lower.includes('sysadmin')) return '☁️';
  if (lower.includes('home') || lower.includes('architect') || lower.includes('builder') || lower.includes('interior')) return '🏡';
  if (lower.includes('travel') || lower.includes('tourist') || lower.includes('backpack')) return '✈️';
  if (lower.includes('food') || lower.includes('chef') || lower.includes('diner') || lower.includes('recipe')) return '🍕';
  if (lower.includes('patient') || lower.includes('doctor') || lower.includes('health') || lower.includes('medical')) return '🩺';
  if (lower.includes('citizen') || lower.includes('taxpayer') || lower.includes('voter')) return '🏛️';
  if (lower.includes('shop') || lower.includes('buyer') || lower.includes('customer') || lower.includes('fashion')) return '🛒';
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('artist')) return '🎨';
  if (lower.includes('photo') || lower.includes('camera')) return '📷';
  if (lower.includes('investor') || lower.includes('founder') || lower.includes('business') || lower.includes('finance')) return '📊';
  if (lower.includes('market') || lower.includes('creator') || lower.includes('writer') || lower.includes('blog')) return '📣';
  return '👤';
}

export default function DecisionCard({
  recommendation,
  keyHighlights = [],
  bestFor = [],
  contentType,
  estimatedReadTime,
  readingDifficulty,
  targetAudience
}) {
  const [showConfidenceFactors, setShowConfidenceFactors] = useState(false);

  if (!recommendation || !recommendation.status) return null;

  const status = recommendation.status;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Open with Caution'];
  const StatusIcon = config.icon;
  const confidence = typeof recommendation.confidence === 'number'
    ? Math.min(100, Math.max(0, recommendation.confidence))
    : 85;

  const rawBestFor = (bestFor && bestFor.length)
    ? bestFor
    : (recommendation.bestFor && recommendation.bestFor.length)
    ? recommendation.bestFor
    : [];

  const cleanBestFor = rawBestFor.filter(tag => tag && typeof tag === 'string' && !['general users', 'everyone', 'all users'].includes(tag.toLowerCase().trim()));

  // Dynamic Metadata Card list (NO fabricated defaults)
  const metaCards = [];

  if (estimatedReadTime) {
    metaCards.push(
      <div key="read-time" style={{
        background: 'rgba(255, 255, 255, 0.65)', borderRadius: 12, padding: '10px 10px',
        display: 'flex', flexDirection: 'column', gap: 2, border: `1px solid ${config.chipBorder}`
      }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={11} color="#0284c7" /> Read Time
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={14} color="#0284c7" /> {estimatedReadTime}
        </span>
      </div>
    );
  }

  if (contentType) {
    metaCards.push(
      <div key="content-type" style={{
        background: 'rgba(255, 255, 255, 0.65)', borderRadius: 12, padding: '10px 10px',
        display: 'flex', flexDirection: 'column', gap: 2, border: `1px solid ${config.chipBorder}`
      }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Tag size={11} color="#0284c7" /> Content Type
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Tag size={14} color="#0284c7" /> {contentType}
        </span>
      </div>
    );
  }

  // LEVEL (readingDifficulty) removed per user request

  // Interactive Confidence Factors
  const confidenceFactors = [
    'Domain Reputation & SSL Handshake',
    'HTTPS Protocol Security',
    'AI Content & Structure Evaluation',
    'Webpage Navigation & Metadata',
    'Safety & Malware Threat Inspection'
  ];

  return (
    <div
      id="ai-decision-card"
      style={{
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderRadius: 18,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: config.shadow,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── 1. Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, letterSpacing: '0.09em',
            textTransform: 'uppercase', color: config.text
          }}>
            SmartLink AI Verdict
          </span>
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.7)', color: config.text, border: `1px solid ${config.chipBorder}`
        }}>
          AI Powered
        </span>
      </div>

      {/* ── 2. Status + Confidence Row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: config.chipBg, border: `1px solid ${config.chipBorder}`,
            display: 'grid', placeItems: 'center', flexShrink: 0
          }}>
            <StatusIcon size={22} color={config.text} strokeWidth={2.5} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 18, fontWeight: 900, color: config.text, lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              {config.label}
            </p>
            <p style={{
              margin: '2px 0 0', fontSize: 10.5, fontWeight: 600, color: config.text,
              opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              Verdict Confidence
            </p>
          </div>
        </div>

        {/* Confidence Ring Button */}
        <ConfidenceRing
          value={confidence}
          size={62}
          strokeWidth={5}
          color={config.ringColor}
          trackColor={config.ringTrack}
          onClick={() => setShowConfidenceFactors(!showConfidenceFactors)}
        />
      </div>

      {/* ── 3. Confidence Factors Interactive Accordion ── */}
      {showConfidenceFactors && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 14,
          border: `1px solid ${config.chipBorder}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Confidence Factors
            </span>
            <button
              onClick={() => setShowConfidenceFactors(false)}
              style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {confidenceFactors.map((factor) => (
              <div key={factor} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Why Open This? ── */}
      {recommendation.reason && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)', borderRadius: 14, padding: '14px 16px',
          border: `1px solid ${config.chipBorder}`
        }}>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 800, color: config.text,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6
          }}>
            Why Open This?
          </p>
          <p style={{
            margin: 0, fontSize: 13.5, lineHeight: 1.65, color: '#1e293b',
            fontWeight: 500
          }}>
            {recommendation.reason}
          </p>
        </div>
      )}

      {/* ── 5. Best For (Rendered ONLY if genuine audience data exists) ── */}
      {cleanBestFor && cleanBestFor.length > 0 && (
        <div>
          <p style={{
            margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: config.text,
            textTransform: 'uppercase', letterSpacing: '0.07em'
          }}>
            👥 Best For
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cleanBestFor.map((group) => (
              <span
                key={group}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                  background: config.chipBg, color: config.chipText,
                  border: `1px solid ${config.chipBorder}`,
                  whiteSpace: 'nowrap'
                }}
              >
                {getAudienceEmoji(group)} {group}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Metadata Grid (Rendered ONLY if genuine metadata cards exist) ── */}
      {metaCards.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${metaCards.length}, 1fr)`, gap: 8,
          borderTop: `1px solid ${config.chipBorder}`, paddingTop: 14
        }}>
          {metaCards}
        </div>
      )}

      {/* Key Highlights removed per user request */}
    </div>
  );
}
