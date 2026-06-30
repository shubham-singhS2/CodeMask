import { useState, useEffect, useCallback } from 'react';
import { Shield, Unlock, Sun, Moon, Lock } from 'lucide-react';
import { CodePanel } from './components/CodePanel';
import { RegistryTable } from './components/RegistryTable';
import { ManualAdd } from './components/ManualAdd';
import { Toast } from './components/Toast';
import { StatsBar } from './components/StatsBar';
import { useRegistry } from './hooks/useRegistry';
import { useToast } from './hooks/useToast';
import './styles/global.css';
import './styles/components.css';

const MODES = [
  { id: 'sanitize', label: 'Sanitize for AI', icon: Shield, step: '1' },
  { id: 'restore',  label: 'Restore from AI', icon: Unlock, step: '2' },
];

export default function App() {
  const [mode, setMode]     = useState('sanitize');
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');
  const [theme, setTheme]   = useState(() => localStorage.getItem('cm-theme') || 'dark');

  const { registry, runSanitize, runRestore, addManual, removeEntry, reset, exportRegistry, importRegistry } = useRegistry();
  const { toast, show: showToast, hide: hideToast } = useToast();

  // Apply theme to <html> so CSS vars swap
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cm-theme', theme);
  }, [theme]);

  // Keyboard shortcut: Ctrl+Enter
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  function switchMode(m) {
    setMode(m);
    setInput('');
    setOutput('');
  }

  function handleRun() {
    if (!input.trim()) { showToast('Paste some code first', 'error'); return; }
    if (mode === 'sanitize') {
      const { output: out, newFinds } = runSanitize(input);
      setOutput(out);
      if (newFinds > 0) showToast(`✅ ${newFinds} new secret${newFinds !== 1 ? 's' : ''} masked — safe to copy`, 'success');
      else if (registry.length > 0) showToast(`✅ Applied ${registry.length} known placeholder${registry.length !== 1 ? 's' : ''}`, 'success');
      else showToast('ℹ️ No secrets detected in this code', 'info');
    } else {
      if (registry.length === 0) { showToast('Registry is empty — sanitize code first', 'error'); return; }
      const { output: out, restored } = runRestore(input);
      setOutput(out);
      if (restored > 0) showToast(`✅ ${restored} placeholder${restored !== 1 ? 's' : ''} restored to real values`, 'success');
      else showToast('ℹ️ No known placeholders found to restore', 'info');
    }
  }

  function handleAddManual(params) {
    const result = addManual(params);
    if (result === 'duplicate') { showToast('Already in registry', 'error'); return 'duplicate'; }
    if (result) showToast(`✅ Registered ${result.placeholder}`, 'success');
    return result;
  }

  function handleReset() {
    if (!window.confirm('Reset session? This clears the registry and all detected secrets.')) return;
    reset(); setInput(''); setOutput('');
    showToast('Session reset — registry cleared', 'info');
  }

  async function handleImport(file) {
    try {
      const count = await importRegistry(file);
      showToast(`✅ Imported ${count} entr${count !== 1 ? 'ies' : 'y'} into registry`, 'success');
    } catch (err) {
      showToast(`❌ Import failed: ${err.message}`, 'error');
    }
  }

  const isSanitize = mode === 'sanitize';

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">

          {/* Left: Logo + tagline */}
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon"><Shield size={18} /></div>
              <div>
                <div className="logo-name">Code<span>Mask</span></div>
                <div className="logo-sub">sanitize before you share</div>
              </div>
            </div>
            {/* Tagline — visible on wider screens */}
            <div className="header-tagline">
              <span className="tagline-text">
                Paste code → mask secrets → share safely with AI → restore real values
              </span>
              <span className="tagline-badge">
                <Lock size={10} /> 100% local · no data leaves your browser
              </span>
            </div>
          </div>

          {/* Right: Stats + theme toggle */}
          <div className="header-right">
            <StatsBar registry={registry} onReset={handleReset} onExport={exportRegistry} onImport={handleImport} />
            <button className="btn-theme" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

        </div>
      </header>

      <main className="main">
        {/* ── Mode Tabs ── */}
        <div className="mode-row">
          <div className="mode-tabs">
            {MODES.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.id} className={`mode-tab ${mode === m.id ? 'active' : ''}`} onClick={() => switchMode(m.id)}>
                  <span className="tab-step">{m.step}</span>
                  <Icon size={14} />
                  {m.label}
                </button>
              );
            })}
          </div>
          <div className="shortcut-hint"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run</div>
        </div>

        {/* ── Panels ── */}
        <div className="panels">
          <CodePanel
            label={isSanitize ? 'Your raw code' : 'AI response'}
            step={isSanitize ? 'INPUT' : 'AI RESPONSE'}
            stepVariant="green"
            placeholder={isSanitize
              ? 'Paste your code here — IPs, API keys, and passwords will be detected and masked before you share with AI...'
              : "Paste the AI's response here — placeholders like {{IP_1}}, {{API_KEY_1}} will be swapped back to real values..."}
            value={input} onChange={setInput} readOnly={false}
          />
          <div className="action-col">
            <button className={`btn-run ${isSanitize ? 'sanitize' : 'restore'}`} onClick={handleRun} disabled={!input.trim()}>
              {isSanitize ? <><Shield size={16} /> Sanitize</> : <><Unlock size={16} /> Restore</>}
            </button>
          </div>
          <CodePanel
            label={isSanitize ? 'Safe to share with AI' : 'Real values restored'}
            step={isSanitize ? 'SANITIZED' : 'RESTORED'}
            stepVariant={isSanitize ? 'blue' : 'yellow'}
            placeholder={isSanitize
              ? 'Sanitized code will appear here — copy and paste to your AI chat...'
              : 'Code with real values restored will appear here...'}
            value={output} onChange={() => {}} readOnly={true}
          />
        </div>

        <RegistryTable registry={registry} onRemove={removeEntry} />
        <ManualAdd onAdd={handleAddManual} />
      </main>

      <Toast toast={toast} onHide={hideToast} />
    </div>
  );
}
