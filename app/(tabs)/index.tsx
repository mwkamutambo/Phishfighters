import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Animated, 
  Vibration 
} from 'react-native';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from 'firebase/database';

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
  const [isSaving, setIsSaving] = useState(false);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lives, setLives] = useState(3);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [perfectRun, setPerfectRun] = useState(true);
  const [currentScenarios, setCurrentScenarios] = useState<any>({});
  
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
        setScreen('welcome');
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

  const getRandomScenario = (levelKey: string) => {
    const levelScenarios = scenarios[levelKey as keyof typeof scenarios];
    return levelScenarios[Math.floor(Math.random() * levelScenarios.length)];
  };

  const initializeScenarios = () => {
    const newScenarios = {
      level1: getRandomScenario('level1'),
      level2: getRandomScenario('level2'),
      level3: getRandomScenario('level3'),
      level4: getRandomScenario('level4'),
      level5: getRandomScenario('level5')
    };
    setCurrentScenarios(newScenarios);
    return newScenarios;
  };
  const playSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(scoreAnimation, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scoreAnimation, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const playTimerWarning = () => {
    Animated.sequence([
      Animated.timing(timerAnimation, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(timerAnimation, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const showCelebrationEffect = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(celebrationAnimation, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start(() => setShowCelebration(false));
  };

  // Helper to advance screens (used because Alert.alert callbacks
  // don't reliably run on web/Expo web fallback). Uses a short timeout
  // so native alerts still show briefly before navigation.
  const goToScreen = (screenName: string, levelNum?: number) => {
    setTimeout(() => {
      if (typeof levelNum === 'number') setLevel(levelNum);
      setTimer(60);
      setScreen(screenName);
    }, 250);
  };

  const checkAchievements = (currentScore: number, currentLevel: number, isCorrect: boolean): string[] => {
    const newAchievements: string[] = [];
    
    if (currentScore >= 5 && !achievements.includes('First Blood')) {
      newAchievements.push('First Blood');
    }
    if (streak >= 3 && !achievements.includes('Hat Trick')) {
      newAchievements.push('Hat Trick');
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
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

  const getScoreMultiplier = () => {
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 1;
  };
  useEffect(() => {
    let interval: any;
    if ((screen === 'game' || screen === 'level2' || screen === 'level3' || screen === 'level4' || screen === 'level5') && timer > 0) {
      interval = setInterval(() => setTimer(t => {
        if (t <= 6 && t > 1) {
          playTimerWarning();
          Vibration.vibrate(100);
        }
        return t - 1;
      }), 1000);
    } else if (timer === 0 && (screen === 'game' || screen === 'level2' || screen === 'level3' || screen === 'level4' || screen === 'level5')) {
      Vibration.vibrate([200, 100, 200]);
      setLives(lives - 1);
      setStreak(0);
      setPerfectRun(false);
      
      alert("⏰ Time's up! " + (lives > 0 ? `${lives} lives remaining!` : "Game Over!"));
      setScreen('results');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, timer, lives]);

  const saveData = (finalAnswers: any) => {
    if (!name.trim()) {
      console.error('Cannot save data: name is empty');
      return;
    }

    const userId = name.replace(/\s/g, '_').toLowerCase();
    set(ref(db, 'students/' + userId), {
      studentName: name,
      preQuizAnswer: finalAnswers.q1,
      timestamp: new Date().toISOString()
    }).then(() => {
      console.log("✅ Quiz data saved successfully!");
      trackEvent('quiz_data_saved', { 
        student: name, 
        answer: finalAnswers.q1 
      });
    }).catch((error) => {
      console.error("❌ Error saving quiz data: ", error);
    });
  };
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
          <Text style={styles.statText}>🏅 Achievements: {achievements.length}/5</Text>
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
            • 60 seconds per challenge{"\n"}
            • 3 lives to complete mission{"\n"}
            • Bonus points for speed & streaks
          </Text>
        </View>
      </View>
    );
  }
  // QUIZ SCREEN
  if (screen === 'quiz') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pre-Assessment</Text>
        <Text style={styles.questionText}>
          Do you check the sender's email address before clicking links?
        </Text>
        
        <TouchableOpacity 
          style={styles.btn} 
            onPress={() => { 
            const newAnswers = {...answers, q1: 'Yes'};
            setAnswers(newAnswers);
            saveData(newAnswers);
            trackEvent('quiz_answered', { question: 'email_checking', answer: 'Yes' });
            setTimer(60);
            initializeScenarios();
            setScreen('game'); 
          }}
        >
          <Text style={styles.btnText}>✅ Always</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.btn} 
            onPress={() => { 
            const newAnswers = {...answers, q1: 'No'};
            setAnswers(newAnswers);
            saveData(newAnswers);
            trackEvent('quiz_answered', { question: 'email_checking', answer: 'No' });
            setTimer(60);
            initializeScenarios();
            setScreen('game'); 
          }}
        >
          <Text style={styles.btnText}>❌ Never / Sometimes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => setScreen('welcome')}
        >
          <Text style={styles.backBtnText}>← Back</Text>
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
        
        <TouchableOpacity 
          style={[styles.btnRed, styles.pulseBtn, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level1?.isPhishing === true;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (1 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const newAchievements = checkAchievements(score + points, level, isCorrect);
            
            set(ref(db, 'students/' + name.replace(/\s/g, '_').toLowerCase() + '/results'), {
              level1: isCorrect ? 'Correct' : 'Incorrect',
              timestamp: new Date().toISOString(),
              score: score + points,
              timeRemaining: timer,
              streak: isCorrect ? streak + 1 : 0,
              scenario: currentScenarios.level1?.from
            });
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level1?.explanation}\n\n+${points} points (${multiplier}x multiplier)`
              : `💔 Oops! ${currentScenarios.level1?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(2);
                setTimer(60);
                setScreen('level2');
              }}]
            );
            goToScreen('level2', 2);
          }}
        >
          <Text style={styles.btnText}>🚨 REPORT PHISHING</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level1?.isPhishing === false;
            
            if (isCorrect) {
              const multiplier = getScoreMultiplier();
              const points = 1 * multiplier;
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level1?.explanation}`
              : `💔 Oops! ${currentScenarios.level1?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(2);
                setTimer(60);
                setScreen('level2');
              }}]
            );
            goToScreen('level2', 2);
          }}
        >
          <Text style={styles.btnText}>✅ LOOKS SAFE</Text>
        </TouchableOpacity>
        
        {showCelebration && (
          <Animated.View style={[styles.celebrationOverlay, { opacity: celebrationAnimation }]}>
            <Text style={styles.celebrationText}>🎉 ACHIEVEMENT UNLOCKED! 🎉</Text>
          </Animated.View>
        )}
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
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level2?.isPhishing === true;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (1 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level2?.explanation}\n\n+${points} points`
              : `💔 Oops! ${currentScenarios.level2?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(3);
                setTimer(60);
                setScreen('level3');
              }}]
            );
            goToScreen('level3', 3);
          }}
        >
          <Text style={styles.btnText}>🚨 REPORT PHISHING</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level2?.isPhishing === false;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (1 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level2?.explanation}`
              : `💔 Oops! ${currentScenarios.level2?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(3);
                setTimer(60);
                setScreen('level3');
              }}]
            );
            goToScreen('level3', 3);
          }}
        >
          <Text style={styles.btnText}>✅ LOOKS SAFE</Text>
        </TouchableOpacity>
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
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level3?.isPhishing === true;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (2 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level3?.explanation}\n\n+${points} points`
              : `💔 Oops! ${currentScenarios.level3?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(4);
                setTimer(60);
                setScreen('level4');
              }}]
            );
            goToScreen('level4', 4);
          }}
        >
          <Text style={styles.btnText}>🚨 REPORT SCAM</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level3?.isPhishing === false;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (2 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level3?.explanation}`
              : `💔 Oops! ${currentScenarios.level3?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(4);
                setTimer(60);
                setScreen('level4');
              }}]
            );
            goToScreen('level4', 4);
          }}
        >
          <Text style={styles.btnText}>✅ APPLY NOW</Text>
        </TouchableOpacity>
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
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level4?.isPhishing === true;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (2 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level4?.explanation}\n\n+${points} points`
              : `💔 Oops! ${currentScenarios.level4?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(5);
                setTimer(60);
                setScreen('level5');
              }}]
            );
            goToScreen('level5', 5);
          }}
        >
          <Text style={styles.btnText}>🚨 HANG UP & REPORT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level4?.isPhishing === false;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (2 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level4?.explanation}`
              : `💔 Oops! ${currentScenarios.level4?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'Continue', onPress: () => {
                setLevel(5);
                setTimer(60);
                setScreen('level5');
              }}]
            );
            goToScreen('level5', 5);
          }}
        >
          <Text style={styles.btnText}>✅ PROVIDE INFO</Text>
        </TouchableOpacity>
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
        
        <TouchableOpacity 
          style={[styles.btnRed, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level5?.isPhishing === true;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (3 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level5?.explanation}\n\n+${points} points`
              : `💔 Oops! ${currentScenarios.level5?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'View Results', onPress: () => {
                setScreen('results');
              }}]
            );
            goToScreen('results');
          }}
        >
          <Text style={styles.btnText}>🚨 AVOID DOWNLOAD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btnGreen, timer === 0 && styles.btnDisabled]} 
          disabled={timer === 0}
          onPress={() => {
            const isCorrect = currentScenarios.level5?.isPhishing === false;
            const multiplier = getScoreMultiplier();
            const points = isCorrect ? (3 * multiplier) : 0;
            
            if (isCorrect) {
              setScore(score + points);
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
            
            const message = isCorrect 
              ? `🎉 Correct! ${currentScenarios.level5?.explanation}`
              : `💔 Oops! ${currentScenarios.level5?.explanation}`;
            
            Alert.alert(isCorrect ? 'Correct! 🎉' : 'Not Quite! 🤔', message, 
              [{ text: 'View Results', onPress: () => {
                setScreen('results');
              }}]
            );
            goToScreen('results');
          }}
        >
          <Text style={styles.btnText}>✅ DOWNLOAD FILES</Text>
        </TouchableOpacity>
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
        <Text style={styles.resultsText}>
          📧 Email Security: {answers.q1 === 'Yes' ? 'Expert Level ✅' : 'Needs Training ⚠️'}
        </Text>
        <Text style={styles.resultsText}>
          🎮 Performance: {perfectRun ? 'PERFECT RUN! 🌟' : gameResult || 'Mission Complete'}
        </Text>
        
        {achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.achievementsTitle}>🏅 Achievements Unlocked:</Text>
            {achievements.map((achievement, index) => (
              <Text key={index} style={styles.achievementText}>
                🏆 {achievement}
              </Text>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => {
          setScreen('welcome');
          setName('');
          setAnswers({ q1: '' });
          setGameResult('');
          setTimer(60);
          setScore(0);
          setLevel(1);
          setStreak(0);
          setLives(3);
          setTotalCorrect(0);
          setPerfectRun(true);
          setCurrentScenarios({});
          trackEvent('game_reset', { student: name });
        }}
      >
        <Text style={styles.btnText}>🔄 Play Again (New Scenarios)</Text>
      </TouchableOpacity>
    </View>
  );
}
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
  }
});

