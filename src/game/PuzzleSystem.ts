import { Puzzle } from './types';
import { SeededRandom } from './SeededRandom';
import { ItemFactory } from './Story';

export class PuzzleFactory {
  private static sequencePuzzles = [
    {
      question: "Security Lock: Complete the sequence to unlock.\nSequence: 2, 4, 8, 16, ?\n\nWhat number comes next?",
      answer: "32",
      hint: "Each number is double the previous number."
    },
    {
      question: "Airlock Code: Identify the pattern.\nSequence: 1, 1, 2, 3, 5, 8, ?\n\nWhat number comes next?",
      answer: "13",
      hint: "Each number is the sum of the previous two numbers (Fibonacci sequence)."
    },
    {
      question: "Door Lock: Complete the pattern.\nSequence: 3, 6, 12, 24, ?\n\nWhat number comes next?",
      answer: "48",
      hint: "Each number is double the previous."
    },
    {
      question: "Security Panel: Find the missing number.\nSequence: 100, 50, 25, ?\n\nWhat number comes next?",
      answer: "12.5",
      hint: "Each number is half of the previous."
    }
  ];

  private static physicsPuzzles = [
    {
      question: `Engineering Panel: Calculate the power output.

Formula: P = V² / R
Where:
- P = Power (Watts)
- V = Voltage (Volts)
- R = Resistance (Ohms)

The reactor shows:
Voltage (V) = 100 V
Resistance (R) = 50 Ω

Calculate Power (P) in Watts:`,
      answer: "200",
      hint: "P = (100)² / 50 = 10000 / 50"
    },
    {
      question: `Power Distribution: Calculate current flow.

Formula: I = V / R (Ohm's Law)
Where:
- I = Current (Amperes)
- V = Voltage (Volts)
- R = Resistance (Ohms)

Circuit readings:
Voltage (V) = 120 V
Resistance (R) = 40 Ω

Calculate Current (I) in Amperes:`,
      answer: "3",
      hint: "I = 120 / 40"
    },
    {
      question: `Kinetic Energy Calculation: Object impact force.

Formula: E = ½ × m × v²
Where:
- E = Kinetic Energy (Joules)
- m = mass (kg)
- v = velocity (m/s)

Incoming debris:
Mass (m) = 10 kg
Velocity (v) = 20 m/s

Calculate Energy (E) in Joules:`,
      answer: "2000",
      hint: "E = ½ × 10 × (20)² = 5 × 400"
    },
    {
      question: `Life Support: Calculate oxygen pressure.

Formula: PV = nRT (Ideal Gas Law, simplified to P = nRT/V)
Given: n=2 mol, R=8.314, T=300K, V=10m³

Calculate Pressure (P) in Pascals:
P = (n × R × T) / V`,
      answer: "498.84",
      hint: "P = (2 × 8.314 × 300) / 10"
    }
  ];

  private static chemistryPuzzles = [
    {
      question: `Chemical Storage: Calculate molar mass.

Compound: H₂O (Water)
Atomic masses:
- H (Hydrogen) = 1 g/mol
- O (Oxygen) = 16 g/mol

Calculate molar mass of H₂O:
(2 × H) + (1 × O) = ?`,
      answer: "18",
      hint: "(2 × 1) + (1 × 16) = 2 + 16"
    },
    {
      question: `Contamination Analysis: Balance the equation.

Incomplete equation: ?Fe + O₂ → Fe₂O₃

How many Fe atoms needed to balance?
(One Fe₂O₃ molecule needs 2 Fe atoms)`,
      answer: "2",
      hint: "Fe₂O₃ contains 2 iron atoms"
    },
    {
      question: `pH Calculation: Acid concentration.

Formula: pH = -log₁₀[H⁺]
Given: [H⁺] = 0.01 M

What is the pH?
(Hint: log₁₀(0.01) = -2, so pH = -(-2))`,
      answer: "2",
      hint: "pH = -log₁₀(0.01) = -(-2)"
    }
  ];

