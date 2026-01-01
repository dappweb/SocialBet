import React from 'react';
import { Search, Hash, TrendingUp, Music, Trophy, Coins, Monitor, Globe, Star } from 'lucide-react';

const CATEGORIES = [
  { name: 'Crypto', icon: Coins, gradient: 'from-orange-600 to-orange-400', shadow: 'shadow-orange-500/20' },
  { name: 'Sports', icon: Trophy, gradient: 'from-emerald-600 to-emerald-400', shadow: 'shadow-emerald-500/20' },
  { name: 'Pop Culture', icon: Music, gradient: 'from-pink-600 to-pink-400', shadow: 'shadow-pink-500/20' },
  { name: 'Tech', icon: Monitor, gradient: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/20' },
  { name: 'Politics', icon: Globe, gradient: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/20' },
  { name: 'Featured', icon: Star, gradient: 'from-yellow-500 to-amber-300', shadow: 'shadow-yellow-500/20' },
];

const Explore = () => {
  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 py-3 border-b border-[#e5e5ea] shadow-sm">
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#86868b] group-focus-within:text-[#ffd700] transition-colors duration-200" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 rounded-xl leading-5 bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white border border-[#e5e5ea] focus:border-[#ffd700] transition-all duration-200 shadow-sm"
            placeholder="Search markets, users, topics..."
          />
        </div>
      </div>

      <div className="p-5 space-y-8">
        
        {/* Categories Grid */}
        <section>
             <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4 px-1">Browse Categories</h2>
             <div className="grid grid-cols-2 gap-3 sm:gap-4">
                 {CATEGORIES.map((cat) => (
                     <div 
                        key={cat.name} 
                        className="relative overflow-hidden rounded-2xl h-24 sm:h-28 p-5 cursor-pointer group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md bg-white border border-[#e5e5ea]"
                     >
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <span className="font-semibold text-lg text-[#1d1d1f] tracking-tight">{cat.name}</span>
                        </div>
                        
                        <cat.icon className="absolute -bottom-3 -right-3 w-20 h-20 text-[#ffd700] opacity-20 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300" />
                     </div>
                 ))}
             </div>
        </section>

        {/* Trending Section */}
        <section className="bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden shadow-sm">
             <div className="px-6 py-4 border-b border-[#e5e5ea] bg-[#f5f5f7] flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                     <TrendingUp className="text-[#ffd700]" /> Trending Now
                 </h2>
                 <button className="text-xs font-semibold text-[#ffd700] hover:text-[#ffc107] transition-colors duration-200">View All</button>
             </div>
             <div>
                 {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="px-6 py-4 hover:bg-[#f5f5f7] cursor-pointer border-b border-[#e5e5ea] last:border-0 flex items-start gap-4 transition-colors duration-200 group">
                         <div className="text-[#86868b] font-mono text-sm mt-1 font-semibold w-4 text-center group-hover:text-[#ffd700] transition-colors duration-200">{i}</div>
                         <div className="flex-1">
                             <div className="flex items-center gap-2 text-[11px] text-[#86868b] mb-1">
                                 <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ffd700] transition-colors duration-200">Politics</span> • Trending
                             </div>
                             <div className="font-semibold text-[#1d1d1f] text-[15px] group-hover:text-[#ffd700] transition-colors duration-200">Election 2024 Scenarios</div>
                             <div className="text-xs text-[#86868b] mt-1.5 font-medium bg-[#f5f5f7] inline-block px-2 py-0.5 rounded-lg">52.4K Bets placed</div>
                         </div>
                         <div className="self-center">
                            <div className="w-8 h-8 rounded-full hover:bg-[#fff9e6] flex items-center justify-center text-[#86868b] hover:text-[#ffd700] transition-all duration-200">
                                <TrendingUp size={16} />
                            </div>
                         </div>
                     </div>
                 ))}
             </div>
        </section>

      </div>
    </div>
  );
};

export default Explore;