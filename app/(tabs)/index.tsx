import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Animated, 
  Vibration, 
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';

// Fix for Animated.View JSX type compatibility with some @types/react-native versions
const AnimatedView = Animated.View as React.ComponentType<any>;
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from 'firebase/database';

// Video imports - add more videos here
//const socialEngineeringVideo = require('../../assets/videos/social_engineering.mp4');
//const phishingIntroVideo = require('../../assets/videos/phishing_intro.mp4');
//const spottingSuspiciousEmailsVideo = require('../../assets/videos/spotting_suspicious_emails.mp4');
//const safePasswordPracticesVideo = require('../../assets/videos/safe_password_practices.mp4');
//const socialEngineeringAttacksVideo = require('../../assets/videos/social_engineering_attacks.mp4');
//const protectingYourDataVideo = require('../../assets/videos/protecting_your_data.mp4');
// const emailSecurityVideo = require('../../assets/videos/email_security.mp4');
const firebaseConfig = {
  apiKey: "AIzaSyAsaSYA0PsrL1EUIBr-Wgsp2hvFWW8cH68",
  authDomain: "phishfighters.firebaseapp.com",
  projectId: "phishfighters",
  storageBucket: "phishfighters.firebasestorage.app",
  messagingSenderId: "364839420270",
  appId: "1:364839420270:web:5695440a394de555b3817f",
  measurementId: "G-TP87L90JG0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const trackEvent = (eventName: string, parameters: any = {}) => {
  console.log(`📊 Analytics Event: ${eventName}`, parameters);
};

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({ q1: '' });
  const [gameResult, setGameResult] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackDialogVisible, setFeedbackDialogVisible] = useState(false);
  const [feedbackDialogNextScreen, setFeedbackDialogNextScreen] = useState('');
  const [feedbackDialogNextLevel, setFeedbackDialogNextLevel] = useState<number | undefined>(undefined);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentPreQuestion, setCurrentPreQuestion] = useState(0);
  const [preAnswers, setPreAnswers] = useState<number[]>([]);
  const [currentPostQuestion, setCurrentPostQuestion] = useState(0);
  const [postAnswers, setPostAnswers] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lives, setLives] = useState(3);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [perfectRun, setPerfectRun] = useState(true);
  const [currentScenarios, setCurrentScenarios] = useState<any>({});
  
  // NEW FEATURE: Adaptive Difficulty & Risk Scoring
  const [difficulty, setDifficulty] = useState(1);
  const [riskScore, setRiskScore] = useState(0);
  const [playerProfile, setPlayerProfile] = useState({
    weakAreas: [] as string[],
    strongAreas: [] as string[],
    categoryAccuracy: {} as Record<string, number>,
    totalAttempts: 0,
    totalCorrect: 0
  });
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [achievementsObj, setAchievementsObj] = useState<Record<string, { level: number, title: string }>>({});
  
  // FEATURE PREVIEW: Video Training Module
  const [videoTrainingProgress, setVideoTrainingProgress] = useState({
    completedModules: 0,
    totalModules: 5,
    xpPoints: 0,
    currentVideo: null as any,
    quizQuestions: [] as any[],
    currentQuizQuestion: 0,
    quizAnswers: [] as number[],
    showVideoPlayer: false,
    showQuiz: false
  });
  
  const [scoreAnimation] = useState(new Animated.Value(1));
  const [timerAnimation] = useState(new Animated.Value(1));
  const [buttonPulse] = useState(new Animated.Value(1));
  const [celebrationAnimation] = useState(new Animated.Value(0));
  const [splashAnimation] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.5));
  const [loadingDots] = useState(new Animated.Value(0));
  // Splash Screen Effect
  useEffect(() => {
    if (screen === 'splash') {
      Animated.parallel([
        Animated.timing(splashAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingDots, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(loadingDots, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();

      const splashTimer = setTimeout(() => {
        setScreen('home');
      }, 5000);

      return () => clearTimeout(splashTimer);
    }
  }, [screen, splashAnimation, logoScale, loadingDots]);
  const scenarios = {
    level1: [
      {
        from: "admin@microsoft-security-verify.com",
        subject: "Reset your password NOW!",
        content: "🚨 URGENT: Click here immediately to secure your account or it will be deleted within 24 hours!",
        isPhishing: true,
        explanation: "Real Microsoft uses @microsoft.com, not @microsoft-security-verify.com"
      },
      {
        from: "security@paypal-verification.net",
        subject: "Account Suspended - Verify Now",
        content: "Your PayPal account has been temporarily suspended. Click here to verify your identity and restore access immediately.",
        isPhishing: true,
        explanation: "Real PayPal uses @paypal.com, not @paypal-verification.net"
      },
      {
        from: "noreply@bankofamerica.com",
        subject: "Monthly Statement Available",
        content: "Your monthly statement is now available. Log in to view your account activity.",
        isPhishing: false,
        explanation: "This appears legitimate - correct domain and normal banking communication"
      }
    ],
    level2: [
      {
        url: "www.faceb00k-login.co/secure",
        type: "Social Media Login",
        isPhishing: true,
        explanation: "Uses '00' instead of 'oo' and suspicious .co domain"
      },
      {
        url: "www.g00gle-accounts.net/signin",
        type: "Google Login Page",
        isPhishing: true,
        explanation: "Uses '00' instead of 'oo' and .net instead of .com"
      },
      {
        url: "accounts.google.com/signin",
        type: "Google Login Page",
        isPhishing: false,
        explanation: "This is the legitimate Google login URL"
      }
    ],
    level3: [
      {
        from: "scholarships@education-grants.org",
        subject: "🎓 URGENT: $5,000 Scholarship - Deadline Today!",
        content: "Congratulations! You've been pre-selected for our exclusive $5,000 Academic Excellence Scholarship. Pay $50 processing fee (refundable) to claim.",
        isPhishing: true,
        explanation: "Real scholarships never require upfront fees"
      },
      {
        from: "grants@student-financial-aid.net",
        subject: "💰 $10,000 Emergency Student Grant Available",
        content: "Due to COVID-19, emergency grants are available. Provide your SSN and bank details to receive $10,000 within 24 hours.",
        isPhishing: true,
        explanation: "Legitimate grants don't require SSN or bank details via email"
      }
    ],
    level4: [
      {
        caller: "University IT Security",
        phone: "+1 (555) 123-4567",
        message: "We've detected suspicious activity on your student account. Provide your student ID and password to prevent suspension.",
        isPhishing: true,
        explanation: "Real IT never asks for passwords over the phone"
      },
      {
        caller: "Bank Security Department",
        phone: "+1 (800) 555-0199",
        message: "Your debit card has been compromised. Please confirm your card number, PIN, and SSN for security verification.",
        isPhishing: true,
        explanation: "Banks never ask for PINs or full card numbers over the phone"
      }
    ],
    level5: [
      {
        website: "study-materials-free.net",
        files: ["Advanced_Chemistry_Textbook_2024.exe", "Physics_Solutions_Manual.exe", "Biology_Study_Guide.exe"],
        isPhishing: true,
        explanation: "Textbooks should be PDFs, not .exe files which can contain malware"
      },
      {
        website: "free-software-downloads.org",
        files: ["Adobe_Photoshop_2024_Free.exe", "Microsoft_Office_Crack.exe", "Windows_Activator.exe"],
        isPhishing: true,
        explanation: "Free versions of expensive software are usually malware"
      },
      {
        website: "university-library.edu",
        files: ["Research_Paper_Template.pdf", "Citation_Guide.docx", "Thesis_Format.pdf"],
        isPhishing: false,
        explanation: "These are legitimate file types from an educational domain"
      }
    ]
  };

  // FEATURE PREVIEW: Video Training Module Data
  const videoTrainingModules = [
    {
      id: 1,
      title: "Introduction to Phishing",
      duration: "3:45",
      thumbnail: "🎬",
      description: "Learn what phishing is and why it's dangerous",
      videoUrl: phishingIntroVideo, // Now using actual video file
      videoWatched: false, // Track if video has been fully watched
      quiz: [
        {
          question: "What is the primary goal of a phishing attack?",
          options: ["To install viruses on your computer", "To steal sensitive information like passwords or credit card details", "To slow down your internet connection", "To change your computer settings"],
          correct: 1,
          explanation: "Phishing attacks aim to trick victims into revealing confidential information that can be used for identity theft or financial fraud."
        },
        {
          question: "Which of these is NOT a common phishing delivery method?",
          options: ["Fake emails pretending to be from banks", "Phone calls claiming to be from tech support", "Text messages with suspicious links", "Personal visits from security experts"],
          correct: 3,
          explanation: "Phishing typically occurs through digital channels like email, phone calls (vishing), and text messages (smishing), not through in-person visits."
        },
        {
          question: "What should you do if you receive an email asking for your account information?",
          options: ["Click the link and provide the information", "Reply to the email with your details", "Contact the organization directly using official contact information", "Ignore it and delete the email"],
          correct: 2,
          explanation: "Legitimate organizations will never ask for sensitive information via email. Always verify by contacting them through official channels."
        },
        {
          question: "Which red flag indicates a potential phishing email?",
          options: ["Professional looking design", "Urgent language creating panic", "Sender's email matches the company domain", "All of the above"],
          correct: 1,
          explanation: "Urgent language like 'Your account will be suspended!' is a classic phishing tactic to make you act without thinking."
        },
        {
          question: "What is 'social engineering' in the context of cybersecurity?",
          options: ["Building social networks for security professionals", "Manipulating people into divulging confidential information", "Engineering social media algorithms", "Creating secure social platforms"],
          correct: 1,
          explanation: "Social engineering exploits human psychology rather than technical vulnerabilities to gain access to information or systems."
        },
        {
          question: "Which of these is an example of pretexting?",
          options: ["Sending fake emails", "Creating a false identity to gain trust and extract information", "Installing malware", "Hacking into networks"],
          correct: 1,
          explanation: "Pretexting involves creating a fabricated scenario or identity to obtain information from victims."
        },
        {
          question: "What should you check before clicking a link in an email?",
          options: ["If the email looks professional", "Hover over the link to see the actual URL", "If the sender's name sounds familiar", "If the email was sent during business hours"],
          correct: 1,
          explanation: "Hovering over links reveals the true destination URL, which may differ from what's displayed in the email."
        },
        {
          question: "Why do phishing attacks often create a sense of urgency?",
          options: ["To make the email more interesting", "To prevent victims from thinking critically and verifying the request", "To ensure quick delivery", "To comply with email regulations"],
          correct: 1,
          explanation: "Urgency bypasses rational thinking and verification processes, making victims more likely to fall for the scam."
        }
      ]
    },
    {
      id: 2,
      title: "Spotting Suspicious Emails",
      duration: "4:12",
      thumbnail: "📧",
      description: "How to identify red flags in email messages",
      videoUrl: spottingSuspiciousEmailsVideo,
      quiz: [
        {
          question: "What should you check first in a suspicious email?",
          options: ["The sender's email address", "The email's font style", "The email's background color"],
          correct: 0,
          explanation: "Always verify the sender's email address - legitimate companies use their official domains."
        },
        {
          question: "Which of these email domains is most likely to be legitimate for a bank?",
          options: ["bankofamerica-security.com", "bankofamerica.com", "secure-bankofamerica.net", "bankofamerica-verification.org"],
          correct: 1,
          explanation: "Legitimate banks use their official domain names without additional prefixes or different TLDs."
        },
        {
          question: "What does hovering over a link in an email reveal?",
          options: ["The email's sending time", "The actual destination URL", "The sender's location", "The email's file size"],
          correct: 1,
          explanation: "Hovering over links shows the real URL, which may be different from the displayed text."
        },
        {
          question: "Why do phishing emails often create urgency?",
          options: ["To make the email more exciting", "To prevent you from thinking carefully", "To speed up email delivery", "To follow email marketing rules"],
          correct: 1,
          explanation: "Urgency tactics bypass critical thinking and verification processes."
        },
        {
          question: "Which attachment type is commonly used in phishing emails?",
          options: [".jpg images", ".exe executables", ".txt documents", ".mp3 audio files"],
          correct: 1,
          explanation: "Malicious executables (.exe) can install malware when opened."
        },
        {
          question: "What should you do if an email asks for your password?",
          options: ["Reply with your password", "Click the provided link to reset it", "Contact the organization directly using known contact information", "Forward the email to friends"],
          correct: 2,
          explanation: "Legitimate organizations never ask for passwords via email. Always use official channels."
        },
        {
          question: "Which is a common phishing tactic involving fake websites?",
          options: ["Typosquatting", "URL shortening", "Both A and B", "Neither A nor B"],
          correct: 2,
          explanation: "Phishers use both misspelled domains and URL shorteners to hide malicious links."
        },
        {
          question: "What information should you NEVER share via email?",
          options: ["Your favorite color", "Your full name", "Your Social Security Number", "Your birth month"],
          correct: 2,
          explanation: "Sensitive information like SSN should never be shared via unsecured email."
        }
      ]
    },
    {
      id: 3,
      title: "Safe Password Practices",
      duration: "5:20",
      thumbnail: "🔐",
      description: "Creating and managing secure passwords",
      videoUrl: safePasswordPracticesVideo,
      quiz: [
        {
          question: "How often should you change your passwords?",
          options: ["Never", "Every 3-6 months", "Only when compromised"],
          correct: 1,
          explanation: "Regular password changes help maintain security, especially for important accounts."
        },
        {
          question: "What is the minimum recommended length for a strong password?",
          options: ["6 characters", "8 characters", "12 characters", "16 characters"],
          correct: 2,
          explanation: "Longer passwords (12+ characters) are much harder to crack than shorter ones."
        },
        {
          question: "Which of these is NOT a good practice for creating passwords?",
          options: ["Using a mix of uppercase and lowercase letters", "Including numbers and special characters", "Using your pet's name", "Making it at least 12 characters long"],
          correct: 2,
          explanation: "Personal information like pet names can be easily guessed by attackers who know you."
        },
        {
          question: "What is a password manager?",
          options: ["A program that changes your passwords automatically", "Software that stores and generates secure passwords", "A tool that checks password strength", "An app that monitors password usage"],
          correct: 1,
          explanation: "Password managers securely store complex passwords and can generate strong ones for you."
        },
        {
          question: "Why should you use different passwords for different accounts?",
          options: ["To make logging in easier", "To prevent one breach from compromising all accounts", "To save time when creating accounts", "To comply with company policies"],
          correct: 1,
          explanation: "If one account is compromised, different passwords prevent attackers from accessing your other accounts."
        },
        {
          question: "What is two-factor authentication (2FA)?",
          options: ["Using two passwords for one account", "Requiring two forms of verification to access an account", "Changing passwords twice a year", "Using two different devices for login"],
          correct: 1,
          explanation: "2FA adds an extra layer of security by requiring something you know (password) and something you have (phone/code)."
        },
        {
          question: "Which of these is a common password mistake?",
          options: ["Using complex passwords", "Reusing the same password across multiple sites", "Enabling two-factor authentication", "Using a password manager"],
          correct: 1,
          explanation: "Reusing passwords means if one site is breached, all your accounts become vulnerable."
        },
        {
          question: "What should you do if you suspect your password has been compromised?",
          options: ["Change it immediately on all affected accounts", "Wait to see if anything happens", "Use the same password with slight variations", "Share it with trusted friends"],
          correct: 0,
          explanation: "Immediate password changes prevent unauthorized access and limit potential damage."
        },
        {
          question: "Why are dictionary words poor choices for passwords?",
          options: ["They are too long", "They can be easily guessed or cracked with dictionary attacks", "They contain special characters", "They are hard to remember"],
          correct: 1,
          explanation: "Attackers use automated tools that try common words and variations to crack passwords."
        }
      ]
    },
    {
      id: 4,
      title: "Social Engineering Attacks",
      duration: "4:55",
      thumbnail: "🎭",
      description: "Understanding psychological manipulation tactics",
      videoUrl: socialEngineeringAttacksVideo,
      quiz: [
        {
          question: "What is social engineering?",
          options: ["Building social networks", "Manipulating people to gain information", "Engineering social events"],
          correct: 1,
          explanation: "Social engineering exploits human psychology rather than technical vulnerabilities."
        },
        {
          question: "Which of these is an example of pretexting?",
          options: ["Sending fake emails", "Creating a false identity to gain trust", "Installing malware on a computer", "Hacking into a network"],
          correct: 1,
          explanation: "Pretexting involves creating a fabricated scenario or identity to obtain confidential information."
        },
        {
          question: "What is 'baiting' in social engineering?",
          options: ["Using compliments to gain trust", "Offering something enticing to trick victims", "Creating urgent situations", "Impersonating authority figures"],
          correct: 1,
          explanation: "Baiting involves offering something desirable (like free USB drives) that contains malware."
        },
        {
          question: "Why do social engineers often create a sense of urgency?",
          options: ["To make conversations more exciting", "To prevent victims from thinking critically", "To speed up the conversation", "To follow social norms"],
          correct: 1,
          explanation: "Urgency bypasses rational thinking and verification processes, making people act impulsively."
        },
        {
          question: "Which tactic involves impersonating someone in authority?",
          options: ["Phishing", "Tailgating", "Authority exploitation", "Baiting"],
          correct: 2,
          explanation: "Authority exploitation uses people's tendency to obey authority figures to gain access or information."
        },
        {
          question: "What is 'tailgating' or 'piggybacking'?",
          options: ["Following someone through a secure door", "Sending unsolicited emails", "Creating fake websites", "Using strong passwords"],
          correct: 0,
          explanation: "Tailgating involves physically following authorized personnel into restricted areas."
        },
        {
          question: "How can you protect yourself from social engineering attacks?",
          options: ["Never talk to strangers", "Verify requests through official channels", "Share information freely", "Ignore all phone calls"],
          correct: 1,
          explanation: "Always verify suspicious requests through known, official communication channels."
        },
        {
          question: "What is 'quid pro quo' in social engineering?",
          options: ["Free exchange of information", "Offering help in exchange for information", "Paying for services", "Trading goods"],
          correct: 1,
          explanation: "Quid pro quo involves offering something (like tech support) in exchange for sensitive information."
        },
        {
          question: "Why are social engineering attacks effective?",
          options: ["They require expensive technology", "They exploit human psychology and trust", "They only work on technical people", "They are illegal everywhere"],
          correct: 1,
          explanation: "Social engineering works because people are often the weakest link in security systems."
        }
      ]
    },
    {
      id: 5,
      title: "Protecting Your Data",
      duration: "6:10",
      thumbnail: "🛡️",
      description: "Best practices for data protection",
      videoUrl: protectingYourDataVideo,
      quiz: [
        {
          question: "What should you do if you suspect you've been phished?",
          options: ["Ignore it", "Change passwords and report it", "Share your experience on social media"],
          correct: 1,
          explanation: "Immediately change affected passwords and report the incident to prevent further damage."
        },
        {
          question: "Why should you keep your software and operating system updated?",
          options: ["To get new features", "To fix security vulnerabilities", "To change the appearance", "To increase speed"],
          correct: 1,
          explanation: "Updates often include security patches that protect against known vulnerabilities."
        },
        {
          question: "What is the best way to protect sensitive data on your devices?",
          options: ["Use simple passwords", "Enable encryption and use strong passwords", "Share data with friends", "Store everything in plain text"],
          correct: 1,
          explanation: "Encryption and strong passwords provide multiple layers of protection for your data."
        },
        {
          question: "When should you use public Wi-Fi cautiously?",
          options: ["Never use it", "When accessing sensitive information", "Only for entertainment", "Always, it's safe"],
          correct: 1,
          explanation: "Public Wi-Fi networks can be insecure, so avoid accessing sensitive information on them."
        },
        {
          question: "What should you do before sharing personal information online?",
          options: ["Share freely with everyone", "Consider who will see it and why they need it", "Never share anything", "Only share with strangers"],
          correct: 1,
          explanation: "Always evaluate the necessity and privacy implications before sharing personal information."
        },
        {
          question: "Why is it important to backup your data regularly?",
          options: ["To free up storage space", "To protect against data loss from attacks or failures", "To share with others", "To speed up your device"],
          correct: 1,
          explanation: "Regular backups ensure you can recover your data if it's lost due to ransomware, hardware failure, or other incidents."
        },
        {
          question: "What is a VPN and why should you use it?",
          options: ["A virus protection network", "A virtual private network that encrypts your internet traffic", "A video player network", "A virtual personal network"],
          correct: 1,
          explanation: "VPNs encrypt your internet connection, protecting your data from interception on public networks."
        },
        {
          question: "How can you identify a secure website?",
          options: ["It has colorful graphics", "It uses HTTPS and has a padlock icon", "It loads quickly", "It has many advertisements"],
          correct: 1,
          explanation: "HTTPS encryption and browser security indicators show that the connection to the site is secure."
        },
        {
          question: "What should you do if you receive a suspicious text message with a link?",
          options: ["Click it immediately", "Verify the sender and avoid clicking unknown links", "Forward it to all contacts", "Save it for later"],
          correct: 1,
          explanation: "Smishing attacks use text messages to deliver malware or steal information - always verify before clicking."
        }
      ]
    }
  ];

  const preQuizQuestions = [
    {
      question: "Do you check the sender's email address before clicking links?",
      options: ["Always", "Never / Sometimes"],
      correct: 0
    },
    {
      question: "What should you do if you receive an email asking for your password?",
      options: ["Provide it immediately", "Never share passwords via email"],
      correct: 1
    },
    {
      question: "Is it safe to download files from unknown websites?",
      options: ["Yes, if they look legitimate", "No, avoid unknown sources"],
      correct: 1
    },
    {
      question: "What is phishing?",
      options: ["A type of fish", "A scam to steal personal information"],
      correct: 1
    },
    {
      question: "Should you click on links in unsolicited emails?",
      options: ["Yes, if curious", "No, verify first"],
      correct: 1
    }
  ];

  // NEW FEATURE: Adaptive Scenario Selection
  const getAdaptiveScenario = (category: string) => {
    const categoryScenarios = scenarios[`level${category === 'email' ? 1 : category === 'url' ? 2 : category === 'scholarship' ? 3 : category === 'phone' ? 4 : 5}` as keyof typeof scenarios];
    
    // Increase difficulty for strong areas, decrease for weak areas
    const accuracy = playerProfile.categoryAccuracy[category] || 0;
    const isWeak = playerProfile.weakAreas.includes(category);
    
    if (isWeak || accuracy < 0.5) {
      // Return easier scenarios for weak areas
      return categoryScenarios.find(s => !s.isPhishing) || categoryScenarios[0];
    } else {
      // Return harder scenarios for strong areas
      return categoryScenarios.find(s => s.isPhishing) || categoryScenarios[0];
    }
  };

  const initializeAdaptiveScenarios = () => {
    const categories = ['email', 'url', 'scholarship', 'phone', 'malware'];
    const newScenarios: any = {};
    
    categories.forEach((cat, index) => {
      newScenarios[`level${index + 1}`] = getAdaptiveScenario(cat);
    });
    
    setCurrentScenarios(newScenarios);
    return newScenarios;
  };
  const playSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(scoreAnimation, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scoreAnimation, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const playTimerWarning = useCallback(() => {
    Animated.sequence([
      Animated.timing(timerAnimation, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(timerAnimation, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  }, [timerAnimation]);

  const showCelebrationEffect = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(celebrationAnimation, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start(() => setShowCelebration(false));
  };

  const formatFeedbackMessage = (isCorrect: boolean, explanation?: string, pointsText?: string) => {
    const reason = isCorrect ? 'Your answer is correct because ' : 'Your answer is incorrect because ';
    return `${isCorrect ? '🎉 Correct!' : '💔 Oops!'} ${reason}${explanation || ''}${pointsText ? `\n\n${pointsText}` : ''}`;
  };

  const displayFeedback = (isCorrect: boolean, explanation?: string, pointsText?: string) => {
    setFeedbackMessage(formatFeedbackMessage(isCorrect, explanation, pointsText));
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setFeedbackVisible(true);
  };

  const showFeedbackPopup = (isCorrect: boolean, explanation?: string, pointsText?: string, nextScreen?: string, nextLevel?: number) => {
    displayFeedback(isCorrect, explanation, pointsText);
    setFeedbackDialogVisible(true);
    setFeedbackDialogNextScreen(nextScreen || 'results');
    setFeedbackDialogNextLevel(nextLevel);
  };

  const handleFeedbackOk = () => {
    setFeedbackDialogVisible(false);
    setFeedbackVisible(false);
    if (feedbackDialogNextScreen) {
      goToScreen(feedbackDialogNextScreen, feedbackDialogNextLevel);
    }
  };

  // Helper to advance screens (used because Alert.alert callbacks
  // don't reliably run on web/Expo web fallback). Uses a short timeout
  // so native alerts still show briefly before navigation.
  const goToScreen = useCallback((screenName: string, levelNum?: number) => {
    setTimeout(() => {
      if (typeof levelNum === 'number') setLevel(levelNum);
      const baseTimer = 30;
      const adjustedTimer = Math.max(15, baseTimer - (difficulty - 1) * 5);
      setTimer(adjustedTimer);
      setScreen(screenName);
    }, 250);
  }, [difficulty]);

  useEffect(() => {
    setFeedbackVisible(false);
  }, [screen]);

  useEffect(() => {
    if (!feedbackDialogVisible) return;
    setFeedbackVisible(true);
  }, [feedbackDialogVisible]);

  const FeedbackPopup = () => {
    if (!feedbackDialogVisible) return null;

    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.feedbackModalOverlay}>
          <View style={[styles.feedbackModal, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackOk}>
              <Text style={styles.feedbackButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const checkAchievements = (currentScore: number, currentLevel: number, isCorrect: boolean): string[] => {
    const newAchievements: string[] = [];
    const currentAchievements = { ...achievementsObj };
    
    if (currentScore >= 5 && !currentAchievements.phishing) {
      currentAchievements.phishing = { level: 1, title: 'Phishing Rookie' };
      newAchievements.push('Phishing Rookie');
    }
    if (streak >= 3 && !currentAchievements.streak) {
      currentAchievements.streak = { level: 1, title: 'Streak Master' };
      newAchievements.push('Streak Master');
    }
    if (riskScore < 20 && !currentAchievements.lowRisk) {
      currentAchievements.lowRisk = { level: 1, title: 'Low Risk Agent' };
      newAchievements.push('Low Risk Agent');
    }
    
    if (newAchievements.length > 0) {
      setAchievementsObj(currentAchievements);
      showCelebrationEffect();
      Vibration.vibrate(200);
      return newAchievements;
    }
    return [];
  };

  const getRandomEncouragement = () => {
    const encouragements = [
      "🔥 You're on fire!",
      "💪 Cyber warrior!",
      "🛡️ Security expert!",
      "⚡ Lightning fast!"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  // FEATURE PREVIEW: Video Training Functions
  const startVideoTraining = (moduleId: number) => {
    const module = videoTrainingModules.find(m => m.id === moduleId);
    if (module) {
      setVideoTrainingProgress(prev => ({
        ...prev,
        currentVideo: module,
        showVideoPlayer: true,
        quizQuestions: module.quiz,
        currentQuizQuestion: 0,
        quizAnswers: []
      }));
      setScreen('videoPlayer');
    }
  };

  const completeVideoAndStartQuiz = () => {
    setVideoTrainingProgress(prev => ({
      ...prev,
      showVideoPlayer: false,
      showQuiz: true
    }));
    setScreen('videoQuiz');
  };

  const answerVideoQuizQuestion = (answerIndex: number) => {
    const currentQuestion = videoTrainingProgress.quizQuestions[videoTrainingProgress.currentQuizQuestion];
    const isCorrect = answerIndex === currentQuestion.correct;
    
    const newAnswers = [...videoTrainingProgress.quizAnswers];
    newAnswers[videoTrainingProgress.currentQuizQuestion] = answerIndex;
    
    if (isCorrect) {
      setVideoTrainingProgress(prev => ({
        ...prev,
        xpPoints: prev.xpPoints + 10,
        quizAnswers: newAnswers
      }));
      displayFeedback(true, currentQuestion.explanation, "+10 XP!");
    } else {
      displayFeedback(false, currentQuestion.explanation, "Try again!");
      return; // Don't advance on wrong answer
    }
    
    // Check if quiz is complete
    if (videoTrainingProgress.currentQuizQuestion >= videoTrainingProgress.quizQuestions.length - 1) {
      // Complete the module
      setVideoTrainingProgress(prev => ({
        ...prev,
        completedModules: prev.completedModules + 1,
        showQuiz: false,
        currentVideo: null,
        quizQuestions: [],
        currentQuizQuestion: 0,
        quizAnswers: []
      }));
      showCelebrationEffect();
      Vibration.vibrate(200);
      setTimeout(() => {
        Alert.alert("🎉 Module Complete!", `You've earned 10 XP points!`);
        setScreen('home');
      }, 1000);
    } else {
      // Next question
      setVideoTrainingProgress(prev => ({
        ...prev,
        currentQuizQuestion: prev.currentQuizQuestion + 1,
        quizAnswers: newAnswers
      }));
    }
  };

  const getScoreMultiplier = () => {
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 1;
  };

  // NEW FEATURE: Adaptive Difficulty Helpers
  const adjustDifficulty = (isCorrect: boolean, currentTimer: number, currentLives: number) => {
    const newProfile = { ...playerProfile };
    newProfile.totalAttempts += 1;
    if (isCorrect) newProfile.totalCorrect += 1;

    // Update category accuracy (simplified for demo)
    const category = level === 1 ? 'email' : level === 2 ? 'url' : level === 3 ? 'scholarship' : level === 4 ? 'phone' : 'malware';
    newProfile.categoryAccuracy[category] = (newProfile.categoryAccuracy[category] || 0) + (isCorrect ? 1 : 0);

    // Adjust difficulty based on performance
    let newDifficulty = difficulty;
    if (isCorrect && currentTimer > 20) {
      newDifficulty = Math.min(3, difficulty + 0.1); // Increase difficulty for fast correct answers
    } else if (!isCorrect || currentLives < 2) {
      newDifficulty = Math.max(0.5, difficulty - 0.1); // Decrease difficulty for mistakes or low lives
    }

    setPlayerProfile(newProfile);
    setDifficulty(newDifficulty);
  };

  // NEW FEATURE: Risk Score Calculation
  const calculateRiskScore = (scenario: any, isCorrect: boolean, currentTimer: number) => {
    const baseRisk = 100 - (playerProfile.totalCorrect / Math.max(1, playerProfile.totalAttempts) * 100);
    const timeBonus = currentTimer > 15 ? -5 : 0; // Bonus for quick decisions
    const mistakePenalty = !isCorrect ? 10 : 0;
    const newRiskScore = Math.max(0, Math.min(100, baseRisk + timeBonus + mistakePenalty));
    setRiskScore(newRiskScore);
    return newRiskScore;
  };

  // NEW FEATURE: Generate Inbox Items
  const generateInboxItems = () => {
    const allScenarios = [
      ...scenarios.level1.map(s => ({ ...s, type: 'email', category: 'email' })),
      ...scenarios.level2.map(s => ({ ...s, type: 'url', category: 'url' })),
      ...scenarios.level3.map(s => ({ ...s, type: 'email', category: 'scholarship' })),
      ...scenarios.level4.map(s => ({ ...s, type: 'phone', category: 'phone' })),
      ...scenarios.level5.map(s => ({ ...s, type: 'file', category: 'malware' }))
    ];

    // Adaptive selection: prioritize weak areas
    const weakCategories = playerProfile.weakAreas.length > 0 ? playerProfile.weakAreas : ['email', 'url', 'scholarship', 'phone', 'malware'];
    const filteredScenarios = allScenarios.filter(s => weakCategories.includes(s.category));

    const shuffled = filteredScenarios.sort(() => 0.5 - Math.random());
    setInboxItems(shuffled.slice(0, 5)); // Show 5 items
  };

  // NEW FEATURE: Unified Answer Handler
  const handleScenarioAnswer = (expectedPhishing: boolean, scenario: any, points: number, nextScreen: string, nextLevel?: number) => {
    const isCorrect = scenario.isPhishing === expectedPhishing;
    const multiplier = getScoreMultiplier();
    const actualPoints = isCorrect ? (points * multiplier) : 0;

    if (isCorrect) {
      setScore(score + actualPoints);
      setStreak(streak + 1);
      setTotalCorrect(totalCorrect + 1);
      playSuccessAnimation();
      Vibration.vibrate(100);
    } else {
      setStreak(0);
      setPerfectRun(false);
      setLives(Math.max(0, lives - 1));
      Vibration.vibrate([100, 50, 100]);
    }

    // Update adaptive difficulty and risk score
    adjustDifficulty(isCorrect, timer, lives);
    calculateRiskScore(scenario, isCorrect, timer);

    checkAchievements(score + actualPoints, level, isCorrect);

    // Save to Firebase with new data
    const userId = name.replace(/[\s\.\#\$\[\]]/g, '_').toLowerCase();
    set(ref(db, 'students/' + userId + '/gameplay'), {
      level,
      isCorrect,
      score: score + actualPoints,
      riskScore,
      difficulty,
      timestamp: new Date().toISOString(),
      scenario: scenario.from || scenario.url || scenario.caller || scenario.website
    });

    const pointsText = isCorrect ? `+${actualPoints} points (${multiplier}x multiplier)` : '';
    showFeedbackPopup(isCorrect, scenario.explanation, pointsText, nextScreen, nextLevel);
  };

  useEffect(() => {
    let interval: any;
    
    if ((screen === 'game' || screen === 'level2' || screen === 'level3' || screen === 'level4' || screen === 'level5' || screen === 'inbox') && timer > 0 && !feedbackDialogVisible) {
      interval = setInterval(() => setTimer(t => {
        if (t <= 6 && t > 1) {
          playTimerWarning();
          Vibration.vibrate(100);
        }
        return t - 1;
      }), 1000);
    } else if (timer === 0 && (screen === 'game' || screen === 'level2' || screen === 'level3' || screen === 'level4' || screen === 'level5' || screen === 'inbox')) {
      Vibration.vibrate([200, 100, 200]);
      setLives(lives - 1);
      setStreak(0);
      setPerfectRun(false);
      
      Alert.alert("⏰ Time's up!", lives > 0 ? `${lives} lives remaining!` : "Game Over!");
      setScreen('results');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, timer, lives, feedbackDialogVisible, playTimerWarning, difficulty]);

  // SPLASH SCREEN
  if (screen === 'splash') {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: splashAnimation }]}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Text style={styles.splashLogo}>🛡️</Text>
          <Text style={styles.splashTitle}>PHISHFIGHTERS</Text>
          <Text style={styles.splashSubtitle}>Cybersecurity Training Game</Text>
        </Animated.View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading</Text>
          <Animated.View style={[styles.loadingDots, { opacity: loadingDots }]}>
            <Text style={styles.dotsText}>...</Text>
          </Animated.View>
        </View>
        
        <View style={styles.splashFooter}>
          <Text style={styles.versionText}>v1.0.0</Text>
          <Text style={styles.copyrightText}>Protecting Students from Cyber Threats</Text>
        </View>
      </Animated.View>
    );
  }

  // HOME SCREEN - FEATURE PREVIEW
  if (screen === 'home') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🛡️ Welcome to PhishFighters</Text>
        <Text style={styles.subtitle}>Master cybersecurity through interactive training</Text>
        
        <View style={styles.featurePreviewContainer}>
          <Text style={styles.featurePreviewTitle}>🎯 FEATURE PREVIEW</Text>
          
          {/* Phishing Email Simulations Card */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert("Coming Soon!", "Interactive email analysis challenges will be available in the full version.")}
          >
            <View style={styles.featureCardHeader}>
              <Text style={styles.featureIcon}>📧</Text>
              <Text style={styles.featureTitle}>Phishing Email Simulations</Text>
            </View>
            <Text style={styles.featureDescription}>
              Users analyze suspicious emails and choose actions like &quot;Report Phishing&quot; or &quot;Looks Safe&quot;
            </Text>
            <View style={styles.featureTags}>
              <Text style={styles.featureTag}>Interactive</Text>
              <Text style={styles.featureTag}>Email Analysis</Text>
            </View>
          </TouchableOpacity>

          {/* Fake Login Detection Card */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert("Coming Soon!", "Fake login page detection challenges will be available in the full version.")}
          >
            <View style={styles.featureCardHeader}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureTitle}>Fake Login Detection</Text>
            </View>
            <Text style={styles.featureDescription}>
              Identify spoofed login pages and unsafe links through visual inspection and URL analysis
            </Text>
            <View style={styles.featureTags}>
              <Text style={styles.featureTag}>URL Analysis</Text>
              <Text style={styles.featureTag}>Visual Inspection</Text>
            </View>
          </TouchableOpacity>

          {/* Social Engineering Challenges Card */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert("Coming Soon!", "Social engineering scenario challenges will be available in the full version.")}
          >
            <View style={styles.featureCardHeader}>
              <Text style={styles.featureIcon}>🎭</Text>
              <Text style={styles.featureTitle}>Social Engineering Challenges</Text>
            </View>
            <Text style={styles.featureDescription}>
              Scenario-based decision making for phone calls, in-person requests, and psychological manipulation tactics
            </Text>
            <View style={styles.featureTags}>
              <Text style={styles.featureTag}>Phone Scenarios</Text>
              <Text style={styles.featureTag}>Decision Making</Text>
            </View>
          </TouchableOpacity>

          {/* Video-Based Training Module Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureCardHeader}>
              <Text style={styles.featureIcon}>🎬</Text>
              <Text style={styles.featureTitle}>Video-Based Training Module</Text>
            </View>
            <Text style={styles.featureDescription}>
              Interactive video learning with post-watching quizzes and XP rewards
            </Text>
            
            {/* Video Progress */}
            <View style={styles.videoProgressContainer}>
              <Text style={styles.progressText}>
                Progress: {videoTrainingProgress.completedModules}/{videoTrainingProgress.totalModules} modules
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(videoTrainingProgress.completedModules / videoTrainingProgress.totalModules) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.xpText}>XP: {videoTrainingProgress.xpPoints} points</Text>
            </View>

            {/* Video Module List */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoModulesContainer}>
              {videoTrainingModules.map((module) => (
                <TouchableOpacity
                  key={module.id}
                  style={[
                    styles.videoModuleCard,
                    videoTrainingProgress.completedModules >= module.id && styles.completedModule
                  ]}
                  onPress={() => startVideoTraining(module.id)}
                >
                  <Text style={styles.videoThumbnail}>{module.thumbnail}</Text>
                  <Text style={styles.videoTitle}>{module.title}</Text>
                  <Text style={styles.videoDuration}>{module.duration}</Text>
                  {videoTrainingProgress.completedModules >= module.id && (
                    <Text style={styles.completedBadge}>✅</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => {
                const nextModule = videoTrainingProgress.completedModules + 1;
                if (nextModule <= videoTrainingModules.length) {
                  startVideoTraining(nextModule);
                } else {
                  Alert.alert("All modules completed!", "Great job! You've finished all video training modules.");
                }
              }}
            >
              <Text style={styles.watchButtonText}>
                {videoTrainingProgress.completedModules < videoTrainingModules.length ? 
                  "🎬 Watch & Respond" : 
                  "🎉 All Complete!"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Real-Time Feedback System Card */}
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert("Real-Time Feedback", "Instant responses and detailed explanations after each action help users learn immediately.")}
          >
            <View style={styles.featureCardHeader}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Real-Time Feedback System</Text>
            </View>
            <Text style={styles.featureDescription}>
              Instant responses and explanations after actions with visual feedback, sound effects, and detailed reasoning
            </Text>
            <View style={styles.featureTags}>
              <Text style={styles.featureTag}>Instant Feedback</Text>
              <Text style={styles.featureTag}>Explanations</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={() => setScreen('welcome')}>
          <Text style={styles.btnText}>🚀 START YOUR TRAINING</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // WELCOME SCREEN
  if (screen === 'welcome') {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.titleContainer, { transform: [{ scale: buttonPulse }] }]}>

          <Text style={styles.title}>🛡️ PhishFighters</Text>
          <Text style={styles.subtitle}>Cybersecurity Training Game</Text>
          <Text style={styles.gameMode}>🎮 ARCADE MODE</Text>
        </Animated.View>
        
        <View style={styles.statsPreview}>
          <Text style={styles.statText}>🏆 High Score: {Math.max(score, 15)}</Text>
          <Text style={styles.statText}>🔥 Best Streak: {Math.max(streak, 5)}</Text>
          <Text style={styles.statText}>🏅 Achievements: {Object.keys(achievementsObj).length}/5</Text>
        </View>
        
        <TextInput 
          style={styles.input} 
          placeholder="Enter Your Gamer Tag" 
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        
        <TouchableOpacity 
          style={[styles.btn, styles.startBtn, !name.trim() && styles.btnDisabled]} 
          onPress={() => {
            if (!name.trim()) {
              Alert.alert('Gamer Tag Required', 'Enter your name to start your cybersecurity journey!');
              return;
            }
            Vibration.vibrate(50);
            trackEvent('quiz_started', { user_name: name });
            initializeAdaptiveScenarios();
            setScreen('quiz');
          }}
          disabled={!name.trim()}
        >
          <Text style={styles.btnText}>🚀 START MISSION</Text>
        </TouchableOpacity>
        
        <View style={styles.difficultyInfo}>
          <Text style={styles.difficultyTitle}>🎯 Mission Briefing:</Text>
          <Text style={styles.difficultyText}>
            • 5 Levels of cyber threats{"\n"}
            • 30 seconds per challenge{"\n"}
            • 3 lives to complete mission{"\n"}
            • Bonus points for speed & streaks
          </Text>
        </View>
      </View>
    );
  }
  // QUIZ SCREEN
  if (screen === 'quiz') {
    const currentQ = preQuizQuestions[currentPreQuestion];
    const isLastQuestion = currentPreQuestion === preQuizQuestions.length - 1;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pre-Assessment Quiz</Text>
        <Text style={styles.questionCounter}>
          Question {currentPreQuestion + 1} of {preQuizQuestions.length}
        </Text>
        <Text style={styles.questionText}>
          {currentQ.question}
        </Text>
        
        {currentQ.options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.btn} 
            onPress={() => {
              const newAnswers = [...preAnswers];
              newAnswers[currentPreQuestion] = index;
              setPreAnswers(newAnswers);
              
              if (isLastQuestion) {
                // Save all answers
                const preQuizData = {
                  answers: newAnswers,
                  score: newAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length,
                  total: preQuizQuestions.length
                };
                set(ref(db, 'students/' + name.replace(/[\s\.\#\$\[\]]/g, '_').toLowerCase() + '/preQuiz'), preQuizData);
                trackEvent('pre_quiz_completed', preQuizData);
                setTimer(30);
                initializeAdaptiveScenarios();
                setScreen('preResults');
              } else {
                setCurrentPreQuestion(currentPreQuestion + 1);
              }
            }}
          >
            <Text style={styles.btnText}>
              {index === 0 ? '✅ ' : '❌ '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.quizNavigation}>
          {currentPreQuestion > 0 && (
            <TouchableOpacity 
              style={[styles.navBtn, styles.backBtn]} 
              onPress={() => setCurrentPreQuestion(currentPreQuestion - 1)}
            >
              <Text style={styles.backBtnText}>← Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => setScreen('welcome')}
          >
            <Text style={styles.backBtnText}>Exit Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  // POST-QUIZ SCREEN
  if (screen === 'postQuiz') {
    const currentQ = preQuizQuestions[currentPostQuestion];
    const isLastQuestion = currentPostQuestion === preQuizQuestions.length - 1;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Post-Assessment Quiz</Text>
        <Text style={styles.questionCounter}>
          Question {currentPostQuestion + 1} of {preQuizQuestions.length}
        </Text>
        <Text style={styles.questionText}>
          {currentQ.question}
        </Text>
        
        {currentQ.options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.btn} 
            onPress={() => {
              const newAnswers = [...postAnswers];
              newAnswers[currentPostQuestion] = index;
              setPostAnswers(newAnswers);
              
              if (isLastQuestion) {
                // Save all answers
                const postQuizData = {
                  answers: newAnswers,
                  score: newAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length,
                  total: preQuizQuestions.length
                };
                set(ref(db, 'students/' + name.replace(/[\s\.\#\$\[\]]/g, '_').toLowerCase() + '/postQuiz'), postQuizData);
                trackEvent('post_quiz_completed', postQuizData);
                setScreen('postResults');
              } else {
                setCurrentPostQuestion(currentPostQuestion + 1);
              }
            }}
          >
            <Text style={styles.btnText}>
              {index === 0 ? '✅ ' : '❌ '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.quizNavigation}>
          {currentPostQuestion > 0 && (
            <TouchableOpacity 
              style={[styles.navBtn, styles.backBtn]} 
              onPress={() => setCurrentPostQuestion(currentPostQuestion - 1)}
            >
              <Text style={styles.backBtnText}>← Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => setScreen('results')}
          >
            <Text style={styles.backBtnText}>Skip Post-Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  // PRE-RESULTS SCREEN
  if (screen === 'preResults') {
    const preScore = preAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length;
    const preTotal = preQuizQuestions.length;
    const prePercentage = Math.round((preScore / preTotal) * 100);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {prePercentage >= 80 ? '🎉 Great Start!' : prePercentage >= 60 ? '👍 Good Effort!' : '📚 Keep Learning!'}
        </Text>
        
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>📊 Pre-Assessment Results</Text>
          <Text style={styles.resultsText}>👤 Agent: {name}</Text>
          <Text style={styles.resultsText}>✅ Correct Answers: {preScore}/{preTotal}</Text>
          <Text style={styles.resultsText}>📈 Score: {prePercentage}%</Text>
          <Text style={styles.resultsText}>
            🎯 Readiness: {
              prePercentage >= 80 ? 'Cyber Ready! 🛡️' :
              prePercentage >= 60 ? 'Getting There! ⚡' :
              'Room for Improvement 📖'
            }
          </Text>
          
          {prePercentage < 60 && (
            <Text style={styles.feedbackText}>
              💡 Tip: Review phishing basics - check sender addresses, avoid suspicious links, and never share passwords!
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => setScreen('game')}
        >
          <Text style={styles.btnText}>🚀 Start Mission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // POST-RESULTS SCREEN
  if (screen === 'postResults') {
    const preScore = preAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length;
    const postScore = postAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length;
    const totalQuestions = preQuizQuestions.length;
    const prePercentage = Math.round((preScore / totalQuestions) * 100);
    const postPercentage = Math.round((postScore / totalQuestions) * 100);
    const improvement = postPercentage - prePercentage;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {improvement > 10 ? '🚀 Amazing Learning!' : improvement > 0 ? '📈 Knowledge Gained!' : improvement === 0 ? '🎯 Solid Foundation!' : '💪 Keep Practicing!'}
        </Text>
        
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>📊 Learning Assessment</Text>
          <Text style={styles.resultsText}>👤 Agent: {name}</Text>
          
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>📈 Score Comparison:</Text>
            <Text style={styles.resultsText}>📝 Pre-Test: {preScore}/{totalQuestions} ({prePercentage}%)</Text>
            <Text style={styles.resultsText}>🎓 Post-Test: {postScore}/{totalQuestions} ({postPercentage}%)</Text>
            <Text style={[styles.resultsText, styles.improvementText]}>
              {improvement > 0 ? `📈 Improvement: +${improvement}%` : 
               improvement === 0 ? '🎯 No Change' : 
               `📉 Score: ${improvement}%`}
            </Text>
          </View>
          
          <Text style={styles.resultsText}>
            🧠 Learning Outcome: {
              improvement > 15 ? 'Exceptional Growth! 🌟' :
              improvement > 5 ? 'Great Progress! ⭐' :
              improvement > 0 ? 'Some Improvement 📚' :
              improvement === 0 ? 'Knowledge Retained 🎯' :
              'Room to Grow 💪'
            }
          </Text>
          
          {improvement <= 0 && (
            <Text style={styles.feedbackText}>
              💡 Tip: Try playing again with different scenarios to reinforce your learning!
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => setScreen('results')}
        >
          <Text style={styles.btnText}>📊 View Full Results</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // GAME SCREEN
  if (screen === 'game') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>🎯 Level {level}: Email Challenge</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>
        
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>
              🔥 {streak}x STREAK! {getRandomEncouragement()}
            </Text>
          </View>
        )}
        
        <View style={styles.answerCard}>
          <Text style={styles.answerText}>
            Your Answer: {answers.q1 === 'Yes' ? 'You always check sender emails ✅' : 'You sometimes/never check sender emails ⚠️'}
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.emailHeader}>📧 {currentScenarios.level1?.isPhishing ? 'Suspicious Email' : 'Email Message'}</Text>
          <Text style={styles.emailText}>From: {currentScenarios.level1?.from}</Text>
          <Text style={styles.emailText}>Subject: {currentScenarios.level1?.subject}</Text>
          <Text style={styles.emailText}>
            {"\n"}{currentScenarios.level1?.content}
          </Text>
        </View>
        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.btnRed, styles.pulseBtn, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, currentScenarios.level1, 1, 'level2', 2)}
        >
          <Text style={styles.btnText}>🚨 REPORT PHISHING</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, currentScenarios.level1, 1, 'level2', 2)}
        >
          <Text style={styles.btnText}>✅ LOOKS SAFE</Text>
        </TouchableOpacity>
        
        {showCelebration && (
          <Animated.View style={[styles.celebrationOverlay, { opacity: celebrationAnimation }]}>
            <Text style={styles.celebrationText}>🎉 ACHIEVEMENT UNLOCKED! 🎉</Text>
          </Animated.View>
        )}
        <FeedbackPopup />
      </View>
    );
  }

  // LEVEL 2 SCREEN - Website Phishing
  if (screen === 'level2') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>🌐 Level {level}: Website Challenge</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>
        
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>
              🔥 {streak}x STREAK! {getRandomEncouragement()}
            </Text>
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.emailHeader}>🌐 Suspicious Website</Text>
          <Text style={[styles.emailText, {color: 'blue', fontWeight: 'bold', marginBottom: 10}]}>
            URL: {currentScenarios.level2?.url}
          </Text>
          <Text style={styles.emailText}>Type: {currentScenarios.level2?.type}</Text>
          <View style={styles.websitePreview}>
            <TextInput style={styles.input} placeholder="Email" editable={false} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} editable={false} />
          </View>
        </View>
        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, currentScenarios.level2, 1, 'level3', 3)}
        >
          <Text style={styles.btnText}>🚨 REPORT PHISHING</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, currentScenarios.level2, 1, 'level3', 3)}
        >
          <Text style={styles.btnText}>✅ LOOKS SAFE</Text>
        </TouchableOpacity>
        <FeedbackPopup />
      </View>
    );
  }

  // LEVEL 3 SCREEN - Scholarship Scams
  if (screen === 'level3') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>🎓 Level {level}: Scholarship Challenge</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>
        
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>
              🔥 {streak}x STREAK! {getRandomEncouragement()}
            </Text>
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.emailHeader}>💰 Scholarship Opportunity</Text>
          <Text style={styles.emailText}>From: {currentScenarios.level3?.from}</Text>
          <Text style={styles.emailText}>Subject: {currentScenarios.level3?.subject}</Text>
          <Text style={styles.emailText}>
            {"\n"}{currentScenarios.level3?.content}
          </Text>
        </View>
        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, currentScenarios.level3, 2, 'level4', 4)}
        >
          <Text style={styles.btnText}>🚨 REPORT SCAM</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, currentScenarios.level3, 2, 'level4', 4)}
        >
          <Text style={styles.btnText}>✅ APPLY NOW</Text>
        </TouchableOpacity>
        <FeedbackPopup />
      </View>
    );
  }

  // LEVEL 4 SCREEN - Social Engineering
  if (screen === 'level4') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>📞 Level {level}: Social Engineering</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>
        
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>
              🔥 {streak}x STREAK! {getRandomEncouragement()}
            </Text>
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.emailHeader}>📞 Phone Call Scenario</Text>
          <Text style={styles.emailText}>Caller: {currentScenarios.level4?.caller}</Text>
          <Text style={styles.emailText}>Phone: {currentScenarios.level4?.phone}</Text>
          <Text style={styles.emailText}>
            {"\n"}Message: {currentScenarios.level4?.message}
          </Text>
        </View>
        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, currentScenarios.level4, 2, 'level5', 5)}
        >
          <Text style={styles.btnText}>🚨 HANG UP & REPORT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, currentScenarios.level4, 2, 'level5', 5)}
        >
          <Text style={styles.btnText}>✅ PROVIDE INFO</Text>
        </TouchableOpacity>
        <FeedbackPopup />
      </View>
    );
  }

  // LEVEL 5 SCREEN - Malware Detection
  if (screen === 'level5') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>💻 Level {level}: Malware Detection</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>
        
        {streak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>
              🔥 {streak}x STREAK! {getRandomEncouragement()}
            </Text>
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.emailHeader}>💻 Download Website</Text>
          <Text style={styles.emailText}>Website: {currentScenarios.level5?.website}</Text>
          <Text style={styles.emailText}>Available Files:</Text>
          {currentScenarios.level5?.files?.map((file: string, index: number) => (
            <Text key={index} style={[styles.emailText, {marginLeft: 10, color: '#007bff'}]}>
              📁 {file}
            </Text>
          ))}
        </View>
        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, currentScenarios.level5, 3, 'results')}
        >
          <Text style={styles.btnText}>🚨 AVOID DOWNLOAD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, currentScenarios.level5, 3, 'results')}
        >
          <Text style={styles.btnText}>✅ DOWNLOAD FILES</Text>
        </TouchableOpacity>
        <FeedbackPopup />
      </View>
    );
  }

  // NEW FEATURE: Inbox Simulation Screen
  if (screen === 'inbox') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>📧 Inbox Challenge</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Review your emails and identify threats!</Text>

        <ScrollView style={styles.inboxContainer}>
          {inboxItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.inboxItem}
              onPress={() => {
                // Show full email details
                setCurrentScenarios({ selectedEmail: item });
                setScreen('emailDetail');
              }}
            >
              <View style={styles.inboxItemHeader}>
                <Text style={styles.inboxSender}>{item.from || item.caller || item.website}</Text>
                <Text style={styles.inboxTime}>2m ago</Text>
              </View>
              <Text style={styles.inboxSubject}>{item.subject || item.type || 'Download Available'}</Text>
              <Text style={styles.inboxPreview} numberOfLines={1}>
                {item.content || item.message || `Files: ${item.files?.join(', ')}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => setScreen('results')}
        >
          <Text style={styles.btnText}>Finish Inbox Challenge</Text>
        </TouchableOpacity>

        <FeedbackPopup />
      </View>
    );
  }

  // NEW FEATURE: Email Detail Screen
  if (screen === 'emailDetail') {
    const selectedEmail = currentScenarios.selectedEmail;
    if (!selectedEmail) return null;

    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.title}>📧 Email Details</Text>
          <View style={styles.gameStats}>
            <Animated.View style={{ transform: [{ scale: timerAnimation }] }}>
              <Text style={[styles.timerText, timer <= 5 && styles.timerUrgent]}>
                ⏰ {timer}s {timer <= 5 ? '🚨' : ''}
              </Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: scoreAnimation }] }}>
              <Text style={styles.scoreText}>🏆 {score}</Text>
            </Animated.View>
            <Text style={styles.livesText}>❤️ {lives}</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
            <Text style={[styles.riskText, riskScore > 50 ? styles.riskHigh : riskScore > 25 ? styles.riskMedium : styles.riskLow]}>
              ⚠️ {riskScore}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.emailHeader}>📧 {selectedEmail.isPhishing ? 'Suspicious Email' : 'Email Message'}</Text>
          <Text style={styles.emailText}>From: {selectedEmail.from}</Text>
          <Text style={styles.emailText}>Subject: {selectedEmail.subject}</Text>
          <Text style={styles.emailText}>
            {"\n"}{selectedEmail.content}
          </Text>
        </View>

        {feedbackVisible && (
          <View style={[styles.feedbackCard, feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnRed, styles.pulseBtn, timer === 0 && styles.btnDisabled]}
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(true, selectedEmail, 1, 'inbox')}
        >
          <Text style={styles.btnText}>🚨 REPORT PHISHING</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]}
          disabled={timer === 0}
          onPress={() => handleScenarioAnswer(false, selectedEmail, 1, 'inbox')}
        >
          <Text style={styles.btnText}>✅ LOOKS SAFE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen('inbox')}
        >
          <Text style={styles.backBtnText}>← Back to Inbox</Text>
        </TouchableOpacity>

        <FeedbackPopup />
      </View>
    );
  }

  // FEATURE PREVIEW: Video Player Screen
  if (screen === 'videoPlayer') {
    const currentModule = videoTrainingProgress.currentVideo;
    if (!currentModule) return null;

    const isVideoWatched = currentModule.videoWatched || false;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎬 {currentModule.title}</Text>
        
        <View style={styles.videoPlayerContainer}>
          <ExpoVideo
            source={currentModule.videoUrl}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isMuted={false}
            volume={1.0}
            shouldPlay={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish && !isVideoWatched) {
                // Mark video as watched when it completes
                setVideoTrainingProgress(prev => ({
                  ...prev,
                  currentVideo: prev.currentVideo ? { ...prev.currentVideo, videoWatched: true } : null
                }));
                setTimeout(() => completeVideoAndStartQuiz(), 1000); // Small delay for UX
              }
            }}
          />
          
          <Text style={styles.videoDescription}>{currentModule.description}</Text>
          
          {!isVideoWatched ? (
            <View style={styles.lockedQuizContainer}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockedQuizText}>
                Watch the full video to unlock the quiz
              </Text>
              <Text style={styles.lockSubtext}>
                Complete the video to test your knowledge!
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.btn}
              onPress={completeVideoAndStartQuiz}
            >
              <Text style={styles.btnText}>✅ Video Complete - Start Quiz</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.backBtnText}>← Back to Features</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // FEATURE PREVIEW: Video Quiz Screen
  if (screen === 'videoQuiz') {
    const currentQuestion = videoTrainingProgress.quizQuestions[videoTrainingProgress.currentQuizQuestion];
    if (!currentQuestion) return null;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>📝 Knowledge Check</Text>
        <Text style={styles.questionCounter}>
          Question {videoTrainingProgress.currentQuizQuestion + 1} of {videoTrainingProgress.quizQuestions.length}
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>
        
        {currentQuestion.options.map((option: string, index: number) => (
          <TouchableOpacity 
            key={index}
            style={styles.btn} 
            onPress={() => answerVideoQuizQuestion(index)}
          >
            <Text style={styles.btnText}>
              {index === 0 ? '✅ ' : index === 1 ? '❌ ' : '🤔 '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.backBtnText}>Skip Quiz</Text>
        </TouchableOpacity>
        
        <FeedbackPopup />
      </View>
    );
  }

  // RESULTS SCREEN
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {score >= 10 ? '🏆 CYBER CHAMPION!' : score >= 7 ? '🛡️ SECURITY EXPERT!' : score >= 4 ? '⚡ CYBER WARRIOR!' : '🎯 MISSION COMPLETE!'}
      </Text>
      
      <View style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>📊 Mission Report</Text>
        <Text style={styles.resultsText}>👤 Agent: {name}</Text>
        <Text style={styles.resultsText}>🏆 Final Score: {score} points</Text>
        <Text style={styles.resultsText}>🎯 Highest Level: {level}</Text>
        <Text style={styles.resultsText}>🔥 Best Streak: {Math.max(streak, totalCorrect)}</Text>
        <Text style={styles.resultsText}>✅ Threats Detected: {totalCorrect}/5</Text>
        <Text style={styles.resultsText}>❤️ Lives Remaining: {lives}</Text>
        <Text style={styles.resultsText}>⚠️ Risk Score: {riskScore}/100 ({riskScore > 50 ? 'High' : riskScore > 25 ? 'Medium' : 'Low'})</Text>
        <Text style={styles.resultsText}>
          📧 Pre-Quiz Score: {preAnswers.filter((a, i) => a === preQuizQuestions[i].correct).length}/{preQuizQuestions.length} correct
        </Text>
        <Text style={styles.resultsText}>
          🎮 Performance: {perfectRun ? 'PERFECT RUN! 🌟' : gameResult || 'Mission Complete'}
        </Text>
        
        {Object.keys(achievementsObj).length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.achievementsTitle}>🏅 Achievements Unlocked:</Text>
            {(Object.entries(achievementsObj) as [string, { level: number; title: string }][]).map(([key, achievement]) => (
              <Text key={key} style={styles.achievementText}>
                🏆 {achievement.title} (Level {achievement.level})
              </Text>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.btn, styles.postTestBtn]} 
        onPress={() => {
          setCurrentPostQuestion(0);
          setPostAnswers([]);
          setScreen('postQuiz');
        }}
      >
        <Text style={styles.btnText}>📚 Take Post-Test (Measure Learning)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: '#9b59b6' }]} 
        onPress={() => {
          generateInboxItems();
          setTimer(30);
          setScreen('inbox');
        }}
      >
        <Text style={styles.btnText}>📧 Try Inbox Simulation</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => {
          setScreen('welcome');
          setName('');
          setAnswers({ q1: '' });
          setGameResult('');
          setTimer(30);
          setScore(0);
          setLevel(1);
          setStreak(0);
          setLives(3);
          setTotalCorrect(0);
          setPerfectRun(true);
          setCurrentScenarios({});
          setCurrentPreQuestion(0);
          setPreAnswers([]);
          setCurrentPostQuestion(0);
          setPostAnswers([]);
          setDifficulty(1);
          setRiskScore(0);
          setPlayerProfile({
            weakAreas: [],
            strongAreas: [],
            categoryAccuracy: {},
            totalAttempts: 0,
            totalCorrect: 0
          });
          setInboxItems([]);
          setAchievementsObj({});
          trackEvent('game_reset', { student: name });
        }}
      >
        <Text style={styles.btnText}>🔄 Play Again (New Scenarios)</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

export const VideoTraining = () => {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoScore, setVideoScore] = useState(0);

  const handleVideoEnd = () => {
    setVideoCompleted(true);
    setShowQuiz(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setVideoScore(prev => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      {!showQuiz && (
        <View style={styles.videoContainer}>
          <ExpoVideo
            source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'}} // Direct MP4 URL
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isMuted={false}
            volume={1.0}
            shouldPlay={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />
          {!videoCompleted && (
            <Text style={styles.lockText}>
              Watch the full video to unlock the quiz 🔒
            </Text>
          )}
        </View>
      )}

      {showQuiz && (
        <View style={styles.quizContainer}>
          <Text style={styles.question}>
            What is a common sign of a phishing email?
          </Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleAnswer(true)}
          >
            <Text>Suspicious link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleAnswer(false)}
          >
            <Text>Official company logo</Text>
          </TouchableOpacity>

          <Text style={styles.score}>Score: {videoScore}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100
  },
  splashLogo: {
    fontSize: 80,
    marginBottom: 20
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 150
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500'
  },
  loadingDots: {
    marginLeft: 5
  },
  dotsText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  splashFooter: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center'
  },
  versionText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 5
  },
  copyrightText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  containerScroll: {
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 80
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  gameHeader: {
    width: '100%',
    marginBottom: 20
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  statsPreview: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center'
  },
  statText: {
    color: '#ecf0f1',
    fontSize: 14,
    marginBottom: 5
  },
  gameMode: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5
  },
  startBtn: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  pulseBtn: {
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  streakBanner: {
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 20,
    marginBottom: 15,
    width: '100%'
  },
  streakBannerText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  livesText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold'
  },
  streakText: {
    color: '#f39c12',
    fontSize: 16,
    fontWeight: 'bold'
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  celebrationText: {
    color: '#f39c12',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  difficultyInfo: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginTop: 20
  },
  difficultyTitle: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  difficultyText: {
    color: '#bdc3c7',
    fontSize: 14,
    lineHeight: 20
  },
  timerText: {
    color: '#f39c12',
    fontSize: 18,
    fontWeight: 'bold'
  },
  timerUrgent: {
    color: '#e74c3c'
  },
  scoreText: {
    color: '#27ae60',
    fontSize: 18,
    fontWeight: 'bold'
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center'
  },
  homeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 10
  },
  questionCounter: {
    color: '#3498db',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  },
  quizNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 5
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16
  },
  questionText: {
    color: '#ddd',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    elevation: 5,
  },
  emailHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center'
  },
  emailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20
  },
  btn: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10
  },
  btnRed: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10
  },
  btnGreen: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  btnDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6
  },
  backBtn: {
    backgroundColor: 'transparent',
    padding: 10,
    marginTop: 20
  },
  backBtnText: {
    color: '#4a90e2',
    textAlign: 'center',
    fontSize: 16
  },
  answerCard: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2'
  },
  answerText: {
    color: '#ecf0f1',
    fontSize: 14,
    textAlign: 'center'
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center'
  },
  resultsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 10
  },
  achievementsSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8
  },
  achievementText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5
  },
  websitePreview: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginTop: 10
  },
  feedbackCard: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60'
  },
  feedbackIncorrect: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b'
  },
  feedbackText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  postTestBtn: {
    backgroundColor: '#9b59b6',
    marginBottom: 10
  },
  comparisonSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10
  },
  improvementText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  feedbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  feedbackModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  feedbackButton: {
    marginTop: 20,
    backgroundColor: '#2c3e50',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  feedbackCountdown: {
    color: '#666',
    fontSize: 14,
    marginTop: 10
  },
  riskText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: 'bold'
  },
  riskHigh: {
    color: '#e74c3c'
  },
  riskMedium: {
    color: '#f39c12'
  },
  riskLow: {
    color: '#27ae60'
  },
  inboxContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20
  },
  inboxItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2'
  },
  inboxItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  inboxSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  inboxTime: {
    fontSize: 12,
    color: '#666'
  },
  inboxSubject: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5
  },
  inboxPreview: {
    fontSize: 12,
    color: '#666'
  },
  // FEATURE PREVIEW STYLES
  featurePreviewContainer: {
    width: '100%',
    marginBottom: 30
  },
  featurePreviewTitle: {
    color: '#3498db',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  featureDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  featureTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 4,
    fontWeight: '500'
  },
  videoProgressContainer: {
    marginBottom: 15
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 5
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4
  },
  xpText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: 'bold'
  },
  videoModulesContainer: {
    marginBottom: 15
  },
  videoModuleCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    width: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  completedModule: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e8'
  },
  videoThumbnail: {
    fontSize: 30,
    marginBottom: 5
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 3
  },
  videoDuration: {
    fontSize: 10,
    color: '#666'
  },
  completedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 16
  },
  watchButton: {
    backgroundColor: '#ff5722',
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  watchButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  videoContainer: {
    alignItems: 'center'
  },
  video: {
    width: width - 32,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#000'
  },
  lockText: {
    color: '#aaa',
    marginTop: 10
  },
  quizContainer: {
    marginTop: 20,
    backgroundColor: '#112240',
    padding: 16,
    borderRadius: 12,
    width: '100%'
  },
  question: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10
  },
  option: {
    backgroundColor: '#1E3A5F',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5
  },
  score: {
    marginTop: 15,
    color: '#00FFAA',
    fontWeight: 'bold'
  },
  videoPlayerContainer: {
    width: '100%',
    alignItems: 'center'
  },
  videoPlayer: {
    width: width - 32,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#000',
    marginBottom: 20
  },
  videoThumbnailLarge: {
    backgroundColor: '#000',
    width: '100%',
    height: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  videoThumbnailIcon: {
    fontSize: 48,
    color: 'white',
    marginBottom: 10
  },
  videoPlaceholderText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  videoDurationLarge: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10
  },
  videoDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22
  },
  lockedQuizContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginTop: 10
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 10
  },
  lockedQuizText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 5
  },
  lockSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center'
  }
});

