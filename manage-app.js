class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught:', error, errorInfo?.componentStack); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background-dark)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">\u51FA\u73B0\u4E86\u4E00\u4E9B\u95EE\u9898</h1>
            <p className="text-[var(--text-secondary)] mb-4">\u62B1\u6B49\uFF0C\u53D1\u751F\u4E86\u610F\u5916\u9519\u8BEF</p>
            <button onClick={() => window.location.reload()} className="btn-primary">\u91CD\u65B0\u52A0\u8F7D</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ManageRiddles() {
  try {
    const [riddles, setRiddles] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [form, setForm] = React.useState({ title: '', surface: '', bottom: '', type: '\u672C\u683C', difficulty: '\u4E2D\u7B49' });
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('info');
    const [generatingId, setGeneratingId] = React.useState('');
    const [isBulk, setIsBulk] = React.useState(false);

    const showMessage = (text, type='info') => { setMessage(text); setMessageType(type); setTimeout(()=>{ setMessage(''); setMessageType('info'); }, 2200); };

    const refresh = async () => {
      setIsLoading(true);
      if (!(window.SupabaseUtil && SupabaseUtil.isConfigured())) {
        console.warn('Supabase not configured; show empty list');
        setRiddles([]); setIsLoading(false); return;
      }
      try {
        const { data, error } = await SupabaseUtil.fetchRiddles();
        if (error) throw error;
        const mapped = (data||[]).map(r=>({ id:r.id, title:r.title, surface:r.surface||'', bottom:r.bottom||'', type:r.type||'\u672C\u683C', difficulty:r.difficulty||'\u4E2D\u7B49', coverImage:r.cover_image||'', updatedAt:r.created_at||new Date().toISOString() }));
        mapped.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
        setRiddles(mapped);
      } catch (e) { console.error('cloud fetch failed:', e); setRiddles([]); } finally { setIsLoading(false); }
    };
    React.useEffect(()=>{ refresh(); }, []);

    const filtered = React.useMemo(()=>{ const s=search.trim().toLowerCase(); if(!s) return riddles; return riddles.filter(r=> (r.title||'').toLowerCase().includes(s) || (r.surface||'').toLowerCase().includes(s) || (r.bottom||'').toLowerCase().includes(s)); },[riddles,search]);

    const startEdit = (r)=>{ setEditingId(r.id); setForm({ title:r.title||'', surface:r.surface||'', bottom:r.bottom||'', type:r.type||'\u672C\u683C', difficulty:r.difficulty||'\u4E2D\u7B49' }); };
    const cancelEdit = ()=>{ setEditingId(null); setForm({ title:'', surface:'', bottom:'', type:'\u672C\u683C', difficulty:'\u4E2D\u7B49' }); };
    const saveEdit = async ()=>{ if(!form.title.trim()){ showMessage('\u8BF7\u586B\u5199\u6807\u9898','error'); return;} if(!form.surface.trim()){ showMessage('\u8BF7\u586B\u5199\u6C64\u9762\uFF08\u4EC5\u6587\u5B57\uFF09','error'); return;} if(!form.bottom.trim()){ showMessage('\u8BF7\u586B\u5199\u6C64\u5E95\uFF08\u4EC5\u6587\u5B57\uFF09','error'); return;} const { error } = await SupabaseUtil.updateRiddle(editingId,{ title:form.title.trim(), surface:form.surface.trim(), bottom:form.bottom.trim(), type:form.type, difficulty:form.difficulty }); if(error){ showMessage('\u4FDD\u5B58\u5931\u8D25\uFF08\u4E91\u7AEF\uFF09','error'); return;} showMessage('\u4FDD\u5B58\u6210\u529F','success'); setEditingId(null); await refresh(); };
    const deleteOne = async (id)=>{ if(!confirm('\u786E\u5B9A\u5220\u9664\u8BE5\u9898\u76EE\u5417\uFF1F\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D')) return; const { error } = await SupabaseUtil.deleteRiddle(id); if(error){ showMessage('\u5220\u9664\u5931\u8D25\uFF08\u4E91\u7AEF\uFF09','error'); return;} showMessage('\u5DF2\u5220\u9664','success'); await refresh(); };

    const uploadIfDataUrl = async (maybeDataUrl)=>{ if(maybeDataUrl && typeof maybeDataUrl==='string' && maybeDataUrl.startsWith('data:')){ try{ const { url } = await SupabaseUtil.uploadImage(maybeDataUrl,'cover'); return url||''; }catch{ return ''; } } return maybeDataUrl||''; };
    const generateCoverFor = async (r)=>{ setGeneratingId(r.id); try{ const text = r.surface?.trim() || `\u9898\u76EE\uFF1A${r.title}`; let cover = await ImageGenerator.generateCoverImage(text); let coverUrl = await uploadIfDataUrl(cover); if(!coverUrl){ showMessage('\u751F\u6210\u5931\u8D25','error'); return;} const { error } = await SupabaseUtil.updateRiddle(r.id,{ cover_image: coverUrl }); if(error){ showMessage('\u4FDD\u5B58\u5C01\u9762\u5931\u8D25','error'); return;} setRiddles(prev=>prev.map(it=>it.id===r.id?{...it,coverImage:coverUrl}:it)); showMessage('\u5C01\u9762\u5DF2\u751F\u6210','success'); } finally { setGeneratingId(''); } };
    const generateMissingCovers = async ()=>{ setIsBulk(true); try{ const { data, error } = await SupabaseUtil.fetchRiddles(); if(error){ showMessage('\u8BFB\u53D6\u4E91\u7AEF\u5931\u8D25','error'); return; } const list=(data||[]).filter(r=>!r.cover_image || String(r.cover_image).trim()===''); let ok=0,fail=0; for(const r of list){ const text=r.surface?.trim()||`\u9898\u76EE\uFF1A${r.title}`; let cover=await ImageGenerator.generateCoverImage(text); let coverUrl=await uploadIfDataUrl(cover); if(!coverUrl){ fail++; continue;} const { error:err } = await SupabaseUtil.updateRiddle(r.id,{ cover_image: coverUrl }); if(err){ fail++; continue;} ok++; } showMessage(`\u6279\u91CF\u751F\u6210\u5B8C\u6210\uFF1A\u6210\u529F ${ok} \u6761\uFF0C\u5931\u8D25 ${fail} \u6761`, fail?'info':'success'); await refresh(); } finally { setIsBulk(false); } };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="manage" data-file="manage-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">\u9898\u5E93\u7BA1\u7406</h1>
              <div className="flex gap-3 w-full md:w-auto">
                <input className="form-input flex-1 md:w-80" placeholder="\u641C\u7D22\u6807\u9898 / \u7C7B\u578B / \u96BE\u5EA6..." value={search} onChange={(e)=>setSearch(e.target.value)} />
                <a href="/add-riddle" className="btn-primary whitespace-nowrap">\u65B0\u5EFA\u9898\u76EE</a>
                <button className="btn-secondary whitespace-nowrap" onClick={generateMissingCovers} disabled={isBulk}>{isBulk?'\u751F\u6210\u4E2D...':'\u751F\u6210\u7F3A\u5931\u5C01\u9762'}</button>
              </div>
            </div>

            {message && (<div className={`mb-4 p-3 rounded-lg ${messageType==='success'?'bg-green-600':messageType==='error'?'bg-red-600':'bg-blue-600'} text-white`}>{message}</div>)}

            {isLoading ? (
              <Loading text="\u52A0\u8F7D\u4E2D..." />
            ) : (
              <div className="space-y-4">
                {filtered.map(r => (
                  <div key={r.id} className="card-dark p-5">
                    {editingId === r.id ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">\u6807\u9898</label>
                            <input className="form-input" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--text-secondary)] mb-1">\u7C7B\u578B</label>
                              <select className="form-select" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
                                <option value="\u672C\u683C">\u672C\u683C</option>
                                <option value="\u53D8\u683C">\u53D8\u683C</option>
                                <option value="\u521B\u610F">\u521B\u610F</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--text-secondary)] mb-1">\u96BE\u5EA6</label>
                              <select className="form-select" value={form.difficulty} onChange={(e)=>setForm({...form, difficulty: e.target.value})}>
                                <option value="\u7B80\u5355">\u7B80\u5355</option>
                                <option value="\u4E2D\u7B49">\u4E2D\u7B49</option>
                                <option value="\u56F0\u96BE">\u56F0\u96BE</option>
                              </select>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">\u6C64\u9762</label>
                            <textarea className="form-textarea" value={form.surface} onChange={(e)=>setForm({...form, surface: e.target.value})} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">\u6C64\u5E95</label>
                            <textarea className="form-textarea" value={form.bottom} onChange={(e)=>setForm({...form, bottom: e.target.value})} />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button className="btn-primary" onClick={saveEdit}>\u4FDD\u5B58</button>
                          <button className="btn-secondary" onClick={cancelEdit}>\u53D6\u6D88</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <a className="text-xl font-semibold hover:underline" href={`/riddle?id=${r.id}`}>{r.title}</a>
                            <span className="tag">{r.type}</span>
                            <span className="tag-difficulty">{r.difficulty}</span>
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">ID: {r.id} · \u6700\u8FD1\u66F4\u65B0\uFF1A{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`/riddle?id=${r.id}`} className="btn-secondary">\u67E5\u770B</a>
                          <button className="btn-secondary" onClick={()=>startEdit(r)}>\u7F16\u8F91</button>
                          <button className="btn-secondary" onClick={()=>generateCoverFor(r)} disabled={generatingId===r.id}>{generatingId===r.id ? '\u751F\u6210\u4E2D...' : '\u751F\u6210\u5C01\u9762'}</button>
                          <button className="btn-secondary" onClick={()=>deleteOne(r.id)}>\u5220\u9664</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="card-dark p-8 text-center text-[var(--text-secondary)]">\u6682\u65E0\u6570\u636E\uFF0C\u70B9\u51FB\u53F3\u4E0A\u89D2\u201C\u65B0\u5EFA\u9898\u76EE\u201D\u6DFB\u52A0</div>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) { console.error('ManageRiddles error:', error); return null; }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ManageRiddles />
  </ErrorBoundary>
);

