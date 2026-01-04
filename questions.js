// questions.js
const emiLevels = {
    1: { // Bloom: Remember/Understand
        theme: "The Classroom",
        questions: [
            {
                question: "Which law states that an induced electromotive force (EMF) always opposes the change in magnetic flux that produced it?",
                options: ["Ampere's Law", "Lenz's Law", "Gauss's Law", "Ohm's Law"],
                correct: 1,
                hint: "Think about conservation of energy and 'opposition'."
            },
            {
                question: "What is the SI unit of Magnetic Flux?",
                options: ["Tesla (T)", "Weber (Wb)", "Henry (H)", "Farad (F)"],
                correct: 1,
                hint: "Tesla is for field strength; this unit measures the total field passing through an area."
            },
            {
                question: "Magnetic Flux (Φ) is defined as the product of Magnetic Field (B) and Area (A) times the cosine of the angle between them. What is the formula?",
                options: ["Φ = B/A", "Φ = BA cos(θ)", "Φ = BA sin(θ)", "Φ = B + A"],
                correct: 1,
                hint: "It uses the dot product of vectors B and A."
            }
        ]
    },
    2: { // Bloom: Apply
        theme: "The Laboratory",
        questions: [
            {
                question: "A coil with 50 turns experiences a change in magnetic flux of 0.5 Wb in 2 seconds. What is the magnitude of the induced EMF?",
                options: ["12.5 V", "25 V", "100 V", "0.2 V"],
                correct: 0,
                hint: "Use Faraday's Law: ε = N * (ΔΦ/Δt)"
            },
            {
                question: "A 2m long conductor moves at 10 m/s perpendicular to a 0.5 T magnetic field. What is the induced EMF?",
                options: ["5 V", "10 V", "20 V", "1 V"],
                correct: 1,
                hint: "For motional EMF: ε = Bvl"
            },
            {
                question: "If the magnetic field through a loop doubles while the area remains constant, what happens to the flux?",
                options: ["It halves", "It stays the same", "It doubles", "It quadruples"],
                correct: 2,
                hint: "Flux is directly proportional to the magnetic field strength."
            }
        ]
    },
    3: { // Bloom: Analyze
        theme: "The Power Plant",
        questions: [
            {
                question: "A bar magnet is dropped north pole first through a horizontal copper ring. As it enters, what is the direction of the induced current viewed from above?",
                options: ["Clockwise", "Counter-Clockwise", "No current", "Alternating"],
                correct: 1,
                hint: "Lenz's law: The ring must create a North pole pointing up to repel the incoming magnet."
            },
            {
                question: "Why do transformers only work with AC and not DC?",
                options: ["DC voltage is too high", "DC creates a constant magnetic field (no flux change)", "AC is cheaper", "Resistance is higher in DC"],
                correct: 1,
                hint: "Induction requires a *changing* magnetic flux."
            },
            {
                question: "In an AC generator, at what position of the coil is the induced EMF zero?",
                options: ["When flux is zero", "When flux is maximum", "At 45 degrees", "Always constant"],
                correct: 1,
                hint: "EMF depends on the rate of change. When flux is max, the slope (rate of change) is momentarily zero."
            }
        ]
    },
    4: { // Bloom: Evaluate
        theme: "The High Voltage Vault",
        questions: [
            {
                question: "Two identical loops are moved into a magnetic field. Loop A moves twice as fast as Loop B. Compare the power dissipated if both have equal resistance.",
                options: ["Power in A is 2x B", "Power in A is 4x B", "Powers are equal", "Power in B is 2x A"],
                correct: 1,
                hint: "EMF is proportional to velocity (v), so EMF_A = 2*EMF_B. Power is V²/R."
            },
            {
                question: "Engineers want to reduce eddy current losses in a transformer core. Which method is most effective?",
                options: ["Using a solid iron core", "Using a laminated soft iron core", "Using a copper core", "Increasing the voltage"],
                correct: 1,
                hint: "Lamination breaks the path of circular currents."
            },
            {
                question: "Critique this statement: 'Lenz's Law violates the conservation of energy because it creates a force that opposes motion.'",
                options: ["True, it violates energy conservation", "False, the opposing force requires work, converting mechanical energy to electrical", "False, it only applies to static fields", "True, but only in vacuum"],
                correct: 1,
                hint: "If it aided motion, you would get infinite energy for free."
            }
        ]
    },
    5: { // Bloom: Create/Synthesis
        theme: "The Quantum Core",
        questions: [
            {
                question: "You need to design a magnetic brake for a train. Based on eddy currents, which material would be best for the braking fin passing through the magnets?",
                options: ["Plastic (Insulator)", "Copper (High Conductivity, Non-magnetic)", "Iron (High Permeability)", "Wood"],
                correct: 1,
                hint: "You need low resistance to maximize eddy currents, but iron might stick to the magnets due to ferromagnetism."
            },
            {
                question: "Predict the outcome: A magnet falls down a very long copper tube. Describe its motion.",
                options: ["Accelerates at 9.8 m/s² constantly", "Stops in the middle", "Accelerates briefly, then reaches a constant terminal velocity", "Oscillates up and down"],
                correct: 2,
                hint: "Gravity pulls down, magnetic force pushes up. As speed increases, magnetic force increases until forces balance."
            },
            {
                question: "If you were building a self-sustaining flashlight, which mechanism maximizes energy harvest from shaking?",
                options: ["A weak magnet moving slowly", "A strong magnet moving rapidly through a coil with many turns", "A battery", "A stationary magnet"],
                correct: 1,
                hint: "Maximize B, maximize v, maximize N (Faraday's Law)."
            }
        ]
    }
};

class QuestionManager {
    constructor() {
        this.currentLevel = 1;
        this.questions = [];
        this.score = 0;
        this.hints = 3;
        this.currentQuestionIndex = 0;
    }
    
    loadLevel(level) {
        this.currentLevel = level;
        // Deep copy questions to avoid modifying original
        this.questions = [...emiLevels[level].questions];
        // Shuffle
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
        this.currentQuestionIndex = 0;
        // Grant an extra hint per level
        if(level > 1) this.hints++;
    }
    
    getTheme() {
        return emiLevels[this.currentLevel].theme;
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }
    
    checkAnswer(answerIndex) {
        const correct = this.questions[this.currentQuestionIndex].correct === answerIndex;
        if (correct) {
            this.score += 100 * this.currentLevel; // More points for harder levels
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
        this.currentLevel = 1;
    }
}
