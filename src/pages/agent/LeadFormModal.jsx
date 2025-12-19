import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, MessageSquare, Building2, 
  Sparkles, Send, MapPin, Briefcase, ChevronDown 
} from 'lucide-react';

const LeadFormModal = ({ isOpen, onClose, initialUnit }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          {/* Backdrop with Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container: Balanced Proportions */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-white"
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 z-30 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form className="p-8 md:p-12" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                
                {/* Header Section [cite: 83] */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Sparkles size={24} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase text-slate-900 leading-none">
                      Submit Lead Entry
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    Provide precise details to ensure lead verification and credit approval[cite: 5, 9].
                  </p>
                </div>

                {/* Two-Column Grid  */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* LEFT COLUMN: Identity & Location */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">
                      01. Target & Client Identity
                    </h4>

                    {/* Business Category Selection [cite: 13, 14] */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Category</label>
                      <div className="relative">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <select className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 appearance-none transition-all">
                          <option>{initialUnit || "Select Business Unit"}</option>
                          <option>Interior Design Unit</option>
                          <option>Manpower Supply</option>
                          <option>Event Management</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {/* Client Name [cite: 25] */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input type="text" required className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all" placeholder="Full Name" />
                      </div>
                    </div>

                    {/* Phone Number [cite: 25] */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input type="tel" required className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all" placeholder="+971..." />
                      </div>
                    </div>

                    {/* Client Address */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <textarea rows="2" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all resize-none" placeholder="Enter physical location..."></textarea>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Requirements & Submit */}
                  <div className="space-y-6 flex flex-col">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">
                      02. Service Specifications
                    </h4>

                    {/* Requested Service  */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Requested Service</label>
                      <div className="relative">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <select className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 appearance-none transition-all">
                          <option>Select Specific Service</option>
                          <option>Full Home Renovation</option>
                          <option>Office Fit-out</option>
                          <option>Security/Manpower Supply</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {/* Detailed Description  */}
                    <div className="space-y-2 flex-grow">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Project Description</label>
                      <div className="relative group h-full">
                        <MessageSquare className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <textarea 
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all resize-none h-[180px]" 
                          // [cite_start]placeholder="Describe the client's needs and project scope in detail[cite: 25, 32]..."
                        ></textarea>
                      </div>
                    </div>

                    {/* Submit Section [cite: 83] */}
                    <div className="pt-6">
                      <button 
                        type="submit" 
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                      >
                        Finalize Submission
                        <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeadFormModal;