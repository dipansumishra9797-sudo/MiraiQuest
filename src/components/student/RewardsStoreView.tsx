import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Coins, Coffee, Shirt, Headphones, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const RewardsStoreView: React.FC = () => {
  const { activeStudent, rewardItems, redemptions, redeemReward } = useApp();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'Shirt': return <Shirt className="w-5 h-5 text-indigo-400" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-emerald-400" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-400" />;
      default: return <Coins className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleRedeem = (id: string) => {
    const res = redeemReward(id);
    setFeedback(res);
  };

  return (
    <div className="space-y-6">
      {/* Coins Balance Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Coins className="w-4 h-4" />
            <span>SEPARATE REWARDS ECONOMY</span>
          </div>
          <h3 className="text-xl font-bold text-white">MSOT Campus Perks Store</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Important Invariant: Redeeming rewards uses your separate coins balance. Your academic XP and Level are <strong className="text-white">NEVER reduced</strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
          <div className="text-[11px] text-slate-400">Available Coins</div>
          <div className="text-3xl font-extrabold text-amber-400 tabular-nums">
            {activeStudent.coinsBalance}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
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
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3">
                  {getRewardIcon(item.icon)}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400 text-[11px]">{item.stock} in stock</span>
                  <span className="font-extrabold text-amber-400 tabular-nums">
                    {item.costCoins} Coins
                  </span>
                </div>

                <button
                  onClick={() => handleRedeem(item.id)}
                  disabled={!canAfford || !inStock}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                    canAfford && inStock
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
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
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Your Active Redemptions
          </h4>
          <div className="space-y-2">
            {redemptions.map((red) => (
              <div
                key={red.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{red.itemTitle}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(red.timestamp).toLocaleDateString()} · MSOT Voucher Issued
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
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
