import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="section-padding flex items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-primary-dark" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Create Account</h1>
          <p className="text-text-light mt-2">Join the Sparkpretty family</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-text-light">
            Already have an account? <Link to="/login" className="text-primary-dark font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
