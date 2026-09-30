import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Award,
  CreditCard,
  MapPin,
  Users
} from 'lucide-react';
import chatbotIcon from '../../assets/chatbot-icon-gold.png';
import { LivingChatbotAvatar } from './LivingChatbotAvatar';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionLinks?: Array<{ label: string; url: string; isExternal?: boolean }>;
  provider?: string;
}

const INITIAL_SUGGESTIONS = [
  { id: 'about', label: 'What is the Banking Conference?', query: 'Tell me about the 30th National Banking and Ethics Conference.' },
  { id: 'register', label: 'How do I register & pay?', query: 'How do I register for the conference and pay with MoMo or Card?' },
  { id: 'packages', label: 'Which package should I explore?', query: 'What delegate and accommodation packages are available?' },
  { id: 'cpd', label: 'How many CPD hours are awarded?', query: 'How many CPD hours do delegates earn?' },
  { id: 'venue', label: 'Where is the venue & dates?', query: 'Where and when is the event taking place?' },
];

export const ChatbotWidget: React.FC = () => {
  const { speakers } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isMobile, isOpen]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Welcome to CIB Ghana. I can help you find upcoming programmes, understand delegate packages, or discover how to register, reserve accommodation, and earn CPD accreditation.",
      time: getCurrentTime(),
    },
  ]);

  const scrollToUserTurn = (smooth = true) => {
    const doScroll = () => {
      if (chatContainerRef.current && lastUserMsgRef.current) {
        const container = chatContainerRef.current;
        const userElem = lastUserMsgRef.current;
        const containerRect = container.getBoundingClientRect();
        const elemRect = userElem.getBoundingClientRect();
        const relativeTop = elemRect.top - containerRect.top;

        container.scrollTo({
          top: container.scrollTop + relativeTop - 10,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else if (chatContainerRef.current && messages.length <= 1) {
        chatContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    // Immediate and multi-frame passes to handle keyboard expansion and AI response insertion
    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 50);
      setTimeout(doScroll, 160);
    });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToUserTurn();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  const getContextualActionLinks = (userQuery: string, botReply: string) => {
    const combined = (userQuery + ' ' + botReply).toLowerCase();
    const links: Array<{ label: string; url: string; isExternal?: boolean }> = [];

    if (
      combined.includes('register') ||
      combined.includes('package') ||
      combined.includes('single') ||
      combined.includes('double') ||
      combined.includes('early bird') ||
      combined.includes('paystack') ||
      combined.includes('ghs')
    ) {
      links.push({
        label: 'Register for 30th Conference →',
        url: '/events/30th-national-banking-ethics-conference-2026/register',
      });
    }

    if (
      combined.includes('whatsapp') ||
      combined.includes('contact') ||
      combined.includes('phone') ||
      combined.includes('call') ||
      combined.includes('secretariat') ||
      combined.includes('0506339248')
    ) {
      links.push({
        label: 'Chat on WhatsApp (+233506339248) →',
        url: 'https://wa.me/233506339248?text=Hello%20CIB%20Ghana%2C%20I%20would%20like%20to%20inquire%20about%20the%20conference.',
        isExternal: true,
      });
    }

    if (
      combined.includes('cpd') ||
      combined.includes('portal') ||
      combined.includes('ticket') ||
      combined.includes('pass')
    ) {
      links.push({
        label: 'Access Delegate Portal →',
        url: '/dashboard',
      });
    }

    if (
      combined.includes('speaker') ||
      combined.includes('addison') ||
      combined.includes('faculty')
    ) {
      links.push({
        label: 'Explore Speakers & Faculty →',
        url: '/speakers',
      });
    }

    return links.length > 0 ? links : undefined;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getCurrentTime(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setIsTyping(true);
    scrollToUserTurn(true);

    try {
      // Build conversation history for multi-turn AI context (like ChatGPT and Gemini)
      const formattedHistory = nextMessages
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: formattedHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          const actionLinks = getContextualActionLinks(text, data.reply);
          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            time: getCurrentTime(),
            actionLinks,
            provider: data.provider,
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[AI Assistant] Remote endpoint error, engaging instant neural fallback:', err);
    }

    // Instant local fallback if offline or backend unavailable
    const botResponse = generateBotResponse(text);
    setMessages((prev) => [...prev, botResponse]);
    setIsTyping(false);
  };

  const generateBotResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();

    // 1. Conference Overview & Theme
    if (
      q.includes('about') ||
      q.includes('conference') ||
      q.includes('theme') ||
      q.includes('event') ||
      q.includes('overview') ||
      q.includes('banking and ethics') ||
      q.includes('30th') ||
      q.includes('what is the banking conference')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "The **30th National Banking & Ethics Conference 2026** is Ghana's premier gathering of commercial bank CEOs, central bank regulators, board chairs, and financial executives hosted by the Chartered Institute of Bankers, Ghana.\n\n• **Theme**: *'Banking on the Future — Trust, Technology and Transformation'*\n• **Key Pillars**: Ethical Corporate Governance, AI-Driven Fraud Prevention, Climate Finance & ESG, and AfCFTA Cross-Border Trade Rails.\n• **Accreditation**: Awards **16 CIB CPD Credits** recognized sector-wide under Act 991.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Register for 30th Conference →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
          { label: 'Explore Speakers & Faculty', url: '/speakers' },
        ],
      };
    }

    // 2. Dates & Schedule
    if (
      q.includes('date') ||
      q.includes('when') ||
      q.includes('day') ||
      q.includes('time') ||
      q.includes('calendar') ||
      q.includes('november') ||
      q.includes('deadline')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📅 **Conference Schedule & Key Dates**:\n\n• **Dates**: **8th – 10th November, 2026** (3-Day Executive Programme)\n• **Early Bird Deadline**: **20th October, 2026** (Book early to secure discounted luxury chalet accommodation)\n• **Registration Close**: 5th November, 2026\n• **Daily Hours**: 08:00 AM – 17:30 GMT (followed by networking dinners)",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Register Before Early Bird Deadline →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 3. Venue & Location (Aqua Safari Resort, Ada)
    if (
      q.includes('venue') ||
      q.includes('where') ||
      q.includes('location') ||
      q.includes('hotel') ||
      q.includes('ada') ||
      q.includes('resort') ||
      q.includes('aqua safari') ||
      q.includes('place')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📍 **Venue & Location**:\n\n• **Venue**: **Aqua Safari Resort, Ada, Greater Accra, Ghana**\n• **Setting**: Ghana's top riverfront luxury resort situated along the serene Volta River estuary.\n• **Amenities Included**: Air-conditioned conference halls, high-speed WiFi, waterfront dining, pontoon boat cruises, and luxury chalets.\n• **Accessibility**: Shuttle services and private executive parking available for all registered delegates.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Book Aqua Safari Package →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 4. Packages, Pricing & Accommodation
    if (
      q.includes('package') ||
      q.includes('price') ||
      q.includes('cost') ||
      q.includes('fee') ||
      q.includes('accommodation') ||
      q.includes('room') ||
      q.includes('single') ||
      q.includes('double') ||
      q.includes('occupancy') ||
      q.includes('rate')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🎟️ **Accommodation & Event Packages (Aqua Safari, Ada)**:\n\n• **Single Occupancy Package**: **GHS 5,600**\n  Includes 2 nights private luxury chalet accommodation, full conference access, Masterclass fee, 2 nights banquet dinners, and resort leisure activities.\n\n• **Double Occupancy Package**: **GHS 4,000**\n  Includes shared 2 nights accommodation, conference access, Masterclass fee, 2 nights dinner, and resort activities.\n\n• **Standard Conference Pass**: **GHS 1,200**\n\n*Early Bird rates expire 20th October 2026.*",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Select Your Package & Register →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 5. How to Register & Step-by-Step
    if (
      q.includes('register') ||
      q.includes('registration') ||
      q.includes('how do i register') ||
      q.includes('sign up') ||
      q.includes('enroll')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📝 **How to Register in 4 Easy Steps**:\n\n1. **Select Membership**: Choose ACIB, FCIB, Student, or Non-Member.\n2. **Enter Delegate Details**: Name, corporate email, phone, organization, and designation.\n3. **Choose Attendance Mode**: Select In-Person at Aqua Safari or Virtual Livestream.\n4. **Pick Package & Masterclass**: Select Single (GHS 5,600) or Double (GHS 4,000) occupancy and your preferred training track.\n5. **Instant Checkout**: Pay securely with MTN MoMo, Telecel Cash, AT Money, or Visa/Mastercard via Paystack.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Start Registration Online Now →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 6. Payment Methods & MoMo
    if (
      q.includes('pay') ||
      q.includes('momo') ||
      q.includes('mobile money') ||
      q.includes('mtn') ||
      q.includes('telecel') ||
      q.includes('card') ||
      q.includes('visa') ||
      q.includes('mastercard') ||
      q.includes('paystack')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "💳 **Payment Options & Security**:\n\nAll payments are processed securely through **Paystack** with 256-bit encryption:\n\n• **Mobile Money**: MTN Mobile Money, Telecel Cash, and AT Money.\n• **Bank Cards**: Visa, Mastercard debit/credit cards.\n\nUpon payment clearance, your official **Digital QR Pass** and tax invoice are generated and dispatched immediately to your email.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Proceed to Payment & Registration →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 7. Masterclasses & Training Tracks
    if (
      q.includes('masterclass') ||
      q.includes('training') ||
      q.includes('class') ||
      q.includes('track') ||
      q.includes('workshop')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🧠 **Executive Masterclass Tracks (Included in Package)**:\n\n1. **Deploying AI to Combat Modern Fraud in International Trade Finance**\n   Machine learning detection, invoice spoofing, and predictive risk rails.\n\n2. **Cybersecurity and Fraud Detection**\n   Defending core banking infrastructure against ransomware and synthetic identity attacks.\n\n3. **Virtual Assets and Impact**\n   Central bank digital currencies (eCedi), tokenized deposits, and digital asset regulation.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Select Your Masterclass Track →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 8. CPD Credits & Accreditation (Act 991)
    if (
      q.includes('cpd') ||
      q.includes('credit') ||
      q.includes('hour') ||
      q.includes('point') ||
      q.includes('certificate') ||
      q.includes('accreditation')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🎓 **16 Accredited CIB CPD Hours**:\n\n• Under the **Chartered Institute of Bankers Ghana Act, 2019 (Act 991)**, all licensed banking practitioners are required to maintain continuous professional competence.\n• Attending the 30th Conference awards **16 certified CPD hours**.\n• Attendance is verified via your digital QR ticket, and official certificates are downloadable directly from the Delegate Portal upon conference conclusion.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Access Delegate Portal →', url: '/dashboard' },
          { label: 'Register for 16 CPD Credits', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // Match specific speaker from live speakers list
    const matchedSpeaker = speakers.find((s) => {
      const qClean = q.replace(/[^a-z0-9\s]/g, ' ');
      const nameParts = (s.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((p) => p.length > 3 && !['dr', 'hon', 'fcib', 'acib', 'mr', 'mrs'].includes(p));
      return nameParts.some((part) => qClean.includes(part));
    });

    if (matchedSpeaker) {
      const exp = matchedSpeaker.expertise && matchedSpeaker.expertise.length > 0
        ? `\n• **Core Expertise**: ${matchedSpeaker.expertise.join(', ')}`
        : '';
      const bio = matchedSpeaker.biography
        ? `\n\n${matchedSpeaker.biography}`
        : '';
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `👤 **${matchedSpeaker.name}**\n\n• **Position**: ${matchedSpeaker.position}\n• **Organization**: ${matchedSpeaker.organization}\n• **Country**: ${matchedSpeaker.country || 'Ghana'}${exp}${bio}`,
        time: getCurrentTime(),
        actionLinks: [
          { label: 'View All Conference Faculty →', url: '/speakers' },
          { label: 'Register for Conference', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 9. Speakers & Faculty
    if (
      q.includes('speaker') ||
      q.includes('faculty') ||
      q.includes('who') ||
      q.includes('governor') ||
      q.includes('asiama') ||
      q.includes('dzato') ||
      q.includes('george') ||
      q.includes('haruna') ||
      q.includes('panel')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🎙️ **Featured Conference Faculty & Keynotes (18 Distinguished Luminaries)**:\n\n• **Robert Dzato (FCIB)** — CEO, CIB Ghana\n• **Dr. Johnson Pandit Asiama, FCIB(Hon.)** — Governor, Bank of Ghana\n• **Hon. Samuel Nartey George** — Minister for Communication, Digital Technology & Innovations\n• **Hon. Haruna Iddrisu** — Minister for Education\n• **Dr. Stephane Nwolley** — Digital Currency & Virtual Assets Architect\n• **Dr. Albert Antwi-Bosiako** — Cybersecurity & Anti-Fraud Leader\n• **Clifford Duke Mettle, FCIB** — International Trade Finance Leader\n• **Rita Elumelu, FCIB** — Financial Crime & Trade Specialist\n• **Doris Ahiati, FCIB** — Executive Corporate Governance Leader\n• **Farihan Alhassan** — Head of Banking Supervision & Risk\n• **Dr. Marcel Lukas** — Associate Professor in FinTech (Univ. of St Andrews)\n• **John Awuah** — CEO, Ghana Association of Banks\n• **Emelia Sackey, FCIB** — Executive Director of Ethics & Governance\n• **Frank Tawiah** — Virtual Assets & Tokenization Specialist\n• **Philip Twum, ACIB** — Digital Strategy & FinTech Partner\n• **Philip Kwaw Sebuabe** — Head of Digital Rails & Virtual Assets\n• **Paul Baah Sackey, FCIB** — Fellow & Senior Banking Leader\n• **Charles Ofori Acquah, FCIB** — Fellow & Executive Banking Advisor",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'View All Keynote Speakers & Bios →', url: '/speakers' },
        ],
      };
    }

    // 10. About CIB Ghana (Chartered Institute of Bankers)
    if (
      q.includes('cib') ||
      q.includes('institute') ||
      q.includes('what is cib') ||
      q.includes('act 991') ||
      q.includes('mandate') ||
      q.includes('motto') ||
      q.includes('chartered')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🏛️ **About the Chartered Institute of Bankers, Ghana (CIB Ghana)**:\n\n• **Legal Mandate**: Established by an Act of Parliament &mdash; **Chartered Institute of Bankers Ghana Act, 2019 (Act 991)**.\n• **Role**: The statutory regulatory and certification body for banking professionals in Ghana, upholding international ethical benchmarks and financial competence.\n• **Motto**: *'Honesty and Integrity'*\n• **Leadership**: Governed by the CIB Governing Council and led by CEO **Robert Dzato (FCIB)**.\n• **Secretariat**: Trinity Avenue, Okponglo - East Legon, Accra.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Contact CIB Secretariat →', url: '/contact' },
          { label: 'Explore Annual Programmes', url: '/events' },
        ],
      };
    }

    // 11. Membership Categories (ACIB, FCIB, Student)
    if (
      q.includes('member') ||
      q.includes('acib') ||
      q.includes('fcib') ||
      q.includes('student') ||
      q.includes('non-member') ||
      q.includes('join')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "👥 **CIB Ghana Membership Categories**:\n\n• **ACIB (Associate Chartered Banker)**: Fully chartered banking practitioners who have completed certified professional examinations.\n• **FCIB (Fellow)**: Distinguished senior banking executives honored for exceptional leadership.\n• **Student Member**: Individuals enrolled in the professional banking curriculum.\n• **Non-Member**: Corporate executives, fintech professionals, and public sector stakeholders welcome to participate in all conferences.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Register with Your Member Category →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 12. Attendance Mode (In-Person vs Virtual)
    if (
      q.includes('virtual') ||
      q.includes('online') ||
      q.includes('stream') ||
      q.includes('livestream') ||
      q.includes('hybrid') ||
      q.includes('physical') ||
      q.includes('in-person')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🌐 **Hybrid Conference Format**:\n\n• **In-Person Pass**: Join onsite at Aqua Safari Resort in Ada for luxury chalet lodging, executive networking banquets, and tactile masterclasses.\n• **Virtual Livestream Pass**: Stream live in ultra-high-definition with interactive Q&A polls, downloadable conference presentation slide decks, and digital CPD accreditation.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Choose Your Attendance Mode →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // 12.5 Resources & Presentation Slide Downloads
    if (
      q.includes('resource') ||
      q.includes('slide') ||
      q.includes('presentation') ||
      q.includes('download') ||
      q.includes('deck') ||
      q.includes('brochure') ||
      q.includes('document')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📚 **Conference Resources & Keynote Downloads**:\n\n• Executive summaries, keynote presentation slides, conference brochures, and banking compendiums are published on the **Resources** page.\n• Registered delegates can download official presentation decks directly to their device or access them in their Delegate Portal.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Explore Conference Resources →', url: '/resources' },
          { label: 'Access Delegate Portal', url: '/dashboard' },
        ],
      };
    }

    // 12.6 Agenda & Programme Itinerary
    if (
      q.includes('agenda') ||
      q.includes('schedule') ||
      q.includes('itinerary') ||
      q.includes('programme') ||
      q.includes('session')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📑 **Conference Agenda & Programme Itinerary**:\n\n• **Day 1**: Opening Plenary, Governor's Keynote Address, CEO Debate on AI in Banking, and Executive Waterfront Networking Banquet.\n• **Day 2**: 3 Specialized Masterclass Tracks (AI Fraud Prevention, Cybersecurity Defense, and eCedi / Virtual Assets), followed by the CIB Gala Dinner.\n• **Day 3**: Closing Resolutions, CPD Accreditation Certifications, and Ada Pontoon Leisure Excursion.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'View Interactive Agenda →', url: '/events/30th-national-banking-ethics-conference-2026#agenda' },
        ],
      };
    }

    // 13. Sponsorship & Corporate Exhibition
    if (
      q.includes('sponsor') ||
      q.includes('partner') ||
      q.includes('exhibit') ||
      q.includes('booth') ||
      q.includes('corporate')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🤝 **Sponsorship & Exhibition Opportunities**:\n\nPartner with CIB Ghana to showcase financial technology and services to 650+ banking executives:\n\n• **Platinum Key Partner**: Exclusive keynote session, brand spotlight, and VIP lounge host.\n• **Gold Partner**: 10 delegate passes & executive exhibition foyer booth.\n• **Silver & Partner**: Dedicated digital branding & delegate pack inclusion.\n\n*Key Partners include Bank of Ghana, StanChart, Ecobank, GCB Bank, and GhIPSS.*",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Sponsorship Inquiries (Contact Form) →', url: '/contact' },
        ],
      };
    }

    // 14. Contact, WhatsApp & Secretariat Address
    if (
      q.includes('contact') ||
      q.includes('call') ||
      q.includes('phone') ||
      q.includes('email') ||
      q.includes('whatsapp') ||
      q.includes('secretariat') ||
      q.includes('human') ||
      q.includes('help') ||
      q.includes('support')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "📞 **CIB Ghana Secretariat Contact Channels**:\n\n• 📱 **WhatsApp Support**: **+233 (0) 50 633 9248** (Instant response)\n• 📞 **Telephone**: **+233 (0) 302 541 308**\n• 📧 **Event Secretariat**: `events@cibgh.org`\n• 📧 **General Inquiries**: `info@cibgh.org`\n• 🏢 **Head Office**: CIB Ghana Secretariat, Trinity Avenue, Okponglo - East Legon, Accra, Ghana\n• 🕒 **Hours**: Monday to Friday: 8:00 AM – 5:00 PM GMT",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Chat on WhatsApp Now (+233506339248) →', url: 'https://wa.me/233506339248?text=Hello%20CIB%20Ghana%2C%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20events.', isExternal: true },
          { label: 'Open Contact Form', url: '/contact' },
        ],
      };
    }

    // 15. Digital Ticket Pass & Delegate Portal
    if (
      q.includes('ticket') ||
      q.includes('pass') ||
      q.includes('qr') ||
      q.includes('portal') ||
      q.includes('dashboard') ||
      q.includes('login')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "🎟️ **Digital Ticket Pass & Delegate Dashboard**:\n\n• Once registered, an official digital QR pass is issued with your accredited registration ID.\n• Show your QR pass on your smartphone at the Aqua Safari check-in desk for accreditation badge printing.\n• Access the **Delegate Portal** at any time to view schedules, download session papers, and retrieve CPD certificates.",
        time: getCurrentTime(),
        actionLinks: [
          { label: 'Access Delegate Portal →', url: '/dashboard' },
          { label: 'Register for Digital Ticket', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        ],
      };
    }

    // Default Comprehensive Fallback Response
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: "Thank you for reaching out to the CIB Ghana Assistant! I can help you with:\n\n• **Conference Info**: 9–10 Nov 2026 at Aqua Safari Resort, Ada.\n• **Packages & Pricing**: Single (GHS 5,600) & Double (GHS 4,000) occupancy.\n• **Accreditation**: 16 CIB CPD Credits under Act 991.\n• **Registration & Payments**: Instant checkout with MoMo or Bank Card via Paystack.\n• **Secretariat Support**: WhatsApp at **0506339248** or phone **0302 541 308**.\n\nWhat would you like to explore next?",
      time: getCurrentTime(),
      actionLinks: [
        { label: 'Register for 30th Conference →', url: '/events/30th-national-banking-ethics-conference-2026/register' },
        { label: 'WhatsApp Support (0506339248)', url: 'https://wa.me/233506339248?text=Hello%20CIB%20Ghana%2C%20I%20would%20like%20to%20inquire%20about%20the%20conference.', isExternal: true },
        { label: 'Contact Secretariat', url: '/contact' },
      ],
    };
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "Welcome to CIB Ghana. I can help you find upcoming programmes, understand delegate packages, or discover how to register, reserve accommodation, and earn CPD accreditation.",
        time: getCurrentTime(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Positioned below WhatsApp icon) */}
      <div className={`fixed bottom-5 sm:bottom-6 right-4 sm:right-6 md:right-8 z-50 group ${isOpen && isMobile ? 'hidden' : 'block'}`}>
        {/* Tooltip on hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out whitespace-nowrap bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 shadow-md hidden sm:block">
          CIB Chatbot
          {/* Little right arrow pointer */}
          <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-slate-900" />
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close CIB Chatbot' : 'Open CIB Chatbot'}
          className="relative w-14 h-14 flex items-center justify-center transition-all focus:outline-none bg-transparent border-0 p-0 shadow-none hover:shadow-none"
          title="CIB Chatbot"
        >
          {isOpen ? (
            <div className="w-14 h-14 rounded-full bg-[#008129] text-white flex items-center justify-center shadow-xl">
              <X className="w-6 h-6 stroke-[2.5]" />
            </div>
          ) : (
            <LivingChatbotAvatar size={56} className="w-14 h-14" />
          )}
        </motion.button>
      </div>

      {/* Interactive Chatbot Modal Window (Full screen & swipe from left on mobile, sharp floating card on desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { x: '-100%' } : { opacity: 0, y: 24, scale: 0.94 }}
            animate={isMobile ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { x: '-100%' } : { opacity: 0, y: 20, scale: 0.94 }}
            transition={
              isMobile
                ? { type: 'spring', damping: 28, stiffness: 280 }
                : { duration: 0.22, ease: 'easeOut' }
            }
            className={
              isMobile
                ? "fixed inset-0 z-50 w-full h-[100dvh] bg-white rounded-none flex flex-col overflow-hidden shadow-2xl"
                : "fixed bottom-24 right-4 sm:right-6 z-50 w-[430px] h-[600px] max-h-[84vh] bg-white rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.28)] border border-slate-200/90 flex flex-col overflow-hidden"
            }
          >
            {/* Header: CIB Ghana Brand Green */}
            <div className="relative bg-[#008129] text-white px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3.5 sm:pb-4 overflow-hidden select-none shrink-0 pt-[max(0.875rem,env(safe-area-inset-top))]">
              {/* Soft filled watermarks */}
              <div className="absolute -top-10 -right-6 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -top-5 -right-1 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src="/cib-logo-white.png"
                    alt="CIB Ghana"
                    className="h-9 sm:h-10 w-auto max-w-[120px] object-contain shrink-0"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight leading-tight">
                      CIB Chatbot
                    </h2>
                  </div>
                </div>

                {/* Circular Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="w-8 h-8 rounded-full border-0 bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Sub-header: Assistant Intro & Quick Question Chips */}
            <div className="px-4 pt-3 pb-2.5 bg-white shrink-0 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <LivingChatbotAvatar size={24} interactive={false} className="shrink-0" />
                <span className="text-[11.5px] sm:text-xs text-slate-600 font-medium">
                  Chat in real-time or pick a quick topic below.
                </span>
              </div>

              {/* Horizontal Scrollable Question Chips (Rounded Pill Chips) */}
              <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-none">
                {INITIAL_SUGGESTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSendMessage(item.query)}
                    className="rounded-full border-0 bg-[#E8F5E9] hover:bg-[#D4EDDA] text-xs font-semibold text-[#006020] px-3.5 py-1.5 whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Body Container */}
            <div className="flex-1 m-3 sm:m-4 rounded-xl bg-slate-50/80 flex flex-col overflow-hidden border border-slate-100">
              <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs scroll-smooth">
                {(() => {
                  const lastUserIndex = messages.map((m) => m.sender).lastIndexOf('user');
                  return messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      ref={idx === lastUserIndex ? lastUserMsgRef : undefined}
                      className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                    {msg.sender === 'bot' && (
                      <LivingChatbotAvatar size={30} interactive={false} className="shrink-0 mt-0.5" />
                    )}

                    <div
                      className={`max-w-[84%] p-3.5 leading-relaxed text-[12.5px] sm:text-[13px] ${
                        msg.sender === 'user'
                          ? 'rounded-2xl rounded-tr-xs bg-[#008129] text-white shadow-xs'
                          : 'rounded-2xl rounded-tl-xs bg-white text-slate-800 shadow-xs border border-slate-100'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="whitespace-pre-line">{msg.text}</p>
                      ) : (
                        <div>
                          {msg.text.split('\n').map((line, lIdx) => {
                            const trimmed = line.trim();
                            const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
                            const content = isBullet ? trimmed.replace(/^([•\-*]|\d+\.)\s*/, '') : line;

                            const segments = content.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="font-extrabold text-inherit">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            });

                            if (isBullet) {
                              return (
                                <div key={lIdx} className="flex items-start gap-1.5 my-0.5">
                                  <span className="text-[#008129] font-bold shrink-0 mt-0.5">•</span>
                                  <div className="flex-1">{segments}</div>
                                </div>
                              );
                            }

                            if (trimmed === '') {
                              return <div key={lIdx} className="h-1.5" />;
                            }

                            return (
                              <p key={lIdx} className="my-0.5 leading-relaxed">
                                {segments}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Interactive Action Links inside bot message */}
                      {msg.actionLinks && msg.actionLinks.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          {msg.actionLinks.map((link, idx) =>
                            link.isExternal || link.url.startsWith('http') ? (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-between gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EDDA] text-[#008129] font-bold text-[11.5px] transition-colors border border-[#008129]/15 shadow-2xs"
                              >
                                <span>{link.label}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <Link
                                key={idx}
                                to={link.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center justify-between gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EDDA] text-[#008129] font-bold text-[11.5px] transition-colors border border-[#008129]/15 shadow-2xs"
                              >
                                <span>{link.label}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}

                {/* Bot typing indicator (Speech Bubble) */}
                {isTyping && (
                  <div className="flex items-start gap-2.5">
                    <LivingChatbotAvatar size={30} isTyping={true} interactive={false} className="shrink-0 mt-0.5" />
                    <div className="rounded-2xl rounded-tl-xs bg-white px-3.5 py-2.5 flex items-center gap-1.5 shadow-xs border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#008129] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#008129] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#008129] animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar: Clear, Modern Rounded Input Box & Send Button */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 bg-white shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Clear button */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="flex items-center gap-1 text-[11.5px] font-bold text-slate-500 hover:text-slate-800 transition-colors shrink-0 px-1 py-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                {/* Modern Pill Input Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => scrollToUserTurn(true)}
                  placeholder="Ask CIB a question..."
                  className="flex-1 rounded-full bg-slate-100 focus:bg-white px-4 py-2.5 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:border-[#008129]/40 outline-none transition-all focus:ring-2 focus:ring-[#008129]/15"
                />

                {/* Circular Green Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-full bg-[#008129] hover:bg-[#006820] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0 cursor-pointer shadow-xs active:scale-95"
                  title="Send message"
                >
                  <Send className="w-4 h-4 stroke-[2.2]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
