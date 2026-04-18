/**
 * pages/History.jsx
 * Full transaction history with filters.
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
};

const SERVICE_ICONS = {
  airtime:     '📞',
  data:        '📶',
  electricity: '💡',
  tv:          '📺',
  edu:         '🎓',
};

const FILTERS = ['all', 'airtime', 'data', 'electricity', 'tv', 'edu'];

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [summary, setSummary]           = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = filter !== 'all' ? `?type=${filter}` : '';
        const [txRes, sumRes] = await Promise.all([
          api.get(`/transactions/${params}`),
          api.get('/transactions/summary/'),
        ]);
        setTransactions(txRes.data.results || []);
        setSummary(sumRes.data.summary);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Transaction History</h1>
        <p className="text-gray-500 text-sm mt-1">All your transactions in one place</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.total_transactions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Transactions</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-blue-600">{fmt(summary.total_spent)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-green-600">{fmt(summary.total_profit)}</p>
            <p className="text-xs text-gray-500 mt-1">Your Profit</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap capitalize transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f}</button>
        ))}
      </div>

      {/* List */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    {SERVICE_ICONS[tx.service_type]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {tx.service_type} {tx.network ? `— ${tx.network.toUpperCase()}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.phone || tx.account_number} · {new Date(tx.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{fmt(tx.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[tx.status]}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
