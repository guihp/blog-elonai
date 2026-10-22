// Copy used by the posting plan in /admin/social. English for the audience; notes for the owner in Portuguese.
// Every verse here is KJV, checked word for word (scripts/check-social-verses.mjs).

import type { HolidayKey } from "@/lib/social/calendar";

// Closing questions for morning verse posts. A question invites real comments; "type Amen" posts get demoted as engagement bait.
export const QUESTIONS = [
  "What is one thing you need to hand over to Him today?",
  "Which word in this verse stands out to you this morning?",
  "Who needs to hear this today? You could send it to them.",
  "Where have you seen God’s faithfulness this week?",
  "What would change today if you really believed this?",
  "What are you trusting Him for right now?",
  "Is there a promise here you have been slow to believe?",
  "How can we pray for you today?",
  "When was the last time this verse carried you through something?",
  "What does rest look like for you this week?",
  "What is God teaching you in this season?",
  "Is there someone you need to forgive, or something you need to let go of?",
  "What is one small way you can live this verse out today?",
  "Which part of this is hardest for you to believe?",
  "What would you tell a friend who needed this verse?",
  "Where do you need His strength most today?",
  "What has God done for you that you never want to forget?",
  "What fear could you name and give to Him today?",
  "How has He surprised you lately?",
  "What are you grateful for this morning?",
  "If you could ask God one thing today, what would it be?",
];

// Image scenes for ChatGPT prompts, picked by words in the verse (first match), otherwise by rotation.
export const SCENES: { words: string[]; scene: string }[] = [
  { words: ["morning", "new every", "dawn", "this is the day"], scene: "first light of sunrise over a quiet meadow with soft mist" },
  { words: ["night", "sleep", "slumber", "lie down"], scene: "a calm bedroom window at night, moonlight through linen curtains, a small candle" },
  { words: ["water", "waters", "rivers", "stream", "sea"], scene: "a still lake at dawn with gentle reflections and reeds along the shore" },
  { words: ["eagle", "wings", "mount up", "hills", "mountain"], scene: "wide mountain valley at golden hour with a single bird high in the sky" },
  { words: ["light", "lamp", "shine", "candle"], scene: "a warm oil lamp glowing on a wooden table beside an open Bible" },
  { words: ["shepherd", "pastures", "sheep", "lamb"], scene: "a green pasture with a few sheep resting under soft afternoon light" },
  { words: ["rock", "tower", "fortress", "refuge", "anchor"], scene: "a lighthouse on rocky cliffs above a calm sea under a pale sky" },
  { words: ["vine", "branches", "fruit"], scene: "close-up of grapevine leaves and branches in warm sunlight" },
  { words: ["seed", "harvest", "reap", "sow", "season"], scene: "a wheat field at sunset with soft golden tones" },
  { words: ["heart", "love", "loved"], scene: "a cup of tea and an open journal with dried flowers on a linen tablecloth" },
  { words: ["rest", "still", "quiet", "peace", "weary"], scene: "a chair by a window with morning light, a blanket and a cup of coffee" },
  { words: ["way", "path", "steps", "feet", "walk"], scene: "a narrow path through a sunlit forest" },
  { words: ["new thing", "wilderness", "desert"], scene: "a small stream running through a dry desert valley at sunrise" },
  { words: ["joy", "rejoice", "glad", "praise"], scene: "white wildflowers in a sunny field with a soft blue sky" },
];
export const DEFAULT_SCENES = [
  "an open Bible on a wooden table with soft window light",
  "a quiet garden bench under a tree in soft morning light",
  "linen fabric, a small vase of white flowers and a candle, minimal and calm",
  "soft clouds in a warm cream and gold sky",
];

// Facebook Page, evening slot: the prayer of the day.
export const EVENING_INTROS = ["A prayer for tonight:", "Before you sleep, pray this with us:", "If you don’t have words tonight, borrow these:"];
export const EVENING_CLOSERS = [
  "If there’s something you’d like us to pray about, send us a message. We read every one.",
  "Need prayer? Send us a private message. You don’t have to explain everything.",
  "Leave a comment if you prayed this tonight, or message us if you want us to pray with you.",
];

// Facebook Page, midday slot, Tuesday.
export const PRAYER_INVITES = [
  "We pray for the requests people send us every week. If you are carrying something heavy, send us a message with your first name and what you’d like prayer for. It stays between us and God.",
  "You don’t have to hold it all by yourself. Tell us what you’re facing in a private message and we will pray for you this week by name.",
  "Is there a situation you have stopped praying about because it feels too big? Send it to us. We would be honored to pray with you.",
];

