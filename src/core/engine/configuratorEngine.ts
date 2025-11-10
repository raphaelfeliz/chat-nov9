/* *file-summary*
PATH: src/core/engine/configuratorEngine.ts
PURPOSE: The new "Smarter Brain" for the Configurator. Contains all auto-skip
         and filtering logic.
SUMMARY: Defines the question order/labels and exports the main function,
         `calculateNextUiState`. This function filters the imported
         PRODUCT_CATALOG based on user selections and applies the (0, 1, 1) rules.
RELATES TO OTHER FILES:
- This is the "Smarter Brain" logic.
- It imports its data from `src/core/engine/productDatabase.ts`.
- It is imported and used by `src/core/state/ConfiguratorContext.tsx`.
IMPORTS:
- ProductType, PRODUCT_CATALOG from '@/core/engine/productDatabase'
EXPORTS:
- Product (type)
- Option (type)
- FacetAttribute (type)
- QuestionState (type)
- EngineResult (type)
- FACET_ORDER (const)
- FACET_DEFINITIONS (const)
- calculateNextUiState (function)
- formatFacetLabelForDisplay (function)
*/

// --- REFACTOR: Updated import path to new 'core' structure ---
import {
    type Product as ProductType, // Import the type
    PRODUCT_CATALOG
} from '@/core/engine/productDatabase';

// --- Re-export the Product type so the Context can use it ---
export type Product = ProductType;

// --- Core Types for Data Consistency ---

export type Option = {
    label: string; // <-- FIX: Reverted to string, not string | null
    value: string;
    picture: string; // The image URL or path
};

// 1. DEFINES THE ORDER AND ATTRIBUTES OF QUESTIONS (FACET_ORDER)
export const FACET_ORDER = [
    'categoria',
    'sistema',
    'persiana',
    'persianaMotorizada',
    'material',
    'largura', // Range attribute
    'folhasNumber',
] as const;

// This type is exported for type safety across Context and UI
export type FacetAttribute = typeof FACET_ORDER[number];

export type QuestionState = {
    attribute: FacetAttribute;
    question: string;
    options: Option[];
};

// The result structure returned by the engine
export type EngineResult = {
    currentQuestion: QuestionState | null;
    finalProducts: Product[] | null;
};

// --- Data Definitions (Retaining Portuguese UI Text) ---

// 2. DEFINES THE QUESTION TITLES AND LABELS
export const FACET_DEFINITIONS: Record<FacetAttribute, { title: string; labelMap: Record<string, string>; labelFromValue?: string }> = {
    'categoria': {
        title: "O que você procura?",
        labelMap: { "janela": "Janela", "porta": "Porta" }
    },
    'sistema': {
        title: "Qual sistema de abertura você prefere?",
        labelMap: { "janela-correr": "Correr", "porta-correr": "Correr", "maxim-ar": "Maxim-ar", "giro": "Giro" }
    },
    'persiana': {
        title: "Precisa de persiana integrada?",
        labelMap: { "sim": "Sim", "nao": "Não" }
    },
    'persianaMotorizada': {
        title: "Persiana motorizada ou manual?",
        labelMap: { "motorizada": "Motorizada", "manual": "Manual" }
    },
    'material': {
        title: "Qual material de preenchimento você deseja?",
        labelMap: {
            "vidro": "Vidro",
            "vidro + veneziana": "Vidro e Veneziana",
            "lambri": "Lambri",
            "veneziana": "Veneziana",
            "vidro + lambri": "Vidro e Lambri"
        }
    },
    'largura': {
        title: "Qual a largura do vão?",
        labelMap: {},
        labelFromValue: "{{$}}m" // Placeholder for range formatting
    },
    'folhasNumber': {
        title: "Para este tamanho, qual o número de folhas?",
        labelMap: {},
        labelFromValue: "{{$}} folha(s)" // Placeholder for numerical formatting
    }
};

/* --sectionComment
SECTION: LABEL FORMATTING UTILITY (Phase 1.0.1)
*/

