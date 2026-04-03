import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Calendar, User, FileText, CreditCard, Building2, Hash, UserCheck, ChevronLeft, ChevronRight, MoreVertical, Eye, Mail, Phone } from 'lucide-react';
import { fetchPortfolioDetails } from './transactionHistoryService';

interface Transaction {
  arn: string;
  txnDate: string;
  appId: string;
  scheme: string;
  txnNature: string;
  txnType: string;
  units: number;
  rate: number;
  amount: number;
  aumUnder: number;
  creditTo: string;
  investorName: string;
  pan: string;
  folioNo: string;
  bankBranch: string;
  accountType: string;
  accountNumber: string;
  holding: string;
  address: string;
  city: string;
  pincode: string;
  email: string;
  mobile: string;
}

interface PortfolioItem {
  brokcode: string;
  rep_date: string;
  foliochk: string;
  sch_name: string;
  reinv_flag: string;
  clos_bal: string;
  rupee_bal: string;
  bank_name: string;
  inv_name: string;
  pan_no: string;
  branch: string;
  ac_type: string;
  ac_no: string;
  holding_na: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  email: string;
  mobile_no: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('rep_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPortfolioDetails();
        setTransactions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Map API response to our expected transaction format with proper type safety
  const mappedTransactions = useMemo((): Transaction[] => {
    return transactions.map(item => {
      const closBal = parseFloat(item.clos_bal) || 0;
      const rupeeBal = parseFloat(item.rupee_bal) || 0;
      const rate = closBal > 0 ? rupeeBal / closBal : 0;

      return {
        arn: item.brokcode || '',
        txnDate: item.rep_date || '',
        appId: item.foliochk || '',
        scheme: item.sch_name || '',
        txnNature: item.reinv_flag === 'Z' ? 'Purchase' : 'Redemption',
        txnType: 'Fresh',
        units: closBal,
        rate: rate,
        amount: rupeeBal,
        aumUnder: rupeeBal,
        creditTo: item.bank_name || '',
        investorName: item.inv_name || '',
        pan: item.pan_no || '',
        folioNo: item.foliochk || '',
        bankBranch: `${item.bank_name || ''} - ${item.branch || ''}`,
        accountType: item.ac_type === 'SB' ? 'Savings' : 'Current',
        accountNumber: item.ac_no ? `****${item.ac_no.slice(-4)}` : '',
        holding: item.holding_na === 'SI' ? 'Single' : 'Joint',
        address: `${item.address1 || ''} ${item.address2 || ''} ${item.address3 || ''}`.trim(),
        city: item.city || '',
        pincode: item.pincode || '',
        email: item.email || '',
        mobile: item.mobile_no || ''
      };
    });
  }, [transactions]);

  // Filter and search functionality
  const filteredTransactions = useMemo(() => {
    let filtered = mappedTransactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.folioNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.txnNature.toLowerCase() === filterType.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'rep_date') {
        return sortOrder === 'desc' 
          ? new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime()
          : new Date(a.txnDate).getTime() - new Date(b.txnDate).getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      } else if (sortBy === 'investorName') {
        return sortOrder === 'desc' 
          ? b.investorName.localeCompare(a.investorName)
          : a.investorName.localeCompare(b.investorName);
      }
      return 0;
    });

    return filtered;
  }, [mappedTransactions, searchTerm, filterType, sortBy, sortOrder]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTransactions.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'redemption':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium">Error loading data</h3>
            <p className="mt-2 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
           
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Transaction Nature Filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchase</option>
              <option value="redemption">Redemption</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rep_date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="investorName">Sort by Investor</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              {filteredTransactions.length} transactions found
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('investorName')}
                  >
                    <div className="flex items-center">
                      Investor
                      <span className="ml-1">{getSortIcon('investorName')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('rep_date')}
                  >
                    <div className="flex items-center">
                      Date
                      <span className="ml-1">{getSortIcon('rep_date')}</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheme
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      <span className="ml-1">{getSortIcon('amount')}</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folio No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.investorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            PAN: {transaction.pan}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(transaction.txnDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{transaction.scheme}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.txnNature)}`}>
                        {transaction.txnNature}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.folioNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => viewTransactionDetails(transaction)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex-1 flex justify-between items-center sm:hidden">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastRecord, filteredTransactions.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredTransactions.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredTransactions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-green-500 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Amount
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unique Investors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(filteredTransactions.map(t => t.investorName)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Page
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {currentPage} of {totalPages}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Investor Name</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.investorName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">PAN Number</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.pan}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction Date</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTransaction.txnDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Folio Number</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.folioNo}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Scheme</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.scheme}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction Type</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.txnNature}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Units</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.units.toFixed(4)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bank & Branch</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.bankBranch}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Account Number</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.accountNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Account Type</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.accountType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Holding Type</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.holding}</p>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{selectedTransaction.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{selectedTransaction.mobile || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;