// Facebook Page, midday slot, Friday.
export const FRIDAY_REFLECTIONS = [
  "The week is almost over. Before you rush into the weekend, take a minute: where did God meet you these last few days? Tell us in the comments. Small stories count.",
  "Some weeks feel like a win and some feel like you barely made it. Either way, you were not alone in it. What is one thing you want to thank Him for tonight?",
  "Friday question: what did God teach you this week, even if it was something small?",
];

// Facebook Page, midday slot, Sunday.
export const SUNDAY_NOTES = [
  "Sunday is for rest. Put the to-do list down for a few hours. He is not measuring your worth by what you got done this week.",
  "Whether you are in church this morning, watching from home or just sitting quietly with your coffee, He is with you right where you are. Happy Sunday.",
  "A new week starts tomorrow. Today, let yourself rest in what He has already done.",
];

// Facebook Page, midday, Wednesday: one free book.
export const BOOK_LINES = [
  "Our free 21-day devotional {title}: {subtitle}. {short} Download the PDF at no cost. The link is in the first comment.",
  "If this is the season you are in, {title} was written for you. {short} It is free, just download and start tomorrow morning. Link in the first comment.",
  "{title} is a free 21-day devotional: {subtitle}. Print it or read it on your phone. The link is in the first comment.",
];

// Your own Facebook group: one post per day, same rhythm as the /community page.
export const GROUP_DAYS: { title: string; variants: string[] }[] = [
  {
    title: "Sunday rest",
    variants: [
      "Happy Sunday, friends. This week we wrote about something many of you have messaged us about. Read it when you have a quiet moment (link in the comments), and tell us what stayed with you.",
      "Sunday check-in: how is your heart today? You can answer in one word if that’s all you have.",
      "Rest is not wasted time. What is one thing you’ll do today just to be with Him?",
    ],
  },
  {
    title: "Verse of the week",
    variants: [
      "Verse of the week:\n\n“{verse}” ({ref})\n\nLet’s memorize this one together. Write it on a sticky note, put it on your phone’s lock screen, say it out loud in the car. Check in on Friday and tell us if it stuck.",
      "This week we’re holding on to {ref}:\n\n“{verse}”\n\nWhich word in it speaks to you the most right now?",
      "New week, one verse:\n\n“{verse}” ({ref})\n\nRead it slowly three times today. Comment “I’m in” if you want to memorize it with us.",
    ],
  },
  {
    title: "Talk about it",
    variants: [
      "Question for the group: when you’re anxious, what helps you turn back to God the fastest? A verse, a song, a walk, a friend?",
      "Let’s be honest with each other today: what is the hardest part of trusting God for you?",
      "What is a verse that carried you through a hard season? Share it so someone else can hold on to it too.",
    ],
  },
  {
    title: "Prayer wall",
    variants: [
      "It’s prayer wall Wednesday. Share a request below (first name only is fine), and before you scroll away, pray for the person who posted right before you.",
      "Prayer wall: what can we pray about for you this week? If it’s private, just write “unspoken” and we will still pray.",
      "Wednesday prayer wall. Share a request or a praise report. Then reply to one other person with “Praying for you” and mean it.",
    ],
  },
  {
    title: "Reading together",
    variants: [
      "This month a lot of us are reading {book}. It’s free (link in the comments). Where are you in the 21 days? It’s fine to start today.",
      "Reading check-in: if you’re going through {book}, which day hit you the hardest so far? If you haven’t started, the free PDF is in the comments.",
      "Who wants a reading buddy? We’re going through {book} this month, one day at a time. Grab the free PDF in the comments and say hi below.",
    ],
  },
  {
    title: "Testimony Friday",
    variants: [
      "Testimony Friday: how did God show up for you this week? Small stories count. Someone here needs to hear yours.",
      "Tell us one prayer God answered recently, even if the answer wasn’t what you expected.",
      "It’s Friday. Share one way you saw God’s kindness this week.",
    ],
  },
  {
    title: "Grateful Saturday",
    variants: [
      "Grateful Saturday: name three good things from this week. Coffee counts.",
      "What is something you almost missed this week, but now you’re thankful for?",
      "Saturday is a good day to slow down. What are you looking forward to this weekend?",
    ],
  },
];

export type HolidayCopy = {
  name: string; // English
  pt: string; // name for the owner
  ref: string;
  verse: string; // KJV
  caption: string; // Facebook Page
  group: string; // own group
  pinTitle: string;
  pinDescription: string;
  scene: string;
  book?: string; // related free book slug
  tip: string; // Portuguese note for the owner
};

