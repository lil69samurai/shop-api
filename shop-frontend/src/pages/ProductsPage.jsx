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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  const parseSortValue = (val) => {
    switch (val) {
      case "price_asc": return { sortBy: "price", sortDir: "asc" };
      case "price_desc": return { sortBy: "price", sortDir: "desc" };
      case "name_asc": return { sortBy: "name", sortDir: "asc" };
      case "newest": return { sortBy: "createdAt", sortDir: "desc" };
      default: return { sortBy: "createdAt", sortDir: "desc" };
    }
  };

  const fetchProducts = async (page = 0, keyword = searchKeyword, categoryId = selectedCategory, sort = sortBy, dir = sortDir, pMin = minPrice, pMax = maxPrice) => {
    setLoading(true);
    try {
      const productsData = await getProductsApi(page, pageSize, keyword, categoryId, sort, dir, pMin, pMax);
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

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, minPrice, maxPrice);
  };

  const handleCategoryChange = (e) => {
    const v = e.target.value;
    setSelectedCategory(v);
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, v, sortBy, sortDir, minPrice, maxPrice);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const { sortBy: sb, sortDir: sd } = parseSortValue(val);
    setSortBy(sb);
    setSortDir(sd);
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, selectedCategory, sb, sd, minPrice, maxPrice);
  };

  const getSortSelectValue = () => {
    if (sortBy === "price" && sortDir === "asc") return "price_asc";
    if (sortBy === "price" && sortDir === "desc") return "price_desc";
    if (sortBy === "name" && sortDir === "asc") return "name_asc";
    return "newest";
  };

  const handlePriceFilter = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      const tmp = minPrice;
      setMinPrice(maxPrice);
      setMaxPrice(tmp);
      setCurrentPage(0);
      fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, maxPrice, tmp);
      return;
    }
    setCurrentPage(0);
    fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, minPrice, maxPrice);
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("");
    setSortBy("createdAt");
    setSortDir("desc");
    setMinPrice("");
    setMaxPrice("");
    setShowPriceFilter(false);
    setCurrentPage(0);
    fetchProducts(0, "", "", "createdAt", "desc", "", "");
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };
  const handlePriceKeyPress = (e) => { if (e.key === "Enter") handlePriceFilter(); };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, searchKeyword, selectedCategory, sortBy, sortDir, minPrice, maxPrice);
    window.scrollTo(0, 0);
  };
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

  const hasActiveFilters = searchKeyword || selectedCategory || minPrice || maxPrice || sortBy !== "createdAt" || sortDir !== "desc";

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">{t("products.title")}</h1>

        {/* Search & Filter Bar */}
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
              <select value={getSortSelectValue()} onChange={handleSortChange}
                className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="newest">{t("products.newest")}</option>
                <option value="price_asc">{t("products.priceAsc")}</option>
                <option value="price_desc">{t("products.priceDesc")}</option>
                <option value="name_asc">{t("products.nameAsc")}</option>
              </select>
            </div>
            <button onClick={() => setShowPriceFilter(!showPriceFilter)}
              className={"px-4 py-2 rounded-lg border transition whitespace-nowrap font-medium text-sm " + (showPriceFilter || minPrice || maxPrice ? "bg-amber-50 border-amber-400 text-amber-700" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50")}>
              💰 {t("products.priceRange")}
            </button>
            <button onClick={handleSearch}
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition whitespace-nowrap font-medium">
              {t("products.searchBtn")}
            </button>
            {hasActiveFilters && (
              <button onClick={handleClearFilters}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition whitespace-nowrap">
                ✕ {t("products.clear")}
              </button>
            )}
          </div>

          {/* Price Range Filter Panel */}
          {showPriceFilter && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <span className="text-sm text-stone-500 font-medium whitespace-nowrap">{t("products.priceRangeLabel")}:</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">¥</span>
                    <input type="number" min="0" placeholder={t("products.minPrice")} value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)} onKeyDown={handlePriceKeyPress}
                      className="w-full border border-stone-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                  </div>
                  <span className="text-stone-400">～</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">¥</span>
                    <input type="number" min="0" placeholder={t("products.maxPrice")} value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)} onKeyDown={handlePriceKeyPress}
                      className="w-full border border-stone-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
                  </div>
                  <button onClick={handlePriceFilter}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition whitespace-nowrap text-sm font-medium">
                    {t("products.applyPrice")}
                  </button>
                  {(minPrice || maxPrice) && (
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); setCurrentPage(0); fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, "", ""); }}
                      className="text-stone-400 hover:text-stone-600 text-sm whitespace-nowrap">
                      ✕
                    </button>
                  )}
                </div>
              </div>
              {/* Quick price buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: "~¥5,000", min: "", max: "5000" },
                  { label: "¥5,000~¥10,000", min: "5000", max: "10000" },
                  { label: "¥10,000~¥30,000", min: "10000", max: "30000" },
                  { label: "¥30,000~¥50,000", min: "30000", max: "50000" },
                  { label: "¥50,000~", min: "50000", max: "" },
                ].map((range, idx) => (
                  <button key={idx} onClick={() => {
                    setMinPrice(range.min);
                    setMaxPrice(range.max);
                    setCurrentPage(0);
                    fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, range.min, range.max);
                  }}
                    className={"px-3 py-1 rounded-full text-xs border transition " +
                      (minPrice === range.min && maxPrice === range.max
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-600")}>
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active filter tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <p className="text-sm text-stone-400">
              {totalElements}{t("products.of")} {products.length}{t("products.showing")} | {t("products.page")} {currentPage + 1} / {totalPages || 1}
            </p>
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-200">
                💰 {minPrice ? "¥" + Number(minPrice).toLocaleString() : ""} ～ {maxPrice ? "¥" + Number(maxPrice).toLocaleString() : ""}
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); setCurrentPage(0); fetchProducts(0, searchKeyword, selectedCategory, sortBy, sortDir, "", ""); }}
                  className="ml-1 hover:text-amber-900">✕</button>
              </span>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-stone-400 text-sm">{t("products.loadingProducts")}</p>
          </div>
        ) : products.length === 0 ? (
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
            {products.map((product) => (
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

        {/* Pagination */}
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
