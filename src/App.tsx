import { useRef, useState } from 'react';
import { ArrowDownToLine, ArrowRight, Braces, Check, CheckCheck, ChevronRight, Code2, Copy, FileJson, FileUp, Moon, ShieldCheck, Sparkles, Sun, Trash2, WrapText, XCircle } from 'lucide-react';
import { MAX_INPUT, MAX_OUTPUT, parse, type Stats } from './json';

const SAMPLE = JSON.stringify({ project: 'developer-json-toolkit', version: '1.0.0', description: 'A little clarity for your JSON.', features: ['Format & minify', 'Validate with confidence', 'Keep your data local'], settings: { indentation: 2, theme: 'dark', private: true }, ready: true, dependencies: null }, null, 2);
type Action = 'format' | 'minify' | 'validate';

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('Ready when you are.');
  const [dark, setDark] = useState(true);
  const [wrap, setWrap] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const uploadVersion = useRef(0);

  function replaceInput(text: string) {
    uploadVersion.current++;
    setInput(text); setOutput(''); setStats(null); setError(''); setNotice('Input updated. Run an action to check it.');
  }
  function run(action: Action) {
    try {
      const result = parse(input);
      const rendered = action === 'validate' ? input : JSON.stringify(result.value, null, action === 'format' ? 2 : undefined);
      if (rendered.length > MAX_OUTPUT) throw new Error('Formatted output exceeds 1,000,000 characters. Try Minify or reduce the document.');
      setOutput(rendered); setStats(result.stats); setError('');
      setNotice(action === 'format' ? 'Formatted with 2-space indentation.' : action === 'minify' ? 'Minified. Every unnecessary space removed.' : 'Valid JSON. Original text preserved in output.');
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to process JSON.'); setOutput(''); setStats(null); setNotice('');
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    const version = ++uploadVersion.current;
    if (!file.name.toLowerCase().endsWith('.json')) { setError('Choose a file with a .json extension.'); return; }
    if (file.size > MAX_INPUT) { setError('File exceeds the 100 KB upload limit. Choose a smaller JSON file.'); return; }
    try {
      const text = await file.text();
      if (version !== uploadVersion.current) return;
      replaceInput(text); setNotice('File loaded. Format, minify or validate to continue.'); editorRef.current?.focus();
    } catch { if (version === uploadVersion.current) setError('This file could not be read. Try selecting it again.'); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setNotice('Output copied to clipboard.'); }
    catch { setNotice('Clipboard unavailable. Focus the output, then use Ctrl/Cmd+A and Ctrl/Cmd+C.'); }
  }
  function download() {
    if (!output || !stats) return;
    const url = URL.createObjectURL(new Blob([output], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'formatted.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('JSON download started.');
  }

  return <div className={dark ? 'app dark-theme' : 'app light-theme'}>
    <header className="topbar"><a href="#main" className="brand"><span className="brand-icon"><Braces size={23}/></span><span>devkit<span className="brand-dot">.</span></span><span className="brand-divider"/><span className="brand-sub">JSON Toolkit</span></a><div className="flex items-center gap-5"><span className="local-badge"><span/> All local. All yours.</span><button className="icon-button" onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
    <main id="main" className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-10 md:py-14">
      <div className="eyebrow"><Code2 size={14}/> THE DEVELOPER'S WORKBENCH</div>
      <div className="intro"><div><h1>Good JSON. <span>Clear thinking.</span></h1><p>Format, validate, and tidy up your data. Right here in your browser.</p></div><div className="privacy-label"><ShieldCheck size={17}/><span>Your data never leaves this page</span></div></div>
      <section aria-label="JSON workbench" className="workbench">
        <div className="toolbar"><div className="flex flex-wrap items-center gap-2"><button className="button primary" onClick={() => run('format')} title="Ctrl or Command + Enter"><Sparkles size={16}/> Format JSON <span className="keycap">⌘ ↵</span></button><button className="button" onClick={() => run('minify')}><Braces size={16}/> Minify</button><button className="button" onClick={() => run('validate')}><CheckCheck size={17}/> Validate</button></div><button className="button subtle" onClick={() => fileRef.current?.click()}><FileUp size={16}/> Upload .json</button><input ref={fileRef} className="hidden" type="file" accept=".json,application/json" aria-label="Upload JSON file" onChange={event => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }}/></div>
        <div className="pane-grid">
          <section className="pane"><div className="pane-heading"><label htmlFor="json-input"><span className="pane-number">01</span> Input <span className="file-tag">JSON</span></label><div className="flex items-center gap-2"><button className="text-button" onClick={() => { replaceInput(SAMPLE); editorRef.current?.focus(); }}>Load sample</button><span className="small-divider"/><button className="icon-button" aria-label="Clear input and output" title="Clear" onClick={() => { replaceInput(''); setNotice('Workbench cleared.'); editorRef.current?.focus(); }}><Trash2 size={15}/></button></div></div>
            <textarea id="json-input" ref={editorRef} value={input} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" aria-describedby="input-limit" placeholder={'Paste your JSON here…\n\n{ "hello": "world" }'} onChange={event => replaceInput(event.target.value)} onPaste={event => { const pasted = event.clipboardData.getData('text'); const el = event.currentTarget; if (input.length - (el.selectionEnd - el.selectionStart) + pasted.length > MAX_INPUT) { event.preventDefault(); setError('Paste exceeds the 100,000-character limit. Your current input has been preserved.'); } }} maxLength={MAX_INPUT} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(event.shiftKey ? 'minify' : 'format'); } }}/>
            <div className="pane-footer"><span>{input.length.toLocaleString()} characters</span><span id="input-limit">100,000 character limit</span></div>
          </section>
          <section className="pane output-pane"><div className="pane-heading"><label htmlFor="json-output"><span className="pane-number">02</span> Output {stats && <span className="valid-tag"><Check size={11}/> Valid</span>}</label><div className="flex items-center gap-1"><button className={`icon-button ${wrap ? 'selected' : ''}`} aria-label="Wrap output lines" aria-pressed={wrap} onClick={() => setWrap(!wrap)} title="Wrap lines"><WrapText size={16}/></button><button className="icon-button" aria-label="Copy output" title="Copy Output" onClick={() => void copy()} disabled={!output}><Copy size={15}/></button><button className="icon-button" aria-label="Download JSON" title="Download JSON" onClick={download} disabled={!output || !stats}><ArrowDownToLine size={16}/></button></div></div>
            <div className="output-body"><textarea id="json-output" value={output} readOnly spellCheck={false} wrap={wrap ? 'soft' : 'off'} aria-label="JSON output" className={!output ? 'empty-output' : ''}/>{!output && <div className="empty-state" aria-hidden="true"><div className="empty-icon"><FileJson size={30} strokeWidth={1.3}/></div><h2>A little structure goes a long way.</h2><p>Your processed JSON will appear here.</p><span>Choose an action to get started <ArrowRight size={13}/></span></div>}</div>
            <div className="pane-footer"><span>{output.length.toLocaleString()} characters</span><span>UTF-8 <span className="footer-dot">·</span> {wrap ? 'Wrapped' : 'Plain text'}</span></div>
          </section>
        </div>
        <div className={`status-bar ${error ? 'error' : ''}`} role="status" aria-live="polite">{error ? <XCircle size={16}/> : <span className="status-dot"/>}<span>{error || notice}</span>{!error && <span className="status-right">JSON / RFC 8259</span>}</div>
      </section>
      <div className="stats-grid" aria-label="JSON statistics"><Stat label="INPUT CHARACTERS" value={input.length.toLocaleString()} detail="including whitespace"/><Stat label="NESTING DEPTH" value={stats ? String(stats.depth) : '—'} detail="deepest container level"/><Stat label="TOP-LEVEL TYPE" value={stats?.type ?? '—'} detail="root value type"/><Stat label="TOP-LEVEL KEYS" value={stats ? stats.keys === null ? 'N/A' : String(stats.keys) : '—'} detail="object properties only"/></div>
      <div className="tips"><span><span className="tip-label">QUICK TIP</span> <kbd>Ctrl / ⌘</kbd> + <kbd>Enter</kbd> to format <span className="tip-separator">/</span> add <kbd>Shift</kbd> to minify</span><span className="flex items-center gap-2">Less noise. More signal. <ChevronRight size={13}/></span></div>
      <footer className="page-footer"><span><Braces size={14}/> developer-json-toolkit <span className="version">v1.0</span></span><span>No uploads. No tracking. Just JSON.</span></footer>
    </main>
  </div>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="stat"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-detail">{detail}</span></div>;
}
