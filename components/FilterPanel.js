function FilterPanel({ onFilterChange }) {
  try {
    const [selectedTypes, setSelectedTypes] = React.useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = React.useState([]);

    const types = ['本格', '变格', '创意'];
    const difficulties = ['简单', '中等', '困难'];

    const handleTypeToggle = (type) => {
      const newTypes = selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes, type];
      setSelectedTypes(newTypes);
      onFilterChange(newTypes, selectedDifficulties);
    };

    const handleDifficultyToggle = (difficulty) => {
      const newDifficulties = selectedDifficulties.includes(difficulty)
        ? selectedDifficulties.filter(d => d !== difficulty)
        : [...selectedDifficulties, difficulty];
      setSelectedDifficulties(newDifficulties);
      onFilterChange(selectedTypes, newDifficulties);
    };

    return (
      <div className="card-dark p-6 mb-8" data-name="filter-panel" data-file="components/FilterPanel.js">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">类型</h3>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-[var(--background-dark)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-color)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">难度</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyToggle(difficulty)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDifficulties.includes(difficulty)
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--background-dark)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FilterPanel component error:', error);
    return null;
  }
}