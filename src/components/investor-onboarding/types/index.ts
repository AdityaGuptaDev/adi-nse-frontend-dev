// types/menu.ts
export interface MenuItem {
    id: string;
    label: string;
    component: string;
}


export interface CanData {
    bank_list?: any[];
    bank_proof?: any[];
    gender?: any[];
    identity_type_list: any[];
    martial_status: any[];
    mobile_relation: any[];
    nominee_guardian_relationship_types: any[]
    relationship_primaryHolder: any[];
    relationship_proof: any[];
    relationship_types: any[];
    tax_status?: any[];


}

// types/index.ts
// types/index.ts
export interface StepComponentProps {
    onCompletionUpdate: (completed: boolean) => void; // Only takes completed status
    onNext: () => void;
    onPrevious: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    data: CanData;
    investorId: string;
}
