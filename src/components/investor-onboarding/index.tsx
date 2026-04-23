// app/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, CheckCircle, Loader2, Phone, RefreshCcw, Shield, Smartphone, Lock } from "lucide-react";
import Sidebar from './components/Sidebar';
import SolePrimaryHolder from './components/SolePrimaryHolder';
import CanCriteria from './components/CanCriteria'
import BankAccounts from './components/BankAccounts';
import Nominees from './components/Nominees';
import GuardianDetails from './components/GuardianDetails';
import { OnboardingService } from '@/services/onboardingService';

import {
    ADD_MEMBER, USER_DATA,
} from "@/utils/constants";
import {
    getLS,
    handleServerError,
    setLS,
    toastAlert,
} from "@/utils/helpers";
import api from "@/utils/api";

import { useRouter } from "next/navigation";
import useRegistrationStore from "@/store/userRegistrationStore";
import { CanData } from './types';
import SummaryFinalization from './components/SummaryFinalization';
import DepositoryDetails from './components/DepositorDetails';
import SoleSecondaryHolder from './components/SoleSecondaryHolder';
import StpModal from '../portfolio/modals/stpModal';
import { fetchHolderDetails } from '@/api/kyc';
import { boolean } from 'yup';

export type Step = {
    id: string;
    label: string;
    completed: boolean;
    visible: boolean;
};

const STEP_PROGRESS_KEY = "ecan-step-progress";
const CURRENT_STEP_KEY = "ecan-current-step";

