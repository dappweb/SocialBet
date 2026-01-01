import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { PredictionMarket } from '../types';
import { cn } from '../utils';

interface MarketSearchProps {
  markets: PredictionMarket[];
  onSelectMarket: (market: PredictionMarket) => void;
  onClose: () => void;
}

const MarketSearch: React.FC<MarketSearchProps> = ({ markets, onSelectMarket, onClose }) => {
  const [query, setQuery] = useState('');

  const filteredMarkets = markets.filter(market =>
    market.question.toLowerCase().includes(query.toLowerCase()) ||
    market.category.toLowerCase().includes(query.toLowerCase()) ||
    (typeof market.creator === 'object' && 'name' in market.creator && 
     market.creator.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl mx-auto mt-20 bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Search className="text-[#ffd700]" size={20} />
            Search Markets
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-[#e5e5ea]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#86868b]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 rounded-xl leading-5 bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white border border-[#e5e5ea] focus:border-[#ffd700] transition-all duration-200"
              placeholder="Search by question, category, or creator..."
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-[#86868b]">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Start typing to search markets...</p>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="p-8 text-center text-[#86868b]">
              <p>No markets found matching "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e5ea]">
              {filteredMarkets.map((market) => (
                <button
                  key={market.id}
                  onClick={() => {
                    onSelectMarket(market);
                    onClose();
                  }}
                  className="w-full p-4 text-left hover:bg-[#f5f5f7] transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#ffd700] bg-[#fff9e6] px-2 py-0.5 rounded">
                          {market.category}
                        </span>
                        {market.isHot && (
                          <span className="text-xs font-semibold text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded">
                            Hot
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#1d1d1f] line-clamp-2 mb-2">
                        {market.question}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#86868b]">
                        <span>YES: {market.outcomeStats.yesPercent}%</span>
                        <span>NO: {market.outcomeStats.noPercent}%</span>
                        <span>${market.poolSize.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketSearch;

