import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: string;
  discountedPrice: string;
  color: string;
  bgColor: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  removeFromCart: (index: number) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, removeFromCart }) => {
  const totalPrice = cart.reduce((acc, item) => {
    const price = parseFloat(item.discountedPrice.replace('$', ''));
    return acc + price;
  }, 0).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[250]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[300] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl text-gray-900">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Basket</h2>
                <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag className="w-16 h-16 mb-4 stroke-[1.5]" />
                  <p className="text-lg font-medium text-gray-500">Your basket is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Start adding bioactive goodness</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative bg-gray-50 rounded-2xl p-4 border border-transparent hover:border-gray-200 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Thumbnail Placeholder */}
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-inner" 
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <div className="w-8 h-12 rounded-sm shadow-lg transform -rotate-12" style={{ backgroundColor: item.color }} />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black tracking-tight" style={{ color: item.color }}>{item.discountedPrice}</span>
                          <span className="text-xs text-gray-400 line-through font-medium">{item.price}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6 px-1">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-black text-gray-900 tracking-tight">${totalPrice}</span>
                </div>
                <button 
                  className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200"
                  onClick={() => alert('Proceeding to checkout...')}
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Free Shipping on all orders</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
