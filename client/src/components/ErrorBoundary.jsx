import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full overflow-auto">
                        <h2 className="text-xl font-semibold mb-2 text-yellow-400">Error:</h2>
                        <pre className="text-red-300 mb-4 whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
                        <h2 className="text-xl font-semibold mb-2 text-yellow-400">Component Stack:</h2>
                        <pre className="text-gray-400 text-sm whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                    >
                        Reload Game
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
