export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            That's an error.
          </h2>
        </div>

        <div className="max-w-md mx-auto">
          <p className="text-gray-600 mb-2">
            The requested URL{" "}
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {window.location.pathname}
            </span>{" "}
            was not found on this server.
          </p>
          <p className="text-gray-600 mt-4">That's all we know.</p>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
