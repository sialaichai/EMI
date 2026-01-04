// questions.js
const emiLevels = {
    1: { // Bloom: Remember/Understand
        theme: "The Classroom",
        [
    {
        question: "Which law states that the direction of the induced current is such that it opposes the change in magnetic flux that produced it?",
        options: ["Faraday's Law", "Ampere's Law", "Lenz's Law", "Ohm's Law"],
        correct: 2,
        hint: "This law is a manifestation of the conservation of energy."
    },
    {
        question: "What is the SI unit of Magnetic Flux?",
        options: ["Tesla (T)", "Weber (Wb)", "Henry (H)", "Gauss (G)"],
        correct: 1,
        hint: "Tesla measures field strength; this unit measures the total field passing through an area."
    },
    {
        question: "What is the SI unit of Inductance?",
        options: ["Farad", "Ohm", "Henry", "Weber"],
        correct: 2,
        hint: "Named after the American scientist who discovered self-induction."
    },
    {
        question: "Which device uses electromagnetic induction to convert mechanical energy into electrical energy?",
        options: ["Electric Motor", "Transformer", "Generator", "Galvanometer"],
        correct: 2,
        hint: "Think about what happens in a power plant."
    },
    {
        question: "What is the formula for Magnetic Flux (Φ) through a surface of area A?",
        options: ["Φ = B / A", "Φ = B × A × cos(θ)", "Φ = B × A × sin(θ)", "Φ = μ₀I"],
        correct: 1,
        hint: "It involves the dot product of the Magnetic Field vector and the Area vector."
    },
    {
        question: "Eddy currents are circulating currents induced in:",
        options: ["Insulated wires", "Bulk conductors (solid metal)", "Vacuum tubes", "Semiconductors"],
        correct: 1,
        hint: "These currents often cause unwanted heating in transformer cores."
    },
    {
        question: "Faraday's Law states that the induced EMF is directly proportional to:",
        options: ["The magnetic flux", "The rate of change of magnetic flux", "The resistance of the coil", "The strength of the magnetic field"],
        correct: 1,
        hint: "It's not just about how much flux there is, but how fast it changes."
    },
    {
        question: "Which component is used in a transformer to increase the magnetic flux linkage between coils?",
        options: ["Copper windings", "Soft iron core", "Plastic casing", "Air gap"],
        correct: 1,
        hint: "This material has high magnetic permeability."
    },
    {
        question: "What is the phenomenon where a changing current in one coil induces an EMF in a nearby coil?",
        options: ["Self Induction", "Mutual Induction", "Resonance", "Capacitance"],
        correct: 1,
        hint: "This is the working principle of a transformer."
    },
    {
        question: "Lenz's Law is a consequence of the law of conservation of:",
        options: ["Charge", "Momentum", "Energy", "Mass"],
        correct: 2,
        hint: "If the induced current aided the motion, you would get free energy."
    },
    {
        question: "In the formula for motional EMF (ε = Blv), what does 'v' stand for?",
        options: ["Voltage", "Velocity", "Volume", "Viscosity"],
        correct: 1,
        hint: "It represents how fast the conductor creates the area."
    },
    {
        question: "If the number of turns in a coil is doubled, what happens to the induced EMF for the same rate of change of flux?",
        options: ["It remains the same", "It doubles", "It halves", "It quadruples"],
        correct: 1,
        hint: "Faraday's law: ε = -N(dΦ/dt)."
    },
    {
        question: "Which rule is used to determine the direction of induced current in a generator?",
        options: ["Fleming's Left Hand Rule", "Fleming's Right Hand Rule", "Right Hand Grip Rule", "Screw Rule"],
        correct: 1,
        hint: "Left hand is for Motors (Force), Right hand is for Generators (Current)."
    },
    {
        question: "What type of current does a battery produce?",
        options: ["Alternating Current (AC)", "Direct Current (DC)", "Eddy Current", "Induced Current"],
        correct: 1,
        hint: "It flows in only one constant direction."
    },
    {
        question: "A transformer that increases voltage is called a:",
        options: ["Step-down transformer", "Step-up transformer", "Isolation transformer", "Auto-transformer"],
        correct: 1,
        hint: "It steps the potential 'up'."
    },
    {
        question: "At what angle between the magnetic field and the area vector is magnetic flux maximum?",
        options: ["0 degrees", "45 degrees", "90 degrees", "180 degrees"],
        correct: 0,
        hint: "Cos(0) = 1. This means the field is perpendicular to the surface."
    },
    {
        question: "Which term describes the property of a coil to oppose changes in the current flowing through itself?",
        options: ["Mutual Inductance", "Self Inductance", "Conductance", "Resistance"],
        correct: 1,
        hint: "It is often called 'electrical inertia'."
    },
    {
        question: "1 Weber is equivalent to:",
        options: ["1 Tesla / meter²", "1 Tesla · meter²", "1 Tesla / second", "1 Volt · meter"],
        correct: 1,
        hint: "Flux = Field × Area."
    },
    {
        question: "To reduce eddy current losses in transformers, the core is:",
        options: ["Made of solid steel", "Laminated", "Made of copper", "Removed"],
        correct: 1,
        hint: "Slicing the core into thin sheets breaks the path of the currents."
    },
    {
        question: "An induced EMF is produced in a loop only if:",
        options: ["The loop moves", "The magnetic field is strong", "The magnetic flux through the loop changes", "The loop is made of copper"],
        correct: 2,
        hint: "A static strong field produces zero EMF."
    }
]
    },
    2: { // Bloom: Apply
        theme: "The Laboratory",
       [
    {
        question: "A coil with 100 turns experiences a change in magnetic flux from 2 Wb to 10 Wb in 4 seconds. Calculate the induced EMF.",
        options: ["200 V", "2 V", "50 V", "800 V"],
        correct: 0,
        hint: "Use Faraday's Law: ε = N × (ΔΦ / Δt)."
    },
    {
        question: "A conductor of length 0.5 m moves perpendicular to a magnetic field of 2 T with a velocity of 4 m/s. What is the induced EMF?",
        options: ["1 V", "4 V", "8 V", "0.25 V"],
        correct: 1,
        hint: "Use the formula for motional EMF: ε = Bvl."
    },
    {
        question: "A step-down transformer converts 240 V to 12 V. If the primary coil has 1000 turns, how many turns are in the secondary coil?",
        options: ["50 turns", "20000 turns", "20 turns", "500 turns"],
        correct: 0,
        hint: "Use the transformer equation: Vp/Vs = Np/Ns."
    },
    {
        question: "A square loop of side 10 cm is placed perpendicular to a 0.5 T magnetic field. What is the magnetic flux through the loop?",
        options: ["0.005 Wb", "0.05 Wb", "5 Wb", "50 Wb"],
        correct: 0,
        hint: "Convert cm to meters first! Area = 0.1m × 0.1m. Flux = B × A."
    },
    {
        question: "If a magnet moves towards a coil and induces a clockwise current, what is the direction of the induced current if the magnet is pulled away?",
        options: ["Clockwise", "Counter-clockwise", "Zero", "Alternating"],
        correct: 1,
        hint: "Lenz's Law: The direction reverses because the change in flux reverses."
    },
    {
        question: "An ideal transformer has a primary current of 2 A at 100 V. If the secondary voltage is 50 V, what is the secondary current?",
        options: ["1 A", "4 A", "2 A", "0.5 A"],
        correct: 1,
        hint: "Power in = Power out. Pp = Ps, so Ip × Vp = Is × Vs."
    },
    {
        question: "A solenoid has an inductance of 2 H. If the current changes at a rate of 5 A/s, what is the magnitude of the self-induced EMF?",
        options: ["2.5 V", "0.4 V", "10 V", "7 V"],
        correct: 2,
        hint: "Use the self-induction formula: ε = L × (dI/dt)."
    },
    {
        question: "A plane flies horizontally at 200 m/s. The vertical component of Earth's magnetic field is 4×10⁻⁵ T. If the wingspan is 50 m, what is the EMF induced across the wingtips?",
        options: ["0.4 V", "0.04 V", "4 V", "40 V"],
        correct: 0,
        hint: "Treat the wings as a conductor moving through a field: ε = Bvl."
    },
    {
        question: "A loop of wire has a resistance of 5 Ω. If an induced EMF of 20 V is generated, what is the induced current flowing through the loop?",
        options: ["100 A", "4 A", "0.25 A", "15 A"],
        correct: 1,
        hint: "Apply Ohm's Law: I = V / R."
    },
    {
        question: "The magnetic flux through a coil changes according to the equation Φ = 4t² + 2t. What is the induced EMF at t = 2 seconds?",
        options: ["18 V", "10 V", "20 V", "16 V"],
        correct: 0,
        hint: "EMF is the derivative of flux (dΦ/dt). Differentiate 4t² + 2t."
    },
    {
        question: "A straight wire moves at an angle of 30° to a magnetic field of 1 T with velocity 10 m/s. If the wire is 2 m long, what is the induced EMF?",
        options: ["20 V", "10 V", "17.3 V", "5 V"],
        correct: 1,
        hint: "Use ε = Bvl sin(θ). sin(30°) = 0.5."
    },
    {
        question: "A generator coil rotates at 60 revolutions per second (60 Hz). What is the angular velocity (ω) in rad/s?",
        options: ["60 rad/s", "377 rad/s", "120 rad/s", "3.14 rad/s"],
        correct: 1,
        hint: "Angular velocity ω = 2πf. Use π ≈ 3.14."
    },
    {
        question: "A bar magnet is dropped through a solenoid connected to a resistor. As the magnet enters, the current flows 'Left to Right'. Which way does it flow as the magnet exits?",
        options: ["Left to Right", "Right to Left", "It stops", "It becomes DC"],
        correct: 1,
        hint: "Lenz's Law: The change in flux is opposite upon exit, so the current direction flips."
    },
    {
        question: "An AC generator produces a peak voltage of 311 V. What is the RMS voltage usually cited for household supply?",
        options: ["110 V", "220 V", "240 V", "155 V"],
        correct: 1,
        hint: "V_rms = V_peak / √2. (311 / 1.414)."
    },
    {
        question: "A metal rod moves on rails separated by 1m in a 2T field at 5 m/s. The circuit has a resistance of 10Ω. Calculate the force required to keep it moving at constant speed.",
        options: ["1 N", "2 N", "5 N", "10 N"],
        correct: 0,
        hint: "First find EMF (Bvl), then Current (E/R), then Force (BIL)."
    },
    {
        question: "If you want to double the induced EMF in a generator without changing the magnetic field or area, what must you do to the frequency of rotation?",
        options: ["Halve it", "Double it", "Keep it constant", "Quadruple it"],
        correct: 1,
        hint: "Peak EMF ε_max = NBAω. ω is directly proportional to frequency."
    },
    {
        question: "A transformer has 500 turns on the primary and 50 turns on the secondary. If the input is 120V AC, is this a step-up or step-down transformer, and what is the output?",
        options: ["Step-Up, 1200 V", "Step-Down, 12 V", "Step-Up, 12 V", "Step-Down, 1.2 V"],
        correct: 1,
        hint: "Turns ratio is 10:1 (Primary:Secondary). Voltage drops by factor of 10."
    },
    {
        question: "A circular loop of radius 0.1m rotates from a position perpendicular to a 1T field to a position parallel to it in 0.1s. What is the average induced EMF?",
        options: ["0.1 V", "0.314 V", "3.14 V", "1 V"],
        correct: 1,
        hint: "ΔΦ = B × A. Area = πr². Change in time = 0.1s."
    },
    {
        question: "Which orientation of a coil in a magnetic field produces zero magnetic flux?",
        options: ["Plane of coil perpendicular to B", "Plane of coil parallel to B", "Plane of coil at 45° to B", "Plane of coil at 60° to B"],
        correct: 1,
        hint: "Flux is zero when the field lines skim past the loop without going through it."
    },
    {
        question: "A magnet is pushed into a coil with velocity v, producing voltage V. If the velocity is increased to 2v, what is the new induced voltage?",
        options: ["V", "2V", "V/2", "4V"],
        correct: 1,
        hint: "Rate of change of flux is directly proportional to velocity."
    }
]
    },
    3: { // Bloom: Analyze
        theme: "The Power Plant",
        [
    {
        question: "A graph shows Magnetic Flux (Φ) increasing linearly with time. Which statement describes the induced EMF?",
        options: ["It increases linearly", "It is constant and non-zero", "It is zero", "It decreases linearly"],
        correct: 1,
        hint: "EMF depends on the rate of change (slope). A linear line has a constant slope."
    },
    {
        question: "Why is a spark often produced when a switch connected to an inductive circuit (like a motor) is suddenly opened?",
        options: ["The resistance drops to zero", "The rapid collapse of the magnetic field induces a massive EMF", "The battery voltage increases momentarily", "Capacitance effects take over"],
        correct: 1,
        hint: "Analyze the rate of change (dI/dt) when current stops instantly."
    },
    {
        question: "Two identical bar magnets are dropped from the same height: one through a Copper tube, the other through a Plastic tube. Analyze the motion.",
        options: ["Both hit the ground at the same time", "The magnet in the Copper tube falls slower due to upward magnetic force", "The magnet in the Plastic tube falls slower due to static friction", "The magnet in the Copper tube falls faster due to conductivity"],
        correct: 1,
        hint: "Consider the eddy currents induced in the conductor and Lenz's Law."
    },
    {
        question: "In an AC generator, the induced EMF is zero when the coil is perpendicular to the magnetic field. Why?",
        options: ["The magnetic flux is zero at that point", "The magnetic flux is maximum, but the rate of change is zero", "The rotation stops momentarily", "The magnetic field vanishes"],
        correct: 1,
        hint: "Look at the slope of a Sine wave (Flux) at its peak."
    },
    {
        question: "A rectangular loop is pulled at constant speed completely through a uniform magnetic field region (wider than the loop). When is induced current NOT zero?",
        options: ["The entire time it moves", "Only when entering and exiting the field region", "Only when fully inside the field", "Only when entering"],
        correct: 1,
        hint: "Current flows only when the flux *changes*. Is flux changing when the whole loop is inside?"
    },
    {
        question: "Why does an electric motor draw much more current when it is first turned on (startup) compared to when it is running at full speed?",
        options: ["Friction is higher at start", "There is no Back EMF to oppose the supply voltage yet", "The magnets are cold", "The resistance of the wire increases with speed"],
        correct: 1,
        hint: "Analyze the motor as a generator acting against itself (Back EMF)."
    },
    {
        question: "If the frequency of rotation of a generator coil is doubled, how does this affect the output voltage graph?",
        options: ["Amplitude doubles, Period doubles", "Amplitude stays same, Period halves", "Amplitude doubles, Period halves", "Amplitude quadruples, Period halves"],
        correct: 2,
        hint: "EMF is proportional to ω (angular speed), and Period is 1/f."
    },
    {
        question: "A copper ring is held horizontally and a bar magnet is dropped through it. Describe the acceleration of the magnet.",
        options: ["Always equal to g", "Less than g while entering, greater than g while leaving", "Less than g the entire time", "Greater than g the entire time"],
        correct: 2,
        hint: "Lenz's law opposes motion both when approaching (repulsion) and leaving (attraction)."
    },
    {
        question: "Analyze why 'Back winding' (doubling the wire back on itself) is used in standard resistors.",
        options: ["To increase resistance", "To cancel out self-inductance effects", "To make it physically stronger", "To increase capacitance"],
        correct: 1,
        hint: "Current flows in opposite directions in adjacent wires, cancelling magnetic fields."
    },
    {
        question: "A primary coil is connected to a battery and switch. A secondary coil is nearby. A current pulse is induced in the secondary only when:",
        options: ["The switch is closed and kept closed", "The switch is opened and kept open", "The switch is either just closing or just opening", "There is a constant DC current"],
        correct: 2,
        hint: "Induction requires a *changing* magnetic field, not a constant one."
    },
    {
        question: "Why are induction cooktops safer to touch than gas stoves, even though they heat food?",
        options: ["They use ice", "They only heat ferromagnetic materials via eddy currents, not the glass surface directly", "They have weak power", "They use insulation"],
        correct: 1,
        hint: "Analyze the mechanism of heating: the pot becomes the heat source."
    },
    {
        question: "A loop of wire shrinks in size while inside a uniform magnetic field pointing into the screen. Determine the direction of induced current.",
        options: ["Clockwise", "Counter-Clockwise", "No current", "Alternating"],
        correct: 0,
        hint: "Flux 'into' the page is decreasing. The loop tries to add more 'into' field (Right Hand Rule)."
    },
    {
        question: "If Lenz's Law were reversed (induced current aided motion), what fundamental physics principle would be violated?",
        options: ["Conservation of Momentum", "Conservation of Charge", "Conservation of Energy", "Newton's First Law"],
        correct: 2,
        hint: "You would be creating infinite kinetic energy and electrical energy from a small push."
    },
    {
        question: "Compare a solid iron core vs. a laminated iron core in a transformer. The solid core gets hotter because:",
        options: ["Iron is a good insulator", "Large eddy currents can circulate freely in the bulk metal", "It has higher magnetic permeability", "It has lower resistance"],
        correct: 1,
        hint: "Analyze the path of the circulating currents."
    },
    {
        question: "A metal sheet pendulum oscillates between the poles of a strong magnet. It stops quickly. What happens if you cut slots into the sheet?",
        options: ["It stops even faster", "It oscillates for a longer time", "No change", "It speeds up"],
        correct: 1,
        hint: "Slots increase electrical resistance, reducing eddy currents and the braking force."
    },
    {
        question: "In a step-up transformer, voltage increases. Analyze what happens to the current to satisfy Power In ≈ Power Out.",
        options: ["Current increases", "Current stays the same", "Current decreases", "Current becomes zero"],
        correct: 2,
        hint: "P = IV. If V goes up and P is constant, I must go down."
    },
    {
        question: "A flexible wire loop is placed in a magnetic field. If the current in the loop is suddenly increased, the loop tends to:",
        options: ["Expand into a circle", "Collapse", "Rotate", "Move sideways"],
        correct: 0,
        hint: "Analyze the forces between adjacent segments of wire carrying parallel currents (repulsion)."
    },
    {
        question: "Which factor does NOT affect the magnitude of mutual inductance between two coils?",
        options: ["The number of turns in the coils", "The relative orientation of the coils", "The material of the core", "The resistivity of the wire material"],
        correct: 3,
        hint: "Inductance is a geometric/magnetic property, not dependent on the wire's electrical resistance."
    },
    {
        question: "A bar magnet is moved towards a coil at speed 'v'. If the coil is moved towards the magnet at speed 'v' instead, compare the induced EMF.",
        options: ["Moving the magnet produces more EMF", "Moving the coil produces more EMF", "Both produce the same EMF", "Moving the coil produces zero EMF"],
        correct: 2,
        hint: "Induction depends on relative velocity."
    },
    {
        question: "Why is high voltage used for long-distance power transmission?",
        options: ["To increase the current flow", "To reduce current and minimize I²R heat losses", "Because transformers only work at high voltage", "To speed up the electrons"],
        correct: 1,
        hint: "Analyze the power loss formula P_loss = I²R."
    }
]
    },
    4: { // Bloom: Evaluate
        theme: "The High Voltage Vault",
       [
    {
        question: "Critique this statement: 'Lenz's Law violates the conservation of energy because it creates a counter-force against motion.'",
        options: ["True. It creates energy from nothing.", "False. The counter-force requires mechanical work, which converts to electrical energy.", "False. It only applies to static magnetic fields.", "True. But it only applies at quantum scales."],
        correct: 1,
        hint: "If there were no counter-force, you could generate infinite electricity with a single push."
    },
    {
        question: "Two engineers are designing a transformer core. Engineer A suggests solid iron; Engineer B suggests laminated iron. Evaluate who is correct and why.",
        options: ["Engineer A: Solid iron is stronger and conducts flux better.", "Engineer B: Lamination reduces eddy current energy losses.", "Engineer A: Lamination increases resistance too much.", "Both are wrong: The core should be wood."],
        correct: 1,
        hint: "Consider the heating effects caused by circulating currents inside the iron itself."
    },
    {
        question: "Assess the validity of this claim: 'A step-up transformer increases power because it increases voltage.'",
        options: ["Valid. Higher voltage means higher power (P=V^2/R).", "Invalid. It violates Conservation of Energy; as Voltage goes up, Current goes down.", "Valid, but only for ideal transformers.", "Invalid. Power is always zero in a transformer."],
        correct: 1,
        hint: "Power Input ≈ Power Output. You cannot create extra power just by winding wires."
    },
    {
        question: "You need to transmit 100MW of power over 100km. Evaluate the best strategy to minimize power loss.",
        options: ["High Current, Low Voltage.", "High Voltage, Low Current.", "Medium Voltage, Medium Current.", "It makes no difference."],
        correct: 1,
        hint: "Power loss is I²R. You want to minimize 'I' (Current)."
    },
    {
        question: "A student claims that induced EMF depends on the resistance of the coil. Evaluate this claim.",
        options: ["Correct. Higher resistance blocks EMF.", "Incorrect. EMF depends on flux change; Current depends on resistance.", "Correct. Ohm's law says V=IR.", "Incorrect. Resistance only affects the magnetic field strength."],
        correct: 1,
        hint: "EMF is the 'push'. Resistance determines how much flow (current) you get from that push."
    },
    {
        question: "Compare a generator and a motor. Which statement best evaluates their fundamental relationship?",
        options: ["They are completely different machines.", "They are inverses: Generators convert mechanical to electrical; Motors convert electrical to mechanical.", "Motors require AC, Generators require DC.", "Generators violate Lenz's law, Motors obey it."],
        correct: 1,
        hint: "Think about energy conversion inputs and outputs."
    },
    {
        question: "Evaluate why a battery cannot be used as the primary source for a transformer.",
        options: ["Batteries don't have enough power.", "Batteries provide DC, which creates a constant flux that does not induce EMF.", "Batteries will explode.", "The voltage is too low."],
        correct: 1,
        hint: "Induction requires a *change* in flux (dΦ/dt). DC is constant."
    },
    {
        question: "A copper loop moves through a uniform magnetic field at constant velocity. A student predicts a constant induced current. Evaluate this prediction.",
        options: ["Correct. Motion always creates current.", "Incorrect. If the field is uniform, flux doesn't change, so Current is zero.", "Correct, but the current will oscillate.", "Incorrect. The current will be infinite."],
        correct: 1,
        hint: "Is the number of field lines passing through the loop actually changing?"
    },
    {
        question: "Assess the impact of removing the iron core from a solenoid inductor.",
        options: ["The inductance increases significantly.", "The inductance decreases significantly.", "The inductance stays exactly the same.", "The resistance decreases."],
        correct: 1,
        hint: "Iron concentrates magnetic flux. Air is much worse at this (low permeability)."
    },
    {
        question: "Evaluate the risk: A large electric motor is running at full speed and is suddenly unplugged. Is it safe to touch the terminals immediately?",
        options: ["Yes, the power is off.", "No. The spinning motor acts as a generator (Back EMF) until it stops.", "Yes, but only the negative terminal.", "No, because of static electricity."],
        correct: 1,
        hint: "Inertia keeps the rotor spinning. A spinning coil in a field generates voltage."
    },
    {
        question: "Compare Loop A (1 turn, Area 1m²) and Loop B (10 turns, Area 0.1m²) placed in the same changing field. Which generates more EMF?",
        options: ["Loop A", "Loop B", "They generate the same EMF", "Impossible to determine"],
        correct: 2,
        hint: "EMF is proportional to N × Area. A: 1×1=1. B: 10×0.1=1."
    },
    {
        question: "An inventor proposes a 'Magnetic Brake' for trains that uses no friction pads, only magnets and copper rails. Evaluate a potential downside.",
        options: ["It will wear out the copper.", "Braking force decreases as the train slows down, making it hard to stop completely.", "It produces toxic fumes.", "It creates zero heat."],
        correct: 1,
        hint: "Eddy current force is proportional to velocity. If v=0, Force=0."
    },
    {
        question: "Justify the use of high-frequency AC in induction heating cooktops.",
        options: ["It tastes better.", "Higher frequency means faster rate of flux change, creating larger eddy currents for heating.", "Low frequency would electrocute the food.", "It matches the resonant frequency of water."],
        correct: 1,
        hint: "Faraday's law: EMF is proportional to frequency (rate of change)."
    },
    {
        question: "A student wraps a wire around a plastic ruler to make an electromagnet. Evaluate the effectiveness compared to an iron nail.",
        options: ["The plastic ruler is better because it's an insulator.", "The iron nail is better because it is a ferromagnet that amplifies the field.", "Both are equal.", "The plastic prevents short circuits, so it is better."],
        correct: 1,
        hint: "Ferromagnetic materials align domains to boost the magnetic field significantly."
    },
    {
        question: "Evaluate the phenomenon of 'Back EMF' in a DC motor starting up.",
        options: ["It is a defect that wastes power.", "It helps regulate the motor speed and prevents burnout after startup.", "It causes the motor to spin backwards.", "It only exists in AC motors."],
        correct: 1,
        hint: "As speed increases, Back EMF increases, opposing the supply voltage and reducing current draw."
    },
    {
        question: "Two identical magnets are dropped. One falls through a vacuum, the other through a copper pipe. Justify the difference in fall times.",
        options: ["Vacuum is faster because of no air resistance only.", "Copper pipe is slower because induced currents create an upward magnetic drag.", "Copper pipe is faster because it conducts gravity.", "They fall at the same rate."],
        correct: 1,
        hint: "Energy is being converted into heat in the copper pipe, stealing from kinetic energy."
    },
    {
        question: "Critique the design of a generator that uses a permanent magnet vs. an electromagnet for the field.",
        options: ["Permanent magnets are always better.", "Electromagnets allow for adjustable field strength and voltage regulation.", "Electromagnets use too much power to be useful.", "Permanent magnets are too heavy."],
        correct: 1,
        hint: "How would you control the output voltage if the load changes? You can't dim a permanent magnet."
    },
    {
        question: "Evaluate the best material for a compass needle casing (the box holding the needle).",
        options: ["Iron, to protect it.", "Aluminum or Plastic, to avoid shielding the Earth's magnetic field.", "Steel, to make it durable.", "Magnetite."],
        correct: 1,
        hint: "If you put a compass inside an iron box, the box redirects the magnetic field lines around the needle (shielding)."
    },
    {
        question: "A standard transformer fails to operate. You check the input and it is 12V DC. Evaluate the problem.",
        options: ["The voltage is too low.", "Transformers require AC to create changing flux.", "The secondary coil is broken.", "The core is saturated."],
        correct: 1,
        hint: "DC creates a static magnetic field. Induction needs a dynamic one."
    },
    {
        question: "Assess why lightning strikes near power lines can cause surges even without direct contact.",
        options: ["The lightning jumps to the wire.", "The massive rapid change in magnetic field from the lightning bolt induces a voltage spike in the lines.", "The thunder shakes the wires.", "Rain conducts the electricity."],
        correct: 1,
        hint: "Lightning is a massive spark (current) that changes very quickly (di/dt), creating a huge EMP."
    }
]
    },
    5: { // Bloom: Create/Synthesis
        theme: "The Quantum Core",
       [
    {
        question: "Design a magnetic braking system for a roller coaster. Which configuration maximizes braking force without mechanical wear?",
        options: ["Steel pads pressing against steel rails", "Copper fins passing between strong permanent magnets", "Rubber pads on plastic rails", "Ceramic pads on aluminum rails"],
        correct: 1,
        hint: "You need a non-magnetic conductor to generate maximum eddy currents."
    },
    {
        question: "You are building a wireless charger. To maximize efficiency between the transmitter and receiver coils, how should you arrange them?",
        options: ["Perpendicular to each other", "Coaxial (parallel planes, centers aligned)", "Side by side", "At 45 degrees"],
        correct: 1,
        hint: "Maximize the magnetic flux linkage. The field lines from one must pass directly through the other."
    },
    {
        question: "Invent a device to measure the speed of blood flow without cutting the artery. Which principle works best?",
        options: ["Measure resistance changes", "Apply a magnetic field and measure the induced voltage (Hall Effect/Induction) across the vessel", "Use a small turbine", "Measure temperature"],
        correct: 1,
        hint: "Blood is a conductive fluid moving through a magnetic field (Motional EMF)."
    },
    {
        question: "Hypothesize the outcome: A superconductor (zero resistance) ring is cooled in a magnetic field, then the field is turned off. What happens?",
        options: ["The current stops immediately", "A current is induced and flows forever, trapping the flux", "The ring explodes", "The ring heats up"],
        correct: 1,
        hint: "If R=0, the induced current never decays. This is Flux Pinning."
    },
    {
        question: "You need to construct a microphone. How can you use electromagnetic induction to convert sound to electricity?",
        options: ["Attach a magnet to a diaphragm moving inside a fixed coil", "Use a capacitor plate", "Use a carbon granule variable resistor", "Heat a wire with sound"],
        correct: 0,
        hint: "Sound vibrates the diaphragm -> moves magnet -> changes flux in coil -> induces signal."
    },
    {
        question: "Formulate a strategy to detect cracks in airplane wings using electricity.",
        options: ["Pass high DC current and check for heat", "Use an Eddy Current Probe to detect disruptions in induced circular currents", "X-ray the wing", "Hit it with a hammer"],
        correct: 1,
        hint: "A crack disrupts the path of eddy currents, changing the impedance of the probe coil."
    },
    {
        question: "Design a 'Homopolar Generator' (Faraday Disk). Where must you place the electrical contacts to get DC output?",
        options: ["Both on the rim", "One on the axle, one on the rim", "Both on the axle", "One on the magnet, one on the disk"],
        correct: 1,
        hint: "The EMF is generated radially from center to edge (Motional EMF)."
    },
    {
        question: "You want to modify an AC generator to produce DC output. What component do you invent/add?",
        options: ["A transformer", "Slip rings", "A Split-ring Commutator", "A capacitor bank"],
        correct: 2,
        hint: "You need a mechanical switch that reverses the connection every half rotation."
    },
    {
        question: "Predict the behavior: A magnet is suspended on a spring above a copper plate and set to oscillate. How does the motion differ from oscillating over plastic?",
        options: ["It oscillates longer over copper", "It stops much faster (damped) over copper", "No difference", "It speeds up over copper"],
        correct: 1,
        hint: "Eddy currents in the copper create a magnetic field that opposes the motion (Magnetic Damping)."
    },
    {
        question: "Design a transformer for a high-frequency switching power supply (like a phone charger). What core material do you choose?",
        options: ["Solid Iron", "Laminated Steel", "Ferrite (Ceramic)", "Air"],
        correct: 2,
        hint: "At high frequencies, even laminated iron has too much eddy current loss. Ferrites are non-conductive magnetic materials."
    },
    {
        question: "Construct a 'Railgun'. If the current flows up the left rail, across the projectile, and down the right rail, which way does the magnetic force point?",
        options: ["Downwards", "Backwards", "Forwards (out of the gun)", "Sideways"],
        correct: 2,
        hint: "The magnetic field between the rails points up/down. Interaction with the current (Lorentz Force) pushes it out."
    },
    {
        question: "You are designing a seismometer to detect earthquakes. How can induction provide the signal?",
        options: ["A heavy magnet hangs inside a coil fixed to the ground; ground motion induces voltage", "A pendulum hits a bell", "Measure the resistance of the ground", "Use a laser"],
        correct: 0,
        hint: "Inertia keeps the magnet still while the coil shakes with the earth."
    },
    {
        question: "Create a setup to levitate a metal ring. What is required?",
        options: ["A DC current in a coil below it", "A rapidly changing AC current in a coil below it", "A strong permanent magnet", "Heating the ring"],
        correct: 1,
        hint: "AC creates changing flux -> induces current in ring -> Lenz's law creates repulsive force."
    },
    {
        question: "Propose a method to measure high AC current in a power line without touching the wire.",
        options: ["Cut the wire and insert an ammeter", "Use a Rogowski Coil (air-cored toroid) wrapped around the wire", "Use a voltmeter", "Measure the temperature of the wire"],
        correct: 1,
        hint: "The alternating magnetic field around the wire induces a voltage in the toroidal coil."
    },
    {
        question: "Design a 'Shake Flashlight'. To maximize energy harvest, how should the magnet and coil be configured?",
        options: ["Magnet moves through the center of the coil", "Magnet moves beside the coil", "Magnet rotates around the coil", "Coil moves, magnet stays still"],
        correct: 0,
        hint: "Passage through the center maximizes the change in flux linkage."
    },
    {
        question: "Synthesize a solution to shield a sensitive quantum computer from external magnetic interference.",
        options: ["Wrap it in plastic", "Wrap it in Mu-metal (high permeability alloy)", "Wrap it in copper", "Keep it in a vacuum"],
        correct: 1,
        hint: "High permeability materials channel magnetic field lines through themselves, bypassing the interior space."
    },
    {
        question: "If you were to build an 'Induction Furnace' to melt steel, what creates the heat?",
        options: ["Burning coal", "The resistance of the coils", "Huge eddy currents induced within the steel itself", "Friction"],
        correct: 2,
        hint: "The metal to be melted acts as the secondary winding of a transformer, effectively a short circuit."
    },
    {
        question: "Predict the effect: A copper disk rotates below a suspended magnet (Arago's Disk). What happens to the magnet?",
        options: ["It stays still", "It is repelled upwards", "It begins to rotate in the same direction as the disk", "It rotates in the opposite direction"],
        correct: 2,
        hint: "The relative motion induces currents in the disk, which create a field that tries to 'drag' the magnet along (Lenz's Law)."
    },
    {
        question: "Design a circuit to light a bulb using a battery and a transformer.",
        options: ["Connect battery to primary, bulb to secondary", "It's impossible with a battery", "Connect battery to primary via a rapid switch/oscillator", "Connect battery to secondary"],
        correct: 2,
        hint: "Transformers need changing flux. You must chop the DC from the battery to create AC."
    },
    {
        question: "Formulate a hypothesis: Why does dropping a magnet down a copper tube take longer than dropping a non-magnet of the same mass?",
        options: ["Air resistance is higher for magnets", "The magnet is attracted to the copper walls", "Induced currents create an upward force opposing gravity", "Copper is magnetic"],
        correct: 2,
        hint: "Gravity pulls down, Magnetic force pushes up. Terminal velocity is reached when they balance."
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