export const HOLIDAYS: Record<HolidayKey, HolidayCopy> = {
  "new-year": {
    name: "New Year’s Day",
    pt: "Ano Novo",
    ref: "Isaiah 43:19",
    verse: "Behold, I will do a new thing; now it shall spring forth; shall ye not know it? I will even make a way in the wilderness, and rivers in the desert.",
    caption: "Happy New Year. Maybe last year left you tired, or maybe it was a good one and you’re afraid of losing it. Either way, God already knows the road ahead and He is not anxious about it. This year, let Him lead. What is one thing you are asking Him for in this new year?",
    group: "Happy New Year, friends. If you could ask God for one thing this year, what would it be? Let’s pray for each other’s answers this week.",
    pinTitle: "New Year Bible Verse: God Will Do a New Thing (Isaiah 43:19)",
    pinDescription: "A New Year Bible verse for a fresh start: “Behold, I will do a new thing” (Isaiah 43:19 KJV). Encouragement and a short prayer for the year ahead. #NewYearBibleVerse #ChristianNewYear #Isaiah4319",
    scene: "first sunrise of the year over a snowy field, soft golden light",
    book: "ask",
    tip: "Ótimo dia para divulgar o Ask (diário de oração) como plano do ano novo.",
  },
  "mlk-day": {
    name: "Martin Luther King Jr. Day",
    pt: "Dia de Martin Luther King Jr.",
    ref: "Amos 5:24",
    verse: "But let judgment run down as waters, and righteousness as a mighty stream.",
    caption: "Today the country remembers Dr. Martin Luther King Jr., a pastor who quoted this verse from Amos to call a nation to justice. Let’s pray for our neighborhoods, our churches and our families to love each other the way Jesus loves us.",
    group: "Today we remember Dr. King and the verse he loved to quote, Amos 5:24. Let’s pray together for unity and kindness in our communities.",
    pinTitle: "Amos 5:24 Bible Verse for MLK Day",
    pinDescription: "“Let judgment run down as waters, and righteousness as a mighty stream” (Amos 5:24 KJV), the verse Dr. Martin Luther King Jr. quoted. A prayer for unity and justice. #MLKDay #BibleVerse #Amos524",
    scene: "a wide river flowing through green hills in morning light",
    tip: "Tom respeitoso. Evite política: foque no versículo e em oração por união.",
  },
  valentines: {
    name: "Valentine’s Day",
    pt: "Dia dos Namorados (EUA)",
    ref: "1 John 4:19",
    verse: "We love him, because he first loved us.",
    caption: "Happy Valentine’s Day. Whether today is full of flowers or feels a little lonely, you are loved, and He loved you first, before you did anything to earn it. Who are you going to show some of that love to today?",
    group: "Happy Valentine’s Day. Today let’s encourage the single, the married, the waiting and the grieving. Leave a kind word for someone in this group.",
    pinTitle: "Valentine’s Day Bible Verse: We Love Because He First Loved Us",
    pinDescription: "A Valentine’s Day Bible verse for every heart: “We love him, because he first loved us” (1 John 4:19 KJV). For the single, the married and the waiting. #ValentinesBibleVerse #GodsLove #ChristianWomen",
    scene: "a soft pink and cream still life with roses, a handwritten note and a Bible",
    book: "kept",
    tip: "Divulgue o Kept (amor, espera e relacionamentos). Lembre das pessoas sozinhas: nada de \"para casais\" apenas.",
  },
  "ash-wednesday": {
    name: "Ash Wednesday",
    pt: "Quarta-feira de Cinzas",
    ref: "Joel 2:13",
    verse: "And rend your heart, and not your garments, and turn unto the LORD your God: for he is gracious and merciful, slow to anger, and of great kindness, and repenteth him of the evil.",
    caption: "Lent begins today. Forty days to slow down and turn back to God with your whole heart. You don’t have to come back perfect. He is gracious and slow to anger. Are you giving something up or adding something in this Lent?",
    group: "Lent starts today. Is anyone giving something up or starting a new habit for these 40 days? Share it so we can pray for each other.",
    pinTitle: "Ash Wednesday Bible Verse: Return to the Lord (Joel 2:13)",
    pinDescription: "An Ash Wednesday and Lent Bible verse: “Rend your heart, and not your garments, and turn unto the LORD your God” (Joel 2:13 KJV). Ideas to begin Lent with prayer. #AshWednesday #Lent #LentDevotional",
    scene: "a simple wooden cross on a table with soft gray morning light, minimal",
    book: "ask",
    tip: "Comece a divulgar o Ask como devocional de Quaresma.",
  },
  "palm-sunday": {
    name: "Palm Sunday",
    pt: "Domingo de Ramos",
    ref: "Matthew 21:9",
    verse: "Hosanna to the Son of David: Blessed is he that cometh in the name of the Lord; Hosanna in the highest.",
    caption: "Palm Sunday. The crowd waved branches and shouted Hosanna as Jesus rode into Jerusalem. He knew what the week would bring and He came anyway, for them and for us. Holy Week starts today.",
    group: "Holy Week starts today. Let’s read one chapter of the Easter story each day this week. Who’s in?",
    pinTitle: "Palm Sunday Bible Verse: Hosanna in the Highest",
    pinDescription: "A Palm Sunday Bible verse: “Hosanna to the Son of David: Blessed is he that cometh in the name of the Lord” (Matthew 21:9 KJV). Start Holy Week with Scripture. #PalmSunday #HolyWeek #Easter",
    scene: "green palm branches on a stone path in warm morning light",
    tip: "Comece a Semana Santa convidando o grupo para ler juntos.",
  },
  "good-friday": {
    name: "Good Friday",
    pt: "Sexta-feira Santa",
    ref: "Isaiah 53:5",
    verse: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
    caption: "Good Friday. Every wound He carried had your name on it. Take a quiet moment today to thank Him for the cross.",
    group: "Good Friday. Let’s keep it quiet today. If you want, share one word that describes what the cross means to you.",
    pinTitle: "Good Friday Bible Verse: With His Stripes We Are Healed",
    pinDescription: "A Good Friday Bible verse: “He was wounded for our transgressions … and with his stripes we are healed” (Isaiah 53:5 KJV). A quiet reflection on the cross. #GoodFriday #Isaiah535 #HolyWeek",
    scene: "a wooden cross on a hill under a dark, quiet sky with a soft break of light",
    tip: "Post sem link e sem pedido de nada. Só reflexão.",
  },
  easter: {
    name: "Easter Sunday",
    pt: "Páscoa",
    ref: "Matthew 28:6",
    verse: "He is not here: for he is risen, as he said. Come, see the place where the Lord lay.",
    caption: "He is risen! The tomb is empty, just as He said. Whatever looks dead in your life today, a dream, a relationship, your hope, is not too far gone for Him. Happy Easter from all of us at Elonai.",
    group: "He is risen! Happy Easter, friends. How are you celebrating today?",
    pinTitle: "Easter Bible Verse: He Is Not Here, He Is Risen (Matthew 28:6)",
    pinDescription: "An Easter Bible verse to share: “He is not here: for he is risen, as he said” (Matthew 28:6 KJV). Easter Sunday encouragement and prayer. #Easter #HeIsRisen #EasterBibleVerse",
    scene: "an empty stone tomb with the stone rolled away and spring flowers at sunrise",
    tip: "Pinterest: publique os pins de Páscoa de 3 a 6 semanas antes. O painel já faz isso no 3º pin.",
  },
  "day-of-prayer": {
    name: "National Day of Prayer",
    pt: "Dia Nacional de Oração (EUA)",
    ref: "2 Chronicles 7:14",
    verse: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways; then will I hear from heaven, and will forgive their sin, and will heal their land.",
    caption: "Today is the National Day of Prayer. Take five minutes today to pray for your family, your church, your town and the people who lead it. Tell us in the comments what you are praying for, and we will pray with you.",
    group: "Today is the National Day of Prayer. Share one prayer request for your town or your family and let’s cover each other in prayer.",
    pinTitle: "National Day of Prayer Bible Verse: 2 Chronicles 7:14",
    pinDescription: "A Bible verse for the National Day of Prayer: “If my people … shall humble themselves, and pray” (2 Chronicles 7:14 KJV). Plus a free 21-day prayer journal. #NationalDayOfPrayer #Prayer #2Chronicles714",
    scene: "hands folded on an open Bible in soft morning light, no face visible",
    book: "ask",
    tip: "Melhor dia do ano para divulgar o Ask.",
  },
  "mothers-day": {
    name: "Mother’s Day",
    pt: "Dia das Mães (EUA)",
    ref: "Proverbs 31:25",
    verse: "Strength and honour are her clothing; and she shall rejoice in time to come.",
    caption: "Happy Mother’s Day to the moms, the stepmoms, the spiritual moms, the moms waiting to be moms and the ones missing their mom today. You are seen. Tag a woman who has shown you what faith looks like.",
    group: "Happy Mother’s Day. Today can be sweet or hard. Share a memory of a woman who pointed you to Jesus, or just say hi if today is tender for you.",
    pinTitle: "Mother’s Day Bible Verse: Strength and Honour (Proverbs 31:25)",
    pinDescription: "A Mother’s Day Bible verse for every mom: “Strength and honour are her clothing” (Proverbs 31:25 KJV). For moms, spiritual moms and those missing their mother. #MothersDay #Proverbs31 #ChristianMom",
    scene: "a bouquet of soft peonies on a wooden table with a teacup in warm light",
    book: "named",
    tip: "Lembre de quem perdeu a mãe ou não conseguiu ter filhos. Divulgue o Named.",
  },
  "memorial-day": {
    name: "Memorial Day",
    pt: "Memorial Day (homenagem aos militares mortos)",
    ref: "John 15:13",
    verse: "Greater love hath no man than this, that a man lay down his life for his friends.",
    caption: "Today we honor the men and women who gave their lives in service. We pray for the families who still feel that loss today, and may God comfort them.",
    group: "Memorial Day. If you lost someone who served, share their name below and we will pray for your family today.",
    pinTitle: "Memorial Day Bible Verse: John 15:13",
    pinDescription: "A Memorial Day Bible verse: “Greater love hath no man than this, that a man lay down his life for his friends” (John 15:13 KJV). A prayer for families who lost a loved one. #MemorialDay #John1513 #Prayer",
    scene: "an American flag gently moving in the wind at a quiet cemetery at sunset, respectful",
    book: "anchored",
    tip: "Tom sério e respeitoso. Sem promoção neste post.",
  },
  pentecost: {
    name: "Pentecost Sunday",
    pt: "Pentecostes",
    ref: "Acts 2:4",
    verse: "And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them utterance.",
    caption: "Happy Pentecost. The same Holy Spirit who filled the believers in Acts lives in every follower of Jesus today. He is a Person who comforts, guides and stays. Want to know Him better? Our free 21-day devotional Breathe is linked in the first comment.",
    group: "Happy Pentecost. What is one thing you have learned about the Holy Spirit that changed how you pray?",
    pinTitle: "Pentecost Bible Verse: Filled With the Holy Ghost (Acts 2:4)",
    pinDescription: "A Pentecost Sunday Bible verse: “They were all filled with the Holy Ghost” (Acts 2:4 KJV). Learn who the Holy Spirit is with a free 21-day devotional. #Pentecost #HolySpirit #Acts24",
    scene: "soft warm wind through a field of tall grass with golden light",
    book: "breathe",
    tip: "Dia perfeito para o Breathe e para o post do blog sobre o Espírito Santo.",
  },
  "fathers-day": {
    name: "Father’s Day",
    pt: "Dia dos Pais (EUA)",
    ref: "Psalm 103:13",
    verse: "Like as a father pitieth his children, so the LORD pitieth them that fear him.",
    caption: "Happy Father’s Day to the dads, grandpas and every man who stepped up to love a child well. And if your earthly father was absent or hard to love, your Father in heaven has never once looked away from you.",
    group: "Happy Father’s Day. Share one thing your dad, or a father figure, taught you about God.",
    pinTitle: "Father’s Day Bible Verse: Psalm 103:13",
    pinDescription: "A Father’s Day Bible verse: “Like as a father pitieth his children, so the LORD pitieth them that fear him” (Psalm 103:13 KJV). For dads and for anyone missing a father. #FathersDay #Psalm103 #BibleVerse",
    scene: "a father and child walking on a country road at sunset, seen from behind",
    tip: "Lembre de quem não teve pai presente.",
  },
  "independence-day": {
    name: "Independence Day",
    pt: "4 de Julho (Independência)",
    ref: "Galatians 5:1",
    verse: "Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage.",
    caption: "Happy Fourth of July. Today we thank God for this country and pray for it. And whatever your plans are today, remember the freedom no one can take from you: the one Christ already won.",
    group: "Happy Fourth of July. How are you celebrating today? Let’s also pray for our country this weekend.",
    pinTitle: "4th of July Bible Verse: Stand Fast in the Liberty (Galatians 5:1)",
    pinDescription: "A Fourth of July Bible verse about true freedom: “Stand fast therefore in the liberty wherewith Christ hath made us free” (Galatians 5:1 KJV). #4thOfJuly #IndependenceDay #ChristianFreedom",
    scene: "a picnic blanket on a summer lawn with a small American flag at golden hour",
    tip: "Patriótico mas sem política partidária.",
  },
  "back-to-school": {
    name: "Back to School",
    pt: "Volta às aulas",
    ref: "Psalm 32:8",
    verse: "I will instruct thee and teach thee in the way which thou shalt go: I will guide thee with mine eye.",
    caption: "Back-to-school week for a lot of families. Let’s pray for the kids, the teachers, the bus drivers and the moms dropping them off. Drop your kids’ first names below and we will pray for them by name.",
    group: "Back to school! Share your kids’ (or grandkids’) first names and let’s pray over this school year together.",
    pinTitle: "Back to School Bible Verse and Prayer for Kids (Psalm 32:8)",
    pinDescription: "A back-to-school Bible verse and prayer for kids and teachers: “I will instruct thee and teach thee in the way which thou shalt go” (Psalm 32:8 KJV). #BackToSchoolPrayer #PrayerForKids #ChristianMom",
    scene: "a child’s backpack and lunchbox on a porch in early morning light",
    tip: "Post com muito engajamento: pedir nomes dos filhos gera comentários.",
  },
  "labor-day": {
    name: "Labor Day",
    pt: "Labor Day (Dia do Trabalho nos EUA)",
    ref: "Psalm 90:17",
    verse: "And let the beauty of the LORD our God be upon us: and establish thou the work of our hands upon us; yea, the work of our hands establish thou it.",
    caption: "Happy Labor Day. Whatever your work looks like, an office, a classroom, a hospital or a home full of kids, God sees it and blesses it. Take some real rest today. You earned it.",
    group: "Happy Labor Day. What kind of work has God given you in this season? Let’s pray for each other’s jobs and homes.",
    pinTitle: "Labor Day Bible Verse: Establish the Work of Our Hands",
    pinDescription: "A Labor Day Bible verse and prayer for your work: “Establish thou the work of our hands upon us” (Psalm 90:17 KJV). #LaborDay #BibleVerseForWork #Psalm90",
    scene: "a tidy wooden workbench with simple tools in warm window light",
    tip: "Fale de descanso: combina com o feriado.",
  },
  "grandparents-day": {
    name: "Grandparents Day",
    pt: "Dia dos Avós (EUA)",
    ref: "Psalm 71:18",
    verse: "Now also when I am old and greyheaded, O God, forsake me not; until I have shewed thy strength unto this generation, and thy power to every one that is to come.",
    caption: "Happy Grandparents Day. So many of us first heard about Jesus from a grandparent’s lap or a grandma’s worn-out Bible. Tell us about yours.",
    group: "Grandparents Day! Share a sweet memory of a grandparent who loved God.",
    pinTitle: "Grandparents Day Bible Verse: Psalm 71:18",
    pinDescription: "A Grandparents Day Bible verse: “Forsake me not; until I have shewed thy strength unto this generation” (Psalm 71:18 KJV). Honor the grandparents who passed down their faith. #GrandparentsDay #Psalm71 #FaithLegacy",
    scene: "an old worn Bible with reading glasses on a rocking chair by a window",
    tip: "Pedir memórias gera muitos comentários.",
  },
  "patriot-day": {
    name: "Patriot Day (September 11)",
    pt: "11 de Setembro",
    ref: "Psalm 46:1",
    verse: "God is our refuge and strength, a very present help in trouble.",
    caption: "Today we remember the lives lost on September 11. We pray for the families who still carry that day, and for the first responders who ran toward danger. God is still our refuge.",
    group: "Today we remember September 11. Let’s take a moment to pray for the families and first responders.",
    pinTitle: "September 11 Remembrance Bible Verse: Psalm 46:1",
    pinDescription: "A Bible verse for September 11 remembrance: “God is our refuge and strength, a very present help in trouble” (Psalm 46:1 KJV). A prayer for families and first responders. #September11 #NeverForget #Psalm46",
    scene: "a single candle burning beside a small American flag, dark calm background",
    tip: "Só homenagem e oração. Sem link e sem promoção.",
  },
  "pastor-appreciation": {
    name: "Pastor Appreciation Day",
    pt: "Dia do Pastor (EUA)",
    ref: "Jeremiah 3:15",
    verse: "And I will give you pastors according to mine heart, which shall feed you with knowledge and understanding.",
    caption: "October is Pastor Appreciation Month. Pastors carry a lot that we never see. Take a minute today to send yours a thank-you text, and tag a pastor who has blessed your life.",
    group: "It’s Pastor Appreciation Day! Share your pastor’s first name and let’s pray for them today.",
    pinTitle: "Pastor Appreciation Bible Verse: Jeremiah 3:15",
    pinDescription: "A Bible verse for Pastor Appreciation Month: “I will give you pastors according to mine heart” (Jeremiah 3:15 KJV), plus ideas to thank your pastor. #PastorAppreciation #PastorAppreciationMonth #Jeremiah315",
    scene: "an empty church pulpit with a Bible and soft light through a stained-glass window",
    tip: "Bom dia para lembrar da página Small Groups do site.",
  },
  "veterans-day": {
    name: "Veterans Day",
    pt: "Dia dos Veteranos",
    ref: "Psalm 91:2",
    verse: "I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.",
    caption: "Happy Veterans Day. Thank you to every man and woman who served. Comment with the name of a veteran you’re grateful for, and we will pray for them today.",
    group: "Veterans Day. Share the name of a veteran in your family and let’s thank God for them together.",
    pinTitle: "Veterans Day Bible Verse: Psalm 91:2",
    pinDescription: "A Veterans Day Bible verse and prayer: “He is my refuge and my fortress: my God; in him will I trust” (Psalm 91:2 KJV). #VeteransDay #Psalm91 #PrayerForVeterans",
    scene: "a folded American flag on a wooden table in soft morning light",
    tip: "Pedir nomes de veteranos gera muito engajamento.",
  },
  thanksgiving: {
    name: "Thanksgiving",
    pt: "Ação de Graças",
    ref: "Psalm 107:1",
    verse: "O give thanks unto the LORD, for he is good: for his mercy endureth for ever.",
    caption: "Happy Thanksgiving from Elonai. We are thankful for each one of you who reads, prays and shares these posts. What are you thanking God for today? We’d love to read your list.",
    group: "Happy Thanksgiving! Let’s make a gratitude list together. Share one thing you’re thankful for, and come back later to add another.",
    pinTitle: "Thanksgiving Bible Verse: O Give Thanks Unto the Lord (Psalm 107:1)",
    pinDescription: "A Thanksgiving Bible verse to share at the table: “O give thanks unto the LORD, for he is good: for his mercy endureth for ever” (Psalm 107:1 KJV). Plus a Thanksgiving prayer. #Thanksgiving #ThanksgivingBibleVerse #Gratitude",
    scene: "a warm Thanksgiving table with pumpkins, candles and autumn leaves",
    tip: "Pinterest: pins de Ação de Graças a partir de outubro (o painel faz no 3º pin).",
  },
  advent: {
    name: "First Sunday of Advent",
    pt: "1º domingo do Advento",
    ref: "Isaiah 9:6",
    verse: "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.",
    caption: "Advent begins today. Four weeks of waiting for Christmas, and remembering that He came for us. Light a candle tonight, read Isaiah 9 and give Him the first few minutes of this season before the rush starts.",
    group: "Advent starts today! Is anyone doing an Advent reading plan this year? Let’s go through December together.",
    pinTitle: "Advent Bible Verse: Unto Us a Child Is Born (Isaiah 9:6)",
    pinDescription: "A Bible verse for the first Sunday of Advent: “For unto us a child is born, unto us a son is given” (Isaiah 9:6 KJV). Begin the Christmas season with Scripture. #Advent #Isaiah96 #ChristmasBibleVerse",
    scene: "four candles on an evergreen wreath, one lit, cozy warm light",
    tip: "Pinterest: Natal e Advento são as maiores buscas do ano. Comece os pins em outubro.",
  },
  "christmas-eve": {
    name: "Christmas Eve",
    pt: "Véspera de Natal",
    ref: "Luke 2:11",
    verse: "For unto you is born this day in the city of David a Saviour, which is Christ the Lord.",
    caption: "Christmas Eve. Tonight, before the wrapping paper and the dishes, read Luke 2 out loud with your family. A Savior was born, and He was born for you.",
    group: "Merry Christmas Eve! Who is reading Luke 2 with their family tonight?",
    pinTitle: "Christmas Eve Bible Verse: Unto You Is Born a Saviour (Luke 2:11)",
    pinDescription: "A Christmas Eve Bible verse for your family: “For unto you is born this day in the city of David a Saviour, which is Christ the Lord” (Luke 2:11 KJV). #ChristmasEve #Luke2 #ChristmasBibleVerse",
    scene: "a small nativity scene lit by candlelight on a wooden mantel",
    tip: "Post simples e sem link.",
  },
  christmas: {
    name: "Christmas Day",
    pt: "Natal",
    ref: "Luke 2:10",
    verse: "And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people.",
    caption: "Merry Christmas from all of us at Elonai. Good tidings of great joy, for all people, and that includes you. If today is lonely or hard, He came for that too. Merry Christmas.",
    group: "Merry Christmas, friends! Thank you for being part of this group this year. How are you celebrating today?",
    pinTitle: "Christmas Bible Verse: Good Tidings of Great Joy (Luke 2:10)",
    pinDescription: "A Christmas Bible verse to share: “Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people” (Luke 2:10 KJV). #Christmas #ChristmasBibleVerse #Luke2",
    scene: "a Christmas tree with warm lights beside a window with snow falling outside",
    tip: "Agradeça a comunidade. Sem pedir doação neste dia.",
  },
  "new-years-eve": {
    name: "New Year’s Eve",
    pt: "Véspera de Ano Novo",
    ref: "Psalm 90:12",
    verse: "So teach us to number our days, that we may apply our hearts unto wisdom.",
    caption: "The last day of the year. Before the countdown, take five minutes with a notebook: write down three ways God was faithful this year. You’ll want to read that list next December.",
    group: "Last day of the year! Share one way God was faithful to you this year.",
    pinTitle: "New Year’s Eve Bible Verse and Reflection Questions (Psalm 90:12)",
    pinDescription: "A New Year’s Eve Bible verse and reflection: “So teach us to number our days, that we may apply our hearts unto wisdom” (Psalm 90:12 KJV). Questions to look back on the year with God. #NewYearsEve #Psalm90 #ChristianReflection",
    scene: "a notebook and pen with a cup of coffee and string lights, cozy evening",
    book: "ask",
    tip: "Divulgue o Ask como \"diário de oração para o ano novo\".",
  },
};

