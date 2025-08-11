import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function LoginForm({ role, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use the signIn method from AuthContext
    const result = await signIn(formData.email, formData.password);
    
    // Check if the sign-in was successful before redirecting
    if (result.success && result.user) {
      // Redirect based on role
      switch (role) {
        case 'candidate':
          router.push('/candidate/dashboard');
          break;
        case 'recruiter':
          router.push('/recruiter/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/');
      }
    } else {
      // Directly set the error state from the result to display it in the UI
      const errorMessage = result.error?.message || 'Invalid login credentials.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'candidate':
        return {
          title: 'Candidate Login',
          color: 'from-green-500 to-emerald-600',
          bgColor: 'from-green-50 to-emerald-50'
        };
      case 'recruiter':
        return {
          title: 'AR Recruiter Login',
          color: 'from-purple-500 to-indigo-600',
          bgColor: 'from-purple-50 to-indigo-50'
        };
      case 'admin':
        return {
          title: 'Admin Login',
          color: 'from-red-500 to-pink-600',
          bgColor: 'from-red-50 to-pink-50'
        };
      default:
        return {
          title: 'Login',
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'from-blue-50 to-indigo-50'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card">
          <div className="mb-8 text-center">
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-2`}>
              {config.title}
            </h1>
            <p className="text-gray-600">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 input-field"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {role === 'candidate' && onSwitchToSignup && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Sign up here
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
