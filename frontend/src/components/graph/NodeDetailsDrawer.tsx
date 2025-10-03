import React from 'react';
import type { GraphNode } from '../../types';
import { X, ExternalLink } from 'lucide-react';

// In-memory cache for fetched avatar URLs by seed
const __avatarCache: Map<string, string> = new Map();

type Props = {
  node: GraphNode | null;
  onClose: () => void;
};

export default function NodeDetailsDrawer({ node, onClose }: Props) {
  // Derive safe meta and URL values regardless of node presence (ensure hooks are never conditional)
  const meta = (node?.meta ?? {}) as Record<string, unknown>;
  const url = typeof meta.url === 'string' ? (meta.url as string) : undefined;
  const avatarFromMeta =
    typeof meta.avatarUrl === 'string' ? (meta.avatarUrl as string) : undefined;

  // Deterministic seed and RoboHash fallback pieces (seed is safe even when node is null)
  const rawSeed = node?.id || node?.label || '';
  const seed = encodeURIComponent(rawSeed);
  const roboUrl = `https://robohash.org/${seed}.png?size=96x96&bgset=bg1`;

  // Fetched avatar state (RandomUser.me). Hooks are declared unconditionally.
  const [fetchedAvatar, setFetchedAvatar] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;

    // Only fetch for person nodes without an explicit avatar and when we have a seed
    if (!node || node.type !== 'person' || avatarFromMeta || !seed) {
      setFetchedAvatar(undefined);
      return () => {
        mounted = false;
      };
    }

    // Check in-memory cache first
    const cached = __avatarCache.get(seed);
    if (cached) {
      setFetchedAvatar(cached);
      return () => {
        mounted = false;
      };
    }

    const controller = new AbortController();

    async function loadAvatar() {
      try {
        const res = await fetch(`https://randomuser.me/api/?seed=${seed}&inc=picture&noinfo`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`avatar fetch failed: ${res.status}`);
        const json = (await res.json()) as {
          results?: Array<{ picture?: { large?: string } }>;
        };
        const large = json?.results?.[0]?.picture?.large;
        if (mounted && large) {
          __avatarCache.set(seed, large);
          setFetchedAvatar(large);
        }
      } catch {
        // swallow; will fall back to RoboHash
        if (mounted) setFetchedAvatar(undefined);
      }
    }

    void loadAvatar();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [node, avatarFromMeta, seed]);

  // Compute metadata entries for display (safe when node is null)
  const metaEntries =
    node?.meta && typeof node.meta === 'object'
      ? Object.entries(node.meta as Record<string, unknown>)
      : [];

  // Early return for no node AFTER hooks are declared
  if (!node) return null;

  const avatarUrl =
    node.type === 'person' ? (avatarFromMeta ?? fetchedAvatar ?? roboUrl) : undefined;

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
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Avatar for ${node.label}`}
                className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 object-cover"
                loading="lazy"
                width={40}
                height={40}
              />
            ) : null}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{node.type}</p>
              <h3 className="text-lg font-semibold text-slate-900">{node.label}</h3>
            </div>
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