// Pinterest boards to create (name + description to copy).
export const BOARDS = [
  { name: "Daily Bible Verses", description: "One Bible verse a day (KJV) with a short devotional and prayer. Encouraging scripture for women." },
  { name: "Bible Verses for Anxiety & Fear", description: "Bible verses about anxiety, fear and worry, with prayers for when your mind won’t slow down." },
  { name: "Prayers for Every Day", description: "Short prayers for mornings, nights, hard days and every season of life." },
  { name: "Free Christian Devotionals", description: "Free printable 21-day devotionals and prayer journals for women." },
  { name: "Bible Verses for Grief & Hard Seasons", description: "Comforting Bible verses for grief, loss and hard seasons." },
  { name: "Holiday Bible Verses", description: "Bible verses for Christmas, Easter, Thanksgiving, Mother’s Day and every holiday." },
  { name: "Prayer Journaling", description: "How to start a prayer journal, prompts and ideas for a prayer life that lasts." },
];

export const MESSENGER = {
  greeting: "Hi, welcome to Elonai. We share free devotionals and pray for the requests people send us.",
  instant:
    "Hi! Thank you for writing to us. If you sent a prayer request, we will pray for you this week. Our free 21-day devotionals are here: {site}/books?utm_source=messenger\n\nA real person reads every message, so we may take a little time to reply.",
  faqs: [
    { q: "Can you pray for me?", a: "Yes, we would love to. Reply with your first name and what you’d like prayer for. It stays between us and God." },
    { q: "How do I get the free devotionals?", a: "Pick one here and download the PDF at no cost: {site}/books?utm_source=messenger" },
    { q: "How can I join the community group?", a: "Here is our Facebook group, we’d love to have you: {site}/join?from=messenger" },
    { q: "How can I support Elonai?", a: "Thank you! Everything we make is free, and gifts help us keep it that way: {site}/donate?from=messenger" },
  ],
};

