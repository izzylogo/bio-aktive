import React from 'react';
import { motion } from 'motion/react';

const textRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
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

const testimonials = [
  {
    text: "The sound quality is extraordinary. Every note and nuance comes through with stunning clarity. The active noise cancellation is top-notch.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    text: "Excelente producto, fácil de enlazar. Me gustó el botón para reducción de ruido que también permite escuchar tu entorno.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=12"
  },
  {
    text: "Very nice headphones, deep rich sound quality and clear without distortion. Very comfortable when wearing, excellent build quality.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=13"
  },
  {
    text: "The sound quality is extraordinary. Every note and nuance comes through with stunning clarity. The active noise cancellation is top-notch.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=14"
  },
  {
    text: "Excelente producto, fácil de enlazar. Me gustó el botón para reducción de ruido que también permite escuchar tu entorno.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=15"
  },
  {
    text: "Very nice headphones, deep rich sound quality and clear without distortion. Very comfortable when wearing, excellent build quality.",
    name: "Seddik walid",
    role: "Product Designer",
    image: "https://i.pravatar.cc/150?img=16"
  }
];

const testimonialRows = [
  testimonials,
  [...testimonials.slice(2), ...testimonials.slice(0, 2)],
  [...testimonials.slice(1), testimonials[0]]
];

const TestimonialCard = ({ testimonial }: { testimonial: any }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 md:p-5 w-[280px] md:w-[320px] flex-shrink-0 shadow-sm border border-white/40 mx-2 md:mx-3 flex flex-col justify-between">
    <div>
      <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 md:mb-3">Testimonial</div>
      <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
        {testimonial.text}
      </p>
    </div>
    <div className="flex items-center justify-between mt-auto">
      <div className="text-3xl md:text-4xl text-rose-200 font-serif leading-none">"</div>
      <div className="flex items-center gap-2 md:gap-3">
        <img src={testimonial.image} alt={testimonial.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
        <div className="text-right">
          <div className="font-bold text-gray-900 text-xs md:text-sm">{testimonial.name}</div>
          <div className="text-[10px] md:text-xs text-gray-500">{testimonial.role}</div>
        </div>
      </div>
    </div>
  </div>
);

const MarqueeRow = ({ items, direction = 'left', speed = 40, className = '' }: { items: any[], direction?: 'left' | 'right', speed?: number, className?: string }) => {
  return (
    <div className={`flex w-full overflow-hidden py-2 md:py-3 ${className}`}>
      <motion.div
        className="flex min-w-max"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* Render items twice to ensure seamless loop */}
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <TestimonialCard key={idx} testimonial={item} />
        ))}
      </motion.div>
    </div>
  );
};

export function Testimonials({ isActive = false, accentColor = '#15936d' }: { isActive?: boolean, accentColor?: string }) {
  return (
    <div className="w-full h-full flex flex-col justify-start relative overflow-hidden pt-24 md:pt-[14vh]">
      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-8 md:mb-12 flex flex-col items-start gap-2 md:gap-4"
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        variants={textRevealContainer}
      >
        <motion.div
          variants={textRevealSoftItem}
          className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full border font-semibold text-[10px] md:text-xs tracking-widest uppercase bg-white/50 backdrop-blur-sm"
          style={{ borderColor: `${accentColor}55`, color: accentColor }}
        >
          What Our Customers Say
        </motion.div>
        <motion.h2 variants={textRevealItem} className="text-3xl md:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl leading-tight">
          <span className="relative inline-block px-1">
            <span className="relative z-10">Trusted</span>
            <svg
              className="absolute -bottom-1.5 left-0 w-full h-[12px] opacity-80"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 9.5C15 4.5 35 1.5 50 1.5C65 1.5 85 4.5 99 9.5"
                stroke={accentColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
              />
            </svg>
          </span>{' '}
          by Thousands
        </motion.h2>
        <motion.p variants={textRevealSoftItem} className="text-gray-600 max-w-xl text-sm md:text-xl leading-relaxed">
          Real feedback from our amazing community. See how our bioactive supplements are making a difference in people's lives every day.
        </motion.p>
      </motion.div>

      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 36 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
        transition={{ duration: 0.75, delay: isActive ? 0.18 : 0, ease: 'easeOut' }}
      >
        {/* Blur masks on edges */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-64 bg-gradient-to-r from-[#fdf8f6] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-64 bg-gradient-to-l from-[#fdf8f6] to-transparent z-10 pointer-events-none"></div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <MarqueeRow items={testimonialRows[0]} direction="left" speed={35} />
          <MarqueeRow items={testimonialRows[1]} direction="right" speed={32} />
          <MarqueeRow items={testimonialRows[2]} direction="left" speed={36} className="md:hidden" />
        </div>
      </motion.div>
    </div>
  );
}
