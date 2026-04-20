import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500 mt-4">Page not found</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 block">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;