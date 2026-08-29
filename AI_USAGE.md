# AI Usage Documentation

This document outlines the strategic integration of AI tools during the development of this solution. The goal was to leverage AI as an intelligent pair-programmer to accelerate boilerplate generation while maintaining strict architectural control and verifying all critical constraints.

## 1. AI Tools Used
*   **Google DeepMind Antigravity Agent (Gemini 3.1 Pro):** Used for scaffolding, initial boilerplate generation, and iterative refinement of both the frontend (React/Vite) and backend (Node.js/Express) architectures.

## 2. Prompts Given
Instead of relying on monolithic, generic prompts, I adopted a progressive prompting strategy to maintain control over the architecture:
1.  **Domain & Constraint Mapping:** Initially provided the assignment brief and asked the AI to map out the state machine for the conversation flow, focusing on strict defensive constraints.
2.  **Stack Specification:** "We want a full-stack implementation. Design a React + Vite frontend with Tailwind CSS, and a robust backend using Node.js, Express, and MongoDB."
3.  **Security Enhancement:** "Implement real JWT-based user authentication to properly scope user sessions, instead of relying on simple client-side identifiers."
4.  **Schema Refinement:** Directed the AI to refine the Mongoose schemas to correctly model the conversational state and transitions, ensuring robust data integrity.

## 3. What Was Modified from AI Output
While the AI efficiently generated the foundational structure, several critical modifications were necessary to align with production-grade standards:
*   **Architectural Review & Refactoring:** I reviewed the generated route structures and separated concerns, ensuring business logic (like state progression validation) was isolated from basic controller logic.
*   **State Management:** I heavily modified the frontend state management to ensure that edge cases (e.g., users navigating backward, manipulating URLs, or forcing refresh) were handled defensively, synchronizing strictly with the backend source of truth.
*   **Tailwind Configuration:** Adjusted the AI-generated Tailwind configuration to establish a cohesive, premium design system that met my specific UI/UX requirements.

## 4. What AI Got Wrong (and How I Addressed It)
*   **Over-Simplification of Auth:** The AI initially proposed a "pseudo-authentication" system (simply passing a userId in queries). Recognizing this as a security flaw and bad practice, I intervened and instructed it to implement a proper JWT-based authentication flow with protected routes.
*   **Defensive State Loopholes:** The AI's initial implementation of the conversation flow allowed users to bypass steps if they manually manipulated API payloads. I had to manually enforce a strict state-machine pattern on the backend, ensuring the server rejects any progression that doesn't logically follow the user's current verified state.
*   **Development Environment Quirks:** The AI attempted to use `npx tailwindcss init -p` which occasionally hangs on Windows. I recognized this bottleneck and manually orchestrated the PostCSS configuration to keep development moving.

## 5. How Correctness Was Verified
To ensure the AI's output was not just functional but robust, I implemented a rigorous verification process:
*   **Defensive API Testing:** Manually crafted invalid requests (e.g., attempting to jump to a final state from an initial state) to verify the backend's state-machine validation properly rejects them.
*   **Deep-Link Validation:** Tested URL manipulation on the frontend (e.g., `?question=invalid_id` or trying to return to a completed state) to ensure the system consistently redirects the user to their correct, backend-validated state.
*   **Database Seeding Integrity:** Carefully reviewed the `seed.js` script to confirm the relationships between Questions and expected Responses accurately mapped the intended conversational graph.
*   **Security Auditing:** Verified that JWT tokens are correctly minted, securely stored, and validated on every protected API endpoint.
