export type Option = {
    label: string;
    value: string;
    picture: string;
    sku?: string;
    url?: string;
};

export type QuestionState = {
    stateID: string;
    question: string;
    options: Option[];
};

export class TriageMachine {
    private questionState: QuestionState;

    constructor() {
        this.questionState = this.root();
    }

    public getState(): QuestionState {
        return JSON.parse(JSON.stringify(this.questionState));
    }

    public reset(): QuestionState {
        this.questionState = this.root();
        return this.getState();
    }

    private root(): QuestionState {
        return {
            stateID: "root",
            question: "O que você busca?",
            options: [
                { label: "Janela", value: "janela", picture: "/assets/images/janela_de_correr_2folhas_manual.webp" },
                { label: "Porta", value: "porta", picture: "/assets/images/porta_de_correr_2folhas_persiana_integrada_motorizada.webp" },
            ]
        };
    }

    private askJanelaSystem(): QuestionState {
        return {
            stateID: "askJanelaSystem",
            question: "Qual o sistema de abertura da janela?",
            options: [
                { label: "Correr", value: "janela-correr", picture: "/assets/images/janela_de_correr_2folhas_persiana-integrada_motorizada.webp" },
                { label: "Maxim-ar", value: "maxim-ar", picture: "/assets/images/janela_maximar_1modulo.webp" }
            ]
        };
    }

    private askPortaSystem(): QuestionState {
        return {
            stateID: "askPortaSystem",
            question: "Qual o sistema de abertura da porta?",
            options: [
                { label: "Correr", value: "porta-correr", picture: "/assets/images/porta_de_correr_2folhas_persiana_integrada_motorizada.webp" },
                { label: "Giro", value: "giro", picture: "/assets/images/porta_de_giro_1folha_lambris.webp" }
            ]
        };
    }

    private askJanelaCorrerPersiana(): QuestionState {
        return {
            stateID: "askJanelaCorrerPersiana",
            question: "Você quer com persiana integrada?",
            options: [
                { label: "Sim", value: "sim", picture: "/assets/images/janela_de_correr_2folhas_persiana-integrada_motorizada.webp" },
                { label: "Não", value: "nao", picture: "/assets/images/janela_de_correr_2folhas_manual.webp" }
            ]
        };
    }

    private askJanelaMaximarFolhas(): QuestionState {
        return {
            stateID: "askJanelaMaximarFolhas",
            question: "Com quantos módulos (folhas)?",
            options: [
                { label: "1 Módulo", value: "1", picture: "/assets/images/janela_maximar_1modulo.webp", sku: "J-MAX-VIDRO-008", url: "/product/J-MAX-VIDRO-008" },
                { label: "2 Módulos", value: "2", picture: "/assets/images/janela_maximar_2modulos.webp", sku: "J-MAX-VIDRO-009", url: "/product/J-MAX-VIDRO-009" },
                { label: "3 Módulos", value: "3", picture: "/assets/images/janela_maximar_3modulos.webp", sku: "J-MAX-VIDRO-010", url: "/product/J-MAX-VIDRO-010" }
            ]
        };
    }

    private askPortaCorrerPersiana(): QuestionState {
        return {
            stateID: "askPortaCorrerPersiana",
            question: "Você quer com persiana integrada?",
            options: [
                { label: "Sim", value: "sim", picture: "/assets/images/porta_de_correr_2folhas_persiana_integrada_motorizada.webp" },
                { label: "Não", value: "nao", picture: "/assets/images/porta_de_correr_2folhas_manual.webp" }
            ]
        };
    }

    private askPortaGiroMaterial(): QuestionState {
        return {
            stateID: "askPortaGiroMaterial",
            question: "Qual o material de preenchimento da porta?",
            options: [
                { label: "Lambri (Painel Fechado)", value: "lambri", picture: "/assets/images/porta_de_giro_1folha_lambris.webp" },
                { label: "Veneziana (Ventilada)", value: "veneziana", picture: "/assets/images/porta_de_giro_1folha_veneziana.webp" },
                { label: "Vidro", value: "vidro", picture: "/assets/images/porta_de_giro_1folha_vidro.webp" },
                { label: "Metade Vidro, Metade Lambri", value: "vidro + lambri", picture: "/assets/images/porta_de_giro_1folha_metade_lambris.webp" },
                { label: "Metade Vidro, Metade Veneziana", value: "vidro + veneziana", picture: "/assets/images/porta_de_giro_1folha_metade_veneziana.webp" }
            ]
        };
    }

    private askJanelaCorrerPersianaTipo(): QuestionState {
        return {
            stateID: "askJanelaCorrerPersianaTipo",
            question: "A persiana deve ser motorizada ou manual?",
            options: [
                { label: "Motorizada", value: "motorizada", picture: "/assets/images/janela_de_correr_2folhas_persiana-integrada_motorizada.webp", sku: "J-COR-VIDRO-PERS-MOT-001", url: "/product/J-COR-VIDRO-PERS-MOT-001" },
                { label: "Manual", value: "manual", picture: "/assets/images/janela_de_correr_2folhas_persiana_manual.webp", sku: "J-COR-VIDRO-PERS-MAN-002", url: "/product/J-COR-VIDRO-PERS-MAN-002" }
            ]
        };
    }

