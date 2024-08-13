let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeRemaining = 600; // 10 minutes

// Fetch questions from the API
async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=20&category=9&difficulty=easy');
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
        if (index % 3 === 0) {
            return {
                ...question,
                type: 'dropdown'
            };
        } else if (index % 3 === 1) {
            return {
                ...question,
                type: 'fill-in-the-blank',
                question: question.question.replace(question.answer, '_____')
            };
        } else {
            return question;
        }
    });
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
        showQuestion(questions[currentQuestionIndex]);
    });
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

// Handle the end of the quiz, displaying the score and results
function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-page').style.display = 'none';
    document.getElementById('finish-page').style.display = 'flex';
    document.getElementById('score').textContent = score;
    document.getElementById('total-questions').textContent = questions.length;

    if (score / questions.length >= 0.5) {
        document.getElementById('result-title').textContent = 'Congratulations!';
        document.getElementById('result-message').textContent = 'Great job! You scored ' + score + ' out of ' + questions.length;
    } else {
        document.getElementById('result-title').textContent = 'Better Luck Next Time!';
        document.getElementById('result-message').textContent = 'You scored ' + score + ' out of ' + questions.length;
    }
}

// Event listener to handle the Next button click
document.getElementById('next-button').addEventListener('click', () => {
    checkAnswer(questions[currentQuestionIndex]);
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('question-title').textContent = `Question ${currentQuestionIndex + 1}`;
        showQuestion(questions[currentQuestionIndex]);
    } else if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('next-button').textContent = 'Finish Quiz';
        document.getElementById('question-title').textContent = `Question ${currentQuestionIndex + 1}`;
        showQuestion(questions[currentQuestionIndex]);
    } else {
        finishQuiz();
    }
});

// Event listener to handle the Start Quiz button click
document.getElementById('start-button').addEventListener('click', startQuiz);

// Event listener to handle the Restart Quiz button click
document.getElementById('restart-button').addEventListener('click', () => {
    document.getElementById('finish-page').style.display = 'none';
    document.getElementById('homepage').style.display = 'flex';
});
