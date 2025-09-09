function RiddleCard({ riddle, onClick }) {
  try {
    return (
      <div 
        className="card-dark p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
        onClick={() => onClick(riddle.id)}
        data-name="riddle-card" 
        data-file="components/RiddleCard.js"
      >
        {riddle.coverImage && riddle.coverImage.trim() !== '' && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={riddle.coverImage} 
              alt={riddle.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-2">
            {riddle.title}
          </h3>
        </div>
        
        <p className="text-[var(--text-secondary)] mb-4 line-clamp-3">
          {riddle.surface && riddle.surface.trim() !== '' ? riddle.surface : (riddle.surfaceImage ? '【图片题】点击查看详情' : '')}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="tag">{riddle.type}</span>
            <span className="tag-difficulty">{riddle.difficulty}</span>
          </div>
          
          <div className="flex items-center text-sm text-[var(--text-secondary)]">
            <div className="icon-clock text-sm mr-1"></div>
            {new Date(riddle.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RiddleCard component error:', error);
    return null;
  }
}
