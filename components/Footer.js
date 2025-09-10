function Footer() {
  try {
    const year = new Date().getFullYear();
    return (
      <footer className="mt-12 border-t border-[var(--border-color)] bg-[var(--surface-dark)]" data-name="footer" data-file="components/Footer.js">
        <div className="container mx-auto px-4 py-6 text-sm text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {year} 海龟汤题库 · 作者：<span className="text-[var(--text-primary)]">赵二</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-[var(--text-primary)]">首页</a>
            <a href="/manage" className="hover:text-[var(--text-primary)]">管理</a>
            <a href="/add-riddle" className="hover:text-[var(--text-primary)]">添加题目</a>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}
