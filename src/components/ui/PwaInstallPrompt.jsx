import React, { useState, useEffect } from 'react';
import { Download, X, Share, Orbit } from 'lucide-react';

function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check if user previously dismissed prompt
    const isDismissed = localStorage.getItem('orbit_pwa_prompt_dismissed') === 'true';
    if (isDismissed) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS prompt after a short delay (e.g., 3 seconds)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // For Android / Chrome / PC
      const handleBeforeInstallPrompt = (e) => {
        // Prevent default mini-infobar from showing
        e.preventDefault();
        // Stash the event
        setDeferredPrompt(e);
        // Show the install promotion
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear prompt and close banner
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal to avoid annoying the user
    localStorage.setItem('orbit_pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-[380px] z-[9999] animate-slide-up">
      <div className="p-4 rounded-2xl border border-white/20 shadow-2xl relative bg-black/80 backdrop-blur-xl">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-accent-yellow flex items-center justify-center text-black shrink-0 shadow-lg shadow-yellow-500/20">
            <Orbit className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-white font-bold text-base leading-tight">Cài đặt ứng dụng Orbit</h4>
            <p className="text-gray-300 text-xs mt-1 leading-relaxed">
              {isIOS 
                ? 'Thêm Orbit vào màn hình chính để sử dụng mượt mà, hỗ trợ offline và không bị che khuất bởi thanh công cụ Safari.'
                : 'Trải nghiệm mượt mà, hoạt động offline, tiết kiệm dung lượng và mở rộng toàn màn hình.'
              }
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
          {isIOS ? (
            <div className="flex items-center gap-1.5 text-accent-yellow text-xs font-medium w-full justify-center py-1.5 bg-yellow-500/10 rounded-lg">
              <Share className="w-4 h-4" />
              <span>Chạm nút <strong className="underline font-bold">Chia sẻ</strong> rồi chọn <strong className="underline font-bold">Thêm vào MH chính</strong></span>
            </div>
          ) : (
            <>
              <button 
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium"
              >
                Để sau
              </button>
              <button 
                onClick={handleInstallClick}
                className="px-4 py-1.5 bg-accent-yellow text-black rounded-lg text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Cài đặt ngay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PwaInstallPrompt;
