/*
*file-summary*
PATH: src/context/ConfiguratorContext.tsx
PURPOSE: Centralize and expose configurator state using the new Smart Engine.
SUMMARY: Manages the `selectedOptions` Master List (the single source of truth)
         and calls `calculateNextUiState` whenever selections change. Provides
         public functions for manual clicks (`setAttribute`) and AI batch updates
         (`applyExtractedFacets`).
IMPORTS: React hooks, and the new engine/types.
EXPORTS: ConfiguratorProvider, useConfiguratorContext (custom hook).
*/

'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
    calculateNextUiState,
    FACET_ORDER,
    FACET_DEFINITIONS,
    type QuestionState,
    type Option,
    type Product,
    type FacetAttribute,
} from '@/lib/configuratorEngine';
// <-- FIX 3: Corrected import name to match genkit.ts
import { type ExtractedFacets } from '@/ai/genkit';

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
    
    // Manual interaction function (replaces selectOption(index))
    setAttribute: (attribute: FacetAttribute, value: string) => void;
    
    // AI interaction function (batch update)
    // <-- FIX 3: Update type here as well
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

    // This function takes the current selections and asks the Smarter Brain what to do next.
    // It is triggered on load, manual click, and AI batch update.
    const runLogicAndSetState = useCallback((selections: SelectedOptions) => {
        console.groupCollapsed('[Context] Running Logic');
        console.time('[Context] runLogicAndSetState');
        
        // 1. Call the Smarter Brain (it handles all filtering and auto-skips)
        const result = calculateNextUiState(selections);
        
        // 2. The Smarter Brain returns the final state it landed on
        setCurrentQuestion(result.currentQuestion);
        setFinalProducts(result.finalProducts);

        // 3. Update the full product name based on current selections
        // *** THIS IS THE PORTED "SMART NAME" LOGIC ***
        const nameParts: string[] = [];
        FACET_ORDER.forEach(attribute => {
            const value = selections[attribute];
            if (value) {
                // Apply the exact same custom logic from the old file
                if (attribute === 'persiana' && value === 'nao') {
                    // Do nothing, don't add "Não" to the name
                } else if (attribute === 'persiana' && value === 'sim') {
                    nameParts.push('Persiana'); // Custom "Persiana" label
                } else {
                    // Standard label lookup from our new definitions file
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

    /**
     * Public function for manual UI interaction (replaces the old selectOption(index)).
     * @param attribute The facet key (e.g., 'categoria').
     * @param value The selected value (e.g., 'janela').
     */
    const setAttribute = useCallback((attribute: FacetAttribute, value: string) => {
        const newSelections = { ...selectedOptions, [attribute]: value };

        // Wipe out selections for all questions asked *after* this one in the FACET_ORDER,
        // ensuring the state machine starts clean from the current question forward.
        const attributeIndex = FACET_ORDER.indexOf(attribute);
        FACET_ORDER.forEach((attr, index) => {
            if (index > attributeIndex) {
                newSelections[attr] = null;
            }
        });

        setSelectedOptions(newSelections);
        runLogicAndSetState(newSelections); // Run logic immediately
    }, [selectedOptions, runLogicAndSetState]);

    /**
     * Public function for AI interaction (single batch update).
     * @param facets The JSON form from the AI (e.g., {categoria: 'janela', sistema: 'janela-correr'}).
     */
    // <-- FIX 3: Update type here as well
    const applyExtractedFacets = useCallback((facets: Partial<ExtractedFacets>) => {
        let newSelections = { ...selectedOptions };
        
        // Batch update: Overwrite all non-null values from the AI into the Master List
        for (const [key, value] of Object.entries(facets)) {
            // Ensure the key is a valid attribute
            if (FACET_ORDER.includes(key as FacetAttribute) && value !== null && value !== 'null') {
                newSelections[key as FacetAttribute] = value as string;
            }
        }
        
        setSelectedOptions(newSelections);
        runLogicAndSetState(newSelections); // Run logic immediately after batch update
        
    }, [selectedOptions, runLogicAndSetState]);
    
    // --- Lifecycle and Initialization ---

    // 1. Run the initial logic when the component mounts
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
        setAttribute, // <-- Renamed
        applyExtractedFacets, // <-- New
        reset,
    };

    return (
        <ConfiguratorContext.Provider value={value}>
            {children}
        </ConfiguratorContext.Provider>
    );
}