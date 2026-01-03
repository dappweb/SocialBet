import React, { useState, useEffect, memo } from 'react';
import { Gift, Users, Clock, Lock, Share2, Copy, Check, TrendingUp, Calendar, DollarSign, Star, Eye, X } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type {
  RedEnvelope,
  RedEnvelopeClaim,
  CreateRedEnvelopeParams
} from '../services/redEnvelopeService';
import {
  createRedEnvelope,
  getRedEnvelope,
  claimRedEnvelope,
  getRedEnvelopeClaims,
  getUserRedEnvelopeStats,
  getUserCreatedEnvelopes,
  getUserClaimedEnvelopes,
  getTrendingRedEnvelopes,
  copyRedEnvelopeLink,
  generateRedEnvelopeLink,
  RED_ENVELOPE_CONFIG
} from '../services/redEnvelopeService';

const RedEnvelope: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'my-envelopes' | 'claimed' | 'trending'>('trending');
  const [stats, setStats] = useState<any>(null);
  const [createdEnvelopes, setCreatedEnvelopes] = useState<RedEnvelope[]>([]);
  const [claimedEnvelopes, setClaimedEnvelopes] = useState<RedEnvelopeClaim[]>([]);
  const [trendingEnvelopes, setTrendingEnvelopes] = useState<RedEnvelope[]>([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState<RedEnvelope | null>(null);
  const [envelopeClaims, setEnvelopeClaims] = useState<RedEnvelopeClaim[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  // Create form state
  const [formData, setFormData] = useState<CreateRedEnvelopeParams>({
    totalAmount: 100,
    currency: 'SOUL',
    envelopeType: 'random',
    totalSlots: 10,
    message: '',
    isPrivate: false,
    expiresIn: 24,
  });

  // Claim form state
  const [claimPassword, setClaimPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRedEnvelopeData();
    }
  }, [isAuthenticated, user]);

  const loadRedEnvelopeData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const [statsData, createdData, claimedData, trendingData] = await Promise.all([
          getUserRedEnvelopeStats(user.id),
          getUserCreatedEnvelopes(user.id),
          getUserClaimedEnvelopes(user.id),
          getTrendingRedEnvelopes(),
        ]);

        setStats(statsData);
        setCreatedEnvelopes(createdData);
        setClaimedEnvelopes(claimedData);
        setTrendingEnvelopes(trendingData);
      }
    } catch (error) {
      console.error('Failed to load red envelope data:', error);
      showToast('Failed to load red envelope data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnvelope = async () => {
    if (!user) return;

    try {
      const envelope = await createRedEnvelope(user.id, user.name, formData);
      
      showToast('Red envelope created successfully!', 'success');
      setFormData({
        totalAmount: 100,
        currency: 'SOUL',
        envelopeType: 'random',
        totalSlots: 10,
        message: '',
        isPrivate: false,
        expiresIn: 24,
      });
      
      // Reload data
      await loadRedEnvelopeData();
      setActiveTab('my-envelopes');
    } catch (error) {
      console.error('Failed to create red envelope:', error);
      showToast('Failed to create red envelope', 'error');
    }
  };

  const handleClaimEnvelope = async (envelopeId: string) => {
    if (!user) return;

    try {
      setClaiming(true);
      const result = await claimRedEnvelope(
        envelopeId,
        user.id,
        user.name,
        selectedEnvelope?.isPrivate ? claimPassword : undefined
      );
      
      if (result.success) {
        showToast(result.message, 'success');
        
        // Reload data
        await loadRedEnvelopeData();
        
        // Update selected envelope
        if (selectedEnvelope) {
          const updatedEnvelope = await getRedEnvelope(envelopeId);
          setSelectedEnvelope(updatedEnvelope);
          if (updatedEnvelope) {
            const claims = await getRedEnvelopeClaims(envelopeId);
            setEnvelopeClaims(claims);
          }
        }
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to claim red envelope:', error);
      showToast('Failed to claim red envelope', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const handleViewEnvelope = async (envelope: RedEnvelope) => {
    setSelectedEnvelope(envelope);
    const claims = await getRedEnvelopeClaims(envelope.id);
    setEnvelopeClaims(claims);
  };

  const handleCopyLink = async (envelopeId: string) => {
    const success = await copyRedEnvelopeLink(envelopeId);
    if (success) {
      setCopied(true);
      showToast('Red envelope link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#34c759] bg-[#34c759]/10';
      case 'expired':
        return 'text-[#ff9500] bg-[#ff9500]/10';
      case 'empty':
        return 'text-[#86868b] bg-[#86868b]/10';
      default:
        return 'text-[#86868b] bg-[#86868b]/10';
    }
  };

  const getEnvelopeTypeIcon = (type: string) => {
    switch (type) {
      case 'lucky':
        return <Star className="text-[#ffd700]" size={20} />;
      case 'fixed':
        return <DollarSign className="text-[#007AFF]" size={20} />;
      default:
        return <Gift className="text-[#ff9500]" size={20} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
          <Gift size={48} className="mx-auto mb-4 text-[#ffd700]" />
          <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
            Red Envelopes
          </h2>
          <p className="text-[#86868b] mb-6">
            Sign in to create and claim red envelopes with SOUL tokens
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl"></div>
          <div className="h-64 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Red Envelopes (红包)</h1>
            <p className="text-white/90">
              Share joy and SOUL tokens with friends
            </p>
          </div>
          <Gift size={48} className="text-white/80" />
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalCreated || 0}</div>
            <div className="text-sm text-white/80">Created</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
            <div className="text-sm text-white/80">Sent (SOUL)</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalReceived || 0}</div>
            <div className="text-sm text-white/80">Received (SOUL)</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.luckyDraws || 0}</div>
            <div className="text-sm text-white/80">Lucky Draws</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'create'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Gift size={20} />
          Create
        </button>
        <button
          onClick={() => setActiveTab('my-envelopes')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'my-envelopes'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Users size={20} />
          My Envelopes
        </button>
        <button
          onClick={() => setActiveTab('claimed')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'claimed'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Check size={20} />
          Claimed
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'trending'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <TrendingUp size={20} />
          Trending
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-6">
              Create Red Envelope
            </h3>
            
            <div className="space-y-6">
              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    min={RED_ENVELOPE_CONFIG.MIN_AMOUNT}
                    max={RED_ENVELOPE_CONFIG.MAX_AMOUNT}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value as any})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                  >
                    <option value="SOUL">SOUL</option>
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>

              {/* Type and Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Distribution Type
                  </label>
                  <select
                    value={formData.envelopeType}
                    onChange={(e) => setFormData({...formData, envelopeType: e.target.value as any})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                  >
                    <option value="random">Random</option>
                    <option value="fixed">Fixed</option>
                    <option value="lucky">Lucky Draw</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Number of Slots
                  </label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({...formData, totalSlots: Number(e.target.value)})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    min={RED_ENVELOPE_CONFIG.MIN_SLOTS}
                    max={RED_ENVELOPE_CONFIG.MAX_SLOTS}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                  rows={3}
                  placeholder="Add a personal message..."
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                    className="w-4 h-4 text-[#ffd700] border-[#e5e5ea] dark:border-[#2c2c2e] rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-[#1d1d1f] dark:text-white">
                    Private envelope (requires password)
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Expires in (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.expiresIn}
                    onChange={(e) => setFormData({...formData, expiresIn: Number(e.target.value)})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    min={1}
                    max={RED_ENVELOPE_CONFIG.MAX_EXPIRY_HOURS}
                  />
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateEnvelope}
                className="w-full py-4 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-colors"
              >
                Create Red Envelope
              </button>
            </div>
          </div>
        )}

        {activeTab === 'my-envelopes' && (
          <div className="space-y-4">
            {createdEnvelopes.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Gift size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Envelopes Created
                </h3>
                <p className="text-[#86868b]">
                  Create your first red envelope to share with friends!
                </p>
              </div>
            ) : (
              createdEnvelopes.map((envelope) => (
                <div
                  key={envelope.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#2c2c2e]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getEnvelopeTypeIcon(envelope.envelopeType)}
                      <div>
                        <div className="font-semibold text-[#1d1d1f] dark:text-white">
                          {envelope.totalAmount} {envelope.currency}
                        </div>
                        <div className="text-sm text-[#86868b]">
                          {envelope.remainingSlots}/{envelope.totalSlots} slots remaining
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getStatusColor(envelope.status)
                      )}>
                        {envelope.status}
                      </span>
                      {envelope.isPrivate && <Lock size={16} className="text-[#86868b]" />}
                    </div>
                  </div>
                  
                  {envelope.message && (
                    <div className="mb-4 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <p className="text-sm text-[#1d1d1f] dark:text-white">{envelope.message}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[#86868b]">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(envelope.expiresAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {envelope.totalSlots - envelope.remainingSlots} claimed
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewEnvelope(envelope)}
                        className="px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-lg font-medium hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCopyLink(envelope.id)}
                        className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors"
                      >
                        {copied ? 'Copied!' : 'Share'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'claimed' && (
          <div className="space-y-4">
            {claimedEnvelopes.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Check size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Claims Yet
                </h3>
                <p className="text-[#86868b]">
                  Claim red envelopes from friends to earn SOUL tokens!
                </p>
              </div>
            ) : (
              claimedEnvelopes.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {claim.amount.toFixed(2)} SOUL
                      </div>
                      <div className="text-sm text-[#86868b]">
                        Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {claim.isLucky && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">
                        <Star size={12} />
                        Lucky
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="space-y-4">
            {trendingEnvelopes.map((envelope) => (
              <div
                key={envelope.id}
                className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] font-bold">
                      {envelope.creatorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {envelope.creatorName}
                      </div>
                      <div className="text-sm text-[#86868b]">
                        Created {new Date(envelope.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#ffd700] text-lg">
                      {envelope.totalAmount} {envelope.currency}
                    </div>
                    <div className="text-sm text-[#86868b]">
                      {envelope.remainingSlots}/{envelope.totalSlots} left
                    </div>
                  </div>
                </div>
                
                {envelope.message && (
                  <div className="mb-4 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <p className="text-sm text-[#1d1d1f] dark:text-white">{envelope.message}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEnvelopeTypeIcon(envelope.envelopeType)}
                    <span className="text-sm text-[#86868b] capitalize">
                      {envelope.envelopeType}
                    </span>
                    {envelope.isPrivate && <Lock size={14} className="text-[#86868b]" />}
                  </div>
                  <button
                    onClick={() => handleViewEnvelope(envelope)}
                    className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Envelope Detail Modal */}
      {selectedEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEnvelope(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Red Envelope</h3>
                <button
                  onClick={() => setSelectedEnvelope(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {selectedEnvelope.totalAmount} {selectedEnvelope.currency}
                </div>
                <div className="text-white/80">
                  {selectedEnvelope.remainingSlots}/{selectedEnvelope.totalSlots} slots remaining
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {selectedEnvelope.message && (
                <div className="mb-4 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                  <p className="text-sm text-[#1d1d1f] dark:text-white">{selectedEnvelope.message}</p>
                </div>
              )}
              
              {selectedEnvelope.isPrivate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Password Required
                  </label>
                  <input
                    type="password"
                    value={claimPassword}
                    onChange={(e) => setClaimPassword(e.target.value)}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    placeholder="Enter password..."
                  />
                </div>
              )}
              
              <button
                onClick={() => handleClaimEnvelope(selectedEnvelope.id)}
                disabled={claiming || selectedEnvelope.remainingSlots === 0}
                className="w-full py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? 'Claiming...' : 'Claim Red Envelope'}
              </button>
              
              {/* Claims List */}
              {envelopeClaims.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-3">Recent Claims</h4>
                  <div className="space-y-2">
                    {envelopeClaims.slice(0, 5).map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] text-xs font-bold">
                            {claim.claimerName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#1d1d1f] dark:text-white">
                              {claim.claimerName}
                            </div>
                            <div className="text-xs text-[#86868b]">
                              {claim.isLucky && '🎉 Lucky!'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-[#ffd700]">
                          {claim.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

RedEnvelope.displayName = 'RedEnvelope';

export default RedEnvelope;
