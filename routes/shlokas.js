const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

const shlokaAudioMeta = {
  effort: {
    audio_url: '/sounds/gita247.m4a',
    reciter: 'Traditional Gita Chanting (T.S. Ranganathan)',
    online_source: 'https://archive.org/details/SrimadBhagavadGita_201712',
    phonetic_guide: 'Kar-man-yay-vaa-dhi-kaa-ras tay, maa fa-lay-shoo ka-daa-cha-na | Maa kar-ma-fa-la-hay-toor-bhoor, maa tay sang-go ast-va-kar-ma-ni'
  },
  peace: {
    audio_url: '/sounds/gita270.m4a',
    reciter: 'Traditional Gita Recitation (T.S. Ranganathan)',
    online_source: 'https://archive.org/details/SrimadBhagavadGita_201712',
    phonetic_guide: 'Aa-poor-ya-maa-nam a-cha-la pra-tish-tham, sa-mud-ram aa-pah pra-vi-shan-ti yad-vat'
  },
  gayatri: {
    audio_url: '/sounds/gayatri.m4a',
    audio_url_ogg: '/sounds/gayatri.ogg',
    reciter: 'Traditional Vedic Chanting (Wikimedia Commons Hindu Mantra Archives)',
    online_source: 'https://commons.wikimedia.org/wiki/File:Gayatri_mantra.ogg',
    phonetic_guide: 'Aum Bhoor Bhoo-vah Svah | Tat Sa-vi-toor Va-ray-nyam Bhar-go Day-vas-ya Dhee-ma-hee | Dhi-yo Yo Nah Pra-cho-da-yaat'
  },
  vakratunda: {
    audio_url: '/sounds/vakratunda.m4a',
    reciter: 'Traditional Sanskrit Prarthana (Internet Archive Hindu Heritage)',
    online_source: 'https://archive.org/details/VakratundaMahakaya',
    phonetic_guide: 'Vak-ra-toon-da Ma-haa-kaa-ya Soor-ya-ko-ti Sa-ma-pra-bha | Nir-vigh-nam Koo-roo May Day-va Sar-va Kaar-yay-shoo Sar-va-daa'
  },
  sarve: {
    audio_url: '/sounds/sarve.m4a',
    reciter: 'Authentic Sanskrit Benediction by Pandit Vishwa Bhooshan Arya',
    online_source: 'https://archive.org/details/a_20210625_202106',
    phonetic_guide: 'Sar-vay Bha-van-too Soo-khi-nah, Sar-vay San-too Nee-raa-ma-yaah | Sar-vay Bhad-raa-nee Pash-yan-too, Maa Kash-chid Dooh-kha-bhaag Bha-vayt'
  },
  mrityunjaya: {
    audio_url: '/sounds/mrityunjaya.m4a',
    audio_url_ogg: '/sounds/mrityunjaya.ogg',
    reciter: 'Authentic Recitation by Rameshvar (Free Art License, Wikimedia Commons)',
    online_source: 'https://commons.wikimedia.org/wiki/File:Mrityunjaya.ogg',
    phonetic_guide: 'Aum Tryam-ba-kam Ya-jaa-ma-hay Soo-gan-dhim Poosh-ti-var-dha-nam | Oor-vaa-roo-kam Ee-va Ban-dha-naan Mrit-yor Mook-shee-ya Maam-ri-taat'
  }
};

// GET /api/shlokas - List all shlokas
router.get('/', (req, res) => {
  try {
    const shlokas = db.prepare(`
      SELECT id, slug, title, source, devanagari, transliteration, simple_meaning, word_breakdown, audio_text
      FROM shlokas
      ORDER BY id ASC
    `).all();

    const formatted = shlokas.map(s => {
      const meta = shlokaAudioMeta[s.slug] || {};
      return {
        ...s,
        word_breakdown: s.word_breakdown ? JSON.parse(s.word_breakdown) : [],
        audio_url: meta.audio_url || null,
        audio_url_ogg: meta.audio_url_ogg || null,
        reciter: meta.reciter || null,
        online_source: meta.online_source || null,
        phonetic_guide: meta.phonetic_guide || null
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shlokas/:slug - Get detailed shloka by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const shloka = db.prepare('SELECT * FROM shlokas WHERE slug = ?').get(slug);

    if (!shloka) {
      return res.status(404).json({ success: false, error: `Shloka '${slug}' not found` });
    }

    const meta = shlokaAudioMeta[slug] || {};
    res.json({
      success: true,
      data: {
        ...shloka,
        word_breakdown: shloka.word_breakdown ? JSON.parse(shloka.word_breakdown) : [],
        audio_url: meta.audio_url || null,
        audio_url_ogg: meta.audio_url_ogg || null,
        reciter: meta.reciter || null,
        online_source: meta.online_source || null,
        phonetic_guide: meta.phonetic_guide || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
