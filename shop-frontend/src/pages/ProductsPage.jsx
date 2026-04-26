import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { API_BASE_URL } from "../utils/config";

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
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">What's Good</h1>

      {/* Search and Filter */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="🔍 Search products by name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            Search
          </button>
          {(searchKeyword || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition whitespace-nowrap"
            >
              ✕ Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing {products.length} of {totalElements} products | Page {currentPage + 1} of {totalPages || 1}
        </p>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center mt-10 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No products found.</p>
          <button onClick={handleClearFilters} className="mt-4 text-blue-600 underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-lg transition bg-white"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold">{product.name}</h2>
                {product.categoryName && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {product.categoryName}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
              <p className="text-green-600 font-semibold mt-2 text-lg">${product.price}</p>
              <p className="text-sm text-gray-400 mt-1">
                Stock: {product.stock ?? product.stockQuantity ?? "N/A"}
              </p>
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
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 border rounded-lg transition ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;