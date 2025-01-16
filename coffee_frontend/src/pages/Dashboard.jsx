import { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  CreditCard,
  LogOut
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
          // For customers, fetch payments for their orders
          const paymentPromises = orders.map(order => 
            fetch(`/api/payments/${order.payment_id}/`, {
              headers: {
                'Authorization': `Bearer ${user.access}`
              }
            }).then(res => res.json())
          );
          
          const paymentsData = await Promise.all(paymentPromises);
          setPayments(paymentsData.filter(payment => payment !== null));
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(prev => ({ ...prev, payments: false }));
      }
    };

    // For vendors, fetch immediately. For customers, wait for orders
    if (user.user_type === 'VENDOR' || orders.length > 0) {
      fetchPayments();
    }
  }, [orders, user.access, user.user_type]);

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
      await fetch(`/api/orders/${orderId}/`, {
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
      {loading.profile ? (
        <p className="text-gray-600">Loading profile...</p>
      ) : !isEditing ? (
        <div className="space-y-4">
          <p className="text-gray-700"><span className="font-semibold">Username:</span> {userProfile?.username}</p>
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {userProfile?.email}</p>
          {user.user_type === 'VENDOR' && (
            <>
              <p className="text-gray-700"><span className="font-semibold">Business Name:</span> {userProfile?.vendor_profile?.business_name}</p>
              <p className="text-gray-700"><span className="font-semibold">Business Description:</span> {userProfile?.vendor_profile?.business_description}</p>
              <p className="text-gray-700"><span className="font-semibold">Business Address:</span> {userProfile?.vendor_profile?.business_address}</p>
            </>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
          />
          {user.user_type === 'VENDOR' && (
            <>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-x-2">
            <button 
              onClick={handleUpdateProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditForm(userProfile);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {userProfile?.user_type === 'VENDOR' ? 'All Orders' : 'My Orders'}
      </h2>
      {loading.orders ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-gray-700"><span className="font-semibold">Order ID:</span> {order.id}</p>
                  <p className="text-gray-700"><span className="font-semibold">Status:</span> {order.status}</p>
                  <p className="text-gray-700"><span className="font-semibold">Total Amount:</span> ${order.total_amount}</p>
                  <p className="text-gray-700"><span className="font-semibold">Created At:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {userProfile?.user_type === 'VENDOR' ? 'All Payments' : 'My Payments'}
      </h2>
      {loading.payments ? (
        <p className="text-gray-600">Loading payments...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-gray-700"><span className="font-semibold">Payment ID:</span> {payment.id}</p>
                  <p className="text-gray-700"><span className="font-semibold">Amount:</span> ${payment.amount}</p>
                  <p className="text-gray-700"><span className="font-semibold">Status:</span> {payment.status}</p>
                  <p className="text-gray-700"><span className="font-semibold">Method:</span> {payment.payment_method}</p>
                  <p className="text-gray-700"><span className="font-semibold">Order ID:</span> {payment.order_id}</p>
                  {payment.transaction_id && (
                    <p className="text-gray-700"><span className="font-semibold">Transaction ID:</span> {payment.transaction_id}</p>
                  )}
                </div>
                {payment.status === 'COMPLETED' && userProfile?.user_type === 'VENDOR' && (
                  <button 
                    onClick={() => handleInitiateRefund(payment.id)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <nav className="space-y-2">
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'orders' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} />
              <span>Orders</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded transition-colors ${
                activeTab === 'payments' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 rounded hover:bg-gray-100 transition-colors"
              onClick={logout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'payments' && renderPayments()}
      </div>
    </div>
  );
};

export default UserDashboard;