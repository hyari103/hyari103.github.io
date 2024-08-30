let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeRemaining = 600; // 10 minutes
let userName = ""; // New variable to store the user's name

// Fetch questions from the API
async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy');
    const data = await response.json();
    
    return data.results.map(question => ({
        type: 'multiple-choice',
        question: decodeHTMLEntities(question.question),
        options: [...question.incorrect_answers.map(decodeHTMLEntities), decodeHTMLEntities(question.correct_answer)],
        answer: decodeHTMLEntities(question.correct_answer)
    }));
}

// Decode HTML entities in the fetched questions
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Customize the questions to introduce variety (dropdown and fill-in-the-blank)
function customizeQuestions(questions) {
    return questions.map((question, index) => {
        const isTrueFalse = question.options.length === 2 && 
                            question.options.includes("True") && 
                            question.options.includes("False");

        if (isTrueFalse) {
            return {
                ...question,
                type: 'fill-in-the-blank',
                question: question.question.replace(question.answer, '_____')
            };
        } else if (index % 2 === 0) {
            return {
                ...question,
                type: 'dropdown'
            };
        } else {
            return {
                ...question,
                type: 'multiple-choice'
            };
        }
    });
}

// Initialize the progress bar
function initializeProgressBar(totalQuestions) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
        const dot = document.createElement('div');
        dot.classList.add('progress-dot');
        if (i === 0) dot.classList.add('active');
        progressBar.appendChild(dot);
    }
}

// Update the progress bar as you move through questions
function updateProgressBar() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'answered');
        if (index < currentQuestionIndex) {
            dot.classList.add('answered');
        } else if (index === currentQuestionIndex) {
            dot.classList.add('active');
        }
    });
}

// Validate the current answer before moving to the next question
function validateAnswer(question) {
    if (question.type === 'multiple-choice' || question.type === 'dropdown') {
        const selectedOption = document.querySelector('input[name="answer"]:checked') || document.getElementById('answer');
        return selectedOption && selectedOption.value !== '';
    } else if (question.type === 'fill-in-the-blank') {
        const inputElement = document.getElementById('answer');
        return inputElement && inputElement.value.trim() !== '';
    }
    return false;
}

// Save the quiz state to local storage
function saveQuizState() {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    localStorage.setItem('score', score);
    localStorage.setItem('timeRemaining', timeRemaining);
    localStorage.setItem('questions', JSON.stringify(questions)); // Save the questions themselves
}

// Load the quiz state from local storage
function loadQuizState() {
    const savedQuestionIndex = localStorage.getItem('currentQuestionIndex');
    const savedScore = localStorage.getItem('score');
    const savedTimeRemaining = localStorage.getItem('timeRemaining');
    const savedQuestions = localStorage.getItem('questions');

    if (savedQuestionIndex !== null && savedScore !== null && savedTimeRemaining !== null && savedQuestions !== null) {
        currentQuestionIndex = parseInt(savedQuestionIndex);
        score = parseInt(savedScore);
        timeRemaining = parseInt(savedTimeRemaining);
        questions = JSON.parse(savedQuestions);
        return true; // Return true if a saved state is loaded
    }
    return false; // Return false if no saved state exists
}

// Clear the quiz state from local storage
function clearQuizState() {
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('score');
    localStorage.removeItem('timeRemaining');
    localStorage.removeItem('questions');
}

// Save attempt to local storage
function saveAttempt(score, totalQuestions) {
    let attempts = JSON.parse(localStorage.getItem('attempts')) || [];
    const attempt = {
        userName: userName, // Include the user's name
        score: score,
        totalQuestions: totalQuestions,
        date: new Date().toLocaleString()
    };
    attempts.push(attempt);
    localStorage.setItem('attempts', JSON.stringify(attempts));
}

// Load attempts from local storage and display them in the scoreboard
function loadAttempts() {
    const attempts = JSON.parse(localStorage.getItem('attempts')) || [];
    const scoreboardList = document.getElementById('scoreboard-list');
    scoreboardList.innerHTML = ''; // Clear previous entries

    attempts.forEach(attempt => {
        const listItem = document.createElement('li');
        listItem.textContent = `${attempt.userName} - ${attempt.date}: ${attempt.score}/${attempt.totalQuestions}`;
        scoreboardList.appendChild(listItem);
    });
}

// Start the quiz by displaying the first question and initializing the timer
function startQuiz() {
    const stateLoaded = loadQuizState();

    // Immediately hide the homepage and show the quiz page
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('quiz-page').style.display = 'flex';

    if (stateLoaded) {
        startTimer();
        initializeProgressBar(questions.length);
        showQuestion(questions[currentQuestionIndex]);
    } else {
        // Show the quiz page after loading questions for the first time
        fetchQuestions().then(fetchedQuestions => {
            questions = customizeQuestions(fetchedQuestions);
            initializeProgressBar(questions.length);
            showQuestion(questions[currentQuestionIndex]);
            startTimer();
            saveQuizState(); // Save the state immediately after loading the questions
        });
    }

    document.addEventListener('keypress', handleEnterKey);
}

