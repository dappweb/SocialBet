import React from 'react';
import { Sparkles } from 'lucide-react';
import { PredictionMarket } from '../types';

interface AIPredictionBadgeProps {
  market: PredictionMarket;
}

const AIPredictionBadge: React.FC<AIPredictionBadgeProps> = ({ market }) => {
  if (!market.isAiGenerated && !market.aiPrediction) {
    return null;
  }

  const confidence = market.aiPrediction?.confidence || 0;
  const recommendedPosition = market.aiPrediction?.recommendedPosition;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 text-[11px] font-semibold text-[#ffc107] mb-2 tracking-wide shadow-sm">
      <Sparkles size={12} strokeWidth={2.5} />
      <span>AI {recommendedPosition}</span>
      <span className="text-[#ffd700]">{confidence}%</span>
    </div>
  );
};

export default AIPredictionBadge;

