import React from 'react';
import { Search, MoreHorizontal } from 'lucide-react';

const TrendingItem = ({ category, title, posts }: { category: string, title: string, posts: string }) => (
  <div className="py-3 px-4 hover:bg-slate-900 transition-colors cursor-pointer relative">
    <div className="flex justify-between items-start">
      <div className="text-xs text-slate-500 font-medium">{category} • Trending</div>
      <MoreHorizontal size={14} className="text-slate-500 hover:text-blue-500" />
    </div>
    <div className="font-bold text-sm text-slate-100 mt-0.5">{title}</div>
    <div className="text-xs text-slate-500 mt-1">{posts} bets placed</div>
  </div>
);

const RightPanel = () => {
  return (
    <div className="hidden lg:block w-[350px] pl-8 py-4 h-screen sticky top-0 overflow-y-auto no-scrollbar">
      
      {/* Search */}
      <div className="sticky top-0 bg-black pb-2 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 rounded-full leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black border border-transparent focus:border-blue-500 transition-all"
            placeholder="Search markets"
          />
        </div>
      </div>

      {/* Trending Box */}
      <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden pt-3">
        <h2 className="px-4 pb-2 text-xl font-extrabold text-white">Trends for you</h2>
        
        <TrendingItem 
           category="Politics"
           title="US Election 2024"
           posts="1.2M"
        />
        <TrendingItem 
           category="Crypto"
           title="$SOL vs $ETH"
           posts="450K"
        />
         <TrendingItem 
           category="Sports"
           title="Super Bowl LVIII"
           posts="125K"
        />
        <TrendingItem 
           category="Technology"
           title="Sam Altman"
           posts="89K"
        />
        
        <div className="p-4 text-blue-500 text-sm hover:bg-slate-900 cursor-pointer transition-colors">
            Show more
        </div>
      </div>

      {/* Who to follow */}
      <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden pt-3">
        <h2 className="px-4 pb-2 text-xl font-extrabold text-white">Who to follow</h2>
        
        {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={`https://picsum.photos/id/${50+i}/50/50`} className="w-10 h-10 rounded-full" alt="avatar" />
                    <div>
                        <div className="font-bold text-sm hover:underline">Oracle {i}</div>
                        <div className="text-slate-500 text-xs">@oracle_{i}</div>
                    </div>
                </div>
                <button className="bg-slate-100 text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-200">
                    Follow
                </button>
            </div>
        ))}
      </div>

       <div className="mt-6 text-xs text-slate-500 px-4 leading-relaxed">
          Terms of Service Privacy Policy Cookie Policy Accessibility Ads info More © 2023 SocialBet, Inc.
       </div>
    </div>
  );
};

export default RightPanel;