    private askJanelaCorrerSemPersianaMaterial(): QuestionState {
        return {
            stateID: "askJanelaCorrerSemPersianaMaterial",
            question: "Qual o material de preenchimento?",
            options: [
                { label: "Apenas Vidro", value: "vidro", picture: "/assets/images/janela_de_correr_2folhas_manual.webp" },
                { label: "Vidro + Veneziana", value: "vidro + veneziana", picture: "/assets/images/janela_de_correr_2folhas_veneziana.webp" }
            ]
        };
    }

    private askPortaCorrerPersianaTipo(): QuestionState {
        return {
            stateID: "askPortaCorrerPersianaTipo",
            question: "A persiana deve ser motorizada ou manual?",
            options: [
                { label: "Motorizada", value: "motorizada", picture: "/assets/images/porta_de_correr_2folhas_persiana_integrada_motorizada.webp", sku: "P-COR-VIDRO-PERS-MOT-011", url: "/product/P-COR-VIDRO-PERS-MOT-011" },
                { label: "Manual", value: "manual", picture: "/assets/images/porta_de_correr_2folhas_persiana_integrada_manual.webp", sku: "P-COR-VIDRO-PERS-MAN-012", url: "/product/P-COR-VIDRO-PERS-MAN-012" }
            ]
        };
    }

    private askPortaCorrerSemPersianaMaterial(): QuestionState {
        return {
            stateID: "askPortaCorrerSemPersianaMaterial",
            question: "Qual o material de preenchimento?",
            options: [
                { label: "Apenas Vidro", value: "vidro", picture: "/assets/images/porta_de_correr_2folhas_manual.webp" },
                { label: "Vidro + Veneziana", value: "vidro + veneziana", picture: "/assets/images/porta_de_correr_2folhas_veneziana.webp" }
            ]
        };
    }

    private askPortaGiroFolhas(materialValue: string, stateID: string): QuestionState {
        const optionsMap: { [key: string]: Option[] } = {
            "lambri": [
                { label: "1 Folha", value: "1", picture: "/assets/images/porta_de_giro_1folha_lambris.webp", sku: "P-GIR-LAM-018", url: "/product/P-GIR-LAM-018" },
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_giro_2folhas_lambris.webp", sku: "P-GIR-LAM-019", url: "/product/P-GIR-LAM-019" }
            ],
            "veneziana": [
                { label: "1 Folha", value: "1", picture: "/assets/images/porta_de_giro_1folha_veneziana.webp", sku: "P-GIR-VEN-020", url: "/product/P-GIR-VEN-020" },
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_giro_2folhas_veneziana.webp", sku: "P-GIR-VEN-021", url: "/product/P-GIR-VEN-021" }
            ],
            "vidro": [
                { label: "1 Folha", value: "1", picture: "/assets/images/porta_de_giro_1folha_vidro.webp", sku: "P-GIR-VIDRO-022", url: "/product/P-GIR-VIDRO-022" },
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_giro_2folhas_vidro.webp", sku: "P-GIR-VIDRO-023", url: "/product/P-GIR-VIDRO-023" }
            ],
            "vidro + lambri": [
                { label: "1 Folha", value: "1", picture: "/assets/images/porta_de_giro_1folha_metade_lambris.webp", sku: "P-GIR-MVL-024", url: "/product/P-GIR-MVL-024" },
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_giro_2folhas_metade_lambris.webp", sku: "P-GIR-MVL-025", url: "/product/P-GIR-MVL-025" }
            ],
            "vidro + veneziana": [
                { label: "1 Folha", value: "1", picture: "/assets/images/porta_de_giro_1folha_metade_veneziana.webp", sku: "P-GIR-MVV-026", url: "/product/P-GIR-MVV-026" },
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_giro_2folhas_metade_veneziana.webp", sku: "P-GIR-MVV-027", url: "/product/P-GIR-MVV-027" }
            ]
        };
        return {
            stateID: stateID,
            question: "Com 1 ou 2 folhas?",
            options: optionsMap[materialValue] || []
        };
    }

    private askJanelaCorrerVidroFolhas(): QuestionState {
        return {
            stateID: "askJanelaCorrerVidroFolhas",
            question: "Com quantas folhas (partes)?",
            options: [
                { label: "2 Folhas", value: "2", picture: "/assets/images/janela_de_correr_2folhas_manual.webp", sku: "J-COR-VIDRO-003", url: "/product/J-COR-VIDRO-003" },
                { label: "3 Folhas", value: "3", picture: "/assets/images/janela_de_correr_3folhas_manual.webp", sku: "J-COR-VIDRO-004", url: "/product/J-COR-VIDRO-004" },
                { label: "4 Folhas", value: "4", picture: "/assets/images/janela_de_correr_4folhas_manual.webp", sku: "J-COR-VIDRO-005", url: "/product/J-COR-VIDRO-005" }
            ]
        };
    }

