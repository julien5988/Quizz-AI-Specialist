// Quiz State
let quizData = {};
let currentQuestion = 0;
let score = 0;
let answered = false;
let timer;  // Timer variable
let timePerQuestion = 105 / 60;  // Time per question in minutes
let totalQuestions;  // Variable for the total number of questions
let totalTime;  // Total time for the quiz in seconds
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
const resetButton = document.getElementById('reset-button'); // Element for reset button
const timerDisplay = document.getElementById('timer-display');  // Element to display the timer
const startButton = document.getElementById('start-button'); // Element for the start button
const startContainer = document.getElementById('start-container'); // Element for the start container

// Variable to manage the score display option
let showScore = true;  // Default value to show score

// Handle click on the Start button
startButton.addEventListener('click', () => {
    const scoreOption = document.querySelector('input[name="scoreOption"]:checked').value;
    showScore = scoreOption === 'show';  // Update value based on user choice
    
    startContainer.classList.add('hidden');  // Hide the start button container
    quizContainer.classList.remove('hidden');  // Show the quiz container
    initializeQuiz();  // Initialize the quiz
});

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
}

// Fetch Quiz Data
function loadQuizData() {
    fetch('quizData.json')
        .then(response => response.json())
        .then(data => {
            quizData = data;
            shuffleArray(quizData.exam.questions); // Shuffle questions
        })
        .catch(error => console.error('Error loading quiz data:', error));
}

// Initialize Quiz
function initializeQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    totalQuestions = quizData.exam.questions.length;  // Total number of questions
    totalTime = Math.ceil(totalQuestions * timePerQuestion * 60);  // Total time in seconds
    timeLeft = totalTime;  // Reset time for the whole quiz
    timerDisplay.textContent = formatTime(timeLeft); // Reset displayed timer
    showQuestion();
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    startTimer();  // Start the global quiz timer
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
    scoreDisplay.textContent = showScore ? `Score: ${score}/${currentQuestion + 1}` : 'Score hidden';
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
            showResults();  // End quiz if time runs out
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

        // Ajouter la classe de surbrillance à l'option sélectionnée
        if (option.textContent === selectedOption) {
            option.classList.add('highlight'); // Surbrillance pour l'option sélectionnée
        }

        if (optionLetter === question.correct_answer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedOption && !correct) {
            option.classList.add('incorrect');
        } else {
            option.classList.add('disabled');
        }
    });

    // Show score based on user choice
    if (showScore) {
        scoreDisplay.textContent = `Score: ${score}/${currentQuestion + 1}`;
        // Show explanation since score is displayed
        explanationSection.classList.remove('hidden');
        explanationText.textContent = question.explanation;
        explanationText.className = `p-4 rounded-lg border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
    } else {
        // If score is hidden, don't show the explanation
        scoreDisplay.textContent = 'Score hidden';
        explanationSection.classList.add('hidden');  // Hide explanation section
    }

    // Show next button
    nextButton.classList.remove('hidden');
}

// Handle Next Question
nextButton.addEventListener('click', () => {
    if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResults();
    }
});

// Show Results
function showResults() {
    clearInterval(timer);  // Stop the timer
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const percentage = Math.round((score / totalQuestions) * 100);
    document.getElementById('final-score').textContent = `You scored ${score} out of ${totalQuestions}`;
    document.getElementById('percentage').textContent = `(${percentage}%)`;

    const feedback = document.getElementById('feedback');
    if (percentage >= 80) {
        feedback.className = 'mb-6 p-4 rounded-lg bg-green-100 text-green-800';
        feedback.textContent = 'Excellent! You demonstrated a solid understanding of the subject.';
    } else if (percentage >= 60) {
        feedback.className = 'mb-6 p-4 rounded-lg bg-yellow-100 text-yellow-800';
        feedback.textContent = 'Good effort! Consider reviewing the topics you missed to strengthen your knowledge.';
    } else {
        feedback.className = 'mb-6 p-4 rounded-lg bg-red-100 text-red-800';
        feedback.textContent = 'You may want to review the material and try again to improve your score.';
    }

    // Show explanations for each question at the end
    const explanationList = document.createElement('div');
    explanationList.className = 'mt-4';
    quizData.exam.questions.forEach((question, index) => {
        const explanationItem = document.createElement('div');
        explanationItem.textContent = `Q${index + 1}: ${question.explanation}`;
        explanationItem.className = 'mb-2 p-2 border rounded bg-gray-100';
        explanationList.appendChild(explanationItem);
    });

    resultsContainer.appendChild(explanationList);  // Add explanations to the results section
}

// Restart Quiz
restartButton.addEventListener('click', () => {
    resultsContainer.classList.add('hidden');
    startContainer.classList.remove('hidden');  // Show the start container again
});

// Reset Quiz
resetButton.addEventListener('click', () => {
    initializeQuiz();  // Restart the quiz without showing results
});

// Load quiz data on page load
window.onload = loadQuizData;
