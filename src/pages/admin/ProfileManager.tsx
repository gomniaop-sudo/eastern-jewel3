/**
 * Admin Profile Manager Page
 */

import { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, Lock, Shield, Calendar, Clock, KeyRound, AlertCircle, Save, RotateCcw, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { Notification } from '../../components/admin';

interface ProfileFormData {
  full_name: string;
  username: string;
  avatar_url: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailFormData {
  newEmail: string;
}

type ActiveSection = 'profile' | 'email' | 'password' | 'security';

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Very Strong', color: 'bg-gold-500' };
};

export function ProfileManager() {
  const { user, session, refreshSession } = useAuth();

  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    username: '',
    avatar_url: '',
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileFormData>({
    full_name: '',
    username: '',
    avatar_url: '',
  });

  const [emailData, setEmailData] = useState<EmailFormData>({ newEmail: '' });
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; color: string } | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      const profile = {
        full_name: metadata.full_name || '',
        username: metadata.username || user.email?.split('@')[0] || '',
        avatar_url: metadata.avatar_url || '',
      };
      setProfileData(profile);
      setOriginalProfileData(profile);
    }
  }, [user]);

  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordStrength(getPasswordStrength(passwordData.newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [passwordData.newPassword]);

  const profileHasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

  const clearNotification = useCallback(() => setNotification(null), []);

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};
    if (!profileData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    if (profileData.avatar_url && !/^https?:\/\/.+/.test(profileData.avatar_url)) {
      errors.avatar_url = 'Please enter a valid URL';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmail = (): boolean => {
    const errors: Record<string, string> = {};
    if (!emailData.newEmail) {
      errors.newEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.newEmail)) {
      errors.newEmail = 'Please enter a valid email address';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const { error } = await authService.updateProfile({
        full_name: profileData.full_name,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
      });

      if (error) {
        setNotification({ message: error.message || 'Failed to update profile', type: 'error' });
      } else {
        setNotification({ message: 'Profile updated successfully', type: 'success' });
        setOriginalProfileData(profileData);
        await refreshSession();
      }
    } catch (err) {
      setNotification({ message: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = () => {
    setProfileData(originalProfileData);
    setValidationErrors({});
    setNotification({ message: 'Changes discarded', type: 'info' });
  };

  const handleChangeEmail = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error } = await authService.changeEmail(emailData.newEmail);

      if (error) {
        setNotification({ message: error.message || 'Failed to initiate email change', type: 'error' });
      } else {
        setNotification({ message: 'Confirmation email sent. Please check your inbox.', type: 'success' });
        setEmailData({ newEmail: '' });
        setShowEmailForm(false);
      }
    } catch (err) {
      setNotification({ message: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const { error: verifyError } = await authService.verifyPassword(passwordData.currentPassword);
      if (verifyError) {
        setValidationErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      const { error } = await authService.updatePassword(passwordData.newPassword);

      if (error) {
        setNotification({ message: error.message || 'Failed to update password', type: 'error' });
      } else {
        setNotification({ message: 'Password updated successfully', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setPasswordStrength(null);
      }
    } catch (err) {
      setNotification({ message: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await authService.resetPassword(user.email);

      if (error) {
        setNotification({ message: error.message || 'Failed to send reset email', type: 'error' });
      } else {
        setNotification({ message: 'Password reset email sent', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const authProvider = user?.app_metadata?.provider || 'email';
  const lastSignIn = user?.last_sign_in_at;
  const createdAt = user?.created_at;

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
      )}

      <div>
        <h2 className="text-xl font-display text-white">Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your administrator account</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-64 flex-shrink-0">
          <div className="bg-luxury-black border border-luxury-light/20 rounded-sm overflow-hidden">
            <div className="p-4 border-b border-luxury-light/20 flex items-center gap-3">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border border-gold-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                  <User className="w-6 h-6 text-gold-500" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{profileData.full_name || 'Administrator'}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <ul className="divide-y divide-luxury-light/10">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500'
                          : 'text-gray-400 hover:text-white hover:bg-luxury-light/10'
                      }`}
                    >
                      <section.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === 'profile' && (
            <div className="bg-luxury-black border border-luxury-light/20 rounded-sm">
              <div className="p-4 border-b border-luxury-light/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-gold-500/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display text-white">Profile Information</h3>
                    <p className="text-gray-500 text-sm">Update your personal details</p>
                  </div>
                </div>
                {profileHasChanges && (
                  <span className="text-xs text-gold-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gold-500/30"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-luxury-light/10 flex items-center justify-center border-2 border-luxury-light/20">
                        <User className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-300">Avatar URL</label>
                    <input
                      type="url"
                      value={profileData.avatar_url}
                      onChange={(e) => handleProfileChange('avatar_url', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                        validationErrors.avatar_url ? 'border-red-500' : 'border-luxury-light/20'
                      }`}
                    />
                    {validationErrors.avatar_url && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors.avatar_url}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">Enter a URL for your profile picture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => handleProfileChange('full_name', e.target.value)}
                      placeholder="Your full name"
                      className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                        validationErrors.full_name ? 'border-red-500' : 'border-luxury-light/20'
                      }`}
                    />
                    {validationErrors.full_name && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => handleProfileChange('username', e.target.value)}
                      placeholder="username"
                      className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                        validationErrors.username ? 'border-red-500' : 'border-luxury-light/20'
                      }`}
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors.username}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-luxury-light/10">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading || !profileHasChanges}
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleResetProfile}
                    disabled={!profileHasChanges}
                    className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'email' && (
            <div className="bg-luxury-black border border-luxury-light/20 rounded-sm">
              <div className="p-4 border-b border-luxury-light/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-lg font-display text-white">Email Address</h3>
                  <p className="text-gray-500 text-sm">Manage your email address</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-luxury-light/10 rounded-sm">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  {user?.email_confirmed_at && (
                    <span className="ml-auto text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-sm">
                      Verified
                    </span>
                  )}
                </div>

                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Change Email
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div>
                      <label className="text-sm font-medium text-gray-300">New Email Address</label>
                      <input
                        type="email"
                        value={emailData.newEmail}
                        onChange={(e) => {
                          setEmailData({ newEmail: e.target.value });
                          setValidationErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.newEmail;
                            return updated;
                          });
                        }}
                        placeholder="new@email.com"
                        className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                          validationErrors.newEmail ? 'border-red-500' : 'border-luxury-light/20'
                        }`}
                      />
                      {validationErrors.newEmail && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.newEmail}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      A confirmation email will be sent to verify the new address.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Confirmation'}
                      </button>
                      <button
                        onClick={() => {
                          setShowEmailForm(false);
                          setEmailData({ newEmail: '' });
                          setValidationErrors({});
                        }}
                        className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="bg-luxury-black border border-luxury-light/20 rounded-sm">
              <div className="p-4 border-b border-luxury-light/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-lg font-display text-white">Password</h3>
                  <p className="text-gray-500 text-sm">Update your password</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-luxury-light/10 rounded-sm">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Password Status</p>
                    <p className="text-white font-medium">Password protected</p>
                  </div>
                </div>

                {!showPasswordForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                    <button
                      onClick={handleSendPasswordReset}
                      disabled={loading}
                      className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                        className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                          validationErrors.currentPassword ? 'border-red-500' : 'border-luxury-light/20'
                        }`}
                      />
                      {validationErrors.currentPassword && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                        className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                          validationErrors.newPassword ? 'border-red-500' : 'border-luxury-light/20'
                        }`}
                      />
                      {validationErrors.newPassword && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.newPassword}</p>
                      )}

                      {passwordStrength && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-luxury-light/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${passwordStrength.color} transition-all`}
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                          </div>
                          <ul className="mt-2 text-xs text-gray-500 space-y-1">
                            <li className={passwordData.newPassword.length >= 8 ? 'text-green-400' : ''}>
                              At least 8 characters
                            </li>
                            <li className={/[a-z]/.test(passwordData.newPassword) && /[A-Z]/.test(passwordData.newPassword) ? 'text-green-400' : ''}>
                              Upper and lowercase letters
                            </li>
                            <li className={/\d/.test(passwordData.newPassword) ? 'text-green-400' : ''}>
                              At least one number
                            </li>
                            <li className={/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? 'text-green-400' : ''}>
                              At least one special character
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        className={`w-full px-3 py-2 mt-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-colors ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-luxury-light/20'
                        }`}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordStrength(null);
                          setValidationErrors({});
                        }}
                        className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-luxury-black border border-luxury-light/20 rounded-sm">
              <div className="p-4 border-b border-luxury-light/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-lg font-display text-white">Security Information</h3>
                  <p className="text-gray-500 text-sm">Your account security details</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Account Created</span>
                    </div>
                    <p className="text-white font-medium mt-2">{formatDate(createdAt)}</p>
                  </div>

                  <div className="p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Last Sign In</span>
                    </div>
                    <p className="text-white font-medium mt-2">{formatDate(lastSignIn)}</p>
                  </div>

                  <div className="p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Auth Provider</span>
                    </div>
                    <p className="text-white font-medium mt-2 capitalize">{authProvider}</p>
                  </div>

                  <div className="p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <KeyRound className="w-4 h-4" />
                      <span>Email Verified</span>
                    </div>
                    <p className="text-white font-medium mt-2">
                      {user?.email_confirmed_at ? 'Yes' : 'Pending'}
                    </p>
                  </div>
                </div>

                {session && (
                  <div className="p-4 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <KeyRound className="w-4 h-4" />
                      <span>Current Session</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Session ID</p>
                        <p className="text-gray-300 font-mono truncate">{session.access_token.slice(0, 20)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="text-gray-300">{formatDate(new Date((session.expires_at || 0) * 1000).toISOString())}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileManager;
