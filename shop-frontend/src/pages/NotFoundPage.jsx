import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="bg-stone-50 min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <h1 className="text-[150px] font-extrabold text-stone-100 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">{"\u2694\uFE0F"}</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{"\u30DA\u30FC\u30B8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"}</h2>
        <p className="text-stone-500 mb-2">{"\u304A\u63A2\u3057\u306E\u30DA\u30FC\u30B8\u306F\u5B58\u5728\u3057\u306A\u3044\u304B\u3001\u79FB\u52D5\u3057\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059"}</p>
        <p className="text-sm text-stone-400 mb-8">{"\u300C\u6B66\u58EB\u306F\u9053\u306B\u8FF7\u3046\u3068\u3082\u3001\u5FC5\u305A\u5E30\u308A\u9053\u3092\u898B\u3064\u3051\u308B\u300D"}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/"
            className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-bold">
            {"\u30C8\u30C3\u30D7\u30DA\u30FC\u30B8\u3078"}
          </Link>
          <Link to="/products"
            className="border-2 border-amber-500 text-amber-600 px-6 py-3 rounded-lg hover:bg-amber-50 transition font-bold">
            {"\u5546\u54C1\u3092\u898B\u308B"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
