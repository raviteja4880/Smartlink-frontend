import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, ArrowRight, ShieldCheck, Brain, Eye, BarChart3, Loader2,
  Globe, Lock, CheckCircle2, Clock, ExternalLink
} from 'lucide-react';
import { linksApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

/* ── Compact value strip items ── */
const valueItems = [
  {
    icon: ShieldCheck,
    title: 'Security Signals',
    description: 'HTTPS, SSL, reachability and redirect indicators.',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0'
  },
  {
    icon: Brain,
    title: 'AI Content Intelligence',
    description: 'Summary, category, topics and content understanding.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE'
  },
  {
    icon: Eye,
    title: 'Smart Preview',
    description: 'See destination context before continuing.',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  {
    icon: BarChart3,
    title: 'Link Intelligence',
    description: 'Keep useful information associated with your SmartLink.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD'
  }
];

/* ── Sample demo data for the preview card ── */
const SAMPLE_DEMO = {
  title: 'MongoDB Atlas Architecture & Deployment Guide',
  domain: 'docs.mongodb.com',
  url: 'https://docs.mongodb.com/manual/tutorial/deploy-replica-set',
  trustScore: 94,
  recommendation: 'Recommended',
  summary: 'Comprehensive documentation on configuring, securing, and scaling distributed database clusters in cloud environments, including high-availability replica sets and automated failover protocols.',
  contentType: 'Documentation',
  category: 'Software Engineering',
  readTime: '4 min',
  topics: ['Database', 'Cloud', 'DevOps', 'High Availability'],
  highlights: [
    'Production cluster topology & election protocols',
    'Automated disaster recovery and backup scheduling',
    'Role-based access control and TLS configuration'
  ]
};

export default function HeroSection() {
  const token = localStorage.getItem('smartlink_token');
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState('');

  const createMutation = useMutation({
    mutationFn: linksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['links-selector'] });
      toast.success('SmartLink created with AI analysis!');
      setUrl('');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create link');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!token) {
      toast.warning('Please sign in to create smart links.');
      navigate('/login');
      return;
    }
    if (!url.trim()) return;
    createMutation.mutate({ originalUrl: url });
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[340px] opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.22) 0%, rgba(14,165,233,0.12) 45%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-28 pb-12 md:pb-20">

        {/* ── Hero Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center"
        >
          {/* Pill Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 transition-transform hover:scale-[1.02]"
            style={{
              background: 'var(--c-primary-light)',
              border: '1px solid #BFDBFE',
              color: 'var(--c-primary-text)'
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI-Powered Link Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Understand a Link{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
              Before You Open It.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            SmartLink AI analyzes web destinations, evaluates available security signals, and generates useful content intelligence before you decide to continue.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all active:scale-[0.98] text-sm sm:text-base text-center"
              style={{
                background: 'var(--c-primary)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-primary)')}
            >
              <span>{token ? 'Go to SmartLink Vault' : 'Create a SmartLink'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] text-sm sm:text-base text-center shadow-xs"
            >
              <span>Explore SmartLink</span>
            </Link>
          </div>
        </motion.div>

        {/* ── SmartLink Creation Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 sm:mt-14"
        >
          <form onSubmit={handleCreate} className="relative max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-2 sm:p-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg">
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a website URL to analyze..."
                  className="w-full bg-transparent outline-none text-sm sm:text-base text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-70 flex-shrink-0"
                style={{
                  background: 'var(--c-primary)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                }}
                onMouseEnter={(e) => { if (!createMutation.isPending) e.currentTarget.style.background = 'var(--c-primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-primary)'; }}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze &amp; Create</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Micro trust line */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              SSL &amp; Trust Signals
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Gemini AI Analysis</span>
            <span className="hidden sm:inline">•</span>
            <span>Free to use</span>
          </div>
        </motion.div>

        {/* ── Sample SmartLink Preview Demo ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-16 sm:mt-20"
        >
          {/* Section label */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Eye className="h-3.5 w-3.5" />
              What your recipients see
            </span>
          </div>

          {/* Demo Preview Card */}
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">

            {/* Card Header - SmartLink branding */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  SmartLink <span className="text-blue-600">AI</span>
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Sample Preview
              </span>
            </div>

            {/* 1. Destination Identity */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                <Globe className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {SAMPLE_DEMO.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  {SAMPLE_DEMO.domain}
                </p>
              </div>
            </div>

            {/* 2. Trust Score + Recommendation */}
            <div
              className="p-3.5 rounded-xl border flex items-center justify-between gap-3 mb-4"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderColor: '#86efac'
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Trust Assessment</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 inline-block mt-0.5">
                    {SAMPLE_DEMO.recommendation}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xl font-black text-emerald-700 tracking-tight">
                  {SAMPLE_DEMO.trustScore}
                </span>
                <span className="text-xs font-semibold text-emerald-600"> / 100</span>
              </div>
            </div>

            {/* 3. Safety Checks */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {['HTTPS Enabled', 'SSL Valid', 'Domain Reachable', 'Clean Redirects'].map((check) => (
                <div
                  key={check}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{check}</span>
                </div>
              ))}
            </div>

            {/* 4. AI Summary */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border-l-4 border-l-sky-500 border border-sky-200 mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider">AI Summary</span>
                <span className="text-[9px] font-semibold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded ml-auto">Gemini</span>
              </div>
              <p className="text-xs sm:text-sm text-sky-950 leading-relaxed">
                {SAMPLE_DEMO.summary}
              </p>
            </div>

            {/* 5. Meta strip */}
            <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Type</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{SAMPLE_DEMO.contentType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{SAMPLE_DEMO.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Read Time</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" /> {SAMPLE_DEMO.readTime}
                </span>
              </div>
            </div>

            {/* 6. Topics */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_DEMO.topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* 7. Key Highlights */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Key Highlights</p>
              <ul className="space-y-1">
                {SAMPLE_DEMO.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 8. Sample CTA Button */}
            <div className="pt-2">
              <div
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 opacity-90"
                style={{ background: '#0ea5e9' }}
              >
                Continue to Website <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Value Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-16 sm:mt-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all group"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
