class QuizBattleGame {
    constructor() {
        this.currentScreen = 'welcome';
        this.gameState = 'idle'; // idle, playing, answering, transitioning
        this.gameData = {
            playerName: '',
            category: 'mixed',
            difficulty: 'medium',
            currentQuestion: 0,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            totalQuestions: 10,
            timeLimit: 20,
            questionStartTime: 0,
            totalResponseTime: 0,
            answers: []
        };
        this.timer = null;
        this.timeLeft = 0;
        this.answerSelected = false; // Prevent multiple selections
        
        this.initializeQuestions();
        this.initializeEventListeners();
        this.loadLeaderboard();
    }

    initializeQuestions() {
        this.questions = {
            html: [
                {
                    question: "Which HTML tag is used to create a hyperlink?",
                    options: ["<link>", "<a>", "<href>", "<url>"],
                    correct: 1
                },
                {
                    question: "What does HTML stand for?",
                    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
                    correct: 0
                },
                {
                    question: "Which attribute specifies the URL of the page the link goes to?",
                    options: ["src", "href", "link", "url"],
                    correct: 1
                },
                {
                    question: "What is the correct HTML element for the largest heading?",
                    options: ["<h6>", "<h1>", "<heading>", "<head>"],
                    correct: 1
                },
                {
                    question: "Which HTML attribute specifies an alternate text for an image?",
                    options: ["title", "src", "alt", "longdesc"],
                    correct: 2
                }
            ],
            css: [
                {
                    question: "Which property is used to change the background color?",
                    options: ["color", "background-color", "bgcolor", "background"],
                    correct: 1
                },
                {
                    question: "What does CSS stand for?",
                    options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
                    correct: 1
                },
                {
                    question: "Which CSS property controls the text size?",
                    options: ["font-style", "text-size", "font-size", "text-style"],
                    correct: 2
                },
                {
                    question: "How do you make each word in a text start with a capital letter?",
                    options: ["text-transform: capitalize", "text-style: capitalize", "transform: capitalize", "text-capitalize: true"],
                    correct: 0
                },
                {
                    question: "Which property is used to change the font of an element?",
                    options: ["font-family", "font-style", "font-weight", "font-size"],
                    correct: 0
                }
            ],
            javascript: [
                {
                    question: "Which operator is used to assign a value to a variable?",
                    options: ["*", "=", "x", "-"],
                    correct: 1
                },
                {
                    question: "How do you create a function in JavaScript?",
                    options: ["function = myFunction() {}", "function myFunction() {}", "create myFunction() {}", "def myFunction():"],
                    correct: 1
                },
                {
                    question: "How do you write 'Hello World' in an alert box?",
                    options: ["msg('Hello World');", "alert('Hello World');", "msgBox('Hello World');", "alertBox('Hello World');"],
                    correct: 1
                },
                {
                    question: "Which event occurs when the user clicks on an HTML element?",
                    options: ["onchange", "onclick", "onmouseclick", "onmouseover"],
                    correct: 1
                },
                {
                    question: "How do you declare a JavaScript variable?",
                    options: ["variable carName;", "v carName;", "var carName;", "declare carName;"],
                    correct: 2
                }
            ],
            general: [
                {
                    question: "What does API stand for?",
                    options: ["Application Programming Interface", "Automated Programming Interface", "Advanced Programming Interface", "Application Process Interface"],
                    correct: 0
                },
                {
                    question: "Which of the following is a version control system?",
                    options: ["Git", "HTTP", "FTP", "SSH"],
                    correct: 0
                },
                {
                    question: "What does SQL stand for?",
                    options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
                    correct: 0
                },
                {
                    question: "Which protocol is used for secure communication over the internet?",
                    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
                    correct: 2
                },
                {
                    question: "What is the purpose of a database index?",
                    options: ["To store data", "To speed up queries", "To backup data", "To compress data"],
                    correct: 1
                }
            ]
        };
    }

