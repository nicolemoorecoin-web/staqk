import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg">Sorry, the page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}