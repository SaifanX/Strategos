# Strategos: GitHub Issue Drafts 🏗️

These issues are designed to kickstart open-source contributions. 

---

## Issue 1: [Strategy] Implement 'Prober' (The Detective) Bot
**Labels:** `good-first-issue`, `help-wanted`, `enhancement`

### Description
We need a more sophisticated bot that "tests" its opponents. The **Prober** strategy starts with a specific sequence of moves to identify how the opponent reacts to betrayal.

### Technical Requirements
1. Create `src/strategies/Prober.ts`.
2. Implement the `IStrategy` interface.
3. **Logic:**
   - First 3 moves: `DEFECT`, `COOPERATE`, `COOPERATE`.
   - If the opponent EVER defects during these first 3 turns, switch to `TIT_FOR_TAT` for the rest of the game.
   - If the opponent never defects, continue to `DEFECT` to exploit them.
4. Register the bot in `src/engine/Registry.ts`.

---

## Issue 2: [Strategy] Implement 'Grim Trigger' (The Unforgiving)
**Labels:** `good-first-issue`, `help-wanted`, `enhancement`

### Description
Implement the **Grim Trigger** strategy. This is the ultimate test of reputation.

### Technical Requirements
1. Create `src/strategies/GrimTrigger.ts`.
2. **Logic:**
   - Start with `COOPERATE`.
   - Continue to `COOPERATE` as long as the opponent does.
   - If the opponent defects **once**, `DEFECT` for the remainder of the simulation.
3. Register the bot in `src/engine/Registry.ts`.

---

## Issue 3: [UI/UX] Add 'Snowdrift' (Chicken) Game Matrix Preset
**Labels:** `good-first-issue`, `help-wanted`, `UI`

### Description
Expand our Game Theory Engine by adding the **Snowdrift** (also known as Chicken) scenario.

### Technical Requirements
1. Update `ScenarioId` and `SCENARIOS` in `src/types.ts`.
2. **Matrix Values:**
   - Both Cooperate (CC): 3
   - Sucker (CD): 1
   - Temptation (DC): 5
   - Both Defect (DD): 0
3. Ensure the description explains the "Hawk-Dove" dynamics.

---

## Issue 4: [Optimization] Memoize Evolution Loop
**Labels:** `performance`, `help-wanted`

### Description
The simulation slows down significantly as agent counts increase beyond 2000. We need to optimize the evolution step inside `src/useSimulation.ts`.

### Technical Requirements
1. The `step` function currently recalculates stats every frame.
2. Implement a memoization strategy or a use-memo approach for the `currentStats` calculation.
3. Optimize the `filter` calls in the evolution logic which are currently O(N * B) where B is the number of behaviors.

---

## Issue 5: [Strategy] Implement 'Soft Tit-for-Tat' (Naive Prober)
**Labels:** `good-first-issue`, `help-wanted`

### Description
A variant of Tit-for-Tat that is more forgiving to occasional noise in the system.

### Technical Requirements
1. Logic: Play `COOPERATE` unless the opponent defects, but if they defect, there's a 30% chance to still `COOPERATE` to "forgive" accidental betrayals.

---

## Issue 6: [UI/UX] Strategy History Distribution Chart
**Labels:** `enhancement`, `UI`

### Description
Add a Recharts-based Area Chart to the dashboard that shows the population percentage of each strategy over the last 100 generations.

### Technical Requirements
1. Use the `populationHistory` array from the simulation state.
2. Implement an `AreaChart` that stacks the strategy counts.
3. Ensure the colors match the theme of the agents.
