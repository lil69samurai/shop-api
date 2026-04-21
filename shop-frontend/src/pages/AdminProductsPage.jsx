import { useEffect, useState } from "react";
import { getProductsApi, deleteProductApi, createProductApi, updateProductApi } from "../api/productApi";
import { getCategoriesApi } from "../api/categoryApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");

   const [form, setForm] = useState({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
    });

const fetchData = async () => {
    try {
      const productData = await getProductsApi();
      setProducts(productData.data.content || []);

      const categoryData = await getCategoriesApi();
      setCategories(categoryData.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", categoryId: "" });
    setEditingProduct(null);
    setShowForm(false);
    setError("");
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      categoryId: parseInt(form.categoryId),
    };

    try {
      if (editingProduct) {
        await updateProductApi(editingProduct.id, productData);
      } else {
        await createProductApi(productData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError("Failed to save product");
      console.error(err);
    }
  };

const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductApi(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "+ New Product"}
        </button>
      </div>

      {showForm && (
              <form onSubmit={handleSubmit} className="border rounded p-4 mb-6 space-y-4">
                <h2 className="font-bold text-lg">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h2>

                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Price</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Stock</label>
                    <input
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      rows="3"
                    />
                  </div>
                </div>

                <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                            {editingProduct ? "Update" : "Create"}
                          </button>
                        </form>
                      )}

                      {/* Product Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">ID</th>
                              <th className="border p-2 text-left">Name</th>
                              <th className="border p-2 text-left">Price</th>
                              <th className="border p-2 text-left">Stock</th>
                              <th className="border p-2 text-left">Category</th>
                              <th className="border p-2 text-left">Status</th>
                              <th className="border p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50">
                                <td className="border p-2">{product.id}</td>
                                <td className="border p-2">{product.name}</td>
                                <td className="border p-2">${product.price}</td>
                                <td className="border p-2">{product.stock}</td>
                                <td className="border p-2">{product.categoryName}</td>
                                <td className="border p-2">{product.status}</td>
                                <td className="border p-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="text-blue-500 hover:underline mr-3"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-500 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                };

                export default AdminProductsPage;