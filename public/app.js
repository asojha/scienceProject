// Configuration
const API_URL = '/api';

// State
const state = {
    sessionId: 'session-' + Math.random().toString(36).substring(2, 15),
    currentQuestion: null,
    currentCategory: null,
    categories: [],
};

// DOM Elements
const elements = {
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    accuracy: document.getElementById('accuracy'),
    categorySection: document.getElementById('categorySection'),
    categoriesContainer: document.getElementById('categories'),
    quizSection: document.getElementById('quizSection'),
    backBtn: document.getElementById('backBtn'),
    currentCategory: document.getElementById('currentCategory'),
    currentDifficulty: document.getElementById('currentDifficulty'),
    questionEmoji: document.getElementById('questionEmoji'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    resultSection: document.getElementById('resultSection'),
    resultIcon: document.getElementById('resultIcon'),
    resultMessage: document.getElementById('resultMessage'),
    funFact: document.getElementById('funFact'),
    correctAnswer: document.getElementById('correctAnswer'),
    nextBtn: document.getElementById('nextBtn'),
    resetBtn: document.getElementById('resetBtn'),
};

// Initialize
async function init() {
    await loadCategories();
    await updateScore();
    setupEventListeners();
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return response.json();
}

async function loadCategories() {
    try {
        const result = await apiRequest('/categories');
        if (result.success) {
            state.categories = result.data;
            renderCategories();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadQuestion() {
    try {
        const categoryParam = state.currentCategory ? `&category=${state.currentCategory}` : '';
        const result = await apiRequest(`/question?sessionId=${state.sessionId}${categoryParam}`);

        if (result.success) {
            state.currentQuestion = result.data;
            renderQuestion();
        }
    } catch (error) {
        console.error('Failed to load question:', error);
    }
}

async function submitAnswer(answerIndex) {
    if (!state.currentQuestion) return;

    try {
        const result = await apiRequest(
            `/answer?sessionId=${state.sessionId}&questionId=${state.currentQuestion.id}&answerIndex=${answerIndex}`,
            { method: 'POST' }
        );

        if (result.success) {
            showResult(result.data, answerIndex);
            updateScoreDisplay(result.data);
        }
    } catch (error) {
        console.error('Failed to submit answer:', error);
    }
}

async function updateScore() {
    try {
        const result = await apiRequest(`/score?sessionId=${state.sessionId}`);
        if (result.success) {
            updateScoreDisplay(result.data);
        }
    } catch (error) {
        console.error('Failed to fetch score:', error);
    }
}

async function resetQuiz() {
    try {
        await apiRequest(`/reset?sessionId=${state.sessionId}`, { method: 'POST' });
        updateScoreDisplay({ score: 0, streak: 0, accuracy: 0 });
        showCategories();
    } catch (error) {
        console.error('Failed to reset:', error);
    }
}

// Render Functions
function renderCategories() {
    elements.categoriesContainer.innerHTML = '';

    state.categories.forEach(category => {
        const card = document.createElement('button');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="category-emoji">${category.emoji}</span>
            <span class="category-name">${category.name}</span>
            <span class="category-desc">${category.description}</span>
        `;
        card.addEventListener('click', () => selectCategory(category.id));
        elements.categoriesContainer.appendChild(card);
    });

    // Add "All Topics" card
    const allCard = document.createElement('button');
    allCard.className = 'category-card';
    allCard.innerHTML = `
        <span class="category-emoji">🌈</span>
        <span class="category-name">All Topics</span>
        <span class="category-desc">Mix it up!</span>
    `;
    allCard.addEventListener('click', () => selectCategory(null));
    elements.categoriesContainer.appendChild(allCard);
}

function renderQuestion() {
    const q = state.currentQuestion;
    if (!q) return;

    // Update header
    const category = state.categories.find(c => c.id === q.category);
    elements.currentCategory.textContent = category ? `${category.emoji} ${category.name}` : q.category;

    const difficultyClass = q.difficulty === 'hard' ? 'hard' : q.difficulty === 'medium' ? 'medium' : '';
    elements.currentDifficulty.className = `difficulty-badge ${difficultyClass}`;
    elements.currentDifficulty.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);

    // Update question
    elements.questionEmoji.textContent = q.imageHint || '🔬';
    elements.questionText.textContent = q.question;

    // Render options
    elements.optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
        `;
        btn.addEventListener('click', () => submitAnswer(index));
        elements.optionsContainer.appendChild(btn);
    });

    // Hide result section
    elements.resultSection.style.display = 'none';
    elements.nextBtn.style.display = 'none';
}

function showResult(result, selectedIndex) {
    // Disable all options
    const options = elements.optionsContainer.querySelectorAll('.option-btn');
    options.forEach((btn, index) => {
        btn.disabled = true;
        if (index === selectedIndex) {
            btn.classList.add(result.correct ? 'correct' : 'incorrect');
        }
        // Show correct answer
        if (!result.correct && result.correctAnswer === state.currentQuestion.options[index]) {
            btn.classList.add('reveal-correct');
        }
    });

    // Show result section
    elements.resultSection.style.display = 'block';
    elements.resultSection.className = `result-section ${result.correct ? 'correct' : 'incorrect'}`;

    elements.resultIcon.textContent = result.correct ? '🎉' : '🤔';
    elements.resultMessage.textContent = result.message;
    elements.funFact.textContent = result.funFact;

    if (!result.correct) {
        elements.correctAnswer.textContent = `The correct answer was: ${result.correctAnswer}`;
        elements.correctAnswer.style.display = 'block';
    } else {
        elements.correctAnswer.style.display = 'none';
        createConfetti();
    }

    elements.nextBtn.style.display = 'inline-block';
}

function updateScoreDisplay(data) {
    elements.score.textContent = data.score || 0;
    elements.streak.textContent = data.streak || 0;
    elements.accuracy.textContent = `${data.accuracy || 0}%`;

    // Add animation
    if (data.streak >= 3) {
        elements.streak.parentElement.classList.add('on-fire');
    } else {
        elements.streak.parentElement.classList.remove('on-fire');
    }
}

function selectCategory(categoryId) {
    state.currentCategory = categoryId;
    elements.categorySection.style.display = 'none';
    elements.quizSection.style.display = 'block';
    loadQuestion();
}

function showCategories() {
    state.currentCategory = null;
    state.currentQuestion = null;
    elements.categorySection.style.display = 'block';
    elements.quizSection.style.display = 'none';
}

// Event Listeners
function setupEventListeners() {
    elements.backBtn.addEventListener('click', showCategories);
    elements.nextBtn.addEventListener('click', loadQuestion);
    elements.resetBtn.addEventListener('click', resetQuiz);
}

// Confetti Effect
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00b894', '#fd79a8'];
    const shapes = ['circle', 'square'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)] === 'circle' ? '50%' : '0';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 2000);
}

// Start the app
init();