    private askJanelaCorrerVeneFolhas(): QuestionState {
        return {
            stateID: "askJanelaCorrerVeneFolhas",
            question: "Com quantas folhas (partes)?",
            options: [
                { label: "3 Folhas", value: "3", picture: "/assets/images/janela_de_correr_2folhas_veneziana.webp", sku: "J-COR-VIDRO-VEN-006", url: "/product/J-COR-VIDRO-VEN-006" },
                { label: "6 Folhas", value: "6", picture: "/assets/images/janela_de_correr_6folhas_veneziana.webp", sku: "J-COR-VIDRO-VEN-007", url: "/product/J-COR-VIDRO-VEN-007" }
            ]
        };
    }

    private askPortaCorrerVidroFolhas(): QuestionState {
        return {
            stateID: "askPortaCorrerVidroFolhas",
            question: "Com quantas folhas (partes)?",
            options: [
                { label: "2 Folhas", value: "2", picture: "/assets/images/porta_de_correr_2folhas_manual.webp", sku: "P-COR-VIDRO-013", url: "/product/P-COR-VIDRO-013" },
                { label: "3 Folhas", value: "3", picture: "/assets/images/porta_de_correr_3folhas_manual.webp", sku: "P-COR-VIDRO-014", url: "/product/P-COR-VIDRO-014" },
                { label: "4 Folhas", value: "4", picture: "/assets/images/porta_de_correr_4folhas_manual.webp", sku: "P-COR-VIDRO-015", url: "/product/P-COR-VIDRO-015" }
            ]
        };
    }

    private askPortaCorrerVeneFolhas(): QuestionState {
        return {
            stateID: "askPortaCorrerVeneFolhas",
            question: "Com quantas folhas (partes)?",
            options: [
                { label: "3 Folhas", value: "3", picture: "/assets/images/porta_de_correr_2folhas_veneziana.webp", sku: "P-COR-VIDRO-VEN-016", url: "/product/P-COR-VIDRO-VEN-016" },
                { label: "6 Folhas", value: "6", picture: "/assets/images/porta_de_correr_6folhas_veneziana.webp", sku: "P-COR-VIDRO-VEN-017", url: "/product/P-COR-VIDRO-VEN-017" }
            ]
        };
    }

    public triage(index: number): { sku: string } | QuestionState | null {
        const option = this.questionState.options[index];
        if (!option) {
            console.error(`Invalid option index: ${index}`);
            return this.getState();
        }

        const currentState = this.questionState.stateID;

        if (option.sku) {
            return { sku: option.sku };
        }

        if (currentState === "root") {
            if (option.value === "janela") { this.questionState = this.askJanelaSystem(); }
            else if (option.value === "porta") { this.questionState = this.askPortaSystem(); }
        }
        else if (currentState === "askJanelaSystem") {
            if (option.value === "janela-correr") { this.questionState = this.askJanelaCorrerPersiana(); }
            else if (option.value === "maxim-ar") { this.questionState = this.askJanelaMaximarFolhas(); }
        }
        else if (currentState === "askPortaSystem") {
            if (option.value === "porta-correr") { this.questionState = this.askPortaCorrerPersiana(); }
            else if (option.value === "giro") { this.questionState = this.askPortaGiroMaterial(); }
        }
        else if (currentState === "askJanelaCorrerPersiana") {
            if (option.value === "sim") { this.questionState = this.askJanelaCorrerPersianaTipo(); }
            else if (option.value === "nao") { this.questionState = this.askJanelaCorrerSemPersianaMaterial(); }
        }
        else if (currentState === "askPortaCorrerPersiana") {
            if (option.value === "sim") { this.questionState = this.askPortaCorrerPersianaTipo(); }
            else if (option.value === "nao") { this.questionState = this.askPortaCorrerSemPersianaMaterial(); }
        }
        else if (currentState === "askPortaGiroMaterial") {
            const nextStateID = `askPortaGiroFolhas_${option.value.replace(' + ', '_')}`;
            this.questionState = this.askPortaGiroFolhas(option.value, nextStateID);
        }
        else if (currentState === "askJanelaCorrerSemPersianaMaterial") {
            if (option.value === "vidro") { this.questionState = this.askJanelaCorrerVidroFolhas(); }
            else if (option.value === "vidro + veneziana") { this.questionState = this.askJanelaCorrerVeneFolhas(); }
        }
        else if (currentState === "askPortaCorrerSemPersianaMaterial") {
            if (option.value === "vidro") { this.questionState = this.askPortaCorrerVidroFolhas(); }
            else if (option.value === "vidro + veneziana") { this.questionState = this.askPortaCorrerVeneFolhas(); }
        } else {
             return null;
        }

        return this.getState();
    }
}
