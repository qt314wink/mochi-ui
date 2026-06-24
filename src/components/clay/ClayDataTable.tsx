import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClaySkeleton } from './ClaySkeleton';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface ClayDataTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  pageSize?: number;
  colorway?: 'mint' | 'lavender' | 'blue' | 'neutral';
  onRowClick?: (row: T) => void;
}

type SortDir = 'asc' | 'desc' | null;

const headerAccent: Record<string, string> = {
  mint:     'var(--mochi-mint)',
  lavender: 'var(--mochi-lavender-vivid)',
  blue:     'var(--mochi-sky-blue)',
  neutral:  'var(--text-secondary)',
};

export function ClayDataTable<T extends Record<string, unknown>>({
  columns, data, loading = false, skeletonRows = 5,
  pageSize = 10, colorway = 'mint', onRowClick,
}: ClayDataTableProps<T>) {
  const [sortKey, setSortKey]   = useState<keyof T | null>(null);
  const [sortDir, setSortDir]   = useState<SortDir>(null);
  const [page, setPage]         = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const paged  = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const pages  = Math.ceil(data.length / pageSize);

  const handleSort = (key: keyof T) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
  };

  const accent = headerAccent[colorway];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{
        borderRadius: 'var(--radius-squircle-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-clay)',
        background: 'var(--bg-card)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-family)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-inset)' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--type-label-size)',
                    fontWeight: 'var(--type-label-weight)' as unknown as number,
                    letterSpacing: 'var(--type-label-track)',
                    textTransform: 'uppercase',
                    color: sortKey === col.key ? accent : 'var(--text-secondary)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    {col.label}
                    {col.sortable && (
                      <motion.span
                        animate={{ rotate: sortKey === col.key && sortDir === 'desc' ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{ display: 'inline-block', fontSize: 10, opacity: sortKey === col.key ? 1 : 0.3 }}
                      >
                        ▲
                      </motion.span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={String(col.key)} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <ClaySkeleton variant="text" animation="wave" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <AnimatePresence mode="wait">
                {paged.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: -4 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                    whileHover={{ background: 'var(--bg-inset)' }}
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} style={{
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--type-body-size)',
                        color: 'var(--text-primary)',
                        lineHeight: 'var(--type-body-line)',
                      }}>
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-inset)',
          }}>
            <span style={{ fontSize: 'var(--type-meta-size)', color: 'var(--text-tertiary)' }}>
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {Array.from({ length: pages }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setPage(i)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 'var(--radius-squircle-xs)',
                    border: 'none',
                    background: page === i ? accent : 'var(--bg-surface)',
                    color: page === i ? 'white' : 'var(--text-secondary)',
                    fontSize: 'var(--type-meta-size)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-clay)',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClayDataTable;