// Display the current question on the page
function showQuestion(question) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';

    const questionElement = document.createElement('p');
    questionElement.innerHTML = question.question;
    questionContainer.appendChild(questionElement);

    if (question.type === 'multiple-choice') {
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.innerHTML = `<input type="radio" id="${option}" name="answer" value="${option}">
                                       <label for="${option}">${option}</label>`;
            questionContainer.appendChild(optionElement);
        });
    } else if (question.type === 'dropdown') {
        const selectElement = document.createElement('select');
        selectElement.id = 'answer';
        
        const placeholderOption = document.createElement('option');
        placeholderOption.value = "";
        placeholderOption.textContent = "Select an answer";
        placeholderOption.selected = true;
        placeholderOption.disabled = true;
        selectElement.appendChild(placeholderOption);
        
        question.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
        questionContainer.appendChild(selectElement);
    } else if (question.type === 'fill-in-the-blank') {
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.id = 'answer';
        questionContainer.appendChild(inputElement);
    }

    // Update the question title to show the correct question number
    document.getElementById('question-title').textContent = `Question ${currentQuestionIndex + 1}`;

    // Update the button visibility
    updateButtonsVisibility();

    updateProgressBar(); // Update progress bar when showing a new question
}

// Check the user's answer and update the score
function checkAnswer(question) {
    let selectedOption;
    if (question.type === 'multiple-choice' || question.type === 'dropdown') {
        selectedOption = document.querySelector('input[name="answer"]:checked') || document.getElementById('answer');
        if (selectedOption && selectedOption.value === question.answer) {
            score++;
        }
    } else if (question.type === 'fill-in-the-blank') {
        selectedOption = document.getElementById('answer').value;
        if (selectedOption && selectedOption.toLowerCase() === question.answer.toLowerCase()) {
            score++;
        }
    }
    saveQuizState(); // Save the state after each answer
}

// Start the timer for the quiz
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        saveQuizState(); // Save the timer state every second
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
    }, 1000);
}

// Function to handle the end of the quiz
function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-page').style.display = 'none';
    document.getElementById('finish-page').style.display = 'flex';
    document.getElementById('score').textContent = score;
    document.getElementById('total-questions').textContent = questions.length;

    // Save the attempt
    saveAttempt(score, questions.length);

    // Update the scoreboard
    loadAttempts();

    clearQuizState(); // Clear the state when the quiz finishes

    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultImage = document.createElement('img'); 

    if (score / questions.length >= 0.5) {
        resultTitle.textContent = 'Congratulations!';
        resultMessage.textContent = 'Great job! You scored ' + score + ' out of ' + questions.length;
        resultImage.src = 'images/congratulation.png'; 
    } else {
        resultTitle.textContent = 'Better Luck Next Time!';
        resultMessage.textContent = 'You scored ' + score + ' out of ' + questions.length;
        resultImage.src = 'images/achieve.png'; 
    }

    document.getElementById('finish-page').appendChild(resultImage);

    document.removeEventListener('keypress', handleEnterKey);
}

// Function to handle the Enter key press
function handleEnterKey(event) {
    if (event.key === "Enter") {
        if (currentQuestionIndex < questions.length - 1) {
            document.getElementById('next-button').click(); // Simulate Next button click
        } else {
            document.getElementById('finish-button').click(); // Simulate Finish button click
        }
    }
}

// Update the visibility of the Next and Finish buttons
function updateButtonsVisibility() {
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('next-button').style.display = 'none';
        document.getElementById('finish-button').style.display = 'inline-block';
    } else {
        document.getElementById('next-button').style.display = 'inline-block';
        document.getElementById('finish-button').style.display = 'none';
    }
}

// Add the brain image to the homepage
const brainImage = document.createElement('img');
brainImage.src = 'images/quiz.png';
document.getElementById('homepage').prepend(brainImage);

// Event listener to handle the Next button click
document.getElementById('next-button').addEventListener('click', () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!validateAnswer(currentQuestion)) {
        alert('Please select an answer before proceeding.');
        return;
    }

    checkAnswer(currentQuestion);
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('question-title').textContent = `Question ${currentQuestionIndex + 1}`;
        showQuestion(questions[currentQuestionIndex]);
    } else if (currentQuestionIndex === questions.length - 1) {
        // Display the last question
        document.getElementById('question-title').textContent = `Question ${currentQuestionIndex + 1}`;
        showQuestion(questions[currentQuestionIndex]);
    }
});

// Event listener to handle the Finish button click
document.getElementById('finish-button').addEventListener('click', () => {
    finishQuiz();
});

// Event listener to handle the Start Quiz button click
document.getElementById('start-button').addEventListener('click', () => {
    userName = document.getElementById('user-name').value.trim();
    if (userName === "") {
        alert("Please enter your name to start the quiz.");
        return;
    }
    startQuiz();
});

// Event listener to handle the View Dashboard button click
document.getElementById('view-dashboard-button').addEventListener('click', () => {
    loadAttempts(); // Load previous attempts
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('finish-page').style.display = 'flex';
});

// Event listener to handle the Restart Quiz button click
document.getElementById('restart-button').addEventListener('click', () => {
    clearQuizState(); // Clear the state when restarting
    document.getElementById('finish-page').style.display = 'none';
    document.getElementById('homepage').style.display = 'flex';

    // Ensure "View Dashboard" button is visible
    document.getElementById('view-dashboard-button').style.display = 'inline-block';

    // Clear the question container to avoid showing the last question briefly
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';
    
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('next-button').textContent = 'Next';
    document.getElementById('next-button').style.display = 'inline-block'; // Show Next button
    document.getElementById('finish-button').style.display = 'none'; // Hide Finish button

    document.getElementById('question-title').textContent = `Question 1`;

    document.addEventListener('keypress', handleEnterKey);
});
