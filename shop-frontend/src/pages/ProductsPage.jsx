import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";


const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");


  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9; // 每頁顯示 9 個商品 (3x3)

  const fetchData = async (page = 0) => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProductsApi(page, pageSize),
        getCategoriesApi(),
      ]);

      const pageData = productsData.data;
      setProducts(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setCurrentPage(pageData.number || 0);

      setCategories(categoriesData.data || categoriesData || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const [productsData, categoriesData] = await Promise.all([
//         getProductsApi(),
//         getCategoriesApi(),
//         ]);
//         setProducts(productsData.data.content || []);
//         setCategories(categoriesData.data || categoriesData || []);
//       } catch (error) {
//         console.error("Failed to fetch data", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

const filteredProducts = products.filter((product) => {
    const matchesKeyword =
      searchKeyword === "" ||
      product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchesCategory =
      selectedCategory === "" ||
      String(product.categoryId) === String(selectedCategory) ||
      product.categoryName === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("");
  };

  const handlePreviousPage = () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePageClick = (page) => {
      setCurrentPage(page);
    };

    // 產生頁碼按鈕陣列
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5; // 最多顯示 5 個頁碼
      let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible);

      if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
      }

      for (let i = start; i < end; i++) {
        pages.push(i);
      }
      return pages;
    };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Search and Filter */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="🔍 Search products by name..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-full md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center mt-10 p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No products found.</p>
                <button onClick={handleClearFilters} className="mt-4 text-blue-600 underline">
                  Clear filters
                </button>
              </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="border rounded p-4 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p className="text-gray-600 mt-1">{product.description}</p>
              <p className="text-green-600 font-semibold mt-2">
                ${product.price}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Stock: {product.stockQuantity}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;