/**
 * Formats a raw facet value into a user-friendly *display name*
 * (e.g., for the final product name or WhatsApp link).
 * This function is *not* for UI option labels.
 * @param attribute The facet attribute (e.g., 'persiana')
 * @param value The raw value (e.g., 'sim')
 * @returns The formatted label (e.g., 'Persiana') or null to hide it
 */
export function formatFacetLabelForDisplay(attribute: FacetAttribute, value: string): string | null {
    // 1. Handle special formatting for specific attributes
    switch (attribute) {
        case 'largura':
            return value.replace('-', 'm a ') + 'm';
        case 'folhasNumber':
            return `${value} folha(s)`;
        
        // --- FIX: This is the special logic for the *final name* ---
        case 'persiana':
            if (value === 'nao') {
                return null; // Don't show "Não" in the final name
            }
            if (value === 'sim') {
                return 'Persiana'; // Use "Persiana" instead of "Sim"
            }
            break; 
    }

    // 2. Handle all other attributes using the labelMap
    const definition = FACET_DEFINITIONS[attribute];
    if (definition && definition.labelMap) {
        return definition.labelMap[value] || value;
    }

    // 3. Fallback to the raw value
    return value;
}


/* --sectionComment
SECTION: CORE ENGINE LOGIC
*/

// Helper to filter the catalog based on current selections
function applyFilters(selections: Record<FacetAttribute, string | null>, catalog: Product[]): Product[] {
    return catalog.filter(product => {
        return FACET_ORDER.every(attribute => {
            const selectedValue = selections[attribute];
            if (selectedValue === null) return true; // Ignore null selections

            // --- LARGURA (RANGE) LOGIC ---
            if (attribute === 'largura') {
                const [min, max] = selectedValue.split('-').map(Number);
                if (isNaN(min) || isNaN(max)) return true; // Invalid range, ignore filter
                const pMin = Number(product.minLargura);
                const pMax = Number(product.maxLargura);
                return pMin < max && min < pMax;
            }
            // --- END LARGURA LOGIC ---

            // For all other attributes (string/number)
            const productValue = product[attribute as Exclude<FacetAttribute, 'largura'>];
            if (productValue === null || productValue === undefined) return false;
            
            return productValue.toString() === selectedValue;
        });
    });
}

// Helper to get unique, valid options for a given attribute from a filtered product list
function getUniqueOptions(attribute: FacetAttribute, filteredProducts: Product[]): string[] {
    const options = new Set<string>();
    filteredProducts.forEach(p => {
        // Use bracket notation
        const value = p[attribute as Exclude<FacetAttribute, 'largura'>];
        // Exclude null values from the list of available options for presentation
        if (value !== null && value !== undefined) {
            options.add(value.toString());
        }
    });
    return Array.from(options).sort((a, b) => {
        // Try numeric sort if applicable
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b); // Default text sort
    });
}

