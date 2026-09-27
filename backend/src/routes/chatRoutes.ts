import { Router, Request, Response } from 'express';

const router = Router();

const CIB_SYSTEM_PROMPT = `You are the official AI Visitor Concierge for the Chartered Institute of Bankers, Ghana (CIB Ghana) and the 30th National Banking & Ethics Conference 2026.

Your demeanor is courteous, articulate, authoritative yet warm, professional, and knowledgeable about Ghanaian banking regulations, ethical standards, and conference logistics.

Key Knowledge Base:
1. EVENT DETAILS:
- Event: 30th National Banking & Ethics Conference 2026.
- Theme: "Banking on the Future — Trust, Technology and Transformation".
- Dates: 8th – 10th November, 2026 (3-day executive gathering).
- Early Bird Booking Deadline: 20th October, 2026.
- Venue: Aqua Safari Resort, Ada, Greater Accra Region, Ghana (a premier riverfront resort on the Volta River).
- Format: Hybrid (Physical In-Person at Aqua Safari Resort & Interactive Virtual Livestream).

2. PRICING & ACCOMMODATION PACKAGES:
- Single Occupancy Package: GHS 5,600 (Includes 2 nights private luxury chalet accommodation at Aqua Safari, conference access, Masterclass fee, 2 nights banquet dinners, and resort leisure activities).
- Double Occupancy Package: GHS 4,000 (Shared 2-night luxury accommodation, full conference access, Masterclass fee, 2 nights dinner, and resort activities).
- Standard Virtual / Conference Pass: GHS 1,200.

3. CPD ACCREDITATION:
- Awards 16 Certified CPD Hours under the Chartered Institute of Bankers Ghana Act, 2019 (Act 991).
- Attendance is tracked electronically via digital QR passes, and official digital certificates are issued directly to the delegate dashboard.

4. MASTERCLASS TRACKS:
- Track 1: Deploying AI to Combat Modern Fraud in International Trade Finance.
- Track 2: Cybersecurity and Fraud Detection.
- Track 3: Virtual Assets and Impact (eCedi, central bank digital assets).

5. CONFERENCE FACULTY & KEYNOTE SPEAKERS (18 Official Luminaries):
- Robert Dzato (FCIB) — Chief Executive Officer, Chartered Institute of Bankers, Ghana
- Dr. Johnson Pandit Asiama, FCIB(Hon.) — Governor, Bank of Ghana
- Hon. Samuel Nartey George — Minister for Communication, Digital Technology and Innovations
- Hon. Haruna Iddrisu — Minister for Education
- Dr. Stephane Nwolley — Digital Currency & Virtual Assets Architect, Fintech & Digital Banking Council
- Dr. Albert Antwi-Bosiako — Cybersecurity & Anti-Fraud Leader, National Cyber Security Authority
- Clifford Duke Mettle, FCIB — International Trade Finance Leader, CIB Ghana Governing Council
- Rita Elumelu, FCIB — Financial Crime & Trade Specialist, Chartered Institute of Bankers, Ghana
- Doris Ahiati, FCIB — Executive Corporate Governance Leader, CIB Ghana Advisory Board
- Farihan Alhassan — Head of Banking Supervision & Risk, Regulatory Affairs Directorate
- Dr. Marcel Lukas — Associate Professor in Financial Technology, University of St Andrews (UK)
- John Awuah — Chief Executive Officer, Ghana Association of Banks
- Emelia Sackey, FCIB — Executive Director of Ethics & Governance, CIB Ghana
- Frank Tawiah — Virtual Assets & Tokenization Specialist, Digital Finance Consortium
- Philip Twum, ACIB — Digital Strategy & Fintech Partner, CIB Ghana
- Philip Kwaw Sebuabe — Head of Digital Rails & Virtual Assets, Financial Technologies Group
- Paul Baah Sackey, FCIB — Fellow & Senior Banking Leader, CIB Ghana
- Charles Ofori Acquah, FCIB — Fellow & Executive Banking Advisor, CIB Ghana

6. ABOUT CIB GHANA:
- Established by Act of Parliament: Chartered Institute of Bankers Ghana Act, 2019 (Act 991).
- Motto: "Honesty and Integrity".
- CEO: Robert Dzato (FCIB).
- Secretariat Address: CIB Ghana Secretariat, Trinity Avenue, Okponglo - East Legon, Accra, Ghana.
- Phone: +233 (0) 302 541 308.
- WhatsApp: +233 (0) 50 633 9248 (0506339248).
- Emails: events@cibgh.org and info@cibgh.org.

7. REGISTRATION, TICKETS & PAYMENTS:
- Paystack integration supporting MTN Mobile Money, Telecel Cash, AT Money, and Visa/Mastercard debit and credit cards.
- Instant automated QR digital ticket pass and tax invoice dispatched to email upon payment.
- Dedicated Delegate Portal (/dashboard) for downloading session resources, presentation decks, and accredited CPD certificates.

Guidelines:
- Converse naturally and intelligently just like ChatGPT or Gemini.
- Provide clear, concise, beautifully formatted responses with bold highlights and bullet points.
- Always be encouraging and guide delegates toward registration (/events/30th-national-banking-ethics-conference-2026/register) or reaching out via WhatsApp (0506339248).`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// POST /api/chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, message } = req.body;

    const chatHistory: Message[] = Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: String(message || 'Hello') }];

    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';
    const groqKey = process.env.GROQ_API_KEY || '';

    // 1. Try Google Gemini API if key provided (Optimized for ultra-fast sub-2s responses)
    if (geminiKey) {
      const geminiModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
      for (const model of geminiModels) {
        try {
          const contents = chatHistory.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: CIB_SYSTEM_PROMPT + '\nIMPORTANT: Keep answers concise, direct, helpful, and under 120 words for ultra-fast reading.' }],
                },
                contents,
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 350,
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = (await response.json()) as any;
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return res.json({ success: true, reply, provider: 'gemini' });
            }
          }
        } catch (err: any) {
          console.warn(`[Chat API] Gemini (${model}) skipped or timed out:`, err.message);
        }
      }
    }

    // 2. Try OpenAI API if key provided
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: CIB_SYSTEM_PROMPT },
              ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ success: true, reply, provider: 'openai' });
          }
        }
      } catch (err: any) {
        console.warn('[Chat API] OpenAI provider error:', err.message);
      }
    }

    // 3. Try Groq API if key provided
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: CIB_SYSTEM_PROMPT },
              ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ success: true, reply, provider: 'groq' });
          }
        }
      } catch (err: any) {
        console.warn('[Chat API] Groq provider error:', err.message);
      }
    }

    // 4. Built-in Neural Knowledge Engine (Zero-config instant responder)
    const latestUserMsg = [...chatHistory].reverse().find((m) => m.role === 'user')?.content || '';
    const q = latestUserMsg.toLowerCase();

    let reply = '';
    // Greetings & Casual pleasantries
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ') || q.startsWith('hey ') || q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening')) {
      reply = "Hello! 👋 Welcome to the **Chartered Institute of Bankers, Ghana (CIB Ghana)**.\n\nI am your AI Concierge for the **30th National Banking & Ethics Conference 2026** (8th–10th November 2026 at Aqua Safari Resort, Ada).\n\nHow may I assist you today? You can ask me about:\n• **Conference Theme & Overview**\n• **Single & Double Occupancy Packages**\n• **16 CIB CPD Accreditation Hours**\n• **Instant Online Registration & MoMo Payment**\n• **Keynote Speakers & Masterclasses**";
    } else if (q.includes('who are you') || q.includes('what can you do') || q.includes('help me') || q.includes('what do you do')) {
      reply = "I am the official **CIB Ghana AI Visitor Concierge**! 🏛️\n\nI am designed to converse with you in real-time to answer questions about the **30th National Banking & Ethics Conference 2026**, guide you through registration and Paystack payments, explain delegate packages at Aqua Safari Resort, outline the 16 CPD hours under Act 991, and connect you with the CIB Secretariat.";
    } else if (q.includes('thank') || q.includes('awesome') || q.includes('great') || q.includes('perfect') || q.includes('ok') || q.includes('alright')) {
      reply = "You are most welcome! 😊 It is our pleasure to assist you. If you need any further details on the conference or would like to secure your early bird chalet reservation at Aqua Safari, feel free to ask or click below to register!";
    } else if (q.includes('package') || q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('room') || q.includes('single') || q.includes('double') || q.includes('rate') || q.includes('accommodation') || q.includes('chalet')) {
      reply = "🎟️ **Accommodation & Event Packages (Aqua Safari, Ada)**:\n\n• **Single Occupancy Package**: **GHS 5,600**\n  Includes 2 nights private luxury chalet accommodation, full conference access, Masterclass fee, 2 nights banquet dinners, and resort leisure activities.\n\n• **Double Occupancy Package**: **GHS 4,000**\n  Includes shared 2 nights accommodation, conference access, Masterclass fee, 2 nights dinner, and resort activities.\n\n• **Standard Conference Pass**: **GHS 1,200**\n\n*Early Bird rates expire 20th October 2026.*";
    } else if (q.includes('pay') || q.includes('momo') || q.includes('mobile money') || q.includes('card') || q.includes('paystack') || q.includes('visa') || q.includes('mastercard')) {
      reply = "💳 **Payment Options & Security**:\n\nAll payments are processed securely through **Paystack** with 256-bit encryption:\n\n• **Mobile Money**: MTN Mobile Money, Telecel Cash, and AT Money.\n• **Bank Cards**: Visa and Mastercard debit/credit cards.\n\nUpon payment clearance, your official **Digital QR Pass** and tax invoice are generated and dispatched immediately to your email.";
    } else if (q.includes('register') || q.includes('how to') || q.includes('sign up') || q.includes('enroll') || q.includes('ticket')) {
      reply = "📝 **How to Register in 4 Easy Steps**:\n\n1. **Select Membership**: Choose ACIB, FCIB, Student, or Non-Member.\n2. **Enter Delegate Details**: Name, corporate email, phone, organization, and designation.\n3. **Choose Attendance Mode**: Select In-Person at Aqua Safari or Virtual Livestream.\n4. **Pick Package & Masterclass**: Select Single (GHS 5,600) or Double (GHS 4,000) occupancy and your preferred training track.\n5. **Instant Checkout**: Pay securely with MTN MoMo, Telecel Cash, AT Money, or Visa/Mastercard via Paystack.";
    } else if (q.includes('masterclass') || q.includes('training') || q.includes('track') || q.includes('workshop')) {
      reply = "🧠 **Executive Masterclass Tracks (Included in Package)**:\n\n1. **Track 1**: Deploying AI to Combat Modern Fraud in International Trade Finance (Machine learning fraud detection & invoice spoofing prevention).\n2. **Track 2**: Cybersecurity and Fraud Detection (Defending core banking infrastructure against ransomware and synthetic identity attacks).\n3. **Track 3**: Virtual Assets and Impact (eCedi central bank digital currency, tokenized deposits, and digital asset regulation).";
    } else if (q.includes('member') || q.includes('acib') || q.includes('fcib') || q.includes('student') || q.includes('non-member')) {
      reply = "👥 **CIB Ghana Membership Categories**:\n\n• **ACIB (Associate Chartered Banker)**: Certified professional members who have passed all qualification stages.\n• **FCIB (Fellow)**: Distinguished senior banking executives honored for exceptional leadership.\n• **Student Member**: Trainees actively pursuing professional banking qualifications.\n• **Non-Member**: Corporate executives, fintech professionals, and industry observers welcome to register.";
    } else if (q.includes('cpd') || q.includes('hour') || q.includes('point') || q.includes('credit') || q.includes('certificate')) {
      reply = "🎓 **16 Accredited CIB CPD Hours**:\n\n• Under the **Chartered Institute of Bankers Ghana Act, 2019 (Act 991)**, all licensed banking practitioners are required to maintain continuous professional competence.\n• Attending the 30th Conference awards **16 certified CPD hours**.\n• Attendance is verified via your digital QR ticket, and official certificates are downloadable directly from the Delegate Portal upon conference conclusion.";
    } else if (q.includes('venue') || q.includes('where') || q.includes('hotel') || q.includes('ada') || q.includes('aqua safari')) {
      reply = "📍 **Venue & Location**:\n\n• **Venue**: **Aqua Safari Resort, Ada, Greater Accra, Ghana**\n• **Setting**: Ghana's top riverfront luxury resort situated along the serene Volta River estuary.\n• **Amenities Included**: Air-conditioned conference halls, high-speed WiFi, waterfront dining, pontoon boat cruises, and luxury chalets.\n• **Accessibility**: Executive shuttle and on-site parking available for all registered delegates.";
    } else if (q.includes('date') || q.includes('when') || q.includes('day') || q.includes('november') || q.includes('deadline')) {
      reply = "📅 **Conference Schedule & Key Dates**:\n\n• **Dates**: **8th – 10th November, 2026** (3-Day Executive Programme)\n• **Early Bird Deadline**: **20th October, 2026** (Book early to secure discounted luxury chalet accommodation)\n• **Registration Close**: 5th November, 2026\n• **Daily Hours**: 08:00 AM – 17:30 GMT (followed by evening networking banquets)";
    } else if (q.includes('speaker') || q.includes('governor') || q.includes('asiama') || q.includes('george') || q.includes('dzato') || q.includes('faculty') || q.includes('who is speaking') || q.includes('panel')) {
      reply = "🎙️ **Featured Conference Faculty & Keynotes (18 Distinguished Leaders)**:\n\n• **Robert Dzato (FCIB)** — CEO, CIB Ghana\n• **Dr. Johnson Pandit Asiama, FCIB(Hon.)** — Governor, Bank of Ghana\n• **Hon. Samuel Nartey George** — Minister for Communication, Digital Technology & Innovations\n• **Hon. Haruna Iddrisu** — Minister for Education\n• **Dr. Stephane Nwolley** — Digital Currency & Virtual Assets Architect\n• **Dr. Albert Antwi-Bosiako** — Cybersecurity & Anti-Fraud Leader\n• **Clifford Duke Mettle, FCIB** — Trade Finance Leader\n• **Rita Elumelu, FCIB** — Financial Crime & Trade Specialist\n• **Doris Ahiati, FCIB** — Executive Corporate Governance Leader\n• **Farihan Alhassan** — Head of Banking Supervision & Risk\n• **Dr. Marcel Lukas** — Associate Professor in FinTech (Univ. of St Andrews)\n• **John Awuah** — CEO, Ghana Association of Banks\n• **Emelia Sackey, FCIB** — Executive Director of Ethics & Governance\n• **Frank Tawiah** — Virtual Assets & Tokenization Specialist\n• **Philip Twum, ACIB** — Digital Strategy & FinTech Partner\n• **Philip Kwaw Sebuabe** — Head of Digital Rails & Virtual Assets\n• **Paul Baah Sackey, FCIB** — Fellow & Senior Banking Leader\n• **Charles Ofori Acquah, FCIB** — Fellow & Executive Banking Advisor";
    } else if (q.includes('whatsapp') || q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('call')) {
      reply = "📞 **CIB Ghana Secretariat Contact Channels**:\n\n• 📱 **WhatsApp Support**: **+233 (0) 50 633 9248** (Instant response)\n• 📞 **Telephone**: **+233 (0) 302 541 308**\n• 📧 **Event Secretariat**: `events@cibgh.org`\n• 📧 **General Inquiries**: `info@cibgh.org`\n• 🏢 **Head Office**: CIB Ghana Secretariat, Trinity Avenue, Okponglo - East Legon, Accra, Ghana\n• 🕒 **Hours**: Monday to Friday: 8:00 AM – 5:00 PM GMT";
    } else if (q.includes('sponsor') || q.includes('partner') || q.includes('exhibit')) {
      reply = "🤝 **Sponsorship & Exhibition Opportunities**:\n\nPartner with CIB Ghana to showcase financial technology and services to 650+ banking executives:\n\n• **Platinum Partner**: Keynote session, brand spotlight, and VIP lounge host.\n• **Gold Partner**: 10 delegate passes & executive exhibition foyer booth.\n• **Silver Partner**: Dedicated branding & delegate pack inclusion.\n\n*Key Partners include Bank of Ghana, StanChart, Ecobank, GCB Bank, and GhIPSS.*";
    } else if (q.includes('about') || q.includes('theme') || q.includes('conference') || q.includes('what is')) {
      reply = "The **30th National Banking & Ethics Conference 2026** is Ghana's premier gathering of commercial bank CEOs, central bank regulators, board chairs, and financial executives hosted by the Chartered Institute of Bankers, Ghana.\n\n• **Theme**: *'Banking on the Future — Trust, Technology and Transformation'*\n• **Key Pillars**: Ethical Corporate Governance, AI-Driven Fraud Prevention, Climate Finance & ESG, and AfCFTA Cross-Border Trade Rails.\n• **Accreditation**: Awards **16 CIB CPD Credits** recognized sector-wide under Act 991.";
    } else if (q.includes('cib') || q.includes('act 991') || q.includes('mandate') || q.includes('motto')) {
      reply = "🏛️ **About the Chartered Institute of Bankers, Ghana (CIB Ghana)**:\n\n• **Legal Mandate**: Established by an Act of Parliament — **Chartered Institute of Bankers Ghana Act, 2019 (Act 991)**.\n• **Role**: The statutory regulatory and certification body for banking professionals in Ghana, upholding international ethical benchmarks and financial competence.\n• **Motto**: *'Honesty and Integrity'*\n• **Leadership**: Governed by the CIB Governing Council and led by CEO **Robert Dzato (FCIB)**.\n• **Secretariat**: Trinity Avenue, Okponglo - East Legon, Accra.";
    } else {
      reply = `Thank you for your question! As the CIB Ghana AI Concierge, I can assist you with all information regarding the **30th National Banking & Ethics Conference 2026** (8–10 Nov 2026 at Aqua Safari Resort, Ada), delegate packages (Single GHS 5,600 / Double GHS 4,000), 16 accredited CPD hours, speaker faculty, and online registration via Paystack.\n\nYou can also contact the event secretariat on WhatsApp at **+233 50 633 9248** for direct personalized assistance!`;
    }

    return res.json({
      success: true,
      reply,
      provider: 'cib-knowledge-engine',
    });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
});

export default router;
