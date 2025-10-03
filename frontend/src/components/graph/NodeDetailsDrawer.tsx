import React from 'react';
import type { GraphNode } from '../../types';
import { X, ExternalLink } from 'lucide-react';

type Props = {
  node: GraphNode | null;
  onClose: () => void;
};

export default function NodeDetailsDrawer({ node, onClose }: Props) {
  if (!node) return null;

  const metaEntries =
    node.meta && typeof node.meta === 'object'
      ? Object.entries(node.meta as Record<string, unknown>)
      : [];

  // Safely extract url from meta without using any
  const meta = (node.meta ?? {}) as Record<string, unknown>;
  const url = typeof meta.url === 'string' ? (meta.url as string) : undefined;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-md border-l border-slate-200 bg-white text-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{node.type}</p>
            <h3 className="text-lg font-semibold text-slate-900">{node.label}</h3>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </header>

        <div className="space-y-4 p-4">
          {metaEntries.length === 0 ? (
            <p className="text-sm text-slate-600">No additional metadata.</p>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700">Metadata</p>
              <dl className="mt-2 space-y-2">
                {metaEntries.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-2">
                    <dt className="text-xs font-medium text-slate-500">{k}</dt>
                    <dd className="col-span-2 break-words text-sm text-slate-800">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {node.type === 'document' && url ? (
            <a
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Open Source
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
