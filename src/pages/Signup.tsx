
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync user profile to Firestore safely without failing the auth session if Firestore errors
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const deviceInfo = {
            userAgent: navigator.userAgent || '',
            platform: navigator.platform || '',
            language: navigator.language || '',
            screenResolution: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : 'unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          };

          await setDoc(userDocRef, {
            uid: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'user',
            createdAt: serverTimestamp(),
            deviceInfo,
            signInMethod: 'google',
          }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore profile sync warning (auth succeeded):', firestoreErr);
      }

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Google sign-up error details:', error);
      let errorMsg = error.message || "Failed to sign up with Google";

      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "This domain is not authorized in Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized domains and add your current domain/IP.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = "Sign-in popup was closed before completing.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = "Popup was blocked by your browser. Please enable popups for this site.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg = "Google Sign-In is not enabled in Firebase Console > Authentication > Sign-in method.";
      }

      toast({
        title: "Google Sign-up Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with username
      await updateProfile(user, {
        displayName: username
      });

      // Get user's device and location information for analytics
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      };

      // Store user data in Firestore with enhanced analytics data
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        role: 'user', // Default role for new users
        status: 'active', // Default status
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        deviceInfo: JSON.stringify(deviceInfo),
        signupSource: 'website',
        signupPage: window.location.pathname,
        referrer: document.referrer || 'direct'
      });

      toast({
        title: "Account created successfully!",
        description: "Welcome to Devi Real Estates",
      });
      
      // Check if there's a redirect location from contact owner attempt
      const from = location.state?.from || location.state?.returnTo || '/';
      const redirectData = location.state;
      
      // If user was trying to contact owner, show success message and redirect
      if (redirectData?.action === 'contact') {
        toast({
          title: "Account created! You can now contact the property owner",
          description: "Welcome to Devi Real Estates",
        });
      }
      
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = "Failed to create account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <img 
            src="/dre-logo.png" 
            alt="DRE Logo" 
            className="h-8 w-auto mx-auto mb-4"
          />
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Account</h1>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Join us to find your dream property</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-sm rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 mt-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Or Sign up with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Google</span>
          </button>

          {/* Login Link */}
          <div className="text-center mt-5">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-medium hover:underline" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
