import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="hefno-error-boundary">
          <div className="hefno-error-boundary-container">
            <div className="hefno-error-boundary-icon">⚠</div>
            <h2 className="hefno-error-boundary-title">حدث خطأ غير متوقع</h2>
            <p className="hefno-error-boundary-desc">
              نأسف على الإزعاج، يرجى المحاولة مرة أخرى
            </p>
            <button
              className="hefno-error-boundary-btn"
              onClick={() => window.location.reload()}
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
