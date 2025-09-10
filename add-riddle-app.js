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

function AddRiddle() {
  try {
    const [formData, setFormData] = React.useState({
      title: '',
      surface: '',
      bottom: '',
      type: '鏈牸',
      difficulty: '涓瓑'
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('');

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showMessage = (text, type = 'info') => {
      setMessage(text); setMessageType(type);
      setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) { showMessage('璇峰～鍐欓鐩爣棰?, 'error'); return; }
      if (!formData.surface.trim()) { showMessage('璇峰～鍐欐堡闈紙浠呮枃瀛楋級', 'error'); return; }
      if (!formData.bottom.trim()) { showMessage('璇峰～鍐欐堡搴曪紙浠呮枃瀛楋級', 'error'); return; }

      setIsSubmitting(true);
      try {
        // 鑷姩鐢熸垚灏侀潰鍥撅紙浠呬綔涓哄皝闈紝涓嶆敮鎸佹墜鍔ㄤ笂浼狅級
        let coverImage = '';
        try {
          coverImage = await ImageGenerator.generateCoverImage(formData.surface.trim());
        } catch (genErr) {
          console.warn('灏侀潰鑷姩鐢熸垚澶辫触锛屽皢缁х画淇濆瓨鏂囧瓧鍐呭', genErr);
        }

        if (window.SupabaseUtil && SupabaseUtil.isConfigured()) {
          const payload = {
            title: formData.title.trim(),
            surface: formData.surface.trim(),
            bottom: formData.bottom.trim(),
            type: formData.type,
            difficulty: formData.difficulty,
            cover_image: coverImage || null
          };
          const { data, error } = await SupabaseUtil.insertRiddle(payload);
          if (error) throw error;
          showMessage('棰樼洰宸蹭繚瀛樺埌浜戠', 'success');
          setTimeout(() => { window.location.href = `riddle.html?id=${data.id}`; }, 1000);
        } else {
          const newRiddle = StorageUtil.addRiddle({
            title: formData.title.trim(),
            surface: formData.surface.trim(),
            bottom: formData.bottom.trim(),
            type: formData.type,
            difficulty: formData.difficulty,
            coverImage
          });
          if (!newRiddle) throw new Error('淇濆瓨澶辫触');
          showMessage('棰樼洰娣诲姞鎴愬姛锛堟湰鍦帮級', 'success');
          setTimeout(() => { window.location.href = `riddle.html?id=${newRiddle.id}`; }, 1000);
        }
      } catch (err) {
        console.error('鎻愪氦澶辫触锛?, err);
        showMessage('淇濆瓨澶辫触锛岃绋嶅悗鍐嶈瘯', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="add-riddle" data-file="add-riddle-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <a href=\"/\" className="text-[var(--primary-color)] hover:underline flex items-center">
                <div className="icon-arrow-left text-sm mr-2"></div>
                杩斿洖棣栭〉
              </a>
            </div>

            <div className="card-dark p-8">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">娣诲姞鏂伴鐩?/h1>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">棰樼洰鏍囬 *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input" placeholder="杈撳叆棰樼洰鏍囬..." required />
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">姹ら潰锛堢帺瀹跺彲瑙侀儴鍒嗭級 *</label>
                  <textarea name="surface" value={formData.surface} onChange={handleInputChange} className="form-textarea" placeholder="杈撳叆姹ら潰鍐呭锛堜粎鏂囧瓧锛?.." />
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">姹ゅ簳锛堢瓟妗堥儴鍒嗭級 *</label>
                  <textarea name="bottom" value={formData.bottom} onChange={handleInputChange} className="form-textarea" placeholder="杈撳叆姹ゅ簳绛旀锛堜粎鏂囧瓧锛?.." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">绫诲瀷</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="form-select">
                      <option value="鏈牸">鏈牸</option>
                      <option value="鍙樻牸">鍙樻牸</option>
                      <option value="鍒涙剰">鍒涙剰</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">闅惧害</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="form-select">
                      <option value="绠€鍗?>绠€鍗?/option>
                      <option value="涓瓑">涓瓑</option>
                      <option value="鍥伴毦">鍥伴毦</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`btn-primary w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="icon-loader text-sm mr-2 animate-spin"></div>
                      鎻愪氦涓?..
                    </div>
                  ) : '娣诲姞棰樼洰'}
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded-lg ${messageType === 'success' ? 'bg-green-600' : messageType === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('AddRiddle component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AddRiddle />
  </ErrorBoundary>
);