  private static mathPuzzles = [
    {
      question: `Navigation Computer: Solve for X.

Equation: 3X + 15 = 45

What is X?`,
      answer: "10",
      hint: "3X = 45 - 15, then X = 30 / 3"
    },
    {
      question: `Trajectory Calculation: Find the angle.

A right triangle has:
- Opposite side = 50 units
- Adjacent side = 50 units

What is the angle? (in degrees, assuming tan⁻¹(1) = 45°)`,
      answer: "45",
      hint: "When opposite = adjacent, angle is 45°"
    },
    {
      question: `Fuel Calculation: Percentage remaining.

Tank capacity: 1000 liters
Current fuel: 250 liters

What percentage of fuel remains?`,
      answer: "25",
      hint: "(250 / 1000) × 100"
    }
  ];

  private static engineeringPuzzles = [
    {
      question: `Pressure Lock: Calculate force.

Formula: Force = Pressure × Area
Where:
- Pressure = 5000 Pa (Pascals)
- Area = 2 m²

Calculate Force in Newtons (N):`,
      answer: "10000",
      hint: "F = 5000 × 2"
    },
    {
      question: `Gear Ratio: Calculate output speed.

Input speed: 100 RPM
Gear ratio: 1:5 (1 input rotation = 5 output rotations)

Output speed in RPM?`,
      answer: "500",
      hint: "100 × 5"
    },
    {
      question: `Torque Calculation: Wrench force.

Formula: Torque = Force × Distance
Where:
- Force = 50 N
- Distance = 0.5 m

Calculate Torque in N⋅m:`,
      answer: "25",
      hint: "T = 50 × 0.5"
    }
  ];

  static createRandom(rng: SeededRandom): Puzzle {
    // Choose random type
    const types: Array<'sequence' | 'physics' | 'chemistry' | 'math' | 'engineering'> =
      ['sequence', 'physics', 'chemistry', 'math', 'engineering'];
    const type = rng.choose(types);

    let template: { question: string; answer: string; hint?: string };
    switch (type) {
      case 'sequence':
        template = rng.choose(this.sequencePuzzles);
        break;
      case 'physics':
        template = rng.choose(this.physicsPuzzles);
        break;
      case 'chemistry':
        template = rng.choose(this.chemistryPuzzles);
        break;
      case 'math':
        template = rng.choose(this.mathPuzzles);
        break;
      case 'engineering':
        template = rng.choose(this.engineeringPuzzles);
        break;
      default:
        template = rng.choose(this.sequencePuzzles);
    }

    return {
      id: `puzzle_${Date.now()}_${rng.nextInt(1000, 9999)}`,
      name: this.getPuzzleName(type),
      type,
      question: template.question,
      hint: template.hint,
      answer: template.answer,
      reward: ItemFactory.createRandom(rng),
      rewardMessage: this.getRewardMessage(type),
      isSolved: false
    };
  }

  private static getPuzzleName(type: string): string {
    const names: Record<string, string> = {
      sequence: 'Sequence Lock',
      physics: 'Physics Console',
      chemistry: 'Chemical Panel',
      math: 'Navigation Computer',
      engineering: 'Engineering Lock'
    };
    return names[type] || 'Puzzle Lock';
  }

  private static getRewardMessage(type: string): string {
    const messages: Record<string, string> = {
      sequence: `
[LOCK DISENGAGED]
The panel flashes green. You hear a satisfying click.
A hidden compartment opens, revealing supplies.`,
      physics: `
[CALCULATION CORRECT]
The engineering systems respond. Power reroutes successfully.
A maintenance locker unlocks nearby.`,
      chemistry: `
[CHEMICAL ANALYSIS COMPLETE]
The containment field stabilizes. Safety protocols satisfied.
An emergency cache opens.`,
      math: `
[NAVIGATION SOLVED]
The computer accepts your input. Systems nominal.
A secure storage panel slides open.`,
      engineering: `
[ENGINEERING OVERRIDE ACCEPTED]
Mechanical systems engage. The lock releases.
You access the sealed compartment.`
    };
    return messages[type] || '[PUZZLE SOLVED]';
  }
}
