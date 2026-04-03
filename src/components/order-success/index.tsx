import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, Hash, Clock, Copy, Download, Share2, ArrowRight, Check, CheckCircle2 } from 'lucide-react';

const OrderSuccessScreen = () => {
  const [copied, setCopied] = useState(false);
  const [tickVisible, setTickVisible] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const tickInterval = setInterval(() => setTickVisible(v => !v), 800);
    const stepTimer = setTimeout(() => setStep(1), 100);
    return () => { clearInterval(tickInterval); clearTimeout(stepTimer); };
  }, []);

  const orderDetails = {
    schemeName: "Abakkus Small Cap Fund",
    transactionType: "Purchase",
    email: "rakesh.sinha96@gmail.com",
    orderNumber: "25026LN1GM000182",
    dateTime: "March 10, 2025 · 01:02 PM",
    amount: "₹50,000",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(orderDetails.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 px-6 pt-7 pb-6 text-center relative overflow-hidden">
          
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          />

          {/* Blinking tick with rings */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 opacity-40 animate-ping" />
            <div className="absolute -inset-3 rounded-full border border-emerald-300 opacity-20 animate-ping" style={{ animationDelay: '0.4s' }} />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <CheckCircle2
                className="w-9 h-9 transition-opacity duration-300"
                style={{ color: '#059669', opacity: tickVisible ? 1 : 0.2 }}
              />
            </div>
          </div>

          <p className="text-xl font-bold text-white tracking-tight">Order Placed!</p>
          <p className="text-emerald-300 text-xs mt-1 font-medium">Your investment is confirmed</p>

          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 border border-white/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-200 font-semibold tracking-wide">LIVE · Connected to MFU</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">

          {/* Fund */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-emerald-500 font-semibold uppercase tracking-widest">Scheme</p>
              <p className="text-sm font-bold text-slate-800 truncate">{orderDetails.schemeName}</p>
            </div>
          </div>

          {/* Amount + Type */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Amount</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{orderDetails.amount}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Type</p>
              <p className="text-lg font-extrabold text-slate-700 mt-0.5">{orderDetails.transactionType}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-dashed border-slate-200" />
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-widest">Details</span>
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>

          {/* Info rows */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-semibold">Email</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{orderDetails.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Time</p>
                <p className="text-xs font-semibold text-slate-700">{orderDetails.dateTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hash className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold">Order Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-700 font-mono truncate">{orderDetails.orderNumber}</p>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${copied ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

       

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
            
              OK
            </button>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;