let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeRemaining = 600; // 10 minutes

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

// Start the quiz by displaying the first question and initializing the timer
function startQuiz() {
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('quiz-page').style.display = 'flex';
    currentQuestionIndex = 0;
    score = 0;
    timeRemaining = 600; // 10 minutes
    startTimer();

    fetchQuestions().then(fetchedQuestions => {
        questions = customizeQuestions(fetchedQuestions);
        initializeProgressBar(questions.length); // Initialize the progress bar
        showQuestion(questions[currentQuestionIndex]);
    });

    document.addEventListener('keypress', handleEnterKey); // Add keypress listener
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
}

// Start the timer for the quiz
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
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
    } else {
        document.getElementById('next-button').style.display = 'none'; // Hide Next button
        document.getElementById('finish-button').style.display = 'inline-block'; // Show Finish button
    }
});

// Event listener to handle the Finish button click
document.getElementById('finish-button').addEventListener('click', () => {
    finishQuiz();
});

// Event listener to handle the Start Quiz button click
document.getElementById('start-button').addEventListener('click', startQuiz);

// Event listener to handle the Restart Quiz button click
document.getElementById('restart-button').addEventListener('click', () => {
    document.getElementById('finish-page').style.display = 'none';
    document.getElementById('homepage').style.display = 'flex';

    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('next-button').textContent = 'Next';
    document.getElementById('next-button').style.display = 'inline-block'; // Show Next button
    document.getElementById('finish-button').style.display = 'none'; // Hide Finish button

    document.getElementById('question-title').textContent = `Question 1`;

    document.addEventListener('keypress', handleEnterKey);
});
