class QuestionManager {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.hints = 3;
        this.questions = []; // Stores the 5 selected active questions
        this.currentQuestionIndex = 0;
        
        // Theme map (extracted from the old emiLevels object)
        this.themes = {
            1: "The Classroom",
            2: "The Laboratory",
            3: "The Power Plant",
            4: "The High Voltage Vault",
            5: "The Quantum Core"
        };
    }

    // Async method to load data from JSON files
    async loadLevelData(levelNumber) {
        this.currentLevel = levelNumber;
        this.currentQuestionIndex = 0;
        
        // Grant an extra hint per level if level > 1
        if(levelNumber > 1) this.hints++;

        try {
            // Fetch the JSON file for the specific level
            const response = await fetch(`data/level${levelNumber}.json?t=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const allQuestions = await response.json();
            
            // 1. Shuffle the full pool using Fisher-Yates algorithm
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }
            
            // 2. Select only the first 5 unique questions for this session
            this.questions = allQuestions.slice(0, 5);
            
            console.log(`Level ${levelNumber} loaded. Selected 5 questions out of ${allQuestions.length}.`);
            return true;
        } catch (e) {
            console.error("Failed to load questions:", e);
            alert("Error loading level data. Ensure you are running on a local server (VS Code Live Server).");
            this.questions = []; 
            return false;
        }
    }

    getTheme() {
        return this.themes[this.currentLevel] || "Unknown Sector";
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    checkAnswer(answerIndex) {
        if (!this.questions[this.currentQuestionIndex]) return false;

        const correct = this.questions[this.currentQuestionIndex].correctIndex === answerIndex;
        
        if (correct) {
            this.score += 100 * this.currentLevel;
            this.currentQuestionIndex++;
        } else {
            // Penalty for wrong guess
            this.score = Math.max(0, this.score - 20); 
        }
        return correct;
    }
    
    getHint() {
        if (this.hints > 0) {
            this.hints--;
            // Penalty for using hint
            this.score = Math.max(0, this.score - 50); 
            return this.questions[this.currentQuestionIndex].hint;
        }
        return "No hints remaining!";
    }
    
    hasMoreQuestions() {
        return this.currentQuestionIndex < this.questions.length;
    }
    
    reset() {
        this.score = 0;
        this.hints = 3;
        this.currentQuestionIndex = 0;
        this.currentLevel = 1;
        this.questions = [];
    }
}
