
import React, { useState } from 'react';
import { Product, ProductReview } from '../types';
import { MOCK_OWNERS } from '../mockData';
import PaymentModal from './PaymentModal';

interface MallProps {
  onPurchase: (product: Product, method: 'USD' | 'Coins') => void;
  userCoins: number;
  products: Product[];
  onAddReview: (productId: string, rating: number, comment: string) => void;
}

const Mall: React.FC<MallProps> = ({ onPurchase, userCoins, products, onAddReview }) => {
  const [filter, setFilter] = useState<'All' | 'Food' | 'Clothes' | 'Gear'>('All');
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  
  // Payment State
  const [paymentProduct, setPaymentProduct] = useState<Product | null>(null);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const getAverageRating = (reviews: ProductReview[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleReviewSubmit = () => {
    if (!selectedProductForReviews || !newComment.trim()) return;
    onAddReview(selectedProductForReviews.id, newRating, newComment);
    setNewComment('');
    setNewRating(5);
    // Update local modal data
    const updatedProduct = products.find(p => p.id === selectedProductForReviews.id);
    if (updatedProduct) setSelectedProductForReviews({ ...updatedProduct });
  };

  const getOwner = (id: string) => MOCK_OWNERS.find(o => o.id === id) || MOCK_OWNERS[0];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
        {['All', 'Food', 'Clothes', 'Gear'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              filter === cat 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-100 hover:border-amber-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-amber-600 uppercase">
                {product.category}
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1">
                <span className="text-amber-400">★</span>
                <span className="text-white text-[10px] font-black">{getAverageRating(product.reviews)} ({product.reviews.length})</span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedProductForReviews(product)}
                  className="w-full py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-colors"
                >
                  See Reviews & Rate
                </button>
                <button 
                  onClick={() => setPaymentProduct(product)}
                  className="w-full py-2.5 rounded-xl font-black text-sm bg-gray-900 text-white hover:bg-black transition-colors flex justify-between px-4 items-center"
                >
                  <span>Buy with USD</span>
                  <span>${product.usdPrice.toFixed(2)}</span>
                </button>
                
                <button 
                  onClick={() => onPurchase(product, 'Coins')}
                  disabled={userCoins < product.catCoinPrice}
                  className={`w-full py-2.5 rounded-xl font-black text-sm transition-all flex justify-between px-4 items-center ${
                    userCoins >= product.catCoinPrice
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Pay with Coins</span>
                  <span className="flex items-center">
                    <span className="mr-1">🪙</span>
                    {product.catCoinPrice}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-black mb-2 italic">Engagement Rewards!</h2>
          <p className="opacity-90 text-sm">Every post you make earns you 10 Cat Coins. Get 50 likes? That's another 50 Coins!</p>
        </div>
        <button className="mt-6 md:mt-0 bg-white text-orange-600 px-8 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
          Start Posting 🐾
        </button>
      </div>

      {/* USD Payment Modal */}
      {paymentProduct && (
        <PaymentModal 
          isOpen={!!paymentProduct}
          onClose={() => setPaymentProduct(null)}
          onSuccess={() => onPurchase(paymentProduct, 'USD')}
          amount={paymentProduct.usdPrice}
          currency="USD"
          itemName={paymentProduct.name}
        />
      )}

      {/* Reviews Modal */}
      {selectedProductForReviews && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-up-center">
            <div className="p-8 border-b relative">
              <button onClick={() => setSelectedProductForReviews(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 text-2xl">×</button>
              <div className="flex items-center space-x-4">
                <img src={selectedProductForReviews.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedProductForReviews.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex text-amber-500 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < Math.round(Number(getAverageRating(selectedProductForReviews.reviews))) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedProductForReviews.reviews.length} evaluations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Leave your review</h4>
                <div className="flex space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setNewRating(star)} 
                      className={`text-2xl transition-transform hover:scale-125 ${newRating >= star ? 'text-amber-500' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24 mb-4"
                  placeholder="What does your cat think about this product?"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button 
                  onClick={handleReviewSubmit}
                  disabled={!newComment.trim()}
                  className="w-full bg-amber-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-100 disabled:opacity-50"
                >
                  Submit Evaluation
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Community Reviews</h4>
                {selectedProductForReviews.reviews.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-10 font-medium">No reviews yet. Be the first to rate!</p>
                ) : selectedProductForReviews.reviews.map(review => {
                  const rOwner = getOwner(review.ownerId);
                  return (
                    <div key={review.id} className="bg-white p-5 rounded-3xl border-b last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <img src={rOwner.avatar} className="w-8 h-8 rounded-full object-cover" />
                          <p className="text-xs font-black text-gray-900">{rOwner.accountName}</p>
                        </div>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium pl-11">{review.comment}</p>
                      <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest pl-11 mt-2">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mall;
