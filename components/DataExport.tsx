import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Users, TrendingUp, Shield, Check, X, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usersApi } from '../services/api';
import { cn } from '../utils';

interface DataExportProps {
  onBack?: () => void;
}

interface ExportRequest {
  format: 'json' | 'csv' | 'pdf';
  dataTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  includeSensitive: boolean;
}

const DataExport: React.FC<DataExportProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    format: 'json',
    dataTypes: ['profile', 'bets', 'achievements'],
    dateRange: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    includeSensitive: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    format: string;
    dataTypes: string[];
    createdAt: string;
    status: 'pending' | 'completed' | 'failed';
    downloadUrl?: string;
  }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load export history
  useEffect(() => {
    const loadExportHistory = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        // Mock export history - in production, this would come from API
        const mockHistory = [
          {
            id: '1',
            format: 'json',
            dataTypes: ['profile', 'bets'],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const,
            downloadUrl: '#',
          },
          {
            id: '2',
            format: 'csv',
            dataTypes: ['bets'],
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const,
            downloadUrl: '#',
          },
        ];
        setExportHistory(mockHistory);
      } catch (error) {
        console.error('Failed to load export history:', error);
      }
    };

    loadExportHistory();
  }, [isAuthenticated, user?.id]);

  // Handle export generation
  const handleGenerateExport = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    setIsGenerating(true);
    try {
      // Add to export history
      const newExport = {
        id: Date.now().toString(),
        format: exportRequest.format,
        dataTypes: exportRequest.dataTypes,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      };
      
      setExportHistory(prev => [newExport, ...prev]);
      
      // Simulate export generation
      setTimeout(() => {
        setExportHistory(prev => 
          prev.map(item => 
            item.id === newExport.id 
              ? { ...item, status: 'completed' as const, downloadUrl: '#' }
              : item
          )
        );
        setIsGenerating(false);
        showToast('Export generated successfully!', 'success');
      }, 3000);
      
      // In production, this would call the actual API
      // const result = await usersApi.exportData(user.id, exportRequest);
      
    } catch (error) {
      console.error('Failed to generate export:', error);
      showToast('Failed to generate export. Please try again.', 'error');
      setIsGenerating(false);
    }
  };

  // Handle download
  const handleDownload = (exportItem: any) => {
    if (exportItem.downloadUrl === '#') {
      // Generate mock data for demo
      const mockData = {
        user: {
          id: user?.id,
          name: user?.name,
          handle: user?.handle,
          email: user?.email,
          createdAt: user?.joinedAt,
        },
        exportInfo: {
          format: exportItem.format,
          dataTypes: exportItem.dataTypes,
          exportedAt: new Date().toISOString(),
        },
        data: {
          profile: {
            name: user?.name,
            bio: user?.bio,
            location: user?.location,
            website: user?.website,
            social: {
              twitter: user?.twitter,
              github: user?.github,
            },
          },
          stats: {
            totalBets: 42,
            totalMarkets: 5,
            accuracy: 0.75,
            followersCount: user?.followersCount,
            followingCount: user?.followingCount,
          },
        },
      };
      
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `socialbet-export-${new Date().toISOString().split('T')[0]}.${exportItem.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Download started!', 'success');
    }
  };

  // Data type options
  const dataTypeOptions = [
    { id: 'profile', label: 'Profile Information', icon: Users, description: 'Your basic profile data' },
    { id: 'bets', label: 'Betting History', icon: TrendingUp, description: 'All your past bets and predictions' },
    { id: 'achievements', label: 'Achievements', icon: Shield, description: 'Your unlocked achievements and progress' },
    { id: 'messages', label: 'Messages', icon: FileText, description: 'Your private messages (if enabled)' },
    { id: 'transactions', label: 'Transactions', icon: Calendar, description: 'Financial transactions and token history' },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white flex items-center justify-center">
        <div className="text-center">
          <Download size={48} className="text-[#86868b] dark:text-[#a1a1a6] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-[#86868b] dark:text-[#a1a1a6]">
            Please sign in to export your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] shadow-sm">
        <button onClick={() => onBack?.()} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
          <Download size={20} className="text-[#86868b]" />
        </button>
        <div>
          <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f]">Data Export</h1>
          <p className="text-xs text-[#86868b]">
            Download your personal data
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Export Form */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4">Create New Export</h2>
          
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-[#1d1d1f] dark:text-white mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'json', label: 'JSON', description: 'Machine-readable format' },
                { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                { value: 'pdf', label: 'PDF', description: 'Human-readable report' },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportRequest(prev => ({ ...prev, format: format.value as any }))}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all duration-200',
                    exportRequest.format === format.value
                      ? 'border-[#ffd700] bg-[#ffd700]/10'
                      : 'border-[#e5e5ea] dark:border-[#38383a] hover:border-[#c7c7cc] dark:hover:border-[#636366]'
                  )}
                >
                  <div className="font-medium text-[#1d1d1f] dark:text-white">{format.label}</div>
                  <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Data Types */}
          <div className="mb-6">
            <h3 className="font-medium text-[#1d1d1f] dark:text-white mb-3">Data to Export</h3>
            <div className="space-y-2">
              {dataTypeOptions.map((type) => (
                <label key={type.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={exportRequest.dataTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExportRequest(prev => ({ ...prev, dataTypes: [...prev.dataTypes, type.id] }));
                      } else {
                        setExportRequest(prev => ({ ...prev, dataTypes: prev.dataTypes.filter(id => id !== type.id) }));
                      }
                    }}
                    className="w-4 h-4 text-[#ffd700] border-[#e5e5ea] dark:border-[#38383a] rounded focus:ring-[#ffd700]"
                  />
                  <type.icon size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
                  <div className="flex-1">
                    <div className="font-medium text-[#1d1d1f] dark:text-white">{type.label}</div>
                    <div className="text-sm text-[#86868b] dark:text-[#a1a1a6]">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h3 className="font-medium text-[#1d1d1f] dark:text-white mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#86868b] dark:text-[#a1a1a6] mb-1">From</label>
                <input
                  type="date"
                  value={exportRequest.dateRange.start}
                  onChange={(e) => setExportRequest(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#86868b] dark:text-[#a1a1a6] mb-1">To</label>
                <input
                  type="date"
                  value={exportRequest.dateRange.end}
                  onChange={(e) => setExportRequest(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                />
              </div>
            </div>
          </div>

          {/* Privacy Warning */}
          <div className="mb-6 p-4 bg-[#fff9e6] dark:bg-[#1c1c1e] border border-[#ffd700]/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-[#ff9500] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1d1d1f] dark:text-white">Privacy Notice</h4>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">
                  Your exported data contains personal information. Keep it secure and only share with trusted services.
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateExport}
            disabled={isGenerating || exportRequest.dataTypes.length === 0}
            className={cn(
              'w-full py-3 px-4 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-md shadow-[#ffd700]/20 active:scale-[0.97] flex items-center justify-center gap-2',
              (isGenerating || exportRequest.dataTypes.length === 0) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Download size={16} />
                Generate Export
              </>
            )}
          </button>
        </div>

        {/* Export History */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4">Export History</h2>
          
          {exportHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="text-[#86868b] dark:text-[#a1a1a6] mx-auto mb-4" />
              <p className="text-[#86868b] dark:text-[#a1a1a6]">No exports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exportHistory.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      exportItem.status === 'completed' ? 'bg-[#34c759]' : 
                      exportItem.status === 'pending' ? 'bg-[#ffd700]' : 'bg-[#ff3b30]'
                    )}>
                      {exportItem.status === 'completed' ? (
                        <Check size={16} className="text-white" />
                      ) : exportItem.status === 'pending' ? (
                        <Clock size={16} className="text-white" />
                      ) : (
                        <X size={16} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#1d1d1f] dark:text-white">
                        {exportItem.format.toUpperCase()} Export
                      </div>
                      <div className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                        {exportItem.dataTypes.join(', ')} • {new Date(exportItem.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {exportItem.status === 'completed' && (
                    <button
                      onClick={() => handleDownload(exportItem)}
                      className="px-4 py-2 bg-[#ffd700] text-[#1d1d1f] rounded-xl font-medium hover:bg-[#ffeb3b] transition-colors duration-200"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExport;
