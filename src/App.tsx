import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, ArrowUp } from 'lucide-react';
import { CustomCursor } from './components/CustomCursor';
import { BottleScene } from './components/Bottle3D';
import { Testimonials } from './components/Testimonials';
import { useProgress } from '@react-three/drei';
import { NotificationSystem, NotificationItem } from './components/NotificationSystem';
import { CartSidebar } from './components/CartSidebar';

const products = [
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    color: '#2b4f3b',
    bgColor: '#e6e2d8',
    textColor: '#d1cbbd',
    aboutTitle: 'Stress Relief & Vitality',
    aboutText: 'Our premium Ashwagandha extract is clinically proven to reduce stress, improve sleep quality, and boost overall vitality. Sourced from the finest organic farms, it delivers a potent dose of withanolides for maximum efficacy.',
    benefits: ['Reduces Cortisol', 'Improves Sleep', 'Boosts Energy'],
    ingredients: [
      { name: 'Organic Ashwagandha Root Extract', amount: '500mg' },
      { name: 'Withanolide Glycosides', amount: '35mg' },
      { name: 'Black Pepper Extract', amount: '5mg' }
    ],
    usage: 'Take 2 capsules daily with food, preferably in the morning or early afternoon.',
    warning: 'Consult your healthcare provider before use if pregnant, nursing, or taking medications.',
    price: '$29.99',
    discountedPrice: '$24.99'
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    color: '#b85d19',
    bgColor: '#f4e4d4',
    textColor: '#e0c8b1',
    aboutTitle: 'Advanced Inflammation Support',
    aboutText: 'Harness the power of curcumin with our enhanced Turmeric formula. Blended with black pepper extract for 2000% better absorption, it provides powerful antioxidant and anti-inflammatory support for your joints and body.',
    benefits: ['Joint Health', 'Antioxidant', 'High Absorption'],
    ingredients: [
      { name: 'Turmeric Root Extract (95% Curcuminoids)', amount: '1000mg' },
      { name: 'Organic Ginger Root', amount: '100mg' },
      { name: 'BioPerine® Black Pepper', amount: '10mg' }
    ],
    usage: 'Take 3 capsules daily with a fat-containing meal for optimal absorption.',
    warning: 'May interact with blood thinners. Discontinue use 2 weeks prior to surgery.',
    price: '$24.99',
    discountedPrice: '$19.99'
  },
  {
    id: 'maca',
    name: 'Maca Root',
    color: '#c29b0c',
    bgColor: '#fdf5e6',
    textColor: '#e8d8b7',
    aboutTitle: 'Natural Energy & Balance',
    aboutText: 'Gelatinized for optimal digestion, our Maca Root powder is a powerful adaptogen that helps balance hormones, enhance mood, and provide sustained, jitter-free energy throughout your day.',
    benefits: ['Hormone Balance', 'Sustained Energy', 'Mood Enhancement'],
    ingredients: [
      { name: 'Organic Gelatinized Maca Root', amount: '1500mg' },
      { name: 'L-Arginine', amount: '200mg' },
      { name: 'Panax Ginseng Extract', amount: '50mg' }
    ],
    usage: 'Take 1 scoop (5g) daily mixed into smoothies, oatmeal, or your favorite beverage.',
    warning: 'If you have thyroid conditions, consult your doctor before consuming maca.',
    price: '$27.99',
    discountedPrice: '$22.99'
  }
];

const footerLinkGroups = [
  {
    title: 'Features',
    links: ['Products', 'Wholesale', 'Insights']
  },
  {
    title: 'Support',
    links: ['Help', 'FAQ', 'Contact']
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookies']
  }
];

const textRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12
    }
  }
};

const textRevealItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: 'easeOut' }
  }
};

const textRevealSoftItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: 'easeOut' }
  }
};

