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
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [riddles, setRiddles] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedTypes, setSelectedTypes] = React.useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = React.useState([]);

    React.useEffect(() => {
      (async () => {
        // 优先读取云端
        if (window.SupabaseUtil && SupabaseUtil.isConfigured()) {
          try {
            const { data, error } = await SupabaseUtil.fetchRiddles();
            if (!error && Array.isArray(data) && data.length > 0) {
              // 将字段映射为前端展示结构（保持组件兼容）
              const mapped = data.map(r => ({
                id: r.id,
                title: r.title,
                surface: r.surface || '',
                bottom: r.bottom || '',
                type: r.type || '本格',
                difficulty: r.difficulty || '中等',
                surfaceImage: r.surface_image || '',
                bottomImage: r.bottom_image || '',
                coverImage: r.cover_image || '',
                updatedAt: r.created_at || new Date().toISOString()
              }));
              setRiddles(mapped);
              return;
            }
          } catch (e) {
            console.warn('读取云端失败，回退到本地：', e);
          }
        }

        // 本地回退：localStorage 没有则用样例数据
        const stored = StorageUtil.getRiddles();
        if (stored.length === 0) {
          const initialData = getSampleRiddles();
          StorageUtil.saveRiddles(initialData);
          setRiddles(initialData);
        } else {
          setRiddles(stored);
        }
      })();
    }, []);

    const filteredRiddles = React.useMemo(() => {
      return riddles.filter(riddle => {
        const matchesSearch = searchTerm === '' || 
          riddle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          riddle.surface.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(riddle.type);
        const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(riddle.difficulty);
        
        return matchesSearch && matchesType && matchesDifficulty;
      });
    }, [riddles, searchTerm, selectedTypes, selectedDifficulties]);

    const handleSearch = (term) => {
      setSearchTerm(term);
    };

    const handleFilterChange = (types, difficulties) => {
      setSelectedTypes(types);
      setSelectedDifficulties(difficulties);
    };

    const handleRiddleClick = (riddleId) => {
      window.location.href = `riddle.html?id=${riddleId}`;
    };

    return (
      <div className="min-h-screen bg-[var(--background-dark)]" data-name="app" data-file="app.js">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <SearchBar onSearch={handleSearch} />
            <FilterPanel onFilterChange={handleFilterChange} />
            <RiddleList 
              riddles={filteredRiddles} 
              onRiddleClick={handleRiddleClick}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
