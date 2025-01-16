import { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  CreditCard,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState({
    profile: true,
    orders: true,
    payments: true
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user profile only if user is a vendor
  useEffect(() => {
    const fetchProfile = async () => {
      if (user.user_type === 'VENDOR') {
        try {
          const response = await fetch('/api/accounts/profile/', {
            headers: {
              'Authorization': `Bearer ${user.access}`
            }
          });
          const data = await response.json();
          setUserProfile(data);
          setEditForm(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        // For regular users, use the data from auth context
        setUserProfile(user);
        setEditForm({
          email: user.email,
          username: user.username
        });
      }
      setLoading(prev => ({ ...prev, profile: false }));
    };
    fetchProfile();
  }, [user]);

  // Rest of the fetch functions remain the same
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/orders/', {
          headers: {
            'Authorization': `Bearer ${user.access}`
          }
        });
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    fetchOrders();
  }, [user.access]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(prev => ({ ...prev, payments: true }));
        
        if (user.user_type === 'VENDOR') {
          // For vendors, fetch all payments directly
          const response = await fetch('/api/payments/payments/', {
            headers: {
              'Authorization': `Bearer ${user.access}`
            }
          });
          const paymentsData = await response.json();
          setPayments(paymentsData);
        } else {
          // For customers, we should just fetch all their payments in one request
          // since the backend already filters by customer
          const response = await fetch('/api/payments/payments/', {
            headers: {
              'Authorization': `Bearer ${user.access}`
            }
          });
          const paymentsData = await response.json();
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(prev => ({ ...prev, payments: false }));
      }
    };
  
    // Fetch payments when component mounts or user changes
    if (user?.access) {
      fetchPayments();
    }
  }, [user.access, user.user_type]);

  const handleUpdateProfile = async () => {
    try {
      const endpoint = user.user_type === 'VENDOR' 
        ? '/api/accounts/profile/'
        : '/api/accounts/update-user/';
        
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      
      if (user.user_type === 'VENDOR') {
        setUserProfile(data);
      } else {
        // Update local storage and auth context for regular users
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserProfile(updatedUser);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await fetch(`/api/orders/orders/${orderId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const handleInitiateRefund = async (paymentId) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/refund/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: payments.find(p => p.id === paymentId).amount,
          reason: 'Customer requested refund'
        })
      });
      
      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(p => 
          p.id === paymentId ? {...p, status: 'REFUNDED'} : p
        ));
      }
    } catch (error) {
      console.error('Error initiating refund:', error);
    }
  };

  const renderProfile = () => (
    <div className="bg-gray-900 rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Profile Information</h2>
      {loading.profile ? (
        <p className="text-gray-400">Loading profile...</p>
      ) : !isEditing ? (
        <div className="space-y-4">
          <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Username:</span> {userProfile?.username}</p>
          <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Email:</span> {userProfile?.email}</p>
          {user.user_type === 'VENDOR' && (
            <>
              <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Business Name:</span> {userProfile?.vendor_profile?.business_name}</p>
              <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Business Description:</span> {userProfile?.vendor_profile?.business_description}</p>
              <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Business Address:</span> {userProfile?.vendor_profile?.business_address}</p>
            </>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full md:w-auto bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-500 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            className="w-full px-3 py-2 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
            placeholder="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
          />
          {user.user_type === 'VENDOR' && (
            <>
              <input
                className="w-full px-3 py-2 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Business Name"
                value={editForm.vendor_profile?.business_name}
                onChange={(e) => setEditForm({
                  ...editForm,
                  vendor_profile: {
                    ...editForm.vendor_profile,
                    business_name: e.target.value
                  }
                })}
              />
              <input
                className="w-full px-3 py-2 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Business Description"
                value={editForm.vendor_profile?.business_description}
                onChange={(e) => setEditForm({
                  ...editForm,
                  vendor_profile: {
                    ...editForm.vendor_profile,
                    business_description: e.target.value
                  }
                })}
              />
              <input
                className="w-full px-3 py-2 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="Business Address"
                value={editForm.vendor_profile?.business_address}
                onChange={(e) => setEditForm({
                  ...editForm,
                  vendor_profile: {
                    ...editForm.vendor_profile,
                    business_address: e.target.value
                  }
                })}
              />
            </>
          )}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <button 
              onClick={handleUpdateProfile}
              className="w-full md:w-auto bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-500 transition-colors"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditForm(userProfile);
              }}
              className="w-full md:w-auto bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="bg-gray-900 rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">
        {userProfile?.user_type === 'VENDOR' ? 'All Orders' : 'My Orders'}
      </h2>
      {loading.orders ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Order ID:</span> {order.id}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Status:</span> {order.status}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Total Amount:</span> Ksh {order.total_amount}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Created At:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="bg-gray-900 rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">
        {userProfile?.user_type === 'VENDOR' ? 'All Payments' : 'My Payments'}
      </h2>
      {loading.payments ? (
        <p className="text-gray-400">Loading payments...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-400">No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Payment ID:</span> {payment.id}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Amount:</span> ${payment.amount}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Status:</span> {payment.status}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Method:</span> {payment.payment_method}</p>
                  <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Order ID:</span> {payment.order_id}</p>
                  {payment.transaction_id && (
                    <p className="text-sm md:text-base text-gray-400"><span className="font-semibold text-white">Transaction ID:</span> {payment.transaction_id}</p>
                  )}
                </div>
                {payment.status === 'COMPLETED' && userProfile?.user_type === 'VENDOR' && (
                  <button 
                    onClick={() => handleInitiateRefund(payment.id)}
                    className="w-full md:w-auto bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Initiate Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static w-full md:w-64 bg-gray-900 shadow-lg z-40 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h2>
          <nav className="space-y-2">
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'profile' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => {
                setActiveTab('profile');
                setIsMobileMenuOpen(false);
              }}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'orders' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => {
                setActiveTab('orders');
                setIsMobileMenuOpen(false);
              }}
            >
              <Package size={20} />
              <span>Orders</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'payments' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => {
                setActiveTab('payments');
                setIsMobileMenuOpen(false);
              }}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 rounded text-gray-400 hover:bg-gray-800 transition-colors"
              onClick={logout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'payments' && renderPayments()}
      </div>
    </div>
  );
};

export default UserDashboard;