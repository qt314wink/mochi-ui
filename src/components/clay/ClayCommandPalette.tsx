import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface CommandItem {
  id: string;
  label: string;
  category?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface ClayCommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export const ClayCommandPalette: React.FC<ClayCommandPaletteProps> = ({
  items, isOpen, onClose, placeholder = 'Search commands…',
}) => {
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() =>
    items.filter(i => fuzzyMatch(query, i.label) || fuzzyMatch(query, i.category ?? '')),
    [items, query]
  );

  const categories = useMemo(() => {
    const cats = new Set(filtered.map(i => i.category ?? 'General'));
    return Array.from(cats);
  }, [filtered]);

  useEffect(() => { if (isOpen) { setQuery(''); setSelected(0); } }, [isOpen]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) {
        filtered[selected].onSelect();
        onClose();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, filtered, selected, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9500,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: 'clamp(60px, 15vh, 120px)',
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            role="dialog" aria-label="Command palette" aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.95,  y: -10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              width: '100%', maxWidth: 600,
              borderRadius: 'var(--radius-squircle-xl)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-lift-lg), var(--shadow-volume), var(--shadow-reflection)',
              overflow: 'hidden',
              margin: '0 var(--space-4)',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-5)',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 18 }}>⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0); }}
                placeholder={placeholder}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--type-body-size)',
                  color: 'var(--text-primary)',
                }}
              />
              <kbd style={{
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-squircle-xs)',
                background: 'var(--bg-inset)',
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
                boxShadow: 'var(--shadow-clay)',
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 'var(--space-2) 0' }}>
              {filtered.length === 0 ? (
                <div style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  fontSize: 'var(--type-meta-size)',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-family)',
                }}>No results for "{query}"</div>
              ) : (
                categories.map(cat => (
                  <div key={cat}>
                    <div style={{
                      padding: 'var(--space-2) var(--space-5)',
                      fontSize: 'var(--type-label-size)',
                      fontWeight: 'var(--type-label-weight)' as unknown as number,
                      letterSpacing: 'var(--type-label-track)',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-family)',
                    }}>{cat}</div>
                    {filtered
                      .filter(i => (i.category ?? 'General') === cat)
                      .map((item, idx) => {
                        const globalIdx = filtered.indexOf(item);
                        const isSelected = globalIdx === selected;
                        return (
                          <motion.div
                            key={item.id}
                            onMouseEnter={() => setSelected(globalIdx)}
                            onClick={() => { item.onSelect(); onClose(); }}
                            animate={{ background: isSelected ? 'var(--bg-inset)' : 'transparent' }}
                            style={{
                              display: 'flex', alignItems: 'center',
                              gap: 'var(--space-3)',
                              padding: 'var(--space-3) var(--space-5)',
                              cursor: 'pointer',
                              borderRadius: 'var(--radius-squircle-xs)',
                              margin: '0 var(--space-2)',
                            }}
                          >
                            {item.icon && <span style={{ color: 'var(--text-secondary)', width: 20, textAlign: 'center' }}>{item.icon}</span>}
                            <span style={{
                              flex: 1,
                              fontSize: 'var(--type-body-size)',
                              fontFamily: 'var(--font-family)',
                              color: 'var(--text-primary)',
                            }}>{item.label}</span>
                            {item.shortcut && (
                              <kbd style={{
                                padding: 'var(--space-1) var(--space-2)',
                                borderRadius: 'var(--radius-squircle-xs)',
                                background: 'var(--bg-surface)',
                                fontSize: 11, fontFamily: 'var(--font-mono)',
                                color: 'var(--text-tertiary)',
                              }}>{item.shortcut}</kbd>
                            )}
                          </motion.div>
                        );
                      })
                    }
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClayCommandPalette;