export default function EcanRegistration() {
    const router = useRouter();

    let users: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);
    //let users: any = getLS(USER_DATA);


    // State management
    const [currentStep, setCurrentStep] = useState('can-criteria');
    const [listings, setListings] = useState<CanData[]>([]);
    const [investorId, setInvestorId] = useState(users?.InvestorRegistration?.id);
    const [holdingNature, setHoldingNature] = useState<string | null>(users?.InvestorRegistration.holding_nature);
    const [registrationType, setRegistrationType] = useState<string>('');

    let investorCategory = users?.InvestorRegistration?.investor_category;

    // Initialize holding nature from user data
    useEffect(() => {
        const investor = users?.InvestorRegistration;
        const holding = investor?.holding_nature;
        // setInvestorCategory(investor?.investor_category);
        setHoldingNature(holding);

        // Initialize step visibility based on holding nature
        if (holding) {
            updateStepVisibility(holding, false, '');
        }
    }, []);


    // Base steps configuration - will be dynamically updated
    const baseStepsConfig: Step[] = [
        { id: 'can-criteria', label: 'eCan Criteria', completed: false, visible: true },
        { id: 'sole-primary', label: 'Sole / Primary Holder', completed: false, visible: true },
        { id: 'sole-secondary', label: 'Secondary Holder', completed: false, visible: holdingNature === 'JO' || holdingNature === 'AS' ? true : false },
        { id: 'guardian-details', label: 'Guardian Details', completed: false, visible: investorCategory === 'M' ? true : false },
        { id: 'bank-accounts', label: 'Bank Accounts', completed: false, visible: true },
        { id: 'nominees', label: 'Nominees', completed: false, visible: true },
        { id: 'depository-details', label: 'Depository Details', completed: false, visible: false },
        { id: 'summary-view', label: 'Summary View', completed: false, visible: true },
    ];

    const [steps, setSteps] = useState<Step[]>(baseStepsConfig);


    // Update step visibility based on selections
    const updateStepVisibility = useCallback((
        holdingNature: string,
        isMinor: boolean,
        regType: string
    ) => {
        setSteps(prev => prev.map(step => {

            console.log("Step ID", step.id)
            switch (step.id) {
                case 'sole-secondary':
                    // Show for Joint (JO) or Association (AS)
                    return {
                        ...step,
                        visible: holdingNature === 'JO' || holdingNature === 'AS'
                    };

                case 'guardian-details':
                    // Show for minors
                    return {
                        ...step,
                        visible: isMinor
                    };

                case 'depository-details':
                    // Show based on registration type
                    return {
                        ...step,
                        visible: regType === 'D'
                    };

                default:
                    return step;
            }
        }));
    }, []);

    // Handle minor status change
    const handleMinorStatusChange = useCallback((value: string) => {

        console.log("On Minor Change", value)
        setSteps(prev => prev.map(step =>
            step.id === 'guardian-details'
                ? { ...step, visible: value == 'M' ? true : false }
                : step
        ));
    }, []);

    // Handle joint status change
    const handleJointStatusChange = useCallback((value: string) => {
        setSteps(prev => prev.map(step =>
            step.id === 'sole-secondary'
                ? { ...step, visible: value !== 'SI' } // Show if not Single (SI)
                : step
        ));
    }, []);

    // Handle registration type change
    const handleRegTypeChange = useCallback((value: string) => {
        setRegistrationType(value);
        setSteps(prev => prev.map(step =>
            step.id === 'depository-details'
                ? { ...step, visible: value === 'D' }
                : step
        ));
    }, []);

    // Get visible steps
    const visibleSteps = useMemo(() => {

        return steps
            .map(step => {
                if (typeof step.visible !== 'boolean') {
                    console.warn(`Step "${step.id}" had invalid visible value:`, step.visible);
                    return { ...step, visible: Boolean(step.visible) }; // convert to true/false
                } else {
                    //console.log("Steps visible", step.visible)
                }
                return step;
            })
            .filter(step => step.visible); // only keep visible steps
    }, [steps]);

    console.log("Visible Steps :----", visibleSteps);


    // Find current step index among visible steps
    const currentVisibleStepIndex = useMemo(() =>
        visibleSteps.findIndex(step => step.id === currentStep),
        [currentStep, visibleSteps]
    );

    // Navigation helpers
    const isFirstStep = currentVisibleStepIndex === 0;
    const isLastStep = currentVisibleStepIndex === visibleSteps.length - 1;

    // Load saved progress and initialize from API
    useEffect(() => {
        const getUser: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);

        // Set investor ID
        setInvestorId(getUser?.InvestorRegistration?.id);

        // Load API data
        const loadListings = async () => {
            try {
                const res = await api.get(`/kyc/on-boarding-listings`);
                console.log(res)
                if (res?.data?.data) {
                    setListings(res.data.data);
                }
            } catch (err) {
                handleServerError(err);
            }
        };

        loadListings();

        // Set initial step from API
        const apiCurrentStep = getUser?.InvestorRegistration?.next_kyc_step || 'can-criteria';

        // Mark steps before current as completed
        const updatedSteps = steps.map((step, index) => {
            const stepIndex = visibleSteps.findIndex(vs => vs.id === step.id);
            return {
                ...step,
                completed: stepIndex < currentVisibleStepIndex
            };
        });

        setSteps(updatedSteps);
        setCurrentStep(apiCurrentStep);

    }, []);

    // Update step completion
    const updateStepCompletion = useCallback((stepId: string, completed: boolean) => {
        setSteps(prev => prev.map(step =>
            step.id === stepId ? { ...step, completed } : step
        ));
    }, []);

    // Create completion handlers
    const canCriteriaCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('can-criteria', completed);
    }, [updateStepCompletion]);

    const solePrimaryCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('sole-primary', completed);
    }, [updateStepCompletion]);

    const soleSecondaryCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('sole-secondary', completed);
    }, [updateStepCompletion]);

    const bankAccountsCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('bank-accounts', completed);
    }, [updateStepCompletion]);

    const nomineesCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('nominees', completed);
    }, [updateStepCompletion]);

    const guardianCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('guardian-details', completed);
    }, [updateStepCompletion]);

    const depositoryCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('depository-details', completed);
    }, [updateStepCompletion]);

    const summaryCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('summary-view', completed);
    }, [updateStepCompletion]);

    // Navigation functions
    const goToNextStep = useCallback(() => {
        if (!isLastStep) {


            const nextStep = visibleSteps[currentVisibleStepIndex + 1];
            console.log(visibleSteps)
            setCurrentStep(nextStep.id);
        } else {
            handleFormSubmit();
        }
    }, [currentVisibleStepIndex, isLastStep, visibleSteps]);

    const goToPreviousStep = useCallback(() => {
        if (!isFirstStep) {
            const prevStep = visibleSteps[currentVisibleStepIndex - 1];
            setCurrentStep(prevStep.id);
        }
    }, [currentVisibleStepIndex, isFirstStep, visibleSteps]);

    // Safety net: the Summary step owns the real CAN-creation submit and
    // navigates to /can-onboarding itself. If somehow goToNextStep fires on
    // the last step (e.g. keyboard Enter on a stale Next button) we just
    // forward there instead of showing a blocking alert + wiping state.
    const handleFormSubmit = () => {
        router.push('/can-onboarding');
    };

    // Handle step click from sidebar
    const handleStepClick = useCallback((stepId: string) => {
        // Only allow navigation to completed steps or current step
        const step = steps.find(s => s.id === stepId);
        if (step && (step.completed || step.id === currentStep)) {
            setCurrentStep(stepId);
        }
    }, [currentStep, steps]);

    // Render current step
    const renderStep = useMemo(() => {
        const commonProps = {
            onNext: goToNextStep,
            onPrevious: goToPreviousStep,
            isFirstStep,
            isLastStep,
            data: listings as any,
            investorId: investorId,
        };

        switch (currentStep) {
            case 'can-criteria':
                return <CanCriteria
                    {...commonProps}
                    onCompletionUpdate={canCriteriaCompletionUpdate}
                    onMinorStatusChange={handleMinorStatusChange}
                    onJointStatusChange={handleJointStatusChange}
                    onChangeRegType={handleRegTypeChange}
                />;

            case 'sole-primary':
                return <SolePrimaryHolder
                    {...commonProps}
                    onCompletionUpdate={solePrimaryCompletionUpdate}
                />;

            case 'sole-secondary':
                return <SoleSecondaryHolder
                    {...commonProps}
                    onCompletionUpdate={soleSecondaryCompletionUpdate}
                />;

            case 'bank-accounts':
                return <BankAccounts
                    {...commonProps}
                    onCompletionUpdate={bankAccountsCompletionUpdate}
                />;

            case 'nominees':
                return <Nominees
                    {...commonProps}
                    onCompletionUpdate={nomineesCompletionUpdate}
                />;

            case 'guardian-details':
                return <GuardianDetails
                    {...commonProps}
                    onCompletionUpdate={guardianCompletionUpdate}
                />;

            case 'summary-view':
                return <SummaryFinalization
                    {...commonProps}
                    onCompletionUpdate={summaryCompletionUpdate}
                />;

            case 'depository-details':
                return <DepositoryDetails
                    {...commonProps}
                    onCompletionUpdate={depositoryCompletionUpdate}
                />;

            default:
                return <SolePrimaryHolder
                    {...commonProps}
                    onCompletionUpdate={solePrimaryCompletionUpdate}
                />;
        }
    }, [
        currentStep,
        goToNextStep,
        goToPreviousStep,
        isFirstStep,
        isLastStep,
        listings,
        investorId,
        canCriteriaCompletionUpdate,
        solePrimaryCompletionUpdate,
        soleSecondaryCompletionUpdate,
        bankAccountsCompletionUpdate,
        nomineesCompletionUpdate,
        guardianCompletionUpdate,
        depositoryCompletionUpdate,
        summaryCompletionUpdate,
        handleMinorStatusChange,
        handleJointStatusChange,
        handleRegTypeChange,
    ]);

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* MAIN CONTENT */}
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* RESPONSIVE LAYOUT: STACK ON MOBILE, SIDE-BY-SIDE ON DESKTOP */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - shows only visible steps */}
                    <div className="w-full lg:w-90 flex-shrink-0">
                        <Sidebar
                            steps={steps.filter(step => step.visible)}
                            currentStep={currentStep}
                            onStepClick={handleStepClick}
                        />
                    </div>

                    {/* Content Card */}
                    <div className="flex-1">
                        <div className="bg-gradient-to-br from-[#111111] to-[#1F1A1A] rounded-xl shadow-xl border border-[#2A2A2A] p-4 sm:p-6">
                            {renderStep}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}