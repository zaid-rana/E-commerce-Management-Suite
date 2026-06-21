import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ChevronDown, Filter, X } from "lucide-react";
import { showToast } from "../../utils/toastHelper";
import apiClient from "../../utils/apiClient";
import { VisaIcon, MastercardIcon } from 'react-svg-credit-card-payment-icons';
import { Banknote } from 'lucide-react';


export default function Orders() {
  const [orders, setOrders] = useState([]); 
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filterBtnRef = useRef(null);
  const filterDropdownRef = useRef(null);
  
  // 2. Fetch Data from API and set directly to 'orders'
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get("/order/getOrder");

        // FIX: Now the array is inside 'data' based on your new log
        const payload = response.data?.data || [];

        // Safety check
        if (!Array.isArray(payload)) {
          console.error("Payload is not an array:", payload);
          return;
        }

        const transformed = payload.map((order) => {
          const items = order?.orderItems || [];
          const firstItem = items[0];
          const extraCount = items.length - 1;
          

          // 1. Create the summary string for the Table cell
          let displayProduct = "No Product";
          if (firstItem) {
            const firstName = firstItem.name;
            // If there are more items, append "+ X more"
            displayProduct =
              extraCount > 0 ? `${firstName} + ${extraCount} more` : firstName;
          }

          // 2. Create a full list string for the Tooltip (hover effect)
          const fullList = items
            .map((item) => `${item.name} (x${item.quantity})`)
            .join(", ");

          return {
            id: order?._id,
            customer: order?.user?.name || "Guest Customer",
            avatar: "https://placehold.co/40x40",

            // Store the summary for display
            product: displayProduct,
            // Store the full list for the tooltip
            fullProductList: fullList,

            date: order?.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "N/A",
            amount: order?.totalPrice ?? 0,
            status: order?.status || "Pending",
            paymentMethod: order?.paymentMethod || "COD",
          };
        });

        setOrders(transformed);
      } catch (err) {
        console.error("Error fetching orders", err.message);
      }
    };

    fetchOrders();
  }, []);
  
  function StatusBadge({ status }) {
    const styles = {
      Delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      Pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      Shipped: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
      Cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      Processing: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200"
    };
    // Fallback to 'Processing' style if status doesn't match
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.Processing}`}>
        {status}
      </span>
    );
  }

  // --- Removed LocalStorage Logic (It conflicts with API data) ---

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

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800); 

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    
    // Search filter
    if (debouncedSearchTerm) {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      const matchCustomer = order.customer?.toLowerCase().includes(lowerSearch);
      // Optional: Add product search
      const matchProduct = order.product?.toLowerCase().includes(lowerSearch);
      
      if (!matchCustomer && !matchProduct) return false;
    }

    // Date filter
    const today = new Date();
    const orderDate = new Date(order.date);
    if (filter === "today") {
      return orderDate.toDateString() === today.toDateString();
    }
    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return orderDate >= weekAgo && orderDate <= today;
    }
    if (filter === "month") {
      return (
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    }
    return true;
  });

  // const formattedCount = useMemo(() => orders.length, [orders]);

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR" }).format(value || 0);
  }


  const PaymentIcon = ({method}) => {
    const PaymentMethod = method || "COD";

    if (PaymentMethod.includes("Visa")) {
      return <VisaIcon format="flatRounded" width={38} />;
    }

    if (PaymentMethod.includes("Mastercard")) {
      return <MastercardIcon format="flatRounded" width={38} />;
    }

    return (
      <div
        className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200"
        title={PaymentMethod}
      >
        <Banknote className="w-4 h-4 text-emerald-600" />
        <span className="text-[10px] font-medium uppercase">COD</span>
      </div>
    );
  }


  // NOTE: This only deletes from Local State. 
  // You should add apiClient.delete(`/order/${id}`) here.
  function confirmDelete() {
    if (!deleteTargetId) return;
    setOrders((prev) => prev.filter((o) => o.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast("info", "Order Deleted locally");
  }


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders, totalPages, currentPage]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] md:text-2xl font-semibold text-gray-900">
            Orders
          </h1>
          <p className="text-sm text-gray-500">
            Manage orders. Create, update, delete.
          </p>
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
            <div ref={filterDropdownRef} className="absolute mt-2 w-40 bg-white border rounded-md shadow-lg z-10 top-10 right-0">
              <button
                onClick={() => { setFilter("all"); setShowFilterDropdown(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                All Time
              </button>
              <button
                onClick={() => { setFilter("today"); setShowFilterDropdown(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Today
              </button>
              <button
                onClick={() => { setFilter("week"); setShowFilterDropdown(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                This Week
              </button>
              <button
                onClick={() => { setFilter("month"); setShowFilterDropdown(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                This Month
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search customer or product..."
            value={searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {["all", "Delivered", "Pending", "Shipped", "Processing", "Cancelled"].map((status) => (
             <button
             key={status}
             className={`px-2 py-1 rounded-lg hover:bg-gray-300 cursor-pointer ${statusFilter === status ? 'bg-gray-900 text-white' : 'text-gray-700'}`}
             onClick={() => setStatusFilter(status)}
           >
             {status.charAt(0).toUpperCase() + status.slice(1)}
           </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {filteredOrders.length} results
          </div>
          <button className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
            Sort by <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Payment Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[100px] truncate" title={order.id}>
                      {order.id.substring(order.id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-900">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={order.fullProductList}>
                      {order.product}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate flex justify-center">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end p-2">
                        <PaymentIcon method={order.paymentMethod} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
          <div className="text-gray-600">Page {currentPage} of {totalPages || 1}</div>
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
    </div>
  );
}