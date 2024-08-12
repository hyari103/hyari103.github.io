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

// Customize the questions (this part can be expanded further)
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

// Display the first question (more logic to handle next questions will be added)
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

// Start the quiz and display the first question
function startQuiz() {
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('quiz-page').style.display = 'flex';
    currentQuestionIndex = 0;
    score = 0;
    timeRemaining = 600; // 10 minutes

    fetchQuestions().then(fetchedQuestions => {
        questions = customizeQuestions(fetchedQuestions);
        showQuestion(questions[currentQuestionIndex]);
    });
}

// Event listener to start the quiz (additional logic to handle the next button will be added later)
document.getElementById('start-button').addEventListener('click', startQuiz);
