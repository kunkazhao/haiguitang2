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
    const isCloud = Boolean(window.SupabaseUtil && SupabaseUtil.isConfigured());
    const [riddles, setRiddles] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [form, setForm] = React.useState({ title: '', surface: '', bottom: '', type: '本格', difficulty: '中等' });
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
      type: r.type || '本格',
      difficulty: r.difficulty || '中等',
      updatedAt: r.created_at || new Date().toISOString()
    }));

    const refresh = async () => {
      setIsLoading(true);
      if (isCloud) {
        const { data, error } = await SupabaseUtil.fetchRiddles();
        if (error) {
          console.warn('云端读取失败，回退本地：', error);
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
      setForm({ title: r.title || '', surface: r.surface || '', bottom: r.bottom || '', type: r.type || '本格', difficulty: r.difficulty || '中等' });
    };

    const cancelEdit = () => { setEditingId(null); setForm({ title: '', surface: '', bottom: '', type: '本格', difficulty: '中等' }); };

    const saveEdit = async () => {
      if (!form.title.trim()) { showMessage('请填写标题', 'error'); return; }
      if (!form.surface.trim()) { showMessage('请填写汤面（仅文字）', 'error'); return; }
      if (!form.bottom.trim()) { showMessage('请填写汤底（仅文字）', 'error'); return; }

      if (isCloud) {
        const { data, error } = await SupabaseUtil.updateRiddle(editingId, {
          title: form.title.trim(),
          surface: form.surface.trim(),
          bottom: form.bottom.trim(),
          type: form.type,
          difficulty: form.difficulty
        });
        if (error) { showMessage('保存失败：云端错误', 'error'); return; }
        showMessage('保存成功', 'success');
        setEditingId(null);
        await refresh();
      } else {
        const updated = StorageUtil.updateRiddle(editingId, { ...form });
        if (updated) {
          const next = StorageUtil.getRiddles();
          setRiddles(next);
          showMessage('保存成功', 'success');
          setEditingId(null);
        } else {
          showMessage('保存失败，请重试', 'error');
        }
      }
    };

    const deleteOne = async (id) => {
      if (!confirm('确定删除该题目吗？删除后不可恢复')) return;
      if (isCloud) {
        const { error } = await SupabaseUtil.deleteRiddle(id);
        if (error) { showMessage('删除失败：云端错误', 'error'); return; }
        showMessage('已删除', 'success');
        await refresh();
      } else {
        const ok = StorageUtil.deleteRiddle(id);
        if (ok) {
          setRiddles(StorageUtil.getRiddles());
          showMessage('已删除', 'success');
        } else {
          showMessage('删除失败', 'error');
        }
      }
    };

    const clearAll = async () => {
      if (!confirm('确定清空全部题目吗？此操作不可撤销')) return;
      if (isCloud) {
        const { error } = await SupabaseUtil.deleteAllRiddles();
        if (error) { showMessage('清空失败：云端错误', 'error'); return; }
        showMessage('题库已清空', 'success');
        await refresh();
      } else {
        StorageUtil.saveRiddles([]);
        setRiddles([]);
        showMessage('题库已清空', 'success');
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="manage" data-file="manage-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">题库管理 {isCloud ? <span className="text-sm ml-2 text-[var(--text-secondary)]">(云端)</span> : <span className="text-sm ml-2 text-[var(--text-secondary)]">(本地)</span>}</h1>
              <div className="flex gap-3 w-full md:w-auto">
                <input className="form-input flex-1 md:w-80" placeholder="搜索标题 / 类型 / 难度..." value={search} onChange={(e)=>setSearch(e.target.value)} />
                <a href="add-riddle.html" className="btn-primary whitespace-nowrap">新建题目</a>
                <button className="btn-secondary whitespace-nowrap" onClick={clearAll}>清空题库</button>
              </div>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${messageType==='success'?'bg-green-600':messageType==='error'?'bg-red-600':'bg-blue-600'} text-white`}>
                {message}
              </div>
            )}

            {isLoading ? (
              <Loading text="加载中..." />
            ) : (
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
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">汤底</label>
                            <textarea className="form-textarea" value={form.bottom} onChange={(e)=>setForm({...form, bottom: e.target.value})} />
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
                          <div className="text-xs text-[var(--text-secondary)]">ID: {r.id} · 最近更新：{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</div>
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

