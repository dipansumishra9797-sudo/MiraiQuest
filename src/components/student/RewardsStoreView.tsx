import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Coins, Coffee, Shirt, Headphones, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const RewardsStoreView: React.FC = () => {
  const { activeStudent, rewardItems, redemptions, redeemReward, isDark } = useApp();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'Shirt': return <Shirt className="w-5 h-5 text-indigo-500" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-emerald-500" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-500" />;
      default: return <Coins className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleRedeem = (id: string) => {
    const res = redeemReward(id);
    setFeedback(res);
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subCardBg = isDark
    ? 'bg-slate-950 border-slate-800'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6">
      {/* Coins Balance Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/30 border-amber-200 text-slate-900 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <Coins className="w-4 h-4" />
            <span>SEPARATE REWARDS ECONOMY</span>
          </div>
          <h3 className="text-xl font-bold">MSOT Campus Perks Store</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Important Invariant: Redeeming rewards uses your separate coins balance. Your academic XP and Level are <strong className={isDark ? 'text-white' : 'text-slate-900'}>NEVER reduced</strong>.
          </p>
        </div>

        <div className={`p-4 rounded-xl border text-center shrink-0 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-amber-200 shadow-xs'
        }`}>
          <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Available Coins</div>
          <div className="text-3xl font-extrabold text-amber-500 tabular-nums">
            {activeStudent.coinsBalance}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.success
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isDark
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Rewards Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rewardItems.map((item) => {
          const canAfford = activeStudent.coinsBalance >= item.costCoins;
          const inStock = item.stock > 0;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${cardBg}`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 ${subCardBg}`}>
                  {getRewardIcon(item.icon)}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{item.title}</span>
                </div>

                <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </div>

              <div className={`pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.stock} in stock</span>
                  <span className="font-extrabold text-amber-500 tabular-nums">
                    {item.costCoins} Coins
                  </span>
                </div>

                <button
                  onClick={() => handleRedeem(item.id)}
                  disabled={!canAfford || !inStock}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                    canAfford && inStock
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                      : isDark
                      ? 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {!inStock ? 'Out of Stock' : !canAfford ? 'Need More Coins' : 'Redeem Perk'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Redemptions */}
      {redemptions.length > 0 && (
        <div className={`p-5 rounded-2xl border transition-colors ${cardBg}`}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3">
            Your Active Redemptions
          </h4>
          <div className="space-y-2">
            {redemptions.map((red) => (
              <div
                key={red.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${subCardBg}`}
              >
                <div>
                  <div className="font-semibold">{red.itemTitle}</div>
                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(red.timestamp).toLocaleDateString()} · MSOT Voucher Issued
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                  APPROVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
