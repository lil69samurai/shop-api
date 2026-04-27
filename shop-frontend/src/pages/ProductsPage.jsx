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
    setCurrentPage(0);
    fetchProducts(0, "", "");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, searchKeyword, selectedCategory);
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

  if (loading && products.length === 0) {
    return <div className="text-center mt-10 text-stone-400">\u8aad\u307f\u8fbc\u307f\u4e2d...</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">\u5546\u54c1\u4e00\u89a7</h1>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="\U0001f50d \u5546\u54c1\u540d\u3067\u691c\u7d22..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">\u3059\u3079\u3066\u306e\u30ab\u30c6\u30b4\u30ea\u30fc</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition whitespace-nowrap font-medium"
            >
              \u691c\u7d22
            </button>
            {(searchKeyword || selectedCategory) && (
              <button
                onClick={handleClearFilters}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition whitespace-nowrap"
              >
                \u2715 \u30af\u30ea\u30a2
              </button>
            )}
          </div>
          <p className="text-sm text-stone-400 mt-2">
            {totalElements}\u4ef6\u4e2d {products.length}\u4ef6\u8868\u793a | \u30da\u30fc\u30b8 {currentPage + 1} / {totalPages || 1}
          </p>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center mt-10 p-6 bg-white rounded-xl shadow-sm">
            <p className="text-stone-400 text-lg">\u5546\u54c1\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002</p>
            <button onClick={handleClearFilters} className="mt-4 text-amber-600 underline">
              \u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u30af\u30ea\u30a2
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                to={"/products/" + product.id}
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-stone-100"
              >
                {product.imageUrl ? (
                  <div className="overflow-hidden">
                    <img
                      src={getImageSrc(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-stone-100 rounded-t-xl flex items-center justify-center text-stone-400">
                    No Image
                  </div>
                )}

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-800">{product.name}</h2>
                    {product.categoryName && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {product.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 mt-1 text-sm">{product.description}</p>
                  <p className="text-amber-600 font-bold mt-2 text-lg">\u00a5{product.price}</p>
                  <p className="text-sm text-stone-400 mt-1">
                    \u5728\u5eab: {product.stock ?? product.stockQuantity ?? "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              \u2190 \u524d\u3078
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={"px-4 py-2 border rounded-lg transition " + (
                  currentPage === page
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-stone-200 hover:bg-stone-100"
                )}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              \u6b21\u3078 \u2192
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
