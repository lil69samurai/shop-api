import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";
import { getImageSrc } from "../utils/config";

const ProductsPage = () => {
  const { t } = useTranslation();
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

  useEffect(() => { fetchCategories(); fetchProducts(0); }, []);

  const handleSearch = () => { setCurrentPage(0); fetchProducts(0, searchKeyword, selectedCategory); };
  const handleCategoryChange = (e) => { const v = e.target.value; setSelectedCategory(v); setCurrentPage(0); fetchProducts(0, searchKeyword, v); };
  const handleClearFilters = () => { setSearchKeyword(""); setSelectedCategory(""); setSortBy(""); setCurrentPage(0); fetchProducts(0, "", ""); };
  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };
  const handlePageChange = (page) => { setCurrentPage(page); fetchProducts(page, searchKeyword, selectedCategory); window.scrollTo(0, 0); };
  const handlePreviousPage = () => { if (currentPage > 0) handlePageChange(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages - 1) handlePageChange(currentPage + 1); };

  const getPageNumbers = () => {
    const pages = []; const maxVisible = 5;
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
        <h1 className="text-2xl font-bold mb-6 text-slate-800">{t("products.title")}</h1>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input type="text" placeholder={t("products.search")} value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleKeyPress}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="w-full md:w-48">
              <select value={selectedCategory} onChange={handleCategoryChange}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{t("products.allCategories")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{t("products.sort")}</option>
                <option value="price_asc">{t("products.priceAsc")}</option>
                <option value="price_desc">{t("products.priceDesc")}</option>
                <option value="name_asc">{t("products.nameAsc")}</option>
                <option value="newest">{t("products.newest")}</option>
              </select>
            </div>
            <button onClick={handleSearch}
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition whitespace-nowrap font-medium">
              {t("products.searchBtn")}
            </button>
            {(searchKeyword || selectedCategory || sortBy) && (
              <button onClick={handleClearFilters}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition whitespace-nowrap">
                ✕ {t("products.clear")}
              </button>
            )}
          </div>
          <p className="text-sm text-stone-400 mt-2">
            {totalElements}{t("products.of")} {products.length}{t("products.showing")} | {t("products.page")} {currentPage + 1} / {totalPages || 1}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-stone-400 text-sm">{t("products.loadingProducts")}</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-stone-100">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-stone-500 text-lg mb-2">{t("products.noResults")}</p>
            <p className="text-stone-400 text-sm mb-4">{t("products.noResultsDesc")}</p>
            <button onClick={handleClearFilters} className="text-amber-600 hover:text-amber-700 underline font-medium">
              {t("products.clearFilters")}
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
                      <div className="text-4xl mb-1">🖼️</div>
                      <p className="text-xs">{t("products.noImage")}</p>
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
                    <p className="text-amber-600 font-bold text-lg">¥{Number(product.price).toLocaleString()}</p>
                    <p className="text-sm text-stone-400">
                      {(product.stock ?? product.stockQuantity ?? 0) > 0 ? (
                        <span className="text-green-600">{t("products.inStock")}</span>
                      ) : (
                        <span className="text-red-500">{t("products.soldOut")}</span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">
              ← {t("products.prev")}
            </button>
            {getPageNumbers().map((page) => (
              <button key={page} onClick={() => handlePageChange(page)}
                className={"px-4 py-2 border rounded-lg transition " + (currentPage === page ? "bg-slate-800 text-white border-slate-800" : "border-stone-200 hover:bg-stone-100")}>
                {page + 1}
              </button>
            ))}
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}
              className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {t("products.next")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
