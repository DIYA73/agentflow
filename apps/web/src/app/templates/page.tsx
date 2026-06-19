'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import { templatesApi } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  useCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  data: 'Data',
  automation: 'Automation',
  monitoring: 'Monitoring',
  communication: 'Communication',
};

const CATEGORY_COLORS: Record<string, string> = {
  ai: 'bg-accent/20 text-accent',
  data: 'bg-blue-900 text-blue-400',
  automation: 'bg-purple-900 text-purple-400',
  monitoring: 'bg-yellow-900 text-yellow-400',
  communication: 'bg-green-900 text-green-400',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    templatesApi.list()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const filtered = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  const handleUse = async (id: string) => {
    setUsingId(id);
    try {
      const flow = await templatesApi.use(id);
      router.push(`/flows/${flow.id}`);
    } catch {
      setUsingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/flows')}
          className="flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors"
        >
          <ArrowLeft size={15} /> Flows
        </button>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-accent" />
          <span className="font-semibold text-lg">Template Marketplace</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text">Start from a template</h1>
          <p className="text-sm text-text-dim mt-1">
            {templates.length} ready-made agent pipeline{templates.length !== 1 ? 's' : ''} — clone and customize in seconds
          </p>
        </div>

        {/* Category filter */}
        {!loading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeCategory === null
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-text-dim hover:text-text'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-accent text-white'
                    : 'bg-surface border border-border text-text-dim hover:text-text'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-2xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-text-dim">No templates in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-lg">
                    {template.icon || '⚡'}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      CATEGORY_COLORS[template.category] || 'bg-muted text-text-dim'
                    }`}
                  >
                    {CATEGORY_LABELS[template.category] || template.category}
                  </span>
                </div>

                <h3 className="font-semibold text-text mb-1">{template.name}</h3>
                <p className="text-xs text-text-dim leading-relaxed mb-4 flex-1">
                  {template.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-xs text-muted">
                    {template.useCount > 0
                      ? `Used ${template.useCount} time${template.useCount !== 1 ? 's' : ''}`
                      : 'Not used yet'}
                  </span>
                  <button
                    onClick={() => handleUse(template.id)}
                    disabled={usingId === template.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-dim text-white transition-colors disabled:opacity-50"
                  >
                    {usingId === template.id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Use template <ArrowRight size={11} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
