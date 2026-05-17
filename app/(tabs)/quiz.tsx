import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';

// ==========================================
// Quiz Questions Data Source
// ==========================================
const quizQuestions = [
  {
    id: 1,
    question: "You receive an email from 'secure-bank-update@gmail.com' asking you to reset your password immediately. What should you do?",
    options: [
      "Click the link and change your password.",
      "Ignore it or report it; banks don't use Gmail addresses.",
      "Reply asking if it's real.",
      "Forward it to your friends."
    ],
    correctAnswer: 1 // Index of the correct option
  },
  {
    id: 2,
    question: "An urgent text message claims you won a $1,000 gift card and demands you click a link within 10 minutes to claim it. This is an example of:",
    options: [
      "Smishing (SMS Phishing)",
      "Vishing (Voice Phishing)",
      "Spear Phishing",
      "Whaling"
    ],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "What is the primary goal of a social engineering attack?",
    options: [
      "To upgrade your computer's software.",
      "To manipulate people into giving up confidential information.",
      "To improve network speeds.",
      "To block spam emails."
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which of the following is the most secure password practice?",
    options: [
      "Using 'Password123' for all accounts.",
      "Using a mix of uppercase, lowercase, numbers, symbols, and a unique password for every account.",
      "Writing passwords on a sticky note next to your computer.",
      "Sharing your password only with close family members."
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "You get a phone call from 'Tech Support' claiming your computer has a virus and they need remote access to fix it. What should you do?",
    options: [
      "Give them access immediately.",
      "Hang up; legitimate tech support companies do not call unsolicited.",
      "Give them your credit card details to pay for the fix.",
      "Let them log in but watch what they do."
    ],
    correctAnswer: 1
  }
];

// ==========================================
// Quiz Screen Component
// ==========================================
export default function QuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (selectedIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Check if the answer is correct
    if (selectedIndex === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
      Alert.alert("Correct!", "Great job, you spotted the safety practice!");
    } else {
      const correctOptionText = currentQuestion.options[currentQuestion.correctAnswer];
      Alert.alert("Incorrect", `The correct answer was: \n"${correctOptionText}"`);
    }

    // Move to next question or finish quiz
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
  };

  // Render End Game Results Screen
  if (quizCompleted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Quiz Completed! 🎉</Text>
        <Text style={styles.scoreText}>
          Your Score: {score} / {quizQuestions.length}
        </Text>
        <Text style={styles.feedbackText}>
          {score === quizQuestions.length 
            ? "Perfect! You're an expert Phish Fighter! 🛡️" 
            : "Good effort! Keep reviewing the videos to improve your security awareness."}
        </Text>
        <TouchableOpacity style={styles.button} onPress={restartQuiz}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Current Question Screen
  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {quizQuestions.length}
      </Text>
      
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswerSelect(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.runningScore}>Current Score: {score}</Text>
    </ScrollView>
  );
}

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  questionCard: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292e',
    lineHeight: 26,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  runningScore: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});