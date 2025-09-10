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



