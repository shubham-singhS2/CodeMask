import { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, FilePen } from 'lucide-react';

const TYPES = [
  { value: 'ip',   label: 'IP Address' },
  { value: 'key',  label: 'API Key / Token' },
  { value: 'pass', label: 'Password / Secret' },
];

export function ManualAdd({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('ip');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    if (!value.trim()) { setError('Value is required'); return; }
    if (value.trim().length < 2) { setError('Too short'); return; }
    const result = onAdd({ type, realValue: value.trim(), customLabel: label.trim() });
    if (result === 'duplicate') { setError('Already in registry'); return; }
    setValue('');
    setLabel('');
    setError('');
  }

  return (
    <div className="card">
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="card-header-left">
          <FilePen size={15} className="icon-dim" />
          <span className="card-title">Manual Add</span>
          <span className="card-subtitle">Register a secret the scanner missed</span>
        </div>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="manual-body">
          <div className="manual-row">
            <div className="field-group">
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="field-group flex2">
              <label>Real Value <span className="required">*</span></label>
              <input
                type="text"
                value={value}
                onChange={e => { setValue(e.target.value); setError(''); }}
                placeholder="e.g. 10.20.30.40 or sk-abc123..."
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="field-group">
              <label>Custom Label <span className="optional">(optional)</span></label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. PROD_DB_HOST"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="field-group field-btn">
              <label>&nbsp;</label>
              <button className="btn-add" onClick={handleAdd}>
                <PlusCircle size={15} />
                Add to Registry
              </button>
            </div>
          </div>
          {error && <p className="field-error">{error}</p>}
          <p className="manual-hint">
            After adding, re-run <strong>Sanitize</strong> to apply this entry to the current code.
          </p>
        </div>
      )}
    </div>
  );
}
