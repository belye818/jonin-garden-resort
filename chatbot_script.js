/* ── Jo-Nin Garden Resort Chatbot Script ── */

const SYSTEM_PROMPT = `You are the friendly virtual assistant for Jo-Nin Garden Resort, a tropical day resort in Brgy. Cruz, Silang, Cavite, Philippines. Keep responses short (2–4 sentences max), warm, and helpful. Use simple English. Always be welcoming.

Key facts:
- Location: Brgy. Cruz, Silang, Cavite, Philippines
- Hours: Monday–Sunday, 7:00 AM – 10:00 PM
- Phone: +63 912 345 6789
- Email: info@joningardenresort.ph
- Facebook: facebook.com/profile.php?id=100063576504631

Rates:
- Day Pass: ₱80–₱150 per person
- Night Pass: ₱80–₱150 per person
- Cottages: ₱400–₱1,000 depending on group size
- Event Package: ₱600–₱3,500 per event

Amenities:
- Multiple swimming pools (kiddie pool and adult lanes)
- Poolside cottages with tables and seating
- Function halls for events and parties
- Food stalls and refreshment kiosks
- Garden picnic areas
- Locker rooms and shower facilities
- Wi-Fi access
- Event lights and music support

Booking: Guests can book online after creating an account, or call/message us directly. Walk-ins are also welcome.

If someone asks something you don't know, suggest they call or message the resort directly. Never make up prices or facts not listed above.`;

/* ── FAQ instant-match database ── */
const FAQ = [
  {
    keywords: ['rate', 'price', 'cost', 'how much', 'bayad', 'magkano', 'fee', 'entrance', 'admission'],
    answer: `Here are our current rates:\n\nDay/Night Pass — ₱80–₱150 per person\nCottages — ₱400–₱1,000 (group size based)\nEvent Package — ₱600–₱3,500 per event\n\nWant more details on a specific package?`
  },
  {
    keywords: ['amenity', 'amenities', 'facilities', 'feature', 'offer', 'meron', 'available', 'pwede'],
    answer: `We have lots to enjoy at Jo-Nin! Swimming pools (kiddie + adult lanes), poolside cottages, function halls, food stalls, garden picnic areas, locker rooms & showers, Wi-Fi, and event lighting & music. Perfect for all ages!`
  },
  {
    keywords: ['book', 'reserve', 'reservation', 'mag-book', 'mag-reserve', 'how to', 'schedule'],
    answer: `Booking is easy! You can:\n1. Create an account here on our site and book online\n2. Call us at +63 912 345 6789\n3. Message us on Facebook\n4. Walk in anytime during operating hours (7 AM – 10 PM)!`
  },
  {
    keywords: ['location', 'located', 'address', 'where', 'saan', 'lugar', 'find', 'directions', 'map', 'silang', 'cavite'],
    answer: `We're located at Brgy. Cruz, Silang, Cavite, Philippines. 📍 Nestled in lush greenery — a beautiful tropical escape just outside the city! Need directions? Message us on Facebook and we'll guide you there.`
  },
  {
    keywords: ['hours', 'open', 'close', 'time', 'bukas', 'oras', 'schedule', 'operating'],
    answer: `Jo-Nin Garden Resort is open every day! \n\nMonday–Sunday: 7:00 AM – 10:00 PM\n\nWe're open all week, including holidays!`
  },
  {
    keywords: ['pool', 'swim', 'swimming', 'kiddie', 'adult', 'lane', 'tubig', 'naligo'],
    answer: `We have multiple pools for all ages! There's a kiddie splash area for the little ones and adult lanes for swimming laps or just chilling. Crystal clear and refreshing!`
  },
  {
    keywords: ['cottage', 'kubo', 'shelter', 'shade', 'group', 'family', 'table', 'seat'],
    answer: `Our poolside cottages are perfect for groups and families! Shaded with tables and seating. Rates range from ₱400–₱1,000 depending on group size. Great for reunions and outings!`
  },
  {
    keywords: ['event', 'party', 'birthday', 'fiesta', 'celebration', 'debut', 'reunion', 'outing', 'function', 'hall'],
    answer: `We love hosting celebrations! Our Event Package (₱600–₱3,500) covers function halls, event lighting, music support, and more. Perfect for birthdays, company outings, and reunions. Call us to plan yours!`
  },
  {
    keywords: ['food', 'eat', 'kain', 'snack', 'drink', 'refreshment', 'stall', 'kiosk', 'restaurant', 'menu'],
    answer: `Yes, we have food stalls and refreshment kiosks on-site! Enjoy local Filipino favorites and snacks without leaving the resort. You can also bring your own food for picnics in the garden area.`
  },
  {
    keywords: ['contact', 'call', 'phone', 'number', 'email', 'message', 'facebook', 'fb', 'reach'],
    answer: `Here's how to reach us! \n\nPhone: +63 912 345 6789\nEmail: info@joningardenresort.ph\nFacebook: Jo-Nin Garden Resort\nAddress: Brgy. Cruz, Silang, Cavite\nHours: 7:00 AM – 10:00 PM daily`
  },
  {
    keywords: ['wifi', 'wi-fi', 'internet', 'signal', 'connection', 'connect'],
    answer: `Yes, we have Wi-Fi available at the resort! Stay connected while you relax. We also have event lighting and music support for parties and gatherings.`
  },
  {
    keywords: ['locker', 'shower', 'change', 'dress', 'cr', 'comfort room', 'bathroom', 'toilet'],
    answer: `We have locker rooms and fresh water shower facilities for your comfort! Change in and out conveniently so you can enjoy your stay without worry.`
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'kumusta', 'kamusta', 'musta'],
    answer: `Hi there! Welcome to Jo-Nin Garden Resort! I'm here to help you with rates, bookings, amenities, and more. What would you like to know?`
  },
  {
    keywords: ['thank', 'thanks', 'salamat', 'ty', 'appreciate'],
    answer: `You're very welcome! We hope to see you soon at Jo-Nin Garden Resort. If you have more questions, just ask anytime!`
  }
];

