import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/90 pt-10 pb-16 md:pb-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Brand + Actions Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200/70">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg tracking-tight">
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>
                SmartLink <span className="text-blue-600">AI</span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Understand destinations, evaluate trust signals, and share links with clarity.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors text-center shadow-xs"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="text-center sm:text-left leading-relaxed">
            SmartLink AI evaluates technical signals and AI content summaries. Signals are informational context, not absolute guarantees.
          </p>
          <p className="flex-shrink-0">
            &copy; {new Date().getFullYear()} SmartLink AI
          </p>
        </div>

      </div>
    </footer>
  );
}
