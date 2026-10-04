import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle2, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (mapSectionRef.current) observer.observe(mapSectionRef.current);
    return () => observer.disconnect();
  }, []);



  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#0D3A21] pb-24 text-white">
      {/* 1. HERO SECTION WITH IMAGE & CLEAR GREEN TO YELLOW BRAND GRADIENT */}
      <section className="relative pt-20 pb-44 sm:pt-24 sm:pb-52 overflow-hidden bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white shadow-sm">
        {/* Background Image with Green to Yellow Color Wash */}
        <div className="absolute inset-0 z-0">
          <img
            src="/cib-conference-hall-2.jpg"
            alt="CIB Ghana Secretariat"
            className="w-full h-full object-cover object-center brightness-75 scale-105 filter blur-[0.5px] opacity-25 mix-blend-overlay"
          />
          {/* Brand Green to Yellow Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#088d01]/90 via-[#72ac00]/85 to-[#dccb00]/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase"
          >
            Contact us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/95 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Chartered Institute of Bankers, Ghana is ready to provide the right solution and support according to your needs
          </motion.p>
        </div>

        {/* Bottom Curved Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12 sm:h-16 md:h-20 text-[#0D3A21] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* 2. FLOATING TWO-COLUMN CONTACT CARD */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-28 sm:-mt-36 md:-mt-40 mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="bg-white rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* LEFT COLUMN: GET IN TOUCH */}
            <div className="md:col-span-5 p-7 sm:p-10 lg:p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between space-y-8 bg-white">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                    Get in touch
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    Have questions regarding CIB Ghana conferences, delegate certification, corporate partnerships, or membership accreditation?
                  </p>
                </div>

                {/* 3 Contact Info Items with Circular Brand Green Badges */}
                <div className="space-y-5 pt-2">
                  {/* Head Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1B7E3E] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="w-5 h-5 text-white stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Head Office</h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        CIB Ghana Secretariat, Trinity Avenue
                      </p>
                      <p className="text-xs text-slate-500">
                        Okponglo - East Legon, Accra - Ghana
                      </p>
                    </div>
                  </div>

                  {/* Email Us */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1B7E3E] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-white stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Email Us</h3>
                      <a
                        href="mailto:events@cibgh.org"
                        className="text-xs sm:text-sm text-slate-600 hover:text-[#1B7E3E] font-medium block transition-colors"
                      >
                        events@cibgh.org
                      </a>
                      <a
                        href="mailto:info@cibgh.org"
                        className="text-xs text-slate-500 hover:text-[#1B7E3E] block transition-colors"
                      >
                        info@cibgh.org
                      </a>
                    </div>
                  </div>

                  {/* Call & WhatsApp Us */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1B7E3E] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-5 h-5 text-white stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Call & WhatsApp</h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Phone : +233 (0) 302 541 308
                      </p>
                      <a
                        href="https://wa.me/233506339248?text=Hello%20CIB%20Ghana%2C%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20events."
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-sm text-[#1B7E3E] hover:underline font-semibold block transition-colors"
                      >
                        WhatsApp : +233 (0) 50 633 9248
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Our Social Media */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide mb-3">
                  Follow our social media
                </h4>
                <div className="flex items-center gap-2.5">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B7E3E] hover:bg-[#166632] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B7E3E] hover:bg-[#166632] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B7E3E] hover:bg-[#166632] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B7E3E] hover:bg-[#166632] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B7E3E] hover:bg-[#166632] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SEND US A MESSAGE FORM */}
            <div className="md:col-span-7 p-7 sm:p-10 lg:p-12 bg-white">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-6">
                Send us a message
              </h2>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B7E3E] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    Thank You for Your Message!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your inquiry has been received by the CIB Ghana Secretariat. A member of our team will respond shortly.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-none text-sm font-bold bg-[#1B7E3E] hover:bg-[#166632] text-white transition-all shadow-sm active:scale-95"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Name"
                        className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company"
                        className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone"
                        className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject"
                      className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Message"
                      className="w-full px-4 py-3 bg-[#F1F3F5] hover:bg-[#E9ECEF] focus:bg-white focus:ring-2 focus:ring-[#1B7E3E] border-0 rounded-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Row 5: Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-none bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. WIDE GOOGLE MAP SECTION */}
      <section
        ref={mapSectionRef}
        className="relative w-full h-[420px] sm:h-[480px] border-t border-white/10 overflow-hidden bg-[#072113]"
      >
        {/* Loading skeleton - shows until iframe is loaded */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#072113] animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-none bg-white/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#FFE500]" />
                </div>
                {/* Breathing ring on skeleton pin */}
                <span className="absolute inset-0 rounded-none border-2 border-[#FFE500]/40 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-white/70">Loading map…</p>
            </div>
          </div>
        )}

        {/* Only render iframe when section is in viewport (instant load) */}
        {mapVisible && (
          <iframe
            title="CIB Ghana Secretariat Location"
            src="https://maps.google.com/maps?q=Chartered+Institute+of+Bankers+Ghana+Trinity+Avenue+East+Legon+Accra&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setMapLoaded(true)}
            className={`w-full h-full filter saturate-[1.1] contrast-[1.02] transition-opacity duration-500 ${
              mapLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Breathing red glow rings around the existing Google Maps pin */}
        {mapLoaded && (
          <div
            className="absolute pointer-events-none"
            style={{ top: '47%', left: '50.2%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Outer slow ring */}
            <span
              className="absolute rounded-full bg-[#F20300]/25 animate-ping"
              style={{ width: 52, height: 52, top: -26, left: -26, animationDuration: '2s' }}
            />
            {/* Middle ring */}
            <span
              className="absolute rounded-full bg-[#F20300]/35 animate-ping"
              style={{ width: 32, height: 32, top: -16, left: -16, animationDuration: '1.4s' }}
            />
          </div>
        )}
      </section>
    </div>
  );
};