/* ── State ── */
let conversationHistory = [];
let chatOpen = false;
let isSending = false;
let lastUserMessage = '';

/* ── FAQ matcher ── */
function matchFAQ(text) {
  const lower = text.toLowerCase();
  for (const faq of FAQ) {
    if (faq.keywords.some(kw => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return null;
}

/* ── Duplicate detection ── */
function isDuplicate(text) {
  return text.toLowerCase().trim() === lastUserMessage.toLowerCase().trim();
}

/* ── UI helpers ── */
function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chat-window');
  const badge = document.getElementById('chat-badge');
  win.classList.toggle('hidden', !chatOpen);
  if (chatOpen) {
    badge.classList.add('hidden');
    setTimeout(() => document.getElementById('chat-input')?.focus(), 200);
  }
}

function sendQuick(text) {
  const qr = document.getElementById('quick-replies');
  if (qr) qr.remove();
  const input = document.getElementById('chat-input');
  if (input) input.value = text;
  sendMessage();
}

function addBubble(text, role) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + role;
  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-line';
  p.textContent = text;
  div.appendChild(p);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function addInfoBubble(text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble info-tip';
  const p = document.createElement('p');
  p.textContent = text;
  div.appendChild(p);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble bot';
  div.id = 'typing-bubble';
  div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-bubble');
  if (t) t.remove();
}

function setSendDisabled(val) {
  const btn = document.querySelector('.chat-send');
  const input = document.getElementById('chat-input');
  if (btn) btn.disabled = val;
  if (input) input.disabled = val;
  isSending = val;
}

/* ── Main send ── */
async function sendMessage() {
  if (isSending) return;

  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  /* Duplicate check */
  if (isDuplicate(text)) {
    input.value = '';
    addInfoBubble('You already asked that! Check my previous answer above, or rephrase your question.');
    return;
  }

  input.value = '';
  const qr = document.getElementById('quick-replies');
  if (qr) qr.remove();

  addBubble(text, 'user');
  lastUserMessage = text;

  /* ── FAQ first (instant) ── */
  const faqAnswer = matchFAQ(text);
  if (faqAnswer) {
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: faqAnswer });
    trimHistory();
    addBubble(faqAnswer, 'bot');
    return;
  }

  /* ── Claude API fallback ── */
  setSendDisabled(true);
  conversationHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const data = await response.json();
    removeTyping();

    const reply = (data && data.content && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : 'Sorry, I couldn\'t get a response right now. Please call us at +63 912 345 6789!';

    conversationHistory.push({ role: 'assistant', content: reply });
    trimHistory();
    addBubble(reply, 'bot');

    if (!chatOpen) {
      const badge = document.getElementById('chat-badge');
      if (badge) badge.classList.remove('hidden');
    }

  } catch (err) {
    removeTyping();
    conversationHistory.pop();
    addBubble('Oops! Something went wrong. You can call us directly at +63 912 345 6789.', 'bot');
    console.error('Chatbot error:', err);
  } finally {
    setSendDisabled(false);
    document.getElementById('chat-input')?.focus();
  }
}

/* ── Trim history to last 20 turns ── */
function trimHistory() {
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
}

/* ── Enter key listener ── */
document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});