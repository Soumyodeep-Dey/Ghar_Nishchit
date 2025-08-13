
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

const GenerateReportModal = ({ isOpen, onClose, isDark }) => {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setIsGenerated(false);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  if (!isOpen) return null;

  const modalTheme = isDark
    ? {
        bg: 'bg-slate-800/90',
        border: 'border-slate-700/50',
        text: 'text-white',
        inputBg: 'bg-slate-700/50',
        inputBorder: 'border-slate-600/50',
        inputPlaceholder: 'placeholder-slate-400',
        focusBorder: 'focus:border-cyan-500',
        buttonPrimaryBg: 'bg-gradient-to-r from-cyan-500 to-indigo-600',
        buttonPrimaryText: 'text-white',
        buttonSecondaryBg: 'bg-slate-700/50',
        buttonSecondaryText: 'text-slate-300',
        buttonHover: 'hover:brightness-110',
      }
    : {
        bg: 'bg-white/90',
        border: 'border-indigo-200/50',
        text: 'text-gray-900',
        inputBg: 'bg-white/70',
        inputBorder: 'border-indigo-300/50',
        inputPlaceholder: 'placeholder-indigo-400',
        focusBorder: 'focus:border-indigo-500',
        buttonPrimaryBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        buttonPrimaryText: 'text-white',
        buttonSecondaryBg: 'bg-indigo-100/60',
        buttonSecondaryText: 'text-indigo-700',
        buttonHover: 'hover:brightness-105',
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${modalTheme.bg} ${modalTheme.border} border rounded-2xl w-full max-w-md p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${modalTheme.text}`}>Generate Report</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-full ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText}`}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {!isGenerated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
              >
                <option value="financial">Financial Report</option>
                <option value="occupancy">Occupancy Report</option>
                <option value="maintenance">Maintenance Report</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${modalTheme.text}`}>Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full p-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.inputBorder} border ${modalTheme.text} ${modalTheme.focusBorder} focus:outline-none transition-colors`}
              >
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-year">Last Year</option>
                <option value="all-time">All Time</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isGenerating}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover} flex items-center justify-center`}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full mr-2"
                    />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-4"
            >
              <Download className="w-12 h-12 text-green-400" />
            </motion.div>
            <h3 className={`text-xl font-bold mb-2 ${modalTheme.text}`}>Report Generated!</h3>
            <p className={`${modalTheme.text} mb-6`}>Your {reportType} report for the {dateRange.replace(/-/g, ' ')} is ready for download.</p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => console.log('Downloading report...')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonPrimaryBg} ${modalTheme.buttonPrimaryText} ${modalTheme.buttonHover}`}>
                Download
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${modalTheme.buttonSecondaryBg} ${modalTheme.buttonSecondaryText} ${modalTheme.buttonHover}`}>
                Close
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GenerateReportModal;
