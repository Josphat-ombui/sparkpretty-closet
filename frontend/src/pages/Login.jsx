import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      fetchCart();
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="section-padding flex items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} className="text-primary-dark" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Welcome Back</h1>
          <p className="text-text-light mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-text-light">
            Don't have an account? <Link to="/register" className="text-primary-dark font-semibold hover:underline">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
