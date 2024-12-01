import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-2 rounded-lg max-w-lg mx-auto my-10">
          <div className=" bg-neutral text-accent border-danger">
            <h1 className="text-lg font-bold text-danger">
              Something went wrong!
            </h1>
            <p className="mt-2">
              <span className="font-semibold">Error:</span>{" "}
              {this.state.error?.toString() || "Unknown error"}
            </p>
            {this.state.errorInfo && (
              <pre className="mt-4 p-3 bg-base text-accent-subtle text-sm rounded overflow-x-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <button
            className="bg-primary px-2 py-1 text-white rounded-md mt-3"
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh This Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
