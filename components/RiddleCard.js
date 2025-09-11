function RiddleCard({ riddle, onClick }) {
  try {
    return (
      <div
        className="card-dark p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
        onClick={() => onClick(riddle.id)}
        data-name="riddle-card"
        data-file="components/RiddleCard.js"
      >
        {/* Cover: 3:2 ratio */}
        <div className="mb-4 rounded-lg overflow-hidden relative" style={{ paddingTop: '66.666%' }}>
          {riddle.coverImage && (riddle.coverImage + '').trim() !== '' ? (
            <img
              src={riddle.coverImage}
              alt={riddle.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback placeholder */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 hidden items-center justify-center"
            style={{ display: (riddle.coverImage && (riddle.coverImage + '').trim() !== '') ? 'none' : 'flex' }}
          >
            <div className="icon-image text-2xl text-slate-300"></div>
          </div>
        </div>

        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-2">{riddle.title}</h3>
        </div>

        <p className="text-[var(--text-secondary)] mb-4 line-clamp-3">
          {(riddle.surface && (riddle.surface + '').trim() !== '')
            ? riddle.surface
            : (riddle.surfaceImage ? '\u3010\u56FE\u7247\u9898\u3011\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5' : '')}
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

