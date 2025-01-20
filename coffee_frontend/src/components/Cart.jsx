import { useCart } from "../context/CartContext";
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { items, total, loading, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-white text-3xl lg:text-4xl font-bold mb-2 lg:mb-4 text-center">Your Shopping Cart</h1>
          <p className="text-gray-400 text-lg lg:text-xl text-center">Review your selected items</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center space-y-4 lg:space-y-6 text-center">
              <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" />
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-medium text-white">Your cart is empty</h3>
                <p className="text-gray-400 text-base lg:text-lg">Add some items to your cart to see them here.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl shadow-xl">
            {/* Cart Items */}
            <div className="divide-y divide-gray-700">
              {items.map((item) => (
                <div key={item.id} className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                  {/* Item image */}
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Item details and controls wrapper */}
                  <div className="flex-1 min-w-0 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between w-full">
                    {/* Item details */}
                    <div className="min-w-0 pr-4">
                      <h3 className="font-medium text-white text-base lg:text-lg truncate">{item.name}</h3>
                      <p className="text-amber-600 text-base lg:text-lg">Ksh {item.price.toFixed(2)}</p>
                    </div>

                    {/* Controls wrapper */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 lg:gap-3">
                        <button
                          className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4 lg:h-5 lg:w-5" />
                        </button>
                        
                        <span className="w-8 lg:w-10 text-center text-white text-base lg:text-lg">{item.quantity}</span>
                        
                        <button
                          className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                        </button>
                      </div>

                      {/* Item total */}
                      <div className="text-right min-w-[5rem] lg:w-32">
                        <p className="font-medium text-amber-600 text-base lg:text-lg">
                          Ksh {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        className="p-2 lg:p-3 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700 p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors text-base lg:text-lg"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-base lg:text-lg">Total</p>
                <p className="text-2xl lg:text-3xl font-bold text-amber-600">Ksh {total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;