import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { TYPE_META } from '../engine/patterns';

export function RegistryTable({ registry, onRemove }) {
  const [open, setOpen] = useState(true);
  const [revealed, setRevealed] = useState(new Set());

  function toggleReveal(id) {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const total = registry.length;
  const byType = registry.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card">
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="card-header-left">
          <ShieldCheck size={15} className="icon-green" />
          <span className="card-title">Secrets Registry</span>
          {total > 0 ? (
            <span className="pill green">{total} masked</span>
          ) : (
            <span className="pill muted">empty</span>
          )}
          {total > 0 && (
            <div className="type-summary">
              {byType.ip   && <span className="pill blue">{byType.ip} IP{byType.ip > 1 ? 's' : ''}</span>}
              {byType.key  && <span className="pill red">{byType.key} key{byType.key > 1 ? 's' : ''}</span>}
              {byType.pass && <span className="pill yellow">{byType.pass} pass</span>}
            </div>
          )}
        </div>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="registry-body">
          {total === 0 ? (
            <div className="empty-state">
              <span>No secrets detected yet — paste code and click Sanitize</span>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Detected As</th>
                    <th>Placeholder</th>
                    <th>Real Value</th>
                    <th>Hits</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {registry.map(entry => {
                    const meta = TYPE_META[entry.type];
                    const show = revealed.has(entry.id);
                    const sensitive = entry.type === 'key' || entry.type === 'pass';
                    return (
                      <tr key={entry.id}>
                        <td>
                          <span className={`type-badge ${meta.color}`}>{meta.label}</span>
                        </td>
                        <td className="text-muted small">{entry.patternName}</td>
                        <td>
                          <code className="placeholder">{entry.placeholder}</code>
                        </td>
                        <td>
                          <div className="real-value-cell">
                            <code className={`real-value ${sensitive && !show ? 'blurred' : ''}`}>
                              {entry.realValue}
                            </code>
                            {sensitive && (
                              <button
                                className="btn-icon-sm"
                                onClick={() => toggleReveal(entry.id)}
                                title={show ? 'Hide' : 'Reveal'}
                              >
                                {show ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="text-center text-muted small">{entry.count}</td>
                        <td>
                          <button
                            className="btn-icon-sm danger"
                            onClick={() => onRemove(entry.id)}
                            title="Remove from registry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
