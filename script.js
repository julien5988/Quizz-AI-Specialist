// Quiz State
let quizData = {};
let currentQuestion = 0;
let score = 0;
let answered = false;
let timer;  // Variable pour le timer
let timePerQuestion = 105 / 60;  // Durée par question en minutes
let totalQuestions;  // Variable pour le nombre total de questions
let totalTime;  // Temps total pour le quiz en secondes
let timeLeft;

// DOM Elements
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const explanationSection = document.getElementById('explanation-section');
const explanationText = document.getElementById('explanation-text');
const nextButton = document.getElementById('next-button');
const scoreDisplay = document.getElementById('score-display');
const restartButton = document.getElementById('restart-button');
const resetButton = document.getElementById('reset-button'); // Élément pour le bouton de réinitialisation
const timerDisplay = document.getElementById('timer-display');  // Élément pour afficher le timer
const startButton = document.getElementById('start-button'); // Élément pour le bouton Start
const startContainer = document.getElementById('start-container'); // Élément pour le conteneur du bouton Start

// Gérer le clic sur le bouton Start
startButton.addEventListener('click', () => {
    startContainer.classList.add('hidden');  // Masquer le conteneur du bouton Start
    quizContainer.classList.remove('hidden');  // Afficher le conteneur du quiz
    initializeQuiz();  // Initialiser le quiz
});

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Échange
    }
}

// Fetch Quiz Data
function loadQuizData() {
    fetch('quizData.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            shuffleArray(quizData.exam.questions); // Mélanger les questions
            // initializeQuiz(); // Ne pas initialiser ici pour éviter de démarrer le quiz au chargement
        })
        .catch(error => console.error('Erreur lors du chargement des données du quiz:', error));
}

// Initialize Quiz
function initializeQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    totalQuestions = quizData.exam.questions.length;  // Nombre total de questions
    totalTime = Math.ceil(totalQuestions * timePerQuestion * 60);  // Temps total en secondes
    timeLeft = totalTime;  // Reset du temps pour le quiz entier
    timerDisplay.textContent = formatTime(timeLeft); // Reset le timer affiché
    showQuestion();
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    startTimer();  // Démarrer le timer global du quiz
}

// Show Current Question
function showQuestion() {
    const question = quizData.exam.questions[currentQuestion];
    questionCounter.textContent = `Question ${currentQuestion + 1}/${totalQuestions}`;
    questionText.textContent = question.question;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Create new options
    question.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option p-3 border rounded cursor-pointer';
        optionDiv.textContent = option;
        optionDiv.addEventListener('click', () => selectAnswer(option));
        optionsContainer.appendChild(optionDiv);
    });

    // Reset explanation and next button
    explanationSection.classList.add('hidden');
    nextButton.classList.add('hidden');
    scoreDisplay.textContent = `Score: ${score}/${currentQuestion + 1}`;
    answered = false;
}

// Handle Timer for the entire quiz
function startTimer() {
    timerDisplay.textContent = formatTime(timeLeft);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            showResults();  // Fin du quiz si le temps est écoulé
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Handle Answer Selection
function selectAnswer(selectedOption) {
    if (answered) return;

    answered = true;
    const question = quizData.exam.questions[currentQuestion];
    const correct = selectedOption && selectedOption.charAt(0) === question.correct_answer;

    // Update score
    if (correct) score++;

    // Update UI
    const options = optionsContainer.children;
    Array.from(options).forEach(option => {
        const optionLetter = option.textContent.charAt(0);
        option.classList.add('answered');

        if (optionLetter === question.correct_answer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedOption && !correct) {
            option.classList.add('incorrect');
        } else {
            option.classList.add('disabled');
        }
    });

    // Show explanation
    explanationSection.classList.remove('hidden');
    explanationText.textContent = question.explanation;
    explanationText.className = `p-4 rounded-lg border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;

    // Update score display
    scoreDisplay.textContent = `Score: ${score}/${currentQuestion + 1}`;

    // Show next button
    nextButton.classList.remove('hidden');
    nextButton.textContent = currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question';
}

// Handle Next Question
function nextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResults();
    }
}

// Show Quiz Results
function showResults() {
    clearInterval(timer);  // Arrêter le timer lorsqu'on affiche les résultats
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const percentage = Math.round((score / totalQuestions) * 100);
    document.getElementById('final-score').textContent =
        `You scored ${score} out of ${totalQuestions}`;
    document.getElementById('percentage').textContent = `(${percentage}%)`;

    const feedback = document.getElementById('feedback');
    if (percentage >= 80) {
        feedback.className = 'mb-6 p-4 rounded-lg bg-green-100 text-green-800';
        feedback.textContent = 'Excellent! You\'ve demonstrated a strong understanding of the material.';
    } else if (percentage >= 60) {
        feedback.className = 'mb-6 p-4 rounded-lg bg-yellow-100 text-yellow-800';
        feedback.textContent = 'Good effort! Consider reviewing the topics you missed to strengthen your knowledge.';
    } else {
        feedback.className = 'mb-6 p-4 rounded-lg bg-red-100 text-red-800';
        feedback.textContent = 'You might want to review the material and try again to improve your score.';
    }
}

// Handle Reset Quiz
function resetQuiz() {
    clearInterval(timer);  // Arrêter le timer si actif
    initializeQuiz();      // Réinitialiser le quiz
}

// Event Listeners
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', initializeQuiz);
resetButton.addEventListener('click', resetQuiz); // Ajouter l'écouteur d'événement pour le bouton de réinitialisation

// Load the quiz data and start the quiz
loadQuizData();
