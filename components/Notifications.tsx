import React from 'react';
import { Bell, Heart, UserPlus, DollarSign, Star, Zap, MoreHorizontal } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, type: 'win', content: 'You won $450.00 from "Bitcoin > 100k"', time: '2m', read: false },
  { id: 2, type: 'like', content: 'Vitalik Fan liked your reply', time: '1h', read: false },
  { id: 3, type: 'follow', content: 'Elon Stan followed you', time: '3h', read: true },
  { id: 4, type: 'new_market', content: 'New market in Crypto: ETH ETF Approval', time: '5h', read: true },
  { id: 5, type: 'win', content: 'You won $120.50 from "Lakers vs Warriors"', time: '1d', read: true },
];

const Notifications = () => {
  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-slate-800">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <button className="p-2 hover:bg-slate-900 rounded-full text-slate-500 transition-colors">
            <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="divide-y divide-slate-800">
        {NOTIFICATIONS.map((notif) => (
            <div 
                key={notif.id} 
                className={`px-5 py-5 hover:bg-slate-900/40 transition-colors flex gap-4 cursor-pointer relative ${!notif.read ? 'bg-slate-900/20' : ''}`}
            >
                {!notif.read && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                )}

                <div className="shrink-0 mt-0.5">
                    {notif.type === 'win' && <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><DollarSign className="w-5 h-5 text-emerald-500" /></div>}
                    {notif.type === 'like' && <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20"><Heart className="w-5 h-5 text-rose-500 fill-rose-500" /></div>}
                    {notif.type === 'follow' && <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><UserPlus className="w-5 h-5 text-blue-500 fill-blue-500/20" /></div>}
                    {notif.type === 'new_market' && <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Zap className="w-5 h-5 text-purple-500 fill-purple-500" /></div>}
                </div>
                
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <img src={`https://picsum.photos/id/${10 + notif.id}/50/50`} className="w-6 h-6 rounded-full border border-slate-700" alt="Avatar" />
                    </div>
                    <p className="text-slate-200 text-[15px] leading-snug">
                        {notif.type === 'win' ? (
                             <span>
                                 <span className="font-bold text-emerald-400">Payout confirmed!</span> You won $450.00 from "Bitcoin &gt; 100k".
                             </span>
                        ) : (
                            notif.content
                        )}
                    </p>
                    <p className="text-slate-500 text-xs mt-2 font-medium">{notif.time} ago</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;