    initializeEventListeners() {
        // Welcome screen events
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });

        // Results screen events
        document.getElementById('play-again-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('home-btn').addEventListener('click', () => this.showWelcomeScreen());

        // Leaderboard screen events
        document.getElementById('back-home-btn').addEventListener('click', () => this.showWelcomeScreen());

        // Add ripple effect to buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.createRipple);
        });
    }

    createRipple(e) {
        const button = e.currentTarget;
        const ripple = button.querySelector('.btn-ripple');
        
        if (ripple) {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            ripple.classList.add('active');
            setTimeout(() => ripple.classList.remove('active'), 600);
        }
    }

    // Clear all timers and reset state
    clearTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    startGame() {
        const playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            this.showNotification('Please enter your name!', 'error');
            return;
        }

        this.gameData.playerName = playerName;
        this.gameData.category = document.getElementById('category-select').value;
        this.gameData.difficulty = document.getElementById('difficulty-select').value;
        
        // Set time limit based on difficulty
        const timeLimits = { easy: 30, medium: 20, hard: 15 };
        this.gameData.timeLimit = timeLimits[this.gameData.difficulty];

        this.resetGameData();
        this.prepareQuestions();
        this.gameState = 'playing';
        this.showGameScreen();
        
        // Add small delay to ensure screen transition is complete
        setTimeout(() => {
            this.loadQuestion();
        }, 300);
    }

    resetGameData() {
        this.clearTimers();
        this.gameData.currentQuestion = 0;
        this.gameData.score = 0;
        this.gameData.correctAnswers = 0;
        this.gameData.wrongAnswers = 0;
        this.gameData.totalResponseTime = 0;
        this.gameData.answers = [];
        this.gameState = 'idle';
        this.answerSelected = false;
    }

    prepareQuestions() {
        let questionPool = [];
        
        if (this.gameData.category === 'mixed') {
            // Mix questions from all categories
            Object.values(this.questions).forEach(categoryQuestions => {
                questionPool = questionPool.concat(categoryQuestions);
            });
        } else {
            questionPool = [...this.questions[this.gameData.category]];
        }

        // Ensure we have enough questions
        while (questionPool.length < this.gameData.totalQuestions) {
            questionPool = questionPool.concat(questionPool);
        }

        // Shuffle and select questions
        this.gameQuestions = this.shuffleArray(questionPool).slice(0, this.gameData.totalQuestions);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    loadQuestion() {
        // Clear any existing timers first
        this.clearTimers();
        
        // Reset answer selection state
        this.answerSelected = false;
        this.gameState = 'playing';
        
        const question = this.gameQuestions[this.gameData.currentQuestion];
        this.gameData.questionStartTime = Date.now();

        // Update UI
        document.getElementById('question-text').textContent = question.question;
        document.querySelector('.player-name-display').textContent = this.gameData.playerName;
        document.querySelector('.category-display').textContent = this.gameData.category.toUpperCase();
        document.getElementById('current-question').textContent = this.gameData.currentQuestion + 1;
        document.getElementById('total-questions').textContent = this.gameData.totalQuestions;
        document.getElementById('current-score').textContent = this.gameData.score;

        // Create options with proper event handling
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            // Use single event listener with debouncing
            optionElement.addEventListener('click', (e) => this.handleOptionClick(e, index));
            
            optionsContainer.appendChild(optionElement);
        });

        // Update progress
        const progress = ((this.gameData.currentQuestion + 1) / this.gameData.totalQuestions) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;

        // Start timer after a small delay to ensure everything is loaded
        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.startTimer();
            }
        }, 100);
    }

    handleOptionClick(e, selectedIndex) {
        // Prevent multiple selections
        if (this.answerSelected || this.gameState !== 'playing') {
            return;
        }
        
        this.selectAnswer(selectedIndex);
    }

    startTimer() {
        this.timeLeft = this.gameData.timeLimit;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            // Double-check game state
            if (this.gameState !== 'playing' || this.answerSelected) {
                this.clearTimers();
                return;
            }

            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

updateTimerDisplay() {
        const timerText = document.querySelector('.timer-text');
        const timerFill = document.querySelector('.timer-fill');
        
        if (!timerText || !timerFill) return;
        
        timerText.textContent = Math.max(0, this.timeLeft);
        
        const percentage = Math.max(0, (this.timeLeft / this.gameData.timeLimit) * 100);
        const degrees = percentage * 3.6;
        
        // Change color as time runs out
        const color = this.timeLeft <= 5 ? '#dc3545' : '#ff6b6b';
        timerFill.style.background = `conic-gradient(from 0deg, ${color} ${degrees}deg, transparent ${degrees}deg)`;
    }

    selectAnswer(selectedIndex) {
        // Prevent multiple selections
        if (this.answerSelected || this.gameState !== 'playing') {
            return;
        }

        this.answerSelected = true;
        this.gameState = 'answering';
        this.clearTimers();

        const question = this.gameQuestions[this.gameData.currentQuestion];
        const options = document.querySelectorAll('.option');
        const isCorrect = selectedIndex === question.correct;
        const responseTime = Date.now() - this.gameData.questionStartTime;

        // Disable all options
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        // Record answer
        this.gameData.answers.push({
            questionIndex: this.gameData.currentQuestion,
            selectedIndex,
            correct: isCorrect,
            responseTime
        });

        this.gameData.totalResponseTime += responseTime;

        // Update UI with immediate feedback
        options[selectedIndex].classList.add('selected');
        
        setTimeout(() => {
            options[question.correct].classList.add('correct');
            if (!isCorrect) {
                options[selectedIndex].classList.add('wrong');
            }

            // Update score and stats
            if (isCorrect) {
                this.gameData.correctAnswers++;
                const timeBonus = Math.max(0, this.timeLeft * 10);
                const baseScore = 100;
                this.gameData.score += baseScore + timeBonus;
                document.getElementById('current-score').textContent = this.gameData.score;
            } else {
                this.gameData.wrongAnswers++;
            }
        }, 300);

        // Move to next question or end game
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    timeUp() {
        // Prevent multiple time up calls
        if (this.answerSelected || this.gameState !== 'playing') {
            return;
        }

        this.answerSelected = true;
        this.gameState = 'answering';
        this.clearTimers();

        const question = this.gameQuestions[this.gameData.currentQuestion];
        const options = document.querySelectorAll('.option');

        // Disable all options
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        // Record missed answer
        this.gameData.answers.push({
            questionIndex: this.gameData.currentQuestion,
            selectedIndex: -1,
            correct: false,
            responseTime: this.gameData.timeLimit * 1000
        });

        this.gameData.wrongAnswers++;
        this.gameData.totalResponseTime += this.gameData.timeLimit * 1000;

        // Show correct answer
        setTimeout(() => {
            options[question.correct].classList.add('correct');
        }, 300);

        // Move to next question or end game
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    nextQuestion() {
        this.gameState = 'transitioning';
        this.gameData.currentQuestion++;
        
        if (this.gameData.currentQuestion < this.gameData.totalQuestions) {
            // Small delay before loading next question
            setTimeout(() => {
                if (this.gameState === 'transitioning') {
                    this.loadQuestion();
                }
            }, 100);
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.clearTimers();
        this.gameState = 'ended';
        this.calculateFinalScore();
        this.saveScore();
        this.showResultsScreen();
    }

    calculateFinalScore() {
        const percentage = Math.round((this.gameData.correctAnswers / this.gameData.totalQuestions) * 100);
        const avgTime = Math.round(this.gameData.totalResponseTime / this.gameData.totalQuestions / 1000);

        // Update results display
        document.querySelector('.final-score').textContent = this.gameData.score;
        document.querySelector('.score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-answers').textContent = this.gameData.correctAnswers;
        document.getElementById('wrong-answers').textContent = this.gameData.wrongAnswers;
        document.getElementById('avg-time').textContent = `${avgTime}s`;

        // Show achievements
        this.showAchievements(percentage, avgTime);
    }

    showAchievements(percentage, avgTime) {
        const achievementSection = document.getElementById('achievement-section');
        achievementSection.innerHTML = '';

        const achievements = [];

        if (percentage === 100) achievements.push('🏆 Perfect Score!');
        else if (percentage >= 90) achievements.push('🥇 Almost Perfect!');
        else if (percentage >= 80) achievements.push('🥈 Great Job!');
        else if (percentage >= 70) achievements.push('🥉 Good Effort!');

        if (avgTime <= 5) achievements.push('⚡ Lightning Fast!');
        else if (avgTime <= 10) achievements.push('🚀 Speed Demon!');

        if (this.gameData.difficulty === 'hard' && percentage >= 70) {
            achievements.push('💪 Hard Mode Master!');
        }

        if (achievements.length > 0) {
            achievements.forEach((achievement, index) => {
                setTimeout(() => {
                    const achievementElement = document.createElement('div');
                    achievementElement.className = 'achievement';
                    achievementElement.textContent = achievement;
                    achievementSection.appendChild(achievementElement);
                }, index * 300);
            });
        }
    }

    saveScore() {
        const leaderboard = this.getLeaderboard();
        const newEntry = {
            name: this.gameData.playerName,
            score: this.gameData.score,
            percentage: Math.round((this.gameData.correctAnswers / this.gameData.totalQuestions) * 100),
            category: this.gameData.category,
            difficulty: this.gameData.difficulty,
            date: new Date().toISOString()
        };

        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(10); // Keep only top 10

        localStorage.setItem('quizBattleLeaderboard', JSON.stringify(leaderboard));
    }

    getLeaderboard() {
        try {
            const saved = localStorage.getItem('quizBattleLeaderboard');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }

    loadLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<div class="empty-leaderboard">No scores yet. Be the first to play!</div>';
            return;
        }

        leaderboardList.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.style.animationDelay = `${index * 0.1}s`;
            
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.name}</div>
                    <div class="leaderboard-details">${entry.category} • ${entry.difficulty} • ${entry.percentage}%</div>
                </div>
                <span class="leaderboard-score">${entry.score}</span>
            `;
            
            leaderboardList.appendChild(item);
        });
    }

    resetGame() {
        this.clearTimers();
        this.gameState = 'idle';
        this.showWelcomeScreen();
        // Keep player name and preferences
        document.getElementById('player-name').value = this.gameData.playerName;
    }

    // Screen management
    showScreen(screenId) {
        // Clear timers when changing screens
        if (screenId !== 'game-screen') {
            this.clearTimers();
        }

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(screenId).classList.add('active');
        }, 100);
        
        this.currentScreen = screenId;
    }

    showWelcomeScreen() {
        this.gameState = 'idle';
        this.showScreen('welcome-screen');
    }

    showGameScreen() {
        this.showScreen('game-screen');
    }

    showResultsScreen() {
        this.showScreen('results-screen');
    }

    showLeaderboard() {
        this.loadLeaderboard();
        this.showScreen('leaderboard-screen');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            border-radius: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-family: 'Poppins', sans-serif;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizBattleGame();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .leaderboard-details {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 2px;
    }
    
    .leaderboard-info {
        flex: 1;
        text-align: left;
        margin: 0 15px;
    }
    
    .option {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
`;
document.head.appendChild(style);
