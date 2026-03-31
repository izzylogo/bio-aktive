import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  message: string;
  productName: string;
  color: string;
}

interface NotificationSystemProps {
  notifications: NotificationItem[];
  removeNotification: (id: string) => void;
  onNotificationClick?: () => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification, onNotificationClick }) => {
  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.2 } }}
            className="pointer-events-auto w-80 bg-white/80 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden relative group cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow"
            onClick={onNotificationClick}
          >
            {/* Accent Line */}
            <div 
              className="absolute top-0 left-0 bottom-0 w-1.5" 
              style={{ backgroundColor: notif.color }}
            />
            
            <div className="flex items-start gap-3 pl-2">
              <div 
                className="p-2 rounded-full shrink-0" 
                style={{ backgroundColor: `${notif.color}15`, color: notif.color }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{notif.message}</p>
                <p className="text-xs text-gray-500 font-medium">{notif.productName} added to collection</p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notif.id);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Subtle Progress Bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-0.5 opacity-30"
              style={{ backgroundColor: notif.color }}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              onAnimationComplete={() => removeNotification(notif.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
