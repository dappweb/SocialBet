import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  RefreshCw,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '../utils';
import { operationsApi, TreasuryTransaction, OperationsStats } from '../services/api';
import TreasuryManagement from './TreasuryManagement';
import LoadingSpinner from './LoadingSpinner';
import SimpleChart from './SimpleChart';
import { useAuth } from '../contexts/AuthContext';

/**
 * Operations Dashboard Component
 * Comprehensive operations and management system for Soulcast
 */
const OperationsDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'stats'>('overview');
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [stats, setStats] = useState<OperationsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (activeTab === 'transactions') {
        fetchTransactions();
      } else if (activeTab === 'stats') {
        fetchStats();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, activeTab, filterType, filterCategory]);

  const exportTransactions = (format: 'csv' | 'json') => {
    if (transactions.length === 0) {
      return;
    }

    if (format === 'csv') {
      // CSV export
      const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Status', 'Description'];
      const rows = transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.transactionType.replace('_', ' ').toUpperCase(),
        tx.amount.toString(),
        tx.currency,
        tx.category || '',
        tx.status.toUpperCase(),
        tx.description || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `soulcast-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // JSON export
      const jsonContent = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `soulcast-transactions-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterCategory !== 'all') params.category = filterCategory;
      
      const data = await operationsApi.getTransactions({ limit: 100, ...params });
      setTransactions(data.transactions);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await operationsApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filterType, filterCategory]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'trade_fee':
        return 'bg-[#ffd700] text-[#1d1d1f]';
      case 'allocation':
        return 'bg-[#34c759] text-white';
      case 'withdrawal':
        return 'bg-[#ff3b30] text-white';
      case 'deposit':
        return 'bg-[#007aff] text-white';
      default:
        return 'bg-[#86868b] text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Show access denied if not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#e5e5ea] p-8 max-w-md text-center">
          <Settings size={48} className="text-[#86868b] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Access Denied</h2>
          <p className="text-[#86868b]">
            {!isAuthenticated 
              ? 'Please sign in to access the Operations Dashboard.'
              : 'Admin access is required to view the Operations Dashboard.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[#1d1d1f] flex items-center gap-3">
              <Settings className="text-[#ffd700]" size={32} />
              Operations & Management
            </h1>
            <div className="flex items-center gap-3">
              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-[#e5e5ea]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-[#ffd700] rounded focus:ring-[#ffd700]"
                  />
                  <span className="text-sm text-[#86868b]">Auto-refresh</span>
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="ml-2 text-xs border border-[#e5e5ea] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                  >
                    <option value="10">10s</option>
                    <option value="30">30s</option>
                    <option value="60">1m</option>
                    <option value="300">5m</option>
                  </select>
                )}
              </div>
              <button
                onClick={() => {
                  if (activeTab === 'transactions') fetchTransactions();
                  else if (activeTab === 'stats') fetchStats();
                }}
                className="p-2 rounded-xl hover:bg-white transition-colors duration-200"
                title="Refresh"
              >
                <RefreshCw size={20} className={cn(
                  "text-[#86868b]",
                  autoRefresh && "animate-spin"
                )} />
              </button>
            </div>
          </div>
          <p className="text-[#86868b]">
            Manage platform operations, treasury, and financial metrics
            {autoRefresh && (
              <span className="ml-2 text-xs">
                • Auto-refreshing every {refreshInterval}s
              </span>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[#e5e5ea]">
          {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'transactions', label: 'Transactions', icon: Activity },
            { id: 'stats', label: 'Statistics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-semibold transition-all duration-200 border-b-2",
                activeTab === tab.id
                  ? "text-[#ffd700] border-[#ffd700]"
                  : "text-[#86868b] border-transparent hover:text-[#1d1d1f]"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <TreasuryManagement />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">Treasury Transactions</h2>
              <div className="flex gap-3">
                {transactions.length > 0 && (
                  <div className="relative group">
                    <button
                      onClick={() => exportTransactions('csv')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-xl font-semibold transition-all duration-200 text-sm"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-[#e5e5ea] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => exportTransactions('csv')}
                        className="w-full text-left px-4 py-2 hover:bg-[#f5f5f7] text-sm text-[#1d1d1f]"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => exportTransactions('json')}
                        className="w-full text-left px-4 py-2 hover:bg-[#f5f5f7] text-sm text-[#1d1d1f] border-t border-[#e5e5ea]"
                      >
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                >
                  <option value="all">All Types</option>
                  <option value="trade_fee">Trade Fees</option>
                  <option value="allocation">Allocations</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="deposit">Deposits</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                >
                  <option value="all">All Categories</option>
                  <option value="development">Development</option>
                  <option value="operations">Operations</option>
                  <option value="marketing">Marketing</option>
                  <option value="reserves">Reserves</option>
                  <option value="partnerships">Partnerships</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Loading transactions..." />
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-xl font-semibold transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="text-[#86868b] mx-auto mb-4" />
                <p className="text-[#86868b]">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e5ea]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#86868b]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#e5e5ea] hover:bg-[#f5f5f7] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#1d1d1f]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-xs font-semibold",
                            getTransactionTypeColor(tx.transactionType)
                          )}>
                            {tx.transactionType.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-[#1d1d1f]">
                          {tx.currency === 'USD' ? '$' : ''}{tx.amount.toLocaleString()} {tx.currency}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#86868b]">
                          {tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-xs font-semibold",
                            getStatusColor(tx.status)
                          )}>
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#86868b] max-w-xs truncate">
                          {tx.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {isLoading ? (
              <LoadingSpinner text="Loading statistics..." />
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchStats}
                  className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-xl font-semibold transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            ) : stats ? (
              <>
                {/* Transaction Statistics */}
                <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Transaction Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.transactionStats.map((stat) => (
                      <div key={stat.type} className="bg-[#f5f5f7] rounded-xl p-4">
                        <p className="text-xs text-[#86868b] mb-1">
                          {stat.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-2xl font-semibold text-[#1d1d1f] mb-1">
                          {stat.count.toLocaleString()}
                        </p>
                        <p className="text-sm text-[#86868b]">
                          ${stat.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Transaction Amount Chart */}
                  {stats.transactionStats.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-[#1d1d1f] mb-4">Transaction Amounts by Type</h4>
                      <SimpleChart
                        data={stats.transactionStats.map(stat => ({
                          label: stat.type.replace('_', ' ').toUpperCase(),
                          value: stat.totalAmount,
                          color: stat.type === 'trade_fee' ? '#ffd700' : 
                                 stat.type === 'allocation' ? '#34c759' :
                                 stat.type === 'withdrawal' ? '#ff3b30' : '#007aff',
                        }))}
                        height={250}
                        type="bar"
                      />
                    </div>
                  )}
                </div>

                {/* Allocation Breakdown */}
                <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Fund Allocation Details</h3>
                  
                  {/* Allocation Chart */}
                  {stats.allocations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#1d1d1f] mb-4">Allocation Breakdown</h4>
                      <SimpleChart
                        data={stats.allocations.map(alloc => ({
                          label: alloc.category.charAt(0).toUpperCase() + alloc.category.slice(1),
                          value: alloc.allocated,
                          color: alloc.category === 'development' ? '#ffd700' :
                                 alloc.category === 'operations' ? '#34c759' :
                                 alloc.category === 'marketing' ? '#007aff' :
                                 alloc.category === 'reserves' ? '#ff9500' : '#af52de',
                        }))}
                        height={250}
                        type="bar"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {stats.allocations.map((alloc) => (
                      <div key={alloc.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1d1d1f] capitalize">
                            {alloc.category}
                          </span>
                          <span className="text-sm text-[#86868b]">
                            ${alloc.allocated.toLocaleString()} ({alloc.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#e5e5ea] rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              alloc.category === 'development' ? 'bg-[#ffd700]' :
                              alloc.category === 'operations' ? 'bg-[#34c759]' :
                              alloc.category === 'marketing' ? 'bg-[#007aff]' :
                              alloc.category === 'reserves' ? 'bg-[#ff9500]' : 'bg-[#af52de]'
                            )}
                            style={{ width: `${alloc.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#86868b] mt-1">
                          Used: ${alloc.used.toLocaleString()} | 
                          Available: ${(alloc.allocated - alloc.used).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsDashboard;

