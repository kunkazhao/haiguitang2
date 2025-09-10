class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught an error:', error, errorInfo?.componentStack); }
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

function RiddleDetail() {
  try {
    const [riddle, setRiddle] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [copyMessage, setCopyMessage] = React.useState('');

    React.useEffect(() => {
      (async () => {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const riddleId = urlParams.get('id');
        if (!riddleId) { setIsLoading(false); return; }

        if (window.SupabaseUtil && SupabaseUtil.isConfigured()) {
          try {
            const { data, error } = await SupabaseUtil.fetchRiddleById(riddleId);
            if (!error && data) {
              setRiddle({ id: data.id, title: data.title, surface: data.surface||'', bottom: data.bottom||'', type: data.type||'本格', difficulty: data.difficulty||'中等', surfaceImage: data.surface_image||'', bottomImage: data.bottom_image||'', coverImage: data.cover_image||'' });
              setIsLoading(false); return;
            }
          } catch (e) { console.warn('云端读取失败，回退到本地：', e); }
        }
        const found = StorageUtil.getRiddleById(riddleId);
        setRiddle(found); setIsLoading(false);
      })();
    }, []);

    const copyToClipboard = async (text, label) => {
      try { await navigator.clipboard.writeText(text); setCopyMessage(`已复制${label}`); setTimeout(()=>setCopyMessage(''),2000); }
      catch { setCopyMessage('复制失败'); setTimeout(()=>setCopyMessage(''),2000); }
    };
    const handleCopySurface = () => { const content = (riddle.surface?.trim()) ? riddle.surface : (riddle.surfaceImage || ''); copyToClipboard(content,'汤面'); };
    const handleCopyAll = () => { const surfacePart = (riddle.surface?.trim()) ? riddle.surface : (riddle.surfaceImage ? `[图片] ${riddle.surfaceImage}` : ''); const bottomPart = (riddle.bottom?.trim()) ? riddle.bottom : (riddle.bottomImage ? `[图片] ${riddle.bottomImage}` : ''); const fullText = `${surfacePart}\n\n答案：${bottomPart}`.trim(); copyToClipboard(fullText,'完整内容'); };

    if (isLoading) return (
      <div className="min-h-screen bg-[var(--background-dark)]"><Header /><div className="container mx-auto px-4 py-8"><Loading full text="加载题目详情中..." /></div></div>
    );

    if (!riddle) return (
      <div className="min-h-screen bg-[var(--background-dark)]"><Header /><div className="container mx-auto px-4 py-8"><div className="text-center"><h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">题目未找到</h2><a href="/" className="btn-primary">返回首页</a></div></div></div>
    );

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="riddle-detail" data-file="riddle-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6"><a href="/" className="text-[var(--primary-color)] hover:underline flex items-center"><div className="icon-arrow-left text-sm mr-2"></div>返回题库</a></div>
            <div className="card-dark p-8">
              <div className="mb-6 rounded-lg overflow-hidden relative" style={{paddingTop:'66.666%'}}>
                {riddle.coverImage && riddle.coverImage.trim() !== '' ? (
                  <img src={riddle.coverImage} alt={riddle.title} className="absolute inset-0 w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"><div className="icon-image text-2xl text-slate-300"></div></div>
                )}
              </div>
              <div className="mb-6"><h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{riddle.title}</h1><div className="flex gap-3 mb-4"><span className="tag">{riddle.type}</span><span className="tag-difficulty">{riddle.difficulty}</span></div></div>
              <div className="mb-8"><h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">汤面</h2><div className="bg-[var(--background-dark)] p-6 rounded-lg border border-[var(--border-color)] space-y-4">{riddle.surfaceImage && riddle.surfaceImage.trim() !== '' && (<img src={riddle.surfaceImage} alt="汤面图片" className="w-full max-h-[480px] object-contain rounded" onError={(e)=>{e.target.style.display='none';}} />)}{riddle.surface && riddle.surface.trim() !== '' && (<p className="text-[var(--text-primary)] leading-relaxed text-lg">{riddle.surface}</p>)}</div></div>
              <div className="mb-8"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-[var(--text-primary)]">汤底</h2><button onClick={()=>setShowAnswer(!showAnswer)} className={showAnswer?'btn-secondary':'btn-primary'}><div className={`${showAnswer?'icon-eye-off':'icon-eye'} text-sm mr-2 inline-block`}></div>{showAnswer?'隐藏答案':'显示答案'}</button></div>{showAnswer && (<div className="bg-[var(--background-dark)] p-6 rounded-lg border border-[var(--border-color)] space-y-4">{riddle.bottomImage && riddle.bottomImage.trim() !== '' && (<img src={riddle.bottomImage} alt="汤底图片" className="w-full max-h-[480px] object-contain rounded" onError={(e)=>{e.target.style.display='none';}} />)}{riddle.bottom && riddle.bottom.trim() !== '' && (<p className="text-[var(--text-primary)] leading-relaxed text-lg">{riddle.bottom}</p>)}</div>)}</div>
              <div className="flex flex-wrap gap-4"><button onClick={handleCopySurface} className="btn-secondary"><div className="icon-copy text-sm mr-2 inline-block"></div>复制汤面</button><button onClick={handleCopyAll} className="btn-secondary"><div className="icon-copy text-sm mr-2 inline-block"></div>复制完整内容</button></div>
              {copyMessage && (<div className="mt-4 p-3 bg-green-600 text-white rounded-lg">{copyMessage}</div>)}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) { console.error('RiddleDetail component error:', error); return null; }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <RiddleDetail />
  </ErrorBoundary>
);

