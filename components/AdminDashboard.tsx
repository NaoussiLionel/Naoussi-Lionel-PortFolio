'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, Briefcase, GraduationCap, Lightbulb, Medal, Layers, Settings2, Mail, LogOut, ExternalLink, Plus, Trash2, Save, ArrowLeft, CloudUpload, Image, CheckCircle2, AlertCircle, LoaderCircle, Eye, EyeOff, FileText, Menu, X, ChevronRight, LockKeyhole, RefreshCw } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { defaults } from '@/lib/defaults';
import type { Entry, Kind, Message, SiteSettings } from '@/lib/types';

type StatusFilter = 'all' | 'published' | 'draft';

const kinds: { kind: Kind; label: string; icon: any }[] = [
  { kind: 'project', label: 'Projects', icon: FolderKanban },
  { kind: 'service', label: 'Services', icon: Layers },
  { kind: 'skill', label: 'Skills', icon: Lightbulb },
  { kind: 'experience', label: 'Experience', icon: Briefcase },
  { kind: 'education', label: 'Education', icon: GraduationCap },
  { kind: 'certification', label: 'Certifications', icon: Medal },
];
const blank = (kind: Kind): Entry => ({ id: '', kind, slug: '', title: '', subtitle: '', description: '', cover: '', gallery: [], tags: [], metadata: {}, featured: false, published: false, sort_order: 0 });
const tabs = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, ...kinds.map(k => ({ id: k.kind, label: k.label, icon: k.icon })), { id: 'settings', label: 'Website Studio', icon: Settings2 }, { id: 'messages', label: 'Messages', icon: Mail }];
const settingGroups: { heading: string; fields: { key: keyof SiteSettings; label: string; type?: string; hint?: string }[] }[] = [
  { heading: 'Identity & Hero', fields: [{ key: 'name', label: 'Display name' }, { key: 'role', label: 'Professional title' }, { key: 'eyebrow', label: 'Hero eyebrow text' }, { key: 'tagline', label: 'Main hero title (line break supported)', type: 'textarea' }, { key: 'intro', label: 'Hero introduction', type: 'textarea' }, { key: 'availability', label: 'Availability label' }, { key: 'heroImage', label: 'Hero image URL', type: 'media' }, { key: 'profileImage', label: 'Profile image URL', type: 'media' }] },
  { heading: 'Biography & Contact', fields: [{ key: 'about', label: 'Full About Me text', type: 'textarea' }, { key: 'location', label: 'Location' }, { key: 'email', label: 'Public contact email' }, { key: 'phone', label: 'Phone number' }, { key: 'linkedin', label: 'LinkedIn URL' }, { key: 'github', label: 'GitHub URL' }, { key: 'cvUrl', label: 'CV / résumé URL', type: 'media' }] },
  { heading: 'Blueprint Design', fields: [{ key: 'accent', label: 'Blueprint cyan', type: 'color' }, { key: 'accentAlt', label: 'Annotation amber', type: 'color' }, { key: 'gridOpacity', label: 'Grid opacity (0 to 0.8)' }, { key: 'footerText', label: 'Footer text' }, { key: 'seoDescription', label: 'SEO description', type: 'textarea' }] },
  { heading: 'Visible Sections', fields: [{ key: 'showServices', label: 'Services', type: 'toggle' }, { key: 'showSkills', label: 'Skills', type: 'toggle' }, { key: 'showExperience', label: 'Experience', type: 'toggle' }, { key: 'showEducation', label: 'Education', type: 'toggle' }, { key: 'showCertifications', label: 'Certifications', type: 'toggle' }, { key: 'showContact', label: 'Contact form', type: 'toggle' }] }
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function api(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export default function AdminDashboard() {
  const [authenticated, setAuth] = useState<boolean | null>(null), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [tab, setTab] = useState('overview'), [entries, setEntries] = useState<Entry[]>([]), [settings, setSettings] = useState<SiteSettings>(defaults), [messages, setMessages] = useState<Message[]>([]);
  const [editor, setEditor] = useState<Entry | null>(null), [saving, setSaving] = useState(false), [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(''), [error, setError] = useState(''), [mobile, setMobile] = useState(false), [canEdit, setCanEdit] = useState(true);
  const [search, setSearch] = useState(''), [statusFilter, setStatusFilter] = useState<StatusFilter>('all'), [showPassword, setShowPassword] = useState(false);

  const editorBaseline = useRef('');
  const settingsBaseline = useRef(JSON.stringify(defaults));
  const editorOpen = editor !== null;
  const editorDirty = editor !== null && JSON.stringify(editor) !== editorBaseline.current;
  const settingsDirty = JSON.stringify(settings) !== settingsBaseline.current;
  const currentKind = kinds.find(k => k.kind === tab);
  const unreadCount = messages.filter(m => !m.is_read).length;

  const flash = (message: string) => { setNotice(message); setError(''); };
  const fail = (err: unknown) => { setError((err as Error).message); setNotice(''); };

  // Single guard for every action that could throw away work.
  function confirmDiscard() {
    if (!editorDirty && !settingsDirty) return true;
    if (!window.confirm('You have unsaved changes. Discard them?')) return false;
    if (editorDirty) { setEditor(null); editorBaseline.current = ''; }
    if (settingsDirty) setSettings(JSON.parse(settingsBaseline.current) as SiteSettings);
    return true;
  }

  async function refresh(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [a, b, c] = await Promise.all([api('/api/admin/entries'), api('/api/admin/settings'), api('/api/admin/messages')]);
      setEntries(a.entries);
      setCanEdit(a.database);
      setSettings(b.settings);
      settingsBaseline.current = JSON.stringify(b.settings);
      setMessages(c.messages);
    } catch (err) {
      fail(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    api('/api/auth/me').then(r => {
      setAuth(r.authenticated);
      if (r.authenticated) refresh();
      else setLoading(false);
    }).catch(() => { setAuth(false); setLoading(false); });
  }, []);

  // Warn on browser close / refresh while there is unsaved work.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!editorDirty && !settingsDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editorDirty, settingsDirty]);

  // Escape closes the mobile navigation.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobile(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Move focus/scroll to the top when the editor opens.
  useEffect(() => {
    if (editorOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [editorOpen]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api('/api/auth/login', 'POST', { email, password });
      setAuth(true);
      setPassword('');
      await refresh();
      flash('Signed in. Welcome back to the workbench.');
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  async function logout() {
    if (!confirmDiscard()) return;
    await api('/api/auth/logout', 'POST');
    setAuth(false);
    setEditor(null);
    setEntries([]);
  }

  function beginEdit(entry: Entry, nextTab?: string) {
    if (!confirmDiscard()) return;
    if (nextTab) setTab(nextTab);
    editorBaseline.current = JSON.stringify(entry);
    setEditor(entry);
    setMobile(false);
    setError('');
    setNotice('');
  }

  function closeEditor() {
    if (!confirmDiscard()) return;
    setEditor(null);
  }

  function go(nextTab: string) {
    if (nextTab === tab && !editor) return;
    if (!confirmDiscard()) return;
    setTab(nextTab);
    setEditor(null);
    setMobile(false);
    setError('');
    setNotice('');
    setSearch('');
    setStatusFilter('all');
  }

  const startNew = (kind: Kind) => beginEdit(blank(kind), kind);

  async function saveEntry() {
    if (!editor || !editor.title.trim()) return;
    setSaving(true);
    try {
      const data = { ...editor, title: editor.title.trim(), slug: editor.slug ? slugify(editor.slug) : slugify(editor.title) };
      const r = await api(editor.id ? '/api/admin/entries/' + editor.id : '/api/admin/entries', editor.id ? 'PUT' : 'POST', data);
      setEditor(null);
      await refresh(true);
      flash('Content saved successfully: ' + r.entry.title);
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  async function removeEntry(entry: Entry) {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return;
    const previous = entries;
    // Optimistic: remove immediately, roll back if the server rejects it.
    setEntries(list => list.filter(e => e.id !== entry.id));
    try {
      await api('/api/admin/entries/' + entry.id, 'DELETE');
      flash('Entry deleted.');
    } catch (err) {
      setEntries(previous);
      fail(err);
    }
  }

  async function togglePublished(entry: Entry) {
    if (!canEdit) return;
    const next = { ...entry, published: !entry.published };
    setEntries(list => list.map(e => e.id === entry.id ? next : e));
    try {
      const r = await api('/api/admin/entries/' + entry.id, 'PUT', next);
      setEntries(list => list.map(e => e.id === entry.id ? r.entry : e));
      flash(next.published ? `Published: ${entry.title}` : `Moved to draft: ${entry.title}`);
    } catch (err) {
      setEntries(list => list.map(e => e.id === entry.id ? entry : e));
      fail(err);
    }
  }

  async function toggleMessageRead(message: Message) {
    if (!canEdit) return;
    const next = !message.is_read;
    setMessages(list => list.map(m => m.id === message.id ? { ...m, is_read: next } : m));
    try {
      await api('/api/admin/messages/' + message.id, 'PATCH', { read: next });
    } catch (err) {
      setMessages(list => list.map(m => m.id === message.id ? { ...m, is_read: !next } : m));
      fail(err);
    }
  }

  async function markAllRead() {
    if (!canEdit || !unreadCount) return;
    const previous = messages;
    setMessages(list => list.map(m => ({ ...m, is_read: true })));
    try {
      await api('/api/admin/messages', 'PATCH', { read: true });
      flash('All messages marked as read.');
    } catch (err) {
      setMessages(previous);
      fail(err);
    }
  }

  async function removeMessage(message: Message) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    const previous = messages;
    setMessages(list => list.filter(m => m.id !== message.id));
    try {
      await api('/api/admin/messages/' + message.id, 'DELETE');
      flash('Message deleted.');
    } catch (err) {
      setMessages(previous);
      fail(err);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const r = await api('/api/admin/settings', 'PUT', settings);
      setSettings(r.settings);
      settingsBaseline.current = JSON.stringify(r.settings);
      flash('Website settings updated. Public pages now use these values.');
    } catch (err) { fail(err); } finally { setSaving(false); }
  }

  const counts = (kind: Kind) => entries.filter(e => e.kind === kind).length;

  const visibleEntries = useMemo(() => {
    if (!currentKind) return [];
    const query = search.trim().toLowerCase();
    return entries
      .filter(e => e.kind === currentKind.kind)
      .filter(e => statusFilter === 'all' || (statusFilter === 'published' ? e.published : !e.published))
      .filter(e => !query || [e.title, e.subtitle, e.slug, e.tags.join(' ')].join(' ').toLowerCase().includes(query));
  }, [entries, currentKind, search, statusFilter]);

  if (authenticated === null) {
    return <div className="admin-loading" role="status" aria-live="polite"><LoaderCircle className="spin" /> VERIFYING SESSION</div>;
  }

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="login-art">
          <div className="login-grid" />
          <div className="login-logo">S<span>/</span>E</div>
          <span>A PRIVATE ENGINEERING WORKBENCH</span>
          <h1>THE<br />WORK<br /><em>BENCH.</em></h1>
          <p>A paper-minded workspace for every drawing, project, specification and detail of your portfolio.</p>
          <div className="login-index">ADMIN ACCESS / PRIVATE DESK&nbsp; ↗</div>
        </div>
        <div className="login-form-col">
          <form className="login-form" onSubmit={login} noValidate>
            <LockKeyhole size={29} />
            <div className="section-overline">ADMIN / SIGN IN</div>
            <h2>WELCOME BACK.</h2>
            <p>Open the workbench to manage your portfolio.</p>
            <label>
              ADMIN EMAIL
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" />
            </label>
            <label>
              PASSWORD
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={Boolean(error)}
                />
                <button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="primary-btn" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={17} />} OPEN THE WORKBENCH
            </button>
            {error && <p className="form-error" id="login-error" role="alert">{error}</p>}
            <Link href="/" className="back-link"><ArrowLeft size={15} /> BACK TO PORTFOLIO</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      {mobile && <button type="button" className="admin-scrim" aria-label="Close navigation" onClick={() => setMobile(false)} />}

      <aside id="admin-sidebar" className={'admin-sidebar ' + (mobile ? 'show' : '')} aria-label="Admin navigation">
        <div className="admin-side-header">
          <Link href="/" className="admin-side-logo">S<span>/</span>E <small>WORKBENCH</small></Link>
          <button type="button" className="admin-mobile-close" aria-label="Close navigation" onClick={() => setMobile(false)}><X size={20} /></button>
        </div>
        <div className="sidebar-label">NOTEBOOK / 01</div>
        <nav aria-label="Sections">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button type="button" key={t.id} className={'sidebar-item ' + (tab === t.id ? 'active' : '')} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
                <Icon size={17} />
                <span>{t.label}</span>
                {kinds.some(k => k.kind === t.id) && <small>{counts(t.id as Kind)}</small>}
                {t.id === 'messages' && unreadCount > 0 && <small className="sidebar-badge">{unreadCount}</small>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> VIEW LIVE SITE</a>
          <button type="button" onClick={logout}><LogOut size={16} /> SIGN OUT</button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button type="button" className="admin-open-menu" aria-label="Open navigation" aria-expanded={mobile} aria-controls="admin-sidebar" onClick={() => setMobile(true)}><Menu size={21} /></button>
          <div className="breadcrumb">WORKBENCH <ChevronRight size={13} /> <strong>{editor ? 'EDIT CONTENT' : tabs.find(t => t.id === tab)?.label.toUpperCase()}</strong></div>
          <div className="top-actions">
            <span className={'live-dot ' + (canEdit ? '' : 'demo')} />
            <span className={'top-live ' + (canEdit ? '' : 'demo')}>{canEdit ? 'ADMIN CONNECTED' : 'DEMO MODE'}</span>
            <a href="/" target="_blank" rel="noopener noreferrer" title="Open public website" aria-label="Open public website in a new tab"><ExternalLink size={17} /></a>
          </div>
        </div>

        <div className="admin-content">
          <div className="admin-page-top">
            <div>
              <div className="section-overline">PORTFOLIO WORKBENCH</div>
              <h1>{editor ? 'CONTENT EDITOR' : tab === 'overview' ? 'OVERVIEW' : (tabs.find(t => t.id === tab)?.label || 'OVERVIEW').toUpperCase()}</h1>
              <p>{editor ? 'Update content, media and publication settings.' : tab === 'overview' ? 'Your portfolio, laid out and ready to edit.' : tab === 'settings' ? 'Tune the public-facing identity and design.' : tab === 'messages' ? 'Enquiries from recruiters, clients and collaborators.' : 'Create, edit, order and publish your portfolio content.'}</p>
            </div>
            {currentKind && !editor && <button type="button" className="primary-btn" onClick={() => startNew(currentKind.kind)}><Plus size={17} /> ADD {currentKind.kind.toUpperCase()}</button>}
          </div>

          {!canEdit && <div className="admin-alert" role="status"><AlertCircle size={18} /> DATABASE NOT CONNECTED — Content shown is illustrative. Connect Neon and run <code>npm run db:init</code> to enable saving.</div>}
          {error && <div className="admin-alert error" role="alert"><AlertCircle size={18} />{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
          {notice && <div className="admin-alert success" role="status" aria-live="polite"><CheckCircle2 size={18} />{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}

          {loading ? (
            <div className="admin-skeleton" role="status" aria-live="polite">
              <span className="sr-only">Loading portfolio data…</span>
              <div className="skeleton-line wide" />
              <div className="skeleton-grid">{[0, 1, 2, 3].map(i => <div className="skeleton-card" key={i} />)}</div>
              <div className="skeleton-line" style={{ marginTop: 26, width: '60%' }} />
              <div className="skeleton-line" style={{ width: '80%' }} />
            </div>
          ) : editor ? (
            <div className="editor-layout">
              <div className="editor-main">
                <button type="button" className="back-link" onClick={closeEditor}><ArrowLeft size={16} /> BACK TO {tab.toUpperCase()}</button>
                {!canEdit && <p className="readonly-note">Read-only demo: connect a database to save this entry.</p>}

                <div className="admin-panel">
                  <div className="panel-header"><h2>CONTENT DETAILS</h2><span>01 / 03</span></div>
                  <div className="admin-field-grid">
                    <label htmlFor="editor-title">DISPLAY TITLE <span className="req" aria-hidden="true">*</span>
                      <input
                        id="editor-title"
                        value={editor.title}
                        onChange={e => setEditor({ ...editor, title: e.target.value })}
                        onBlur={() => setEditor(previous => previous ? { ...previous, slug: previous.slug || slugify(previous.title) } : previous)}
                        placeholder="e.g. 12-storey office building"
                        aria-required="true"
                      />
                    </label>
                    <label htmlFor="editor-slug">URL SLUG
                      <input
                        id="editor-slug"
                        value={editor.slug}
                        onChange={e => setEditor({ ...editor, slug: e.target.value })}
                        onBlur={() => setEditor(previous => previous ? { ...previous, slug: slugify(previous.slug || previous.title) } : previous)}
                        placeholder="generated-from-title"
                        aria-describedby="editor-slug-hint"
                      />
                      <small className="slug-preview" id="editor-slug-hint">
                        {editor.kind === 'project' ? <>PUBLIC URL: /projects/{editor.slug || slugify(editor.title) || 'your-project'}</> : 'Used internally to identify this entry.'}
                      </small>
                    </label>
                  </div>
                  <label htmlFor="editor-subtitle">SUBTITLE / CATEGORY
                    <input id="editor-subtitle" value={editor.subtitle} onChange={e => setEditor({ ...editor, subtitle: e.target.value })} placeholder="REINFORCED CONCRETE / RESIDENTIAL" />
                  </label>
                  <label htmlFor="editor-description">DESCRIPTION / DESIGN EXPLANATION
                    <textarea id="editor-description" rows={7} value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })} placeholder="Explain the engineering challenge, your role, analysis and solution..." />
                  </label>
                  <label htmlFor="editor-tags">TAGS (SEPARATED BY COMMAS)
                    <input id="editor-tags" value={editor.tags.join(', ')} onChange={e => setEditor({ ...editor, tags: e.target.value.split(',').map(x => x.trim()) })} placeholder="ETABS, RC DESIGN, FOUNDATIONS" />
                  </label>
                  <div className="admin-field-grid">
                    <label htmlFor="editor-sort">SORT ORDER (LOW FIRST)
                      <input id="editor-sort" type="number" min="0" value={editor.sort_order} onChange={e => setEditor({ ...editor, sort_order: Number(e.target.value) })} />
                    </label>
                    <label htmlFor="editor-kind">CATEGORY
                      <select id="editor-kind" value={editor.kind} onChange={e => setEditor({ ...editor, kind: e.target.value as Kind })}>{kinds.map(k => <option value={k.kind} key={k.kind}>{k.label}</option>)}</select>
                    </label>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="panel-header"><h2>ENGINEERING SPECIFICATIONS</h2><span>02 / 03</span></div>
                  <p className="panel-help">Add custom key-value fields: software, location, year, structural system, client, loads or design codes.</p>
                  {Object.entries(editor.metadata).map(([key, value], i) => (
                    <div className="meta-edit-row" key={i}>
                      <input aria-label="Specification name" value={key} onChange={e => { const pairs = Object.entries(editor.metadata); pairs[i][0] = e.target.value; setEditor({ ...editor, metadata: Object.fromEntries(pairs) }); }} />
                      <input aria-label="Specification value" value={value} onChange={e => setEditor({ ...editor, metadata: { ...editor.metadata, [key]: e.target.value } })} />
                      <button type="button" className="icon-btn danger" aria-label={`Remove ${key || 'specification'}`} onClick={() => { const m = { ...editor.metadata }; delete m[key]; setEditor({ ...editor, metadata: m }); }}><Trash2 size={17} /></button>
                    </div>
                  ))}
                  <button type="button" className="subtle-btn" onClick={() => setEditor({ ...editor, metadata: { ...editor.metadata, ['New field ' + (Object.keys(editor.metadata).length + 1)]: '' } })}><Plus size={16} /> ADD DATA FIELD</button>
                </div>

                <div className="admin-panel">
                  <div className="panel-header"><h2>PROJECT MEDIA & DOCUMENTS</h2><span>03 / 03</span></div>
                  <p className="panel-help">Upload images or shareable PDF drawings directly to Vercel Blob. Only media intentionally published here should be uploaded to this public Blob store.</p>
                  <label htmlFor="editor-cover">FEATURED COVER IMAGE URL
                    <input id="editor-cover" value={editor.cover} onChange={e => setEditor({ ...editor, cover: e.target.value })} placeholder="https://..." />
                  </label>
                  <Uploader onDone={url => setEditor(p => p ? { ...p, cover: url } : p)} label="UPLOAD COVER IMAGE" accept="image/*" />
                  {editor.cover && <img className="edit-cover-preview" src={editor.cover} alt="Cover preview" />}
                  <div className="gallery-manager">
                    <h3>PROJECT GALLERY / DOCUMENTS ({editor.gallery.length})</h3>
                    {editor.gallery.map((url, i) => (
                      <div className="gallery-edit" key={i}>
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        <input aria-label={`Gallery URL ${i + 1}`} value={url} onChange={e => setEditor({ ...editor, gallery: editor.gallery.map((x, j) => i === j ? e.target.value : x) })} />
                        <button type="button" className="icon-btn danger" aria-label={`Remove document ${i + 1}`} onClick={() => setEditor({ ...editor, gallery: editor.gallery.filter((_, j) => j !== i) })}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <Uploader onDone={url => setEditor(p => p ? { ...p, gallery: [...p.gallery, url] } : p)} label="UPLOAD IMAGE OR PDF" accept="image/*,application/pdf" />
                    <button type="button" className="subtle-btn" onClick={() => setEditor({ ...editor, gallery: [...editor.gallery, ''] })}><Plus size={16} /> ADD URL MANUALLY</button>
                  </div>
                </div>
              </div>

              <aside className="editor-aside">
                <div className="admin-panel sticky-panel">
                  <div className="panel-header"><h2>PUBLICATION</h2></div>
                  {editorDirty && <p className="unsaved-badge">UNSAVED CHANGES</p>}
                  <label className="switch-line">
                    <span><strong>Published</strong><small>Visible on public website</small></span>
                    <input type="checkbox" checked={editor.published} onChange={e => setEditor({ ...editor, published: e.target.checked })} />
                  </label>
                  <label className="switch-line">
                    <span><strong>Featured</strong><small>Highlight this content</small></span>
                    <input type="checkbox" checked={editor.featured} onChange={e => setEditor({ ...editor, featured: e.target.checked })} />
                  </label>
                  <div className="publication-status"><span className={'status-dot ' + (editor.published ? 'is-live' : '')} />{editor.published ? 'READY TO PUBLISH' : 'SAVED AS DRAFT'}</div>
                  <button type="button" className="primary-btn full" disabled={saving || !canEdit || !editor.title.trim()} onClick={saveEntry}>
                    {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} {editor.id ? 'SAVE CHANGES' : 'CREATE ENTRY'}
                  </button>
                  <button type="button" className="subtle-btn full" onClick={closeEditor}>CANCEL EDITING</button>
                </div>
              </aside>
            </div>
          ) : tab === 'overview' ? (
            <>
              <div className="stats-grid">
                <Stat label="TOTAL PROJECTS" value={counts('project')} icon={FolderKanban} />
                <Stat label="PUBLISHED PROJECTS" value={entries.filter(e => e.kind === 'project' && e.published).length} icon={Eye} />
                <Stat label="SKILLS & SERVICES" value={counts('skill') + counts('service')} icon={Layers} />
                <Stat label="UNREAD MESSAGES" value={unreadCount} icon={Mail} />
              </div>
              <div className="overview-grid">
                <div className="admin-panel">
                  <div className="panel-header"><h2>RECENT CONTENT</h2><button type="button" className="subtle-btn" onClick={() => go('project')}>MANAGE ALL <ChevronRight size={14} /></button></div>
                  {entries.filter(e => e.kind === 'project').slice(0, 5).map(e => (
                    <button type="button" className="recent-row" onClick={() => beginEdit(e, 'project')} key={e.id}>
                      <span className="recent-icon"><FolderKanban size={18} /></span>
                      <span><strong>{e.title}</strong><small>{e.subtitle || e.kind}</small></span>
                      <span className={'table-status ' + (e.published ? 'published' : 'draft')}>{e.published ? 'PUBLISHED' : 'DRAFT'}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                  {!entries.some(e => e.kind === 'project') && <div className="empty-panel">No projects yet. Add your first project in the Projects section.</div>}
                </div>
                <div className="admin-panel admin-quick">
                  <div className="panel-header"><h2>QUICK ACTIONS</h2></div>
                  <button type="button" onClick={() => startNew('project')}><Plus size={17} /> ADD A PROJECT <ChevronRight size={16} /></button>
                  <button type="button" onClick={() => go('settings')}><Settings2 size={17} /> EDIT WEBSITE DETAILS <ChevronRight size={16} /></button>
                  <button type="button" onClick={() => go('messages')}><Mail size={17} /> REVIEW MESSAGES <ChevronRight size={16} /></button>
                  <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17} /> VIEW PUBLIC WEBSITE <ChevronRight size={16} /></a>
                </div>
              </div>
            </>
          ) : currentKind ? (
            <div className="admin-panel">
              <div className="panel-header"><h2>{currentKind.label.toUpperCase()} LIBRARY</h2><span>{visibleEntries.length} / {counts(currentKind.kind)} ENTRIES</span></div>
              <div className="library-toolbar">
                <label className="search-field" htmlFor="library-search">
                  <span className="sr-only">Search {currentKind.label}</span>
                  <input id="library-search" type="search" placeholder="Search title, slug or tag…" value={search} onChange={e => setSearch(e.target.value)} />
                </label>
                <select aria-label="Filter by publication status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
                  <option value="all">All statuses</option>
                  <option value="published">Published only</option>
                  <option value="draft">Drafts only</option>
                </select>
              </div>
              <div className="entry-table">
                {visibleEntries.map(e => (
                  <div className="entry-table-row" key={e.id}>
                    <span className="entry-thumb">{e.cover ? <img src={e.cover} alt="" /> : <FolderKanban size={20} />}</span>
                    <div className="entry-info"><strong>{e.title}</strong><small>{e.subtitle || e.slug}</small></div>
                    <button
                      type="button"
                      className={'table-status as-button ' + (e.published ? 'published' : 'draft')}
                      disabled={!canEdit}
                      aria-label={e.published ? `Unpublish ${e.title}` : `Publish ${e.title}`}
                      title={e.published ? 'Click to move to draft' : 'Click to publish'}
                      onClick={() => togglePublished(e)}
                    >
                      {e.published ? <><Eye size={12} /> LIVE</> : <><EyeOff size={12} /> DRAFT</>}
                    </button>
                    <button type="button" className="subtle-btn" onClick={() => beginEdit({ ...e })}>EDIT</button>
                    <button type="button" className="icon-btn danger" title="Delete" aria-label={`Delete ${e.title}`} onClick={() => removeEntry(e)}><Trash2 size={16} /></button>
                  </div>
                ))}
                {!counts(currentKind.kind) && (
                  <div className="empty-panel">
                    <FolderKanban size={30} />
                    <h3>Nothing here yet</h3>
                    <p>Publish your first {currentKind.kind} to display it in your portfolio.</p>
                    <button type="button" className="primary-btn" onClick={() => startNew(currentKind.kind)}><Plus size={16} /> CREATE {currentKind.kind.toUpperCase()}</button>
                  </div>
                )}
                {counts(currentKind.kind) > 0 && visibleEntries.length === 0 && (
                  <div className="filter-empty">
                    No entries match those filters.
                    <div><button type="button" className="subtle-btn" onClick={() => { setSearch(''); setStatusFilter('all'); }}>CLEAR FILTERS</button></div>
                  </div>
                )}
              </div>
            </div>
          ) : tab === 'settings' ? (
            <div className="settings-layout">
              <div className="settings-main">
                {settingGroups.map(group => (
                  <div className="admin-panel" key={group.heading}>
                    <div className="panel-header"><h2>{group.heading.toUpperCase()}</h2></div>
                    <div className="settings-fields">
                      {group.fields.map(field => {
                        const val = settings[field.key];
                        return field.type === 'toggle' ? (
                          <label key={field.key} className="switch-line">
                            <span><strong>{field.label}</strong><small>Control visibility on public site</small></span>
                            <input type="checkbox" checked={Boolean(val)} onChange={e => setSettings({ ...settings, [field.key]: e.target.checked })} />
                          </label>
                        ) : (
                          <label key={field.key} htmlFor={`setting-${field.key}`}>
                            {field.label.toUpperCase()}
                            {field.type === 'textarea'
                              ? <textarea id={`setting-${field.key}`} rows={field.key === 'about' ? 8 : 3} value={String(val)} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                              : <input id={`setting-${field.key}`} type={field.type === 'color' ? 'color' : 'text'} value={String(val)} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />}
                            {field.type === 'media' && <Uploader onDone={url => setSettings(p => ({ ...p, [field.key]: url }))} label="UPLOAD FILE" accept={field.key === 'cvUrl' ? 'application/pdf' : 'image/*'} />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <aside className="editor-aside">
                <div className="admin-panel sticky-panel">
                  <div className="panel-header"><h2>SAVE DESIGN</h2></div>
                  {settingsDirty && <p className="unsaved-badge">UNSAVED CHANGES</p>}
                  <p className="panel-help">{settingsDirty ? 'Save to publish these changes to your public website.' : 'All changes saved. Edits go live immediately after saving.'}</p>
                  <button type="button" className="primary-btn full" disabled={saving || !canEdit || !settingsDirty} onClick={saveSettings}>
                    {saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} SAVE ALL SETTINGS
                  </button>
                  <a className="subtle-btn full" href="/" target="_blank" rel="noopener noreferrer">PREVIEW SITE <ExternalLink size={16} /></a>
                </div>
              </aside>
            </div>
          ) : tab === 'messages' ? (
            <div className="admin-panel">
              <div className="panel-header">
                <h2>INBOX</h2>
                <div className="panel-header-actions">
                  <span>{messages.length} MESSAGES{unreadCount > 0 ? ` · ${unreadCount} UNREAD` : ''}</span>
                  {unreadCount > 0 && <button type="button" className="subtle-btn" disabled={!canEdit} onClick={markAllRead}>MARK ALL READ</button>}
                </div>
              </div>
              {messages.map(m => (
                <div className={'message-card' + (m.is_read ? '' : ' is-unread')} key={m.id}>
                  {!m.is_read && <><span className="sr-only">Unread message. </span><span className="unread-dot" aria-hidden="true" /></>}
                  <div className="message-top">
                    <div><strong>{m.name}</strong><a href={'mailto:' + m.email}>{m.email}</a></div>
                    <small>{new Date(m.created_at).toLocaleString()}</small>
                  </div>
                  <h3>{m.subject}</h3>
                  <p>{m.message}</p>
                  <div className="message-actions">
                    <a className="subtle-btn" href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`}>REPLY BY EMAIL <Mail size={15} /></a>
                    <button type="button" className="subtle-btn" disabled={!canEdit} onClick={() => toggleMessageRead(m)}>{m.is_read ? 'MARK UNREAD' : 'MARK READ'}</button>
                    <button type="button" className="icon-btn danger" aria-label={`Delete message from ${m.name}`} onClick={() => removeMessage(m)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {!messages.length && <div className="empty-panel"><Mail size={30} /><h3>Inbox is clear</h3><p>Recruiter and client enquiries will appear here.</p></div>}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="stat-card">
      <div><span>{label}</span><Icon size={20} /></div>
      <strong>{String(value).padStart(2, '0')}</strong>
      <small>PORTFOLIO METRIC ↗</small>
    </div>
  );
}

function Uploader({ onDone, label, accept }: { onDone: (url: string) => void; label: string; accept: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  async function handle(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error('File exceeds 25MB limit');
      const path = 'portfolio/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const blob = await upload(path, file, { access: 'public', handleUploadUrl: '/api/admin/upload' });
      onDone(blob.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }
  return (
    <div className="uploader">
      <input ref={ref} type="file" accept={accept} onChange={handle} hidden />
      <button type="button" className="subtle-btn" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={16} /> : <CloudUpload size={16} />} {busy ? 'UPLOADING...' : label}
      </button>
      {error && <small className="form-error" role="alert">{error}</small>}
    </div>
  );
}
