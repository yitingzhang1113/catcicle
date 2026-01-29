
import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  currency: 'USD' | 'Coins';
  itemName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount, currency, itemName }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setCardName('');
      setCardNumber('');
    }
  }, [isOpen]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate API delay
    setTimeout(() => {
      setStep('success');
      // Simulate success delay before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl scale-up-center border border-white/20">
        {step === 'details' && (
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Safe & Secure Payment</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-2xl transition-colors">×</button>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Summary</span>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Verified</span>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{itemName}</p>
              <p className="text-2xl font-black text-gray-900 mt-2">
                {currency === 'USD' ? `$${amount.toFixed(2)}` : `${amount} Coins`}
              </p>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Cardholder Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="Jane Doe"
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Card Number</label>
                <input 
                  required
                  type="text" 
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Expiry</label>
                  <input required type="text" placeholder="MM/YY" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">CVV</label>
                  <input required type="password" placeholder="***" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all mt-6"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-16 text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Processing Transaction</h3>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Encrypting your data...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-16 text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-emerald-200">
              ✓
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Meow! Your order is confirmed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