/**
 * The core engine function. It runs the filtering and auto-skip loop internally.
 * @param selections The current state of the user's selections (the Master List).
 * @returns An EngineResult defining the next UI state (question, final products).
*/
export function calculateNextUiState(
    selections: Record<FacetAttribute, string | null>
): EngineResult {
    const LOG_SCOPE = '[Engine]';
    let currentSelections = { ...selections };
    let products = applyFilters(currentSelections, PRODUCT_CATALOG);

    // RULE 1: Check if the filtering process is complete (only 1 product remains).
    if (products.length === 1) {
        console.log(`${LOG_SCOPE} ✅ Final Product found: ${products[0].slug}`);
        return { currentQuestion: null, finalProducts: products };
    }
    
    // Check if the filtering resulted in zero products
    if (products.length === 0) {
        console.warn(`${LOG_SCOPE} ⚠️ Zero products found for current selections.`);
        return { currentQuestion: null, finalProducts: [] };
    }

    // --- Start Auto-Skip and Question Loop ---
    let loopCount = 0;
    while (loopCount < FACET_ORDER.length) {
        const attribute = FACET_ORDER[loopCount];
        
        // 1. Find Next Question: Skip attributes already filled
        if (currentSelections[attribute] !== null) {
            loopCount++;
            continue;
        }

        // 2. Find Available Options for this attribute
        let availableOptions: string[] = [];
        
        // --- LARGURA (RANGE) LOGIC (Determine available ranges) ---
        if (attribute === 'largura') {
            const breakpoints = [...new Set(products.flatMap(p => [Number(p.minLargura), Number(p.maxLargura)]))].sort((a, b) => a - b);
            for (let i = 0; i < breakpoints.length - 1; i++) {
                const min = breakpoints[i];
                const max = breakpoints[i + 1];
                if (min < max) {
                    // Check if any product *exists* within this range
                    const hasProductsInRange = products.some(p => Number(p.minLargura) < max && min < Number(p.maxLargura));
                    if (hasProductsInRange) {
                        availableOptions.push(`${min}-${max}`);
                    }
                }
            }
        } else {
            // Standard logic for all other attributes
            availableOptions = getUniqueOptions(attribute, products);
        }
        // --- END LARGURA LOGIC ---
        
        // RULE 2: Auto-skip question if there are no valid options left (0 options).
        if (availableOptions.length === 0) {
            console.log(`${LOG_SCOPE} 🔄 Skip Attribute: ${attribute} (0 options left)`);
            loopCount++;
            continue;
        }
        
        // RULE 3: Auto-select option if there is only one valid option left (1 option).
        if (availableOptions.length === 1) {
            const autoSelectedValue = availableOptions[0];
            console.log(`${LOG_SCOPE} 💡 Auto-Select: ${attribute} = ${autoSelectedValue}`);
            
            // Auto-select the value internally and CONTINUE the loop (do not stop)
            currentSelections[attribute] = autoSelectedValue; 
            
            // Re-filter products based on the new selection
            products = applyFilters(currentSelections, PRODUCT_CATALOG);

            // Re-check Rule 1 with the new filtered set
            if (products.length === 1) {
                console.log(`${LOG_SCOPE} ✅ Final Product (Auto-Select Chained): ${products[0].slug}`);
                return { currentQuestion: null, finalProducts: products };
            }
            
            loopCount++;
            continue;
        }

        // --- STOP POINT: We found a question the user must answer ( > 1 option) ---
        console.log(`${LOG_SCOPE} ✋ Stop and Ask: ${attribute} (${availableOptions.length} options)`);
        
        const definition = FACET_DEFINITIONS[attribute];
        
        // Build the QuestionState for the UI
        const questionOptions: Option[] = availableOptions.map(value => {
            // Find the first product that matches this specific option value,
            // to grab the image (Rule 4)
            const matchingProduct = products.find(p => {
                if (attribute === 'largura') {
                    const [min, max] = value.split('-').map(Number);
                    return Number(p.minLargura) < max && min < Number(p.maxLargura);
                }
                // Use bracket notation
                // @ts-ignore
                return p[attribute]?.toString() === value;
            });
            
            // --- FIX: Reverted to the original, simple label logic ---
            // This logic is for the UI buttons ("Sim", "Não", "0.7m a 1m", etc.)
            let label = definition.labelMap[value] || value;
            if (definition.labelFromValue) {
                if (attribute === 'largura') {
                    label = value.replace('-', 'm a ') + 'm';
                } else if (attribute === 'folhasNumber') {
                    label = `${value} folha(s)`;
                }
            }
            // --- END OF FIX ---

            return {
                label: label,
                value: value,
                picture: matchingProduct?.image || '/assets/placeholder.webp',
            };
        }); // <-- FIX: Removed the .filter() that was breaking the options

        return {
            currentQuestion: {
                attribute: attribute,
                question: definition.title,
                options: questionOptions,
            },
            finalProducts: null,
        };
    }
    
    // If the loop finishes without finding any remaining questions, we have a result.
    console.log(`${LOG_SCOPE} ✅ Flow Completed (All Facets Answered)`);
    return { currentQuestion: null, finalProducts: products.length > 0 ? products : null };
}