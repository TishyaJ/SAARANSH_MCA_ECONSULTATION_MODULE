const express = require('express');
const router = express.Router();
const gtts = require('google-tts-api');
const fetch = require('node-fetch');

// Proxy external audio URLs (e.g. Google Translate TTS) to avoid CORS and referer problems.
// GET /api/documents/:id/audio-proxy?u={encodedUrl}
router.get('/documents/:id/audio-proxy', async (req, res) => {
  try {
    const { u } = req.query;
    if (!u) return res.status(400).json({ success: false, message: 'Missing url (u) parameter' });
    const decoded = decodeURIComponent(u);
    // Basic allowlist to reduce SSRF risk; only allow translate.google.com hosts for now
    let parsed;
    try {
      parsed = new URL(decoded);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }
    const allowedHosts = ['translate.google.com', 'translate.googleusercontent.com'];
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(400).json({ success: false, message: 'URL host not allowed' });
    }

    const upstream = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://translate.google.com/'
      }
    });
    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream returned ${upstream.status}`);
    }
    // Forward content-type and stream body
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    // allow cross-origin from frontend dev server
    res.setHeader('Access-Control-Allow-Origin', '*');
    upstream.body.pipe(res);
  } catch (err) {
    console.error('audio-proxy error', err);
    return res.status(500).json({ success: false, message: 'Audio proxy error' });
  }
});

// Return section-wise summaries and audio URLs for each section using google-tts-api
// GET /api/documents/:id/summary?lang=hi
router.get('/documents/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang || 'en').toLowerCase();

    // Base English sections (1..8)
    const sectionsEN = [
      { id: 1, title: 'Objective', text: 'The Government of India and MCA aim to build globally competitive Indian Multi-Disciplinary Partnership (MDP) firms in consulting and auditing, reducing dependence on multinational firms and supporting Atmanirbhar Bharat.' },
      { id: 2, title: 'Background Gaps', text: 'A Background Note highlights gaps between Indian firms and large international networks in scale, branding, technology, integration of services, and talent investment.' },
      { id: 3, title: 'Strengths of International Firms', text: 'International firms use multidisciplinary models, global networks, strong brands, partnership structures, advanced technology platforms, and substantial investment in talent and training.' },
      { id: 4, title: 'Regulatory Barriers', text: 'Current Indian regulations limit growth—restrictions on advertising/branding, narrow MDP rules, fragmented licensing across professions, procurement norms that favor global players, and the broad "Indian" definition in procurement orders.' },
      { id: 5, title: 'Recent Reforms', text: 'RBI and ICAI have introduced measures (e.g., audit diversification, joint audits, and enabling combinations) to open opportunities for larger Indian firms, but structural reforms remain necessary.' },
      { id: 6, title: 'Proposed Changes', text: 'Simplify mergers under Section 233 where appropriate, revisit professional regulation and MDP eligibility, reform procurement criteria to level the playing field, and clarify the definition of "Indian" for public procurement.' },
      { id: 7, title: 'Consultation Topics', text: 'The paper requests section-wise feedback on regulatory amendments, safeguards for MDPs, dispute resolution mechanisms, brand-building without unethical solicitation, international best practices, and measures to improve global competitiveness.' },
      { id: 8, title: 'Outcome Goal', text: 'Enable Indian firms to scale, innovate, and build global brands across audit, advisory, ESG, and multidisciplinary consultancy services while maintaining professional ethics and investor protections.' }
    ];

    // Simple translations for testing (mirrors English structure) - in a real setup call a paid provider
    const translations = {
      hi: [
        { id:1, title:'उद्देश्य', text: 'भारत सरकार और MCA परामर्श और ऑडिट में वैश्विक प्रतिस्पर्धी बहु-विषयक साझेदारी (MDP) फर्मों के निर्माण का लक्ष्य रखते हैं, ताकि बहुराष्ट्रीय फर्मों पर निर्भरता कम हो और आत्मनिर्भर भारत को समर्थन मिले।' },
        { id:2, title:'पृष्ठभूमि अंतर', text: 'एक पृष्ठभूमि नोट ने भारतीय फर्मों और बड़े अंतरराष्ट्रीय नेटवर्क के बीच पैमाने, ब्रांडिंग, प्रौद्योगिकी, सेवाओं के एकीकरण और प्रतिभा निवेश में अंतर को उजागर किया है।' },
        { id:3, title:'अंतरराष्ट्रीय फर्मों की ताकत', text: 'अंतरराष्ट्रीय फर्में बहु-विषयक मॉडल, वैश्विक नेटवर्क, मजबूत ब्रांड, साझेदारी संरचनाएँ, उन्नत प्रौद्योगिकी प्लेटफ़ॉर्म और प्रतिभा व प्रशिक्षण में भारी निवेश का उपयोग करती हैं।' },
        { id:4, title:'नियामक बाधाएँ', text: 'वर्तमान भारतीय नियम विकास को सीमित करते हैं—विज्ञापन/ब्रांडिंग पर प्रतिबंध, संकुचित MDP नियम, विभिन्न पेशेवर लाइसेंसिंग, और सार्वजनिक खरीद में "भारतीय" की व्यापक परिभाषा।' },
        { id:5, title:'हालिया सुधार', text: 'RBI और ICAI ने बड़े भारतीय फर्मों के लिए अवसर खोलने हेतु उपाय (जैसे ऑडिट विविधीकरण, संयुक्त ऑडिट) पेश किए हैं, पर संरचनात्मक सुधार आवश्यक हैं।' },
        { id:6, title:'प्रस्तावित बदलाव', text: 'धारा 233 के तहत विलय को सरल बनाना, पेशेवर नियम व MDP पात्रता पर पुनर्विचार, निजीकरण मानदंडों में सुधार और सार्वजनिक खरीद के लिए "भारतीय" की परिभाषा स्पष्ट करना।' },
        { id:7, title:'परामर्श विषय', text: 'यह पेपर नियमों में संशोधन, MDP के लिए सुरक्षा प्रावधानों, विवाद निवारण तंत्रों, ब्रांड-निर्माण, अंतरराष्ट्रीय सर्वोत्तम प्रथाओं और वैश्विक प्रतिस्पर्धा बढ़ाने के उपायों पर अनुभाग-वार इनपुट मांगता है।' },
        { id:8, title:'परिणामी लक्ष्य', text: 'भारतीय फर्मों को स्केल, नवाचार और वैश्विक ब्रांड बनाने में सक्षम बनाना, साथ ही पेशेवर नैतिकता और निवेशक सुरक्षा बनाए रखना।' }
      ],
      es: sectionsEN.map(s => ({ id: s.id, title: s.title, text: `ES (${s.title}): ${s.text}` })),
      ta: sectionsEN.map(s => ({ id: s.id, title: s.title, text: `TA (${s.title}): ${s.text}` })),
      en: sectionsEN
    };

    const chosen = translations[lang] || translations['en'];

    // Generate google-tts-api audio URLs for each section (fast, no API key needed)
    const sectionsWithAudio = await Promise.all(chosen.map(async (sec) => {
      const ttsLang = lang === 'hi' ? 'hi' : lang === 'es' ? 'es' : lang === 'ta' ? 'ta' : 'en';
      try {
        const rawUrl = gtts.getAudioUrl(sec.text, {
          lang: ttsLang,
          slow: false,
          host: 'https://translate.google.com'
        });
        // Proxy the audio through our backend to avoid CORS / referer issues
        const proxied = `/api/documents/${id}/audio-proxy?u=${encodeURIComponent(rawUrl)}`;
        return { id: sec.id, title: sec.title, text: sec.text, audioUrl: proxied };
      } catch (err) {
        // If text too long, try to get multiple URLs (first one used as a quick fallback)
        try {
          const urls = await gtts.getAllAudioUrls(sec.text, { lang: ttsLang, host: 'https://translate.google.com' });
          const proxiedFirst = urls && urls.length ? `/api/documents/${id}/audio-proxy?u=${encodeURIComponent(urls[0].url || urls[0])}` : null;
          const proxiedList = urls && urls.length ? urls.map(u => ({ ...u, proxied: `/api/documents/${id}/audio-proxy?u=${encodeURIComponent(u.url || u)}` })) : null;
          return { id: sec.id, title: sec.title, text: sec.text, audioUrl: proxiedFirst, audioUrls: proxiedList };
        } catch (e) {
          // No audio available; return text-only
          return { id: sec.id, title: sec.title, text: sec.text, audioUrl: null };
        }
      }
    }));

    const confidence = 4.2;
    return res.json({ success: true, sections: sectionsWithAudio, confidence });
  } catch (err) {
    console.error('documents summary error', err);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

module.exports = router;

