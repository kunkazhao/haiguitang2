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
            <p className="text-[var(--text-secondary)] mb-4">抱歉，发生了意外错误</p>
            <button onClick={() => window.location.reload()} className="btn-primary">重新加载</button>
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
      type: '本格',
      difficulty: '中等',
      surfaceImage: '',
      bottomImage: ''
    });
    // 原始文件（用于上传到 Supabase Storage）
    const [surfaceImageFile, setSurfaceImageFile] = React.useState(null);
    const [bottomImageFile, setBottomImageFile] = React.useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('');

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageFile = (name, file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, [name]: String(reader.result || '') }));
        if (name === 'surfaceImage') setSurfaceImageFile(file);
        if (name === 'bottomImage') setBottomImageFile(file);
      };
      reader.readAsDataURL(file);
    };

    const showMessage = (text, type = 'info') => {
      setMessage(text); setMessageType(type);
      setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) { showMessage('请填写题目标题', 'error'); return; }
      if (!formData.surface.trim() && !formData.surfaceImage) { showMessage('请填写汤面或上传汤面图片', 'error'); return; }
      if (!formData.bottom.trim() && !formData.bottomImage) { showMessage('请填写汤底或上传汤底图片', 'error'); return; }

      setIsSubmitting(true);

      try {
        let coverImage = '';
        if (formData.surface.trim()) {
          setIsGeneratingImage(true);
          try {
            coverImage = await ImageGenerator.generateCoverImage(formData.surface);
            if (coverImage) { showMessage('封面图生成成功！正在保存题目...', 'success'); }
          } catch (imageError) {
            console.error('Image generation failed:', imageError);
          }
          setIsGeneratingImage(false);
        }

        // 优先写入 Supabase；未配置则写本地
        if (SupabaseUtil && SupabaseUtil.isConfigured()) {
          // 上传图片（如提供）
          let surfaceImageUrl = formData.surfaceImage;
          let bottomImageUrl = formData.bottomImage;
          try {
            if (surfaceImageFile || (formData.surfaceImage && formData.surfaceImage.startsWith('data:'))) {
              const { url } = await SupabaseUtil.uploadImage(surfaceImageFile || formData.surfaceImage, 'surface');
              if (url) surfaceImageUrl = url;
            }
            if (bottomImageFile || (formData.bottomImage && formData.bottomImage.startsWith('data:'))) {
              const { url } = await SupabaseUtil.uploadImage(bottomImageFile || formData.bottomImage, 'bottom');
              if (url) bottomImageUrl = url;
            }
          } catch (upErr) {
            console.warn('图片上传失败，继续保存文本数据:', upErr);
          }

          const payload = {
            title: formData.title.trim(),
            surface: formData.surface.trim(),
            bottom: formData.bottom.trim(),
            type: formData.type,
            difficulty: formData.difficulty,
            surface_image: surfaceImageUrl || null,
            bottom_image: bottomImageUrl || null,
            cover_image: coverImage || null
          };

          const { data, error } = await SupabaseUtil.insertRiddle(payload);
          if (error) throw error;
          showMessage('题目已保存到云端', 'success');
          setTimeout(() => { window.location.href = `riddle.html?id=${data.id}`; }, 1200);
        } else {
          const newRiddle = StorageUtil.addRiddle({ ...formData, coverImage });
          if (newRiddle) {
            showMessage('题目添加成功（本地）', 'success');
            setTimeout(() => { window.location.href = `riddle.html?id=${newRiddle.id}`; }, 1200);
          } else {
            throw new Error('保存失败');
          }
        }
      } catch (error) {
        console.error('Error adding riddle:', error);
        showMessage('添加失败，请重试', 'error');
      } finally {
        setIsSubmitting(false);
        setIsGeneratingImage(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="add-riddle" data-file="add-riddle-app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <a href="index.html" className="text-[var(--primary-color)] hover:underline flex items-center">
                <div className="icon-arrow-left text-sm mr-2"></div>
                返回首页
              </a>
            </div>

            <div className="card-dark p-8">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">添加新题目</h1>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">题目标题 *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input" placeholder="输入题目标题..." required />
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">汤面（玩家可见部分） *</label>
                  <textarea name="surface" value={formData.surface} onChange={handleInputChange} className="form-textarea" placeholder="输入汤面内容..." />
                  <p className="text-sm text-[var(--text-secondary)] mt-2">可输入文本，或下方上传汤面图片；两者都填也可。</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input type="file" accept="image/*" className="text-sm" onChange={(e)=>handleImageFile('surfaceImage', e.target.files && e.target.files[0])} />
                    <input type="url" name="surfaceImage" value={formData.surfaceImage} onChange={handleInputChange} placeholder="或粘贴汤面图片 URL" className="form-input" />
                  </div>
                  {formData.surfaceImage && (
                    <div className="mt-3 rounded overflow-hidden">
                      <img src={formData.surfaceImage} alt="汤面图片预览" className="max-h-48 object-contain w-full border border-[var(--border-color)]" />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">汤底（答案部分） *</label>
                  <textarea name="bottom" value={formData.bottom} onChange={handleInputChange} className="form-textarea" placeholder="输入汤底答案..." />
                  <div className="mt-3 flex items-center gap-3">
                    <input type="file" accept="image/*" className="text-sm" onChange={(e)=>handleImageFile('bottomImage', e.target.files && e.target.files[0])} />
                    <input type="url" name="bottomImage" value={formData.bottomImage} onChange={handleInputChange} placeholder="或粘贴汤底图片 URL" className="form-input" />
                  </div>
                  {formData.bottomImage && (
                    <div className="mt-3 rounded overflow-hidden">
                      <img src={formData.bottomImage} alt="汤底图片预览" className="max-h-48 object-contain w-full border border-[var(--border-color)]" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">类型</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="form-select">
                      <option value="本格">本格</option>
                      <option value="变格">变格</option>
                      <option value="创意">创意</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">难度</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="form-select">
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`btn-primary w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="icon-loader text-sm mr-2 animate-spin"></div>
                      {isGeneratingImage ? '生成封面图中...' : '提交中...'}
                    </div>
                  ) : '添加题目'}
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
