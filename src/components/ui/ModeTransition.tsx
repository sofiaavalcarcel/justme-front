import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './ModeTransition.css';

interface Props {
    targetMode: 'user' | 'professional';
    isVisible: boolean;
    onComplete: () => void;
}

export function ModeTransition({ targetMode, isVisible, onComplete }: Props) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onComplete, 1800);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    const messages = {
        user: {
            title: 'Modo Cliente',
            subtitle: 'Ahora estás en modo cliente',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        professional: {
            title: 'Modo Profesional',
            subtitle: 'Ahora estás en modo profesional',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
    };

    const msg = messages[targetMode];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="mode-transition"
                    style={{ background: msg.gradient }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="mode-transition-content"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <motion.div
                            className="mode-transition-icon"
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                        >
                            <Sparkles size={48} />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {msg.title}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.65 }}
                        >
                            {msg.subtitle}
                        </motion.p>

                        {/* Floating particles */}
                        {Array.from({ length: 6 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="mode-particle"
                                initial={{
                                    x: 0, y: 0, scale: 0, opacity: 0,
                                }}
                                animate={{
                                    x: (Math.random() - 0.5) * 300,
                                    y: (Math.random() - 0.5) * 300,
                                    scale: [0, 1, 0],
                                    opacity: [0, 0.8, 0],
                                }}
                                transition={{
                                    delay: 0.4 + i * 0.1,
                                    duration: 1.2,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
