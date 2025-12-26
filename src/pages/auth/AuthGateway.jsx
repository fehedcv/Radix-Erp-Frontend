import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ShieldCheck,
  Layers,
  Wallet
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const AuthGateway = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const infoSideRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // Floating animation
  useEffect(() => {
    if (infoSideRef.current) {
      gsap.to(".floating-node", {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.2
      });
    }
  }, []);

  // ✅ LOGIN + WHOAMI (AUTHORITATIVE FLOW)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      // 1️⃣ LOGIN (FORM-ENCODED — REQUIRED BY FRAPPE)
      await frappeApi.post(
        '/method/login',
        new URLSearchParams({
          usr: email,
          pwd: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // 2️⃣ WHO AM I? (BACKEND AUTHORITY)
      const res = await frappeApi.get(
        '/method/business_chain.api.api.whoami'
      );

      const { user, primary_role, roles } = res.data.message;

      if (!primary_role) {
        throw new Error("ROLE_NOT_ASSIGNED");
      }

      const userData = {
        email: user,
        role: primary_role,
        roles,
      };

      // Optional: cache for UX only (NOT authority)
      localStorage.setItem('vynx_user', JSON.stringify(userData));

      // 3️⃣ ROUTE BASED ON BACKEND DECISION
      if (primary_role === 'agent') {
        navigate('/agent');
      } else if (primary_role === 'business') {
        navigate('/business');
      } else if (primary_role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/unauthorized');
      }

      onLoginSuccess(userData);

    } catch (err) {
      console.error(err);
      setError("INVALID_CREDENTIALS_OR_ROLE");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-[#F8FAFC] flex font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">

      {/* LEFT PANEL */}
      <div
        ref={infoSideRef}
        className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col justify-center px-20 text-white overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              `linear-gradient(#fff 1px, transparent 1px),
               linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <span className="text-xl font-bold uppercase">
              Radix<span className="text-indigo-400">Chain</span>
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            The Business Chain <br />
            <span className="text-indigo-400 italic">Infrastructure.</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-md mb-12">
            Authorized access to the unified ledger for agents,
            business units, and headquarters.
          </p>

          <div className="space-y-4">
            <div className="floating-node w-64 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Standard Rate</p>
                <p className="text-sm font-bold">1.00 INR / Credit</p>
              </div>
            </div>

            <div className="floating-node w-72 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 ml-12">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Security</p>
                <p className="text-sm font-bold">Frappe Session Auth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-8">

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400"
          >
            <ChevronLeft size={14} /> Back
          </Link>

          <header>
            <h2 className="text-3xl font-bold text-[#0F172A]">
              Partner Login
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access your dashboard.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              name="email"
              required
              placeholder="name@company.com"
              className="w-full border px-4 py-3 rounded-xl"
            />

            <div className="relative">
              <input
                name="password"
                required
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border px-4 py-3 rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-xs flex gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold flex justify-center"
            >
              {isLoading
                ? <Loader2 className="animate-spin" />
                : "LOGIN"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
