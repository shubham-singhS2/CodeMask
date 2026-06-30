import { useRef } from 'react';
import { Copy, Check, X, ClipboardPaste } from 'lucide-react';
import { useCopy } from '../hooks/useCopy';

export function CodePanel({ label, step, stepVariant, placeholder, value, onChange, readOnly }) {
  const { copied, copy } = useCopy();
  const lines = value ? value.split('\n').length : 0;
  const chars = value ? value.length : 0;

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (onChange) onChange(text);
    } catch {
      // fallback — user can manually paste
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-label">
          <span className={`step-badge ${stepVariant}`}>{step}</span>
          <span className="panel-title">{label}</span>
        </div>
        <div className="panel-actions">
          {lines > 0 && (
            <span className="meta-info">
              {lines.toLocaleString()} lines · {chars.toLocaleString()} chars
            </span>
          )}
          {!readOnly && value && (
            <button className="btn-icon danger" onClick={() => onChange('')} title="Clear">
              <X size={14} />
            </button>
          )}
          {!readOnly && (
            <button className="btn-icon" onClick={handlePaste} title="Paste from clipboard">
              <ClipboardPaste size={14} />
              <span>Paste</span>
            </button>
          )}
          {readOnly && (
            <button
              className={`btn-icon primary ${copied ? 'copied' : ''}`}
              onClick={() => copy(value)}
              disabled={!value}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
      <textarea
        className="code-area"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
