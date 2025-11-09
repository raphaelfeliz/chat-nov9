/* *file-summary*
PATH: src/core/state/ConfiguratorContext.tsx

PURPOSE: Centralize and expose configurator state using the new Smart Engine.

SUMMARY: Manages the `selectedOptions` Master List (the single source of truth)
         and calls `calculateNextUiState` whenever selections change. Provides
         public functions for manual clicks (`setAttribute`) and AI batch updates
         (`applyExtractedFacets`).

RELATES TO OTHER FILES:
- This is the "State Manager," the heart of the app's interactivity.
- It imports its logic from `src/core/engine/configuratorEngine.ts`.
- It imports the AI's output type from `src/core/ai/genkit.ts`.
- It is imported by `src/app/layout.tsx` (to wrap the app).
- Its hook (`useConfiguratorContext`) is consumed by all "smart" features (`Configurator.tsx`, `ChatCoPilot.tsx`, `AppHeader.tsx`).

IMPORTS:
- React hooks
- calculateNextUiState, FACET_ORDER, etc. from '@/core/engine/configuratorEngine'
- ExtractedFacets from '@/core/ai/genkit'
*/

'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// --- REFACTOR: Updated import path to new 'core' structure ---
import {
    calculateNextUiState,
    FACET_ORDER,
    FACET_DEFINITIONS,
    type QuestionState,
    type Option,
    type Product,
    type FacetAttribute,
} from '@/core/engine/configuratorEngine';
// --- REFACTOR: Updated import path to new 'core' structure ---
import { type ExtractedFacets } from '@/core/ai/genkit';

// --- New Type for the Master List ---
type SelectedOptions = Record<FacetAttribute, string | null>;

// --- Helper to initialize the state ---
const getInitialSelections = (): SelectedOptions => {
    return FACET_ORDER.reduce((acc, facet) => {
        acc[facet] = null;
        return acc;
    }, {} as SelectedOptions);
};

// Define the shape of the context data
interface ConfiguratorContextType {
    selectedOptions: SelectedOptions;
    currentQuestion: QuestionState | null;
    finalProducts: Product[] | null;
    fullProductName: string;
    
    // Manual interaction function
    setAttribute: (attribute: FacetAttribute, value: string) => void;
    
    // AI interaction function (batch update)
    applyExtractedFacets: (facets: Partial<ExtractedFacets>) => void;

    reset: () => void;
}

// Create the context with a default value
const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(undefined);

// Create a custom hook to use the configurator context
export function useConfiguratorContext() {
    const context = useContext(ConfiguratorContext);
    if (!context) {
        throw new Error('useConfiguratorContext must be used within a ConfiguratorProvider');
    }
    return context;
}

// Create the provider component
export function ConfiguratorProvider({ children }: { children: ReactNode }) {
    
    // Core State variables
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(getInitialSelections);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionState | null>(null);
    const [finalProducts, setFinalProducts] = useState<Product[] | null>(null);
    const [fullProductName, setFullProductName] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);

    // --- Private Logic Function ---
    const runLogicAndSetState = useCallback((selections: SelectedOptions) => {
        console.groupCollapsed('[Context] Running Logic');
        console.time('[Context] runLogicAndSetState');
        
        // 1. Call the Smarter Brain
        const result = calculateNextUiState(selections);
        
        // 2. Set the result state
        setCurrentQuestion(result.currentQuestion);
        setFinalProducts(result.finalProducts);

        // 3. Update the full product name based on current selections
        const nameParts: string[] = [];
        FACET_ORDER.forEach(attribute => {
            const value = selections[attribute];
            if (value) {
                if (attribute === 'persiana' && value === 'nao') {
                    // Do nothing, don't add "Não" to the name
                } else if (attribute === 'persiana' && value === 'sim') {
                    nameParts.push('Persiana'); // Custom "Persiana" label
                } else { // <--- This is the corrected line 110
                    const label = FACET_DEFINITIONS[attribute]?.labelMap[value] || value;
                    nameParts.push(label);
                }
            }
        });
        setFullProductName(nameParts.join(' '));

        console.timeEnd('[Context] runLogicAndSetState');
        console.groupEnd();

    }, []);
    
    // --- Public Interaction Functions ---

    const setAttribute = useCallback((attribute: FacetAttribute, value: string) => {
        const newSelections = { ...selectedOptions, [attribute]: value };

        // Wipe out selections for all questions asked *after* this one
        const attributeIndex = FACET_ORDER.indexOf(attribute);
        FACET_ORDER.forEach((attr, index) => {
            if (index > attributeIndex) {
                newSelections[attr] = null;
            }
        });

        setSelectedOptions(newSelections);
        runLogicAndSetState(newSelections); // Run logic immediately
    }, [selectedOptions, runLogicAndSetState]);

    const applyExtractedFacets = useCallback((facets: Partial<ExtractedFacets>) => {
        let newSelections = { ...selectedOptions };
        
        // Batch update
        for (const [key, value] of Object.entries(facets)) {
            if (FACET_ORDER.includes(key as FacetAttribute) && value !== null && value !== 'null') {
                newSelections[key as FacetAttribute] = value as string;
            }
        }
        
        setSelectedOptions(newSelections);
        runLogicAndSetState(newSelections); // Run logic immediately
        
    }, [selectedOptions, runLogicAndSetState]);
    
    // --- Lifecycle and Initialization ---

    useEffect(() => {
        if (!isInitialized) {
            runLogicAndSetState(selectedOptions);
            setIsInitialized(true);
        }
    }, [isInitialized, selectedOptions, runLogicAndSetState]);


    const reset = useCallback(() => {
        const initialSelections = getInitialSelections();
        setSelectedOptions(initialSelections);
        runLogicAndSetState(initialSelections); // Run logic to show initial question
        setFullProductName('');
        setIsInitialized(true);
    }, [runLogicAndSetState]);


    // --- Context Value ---
    const value = {
        selectedOptions,
        currentQuestion,
        finalProducts,
        fullProductName,
        setAttribute,
        applyExtractedFacets,
        reset,
    };

    return (
        <ConfiguratorContext.Provider value={value}>
            {children}
        </ConfiguratorContext.Provider>
    );
}