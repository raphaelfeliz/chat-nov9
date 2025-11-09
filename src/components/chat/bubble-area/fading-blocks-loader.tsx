/*
*file-summary*
PATH: src/components/chat/bubble-area/fading-blocks-loader.tsx (NEW FILE)
PURPOSE: Renders a "fading blocks" loading animation.
SUMMARY: This is a self-contained component with its own <style> tag
         for the keyframe animations. It is imported by chat-bubble.tsx
         to be displayed when the AI is thinking.
IMPORTS: React
EXPORTS: FadingBlocksLoader (default)
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