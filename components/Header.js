function Header() {
  try {
    return (
      <>
        <header className="bg-[var(--surface-dark)] border-b border-[var(--border-color)]" data-name="header" data-file="components/Header.js">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-3 group" aria-label="返回首页">
                <div className="w-10 h-10 bg-[var(--primary-color)] rounded-lg flex items-center justify-center group-hover:opacity-90 transition">
                  <div className="icon-turtle text-xl text-white"></div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">海龟汤题库</h1>
                    <span className="tag hidden sm:inline">作者：赵二</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">神秘推理游戏平台</p>
                </div>
              </a>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/add-riddle" className="btn-primary">添加题目</a>
                <a href="/manage" className="text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors">管理</a>
              </nav>
            </div>
          </div>
        </header>
        <a href="/manage" aria-label="管理" className="md:hidden fixed bottom-5 right-4 z-50 btn-primary rounded-full shadow-lg flex items-center gap-2">
          <span className="icon-settings text-sm"></span>
          管理
        </a>
      </>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
