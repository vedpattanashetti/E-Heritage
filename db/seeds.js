const { db } = require('./database');

function seedDatabase() {
  // 1. Stories
  const countStories = db.prepare('SELECT COUNT(*) as count FROM stories').get().count;
  if (countStories === 0) {
    const insertStory = db.prepare(`
      INSERT INTO stories (slug, title, source_epic, theme, simple_text, middle_text, detail_text, try_today)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const stories = [
      [
        'hanuman',
        'Hanuman',
        'Ramayana',
        'Courage, Loyalty & Selfless Service',
        'Hanuman is remembered for being brave, loyal, and humble. Even though he has incredible strength, he always uses it to support others and never boasts about his abilities.',
        'When the vanaras had to find Sita across the ocean, Hanuman initially forgot how capable he was until his mentors reminded him. Once encouraged, he took the mighty leap to Lanka with single-minded focus.',
        'In classical traditions, Hanuman is celebrated not merely for physical valor, but as a master of grammar (Nava Vyakarana Pandita), diplomatic tact, and humility. When offered praise, he attributed every victory to Rama.',
        'Use a skill you are good at (like math, drawing, or sports) to help someone else succeed.'
      ],
      [
        'rama',
        'Rama',
        'Ramayana',
        'Duty, Integrity & Promise-keeping',
        'Rama is admired for being dependable and keeping promises, even when honoring them requires sacrifice.',
        'Rama chose to honor his father’s word and accept forest exile without bitterness. His life is studied as a journey in balancing family duties, personal feelings, and leadership responsibilities.',
        'Rama is described as adhering to righteous boundaries (Maryada). Across regional versions (Valmiki, Kambar, Tulsidas), his decisions prompt rich debate about the sacrifices required by duty and governance.',
        'If you say you will help clean up or do your part in a group project, follow through completely.'
      ],
      [
        'sita',
        'Sita',
        'Ramayana',
        'Inner Resilience, Dignity & Agency',
        'Sita is remembered for her kindness, inner strength, and steadfast dignity during challenging times in the Ashoka forest.',
        'Sita refused to be intimidated by Ravana. She drew upon her inner conviction, spoke with fearless clarity, and chose her own principles over comfort.',
        'In literary and folk traditions across South Asia, Sita is portrayed as deeply connected to the Earth (Bhumija), strong-willed, and morally uncompromising.',
        'When you feel left out or frustrated, stay calm and treat yourself and others with kindness.'
      ],
      [
        'krishna',
        'Krishna',
        'Mahabharata & Bhagavatam',
        'Wisdom, Counsel & Joyful Guidance',
        'Krishna teaches that joy, friendship, and wisdom go together. He is known for helping friends through both smiles and thoughtful advice.',
        'Before the Kurukshetra conflict, Krishna traveled personally as an envoy of peace to prevent war. In the Gita, he guides Arjuna through paralysis and anxiety with patience.',
        'Krishna bridges the pastoral sweetness of Vrindavan with the profound metaphysics of the Bhagavad Gita. His teaching of selfless action (Nishkama Karma) transformed ethical philosophy.',
        'Be a good listener when a friend is having a tough day.'
      ],
      [
        'arjuna',
        'Arjuna',
        'Mahabharata',
        'Single-minded Focus & Seeking Mentorship',
        'When asked to shoot an arrow at a target bird in a tree, other students saw branches and leaves. Arjuna saw only the eye of the bird. He teaches the power of dedicated focus.',
        'On the battlefield, Arjuna felt torn about fighting his mentors and cousins. Instead of pretending to be unaffected, he paused and asked Krishna for guidance.',
        'In the dialogue of the Gita, Arjuna represents every human seeker grappling with morality, duty, and emotional attachments. His questions represent universal philosophical inquiries.',
        'Turn off distracting notifications for 25 minutes while finishing your homework.'
      ],
      [
        'karna',
        'Karna',
        'Mahabharata',
        'Unconditional Generosity & Dilemmas of Loyalty',
        'Karna was known as Danaveera (the generous hero). He never turned away anyone who asked for help, even giving away his own protective armor.',
        'Karna faced intense challenges and rejection early in life. When Duryodhana offered him respect, Karna gave his complete loyalty, even when he knew his friend was on the wrong side of dharma.',
        'Karna’s life raises profound questions about social fairness, nobility of character versus birth, and the tragic consequences of misplaced loyalty.',
        'Share something you value with someone in need without expecting anything back.'
      ],
      [
        'panchatantra',
        'The Wise Rabbit',
        'Panchatantra',
        'Wit Over Brute Force',
        'A small rabbit saved the forest from a ferocious lion by using clever thinking instead of fighting. He led the lion to a deep well, where the lion saw his own reflection and jumped in.',
        'Composed by Pandit Vishnu Sharma to educate young princes, Panchatantra stories teach that intelligence, caution, and cooperative friendships can overcome raw power.',
        'Translated into Persian, Arabic (Kalila wa Dimna), Latin, and European languages, the Panchatantra formed the bedrock of global fable literature.',
        'When you face a tough problem, take a deep breath and think of a creative solution.'
      ]
    ];

    for (const story of stories) {
      insertStory.run(...story);
    }
  }

  // 2. Shlokas
  const countShlokas = db.prepare('SELECT COUNT(*) as count FROM shlokas').get().count;
  if (countShlokas === 0) {
    const insertShloka = db.prepare(`
      INSERT INTO shlokas (slug, title, source, devanagari, transliteration, simple_meaning, middle_meaning, detail_meaning, word_breakdown, audio_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const shlokas = [
      [
        'effort',
        'Focus on Effort, Not Anxiety',
        'Bhagavad Gita 2.47',
        'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
        'Karmaṇy evādhikāras te mā phaleṣu kadācana',
        'Put your full heart into doing your work. Do not burn your energy stressing over the outcome.',
        'You have a right to perform your duty, but not to the fruits of action. Do not let results paralyze you, nor should you slip into inaction.',
        'This verse anchors Nishkama Karma (selfless action). It decouples self-worth from external outcomes, fostering mental resilience and psychological freedom.',
        JSON.stringify([
          { word: 'Karmaṇi', meaning: 'In action/duty' },
          { word: 'Adhikāra', meaning: 'Right/capacity' },
          { word: 'Mā phaleṣu', meaning: 'Not in the results' },
          { word: 'Akarmaṇi', meaning: 'In laziness/inaction' }
        ]),
        'Karmany evadhikaras te ma phaleshu kadachana'
      ],
      [
        'peace',
        'Inner Calm & Steadiness',
        'Bhagavad Gita 2.70',
        'आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत्।',
        'Āpūryamāṇam acala-pratiṣṭhaṁ samudram āpaḥ praviśanti yadvat',
        'Be like the deep ocean. Many rivers flow into it, but it stays peaceful and steady.',
        'Just as rivers enter a full, undisturbed ocean without overflowing it, a steady person remains calm despite daily desires and distractions.',
        'This verse forms the crescendo of Krishna description of a Sthitaprajna—one anchored in tranquil awareness.',
        JSON.stringify([
          { word: 'Samudram', meaning: 'The ocean' },
          { word: 'Acala', meaning: 'Unshaken' },
          { word: 'Śāntim', meaning: 'Peace' }
        ]),
        'Apuryamanam achala pratishtham'
      ],
      [
        'gayatri',
        'Prayer for Intellect & Illumination',
        'Rigveda 3.62.10',
        'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
        'Oṁ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṁ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt',
        'A universal prayer asking for the light of wisdom to brighten our minds and guide our choices.',
        'We meditate upon the supreme adorable radiance of the Divine Source, so that it may illuminate and direct our intellect.',
        'Considered one of the oldest recorded prayers in human history, the Gayatri invokes Savitr as the archetype of consciousness dispelling ignorance.',
        JSON.stringify([
          { word: 'Savitur', meaning: 'Divine Source of Light' },
          { word: 'Vareṇyam', meaning: 'Most worthy of adoration' },
          { word: 'Dhīmahi', meaning: 'We meditate upon' },
          { word: 'Dhiyaḥ', meaning: 'Our intellect and thoughts' },
          { word: 'Pracodayāt', meaning: 'May it illuminate' }
        ]),
        'Om bhur bhuvah svah tat savitur varenyam bhargo devasya dhimahi dhiyo yo nah prachodayat'
      ],
      [
        'vakratunda',
        'Removing Obstacles to Start Anew',
        'Ganesha Stuti',
        'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
        'Vakratuṇḍa mahākāya sūryakoṭi samaprabha | Nirvighnaṁ kuru me deva sarvakāryeṣu sarvadā',
        'Chanted when starting a new school year, a test, or a creative project to clear obstacles and stay calm.',
        'O Lord with the curved trunk and immense radiant form shining like a million suns, please make all my good endeavors free from obstacles always.',
        'Ganesha embodies the harmony of intellect and humility, reminding the seeker to overcome internal stumbling blocks like doubt and pride.',
        JSON.stringify([
          { word: 'Vakratuṇḍa', meaning: 'Curved trunk' },
          { word: 'Mahākāya', meaning: 'Immense form' },
          { word: 'Sūryakoṭi', meaning: 'Radiance of million suns' },
          { word: 'Nirvighnam', meaning: 'Free from obstacles' }
        ]),
        'Vakratunda mahakaya suryakoti samaprabha nirvighnam kuru me deva sarvakaryeshu sarvada'
      ],
      [
        'sarve',
        'Universal Peace & Well-being',
        'Brihadaranyaka Upanishad Tradition',
        'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
        'Sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ | Sarve bhadrāṇi paśyantu mā kaścid duḥkhabhāg bhavet',
        'May all living beings be happy, healthy, and see good in the world. May no one suffer.',
        'May all sentient beings experience happiness, may all be free from illness, may all behold auspiciousness and nobility, and may none suffer sorrow.',
        'This benediction expresses Vasudhaiva Kutumbakam: universal empathy wishing well-being for all sentient life without geographical or sectarian borders.',
        JSON.stringify([
          { word: 'Sarve', meaning: 'All beings' },
          { word: 'Sukhinaḥ', meaning: 'Happy and joyful' },
          { word: 'Nirāmayāḥ', meaning: 'Free from disease' },
          { word: 'Bhadrāṇi', meaning: 'Goodness and nobility' }
        ]),
        'Sarve bhavantu sukhinah sarve santu niramayah sarve bhadrani pashyantu ma kashchid duhkhabhag bhavet'
      ],
      [
        'mrityunjaya',
        'Courage, Health & Resilience',
        'Rigveda 7.59.12',
        'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥',
        'Oṁ tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam | Urvārukam iva bandhanān mṛtyor mukṣīya māmṛtāt',
        'A prayer for health, peace, and releasing fear, like a ripe melon naturally separating from its vine.',
        'We honor the Three-Eyed One who nourishes all life. Just as a sweet melon separates naturally from its stem when fully ripe, may we be released from fear and mortality into timeless awareness.',
        'The metaphor of the Urvaruka (melon) ripening gently and freeing itself effortlessly without trauma symbolizes spiritual maturity.',
        JSON.stringify([
          { word: 'Tryambakam', meaning: 'Three-eyed Lord' },
          { word: 'Pustivardhanam', meaning: 'Nourisher of growth' },
          { word: 'Bandhanat', meaning: 'From bondage' },
          { word: 'Amrtat', meaning: 'Into timeless awareness' }
        ]),
        'Om tryambakam yajamahe sugandhim pushtivardhanam urvarukam iva bandhanan mrityor mukshiya mamritat'
      ]
    ];

    for (const shloka of shlokas) {
      insertShloka.run(...shloka);
    }
  }

  // 3. Festivals
  const countFestivals = db.prepare('SELECT COUNT(*) as count FROM festivals').get().count;
  if (countFestivals === 0) {
    const insertFestival = db.prepare(`
      INSERT INTO festivals (slug, name, tagline, season, description, core_theme, traditions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const festivals = [
      [
        'diwali',
        'Diwali (Deepavali)',
        'Festival of Lights, Hope & Gratitude',
        'Autumn (Kartika)',
        'Celebrated with earthen lamps (diyas), colorful rangoli patterns, sweets, and family prayers. It honors the return of Rama and Sita to Ayodhya, and invites Lakshmi into clean, welcoming homes.',
        'Light overcoming darkness, knowledge dispelling ignorance, and renewing relationships.',
        'Lighting diyas, making rangoli, family gatherings, giving sweets, and fireworks in some communities.'
      ],
      [
        'holi',
        'Holi',
        'Festival of Spring, Colors & Friendship',
        'Spring (Phalguna)',
        'Celebrated with natural vibrant powders, music, and festive dishes like gujiya. It commemorates the devotion of Prahlada and celebrates the joyful play of Radha and Krishna.',
        'Spring renewal, forgiving past grudges, and celebrating joy with community.',
        'Singing folk songs, playing with colored powder, sharing delicacies, and bonfire gatherings.'
      ],
      [
        'janmashtami',
        'Krishna Janmashtami',
        'Celebrating Joy, Friendship & Divine Wisdom',
        'Late Summer (Bhadrapada)',
        'Observed at midnight with singing, storytelling, making small footprints to welcome infant Krishna, and high-energy Dahi Handi teamwork towers in Maharashtra and beyond.',
        'Cultivating joy, standing up for justice, and being a supportive friend.',
        'Fasting until midnight, swinging baby Krishna in decorated cradles, singing bhajans, making sweets.'
      ],
      [
        'navratri',
        'Navratri & Durga Puja',
        'Nine Nights of Courage & Divine Feminine',
        'Autumn (Ashvin)',
        'Celebrated differently across India: Garba and Dandiya dancing in Gujarat, magnificent community pandals and cultural art in Bengal, and traditional Golu doll steps in Tamil Nadu.',
        'Honoring courage, fine arts, education, and overcoming internal negativity.',
        'Community dancing, classical music performances, worshipping books and tools on Ayudha Puja.'
      ],
      [
        'ganeshChaturthi',
        'Ganesh Chaturthi',
        'Welcoming Wisdom & Creative Beginnings',
        'Late Summer (Bhadrapada)',
        'Families bring eco-friendly clay murtis of Ganesha into their homes, share modak sweets, and reflect on overcoming obstacles before gently immersing the clay back into water.',
        'Humility, ecological care, and starting projects with clear intentions.',
        'Modak making, eco-friendly clay crafting, community cultural programs.'
      ],
      [
        'rakshaBandhan',
        'Raksha Bandhan',
        'Bonds of Mutual Care & Promise',
        'Monsoon (Shravana)',
        'Sisters and brothers (and close friends) tie decorative threads (rakhi) around each other’s wrists as a promise of lifelong support, respect, and mutual protection.',
        'Unconditional family affection and standing up for one another.',
        'Tying rakhi threads, exchanging gifts and sweets, making promises of support.'
      ],
      [
        'pongal',
        'Pongal / Makar Sankranti',
        'Harvest, Gratitude to Nature & Farmers',
        'Winter (Pausha/Magha)',
        'Marking the sun’s transition into Capricorn, families cook freshly harvested rice and jaggery in pots until it joyfully bubbles over ("Pongalo Pongal!"), thanking cows, farmers, and rain.',
        'Ecological gratitude, seasonal transition, and sharing harvest bounty.',
        'Boiling sweet pongal rice, flying kites, decorating cattle, lighting Bhogi fires.'
      ],
      [
        'mahashivaratri',
        'Maha Shivaratri',
        'The Night of Stillness & Meditation',
        'Late Winter (Phalguna)',
        'An evening dedicated to quietude, fasting, all-night meditation, and chanting Om Namah Shivaya to quiet the restless mind and rediscover inner peace.',
        'Self-discipline, meditation, and finding peace in silence.',
        'All-night vigil (Jagaran), meditation, offering Bilva leaves and milk.'
      ]
    ];

    for (const fest of festivals) {
      insertFestival.run(...fest);
    }
  }

  // 4. Glossary
  const countGlossary = db.prepare('SELECT COUNT(*) as count FROM glossary').get().count;
  if (countGlossary === 0) {
    const insertTerm = db.prepare(`
      INSERT INTO glossary (term, devanagari, definition, example, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const terms = [
      ['Dharma', 'धर्म', 'Living thoughtfully in alignment with truth, ethical duty, and responsibility.', 'Doing your fair share in team projects.', 'Philosophy'],
      ['Karma', 'कर्म', 'The principle of cause and effect: our deliberate intentions and actions shape our future.', 'Speaking kindly brings positive trust.', 'Philosophy'],
      ['Ahimsa', 'अहिंसा', 'Non-harming in thoughts, words, and deeds; showing compassion to all beings.', 'Choosing words that heal rather than hurt.', 'Ethics'],
      ['Moksha', 'मोक्ष', 'Spiritual liberation, self-realization, and freedom from cyclic limitations.', 'Finding lasting peace within oneself.', 'Philosophy'],
      ['Prasad', 'प्रसाद', 'A sacred food offering shared with love and gratitude after prayer.', 'Sharing sweets with all classmates equally.', 'Tradition'],
      ['Bhajan', 'भजन', 'A devotional song sung collectively to foster peace, joy, and reflection.', 'Singing together at gatherings.', 'Music & Sound'],
      ['Aarti', 'आरती', 'A ritual of waving a lit lamp accompanied by songs of gratitude and respect.', 'Lighting up evening family prayers.', 'Ritual'],
      ['Seva', 'सेवा', 'Selfless service performed without seeking praise or personal gain.', 'Volunteering at a food pantry.', 'Ethics'],
      ['Guru', 'गुरु', 'A mentor or teacher who dispels ignorance and guides students toward light.', 'Respecting and thanking your educators.', 'Education'],
      ['Mudra', 'मुद्रा', 'Symbolic hand gestures in art, dance, and meditation conveying peace or focus.', 'Anjali Mudra (hands folded in Namaste).', 'Art & Meditation'],
      ['Rangoli', 'रंगोली', 'Geometric art drawn at home doorways using rice flour or flower petals to welcome guests.', 'Brightening festive celebrations.', 'Art'],
      ['Diya', 'दीया', 'A small clay oil lamp symbolizing light, knowledge, and hope over darkness.', 'Lighting up windowsills during Diwali.', 'Tradition'],
      ['Upanishad', 'उपनिषद्', 'Philosophical texts exploring the nature of consciousness, reality, and inner self.', 'Discussing what constitutes the true self.', 'Literature'],
      ['Gurukul', 'गुरुकुल', 'Ancient learning sanctuary where students lived and learned life skills with a teacher.', 'Modern boarding and residential study camps.', 'Education'],
      ['Veda', 'वेद', 'Ancient foundational texts of knowledge, poetry, and philosophy in Sanskrit.', 'Studying historical hymns and linguistic roots.', 'Literature']
    ];

    for (const term of terms) {
      insertTerm.run(...term);
    }
  }

  // 5. Quizzes
  const countQuizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get().count;
  if (countQuizzes < 100) {
    db.prepare('DELETE FROM quizzes').run();
    try { db.prepare("DELETE FROM sqlite_sequence WHERE name = 'quizzes'").run(); } catch (e) {}
    const insertQuiz = db.prepare(`
      INSERT INTO quizzes (category, question, options, correct_index, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);

    let questionsBank = [];
    try {
      questionsBank = require('../data/all_100_questions.json');
    } catch (e) {
      questionsBank = [];
    }

    if (questionsBank.length > 0) {
      for (const q of questionsBank) {
        const optionTexts = q.options.map(o => o.text);
        let correctIdx = q.options.findIndex(o => o.correct);
        if (correctIdx === -1) correctIdx = 0;
        insertQuiz.run(q.category, q.question, JSON.stringify(optionTexts), correctIdx, q.explanation);
      }
    }
  }

  // 6. Daily Lessons
  const countDaily = db.prepare('SELECT COUNT(*) as count FROM daily_lessons').get().count;
  if (countDaily === 0) {
    const insertDaily = db.prepare(`
      INSERT INTO daily_lessons (value_title, story_connection, try_today)
      VALUES (?, ?, ?)
    `);

    const daily = [
      ['Value: Kindness & Inclusion', 'Story connection: Krishna is celebrated for embracing everyone with open arms, regardless of rank.', 'Try it today: Reach out to a classmate who is sitting alone at lunch or recess.'],
      ['Value: Courage under Pressure', 'Story connection: Hanuman took on the mission to Lanka with humility and calm confidence.', 'Try it today: Try one constructive thing you felt nervous about doing.'],
      ['Value: Dependability & Integrity', 'Story connection: Rama is remembered for standing by his word and keeping promises.', 'Try it today: Complete one household or school task before anyone has to remind you.'],
      ['Value: Inner Stillness', 'Shloka connection: Gita 2.70 advises remaining steady like the deep ocean.', 'Try it today: Take three slow breaths before responding when someone frustrates you.'],
      ['Value: Dedicated Focus', 'Story connection: Arjuna focused only on the target bird’s eye, ignoring leaves and branches.', 'Try it today: Put away your phone for 20 minutes to give 100% focus to one task.'],
      ['Value: Selfless Service (Seva)', 'Cultural connection: Temples and communities prepare langar/prasad for all visitors equally.', 'Try it today: Do a helpful chore at home without asking for anything in return.']
    ];

    for (const d of daily) {
      insertDaily.run(...d);
    }
  }

  console.log('Database seeded successfully.');
}

module.exports = { seedDatabase };
