import { useState, useCallback, useEffect } from 'react';
import { sanitize, restore } from '../engine/sanitizer';
import { TYPE_META } from '../engine/patterns';

const INITIAL_COUNTERS = { ip: 0, key: 0, pass: 0 };
const LS_REGISTRY_KEY = 'codemask_registry';
const LS_COUNTERS_KEY = 'codemask_counters';

// ── localStorage helpers ──────────────────────────────────────
function loadFromStorage() {
  try {
    const reg = localStorage.getItem(LS_REGISTRY_KEY);
    const cnt = localStorage.getItem(LS_COUNTERS_KEY);
    return {
      registry: reg ? JSON.parse(reg) : [],
      counters: cnt ? JSON.parse(cnt) : { ...INITIAL_COUNTERS },
    };
  } catch {
    // Corrupted storage — start fresh
    return { registry: [], counters: { ...INITIAL_COUNTERS } };
  }
}

function saveToStorage(registry, counters) {
  try {
    localStorage.setItem(LS_REGISTRY_KEY, JSON.stringify(registry));
    localStorage.setItem(LS_COUNTERS_KEY, JSON.stringify(counters));
  } catch {
    // Storage full or unavailable — silently continue
  }
}

function clearStorage() {
  localStorage.removeItem(LS_REGISTRY_KEY);
  localStorage.removeItem(LS_COUNTERS_KEY);
}

// ── Hook ─────────────────────────────────────────────────────
export function useRegistry() {
  // Initialise from localStorage on first render
  const [registry, setRegistry] = useState(() => loadFromStorage().registry);
  const [counters, setCounters] = useState(() => loadFromStorage().counters);

  // Persist to localStorage whenever registry or counters change
  useEffect(() => {
    saveToStorage(registry, counters);
  }, [registry, counters]);

  const runSanitize = useCallback((code) => {
    const reg = registry.map(r => ({ ...r }));
    const cnt = { ...counters };
    const result = sanitize(code, reg, cnt);
    setRegistry(reg);
    setCounters(cnt);
    return result;
  }, [registry, counters]);

  const runRestore = useCallback((code) => {
    return restore(code, registry);
  }, [registry]);

  const addManual = useCallback(({ type, realValue, customLabel }) => {
    if (!realValue || realValue.length < 2) return null;
    if (registry.some(r => r.realValue === realValue)) return 'duplicate';

    const cnt = { ...counters };
    cnt[type]++;

    const meta = TYPE_META[type];
    const label = customLabel
      ? customLabel.toUpperCase().replace(/\s+/g, '_')
      : { ip: 'IP', key: 'API_KEY', pass: 'PASSWORD' }[type];

    const entry = {
      id: crypto.randomUUID(),
      placeholder: `{{${label}_${cnt[type]}}}`,
      realValue,
      type,
      patternName: `Manual (${meta.label})`,
      count: 0,
      addedAt: Date.now(),
    };

    setRegistry(prev => [...prev, entry]);
    setCounters(cnt);
    return entry;
  }, [registry, counters]);

  const removeEntry = useCallback((id) => {
    setRegistry(prev => prev.filter(r => r.id !== id));
  }, []);

  const reset = useCallback(() => {
    clearStorage();
    setRegistry([]);
    setCounters({ ...INITIAL_COUNTERS });
  }, []);

  // Export registry as a downloadable JSON file
  const exportRegistry = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      counters,
      registry,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codemask-registry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [registry, counters]);

  // Import registry from a JSON file (merges with existing, skips duplicates)
  const importRegistry = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const payload = JSON.parse(e.target.result);
          if (!payload.registry || !Array.isArray(payload.registry)) {
            reject(new Error('Invalid file format'));
            return;
          }

          // Merge: skip entries whose realValue already exists
          setRegistry(prev => {
            const existingValues = new Set(prev.map(r => r.realValue));
            const newEntries = payload.registry.filter(r => !existingValues.has(r.realValue));
            return [...prev, ...newEntries];
          });

          // Merge counters — take the max of each type to avoid placeholder collisions
          setCounters(prev => ({
            ip:   Math.max(prev.ip,   payload.counters?.ip   ?? 0),
            key:  Math.max(prev.key,  payload.counters?.key  ?? 0),
            pass: Math.max(prev.pass, payload.counters?.pass ?? 0),
          }));

          resolve(payload.registry.length);
        } catch {
          reject(new Error('Could not parse file'));
        }
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  }, []);

  return {
    registry,
    runSanitize,
    runRestore,
    addManual,
    removeEntry,
    reset,
    exportRegistry,
    importRegistry,
  };
}
