import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-stone-200">404</h1>
        <p className="text-xl text-stone-500 mt-4">ページが見つかりません</p>
        <p className="text-stone-400 mt-2">お探しのページは存在しないか、移動した可能性があります</p>
        <Link to="/" className="inline-block mt-6 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-medium">
          トップページへ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
