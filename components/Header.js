function Header() {
  try {
    return (
      <header className="bg-[var(--surface-dark)] border-b border-[var(--border-color)]" data-name="header" data-file="components/Header.js">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                <div className="icon-turtle text-xl text-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">海龟汤题库</h1>
                <p className="text-sm text-[var(--text-secondary)]">神秘推理游戏平台</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="index.html" className="text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors">
                首页
              </a>
              <a href="add-riddle.html" className="btn-primary">
                添加题目
              </a>
            </nav>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}