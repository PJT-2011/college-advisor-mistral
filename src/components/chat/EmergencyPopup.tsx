"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageSquare, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface EmergencyPopupProps {
  show: boolean;
  onClose: () => void;
}

export function EmergencyPopup({ show, onClose }: EmergencyPopupProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card p-6 m-4 border-2 border-red-500/50 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-red-500">Emergency Resources</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground mb-4">
                If you or someone you know is in crisis or immediate danger, please reach out to these resources right away:
              </p>

              {/* Resources */}
              <div className="space-y-3">
                {/* 988 Lifeline */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    <h4 className="font-semibold text-sm">Suicide & Crisis Lifeline</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-500 mb-1">988</p>
                  <p className="text-xs text-muted-foreground">
                    24/7 free and confidential support
                  </p>
                </div>

                {/* Crisis Text Line */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-sm">Crisis Text Line</h4>
                  </div>
                  <p className="text-lg font-bold text-blue-500 mb-1">
                    Text <span className="bg-blue-500/20 px-2 py-1 rounded">HELLO</span> to{" "}
                    <span className="bg-blue-500/20 px-2 py-1 rounded">741741</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Text with a trained crisis counselor
                  </p>
                </div>

                {/* Emergency Services */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold text-sm">Immediate Danger</h4>
                  </div>
                  <p className="text-lg font-bold text-orange-500 mb-1">Call 911</p>
                  <p className="text-xs text-muted-foreground">
                    Or go to your nearest emergency room
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  You are not alone. Help is available 24/7.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
