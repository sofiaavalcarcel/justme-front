import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Preloader.css';

export function Preloader() {
  const { isLoggingIn } = useAuth();

  return (
    <AnimatePresence>
      {isLoggingIn && (
        <motion.div
          className="preloader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="preloader-content">
            <motion.div
              className="preloader-logo-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            >
              <motion.div
                className="preloader-icon-wrapper"
                animate={{
                  boxShadow: [
                    '0 0 0px 0px rgba(239, 68, 68, 0)',
                    '0 0 40px 10px rgba(239, 68, 68, 0.3)',
                    '0 0 0px 0px rgba(239, 68, 68, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles size={48} className="preloader-icon" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="preloader-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="text-gradient">JustMe</span>
            </motion.h2>

            <motion.p
              className="preloader-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Preparing your experience...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
