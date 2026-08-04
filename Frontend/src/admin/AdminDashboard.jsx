import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  User,
  Loader2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { adminAnalytics } from '../features/analytics.slice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  // State to track which donut slice is currently hovered
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Select data from the analytics slice including the live topSellingProducts data
  const {
    stats,
    recentOrders,
    recentUsers,
    lowStockProducts,
    topSellingProducts,
    categories,
    loading,
    error
  } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(adminAnalytics());
  }, [dispatch]);

  // Handle Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading dashboard analytics...</p>
      </div>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-red-800 font-bold mb-1">Failed to Load Analytics</h3>
        <p className="text-red-600 text-sm mb-4">{error?.message || JSON.stringify(error)}</p>
        <button
          onClick={() => dispatch(adminAnalytics())}
          className="bg-red-600 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Fallback defaults safe processing
  const displayStats = stats || { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, pendingOrders: 0 };

  // Use the live top selling data from Redux slice with a fallback array
  const liveTopSelling = topSellingProducts || [];

  // Generate category distribution for the chart dynamically
  const categoryChartData = (() => {
    const colors = ['#3b82f6', '#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#0ea5e9', '#84cc16'];

    if (Array.isArray(categories) && categories.length > 0) {
      return categories
        .map((cat, index) => {
          const rawName = cat?.name || cat?.category || cat?._id || 'Unknown';
          const count = cat?.count ?? cat?.quantity ?? cat?.totalProducts ?? cat?.totalStock ?? 0;

          return {
            name: String(rawName).replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            count: Number(count) || 0,
            fill: colors[index % colors.length],
          };
        })
        .filter((item) => item.count > 0);
    }

    const allProducts = [...(topSellingProducts || []), ...(lowStockProducts || [])];
    const grouped = allProducts.reduce((acc, curr) => {
      const cat = curr?.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name: String(name).replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
        fill: colors[index % colors.length],
      }));
  })();

  const totalCategoryItems = categoryChartData.reduce((acc, curr) => acc + curr.count, 0);
  const hasCategoryData = categoryChartData.length > 0;

  const StatCard = ({ title, value, icon, trend, isPositive, colorClass }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h2>
      </div>
    </div>
  );

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };


  return (
    <div className="space-y-6 pb-8 px-1">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here is what's happening with your store today.</p>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(displayStats.totalRevenue || 0).toLocaleString()}`}
          trend="Real-time"
          isPositive={true}
          icon={<DollarSign size={20} />}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={(displayStats.totalOrders || 0).toString()}
          icon={<ShoppingCart size={20} />}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Total Users"
          value={(displayStats.totalUsers || 0).toString()}
          icon={<Users size={20} />}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Products"
          value={(displayStats.totalProducts || 0).toString()}
          icon={<Package size={20} />}
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Pending Orders"
          value={(displayStats.pendingOrders || 0).toString()}
          trend={displayStats.pendingOrders > 0 ? "Action Req." : null}
          isPositive={false}
          icon={<Clock size={20} />}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* MIDDLE ROW: CATEGORY DONUT CHART & LIVE TOP PRODUCTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

        {/* ENHANCED: Products by Category Donut Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm xl:col-span-2 flex flex-col h-full min-h-137.5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Products by Category</h3>
              <p className="text-sm text-slate-500">Overview of product quantities per category</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/categories'}
              className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Manage Categories ({categories?.length || 0})
            </button>
          </div>

          {hasCategoryData ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full flex-1 bg-slate-50/30 rounded-3xl p-2 sm:p-4 border border-slate-100">

              {/* BIGGER Responsive SVG Chart Container */}
              <div className="h-87.5 md:h-full w-full md:w-3/5 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-5xl font-black text-slate-800 tracking-tighter">{totalCategoryItems}</span>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Total Items</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="72%"
                      outerRadius="100%"
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                      // Attach mouse events to update the hovered slice index
                      onMouseEnter={(_, index) => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          // If current cell is hovered, turn it black (#000000)
                          fill={hoveredIndex === index ? '#000000' : entry.fill}
                          style={{
                            outline: 'none',
                            filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))',
                            cursor: 'pointer'
                          }}
                          className="transition-all duration-300"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 800 }}
                      formatter={(value, name) => [`${value} Units`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend: With Dots, Scrollable */}
              <div className="w-full md:w-2/5 flex flex-col h-full max-h-87.5 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 rounded-lg">
                <div className="flex flex-col gap-2">
                  {categoryChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm group">
                      <div className="flex flex-col min-w-0">
                        {/* Dot indicator and category name */}
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.fill }}
                          ></span>
                          <span className="text-sm font-bold text-slate-700 truncate transition-colors group-hover:text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase ml-5 mt-0.5">
                          {((item.count / totalCategoryItems) * 100).toFixed(1)}% Share
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-black text-base">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-100 text-slate-400 text-sm font-medium bg-slate-50/50 rounded-2xl border border-slate-50/80">
              No category quantity data available
            </div>
          )}
        </div>

        {/* Live Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Top Sales Performance
            </h3>
          </div>
          <div className="p-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {liveTopSelling.length > 0 ? (
              <ul className="space-y-1">
                {liveTopSelling.map((product) => {
                  const topProductImg = product.thumbnail || product.image || product.images?.[0]?.url;
                  return (
                    <li key={product._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        {topProductImg ? (
                          <img src={topProductImg} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{product.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{product.totalSold || 0} sold</p>
                      </div>
                      <div className="text-sm font-black text-blue-600 shrink-0">
                        ₹{product.price}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm py-8 text-center px-4">
                No high velocity transactions.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: RECENT ORDERS & RECENT USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Orders</h3>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors cursor-pointer" onClick={() => { navigate("/admin/orders") }}>View All</button>
          </div>
          <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-sm text-left min-w-125">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Customer ID / Name</th>
                  <th className="px-6 py-3 font-semibold text-center">Items Count</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 whitespace-nowrap">
                          {order.userId?.name || `User ID: ...${order._id.slice(-6)}`}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                          {order.address?.city || 'Standard Delivery'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-center">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-right whitespace-nowrap">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${getOrderStatusColor(order.status || 'Pending')}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 text-sm">No recent orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">New Registrations</h3>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors cursor-pointer" onClick={() => { navigate("/admin/users") }}>View All</button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto h-80 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {recentUsers && recentUsers.length > 0 ? (
              <ul className="space-y-1">
                {recentUsers.map((user) => (
                  <li key={user._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border-2 border-white shadow-sm shrink-0">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap ml-2">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm py-12">
                No new registrations found
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FULL WIDTH ROW: LOW STOCK PRODUCTS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Low Stock Alerts</h3>
              <p className="text-xs text-slate-500">Products requiring immediate restocking triage</p>
            </div>
          </div>
          <button
            className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
            onClick={() => navigate("/admin/inventory")}
          >
            Manage Inventory
          </button>
        </div>

        {/* Scroll Container prevents full-page growth */}
        <div className="overflow-x-auto w-full max-h-95 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-sm text-left min-w-225 relative border-collapse">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/70 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold text-center">Category</th>
                <th className="px-6 py-4 font-semibold text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Stocks Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => {
                  const lowStockImg = product.thumbnail || product.image || product.images?.[0]?.url;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {lowStockImg ? (
                            <img
                              src={lowStockImg}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                        {product.brand || <span className="text-slate-400 font-normal italic">Qwick Cart Essentials</span>}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 text-right whitespace-nowrap">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`font-bold px-2 py-0.5 rounded text-sm ${(product.stock ?? 0) === 0 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
                          }`}>
                          {product.stock ?? 0}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">units</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-sm">All products are well stocked! No alerts.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;