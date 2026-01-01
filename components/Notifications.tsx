import React from 'react';
import { Bell, Heart, UserPlus, DollarSign, Star, Zap, MoreHorizontal } from 'lucide-react';
import LazyImage from './LazyImage';

const NOTIFICATIONS = [
  { id: 1, type: 'win', content: 'You won $450.00 from "Bitcoin > 100k"', time: '2m', read: false },
  { id: 2, type: 'like', content: 'Vitalik Fan liked your reply', time: '1h', read: false },
  { id: 3, type: 'follow', content: 'Elon Stan followed you', time: '3h', read: true },
  { id: 4, type: 'new_market', content: 'New market in Crypto: ETH ETF Approval', time: '5h', read: true },
  { id: 5, type: 'win', content: 'You won $120.50 from "Lakers vs Warriors"', time: '1d', read: true },
];

const Notifications = () => {
  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] px-4 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f]">Notifications</h1>
        <button className="p-2 hover:bg-[#f5f5f7] rounded-full text-[#86868b] transition-colors duration-200">
            <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="divide-y divide-[#e5e5ea]">
        {NOTIFICATIONS.map((notif) => (
            <div 
                key={notif.id} 
                className={`px-5 py-5 hover:bg-[#f5f5f7] transition-colors duration-200 flex gap-4 cursor-pointer relative ${!notif.read ? 'bg-[#fff9e6]' : ''}`}
            >
                {!notif.read && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-[#ffd700] shadow-sm"></div>
                )}

                <div className="shrink-0 mt-0.5">
                    {notif.type === 'win' && <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center border border-[#34c759]/20"><DollarSign className="w-5 h-5 text-[#34c759]" /></div>}
                    {notif.type === 'like' && <div className="w-10 h-10 rounded-full bg-[#ff3b30]/10 flex items-center justify-center border border-[#ff3b30]/20"><Heart className="w-5 h-5 text-[#ff3b30]" /></div>}
                    {notif.type === 'follow' && <div className="w-10 h-10 rounded-full bg-[#ffd700]/10 flex items-center justify-center border border-[#ffd700]/20"><UserPlus className="w-5 h-5 text-[#ffd700]" /></div>}
                    {notif.type === 'new_market' && <div className="w-10 h-10 rounded-full bg-[#ffd700]/10 flex items-center justify-center border border-[#ffd700]/20"><Zap className="w-5 h-5 text-[#ffd700]" /></div>}
                </div>
                
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <LazyImage src={`https://picsum.photos/id/${10 + notif.id}/50/50`} className="w-6 h-6 rounded-full border border-[#e5e5ea]" alt="Avatar" />
                    </div>
                    <p className="text-[#1d1d1f] text-[15px] leading-snug">
                        {notif.type === 'win' ? (
                             <span>
                                 <span className="font-semibold text-[#34c759]">Payout confirmed!</span> You won $450.00 from "Bitcoin &gt; 100k".
                             </span>
                        ) : (
                            notif.content
                        )}
                    </p>
                    <p className="text-[#86868b] text-xs mt-2 font-medium">{notif.time} ago</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;