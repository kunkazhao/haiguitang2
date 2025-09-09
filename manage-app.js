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
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">出现了一些问题</h1>
            <p className="text-[var(--text-secondary)] mb-4">抱歉，发生了意外错误</p>
            <button onClick={() => window.location.reload()} className="btn-primary">重新加载</button>
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
    const [search, setSearch] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [form, setForm] = React.useState({ title: '', surface: '', bottom: '', type: '本格', difficulty: '中等', surfaceImage: '', bottomImage: '' });
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('info');
    const fileRef = React.useRef(null);
    const [showPaste, setShowPaste] = React.useState(false);
    const [pasteText, setPasteText] = React.useState('');
    const [overwrite, setOverwrite] = React.useState(false);

    const showMessage = (text, type = 'info') => {
      setMessage(text);
      setMessageType(type);
      setTimeout(() => { setMessage(''); setMessageType('info'); }, 2500);
    };

    React.useEffect(() => {
      const stored = StorageUtil.getRiddles();
      if (!stored || stored.length === 0) {
        const seed = typeof getSampleRiddles === 'function' ? getSampleRiddles() : [];
        if (seed.length) {
          StorageUtil.saveRiddles(seed);
          setRiddles(seed);
        } else {
          setRiddles([]);
        }
      } else {
        setRiddles(stored);
      }
    }, []);

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
      setForm({ title: r.title || '', surface: r.surface || '', bottom: r.bottom || '', type: r.type || '本格', difficulty: r.difficulty || '中等', surfaceImage: r.surfaceImage || '', bottomImage: r.bottomImage || '' });
    };

    const cancelEdit = () => { setEditingId(null); setForm({ title: '', surface: '', bottom: '', type: '本格', difficulty: '中等', surfaceImage: '', bottomImage: '' }); };

    const saveEdit = () => {
      if (!form.title.trim()) { showMessage('请填写标题', 'error'); return; }
      if (!form.surface.trim() && !form.surfaceImage) { showMessage('请填写汤面或上传汤面图片', 'error'); return; }
      if (!form.bottom.trim() && !form.bottomImage) { showMessage('请填写汤底或上传汤底图片', 'error'); return; }
      const updated = StorageUtil.updateRiddle(editingId, { ...form });
      if (updated) {
        const next = StorageUtil.getRiddles();
        setRiddles(next);
        showMessage('保存成功', 'success');
        setEditingId(null);
      } else {
        showMessage('保存失败，请重试', 'error');
      }
    };

    const deleteOne = (id) => {
      if (!confirm('确定删除该题目吗？删除后不可恢复')) return;
      const ok = StorageUtil.deleteRiddle(id);
      if (ok) {
        setRiddles(StorageUtil.getRiddles());
        showMessage('已删除', 'success');
      } else {
        showMessage('删除失败', 'error');
      }
    };

    // -------- 批量导入 / 导出 / 清空 --------
    const toKey = (t, s) => `${(t||'').trim().toLowerCase()}|${(s||'').trim().toLowerCase()}`;

    const normalizeItem = (it) => {
      return {
        title: (it.title || it.标题 || '').toString().trim(),
        surface: (it.surface || it.汤面 || it.face || '').toString().trim(),
        bottom: (it.bottom || it.汤底 || it.answer || '').toString().trim(),
        surfaceImage: (it.surfaceImage || it['surface_url'] || it['汤面图'] || it['汤面图片'] || '').toString().trim(),
        bottomImage: (it.bottomImage || it['bottom_url'] || it['汤底图'] || it['汤底图片'] || '').toString().trim(),
        type: (it.type || it.类型 || '本格').toString().trim() || '本格',
        difficulty: (it.difficulty || it.难度 || '中等').toString().trim() || '中等',
        coverImage: (it.coverImage || it.封面 || '').toString().trim()
      };
    };

    const mergeImport = (items) => {
      const incoming = items.map(normalizeItem).filter(x => x.title && (x.surface || x.surfaceImage) && (x.bottom || x.bottomImage));
      if (incoming.length === 0) { showMessage('没有有效数据', 'error'); return; }

      const existing = overwrite ? [] : StorageUtil.getRiddles();
      const seen = new Set(existing.map(r => toKey(r.title, r.surface || r.surfaceImage || '')));
      const merged = [...existing];
      let added = 0, skipped = 0;
      for (const x of incoming) {
        const k = toKey(x.title, x.surface || x.surfaceImage || '');
        if (seen.has(k)) { skipped++; continue; }
        merged.push({ ...x, id: Date.now().toString() + Math.random().toString(36).slice(2,7), updatedAt: new Date().toISOString() });
        seen.add(k); added++;
      }
      StorageUtil.saveRiddles(merged);
      setRiddles(merged);
      showMessage(`导入完成：新增 ${added} 条，跳过重复 ${skipped} 条${overwrite ? '（已覆盖原有）' : ''}`, 'success');
    };

    const parseDelimited = (text) => {
      const raw = text.replace(/\r/g, '\n').split('\n').filter(l => l.trim() !== '');
      if (raw.length === 0) return [];
      // 识别分隔符：优先 | 其次 \t 再次 ,
      const sample = raw[0];
      const delim = sample.includes('|') ? '|' : (sample.includes('\t') ? '\t' : ',');
      const lines = raw;
      // 有表头时优先按表头映射
      const headerCandidate = lines[0].split(delim);
      const hasHeader = ['title','surface','bottom','type','difficulty','surfaceimage','bottomimage','标题','汤面','汤底','类型','难度','汤面图','汤底图']
        .some(h => headerCandidate.map(x=>x.trim().toLowerCase()).includes(h));
      let start = 0; let headers = [];
      if (hasHeader) { headers = headerCandidate.map(h=>h.trim()); start = 1; }
      const out = [];
      for (let i=start;i<lines.length;i++) {
        const cols = lines[i].split(delim).map(x=>x.trim());
        if (hasHeader) {
          const obj = {};
          headers.forEach((h, idx)=> obj[h] = cols[idx] || '');
          out.push(obj);
        } else {
          out.push({ title: cols[0]||'', surface: cols[1]||'', bottom: cols[2]||'', type: cols[3]||'本格', difficulty: cols[4]||'中等', surfaceImage: cols[5]||'', bottomImage: cols[6]||'' });
        }
      }
      return out;
    };

    const parseJSONOrDelimited = (text) => {
      try {
        const j = JSON.parse(text);
        if (Array.isArray(j)) return j;
        if (j && Array.isArray(j.riddles)) return j.riddles;
      } catch(_) {}
      return parseDelimited(text);
    };

    const handleFileInput = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { const arr = parseJSONOrDelimited(String(reader.result||'')); mergeImport(arr); }
        catch (err) { console.error(err); showMessage('导入失败：文件格式不正确', 'error'); }
        finally { e.target.value = ''; }
      };
      reader.readAsText(f, 'utf-8');
    };

    const handlePasteImport = () => {
      const arr = parseJSONOrDelimited(pasteText);
      mergeImport(arr);
      setShowPaste(false); setPasteText('');
    };

    const exportJSON = () => {
      const data = StorageUtil.getRiddles();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const ts = new Date().toISOString().slice(0,10);
      a.download = `riddles-${ts}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showMessage('已导出 JSON 文件', 'success');
    };

    const clearAll = () => {
      if (!confirm('确定清空全部题目吗？此操作不可撤销')) return;
      StorageUtil.saveRiddles([]);
      setRiddles([]);
      showMessage('题库已清空', 'success');
    };

    const handleImageFileForm = (name, file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setForm(prev => ({ ...prev, [name]: String(reader.result || '') }));
      reader.readAsDataURL(file);
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="manage" data-file="manage-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">题库管理</h1>
              <div className="flex gap-3 w-full md:w-auto">
                <input className="form-input flex-1 md:w-80" placeholder="搜索标题 / 类型 / 难度..." value={search} onChange={(e)=>setSearch(e.target.value)} />
                <a href="add-riddle.html" className="btn-primary whitespace-nowrap">新建题目</a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button className="btn-secondary" onClick={()=>fileRef.current && fileRef.current.click()}>导入文件</button>
              <input ref={fileRef} type="file" accept=".json,.csv,.tsv,.txt" className="hidden" onChange={handleFileInput} />
              <button className="btn-secondary" onClick={exportJSON}>导出JSON</button>
              <button className="btn-secondary" onClick={()=>setShowPaste(v=>!v)}>{showPaste ? '收起粘贴导入' : '粘贴导入'}</button>
              <label className="text-sm text-[var(--text-secondary)] ml-auto flex items-center gap-2">
                <input type="checkbox" checked={overwrite} onChange={(e)=>setOverwrite(e.target.checked)} /> 覆盖现有
              </label>
              <button className="btn-secondary" onClick={clearAll}>清空题库</button>
            </div>

            {showPaste && (
              <div className="card-dark p-4 mb-6">
                <div className="text-sm text-[var(--text-secondary)] mb-2">
                  支持三种格式：
                  <br/>1) JSON 数组：[{{'{'}}title,surface,bottom,type,difficulty{{'}'}}]
                  <br/>2) 标题|汤面|汤底|类型|难度（每行一条）
                  <br/>3) 带表头的 CSV/TSV（第一列必须是 title/标题）
                </div>
                <textarea className="form-textarea" style={{minHeight:'140px'}} placeholder="粘贴数据到这里..." value={pasteText} onChange={(e)=>setPasteText(e.target.value)} />
                <div className="mt-3 flex gap-3">
                  <button className="btn-primary" onClick={handlePasteImport}>导入</button>
                  <button className="btn-secondary" onClick={()=>setPasteText('示例标题|这是汤面示例|这是汤底示例|本格|中等\n另一个标题|另一条汤面|另一条汤底|创意|简单')}>填充示例</button>
                </div>
              </div>
            )}

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${messageType==='success'?'bg-green-600':messageType==='error'?'bg-red-600':'bg-blue-600'} text-white`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="card-dark p-5">
                  {editingId === r.id ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">标题</label>
                          <input className="form-input" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">类型</label>
                            <select className="form-select" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
                              <option value="本格">本格</option>
                              <option value="变格">变格</option>
                              <option value="创意">创意</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">难度</label>
                            <select className="form-select" value={form.difficulty} onChange={(e)=>setForm({...form, difficulty: e.target.value})}>
                              <option value="简单">简单</option>
                              <option value="中等">中等</option>
                              <option value="困难">困难</option>
                            </select>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">汤面</label>
                          <textarea className="form-textarea" value={form.surface} onChange={(e)=>setForm({...form, surface: e.target.value})} />
                          <div className="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" className="text-sm" onChange={(e)=>handleImageFileForm('surfaceImage', e.target.files && e.target.files[0])} />
                            <input className="form-input" placeholder="或粘贴汤面图片 URL" value={form.surfaceImage||''} onChange={(e)=>setForm({...form, surfaceImage: e.target.value})} />
                          </div>
                          {form.surfaceImage && (
                            <div className="mt-2">
                              <img src={form.surfaceImage} alt="汤面图片预览" className="max-h-40 object-contain w-full border border-[var(--border-color)] rounded" />
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">汤底</label>
                          <textarea className="form-textarea" value={form.bottom} onChange={(e)=>setForm({...form, bottom: e.target.value})} />
                          <div className="mt-2 flex items-center gap-3">
                            <input type="file" accept="image/*" className="text-sm" onChange={(e)=>handleImageFileForm('bottomImage', e.target.files && e.target.files[0])} />
                            <input className="form-input" placeholder="或粘贴汤底图片 URL" value={form.bottomImage||''} onChange={(e)=>setForm({...form, bottomImage: e.target.value})} />
                          </div>
                          {form.bottomImage && (
                            <div className="mt-2">
                              <img src={form.bottomImage} alt="汤底图片预览" className="max-h-40 object-contain w-full border border-[var(--border-color)] rounded" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="btn-primary" onClick={saveEdit}>保存</button>
                        <button className="btn-secondary" onClick={cancelEdit}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <a className="text-xl font-semibold hover:underline" href={`riddle.html?id=${r.id}`}>{r.title}</a>
                          <span className="tag">{r.type}</span>
                          <span className="tag-difficulty">{r.difficulty}</span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">ID: {r.id} · 最近更新：{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}</div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`riddle.html?id=${r.id}`} className="btn-secondary">查看</a>
                        <button className="btn-secondary" onClick={()=>startEdit(r)}>编辑</button>
                        <button className="btn-secondary" onClick={()=>deleteOne(r.id)}>删除</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="card-dark p-8 text-center text-[var(--text-secondary)]">暂无数据，点击右上角“新建题目”添加</div>
              )}
            </div>
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
