import React from 'react';
import { motion } from 'framer-motion';

const FeatureTypography = ({ isLight }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-center mb-8"
    >
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-3">
        Refer Leads 
        <span className="text-[#81B398]"> Earn Money.</span>
      </h1>
      <p className={`text-sm leading-relaxed font-medium px-4 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
        Join the ultimate business chain. Submit leads and get paid instantly.
      </p>
    </motion.div>
  );
};

export default FeatureTypography;