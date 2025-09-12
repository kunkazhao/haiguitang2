function SearchBar({ onSearch }) {
  try {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearch = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearch(value);
    };

    return (
      <div className="mb-8" data-name="search-bar" data-file="components/SearchBar.js">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="icon-search text-lg text-[var(--text-secondary)]"></div>
          </div>
          <input
            type="text"
            placeholder="搜索题目标题或汤面内容..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input pl-10 pr-4"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('SearchBar component error:', error);
    return null;
  }
}