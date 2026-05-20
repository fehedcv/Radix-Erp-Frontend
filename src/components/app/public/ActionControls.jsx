import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ActionControls = ({ onEnterPortal }) => {
  return (
    <motion.button 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={onEnterPortal}
      className="w-[160px] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
    >
      Earn Now <ArrowRight size={18} strokeWidth={2.5} />
    </motion.button>
  );
};

export default ActionControls;