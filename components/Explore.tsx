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
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-slate-800">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-slate-800">
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 rounded-full leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black border border-slate-800 focus:border-blue-500 transition-all shadow-inner"
            placeholder="Search markets, users, topics..."
          />
        </div>
      </div>

      <div className="p-5 space-y-8">
        
        {/* Categories Grid */}
        <section>
             <h2 className="text-xl font-bold text-white mb-4 px-1">Browse Categories</h2>
             <div className="grid grid-cols-2 gap-3 sm:gap-4">
                 {CATEGORIES.map((cat) => (
                     <div 
                        key={cat.name} 
                        className={`relative overflow-hidden rounded-2xl h-24 sm:h-28 p-5 cursor-pointer group transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${cat.shadow}`}
                     >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                        
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <span className="font-black text-lg text-white tracking-tight drop-shadow-md">{cat.name}</span>
                        </div>
                        
                        <cat.icon className="absolute -bottom-3 -right-3 w-20 h-20 text-white opacity-20 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500" />
                     </div>
                 ))}
             </div>
        </section>

        {/* Trending Section */}
        <section className="bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden backdrop-blur-sm">
             <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <TrendingUp className="text-blue-500 fill-blue-500/20" /> Trending Now
                 </h2>
                 <button className="text-xs font-bold text-blue-500 hover:text-blue-400">View All</button>
             </div>
             <div>
                 {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="px-6 py-4 hover:bg-slate-800/60 cursor-pointer border-b border-slate-800/50 last:border-0 flex items-start gap-4 transition-colors group">
                         <div className="text-slate-600 font-mono text-sm mt-1 font-bold w-4 text-center group-hover:text-blue-500 transition-colors">{i}</div>
                         <div className="flex-1">
                             <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                                 <span className="font-bold text-slate-400 group-hover:text-slate-300">Politics</span> • Trending
                             </div>
                             <div className="font-bold text-slate-200 text-[15px] group-hover:text-blue-400 transition-colors">Election 2024 Scenarios</div>
                             <div className="text-xs text-slate-500 mt-1.5 font-medium bg-slate-800/50 inline-block px-2 py-0.5 rounded">52.4K Bets placed</div>
                         </div>
                         <div className="self-center">
                            <div className="w-8 h-8 rounded-full hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
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