import { useRef } from 'react';
import { RefreshCw, HardDrive, Download, Upload } from 'lucide-react';
import { TYPE_META } from '../engine/patterns';

export function StatsBar({ registry, onReset, onExport, onImport }) {
  const fileRef = useRef(null);
  const total = registry.length;
  const byType = registry.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) { onImport(file); e.target.value = ''; }
  }

  return (
    <div className="stats-bar">
      <div className="stats-left">
        <div className={`status-dot ${total > 0 ? 'active' : ''}`} />
        <span className="stats-count">
          {total === 0 ? 'No secrets masked' : `${total} secret${total !== 1 ? 's' : ''} masked`}
        </span>
        {Object.entries(byType).map(([type, count]) => (
          <span key={type} className={`pill ${TYPE_META[type].color}`}>
            {count} {TYPE_META[type].label}{count !== 1 ? 's' : ''}
          </span>
        ))}
      </div>

      <div className="stats-right">
        {/* Persistence badge — always visible */}
        <div className="persist-badge" title="Registry is saved in your browser's localStorage — survives page refresh">
          <HardDrive size={11} />
          <span>Saved locally</span>
        </div>

        {/* Export */}
        <button
          className="btn-header-action"
          onClick={onExport}
          disabled={total === 0}
          title="Export registry as JSON backup"
        >
          <Download size={12} />
          Export
        </button>

        {/* Import */}
        <button
          className="btn-header-action"
          onClick={() => fileRef.current?.click()}
          title="Import a previously exported registry JSON"
        >
          <Upload size={12} />
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Reset */}
        <button className="btn-reset" onClick={onReset} title="Clear registry and start fresh">
          <RefreshCw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}
