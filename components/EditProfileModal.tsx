import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, User, Link as LinkIcon, MapPin, Calendar, Camera, AlertCircle, Check, Crop } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usersApi } from '../services/api';
import { cn } from '../utils';
import ImageCropper from './ImageCropper';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize form data when user data loads
  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || 'Metaverse',
        website: user.website || '',
        twitter: user.twitter || '',
        github: user.github || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user, isOpen]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (profileData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (profileData.bio && profileData.bio.length > 200) {
      newErrors.bio = 'Bio must be less than 200 characters';
    }

    if (profileData.website && !isValidUrl(profileData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (profileData.twitter && !isValidTwitterHandle(profileData.twitter)) {
      newErrors.twitter = 'Please enter a valid Twitter handle (without @)';
    }

    if (profileData.github && !isValidGithubUsername(profileData.github)) {
      newErrors.github = 'Please enter a valid GitHub username';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const isValidTwitterHandle = (handle: string): boolean => {
    return /^[a-zA-Z0-9_]{1,15}$/.test(handle);
  };

  const isValidGithubUsername = (username: string): boolean => {
    return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,38}[a-zA-Z0-9])?$/.test(username);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImage: string) => {
    setAvatarPreview(croppedImage);
    setShowCropper(false);
    setSelectedFile(null);
    
    // Upload cropped image
    if (user?.id && selectedFile) {
      setIsUploading(true);
      try {
        // Convert data URL to blob
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        
        const result = await usersApi.uploadAvatar(user.id, croppedFile);
        if (result.success) {
          setAvatarPreview(result.avatarUrl);
          showToast('Avatar updated successfully!', 'success');
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        showToast('Failed to upload avatar. Using local preview.', 'warning');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please sign in to edit your profile', 'warning');
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    if (!user?.id) {
      showToast('User ID not found. Please sign in again.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update user profile via API
      const profileUpdateData = {
        name: profileData.name.trim(),
        bio: profileData.bio.trim(),
        location: profileData.location.trim(),
        website: profileData.website.trim(),
        twitter: profileData.twitter.trim(),
        github: profileData.github.trim(),
        avatar: avatarPreview,
      };

      const result = await usersApi.updateProfile(user.id, profileUpdateData);
      
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        
        // Update local user state would be handled by AuthContext
        // For now, just close the modal
        onClose();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea] dark:border-[#38383a]">
          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Edit Profile</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] rounded-full transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <Camera size={14} /> Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#0a0a0a]">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={32} className="text-[#86868b] dark:text-[#a1a1a6]" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#ffd700] rounded-full flex items-center justify-center hover:bg-[#ffeb3b] transition-colors duration-200"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin text-[#1d1d1f]" />
                  ) : (
                    <Camera size={12} className="text-[#1d1d1f]" />
                  )}
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                  Upload a new profile picture. JPG, PNG or GIF. Max 5MB.
                </p>
                {avatarPreview && (
                  <p className="text-xs text-[#34c759] mt-1">
                    ✓ Click camera icon to change
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <User size={14} /> Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your name"
              className={cn(
                "w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200",
                errors.name && "border-[#ff3b30] focus:ring-[#ff3b30]"
              )}
              maxLength={50}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-xs text-[#ff3b30]">
                <AlertCircle size={12} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className={cn(
                "w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] resize-none h-20 transition-all duration-200",
                errors.bio && "border-[#ff3b30] focus:ring-[#ff3b30]"
              )}
              maxLength={200}
            />
            {errors.bio && (
              <div className="flex items-center gap-1 text-xs text-[#ff3b30]">
                <AlertCircle size={12} />
                <span>{errors.bio}</span>
              </div>
            )}
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] text-right">
              {profileData.bio.length}/200
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <MapPin size={14} /> Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
              className="w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <LinkIcon size={14} /> Social Links
            </label>
            
            {/* Website */}
            <div className="space-y-2">
              <input
                type="text"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Website URL"
                className={cn(
                  "w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200",
                  errors.website && "border-[#ff3b30] focus:ring-[#ff3b30]"
                )}
              />
              {errors.website && (
                <div className="flex items-center gap-1 text-xs text-[#ff3b30]">
                  <AlertCircle size={12} />
                  <span>{errors.website}</span>
                </div>
              )}
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <input
                type="text"
                value={profileData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="Twitter username (without @)"
                className={cn(
                  "w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200",
                  errors.twitter && "border-[#ff3b30] focus:ring-[#ff3b30]"
                )}
              />
              {errors.twitter && (
                <div className="flex items-center gap-1 text-xs text-[#ff3b30]">
                  <AlertCircle size={12} />
                  <span>{errors.twitter}</span>
                </div>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <input
                type="text"
                value={profileData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="GitHub username"
                className={cn(
                  "w-full bg-[#f5f5f7] dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl p-3 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200",
                  errors.github && "border-[#ff3b30] focus:ring-[#ff3b30]"
                )}
              />
              {errors.github && (
                <div className="flex items-center gap-1 text-xs text-[#ff3b30]">
                  <AlertCircle size={12} />
                  <span>{errors.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Image Cropper Modal
  const renderImageCropper = () => {
    if (!showCropper || !selectedFile) return null;
    
    return (
      <ImageCropper
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        aspectRatio={1}
        circular={true}
      />
    );
  };

  return (
    <>
      {renderImageCropper()}
    </>
  );
};

export default EditProfileModal;
