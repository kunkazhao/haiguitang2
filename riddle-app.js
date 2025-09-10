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
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">出现了一些问题</h1>
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





