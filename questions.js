const physicsQuestions = {
    kinematics: [
        {
            question: "A car accelerates from rest at 3 m/s² for 5 seconds. What is its final velocity?",
            options: ["15 m/s", "8 m/s", "20 m/s", "12 m/s"],
            correct: 0,
            hint: "Use the formula v = u + at, where u = 0"
        },
        {
            question: "An object is dropped from a height of 45m. How long does it take to hit the ground? (g = 10 m/s²)",
            options: ["3 seconds", "4.5 seconds", "9 seconds", "6 seconds"],
            correct: 0,
            hint: "Use h = ½gt²"
        },
        {
            question: "A projectile is launched at 30 m/s at 45°. What is its maximum height?",
            options: ["22.5 m", "45 m", "30 m", "15 m"],
            correct: 0,
            hint: "Use H = (v²sin²θ)/(2g)"
        }
    ],
    dynamics: [
        {
            question: "A 5kg box is pushed with a force of 20N. What is its acceleration if friction is negligible?",
            options: ["4 m/s²", "2.5 m/s²", "5 m/s²", "1 m/s²"],
            correct: 0,
            hint: "F = ma"
        },
        {
            question: "What is the weight of a 60kg person on Earth? (g = 9.8 m/s²)",
            options: ["588 N", "600 N", "60 N", "980 N"],
            correct: 0,
            hint: "Weight = mass × gravity"
        },
        {
            question: "A car takes a turn at constant speed. Which force provides the centripetal acceleration?",
            options: ["Friction", "Gravity", "Normal force", "Air resistance"],
            correct: 0,
            hint: "Think about what prevents the car from sliding outwards"
        }
    ],
    energy: [
        {
            question: "A 2kg object is lifted 10m. How much potential energy does it gain? (g = 10 m/s²)",
            options: ["200 J", "100 J", "20 J", "400 J"],
            correct: 0,
            hint: "PE = mgh"
        },
        {
            question: "A 1000kg car moves at 20 m/s. What is its kinetic energy?",
            options: ["200,000 J", "100,000 J", "400,000 J", "50,000 J"],
            correct: 0,
            hint: "KE = ½mv²"
        },
        {
            question: "If 500J of work is done in moving a box 10m, what is the average force applied?",
            options: ["50 N", "5000 N", "100 N", "5 N"],
            correct: 0,
            hint: "Work = Force × Distance"
        }
    ],
    electricity: [
        {
            question: "Three 2Ω resistors are connected in parallel. What is their equivalent resistance?",
            options: ["0.67 Ω", "6 Ω", "2 Ω", "1.5 Ω"],
            correct: 0,
            hint: "1/R_total = 1/R₁ + 1/R₂ + 1/R₃"
        },
        {
            question: "A 12V battery is connected to a 4Ω resistor. What is the current?",
            options: ["3 A", "48 A", "0.33 A", "8 A"],
            correct: 0,
            hint: "V = IR"
        },
        {
            question: "What is the power dissipated in a 10Ω resistor with 2A current flowing through it?",
            options: ["40 W", "20 W", "100 W", "5 W"],
            correct: 0,
            hint: "P = I²R"
        }
    ],
    optics: [
        {
            question: "A convex lens has focal length 10cm. Where is the image formed for an object at 15cm?",
            options: ["30 cm on opposite side", "6 cm on same side", "15 cm", "20 cm"],
            correct: 0,
            hint: "Use lens formula: 1/f = 1/v - 1/u"
        },
        {
            question: "What is the speed of light in vacuum?",
            options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁵ m/s", "3 × 10¹⁰ m/s"],
            correct: 0,
            hint: "Standard constant in physics"
        },
        {
            question: "Which color of light has the longest wavelength?",
            options: ["Red", "Violet", "Green", "Blue"],
            correct: 0,
            hint: "Remember ROYGBIV"
        }
    ]
};

class QuestionManager {
    constructor() {
        this.currentTopic = 'kinematics';
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.score = 0;
        this.hints = 3;
    }
    
    setTopic(topic) {
        this.currentTopic = topic;
        this.questions = [...physicsQuestions[topic]];
        this.shuffleQuestions();
        this.currentQuestionIndex = 0;
    }
    
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
    
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    checkAnswer(answerIndex) {
        const correct = this.questions[this.currentQuestionIndex].correct === answerIndex;
        if (correct) {
            this.score += 100;
            this.currentQuestionIndex++;
        }
        return correct;
    }
    
    getHint() {
        if (this.hints > 0) {
            this.hints--;
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
    }
}
