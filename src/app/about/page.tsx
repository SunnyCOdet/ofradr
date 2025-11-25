import React from "react";
import { WobbleCard } from "../../components/ui/wobble-card";

export default function AboutOfradr() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
      {/* What is Ofradr? */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 min-h-[260px] bg-transparent"
      >
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
            About
          </p>
          <h2 className="text-left text-balance text-xl md:text-3xl font-semibold tracking-[-0.03em] text-white">
            What is Ofradr?
          </h2>
          <p className="mt-4 text-left text-sm md:text-base leading-relaxed text-neutral-200">
            Ofradr is an AI-powered coding companion that runs off-radar during
            your coding practice and mock interviews. It reads problems directly
            from screenshots and uses Google Gemini AI to generate solutions,
            explanations, refactors, and more—without interrupting your flow or
            cluttering your screen.
          </p>
        </div>
      </WobbleCard>

      {/* Key Features */}
      <WobbleCard
        containerClassName="col-span-1 min-h-[260px] bg-transparent"
      >
        <div className="max-w-xs">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
            Highlights
          </p>
          <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-[-0.03em] text-white">
            Key Features
          </h2>
          <ul className="mt-4 space-y-3 text-left text-sm md:text-base text-neutral-200">
            <li>
              <span className="font-medium text-neutral-100">Stealth Mode</span>{" "}
              – Runs invisibly with a keyboard-only workflow.
            </li>
            <li>
              <span className="font-medium text-neutral-100">
                Screenshot-based solving
              </span>{" "}
              – Capture any coding problem with <code>Alt+S</code>.
            </li>
            <li>
              <span className="font-medium text-neutral-100">
                AI Task Agent
              </span>{" "}
              – Solve, debug, refactor, or add tests from a single prompt.
            </li>
            <li>
              <span className="font-medium text-neutral-100">
                Paste-ready output
              </span>{" "}
              – View with <code>Alt+H</code> and paste with <code>Alt+V</code>.
            </li>
          </ul>
        </div>
      </WobbleCard>

      {/* How it Works */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 min-h-[260px] bg-transparent"
      >
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
            Flow
          </p>
          <h2 className="text-left text-balance text-xl md:text-3xl font-semibold tracking-[-0.03em] text-white">
            How it Works
          </h2>
          <ol className="mt-4 space-y-3 text-left text-sm md:text-base text-neutral-200">
            <li>
              <span className="font-medium text-neutral-100">1. Capture</span> –{" "}
              Take a screenshot of the problem with <code>Alt+S</code>.
            </li>
            <li>
              <span className="font-medium text-neutral-100">
                2. Ask once
              </span>{" "}
              – Optionally give a single instruction (e.g. “solve and explain
              in simple terms”) and send with <code>Ctrl+Enter</code>.
            </li>
            <li>
              <span className="font-medium text-neutral-100">3. Apply</span> –{" "}
              View the response with <code>Alt+H</code> and paste into your
              editor using <code>Alt+V</code>.
            </li>
          </ol>
        </div>
      </WobbleCard>

      {/* Operating Modes */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-1 min-h-[260px] bg-transparent"
      >
        <div className="max-w-xs">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
            Modes
          </p>
          <h2 className="text-left text-balance text-xl md:text-2xl font-semibold tracking-[-0.03em] text-white">
            Operating Modes
          </h2>
          <ul className="mt-4 space-y-3 text-left text-sm md:text-base text-neutral-200">
            <li>
              <span className="font-medium text-neutral-100">
                Coding Practice Mode
              </span>{" "}
              – Ultra-stealth, invisible UI, keyboard shortcuts only. Perfect
              for daily practice and problem sets.
            </li>
            <li>
              <span className="font-medium text-neutral-100">
                Mock Interview Mode
              </span>{" "}
              – A visible, interactive window tailored for mock interviews,
              follow-up questions, and deeper explanations.
            </li>
          </ul>
        </div>
      </WobbleCard>
    </div>
  );
}