function SmoothCounter({ progress }: { progress: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, progress, { duration: 0.8, ease: "easeOut" });
    return animation.stop;
  }, [progress, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function App() {
  const { progress } = useProgress();
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      // Small delay to ensure rendering is complete before dropping the curtain
      const timer = setTimeout(() => setAppLoaded(true), 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only show warning if mobile and not already dismissed in this session
      if (mobile && !sessionStorage.getItem('mobile-warning-dismissed')) {
        setShowMobileWarning(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [currentSection, setCurrentSection] = useState(0);
  const [isTopButtonAnimating, setIsTopButtonAnimating] = useState(false);

  // Cart & Notification State
  const [cart, setCart] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addEvents, setAddEvents] = useState<any[]>([]);

  const addToCart = (product: any, cardRect?: DOMRect) => {
    setCart(prev => [...prev, product]);

    // Add notification
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      message: 'Item Secured',
      productName: product.name,
      color: product.color
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Track 3D fly event
    let x = 0, y = 0;
    if (cardRect) {
      x = cardRect.left + cardRect.width / 2;
      y = cardRect.top + cardRect.height / 2;
    }
    setAddEvents(prev => [...prev.slice(-5), { id: newNotif.id, product, x, y, timestamp: Date.now() }]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const scrollProgressRef = useRef(0);
  const isScrolling = useRef(false);
  const manualRotationRef = useRef(0);
  const rotationAnimationRef = useRef<any>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRotationsRef = useRef<number[]>([0, 0, 0]);
  const cardDragState = useRef<{ isDragging: boolean, startX: number, lastX: number }[]>([
    { isDragging: false, startX: 0, lastX: 0 },
    { isDragging: false, startX: 0, lastX: 0 },
    { isDragging: false, startX: 0, lastX: 0 }
  ]);

  const handleCardPointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    cardDragState.current[index].isDragging = true;
    cardDragState.current[index].startX = e.clientX;
    cardDragState.current[index].lastX = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCardPointerMove = (index: number, e: React.PointerEvent) => {
    if (!cardDragState.current[index].isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - cardDragState.current[index].lastX;
    cardRotationsRef.current[index] += deltaX * 0.01;
    cardDragState.current[index].lastX = e.clientX;
  };

  const handleCardPointerUp = (index: number, e: React.PointerEvent) => {
    cardDragState.current[index].isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const nextProduct = () => {
    setDirection(1);
    setActiveIndex((prev) => prev + 1);
  };

  const prevProduct = () => {
    setDirection(-1);
    setActiveIndex((prev) => prev - 1);
  };

  const goToSection = (index: number) => {
    if (index < 0 || index > 7 || isScrolling.current || index === currentSection) return;
    isScrolling.current = true;
    setCurrentSection(index);

    animate(scrollProgressRef.current, index, {
      duration: isMobile ? 0.6 : 0.8,
      ease: "easeInOut",
      onUpdate: (latest) => {
        scrollProgressRef.current = latest;
      },
      onComplete: () => {
        setTimeout(() => {
          isScrolling.current = false;
        }, 400); // 400ms buffer to prevent accidental double scrolls on trackpads
      }
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) < 20) return; // ignore tiny scrolls

    if (e.deltaY > 0) goToSection(currentSection + 1);
    else goToSection(currentSection - 1);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select, label')) return;

    if (rotationAnimationRef.current) {
      rotationAnimationRef.current.stop();
    }

    isDragging.current = true;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - touchStartX.current;
    const deltaY = touchStartY.current - e.clientY; // Positive means dragged up (scroll down)

    // Handle rotation
    manualRotationRef.current += deltaX * 0.01;
    touchStartX.current = e.clientX;

    // Handle vertical scroll
    if (!isScrolling.current) {
      const threshold = isMobile ? 60 : 40;
      if (deltaY > threshold) {
        goToSection(currentSection + 1);
        touchStartY.current = e.clientY;
      } else if (deltaY < -threshold) {
        goToSection(currentSection - 1);
        touchStartY.current = e.clientY;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer wasn't captured
    }

    // Snap back to 0
    rotationAnimationRef.current = animate(manualRotationRef.current, 0, {
      type: "spring",
      stiffness: 100,
      damping: 20,
      onUpdate: (latest) => {
        manualRotationRef.current = latest;
      }
    });
  };

  const normalizedIndex = ((activeIndex % products.length) + products.length) % products.length;
  const currentProduct = products[normalizedIndex];
  const footerAccent = currentProduct.color;

  useEffect(() => {
    if (!isTopButtonAnimating) return;
    const timeout = window.setTimeout(() => {
      setIsTopButtonAnimating(false);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isTopButtonAnimating]);

  return (
    <div
      className="accent-text-scope h-[100dvh] w-full overflow-hidden transition-colors duration-1000 ease-in-out relative font-sans overscroll-none select-none"
      style={{ backgroundColor: currentProduct.bgColor, ['--accent-color' as any]: currentProduct.color }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Mobile Experience Warning */}
      <AnimatePresence>
        {showMobileWarning && (
          <motion.div
            key="mobile-warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-10 max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-4xl">💻</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Desktop Preferred</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-10">
                  This experience is crafted for larger displays to showcase the full 3D interactive details.
                </p>
                <button
                  onClick={() => {
                    setShowMobileWarning(false);
                    sessionStorage.setItem('mobile-warning-dismissed', 'true');
                  }}
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 tracking-wide"
                >
                  Continue Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Loading Screen */}
      <AnimatePresence>
        {!appLoaded && (
          <motion.div
            key="global-loader"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-auto shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: currentProduct.bgColor, transformOrigin: "top" }}
            initial={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex flex-col items-center justify-center text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-6">
              <span className="text-4xl md:text-5xl font-semibold tracking-tight mb-8">
                <span className="lowercase">bio-</span>
                <span className="font-serif italic font-medium">Aktive</span>
              </span>

              <div className="w-full h-1 bg-gray-900/10 rounded-full overflow-hidden mt-6 relative">
                <motion.div
                  className="absolute top-0 left-0 bottom-0 bg-gray-900 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between w-full text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                <span>Loading Elements</span>
                <span><SmoothCounter progress={progress} />%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomCursor color={currentProduct.color} />
      <NotificationSystem
        notifications={notifications}
        removeNotification={removeNotification}
        onNotificationClick={() => setIsCartOpen(true)}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
      />

      {/* Navbar (Fixed) */}
      <nav className={`absolute top-0 w-full px-5 md:px-8 py-5 md:py-6 flex items-center justify-between z-60 pointer-events-none transition-transform duration-500 ${currentSection > 0 ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="text-xl md:text-3xl font-semibold tracking-tight text-gray-900 pointer-events-auto">
          <span className="lowercase">bio-</span>
          <span className="font-serif italic font-medium">Aktive</span>
        </div>
        <div className="hidden md:flex items-center space-x-12 text-sm font-medium text-gray-700 pointer-events-auto">
          <a href="#" onClick={(e) => { e.preventDefault(); goToSection(4); }} className="transition-colors">Products</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goToSection(1); }} className="transition-colors">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); goToSection(2); }} className="transition-colors">Insights</a>
        </div>
        <div className="flex items-center space-x-3 md:space-x-6 pointer-events-auto">
          <button className="hidden md:flex p-2 hover:bg-black/5 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-0 md:space-x-3 bg-white/40 backdrop-blur-md p-1.5 md:px-4 md:py-2 rounded-full border border-white/30 shadow-sm hover:bg-white/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative"
          >
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-black text-white text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                {cart.length}
              </span>
            )}
            <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-white" />
            <span className="hidden md:block text-sm font-semibold text-gray-800">salman</span>
          </button>
        </div>
      </nav>

      {/* 3D Scene (Fixed) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: currentSection === 6 ? 90 : 50 }}>
        <BottleScene products={products} activeIndex={activeIndex} currentSection={currentSection} scrollProgressRef={scrollProgressRef} manualRotationRef={manualRotationRef} cardRefs={cardRefs} cardRotationsRef={cardRotationsRef} addEvents={addEvents} />
      </div>

      {/* Controls (Fixed) */}
      <motion.div
        className="absolute bottom-12 md:bottom-16 left-0 w-full flex items-center justify-center space-x-3 md:space-x-4 z-[120] pointer-events-none"
        animate={{ opacity: currentSection >= 4 ? 0 : 1, y: currentSection >= 4 ? 20 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={prevProduct}
          className="p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-lg hover:bg-white/70 transition-all hover:scale-110 active:scale-95 text-gray-800 pointer-events-auto"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextProduct}
          className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-lg hover:bg-white/70 transition-all hover:scale-105 active:scale-95 text-gray-800 text-sm font-semibold tracking-wide flex items-center space-x-2 pointer-events-auto"
        >
          <span>Click to Slide</span>
        </button>

        <button
          onClick={nextProduct}
          className="p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-lg hover:bg-white/70 transition-all hover:scale-110 active:scale-95 text-gray-800 pointer-events-auto"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      <motion.div
        className="absolute right-5 bottom-5 md:right-8 md:bottom-8 z-[130] pointer-events-none"
        animate={{
          opacity: currentSection > 0 || isTopButtonAnimating ? 1 : 0,
          y: currentSection > 0 || isTopButtonAnimating ? 0 : 16,
          scale: currentSection > 0 || isTopButtonAnimating ? 1 : 0.9
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <motion.div
          className="pointer-events-auto relative"
          animate={isTopButtonAnimating ? {
            rotateZ: [0, -14, 10, -6, 0],
            rotateY: [0, 180, 360],
            y: [0, -8, 0],
            scale: [1, 0.94, 1.06, 1]
          } : currentSection > 0 ? {
            scale: [1, 1.03, 1],
            y: [0, -1.5, 0]
          } : {
            scale: 1,
            y: 0,
            rotateZ: 0,
            rotateY: 0
          }}
          transition={isTopButtonAnimating ? {
            duration: 0.85,
            ease: 'easeInOut'
          } : currentSection > 0 ? {
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut'
          } : {
            duration: 0.2
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <button
            onClick={() => {
              setIsTopButtonAnimating(true);
              goToSection(0);
            }}
            className="relative h-10 w-10 md:h-11 md:w-11 overflow-hidden rounded-full border border-white/30 transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              background: `linear-gradient(145deg, ${currentProduct.color} 0%, ${currentProduct.color} 70%, ${currentProduct.color}cc 100%)`,
              boxShadow: '0 10px 20px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -8px 14px rgba(0,0,0,0.12)'
            }}
            aria-label="Scroll to hero section"
          >
            <span className="absolute inset-x-[16%] top-[14%] h-[18%] rounded-full bg-white/20 blur-[1px]" />
            <span className="absolute inset-0 opacity-20 mix-blend-multiply bg-[radial-gradient(circle_at_70%_72%,rgba(0,0,0,0.08)_0,transparent_42%)]" />
            <span className="relative z-10 flex h-full w-full items-center justify-center text-[#2a2a2a] drop-shadow-[0_1px_0_rgba(255,255,255,0.28)]">
              <ArrowUp className="w-4 h-4 md:w-[1.05rem] md:h-[1.05rem] text-white" strokeWidth={2.4} />
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* Mobile Section Slider Checkpoints */}
      <AnimatePresence>
        {isMobile && !showMobileWarning && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[140] flex flex-col items-center group h-[280px]"
          >
            {/* The Track */}
            <div className="absolute top-0 bottom-0 w-[3px] bg-white/10 rounded-full overflow-hidden">
              {/* The "Volume" Fill */}
              <motion.div
                className="absolute top-0 w-full"
                animate={{
                  height: (currentSection * (280 / 7)),
                  backgroundColor: currentProduct.color
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
            
            {/* The Markers & Interaction Areas */}
            <div className="relative flex flex-col justify-between h-full py-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const isActive = currentSection === i;
                const isPassed = currentSection >= i;
                return (
                  <button
                    key={i}
                    onClick={() => goToSection(i)}
                    className="relative flex items-center justify-center w-8 h-8 -mx-3 transition-transform active:scale-90"
                    aria-label={`Go to section ${i}`}
                  >
                    {/* The Mark */}
                    <motion.div
                      animate={{
                        backgroundColor: isPassed ? currentProduct.color : "rgba(255,255,255,0.4)",
                        scale: isActive ? 1.4 : 0.8,
                        opacity: isPassed ? 1 : 0.5
                      }}
                      className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-sm"
                    />
                  </button>
                );
              })}
            </div>

            {/* The Sliding Point Thumb */}
            <motion.div
              layoutId="active-nav-point"
              className="absolute w-5 h-5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-10 border-2 border-white cursor-pointer"
              animate={{
                y: (currentSection * (280 / 7)) - 10, // Adjust centering for 5x5 (20px) thumb
                backgroundColor: currentProduct.color,
                boxShadow: `0 0 15px ${currentProduct.color}90`
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="absolute inset-[2px] rounded-full bg-white/20 blur-[1px]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <motion.div
        className="absolute inset-0 w-full z-10 pointer-events-none"
        animate={{ y: currentSection === 0 ? '0%' : '-100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Section 0: Hero */}
        <section className="relative w-full h-[100dvh] flex items-center justify-center pt-10">
          {/* Background Text */}
          <div className="absolute inset-0 flex items-start md:items-center justify-center overflow-hidden pointer-events-none select-none pt-[12vh] md:pt-0" style={{ perspective: 1000 }}>
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.h1
                key={currentProduct.id + '-bg'}
                custom={direction}
                className="text-5xl sm:text-6xl md:text-9xl lg:text-[14vw] font-bold tracking-tighter leading-none whitespace-nowrap"
                style={{ color: currentProduct.textColor }}
                initial={{ x: direction > 0 ? '40%' : '-40%', opacity: 0, scale: 0.8, rotateY: direction > 0 ? -30 : 30 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ x: direction < 0 ? '40%' : '-40%', opacity: 0, scale: 0.8, rotateY: direction < 0 ? -30 : 30 }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
              >
                {currentProduct.name.toUpperCase()}
              </motion.h1>
            </AnimatePresence>
          </div>
        </section>
      </motion.div>

      {/* Details Content */}
      <motion.div
        className="absolute inset-0 w-full z-[55] pointer-events-none"
        animate={{ y: currentSection > 0 && currentSection < 4 ? '0%' : currentSection >= 4 ? '-100dvh' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Section 1 & 2: Details (About & Ingredients) */}
        <section className="relative w-full h-[100dvh] flex items-start md:items-center justify-center md:justify-end px-6 md:px-24 pt-24 md:pt-0 pb-20">
          <div className="w-full md:w-1/2 max-w-xl pointer-events-auto z-[55]">
            <AnimatePresence mode="wait">
              {currentSection <= 1 ? (
                <motion.div
                  key={currentProduct.id + '-about'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight">
                    {currentProduct.aboutTitle}
                  </h2>
                  <p className="text-base md:text-xl text-gray-700 mb-6 md:mb-10 leading-relaxed">
                    {currentProduct.aboutText}
                  </p>

                  <div className="space-y-3 md:space-y-5 mb-8 md:mb-12">
                    {currentProduct.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center space-x-3 md:space-x-4">
                        <div
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm shrink-0"
                          style={{ backgroundColor: currentProduct.color }}
                        />
                        <span className="text-gray-800 font-semibold text-sm md:text-lg">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="px-5 md:px-8 py-2.5 md:py-3 rounded-full text-white font-bold tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
                    style={{ backgroundColor: currentProduct.color }}
                    onClick={() => alert("Discover More clicked!")}
                  >
                    Discover More
                  </button>
                </motion.div>
              ) : currentSection === 2 ? (
                <motion.div
                  key={currentProduct.id + '-ingredients'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full border-2 mb-4 md:mb-6 font-semibold text-xs md:text-sm tracking-widest uppercase" style={{ borderColor: currentProduct.color, color: currentProduct.color }}>
                    Transparent Label
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">
                    Pure Ingredients
                  </h2>

                  <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                    {currentProduct.ingredients.map((ingredient, i) => (
                      <div key={i} className="flex flex-col border-b border-gray-300/50 pb-3 md:pb-4">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-gray-900 font-bold text-base md:text-lg">{ingredient.name}</span>
                          <span className="text-gray-900 font-semibold text-base md:text-lg">{ingredient.amount}</span>
                        </div>
                        <span className="text-gray-600 text-xs md:text-sm">Clinically studied dosage</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="px-5 md:px-8 py-2.5 md:py-3 rounded-full text-white font-bold tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
                    style={{ backgroundColor: currentProduct.color }}
                    onClick={() => alert("View Full Label clicked!")}
                  >
                    View Full Label
                  </button>
                </motion.div>
              ) : currentSection === 3 ? (
                <motion.div
                  key={currentProduct.id + '-usage'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full border-2 mb-4 md:mb-6 font-semibold text-xs md:text-sm tracking-widest uppercase" style={{ borderColor: currentProduct.color, color: currentProduct.color }}>
                    Safe & Effective
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">
                    Usage & Warnings
                  </h2>

                  <div className="space-y-6 mb-8 md:mb-12">
                    <div
                      className="backdrop-blur-md rounded-2xl p-6 shadow-sm border-2"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderColor: currentProduct.color
                      }}
                    >
                      <h3 className="text-lg font-bold mb-2" style={{ color: currentProduct.color }}>Suggested Use</h3>
                      <p className="text-gray-800 leading-relaxed font-medium">{currentProduct.usage}</p>
                    </div>
                    <div
                      className="backdrop-blur-md rounded-2xl p-6 shadow-sm border-2"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderColor: currentProduct.color
                      }}
                    >
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: currentProduct.color }}>
                        <span className="text-red-500/90 text-xl">⚠️</span> Warning
                      </h3>
                      <p className="text-gray-800 leading-relaxed font-medium">{currentProduct.warning}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>
      </motion.div>

      {/* Section 4: All Products */}
      <motion.div
        className="absolute inset-0 w-full z-40 pointer-events-none"
        animate={{ y: currentSection >= 4 ? '0%' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <section
          className="relative w-full h-[100dvh] flex flex-col items-center justify-center px-5 md:px-10 pt-14 md:pt-16 pb-4 md:pb-6 pointer-events-auto transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: currentProduct.bgColor }}
        >
          <div className="h-[8.5rem] md:h-20 w-full shrink-0" /> {/* Spacer for the header text */}

          <div
            className="mt-5 md:mt-0 flex flex-wrap justify-center gap-3 md:gap-5 w-full max-w-6xl overflow-y-auto pb-3 md:pb-4 px-2 touch-pan-y"
            onWheel={(e) => {
              const target = e.currentTarget;
              const isScrollable = target.scrollHeight > target.clientHeight;
              if (!isScrollable) return;

              if (e.deltaY < 0 && target.scrollTop <= 0) return;
              if (e.deltaY > 0 && target.scrollTop + target.clientHeight >= target.scrollHeight - 1) return;

              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              touchStartY.current = e.clientY;
              e.stopPropagation();
            }}
            onPointerMove={(e) => {
              const target = e.currentTarget;
              const isScrollable = target.scrollHeight > target.clientHeight;
              if (!isScrollable) return;

              const deltaY = touchStartY.current - e.clientY;
              if (deltaY < 0 && target.scrollTop <= 0) return;
              if (deltaY > 0 && target.scrollTop + target.clientHeight >= target.scrollHeight - 1) return;

              e.stopPropagation();
            }}
            onPointerUp={(e) => {
              const target = e.currentTarget;
              const deltaY = touchStartY.current - e.clientY;

              if (deltaY < -40 && target.scrollTop <= 0) {
                goToSection(3);
              } else if (deltaY > 40 && target.scrollTop + target.clientHeight >= target.scrollHeight - 1) {
                goToSection(5);
              }
              e.stopPropagation();
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
            }}
          >
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="group w-full max-w-[290px] sm:w-[280px] backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_24px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col border transition-all hover:shadow-[0_18px_32px_rgb(0,0,0,0.10)] hover:-translate-y-1.5 duration-500"
                style={{
                  background: `linear-gradient(165deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 100%), linear-gradient(135deg, ${product.bgColor} 0%, rgba(255,255,255,0.92) 100%)`,
                  borderColor: `${product.color}26`
                }}
              >
                <div
                  ref={(el) => { if (el) cardRefs.current[idx] = el; }}
                  className="h-52 md:h-56 w-full relative cursor-grab active:cursor-grabbing touch-pan-y flex items-center justify-center overflow-hidden"
                  style={{ background: `radial-gradient(circle at 50% 42%, ${product.bgColor} 0%, rgba(255,255,255,0.04) 72%)` }}
                  onPointerDown={(e) => handleCardPointerDown(idx, e)}
                  onPointerMove={(e) => handleCardPointerMove(idx, e)}
                  onPointerUp={(e) => handleCardPointerUp(idx, e)}
                  onPointerCancel={(e) => handleCardPointerUp(idx, e)}
                >
                  {/* Subtle background element to make it look premium */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute bottom-3 text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Drag to rotate</div>
                </div>
                <div
                  className="p-5 md:p-6 flex-1 flex flex-col"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.48) 100%)' }}
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 leading-tight pr-2">{product.name}</h3>
                    <div className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shrink-0" style={{ backgroundColor: product.bgColor, color: product.color }}>
                      {product.id === 'ashwagandha' ? 'Bestseller' : product.id === 'turmeric' ? 'New' : 'Popular'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/60">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[11px] md:text-xs font-semibold line-through decoration-gray-300/70">{product.price}</span>
                      <span className="text-lg md:text-xl font-black tracking-tight" style={{ color: product.color }}>{product.discountedPrice}</span>
                    </div>
                    <button
                      className="h-9 md:h-10 px-3 md:px-3.5 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-black/5 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 gap-1 text-[11px] md:text-xs"
                      style={{ backgroundColor: product.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const cardEl = (e.target as HTMLElement).closest('.group');
                        const rect = cardEl?.getBoundingClientRect();
                        addToCart(product, rect);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.div>

      {/* Section 4 Text (Elevated above 3D Scene) */}
      <motion.div
        className="absolute top-14 md:top-16 left-0 w-full z-[60] pointer-events-none flex flex-col items-center justify-start px-5 md:px-10"
        animate={{ y: currentSection >= 4 ? '0%' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.div
          className="text-center mb-5 md:mb-6 pointer-events-auto flex flex-col items-center"
          initial="hidden"
          animate={currentSection === 4 ? 'visible' : 'hidden'}
          variants={textRevealContainer}
        >
          <div className="inline-block bg-white/30 backdrop-blur-xl px-10 py-8 rounded-[3rem] border border-white/20 shadow-2xl max-w-lg">
            <motion.h2 variants={textRevealItem} className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Our Collection
            </motion.h2>
            <motion.p variants={textRevealSoftItem} className="text-gray-800 text-xs md:text-base max-w-sm mx-auto font-medium leading-relaxed">
              Discover our full range of premium bioactive supplements, designed for maximum absorption and efficacy.
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Section 5: Testimonials */}
      <motion.div
        className="absolute inset-0 w-full z-[70] pointer-events-none bg-[#fdf8f6]"
        animate={{ y: currentSection === 5 ? '0%' : currentSection > 5 ? '-100dvh' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <section
          className="relative w-full h-[100dvh] flex flex-col items-center justify-center pointer-events-auto"
          onWheel={(e) => {
            if (e.deltaY < 0) {
              goToSection(4);
            } else if (e.deltaY > 0) {
              goToSection(6);
            }
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            touchStartY.current = e.clientY;
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            const deltaY = touchStartY.current - e.clientY;
            if (deltaY < -40) {
              goToSection(4);
            } else if (deltaY > 40) {
              goToSection(6);
            }
            e.stopPropagation();
          }}
        >
          <Testimonials isActive={currentSection === 5} accentColor={currentProduct.color} />
        </section>
      </motion.div>

      {/* Section 6: Buy in Bulk Background */}
      <motion.div
        className="absolute inset-0 w-full z-[75] pointer-events-none overflow-hidden"
        style={{ backgroundColor: currentProduct.bgColor }}
        animate={{ y: currentSection === 6 ? '0%' : currentSection > 6 ? '-100dvh' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Busy Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[pulse_4s_ease-in-out_infinite]" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: currentProduct.color }}
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: currentProduct.color }}
            animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Section 6: Buy in Bulk Text */}
      <motion.div
        className="absolute inset-0 w-full z-[100] pointer-events-none"
        animate={{ y: currentSection === 6 ? '0%' : currentSection > 6 ? '-100dvh' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <section
          className="relative w-full h-[100dvh] flex flex-col items-center justify-center px-6 md:px-12 pointer-events-auto transition-colors duration-1000 ease-in-out"
          onWheel={(e) => {
            if (e.deltaY < 0) {
              goToSection(5);
            } else if (e.deltaY > 0) {
              goToSection(7);
            }
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            touchStartY.current = e.clientY;
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            const deltaY = touchStartY.current - e.clientY;
            if (deltaY < -40) {
              goToSection(5);
            } else if (deltaY > 40) {
              goToSection(7);
            }
            e.stopPropagation();
          }}
        >
          <motion.div
            className="text-center max-w-3xl mx-auto relative z-[100] pointer-events-auto"
            initial="hidden"
            animate={currentSection === 6 ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
              hidden: {}
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="inline-block px-3.5 py-1.5 rounded-full border-2 mb-5 md:mb-6 font-semibold text-[11px] md:text-xs tracking-[0.18em] uppercase bg-white/50 backdrop-blur-md"
              style={{ borderColor: currentProduct.color, color: currentProduct.color }}
            >
              Wholesale & Distribution
            </motion.div>

            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="text-3xl md:text-6xl font-bold mb-3 md:mb-5 tracking-tight text-gray-900"
            >
              Buy in Bulk
            </motion.h2>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="text-base md:text-xl text-gray-700 mb-6 md:mb-9 font-medium leading-relaxed"
            >
              Partner with us to bring premium bioactive supplements to your customers. We offer competitive wholesale pricing for retailers, clinics, and distributors.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="bg-white/40 border border-white/50 p-5 md:p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden w-full max-w-2xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] font-bold mb-2 md:mb-3 text-gray-500">Direct Contact</p>
              <a
                href="tel:+18001234567"
                className="text-2xl md:text-5xl font-black tracking-tighter text-gray-900 inline-block relative z-10"
              >
                +1 (800) 123-4567
              </a>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 relative z-10">
                <button
                  className="w-full sm:w-auto px-5 md:px-7 py-2.5 md:py-3.5 text-white rounded-full font-bold tracking-wide shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all text-xs md:text-sm"
                  style={{ backgroundColor: currentProduct.color }}
                >
                  Request Catalog
                </button>
                <button
                  className="w-full sm:w-auto px-5 md:px-7 py-2.5 md:py-3.5 bg-transparent border-2 rounded-full font-bold tracking-wide hover:bg-black/5 transition-all text-xs md:text-sm"
                  style={{ borderColor: currentProduct.color, color: currentProduct.color }}
                >
                  Email Sales Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </motion.div>

      {/* Section 7: Footer */}
      <motion.div
        className="absolute inset-0 w-full z-[110] pointer-events-none"
        animate={{ y: currentSection === 7 ? '0%' : '100dvh' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <section
          className="relative w-full h-[100dvh] flex items-stretch justify-center pointer-events-auto bg-[#111111]"
          onWheel={(e) => {
            if (e.deltaY < 0) {
              goToSection(6);
            }
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            touchStartY.current = e.clientY;
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            const deltaY = touchStartY.current - e.clientY;
            if (deltaY < -40) {
              goToSection(6);
            }
            e.stopPropagation();
          }}
        >
          <motion.div
            className="relative flex h-full w-full overflow-hidden bg-[#111111] px-6 py-8 text-white sm:px-8 md:px-12 md:py-12"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{
              opacity: currentSection === 7 ? 1 : 0,
              y: currentSection === 7 ? 0 : 40,
              scale: currentSection === 7 ? 1 : 0.98
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center"
              initial="hidden"
              animate={currentSection === 7 ? 'visible' : 'hidden'}
              variants={textRevealContainer}
            >
              <motion.div variants={textRevealItem} className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[3rem]">
                  Stay Ahead with Wellness
                  <span className="mt-2 block font-serif text-[1.05em] italic font-medium text-white/95">
                    Insights and Updates
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                  Subscribe to our newsletter for expert tips, product updates, and practical wellness insights for modern retail.
                </p>
                <motion.form
                  variants={textRevealSoftItem}
                  className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-14 sm:h-16 flex-1 rounded-full border border-white/10 bg-white/10 px-6 text-xs sm:text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/12"
                  />
                  <button
                    type="submit"
                    className="h-14 sm:h-16 rounded-full px-8 text-xs sm:text-sm font-semibold text-white transition hover:brightness-110"
                    style={{ backgroundColor: footerAccent }}
                  >
                    Subscribe
                  </button>
                </motion.form>
              </motion.div>

              <motion.div variants={textRevealSoftItem} className="mt-10 border-t border-white/10 pt-8 md:mt-12 md:pt-10">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-2.5 rounded-full -skew-x-[20deg]" style={{ backgroundColor: footerAccent }} />
                        <span className="h-4 w-2.5 rounded-full -skew-x-[20deg] opacity-85" style={{ backgroundColor: footerAccent }} />
                        <span className="h-4 w-2.5 rounded-full -skew-x-[20deg] opacity-70" style={{ backgroundColor: footerAccent }} />
                      </div>
                      <span className="text-2xl font-semibold tracking-tight text-white">
                        <span className="lowercase">bio-</span>
                        <span className="font-serif italic font-medium">Aktive</span>
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/55">
                      Make your complicated wellness sourcing feel simple, elegant, and ready for growth.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 sm:gap-10">
                    {footerLinkGroups.map((group) => (
                      <motion.div key={group.title} variants={textRevealSoftItem}>
                        <p className="text-xs sm:text-sm font-semibold text-white/90">{group.title}</p>
                        <div className="mt-4 space-y-3">
                          {group.links.map((link) => (
                            <a
                              key={link}
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="block text-xs sm:text-sm text-white/55 transition hover:text-white/90"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute -bottom-8 left-0 z-0 select-none text-[24vw] font-bold tracking-[-0.08em] text-white/[0.05] sm:-bottom-10 sm:text-[20vw] lg:text-[16rem]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: currentSection === 7 ? 1 : 0, y: currentSection === 7 ? 0 : 24 }}
              transition={{ duration: 0.8, delay: currentSection === 7 ? 0.25 : 0, ease: 'easeOut' }}
            >
              BIOACTIVE0
            </motion.div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
