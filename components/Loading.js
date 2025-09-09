function Loading({ full = false, text = '加载中...' }) {
  try {
    const content = (
      <div className="flex items-center justify-center gap-3 text-[var(--text-secondary)]">
        <div className="icon-loader text-lg animate-spin"></div>
        <span>{text}</span>
      </div>
    );

    if (!full) return <div className="py-16">{content}</div>;

    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        {content}
      </div>
    );
  } catch (error) {
    console.error('Loading component error:', error);
    return null;
  }
}

