/**
 * Bilingual Translations Dictionary: English and Telugu
 * Ensures accurate UI rendering and graceful fallback for all user-facing strings.
 */

export type Locale = 'en' | 'te';

export interface TranslationDictionary {
  nav: {
    home: string;
    hospitals: string;
    departments: string;
    assistant: string;
    accessibility: string;
    demo: string;
    feedback: string;
    admin: string;
    login: string;
    logout: string;
    language: string;
  };
  common: {
    search: string;
    searchPlaceholder: string;
    filter: string;
    clearFilters: string;
    all: string;
    loading: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    submit: string;
    status: string;
    verified: string;
    unverified: string;
    needsReview: string;
    inactive: string;
    directions: string;
    call: string;
    emergency: string;
    hours: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    viewDetails: string;
    notFound: string;
    noResults: string;
    sampleDataNotice: string;
    disclaimer: string;
    lastVerified: string;
    source: string;
  };
  home: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    ctaHospitals: string;
    ctaDepartments: string;
    ctaAssistant: string;
    featuresTitle: string;
    featuresSubtitle: string;
    featureMultilingualTitle: string;
    featureMultilingualDesc: string;
    featureAccessibilityTitle: string;
    featureAccessibilityDesc: string;
    featureAiTitle: string;
    featureAiDesc: string;
    featureVerificationTitle: string;
    featureVerificationDesc: string;
    quickSearchTitle: string;
  };
  hospitals: {
    title: string;
    subtitle: string;
    filterByType: string;
    filterByStatus: string;
    filterByCity: string;
    allTypes: string;
    allCities: string;
    hospitalCount: string;
    emergencyAvailable: string;
    departmentsCount: string;
  };
  departments: {
    title: string;
    subtitle: string;
    categoriesTitle: string;
    availableServices: string;
    hospitalsOffering: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    send: string;
    thinking: string;
    disclaimer: string;
    sampleQuestionsTitle: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    sourcesTitle: string;
    activeProvider: string;
    readAnswer: string;
    stopSpeech: string;
    errorFallback: string;
  };
  accessibility: {
    title: string;
    subtitle: string;
    ttsTitle: string;
    ttsDesc: string;
    ttsTestBtn: string;
    ttsStopBtn: string;
    ttsNotice: string;
    fontSizeTitle: string;
    fontSizeNormal: string;
    fontSizeLarge: string;
    fontSizeXLarge: string;
    contrastTitle: string;
    contrastNormal: string;
    contrastHigh: string;
    keyboardTitle: string;
    keyboardDesc: string;
  };
  feedback: {
    title: string;
    subtitle: string;
    ratingLabel: string;
    categoryLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    successMessage: string;
    categoryGeneral: string;
    categoryNavigation: string;
    categoryAccuracy: string;
    categoryAccessibility: string;
  };
  demo: {
    title: string;
    subtitle: string;
    patientTourTitle: string;
    patientTourDesc: string;
    staffTourTitle: string;
    staffTourDesc: string;
    architectureTitle: string;
    startPatientTour: string;
    startStaffTour: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      hospitals: 'Hospitals',
      departments: 'Departments',
      assistant: 'AI Assistant',
      accessibility: 'Accessibility',
      demo: 'Demo Guide',
      feedback: 'Feedback',
      admin: 'Staff Portal',
      login: 'Staff Login',
      logout: 'Sign Out',
      language: 'Language',
    },
    common: {
      search: 'Search',
      searchPlaceholder: 'Search hospitals, locations, departments...',
      filter: 'Filter',
      clearFilters: 'Clear Filters',
      all: 'All',
      loading: 'Loading information...',
      save: 'Save Changes',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      status: 'Status',
      verified: 'Verified',
      unverified: 'Unverified',
      needsReview: 'Needs Review',
      inactive: 'Inactive',
      directions: 'Get Directions',
      call: 'Call Facility',
      emergency: 'Emergency Services 24/7',
      hours: 'Operating Hours',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Official Website',
      viewDetails: 'View Hospital Details',
      notFound: 'Record Not Found',
      noResults: 'No facilities match your search criteria.',
      sampleDataNotice: 'Sample data — not independently verified.',
      disclaimer: 'Demonstration prototype. Not for medical diagnosis or clinical decisions.',
      lastVerified: 'Last verified on',
      source: 'Information source',
    },
    home: {
      badge: 'Seva First Innovation Challenge • Theme 3: Swasth & Samavesh Bharat',
      heroTitle: 'Healthcare Navigation for Everyone',
      heroSubtitle: 'Accessible. Multilingual. Verified.',
      heroDescription:
        'Find verified hospital information, departments, and public health facilities across South India with ease — available in English and Telugu with voice assistance.',
      ctaHospitals: 'Find a Hospital',
      ctaDepartments: 'Explore Departments',
      ctaAssistant: 'Ask AI Assistant',
      featuresTitle: 'Built for Inclusion & Reliability',
      featuresSubtitle: 'Bridging navigation barriers for every citizen through accessible digital touchpoints.',
      featureMultilingualTitle: 'Telugu & English Native',
      featureMultilingualDesc:
        'Seamless multilingual UI tailored for South Indian healthcare accessibility, avoiding mistranslation of critical hospital names.',
      featureAccessibilityTitle: 'Voice & Accessibility Built-in',
      featureAccessibilityDesc:
        'In-browser Text-to-Speech (TTS), adjustable typography scale, and keyboard navigation to empower all community members.',
      featureAiTitle: 'Grounded AI Navigation',
      featureAiDesc:
        'Intelligent assistant backed by Gemini & Grok with automatic failover, strictly grounded in verified directory records with no diagnostic hallucinations.',
      featureVerificationTitle: 'Auditable Verification',
      featureVerificationDesc:
        'Staff verification workflow tracks sources, timestamps, and confidence tiers so patients know what is verified.',
      quickSearchTitle: 'Quick Facility Search',
    },
    hospitals: {
      title: 'Hospital Directory',
      subtitle: 'Browse and search healthcare facilities by location, type, and verification status.',
      filterByType: 'Hospital Type',
      filterByStatus: 'Verification Status',
      filterByCity: 'City / Region',
      allTypes: 'All Facility Types',
      allCities: 'All Regions',
      hospitalCount: 'facilities found',
      emergencyAvailable: '24/7 Emergency Available',
      departmentsCount: 'departments available',
    },
    departments: {
      title: 'Medical Departments & Services',
      subtitle: 'Explore clinical departments and public healthcare services across connected facilities.',
      categoriesTitle: 'Specialties & Clinical Departments',
      availableServices: 'Available Services',
      hospitalsOffering: 'Hospitals with this department',
    },
    assistant: {
      title: 'Healthcare Navigation Assistant',
      subtitle: 'Ask questions about hospital facilities, emergency care, departments, and operating hours.',
      inputPlaceholder: 'e.g., Which hospital in Hyderabad has 24/7 pediatric emergency?',
      send: 'Send Question',
      thinking: 'Consulting directory records...',
      disclaimer:
        'Navigation Assistant only. Does NOT diagnose medical conditions, prescribe medicines, or provide clinical advice. In an emergency, dial 108 or 112 immediately.',
      sampleQuestionsTitle: 'Sample Navigation Questions',
      q1: 'Find government hospitals with cardiology in Hyderabad',
      q2: 'Where can I find 24/7 emergency pediatrics in Vijayawada?',
      q3: 'Which hospitals have verified orthopedic departments?',
      q4: 'What are the operating hours for Tirupati Community Health Centre?',
      sourcesTitle: 'Referenced Facilities',
      activeProvider: 'Provider Active',
      readAnswer: 'Listen to Answer',
      stopSpeech: 'Stop Audio',
      errorFallback: 'AI service failover activated. Retrieved information directly from local verified records.',
    },
    accessibility: {
      title: 'Accessibility Center',
      subtitle: 'Customize your browsing experience with screen-reader friendly voice tools and display controls.',
      ttsTitle: 'Text-to-Speech (TTS) Voice Assistance',
      ttsDesc:
        'Use browser speech synthesis to read hospital names, directions, and navigation answers aloud in your preferred language.',
      ttsTestBtn: 'Test Voice Output',
      ttsStopBtn: 'Stop Speaking',
      ttsNotice: 'Voice availability depends on your device and browser installed speech engines.',
      fontSizeTitle: 'Text Size Scaling',
      fontSizeNormal: 'Standard (100%)',
      fontSizeLarge: 'Large (115%)',
      fontSizeXLarge: 'Extra Large (130%)',
      contrastTitle: 'Visual Contrast',
      contrastNormal: 'Calm Healthcare',
      contrastHigh: 'High Contrast (WCAG AAA)',
      keyboardTitle: 'Keyboard Navigation Shortcuts',
      keyboardDesc: 'Use Tab and Shift+Tab to navigate, Enter to select, and Escape to dismiss popups and dialogs.',
    },
    feedback: {
      title: 'Citizen & Patient Feedback',
      subtitle: 'Help us improve healthcare accessibility. No sensitive medical data is requested or stored.',
      ratingLabel: 'Overall Experience Rating (1 - 5)',
      categoryLabel: 'Feedback Category',
      messageLabel: 'Your Comments or Suggestions (Optional)',
      messagePlaceholder: 'Tell us how we can make facility information more accessible...',
      successMessage: 'Thank you for your valuable feedback! Your response has been securely recorded.',
      categoryGeneral: 'General Experience',
      categoryNavigation: 'Finding Facilities & Departments',
      categoryAccuracy: 'Data Accuracy & Verification',
      categoryAccessibility: 'Language & Accessibility Features',
    },
    demo: {
      title: 'Interactive Demonstration Guide',
      subtitle: 'Guide for judges and evaluators exploring SFIC Level 3 capabilities.',
      patientTourTitle: 'Patient & Citizen Experience',
      patientTourDesc: 'Explore public directory, English/Telugu toggle, voice assistance, and AI navigation.',
      staffTourTitle: 'Staff & Administrative Console',
      staffTourDesc: 'Inspect verification workflows, audit logging, SMS notifications, and impact analytics.',
      architectureTitle: 'Technical Architecture & Resilience',
      startPatientTour: 'Begin Patient Journey',
      startStaffTour: 'Open Staff Console',
    },
  },
  te: {
    nav: {
      home: 'హోమ్',
      hospitals: 'ఆసుపత్రులు',
      departments: 'విభాగాలు',
      assistant: 'AI సహాయకుడు',
      accessibility: 'సౌలభ్యం',
      demo: 'డెమో గైడ్',
      feedback: 'అభిప్రాయం',
      admin: 'సిబ్బంది పోర్టల్',
      login: 'సిబ్బంది లాగిన్',
      logout: 'లాగౌట్',
      language: 'భాష',
    },
    common: {
      search: 'వెతకండి',
      searchPlaceholder: 'ఆసుపత్రులు, ప్రాంతాలు, విభాగాలు వెతకండి...',
      filter: 'వడపోత',
      clearFilters: 'ఫిల్టర్లను తొలగించు',
      all: 'అన్నీ',
      loading: 'సమాచారం లోడ్ అవుతోంది...',
      save: 'మార్పులను భద్రపరచండి',
      cancel: 'రద్దు చేయి',
      back: 'వెనుకకు',
      next: 'తరువాత',
      submit: 'సమర్పించండి',
      status: 'స్థితి',
      verified: 'ధృవీకరించబడింది',
      unverified: 'ధృవీకరించబడలేదు',
      needsReview: 'సమీక్ష అవసరం',
      inactive: 'క్రియారహితం',
      directions: 'దారి చూపించు (మ్యాప్స్)',
      call: 'కాల్ చేయండి',
      emergency: '24/7 అత్యవసర సేవలు',
      hours: 'పనివేళలు',
      address: 'చిరునామా',
      phone: 'ఫోన్ నంబర్',
      email: 'ఈమెయిల్',
      website: 'అధికారిక వెబ్‌సైట్',
      viewDetails: 'ఆసుపత్రి వివరాలు చూడండి',
      notFound: 'సమాచారం కనుగొనబడలేదు',
      noResults: 'మీ శోధనకు తగిన ఆసుపత్రులు లభించలేదు.',
      sampleDataNotice: 'నమూనా సమాచారం — స్వతంత్రంగా ధృవీకరించబడలేదు.',
      disclaimer: 'ప్రదర్శన నమూనా మాత్రమే. వైద్య నిర్ధారణ లేదా చికిత్స కోసం కాదు.',
      lastVerified: 'చివరిగా ధృవీకరించిన తేదీ',
      source: 'సమాచార మూలం',
    },
    home: {
      badge: 'సేవా ఫస్ట్ ఇన్నోవేషన్ ఛాలెంజ్ • థీమ్ 3: స్వస్థ & సమవేశ భారత్',
      heroTitle: 'అందరికీ అందుబాటులో ఆరోగ్య మార్గదర్శనం',
      heroSubtitle: 'సౌలభ్యం. బహుభాషా. ధృవీకృతం.',
      heroDescription:
        'తెలుగు మరియు ఆంగ్ల భాషలలో వాయిస్ అసిస్టెన్స్ సహాయంతో సులభంగా ఆసుపత్రులు, విభాగాలు మరియు ప్రజా ఆరోగ్య కేంద్రాల వివరాలు పొందండి.',
      ctaHospitals: 'ఆసుపత్రిని కనుగొనండి',
      ctaDepartments: 'విభాగాలను చూడండి',
      ctaAssistant: 'AI సహాయకుడిని అడగండి',
      featuresTitle: 'సమగ్రత మరియు విశ్వసనీయత కోసం రూపొందించబడింది',
      featuresSubtitle: 'ప్రతి పౌరుడికి సులభమైన డిజిటల్ మాధ్యమాల ద్వారా ఆరోగ్య సేవల సమాచారం.',
      featureMultilingualTitle: 'తెలుగు & ఆంగ్ల మాధ్యమం',
      featureMultilingualDesc:
        'దక్షిణ భారతదేశ ఆరోగ్య సౌలభ్యం కోసం ప్రత్యేకంగా తెలుగు యూజర్ ఇంటర్‌ఫేస్, ఆసుపత్రి పేర్లు తప్పుగా అనువదించబడకుండా జాగ్రత్తలు.',
      featureAccessibilityTitle: 'వాయిస్ & సులభ రీడింగ్',
      featureAccessibilityDesc:
        'బ్రౌజర్ ఆధారిత వాయిస్ రీడింగ్ (TTS), ఫాంట్ సైజు మార్పులు మరియు సులభ కీబోర్డ్ నావిగేషన్.',
      featureAiTitle: 'పరిమిత AI సహాయం',
      featureAiDesc:
        'జెమిని మరియు గ్రోక్ ఆధారిత స్మార్ట్ అసిస్టెంట్, కేవలం ధృవీకరించబడిన సమాచారం ఆధారంగా మాత్రమే స్పందిస్తుంది, వైద్య చిట్కాలు ఇవ్వదు.',
      featureVerificationTitle: 'స్పష్టమైన ధృవీకరణ',
      featureVerificationDesc:
        'సిబ్బంది ధృవీకరణ వ్యవస్థ ద్వారా సమాచార మూలాలు మరియు చివరిగా తనిఖీ చేసిన సమయం రోగులకు స్పష్టంగా తెలుస్తుంది.',
      quickSearchTitle: 'త్వరిత ఆసుపత్రి శోధన',
    },
    hospitals: {
      title: 'ఆసుపత్రుల జాబితా',
      subtitle: 'ప్రాంతం, రకం మరియు ధృవీకరణ స్థితి ఆధారంగా ఆరోగ్య కేంద్రాలను వెతకండి.',
      filterByType: 'ఆసుపత్రి రకం',
      filterByStatus: 'ధృవీకరణ స్థితి',
      filterByCity: 'నగరం / ప్రాంతం',
      allTypes: 'అన్ని రకాల ఆసుపత్రులు',
      allCities: 'అన్ని ప్రాంతాలు',
      hospitalCount: 'ఆసుపత్రులు కనుగొనబడ్డాయి',
      emergencyAvailable: '24/7 అత్యవసర విభాగం అందుబాటులో ఉంది',
      departmentsCount: 'విభాగాలు అందుబాటులో ఉన్నాయి',
    },
    departments: {
      title: 'వైద్య విభాగాలు & సేవలు',
      subtitle: 'వివిధ ఆసుపత్రులలో అందుబాటులో ఉన్న క్లినికల్ విభాగాలు మరియు ఆరోగ్య సేవలు.',
      categoriesTitle: 'ప్రత్యేక విభాగాలు',
      availableServices: 'అందుబాటులో ఉన్న సేవలు',
      hospitalsOffering: 'ఈ విభాగం ఉన్న ఆసుపత్రులు',
    },
    assistant: {
      title: 'ఆరోగ్య నావిగేషన్ AI సహాయకుడు',
      subtitle: 'ఆసుపత్రులు, అత్యవసర సేవలు, విభాగాలు మరియు పనివేళల గురించి అడగండి.',
      inputPlaceholder: 'ఉదాహరణకు: హైదరాబాద్‌లో పిల్లల అత్యవసర విభాగం ఉన్న ఆసుపత్రి ఏది?',
      send: 'ప్రశ్న పంపండి',
      thinking: 'ఆసుపత్రి రికార్డులను పరిశీలిస్తోంది...',
      disclaimer:
        'కేవలం మార్గదర్శక సహాయకుడు మాత్రమే. రోగ నిర్ధారణ లేదా మందులను సూచించదు. అత్యవసర పరిస్థితుల్లో వెంటనే 108 లేదా 112 కు కాల్ చేయండి.',
      sampleQuestionsTitle: 'నమూనా ప్రశ్నలు',
      q1: 'హైదరాబాద్‌లోని కార్డియాలజీ ప్రభుత్వ ఆసుపత్రులు',
      q2: 'విజయవాడలో 24/7 పిల్లల అత్యవసర సేవలు ఎక్కడ ఉన్నాయి?',
      q3: 'ధృవీకరించబడిన ఆర్థోపెడిక్ విభాగాలు ఉన్న ఆసుపత్రులు ఏవి?',
      q4: 'తిరుపతి కమ్యూనిటీ హెల్త్ సెంటర్ పనివేళలు ఏమిటి?',
      sourcesTitle: 'ప్రస్తావించిన ఆసుపత్రులు',
      activeProvider: 'యాక్టివ్ AI ప్రొవైడర్',
      readAnswer: 'సమాధానం వినండి',
      stopSpeech: 'వాయిస్ ఆపండి',
      errorFallback: 'AI ఫెయిల్‌ఓవర్ యాక్టివేట్ చేయబడింది. లోకల్ రికార్డుల నుండి సమాచారం అందించబడింది.',
    },
    accessibility: {
      title: 'సౌలభ్య కేంద్రం (Accessibility)',
      subtitle: 'వాయిస్ రీడింగ్ మరియు స్క్రీన్ నియంత్రణలతో మీ అనుభవాన్ని అనుకూలీకరించండి.',
      ttsTitle: 'టెక్స్ట్-టు-స్పీచ్ (వాయిస్ రీడర్)',
      ttsDesc:
        'ఆసుపత్రి వివరాలు, దారి మార్గదర్శకాలు మరియు సమాధానాలను బిగ్గరగా వినడానికి బ్రౌజర్ వాయిస్ ఉపయోగించండి.',
      ttsTestBtn: 'వాయిస్ పరీక్షించండి',
      ttsStopBtn: 'వాయిస్ ఆపండి',
      ttsNotice: 'వాయిస్ సదుపాయం మీ పరికరం మరియు బ్రౌజర్ లోని భాషా ఇంజిన్‌లపై ఆధారపడి ఉంటుంది.',
      fontSizeTitle: 'అక్షరాల పరిమాణం',
      fontSizeNormal: 'సాధారణం (100%)',
      fontSizeLarge: 'పెద్దది (115%)',
      fontSizeXLarge: 'చాలా పెద్దది (130%)',
      contrastTitle: 'స్క్రీన్ కాంట్రాస్ట్',
      contrastNormal: 'సాధారణ రంగులు',
      contrastHigh: 'హై కాంట్రాస్ట్ (అధిక ప్రకాశం)',
      keyboardTitle: 'కీబోర్డ్ నావిగేషన్',
      keyboardDesc: 'నావిగేట్ చేయడానికి Tab మరియు Shift+Tab ఉపయోగించండి, ఎంచుకోవడానికి Enter నొక్కండి.',
    },
    feedback: {
      title: 'పౌరులు & రోగుల అభిప్రాయం',
      subtitle: 'ఆరోగ్య సమాచార సౌలభ్యాన్ని మెరుగుపరచడంలో సహాయపడండి. వ్యక్తిగత వైద్య సమాచారం అవసరం లేదు.',
      ratingLabel: 'మొత్తం అనుభవ రేటింగ్ (1 - 5)',
      categoryLabel: 'అభిప్రాయ విభాగం',
      messageLabel: 'మీ సలహాలు లేదా వ్యాఖ్యలు (ఐచ్ఛికం)',
      messagePlaceholder: 'సమాచారాన్ని మరింత సౌకర్యవంతంగా ఎలా మార్చవచ్చో తెలియజేయండి...',
      successMessage: 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు! మీ స్పందన భద్రపరచబడింది.',
      categoryGeneral: 'సాధారణ అనుభవం',
      categoryNavigation: 'ఆసుపత్రులు & విభాగాలు కనుగొనడం',
      categoryAccuracy: 'సమాచార ఖచ్చితత్వం & ధృవీకరణ',
      categoryAccessibility: 'భాష & సౌలభ్య ఫీచర్లు',
    },
    demo: {
      title: 'ఇంటరాక్టివ్ డెమో గైడ్',
      subtitle: 'SFIC లెవల్ 3 మూల్యాంకనం కోసం ప్రత్యేక ప్రదర్శన మార్గదర్శి.',
      patientTourTitle: 'రోగులు & పౌరుల అనుభవం',
      patientTourDesc: 'ఆసుపత్రి డైరెక్టరీ, తెలుగు/ఇంగ్లీష్ మార్పు, వాయిస్ అసిస్టెన్స్ మరియు AI సహాయం చూడండి.',
      staffTourTitle: 'సిబ్బంది & నిర్వహణ కన్సోల్',
      staffTourDesc: 'ధృవీకరణ విధానం, ఆడిట్ లాగ్‌లు, SMS నోటిఫికేషన్‌లు మరియు ఎనలిటిక్స్ పరిశీలించండి.',
      architectureTitle: 'సాంకేతిక నిర్మాణం మరియు విశ్వసనీయత',
      startPatientTour: 'రోగి మార్గదర్శనం ప్రారంభించండి',
      startStaffTour: 'సిబ్బంది కన్సోల్ తెరవండి',
    },
  },
};
