import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getImageSrc } from "../utils/config";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  const fetchProducts = async (page = 0, keyword = searchKeyword, categoryId = selectedCategory) => {
    setLoading(true);
    try {
      const productsData = await getProductsApi(page, pageSize, keyword, categoryId);
      const pageData = productsData.data;
      setProducts(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setCurrentPage(pageData.number || 0);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategoriesApi();
      setCategories(categoriesData.data || categoriesData || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(0);
  }, []);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, newCategory);
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("");
    setSortBy("");
    setCurrentPage(0);
    fetchProducts(0, "", "");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, searchKeyword, selectedCategory);
    window.scrollTo(0, 0);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) handlePageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  };

  const getSortedProducts = () => {
    if (!sortBy) return products;
    const sorted = [...products];
    switch (sortBy) {
      case "price_asc": return sorted.sort((a, b) => a.price - b.price);
      case "price_desc": return sorted.sort((a, b) => b.price - a.price);
      case "name_asc": return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest": return sorted.sort((a, b) => b.id - a.id);
      default: return sorted;
    }
  };

  const displayProducts = getSortedProducts();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">{"\u5546\u54C1\u4E00\u89A7"}</h1>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input type="text" placeholder={"\uD83D\uDD0D \u5546\u54C1\u540D\u3067\u691C\u7D22..."} value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleKeyPress}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="w-full md:w-48">
              <select value={selectedCategory} onChange={handleCategoryChange}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{"\u3059\u3079\u3066\u306E\u30AB\u30C6\u30B4\u30EA\u30FC"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{"\u4E26\u3073\u66FF\u3048"}</option>
                <option value="price_asc">{"\u4FA1\u683C: \u5B89\u3044\u9806"}</option>
                <option value="price_desc">{"\u4FA1\u683C: \u9AD8\u3044\u9806"}</option>
                <option value="name_asc">{"\u540D\u524D: A\u2192Z"}</option>
                <option value="newest">{"\u65B0\u3057\u3044\u9806"}</option>
              </select>
            </div>
            <button onClick={handleSearch}
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition whitespace-nowrap font-medium">
              {"\u691C\u7D22"}
            </button>
            {(searchKeyword || selectedCategory || sortBy) && (
              <button onClick={handleClearFilters}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition whitespace-nowrap">
                {"\u2715 \u30AF\u30EA\u30A2"}
              </button>
            )}
          </div>
          <p className="text-sm text-stone-400 mt-2">
            {totalElements}{"\u4EF6\u4E2D"} {products.length}{"\u4EF6\u8868\u793A"} | {"\u30DA\u30FC\u30B8"} {currentPage + 1} / {totalPages || 1}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-stone-400 text-sm">{"\u5546\u54C1\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..."}</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-stone-100">
            <div className="text-5xl mb-4">{"\uD83D\uDD0D"}</div>
            <p className="text-stone-500 text-lg mb-2">{"\u5546\u54C1\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F"}</p>
            <p className="text-stone-400 text-sm mb-4">{"\u691C\u7D22\u6761\u4EF6\u3092\u5909\u3048\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044"}</p>
            <button onClick={handleClearFilters} className="text-amber-600 hover:text-amber-700 underline font-medium">
              {"\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u30AF\u30EA\u30A2"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <Link to={"/products/" + product.id} key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100">
                {product.imageUrl ? (
                  <div className="overflow-hidden">
                    <img src={getImageSrc(product.imageUrl)} alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-stone-100 flex items-center justify-center text-stone-300">
                    <div className="text-center">
                      <div className="text-4xl mb-1">{"\uD83D\uDDBC\uFE0F"}</div>
                      <p className="text-xs">No Image</p>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-800">{product.name}</h2>
                    {product.categoryName && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{product.categoryName}</span>
                    )}
                  </div>
                  <p className="text-stone-500 mt-1 text-sm line-clamp-2">{product.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-amber-600 font-bold text-lg">{"\u00A5"}{Number(product.price).toLocaleString()}</p>
                    <p className="text-sm text-stone-400">
                      {(product.stock ?? product.stockQuantity ?? 0) > 0 ? (
                        <span className="text-green-600">{"\u5728\u5EAB\u3042\u308A"}</span>
                      ) : (
                        <span className="text-red-500">{"\u58F2\u308A\u5207\u308C"}</span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {"\u2190 \u524D\u3078"}
            </button>
            {getPageNumbers().map((page) => (
              <button key={page} onClick={() => handlePageChange(page)}
                className={"px-4 py-2 border rounded-lg transition " + (currentPage === page ? "bg-slate-800 text-white border-slate-800" : "border-stone-200 hover:bg-stone-100")}>
                {page + 1}
              </button>
            ))}
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {"\u6B21\u3078 \u2192"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
