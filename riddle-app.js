class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught an error:', error, errorInfo?.componentStack); }

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

        // 浼樺厛浜戠
        if (window.SupabaseUtil && SupabaseUtil.isConfigured()) {
          try {
            const { data, error } = await SupabaseUtil.fetchRiddleById(riddleId);
            if (!error && data) {
              setRiddle({
                id: data.id,
                title: data.title,
                surface: data.surface || '',
                bottom: data.bottom || '',
                type: data.type || '鏈牸',
                difficulty: data.difficulty || '涓瓑',
                surfaceImage: data.surface_image || '',
                bottomImage: data.bottom_image || '',
                coverImage: data.cover_image || ''
              });
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('云端读取失败，回退到本地：', e);
          }
        }

        // 鍥為€€鏈湴
        const foundRiddle = StorageUtil.getRiddleById(riddleId);
        setRiddle(foundRiddle);
        setIsLoading(false);
      })();
    }, []);

    const copyToClipboard = async (text, label) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopyMessage(`宸插鍒?{label}`);
        setTimeout(() => setCopyMessage(''), 2000);
      } catch (error) {
        setCopyMessage('澶嶅埗澶辫触');
        setTimeout(() => setCopyMessage(''), 2000);
      }
    };

    const handleCopySurface = () => {
      const content = (riddle.surface && riddle.surface.trim()) ? riddle.surface : (riddle.surfaceImage || '');
      copyToClipboard(content, '姹ら潰');
    };

    const handleCopyAll = () => {
      const surfacePart = (riddle.surface && riddle.surface.trim()) ? riddle.surface : (riddle.surfaceImage ? `[鍥剧墖] ${riddle.surfaceImage}` : '');
      const bottomPart = (riddle.bottom && riddle.bottom.trim()) ? riddle.bottom : (riddle.bottomImage ? `[鍥剧墖] ${riddle.bottomImage}` : '');
      const fullText = `${surfacePart}\n\n绛旀锛?{bottomPart}`.trim();
      copyToClipboard(fullText, '瀹屾暣鍐呭');
    };

    if (isLoading) {
      return (
        <div className="min-h-screen bg-[var(--background-dark)]">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <Loading full text="鍔犺浇棰樼洰璇︽儏涓?.." />
          </div>
        </div>
      );
    }

    if (!riddle) {
      return (
        <div className="min-h-screen bg-[var(--background-dark)]">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">棰樼洰鏈壘鍒?/h2>
              <a href="/" className="btn-primary">杩斿洖棣栭〉</a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="riddle-detail" data-file="riddle-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <a href="/" className="text-[var(--primary-color)] hover:underline flex items-center">
                <div className="icon-arrow-left text-sm mr-2"></div>
                杩斿洖棰樺簱
              </a>
            </div>

            <div className="card-dark p-8">
              <div className="mb-6 rounded-lg overflow-hidden relative" style={{paddingTop:'66.666%'}}>
                {riddle.coverImage && riddle.coverImage.trim() !== '' ? (
                  <img src={riddle.coverImage} alt={riddle.title} className="absolute inset-0 w-full h-full object-cover" onError={(e)=>{e.target.style.display='none';}} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <div className="icon-image text-2xl text-slate-300"></div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{riddle.title}</h1>
                <div className="flex gap-3 mb-4">
                  <span className="tag">{riddle.type}</span>
                  <span className="tag-difficulty">{riddle.difficulty}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">姹ら潰</h2>
                <div className="bg-[var(--background-dark)] p-6 rounded-lg border border-[var(--border-color)] space-y-4">
                  {riddle.surfaceImage && riddle.surfaceImage.trim() !== '' && (
                    <img src={riddle.surfaceImage} alt="姹ら潰鍥剧墖" className="w-full max-h-[480px] object-contain rounded" onError={(e)=>{e.target.style.display='none';}} />
                  )}
                  {riddle.surface && riddle.surface.trim() !== '' && (
                    <p className="text-[var(--text-primary)] leading-relaxed text-lg">{riddle.surface}</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">姹ゅ簳</h2>
                  <button onClick={() => setShowAnswer(!showAnswer)} className={showAnswer ? 'btn-secondary' : 'btn-primary'}>
                    <div className={`${showAnswer ? 'icon-eye-off' : 'icon-eye'} text-sm mr-2 inline-block`}></div>
                    {showAnswer ? '闅愯棌绛旀' : '鏄剧ず绛旀'}
                  </button>
                </div>

                {showAnswer && (
                  <div className="bg-[var(--background-dark)] p-6 rounded-lg border border-[var(--border-color)] space-y-4">
                    {riddle.bottomImage && riddle.bottomImage.trim() !== '' && (
                      <img src={riddle.bottomImage} alt="姹ゅ簳鍥剧墖" className="w-full max-h-[480px] object-contain rounded" onError={(e)=>{e.target.style.display='none';}} />
                    )}
                    {riddle.bottom && riddle.bottom.trim() !== '' && (
                      <p className="text-[var(--text-primary)] leading-relaxed text-lg">{riddle.bottom}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={handleCopySurface} className="btn-secondary">
                  <div className="icon-copy text-sm mr-2 inline-block"></div>
                  澶嶅埗姹ら潰
                </button>
                <button onClick={handleCopyAll} className="btn-secondary">
                  <div className="icon-copy text-sm mr-2 inline-block"></div>
                  澶嶅埗瀹屾暣鍐呭
                </button>
              </div>

              {copyMessage && (
                <div className="mt-4 p-3 bg-green-600 text-white rounded-lg">{copyMessage}</div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('RiddleDetail component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <RiddleDetail />
  </ErrorBoundary>
);



