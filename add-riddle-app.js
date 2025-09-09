class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background-dark)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">出现了一些问题</h1>
            <p className="text-[var(--text-secondary)] mb-4">抱歉，发生了意外错误</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              重新加载
            </button>
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
      difficulty: '中等'
    });
    const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [messageType, setMessageType] = React.useState('');

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const showMessage = (text, type = 'info') => {
      setMessage(text);
      setMessageType(type);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.title.trim() || !formData.surface.trim() || !formData.bottom.trim()) {
        showMessage('请填写所有必填字段', 'error');
        return;
      }

      setIsSubmitting(true);
      
      try {
        let coverImage = '';
        
        // 尝试生成AI封面图
        if (formData.surface.trim()) {
          setIsGeneratingImage(true);
          showMessage('正在分析内容并生成封面图...', 'info');
          
          try {
            coverImage = await ImageGenerator.generateCoverImage(formData.surface);
            if (coverImage) {
              showMessage('封面图生成成功！正在保存题目...', 'success');
            } else {
              showMessage('封面图生成失败，但题目仍会正常保存', 'info');
            }
          } catch (imageError) {
            console.error('Image generation failed:', imageError);
            showMessage('封面图生成失败，但题目仍会正常保存', 'info');
          }
          
          setIsGeneratingImage(false);
        }
        
        const newRiddle = StorageUtil.addRiddle({
          ...formData,
          coverImage
        });

        if (newRiddle) {
          showMessage('题目添加成功！', 'success');
          setTimeout(() => {
            window.location.href = `riddle.html?id=${newRiddle.id}`;
          }, 1500);
        } else {
          throw new Error('保存失败');
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
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    题目标题 *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="输入题目标题..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    汤面（玩家可见部分） *
                  </label>
                  <textarea
                    name="surface"
                    value={formData.surface}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="输入汤面内容..."
                    required
                  />
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    💡 系统将根据汤面内容自动生成神秘风格的封面图
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    汤底（答案部分） *
                  </label>
                  <textarea
                    name="bottom"
                    value={formData.bottom}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="输入汤底答案..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">
                      类型
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="本格">本格</option>
                      <option value="变格">变格</option>
                      <option value="创意">创意</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">
                      难度
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="icon-loader text-sm mr-2 animate-spin"></div>
                      {isGeneratingImage ? '生成封面图中...' : '添加中...'}
                    </div>
                  ) : (
                    '添加题目'
                  )}
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded-lg ${
                  messageType === 'success' ? 'bg-green-600' :
                  messageType === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}>
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
