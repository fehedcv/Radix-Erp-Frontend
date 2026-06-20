import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  width: 'min(520px, 92%)',
  background: '#fff',
  borderRadius: 12,
  padding: '24px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  color: '#111',
};

const titleStyle = { fontSize: 20, fontWeight: 700, marginBottom: 8 };
const messageStyle = { marginBottom: 18, color: '#444' };
const actionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8 };

export default function WelcomeModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('complete_first_login');
      if (error) {
        console.error('complete_first_login rpc error', error);
      }
    } catch (err) {
      console.error('complete_first_login failed', err);
    } finally {
      setLoading(false);
      try { onClose(); } catch {} // ensure closing even if onClose throws
    }
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <div style={titleStyle}>Welcome to Radix ERP 🎉</div>
        <div style={messageStyle}>
          We're excited to have you here. Explore the platform, manage your leads, and grow your business with us.
        </div>
        <div style={actionsStyle}>
          <button
            onClick={handleGetStarted}
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#0b74ff',
              color: '#fff',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}
