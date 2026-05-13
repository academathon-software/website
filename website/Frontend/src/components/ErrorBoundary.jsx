import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
