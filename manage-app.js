class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught:', error, errorInfo?.componentStack); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background-dark)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">鍑虹幇浜嗕竴浜涢棶棰?/h1>
            <p className="text-[var(--text-secondary)] mb-4">鎶辨瓑锛屽彂鐢熶簡鎰忓閿欒</p>
            <button onClick={() => window.location.reload()} className="btn-primary">閲嶆柊鍔犺浇</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ManageRiddles() {
  try {
    const isCloud = Boolean(window.SupabaseUtil && SupabaseUtil.isConfigured());
    const [riddles, setRiddles] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isBulkGenerating, setIsBulkGenerating] = React.useState(false);
    const [generatingId, setGeneratingId] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [form, setForm] = React.useState({ title: '', surface: '', bottom: '', type: '鏈牸', difficulty: '涓瓑' });
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('info');

    const showMessage = (text, type = 'info') => {
      setMessage(text);
      setMessageType(type);
      setTimeout(() => { setMessage(''); setMessageType('info'); }, 2500);
    };

    const mapCloud = (rows) => rows.map(r => ({
      id: r.id,
      title: r.title,
      surface: r.surface || '',
      bottom: r.bottom || '',
      type: r.type || '鏈牸',
      difficulty: r.difficulty || '涓瓑',
      coverImage: r.cover_image || '',
      updatedAt: r.created_at || new Date().toISOString()
    }));

    const refresh = async () => {
      setIsLoading(true);
      if (isCloud) {
        const { data, error } = await SupabaseUtil.fetchRiddles();
        if (error) {
          console.warn('浜戠璇诲彇澶辫触锛屽洖閫€鏈湴锛?, error);
          const stored = StorageUtil.getRiddles();
          const sorted = [...stored].sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0));
          setRiddles(sorted);
        } else {
          const mapped = mapCloud(data || []);
          mapped.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
          setRiddles(mapped);
        }
      } else {
        const stored = StorageUtil.getRiddles();
        if (!stored || stored.length === 0) {
          const seed = typeof getSampleRiddles === 'function' ? getSampleRiddles() : [];
          StorageUtil.saveRiddles(seed);
          setRiddles(seed);
        } else {
          const sorted = [...stored].sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0));
          setRiddles(sorted);
        }
      }
      setIsLoading(false);
    };

    React.useEffect(() => { refresh(); }, []);

    const filtered = React.useMemo(() => {
      if (!search.trim()) return riddles;
      const s = search.trim().toLowerCase();
      return riddles.filter(r =>
        r.title?.toLowerCase().includes(s) ||
        r.surface?.toLowerCase().includes(s) ||
        r.bottom?.toLowerCase().includes(s) ||
        r.type?.toLowerCase().includes(s) ||
        r.difficulty?.toLowerCase().includes(s)
      );
    }, [riddles, search]);

    const startEdit = (r) => {
      setEditingId(r.id);
      setForm({ title: r.title || '', surface: r.surface || '', bottom: r.bottom || '', type: r.type || '鏈牸', difficulty: r.difficulty || '涓瓑' });
    };

    const cancelEdit = () => { setEditingId(null); setForm({ title: '', surface: '', bottom: '', type: '鏈牸', difficulty: '涓瓑' }); };

    const saveEdit = async () => {
      if (!form.title.trim()) { showMessage('璇峰～鍐欐爣棰?, 'error'); return; }
      if (!form.surface.trim()) { showMessage('璇峰～鍐欐堡闈紙浠呮枃瀛楋級', 'error'); return; }
      if (!form.bottom.trim()) { showMessage('璇峰～鍐欐堡搴曪紙浠呮枃瀛楋級', 'error'); return; }

      if (isCloud) {
        const { data, error } = await SupabaseUtil.updateRiddle(editingId, {
          title: form.title.trim(),
          surface: form.surface.trim(),
          bottom: form.bottom.trim(),
          type: form.type,
          difficulty: form.difficulty
        });
        if (error) { showMessage('淇濆瓨澶辫触锛氫簯绔敊璇?, 'error'); return; }
        showMessage('淇濆瓨鎴愬姛', 'success');
        setEditingId(null);
        await refresh();
      } else {
        const updated = StorageUtil.updateRiddle(editingId, { ...form });
        if (updated) {
          const next = StorageUtil.getRiddles();
          setRiddles(next);
          showMessage('淇濆瓨鎴愬姛', 'success');
          setEditingId(null);
        } else {
          showMessage('淇濆瓨澶辫触锛岃閲嶈瘯', 'error');
        }
      }
    };

    const deleteOne = async (id) => {
      if (!confirm('纭畾鍒犻櫎璇ラ鐩悧锛熷垹闄ゅ悗涓嶅彲鎭㈠')) return;
      if (isCloud) {
        const { error } = await SupabaseUtil.deleteRiddle(id);
        if (error) { showMessage('鍒犻櫎澶辫触锛氫簯绔敊璇?, 'error'); return; }
        showMessage('宸插垹闄?, 'success');
        await refresh();
      } else {
        const ok = StorageUtil.deleteRiddle(id);
        if (ok) {
          setRiddles(StorageUtil.getRiddles());
          showMessage('宸插垹闄?, 'success');
        } else {
          showMessage('鍒犻櫎澶辫触', 'error');
        }
      }
    };

    // 宸茬Щ闄ゆ竻绌洪搴撳姛鑳斤紙閬垮厤璇搷浣滐級

    // 鐢熸垚鎸囧畾棰樼洰鐨勫皝闈紙浠呮枃瀛楃敓鎴愶級
    const _buildText = (r) => {
      const parts = [];
      if (r.surface && r.surface.trim()) parts.push(r.surface.trim());
      if (r.title && r.title.trim()) parts.push(`棰樼洰锛?{r.title.trim()}`);
      if (r.type) parts.push(`绫诲瀷锛?{r.type}`);
      if (r.difficulty) parts.push(`闅惧害锛?{r.difficulty}`);
      const text = parts.join(' \n ');
      return text || (r.title ? `棰樼洰锛?{r.title}` : '绁炵鏁呬簨灏侀潰');
    };

    const _sleep = (ms) => new Promise(res => setTimeout(res, ms));

    const generateCoverFor = async (r) => {
      if (!r) { showMessage('鏈壘鍒伴鐩?, 'error'); return; }
      setGeneratingId(r.id);
      try {
        const input = _buildText(r);
        let url = '';
        for (let attempt = 0; attempt < 2 && !url; attempt++) {
          url = await ImageGenerator.generateCoverImage(input);
          if (!url) await _sleep(400);
        }
        if (!url) { showMessage('鐢熸垚澶辫触锛岃绋嶅悗閲嶈瘯', 'error'); return; }
        if (isCloud) {
          const { error } = await SupabaseUtil.updateRiddle(r.id, { cover_image: url });
          if (error) { showMessage('淇濆瓨灏侀潰澶辫触锛堜簯绔級', 'error'); return; }
        } else {
          const ok = StorageUtil.updateRiddle(r.id, { coverImage: url });
          if (!ok) { showMessage('淇濆瓨灏侀潰澶辫触锛堟湰鍦帮級', 'error'); return; }
        }
        // 鏈湴鐘舵€佹洿鏂帮紙閬垮厤鏁撮〉鍒锋柊锛?        setRiddles(prev => prev.map(it => it.id === r.id ? { ...it, coverImage: url } : it));
        showMessage('灏侀潰宸茬敓鎴?, 'success');
      } catch (e) {
        console.error('generateCoverFor error:', e);
        showMessage('鐢熸垚澶辫触', 'error');
      } finally {
        setGeneratingId('');
      }
    };

    // 鎵归噺涓虹己澶卞皝闈㈢殑棰樼洰鐢熸垚灏侀潰
    const generateMissingCovers = async () => {
      // 濮嬬粓鍩轰簬鍏ㄩ噺鏁版嵁锛堜笉鍙楀綋鍓嶆悳绱㈠奖鍝嶏級
      let all = [];
      if (isCloud) {
        const { data, error } = await SupabaseUtil.fetchRiddles();
        if (error) { showMessage('璇诲彇浜戠澶辫触锛屾棤娉曠敓鎴?, 'error'); return; }
        all = mapCloud(data || []);
      } else {
        all = StorageUtil.getRiddles() || [];
      }
      const targets = all.filter(r => !r.coverImage || String(r.coverImage).trim() === '');
      if (targets.length === 0) { showMessage('娌℃湁闇€瑕佽ˉ鍏呭皝闈㈢殑棰樼洰', 'info'); return; }
      if (!confirm(`灏嗕负 ${targets.length} 鏉￠鐩敓鎴愬皝闈紝鍙兘闇€瑕佽緝闀挎椂闂达紝鏄惁缁х画锛焋)) return;
      setIsBulkGenerating(true);
      try {
        let okCount = 0, failCount = 0;
        for (const r of targets) {
          const input = _buildText(r);
          let url = '';
          for (let attempt = 0; attempt < 2 && !url; attempt++) {
            url = await ImageGenerator.generateCoverImage(input);
            if (!url) await _sleep(400);
          }
          if (!url) { failCount++; continue; }
          if (isCloud) {
            const { error } = await SupabaseUtil.updateRiddle(r.id, { cover_image: url });
            if (error) { failCount++; continue; }
          } else {
            const ok = StorageUtil.updateRiddle(r.id, { coverImage: url });
            if (!ok) { failCount++; continue; }
          }
          okCount++;
          setRiddles(prev => prev.map(it => it.id === r.id ? { ...it, coverImage: url } : it));
          await _sleep(200);
        }
        showMessage(`鎵归噺鐢熸垚瀹屾垚锛氭垚鍔?${okCount} 鏉★紝澶辫触 ${failCount} 鏉, failCount ? 'info' : 'success');
      } catch (e) {
        console.error('generateMissingCovers error:', e);
        showMessage('鎵归噺鐢熸垚鍑洪敊锛岃閲嶈瘯', 'error');
      } finally {
        setIsBulkGenerating(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="manage" data-file="manage-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">棰樺簱绠＄悊 {isCloud ? <span className="text-sm ml-2 text-[var(--text-secondary)]">(浜戠)</span> : <span className="text-sm ml-2 text-[var(--text-secondary)]">(鏈湴)</span>}</h1>
              <div className="flex gap-3 w-full md:w-auto">
                <input className="form-input flex-1 md:w-80" placeholder="鎼滅储鏍囬 / 绫诲瀷 / 闅惧害..." value={search} onChange={(e)=>setSearch(e.target.value)} />
                <a href="/add-riddle" className="btn-primary whitespace-nowrap">鏂板缓棰樼洰</a>
                <button className="btn-secondary whitespace-nowrap" onClick={generateMissingCovers} disabled={isLoading || isBulkGenerating}>{isBulkGenerating ? '鐢熸垚涓?..' : '鐢熸垚缂哄け灏侀潰'}</button>
              </div>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${messageType==='success'?'bg-green-600':messageType==='error'?'bg-red-600':'bg-blue-600'} text-white`}>
                {message}
              </div>
            )}

            {isLoading ? (
              <Loading text="鍔犺浇涓?.." />
            ) : (
              <div className="space-y-4">
                {filtered.map(r => (
                  <div key={r.id} className="card-dark p-5">
                    {editingId === r.id ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">鏍囬</label>
                            <input className="form-input" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-[var(--text-secondary)] mb-1">绫诲瀷</label>
                              <select className="form-select" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
                                <option value="鏈牸">鏈牸</option>
                                <option value="鍙樻牸">鍙樻牸</option>
                                <option value="鍒涙剰">鍒涙剰</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-[var(--text-secondary)] mb-1">闅惧害</label>
                              <select className="form-select" value={form.difficulty} onChange={(e)=>setForm({...form, difficulty: e.target.value})}>
                                <option value="绠€鍗?>绠€鍗?/option>
                                <option value="涓瓑">涓瓑</option>
                                <option value="鍥伴毦">鍥伴毦</option>
                              </select>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">姹ら潰</label>
                            <textarea className="form-textarea" value={form.surface} onChange={(e)=>setForm({...form, surface: e.target.value})} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">姹ゅ簳</label>
                            <textarea className="form-textarea" value={form.bottom} onChange={(e)=>setForm({...form, bottom: e.target.value})} />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button className="btn-primary" onClick={saveEdit}>淇濆瓨</button>
                          <button className="btn-secondary" onClick={cancelEdit}>鍙栨秷</button>
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
                          <div className="text-xs text-[var(--text-secondary)]">ID: {r.id} 路 鏈€杩戞洿鏂帮細{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`/riddle?id=${r.id}`} className="btn-secondary">鏌ョ湅</a>
                          <button className="btn-secondary" onClick={()=>startEdit(r)}>缂栬緫</button>
                          <button className="btn-secondary" onClick={()=>generateCoverFor(r)} disabled={generatingId===r.id}>{generatingId===r.id ? '鐢熸垚涓?..' : '鐢熸垚灏侀潰'}</button>
                          <button className="btn-secondary" onClick={()=>deleteOne(r.id)}>鍒犻櫎</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="card-dark p-8 text-center text-[var(--text-secondary)]">鏆傛棤鏁版嵁锛岀偣鍑诲彸涓婅鈥滄柊寤洪鐩€濇坊鍔?/div>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('ManageRiddles error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ManageRiddles />
  </ErrorBoundary>
);