export const GROUP_SETUP = {
  description:
    "A kind and prayerful place for women who want to grow closer to God, one day at a time. We read free Elonai devotionals together, share prayer requests and encourage each other with Scripture.\n\nWeekly rhythm:\nMonday: verse of the week\nWednesday: prayer wall\nThursday: reading together\nFriday: testimony Friday\n\nFree devotionals: {site}/books?utm_source=facebook-group",
  rules: [
    { title: "Be kind", text: "Speak to each other the way Jesus would. No arguing, shaming or debates." },
    { title: "Keep prayer requests private", text: "What is shared in this group stays in this group. Do not screenshot or repost." },
    { title: "No selling or self-promotion", text: "No ads, MLMs, fundraisers or links to your own business without asking an admin first." },
    { title: "Stay on topic", text: "Posts should be about faith, prayer, Scripture and encouragement. Leave politics out." },
    { title: "Get help when you need it", text: "We pray, but we are not counselors. If you are in danger or crisis, call or text 988 (Suicide & Crisis Lifeline) or 911." },
  ],
  questions: [
    "What made you want to join this group?",
    "Do you agree to follow the group rules and keep prayer requests private?",
    "Would you like our free 21-day devotional by email? If yes, leave your email here (optional). We never share it.",
  ],
  welcome:
    "Welcome to everyone who joined this week! Introduce yourself below: your first name, where you’re from and one thing you’d like prayer for. We’re so glad you’re here.",
  pinned:
    "Start here:\n\n1. Read the group rules.\n2. Introduce yourself in the welcome post.\n3. Download a free 21-day devotional: {site}/books?utm_source=facebook-group\n4. Wednesdays are for prayer requests.\n\nWe’re glad you’re here.",
};

export const PROFILE = {
  pageBio: "Free Bible-based devotionals and daily encouragement for women. We pray for every request we receive.",
  pinterestBio: "Daily Bible verses, prayers and free 21-day devotionals for women. KJV Scripture for anxious, tired and hopeful hearts.",
  instagramBio: "Daily Bible verses & prayers 🤍\nFree 21-day devotionals for women\nSend us your prayer request ↓",
};
