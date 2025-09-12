function RiddleList({ riddles, onRiddleClick }) {
  try {
    if (riddles.length === 0) {
      return (
        <div className="text-center py-16" data-name="riddle-list-empty" data-file="components/RiddleList.js">
          <div className="icon-search text-6xl text-[var(--text-secondary)] mb-4"></div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">没有找到匹配的题目</h3>
          <p className="text-[var(--text-secondary)]">尝试调整搜索条件或筛选器</p>
        </div>
      );
    }

    return (
      <div data-name="riddle-list" data-file="components/RiddleList.js">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            题目列表 <span className="text-[var(--primary-color)]">({riddles.length})</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riddles.map(riddle => (
            <RiddleCard 
              key={riddle.id} 
              riddle={riddle} 
              onClick={onRiddleClick}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('RiddleList component error:', error);
    return null;
  }
}