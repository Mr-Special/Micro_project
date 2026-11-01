import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-5 text-[#1F1E1D] dark:bg-[#181715] dark:text-[#EDE8E1]">
          <section className="claude-card w-full max-w-lg p-6 text-center sm:p-8" role="alert">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#CC5A2B]">Something went wrong</p>
            <h1 className="mt-3 font-serif text-2xl font-semibold">The studio could not load</h1>
            <p className="mt-2 text-sm leading-6 text-[#78716C] dark:text-[#A8A29E]">Try reloading the page. If the issue continues, return later.</p>
            <button type="button" onClick={() => window.location.reload()} className="primary-button mt-5">Reload page</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
