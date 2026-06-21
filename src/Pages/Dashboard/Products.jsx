import React, { useEffect, useMemo, useRef, useState } from "react";
import Switch from "@mui/material/Switch";
import { Pencil, Trash2, Plus, Search, Filter, X } from "lucide-react";
import altImage from "../../assets/login-bg.png";
import { showToast } from "../../utils/toastHelper";
import { Link } from "react-router-dom";
import axios from "axios";
import apiClient from "../../utils/apiClient";


const label = { inputProps: { "aria-label": "Switch demo" } };

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

const Products = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterBtnRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    availability: true,
  });
  
  function StatusBadge({ status }) {
    const styles = {
      Available: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      Cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          styles[status] || styles.Cancelled
        }`}
      >
        {status}
      </span>
    );
  }
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // const response = await fetch("https://dummyjson.com/products");
        // const data = await response.json();
        
        // const response = await axios.get(
          //   "http://localhost:5000/api/ecomm/getproducts"
        // );
        const res = await apiClient.get("/ecomm/getproducts");
        const products = res.data;

        const filteredProducts = products.map((product) => {
          const BACKEND_SERVER_URL = "http://localhost:5000";
          // Define the unique part of the file system path that starts the URL
          const STATIC_PATH_PREFIX =
            "/home/zaid/I-Dashboard/Backend/src/uploads/";

          const genVarients = product.generatedVariants;
          console.log(genVarients.length);
          const rawImages = product?.Images || [];
          const validImages = rawImages.filter(
            (img) => img && img.trim() !== ""
          );

          // 🔑 FIX: Map the images using a custom replacement function.
          const fullImageUrls = validImages.map((imagePath) => {
            const lowerPath = imagePath.toLowerCase();
            // 1. Check if the path is ALREADY a complete URL (for placeholders)
            if (
              lowerPath.startsWith("http://") ||
              lowerPath.startsWith("https://")
            ) {
              return imagePath; // Use the path as is
            }
            // 2. Check if the path is the absolute file system path
            if (imagePath.startsWith(STATIC_PATH_PREFIX)) {
              // A. Replace the file system path with the public URL prefix ('/uploads')
              const publicRelativePath = imagePath.replace(
                STATIC_PATH_PREFIX,
                "/uploads/"
              );
              // B. Prepend the server base URL
              return `${BACKEND_SERVER_URL}${publicRelativePath}`;
            }
            // 3. Fallback for new correct paths (which should start with /uploads/)
            return `${BACKEND_SERVER_URL}${imagePath}`;
          });

          console.log(fullImageUrls);

          let avail = product.pricing.Availability;
          if (avail) {
            avail = "Available";
          } else {
            avail = "out of stock";
          }

          return {
            id: product?._id || product?.id,
            title: product?.productInformation.Name,
            category: product?.organization.Category,
            price: product?.pricing.Price,
            sku: product?.productInformation.SKU,
            images: fullImageUrls.length > 0 ? fullImageUrls : [altImage],
            stocks: product?.pricing.Availability,
            varients: genVarients.length,
            Availability: avail,
            description: product?.productInformation?.Description || "",
          };
        });

        setOrders(filteredProducts);
      } catch (err) {
        console.error("Error fetching orders", err.message);
      }
    };

    fetchOrders();
  }, []);

  const formattedCount = useMemo(() => orders.length, [orders]);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!showFilterDropdown) return;
    function handleClickOutside(event) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // filters (category + search)
  const filteredOrders = orders.filter((order) => {
    if (categoryFilter !== "all" && order.category !== categoryFilter)
      return false;

    if (debouncedSearchTerm) {
      const lower = debouncedSearchTerm.toLowerCase();
      const matchesTitle = order.title?.toLowerCase().includes(lower);
      const matchesSku = String(order.sku)?.includes(lower);
      if (!matchesTitle && !matchesSku) return false;
    }
    return true;
  });

  function closeModal() {
    setIsModalOpen(false);
    setEditingProductId(null);
  }

  const openEditModal = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.title || "",
      price: product.price != null ? String(product.price) : "",
      description: product.description || "",
      availability: Boolean(product.stocks),
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProductId) return;
    try {
      const res = await apiClient.put(`/ecomm/products/${editingProductId}`, {
        name: formData.name,
        price: Number(formData.price),
        avilability: formData.availability,
        description: formData.description,
      });

      if (res?.data?.success) {
        setOrders((prev) =>
          prev.map((p) =>
            p.id === editingProductId
              ? {
                  ...p,
                  title: formData.name,
                  price: Number(formData.price),
                  Availability: formData.availability
                    ? "Available"
                    : "out of stock",
                  stocks: formData.availability,
                  description: formData.description,
                }
              : p
          )
        );
        showToast("success", "Product updated successfully!");
        closeModal();
      } else {
        showToast("error", res?.data?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating:", error);
      showToast("error", "Network error. Please try again.");
    }
  };

  function requestDelete(id) {
    setDeleteTargetId(id);
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    setOrders((prev) => prev.filter((o) => o.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast("info", "Order Deleted");
  }

  function cancelDelete() {
    setDeleteTargetId(null);
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  function handlePrevPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }

  function handleNextPage() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] md:text-2xl font-semibold text-gray-900">
            Ecommerce
          </h1>
          <p className="text-sm text-grskuay-500">Orders overview table</p>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            ref={filterBtnRef}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={() => setShowFilterDropdown((prev) => !prev)}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {showFilterDropdown && (
            <div
              ref={filterDropdownRef}
              className="absolute right-[110px] mt-40 md:mt-2 w-48 bg-white border rounded-md shadow-lg z-10"
            >
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setShowFilterDropdown(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                All
              </button>
              <button
                onClick={() => {
                  setCategoryFilter("Clothing");
                  setShowFilterDropdown(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Clothing
              </button>
              <button
                onClick={() => {
                  setCategoryFilter("Footwear");
                  setShowFilterDropdown(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Footwear
              </button>
              <button
                onClick={() => {
                  setCategoryFilter("Accessories");
                  setShowFilterDropdown(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Accessories
              </button>
              <button
                onClick={() => {
                  setCategoryFilter("Electronics");
                  setShowFilterDropdown(false);
                  setCurrentPage(1);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Electronics
              </button>
            </div>
          )}
          <button className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-700 cursor-pointer">
            <Plus className="w-4 h-4" />
            <Link to={"/dashboard/add-product"}>Add Product</Link>
          </button>
        </div>
      </div>
      {/* ToolBar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {formattedCount} results
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Catagory</th>
                <th className="px-4 py-3 font-medium">Varients</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">sku</th>
                <th className="px-4 py-3 font-medium flex items-center gap-2 justify-center">
                  Action
                </th>
                {/* <th className="px-4 py-3 font-medium">Date</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.images[0]}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-900">
                        {order.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[320px] truncate">
                    {order.varients}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[320px] truncate">
                    <StatusBadge status={order.Availability}/>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {formatCurrency(order.price)}
                  </td>
                  {/* <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {order.stocks}
                  </td> */}
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {order.sku}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                        onClick={() => openEditModal(order)}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                        onClick={() => requestDelete(order.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      {/* <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">
                Edit Product
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-4 grid grid-cols-1 gap-3"
            >
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Product name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Price
                  </label>
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    inputMode="decimal"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="e.g. 199.99"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.availability}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: e.target.checked,
                      }))
                    }
                    inputProps={{ "aria-label": "Availability" }}
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Describe the product"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-white hover:bg-black"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">
                Delete product
              </h3>
            </div>
            <div className="p-4 text-sm text-gray-700">
              Are you sure you want to delete product{" "}
              <span className="font-medium">#{deleteTargetId}</span>? This
              action cannot be undone.
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiClient.delete(`/ecomm/products/${deleteTargetId}`);
                    confirmDelete();
                    showToast("success", "Product deleted successfully!");
                  } catch (err) {
                    console.error("Delete error:", err);
                    showToast("error", "Failed to delete product");
                  }
                }}
                className="px-3 py-2 text-sm rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
