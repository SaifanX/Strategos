# STRATEGOS // Strategic Game Theory Laboratory
[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://strategos1.netlify.app/)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Convex](https://img.shields.io/badge/Convex-FF7547?style=for-the-badge&logo=convex&logoColor=white)

**[🔴 ACCESS THE MAIN APP: Access the Strategos Engine](https://strategos1.netlify.app/)**

> A high-performance, interactive simulation engine exploring the intersection of Game Theory, Evolutionary Biology, and Web Architecture.

## Architecture Overview

Strategos is a deterministic simulation environment designed to visualize complex mathematical interactions (like the Prisoner's Dilemma) across dynamic agent populations. It leverages a modern frontend stack to handle high-frequency state updates and rendering.

### Core Stack
* **Engine:** React 19 + TypeScript
* **Rendering & Physics:** Three.js + React Three Fiber (`@react-three/drei`)
* **State & Data:** Convex (Real-time backend synchronization)
* **Styling & Animation:** Tailwind CSS + Motion (Framer)
* **Build System:** Vite

## System Capabilities

* **Parametric Simulation:** Real-time manipulation of Engine Speed, Mutation Rates, and Payoff Matrices.
* **Evolutionary Setups:** Pre-configured environments (Balanced Ecosystem, Aggressive Population, Cooperative Start) to test the viability of altruism vs. defection.
* **Real-time Analytics:** Integrated dashboard for tracking population history and generation lifecycles.
* **Colosseum Mode:** Distributed backend processing via Convex for persistent state testing.

  ## The Architect

**Saifan** *A 14-year-old developer and student based in Bangalore, India.*

Strategos is not just a standalone project; it is a manifestation of a broader directive toward universal competence (Polymathy). It serves as a practical crucible for integrating Game Theory, Systems Thinking, and high-performance Web Architecture into a cohesive utility.

My engineering philosophy prioritizes order, strategy, and brutal rationality. I do not build for comfort; I optimize for scale and execution.

* **Capabilities:** Full-Stack Architecture, Algorithmic Optimization, AI Integration.
* **Operating Thesis:** Drive high-agency output through strict personal systems and discipline.

[GitHub](https://github.com/saifanx) | [Access the App](https://strategos1.netlify.app/)

## Deployment Protocol

This application is optimized for edge deployment (Netlify/Vercel) as a Single Page Application (SPA).

### Local Execution
```bash
# 1. Clone the repository
git clone https://github.com/saifanx/strategos.git

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and input your Convex URL
cp .env.example .env

# 4. Initiate the development server
npm run dev
```

### Production Build
```bash
npm run build

*Note: Ensure `VITE_CONVEX_URL` is configured in your production environment variables.*
```

## The Matrix (Game Theory Logic)
The simulation evaluates agent interactions based on a customizable payoff matrix. Agents adapt, mutate, and survive based on their cumulative algorithmic success against other agents in the environment.
