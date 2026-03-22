# Contributing to Strategos ⚔️

Welcome to Strategos! We are transforming this project into a modular **Game Theory Engine**, and we want your help building the most advanced collection of behavioral strategies.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **npm**: v9 or higher.

### 2. Local Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/SaifanX/Strategos.git
cd Strategos
npm install
```

### 3. Backend (Convex)
Strategos uses [Convex](https://convex.dev) for its backend. Start the Convex dev server:
```bash
npx convex dev
```

### 4. Running the Frontend
In a new terminal, start the Vite development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🧠 Adding a New Strategy

Adding a bot to Strategos is now modular. You don't need to touch the core simulation loop.

### Step 1: Create your Strategy file
Create a new TypeScript file in `src/strategies/YourStrategyName.ts`.

### Step 2: Implement the `IStrategy` interface
Your class must implement the `execute` method, which receives the current `Agent` state and returns either `'COOPERATE'` or `'DEFECT'`.

**Example: The "Prober" Strategy**
```typescript
import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

/**
 * Prober: Starts with D, C, C. 
 * If the opponent ever defects, it plays Tit-for-Tat.
 * Otherwise, it continues to defect occasionally to exploit cooperators.
 */
export class Prober implements IStrategy {
  readonly id = 'PROBER';
  readonly name = 'Prober';

  execute(agent: Agent): StrategyType {
    const turn = agent.history.length;
    
    // Initial moves: Defect, Cooperate, Cooperate
    if (turn === 0) return 'DEFECT';
    if (turn === 1 || turn === 2) return 'COOPERATE';

    // If opponent ever defected in the first 3 turns, play Tit-for-Tat
    const opponentDefectedEarly = agent.history.slice(0, 3).some((_, i) => 
        // Note: In a real implementation, you'd check opponent's history specifically
        // For this example, we'll use agent.hasBeenBetrayed as a proxy
        agent.hasBeenBetrayed
    );

    if (opponentDefectedEarly) {
      return agent.opponentLastMove || 'COOPERATE';
    }

    // Otherwise, defect to exploit
    return 'DEFECT';
  }
}
```

### Step 3: Register your Strategy
Open `src/engine/Registry.ts` and add your strategy to the `StrategyRegistry`:

```typescript
import { YourStrategy } from '../strategies/YourStrategy';

export const StrategyRegistry: Record<BehaviorType, IStrategy> = {
  // ... existing strategies
  YOUR_STRATEGY: new YourStrategy(),
};
```

> [!NOTE]
> Ensure you add your strategy ID to the `BehaviorType` union in `src/types.ts` if it's a new identifier.

---

## 🛠️ Development Workflow

### Linting & Typing
Before submitting a PR, ensure your code passes linting and TypeScript checks:
```bash
npm run lint
```

### Pull Request Guidelines
1. Create a descriptive branch name (`feat/my-new-bot`).
2. Ensure `IStrategy` compliance.
3. Add comments explaining your bot's logic.
4. Update tests if applicable (Phase 4 incoming).

---

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the MIT License.
