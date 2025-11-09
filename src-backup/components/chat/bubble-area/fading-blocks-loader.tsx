/* *file-summary*
PATH: src/components/chat/bubble-area/fading-blocks-loader.tsx

PURPOSE: Renders a visual loading animation to indicate that the AI (Gemini) backend is processing a user request.

SUMMARY: This is a **dumb UI component** that displays a three-block "fading" animation. It is entirely self-contained, including its dedicated CSS styles and `@keyframes` animation definition within a `<style>` tag. This makes the animation independent of the global Tailwind configuration. The blocks fade in and out sequentially, creating a simple, visible indicator for the `loading` chat bubble variant.

RELATES TO OTHER FILES:
- This component is imported and used by 'src/components/chat/bubble-area/chat-bubble.tsx' when the `ChatMessage.variant` is set to `'loading'`.
- It replaces the need for an external CSS file for this specific animation effect.

IMPORTS:
- React from 'react'

EXPORTS:
- default FadingBlocksLoader (React functional component)
*/

import React from 'react';

/**
 * FadingBlocksLoader Component
 *
 * This component renders a "fading blocks" loading animation.
 * It is self-contained and includes all necessary CSS via a <style> tag.
 */
const FadingBlocksLoader: React.FC = () => {
  return (
    <>
      {/* Styles for the loader. 
          These are scoped within this component.
      */}
      <style>
        {`
          @keyframes fade-block-animation {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
          }

          .fading-block-container {
            display: flex;
          }

          .fading-block {
            width: 12px;
            height: 12px;
            margin: 2px;
            background-color: #6ee7b7; /* emerald-300 */
            border-radius: 4px;
            animation: fade-block-animation 1.2s infinite ease-in-out;
          }

          .fading-block:nth-child(1) { animation-delay: -0.32s; }
          .fading-block:nth-child(2) { animation-delay: -0.16s; }
          .fading-block:nth-child(3) { animation-delay: 0s; }
        `}
      </style>

      {/* The JSX structure for the loader */}
      <div className="fading-block-container">
        <div className="fading-block"></div>
        <div className="fading-block"></div>
        <div className="fading-block"></div>
      </div>
    </>
  );
};

export default FadingBlocksLoader;