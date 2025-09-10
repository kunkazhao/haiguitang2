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
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">出现了一些问题</h1>`r`n            <p className="text-[var(--text-secondary)] mb-4">鎶辨瓑锛屽彂鐢熶簡鎰忓閿欒</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              閲嶆柊鍔犺浇
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
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedTypes, setSelectedTypes] = React.useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = React.useState([]);

    React.useEffect(() => {
      (async () => {
        setIsLoading(true);
        // 浼樺厛璇诲彇浜戠
        if (window.SupabaseUtil && SupabaseUtil.isConfigured()) {
          try {
            const { data, error } = await SupabaseUtil.fetchRiddles();
            if (!error && Array.isArray(data)) {
              // 灏嗗瓧娈垫槧灏勪负鍓嶇灞曠ず缁撴瀯锛堜繚鎸佺粍浠跺吋瀹癸級
              const mapped = data.map(r => ({
                id: r.id,
                title: r.title,
                surface: r.surface || '',
                bottom: r.bottom || '',
                type: r.type || '鏈牸',
                difficulty: r.difficulty || '涓瓑',
                surfaceImage: r.surface_image || '',
                bottomImage: r.bottom_image || '',
                coverImage: r.cover_image || '',
                updatedAt: r.created_at || new Date().toISOString()
              }));
              // 鎸夋椂闂村€掑簭锛屾渶鏂板湪鍓?              mapped.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
              setRiddles(mapped);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('璇诲彇浜戠澶辫触锛屽洖閫€鍒版湰鍦帮細', e);
          }
        }

        // 鏈湴鍥為€€锛歭ocalStorage 娌℃湁鍒欑敤鏍蜂緥鏁版嵁
        const stored = StorageUtil.getRiddles();
        if (stored.length === 0) {
          const initialData = getSampleRiddles();
          const sorted = [...initialData].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          StorageUtil.saveRiddles(sorted);
          setRiddles(sorted);
        } else {
          const sorted = [...stored].sort((a,b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
          setRiddles(sorted);
        }
        setIsLoading(false);
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
            {isLoading ? (
              <Loading text="鍔犺浇棰樼洰涓?.." />
            ) : (
              <RiddleList 
                riddles={filteredRiddles} 
                onRiddleClick={handleRiddleClick}
              />
            )}
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


