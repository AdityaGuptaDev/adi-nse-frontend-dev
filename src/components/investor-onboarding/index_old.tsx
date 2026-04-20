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


export type Step = {
    id: string;
    label: string;
    completed: boolean;
    visible: boolean;
};





const STEP_PROGRESS_KEY = "ecan-step-progress";
const CURRENT_STEP_KEY = "ecan-current-step";


export default function EcanRegistration() {

    let users: any = getLS(USER_DATA);


    let HoldingNature: string | null = null;

    const investor = users?.InvestorRegistration;
    HoldingNature = investor?.holding_nature
    console.log("Holding Nature", HoldingNature)

    //visible: HoldingNature === "JO" || HoldingNature === "AS" ? true : false,


    const stepsConfig: Step[] = [
        { id: 'can-criteria', label: 'eCan Criteria', completed: HoldingNature ? true : false, visible: true },
        { id: 'sole-primary', label: 'Sole / Primary Holder', completed: false, visible: true },
        {
            id: 'sole-secondary',
            label: 'Secondary Holder',
            completed: false,
            visible: false


        },
        { id: 'guardian-details', label: 'Guardian Details', completed: false, visible: false },
        { id: 'bank-accounts', label: 'Bank Accounts', completed: false, visible: true },
        { id: 'nominees', label: 'Nominees', completed: false, visible: true },
        { id: 'depository-details', label: 'Depository Details', completed: false, visible: false },
        { id: 'summary-view', label: 'Summary View', completed: false, visible: true },
    ];

    const addressRef = useRef<any>(null);
    const router = useRouter();


    const [currentScreen, setCurrentScreen] = useState<'verification' | 'registration'>('registration');
    const [currentStep, setCurrentStep] = useState('can-criteria');
    // const [steps, setSteps] = useState<Step[]>(stepsConfig);
    const [error, setError] = useState('');
    const [listings, setListings] = useState<CanData[]>([])
    const [investorId, setInvestorId] = useState(users?.InvestorRegistration?.id)
    const [isMinor, setIsMinor] = useState(false);
    const [isJoint, setIsJoint] = useState(false);

    const [steps, setSteps] = useState<Step[]>(() => {
        const saved = getLS(STEP_PROGRESS_KEY);
        return saved || stepsConfig;
    });

    /*useEffect(() => {
        const savedStep = getLS(CURRENT_STEP_KEY);
        if (savedStep) setCurrentStep(savedStep);
    }, []);*/


    /*useEffect(() => {
        setLS(STEP_PROGRESS_KEY, steps);
    }, [steps]);*/

    /*useEffect(() => {
        setLS(CURRENT_STEP_KEY, currentStep);
    }, [currentStep]);*/

    useEffect(() => {
        let getUser: any = null;
        if (getLS("INVESTOR_DATA")) {
            getUser = getLS("INVESTOR_DATA");
        } else {
            getUser = getLS(USER_DATA);
        }

        //let getUser: any = getLS(USER_DATA);
        let isMember = getLS(ADD_MEMBER)

        setInvestorId(getUser?.InvestorRegistration?.id)
        // console.log("investorid=======", getUser?.InvestorRegistration?.id)

        // console.log("getUser", getUser)

        //let step = isMember ? getUser?.InvestorRegistration?.last_kyc_step : getUser?.InvestorRegistration?.last_kyc_step || 2
        //setCurrentStep(getUser?.InvestorRegistration?.next_kyc_step)

        //let stepss = steps.filter(step => step.visible == true)
        //setSteps(stepss)
        /*setCurrentStep(step == 1 ? 'can-criteria' : getUser?.InvestorRegistration?.next_kyc_step)
        */

        /*setSteps(prev => {
            const updated = prev.map(steps =>
                steps.id === getUser?.InvestorRegistration?.last_kyc_step ? { ...steps, completed: true } : steps
            );

            return updated;
        });
        setSteps(stepsConfig);*/

        // 1. Filter visible steps
        const visibleSteps = stepsConfig.filter(step => step.visible === true);

        // 2. Get current step from API
        const currentStep = getUser?.InvestorRegistration?.next_kyc_step || 'can-criteria';

        // 3. Find index of current step
        const currentStepIndex = visibleSteps.findIndex(step => step.id === currentStep);

        // 4. Mark all steps BEFORE current step as completed
        const updatedSteps = visibleSteps.map((step, index) => ({
            ...step,
            completed: index < currentStepIndex,  // all before current are completed
        }));

        // 5. Update UI
        setSteps(updatedSteps);
        setCurrentStep(currentStep);
    }, [])

    useEffect(() => {
        const user: any = getLS(USER_DATA);
        const memberFlag: any = getLS(ADD_MEMBER);

        (async () => {
            try {
                const res = await api.get(`/kyc/on-boarding-listings`);
                if (res?.data?.data) {
                    const list = res?.data?.data;
                    setListings(list);
                }
            } catch (err) {
                handleServerError(err);
            }
        })();
    }, []);





    const currentStepIndex = steps.findIndex(step => step.id === currentStep && step.visible == true);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    // FIX: Memoize updateStepCompletion with useCallback
    /*const updateStepCompletion = useCallback((stepId: string, completed: boolean) => {
        setSteps(prev => prev.map(step =>
            step.id === stepId ? { ...step, completed } : step
        ));
    }, []);*/

    const updateStepCompletion = useCallback((stepId: string, completed: boolean) => {
        setSteps(prev => {
            const updated = prev.map(step =>
                step.id === stepId ? { ...step, completed } : step
            );
            //setLS(STEP_PROGRESS_KEY, updated);
            return updated;
        });
    }, []);

    // FIX: Create all step completion handlers outside of render function
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
    }, [updateStepCompletion])

    /*const proofUploadCompletionUpdate = useCallback((completed: boolean) => {
        updateStepCompletion('proof-upload', completed);
    }, [updateStepCompletion]);*/

    const goToNextStep = useCallback(() => {
        console.log("Current index", currentStepIndex)
        if (!isLastStep) {
            const nextStep = steps[currentStepIndex + 1];
            setCurrentStep(nextStep.id);
        } else {
            handleFormSubmit();
        }
    }, [currentStepIndex, isLastStep, steps]);

    const goToPreviousStep = useCallback(() => {

        //console.log("Stepss", stepss)

        console.log("Previous :-- ", currentStep)
        if (!isFirstStep) {
            const prevStep = steps[currentStepIndex - 1];
            setCurrentStep(prevStep.id);

            /*if (steps[currentStepIndex - 1].visible == true) {
                const prevStep = steps[currentStepIndex - 2];
                setCurrentStep(prevStep.id);
            } else {
                // setCurrentStep(currentStepIndex - 1);

            }*/
        }
    }, [currentStepIndex, isFirstStep, steps]);

    // Get previous completed visible step
    /* const getPreviousCompletedStep = (steps: Step[], currentIndex: number) => {
         for (let i = currentIndex - 1; i >= 0; i--) {
             if (steps[i].completed && steps[i].visible) {
                 return steps[i].id;
             }
         }
         return null;
     };
 
     // Get next visible step
     const getNextVisibleStep = (steps: Step[], currentIndex: number) => {
         for (let i = currentIndex + 1; i < steps.length; i++) {
             if (steps[i].visible) return steps[i].id;
         }
         return null;
     };
 
 
     // ---- UPDATED goToNextStep ----
     const goToNextStep = useCallback(() => {
         if (!isLastStep) {
             const nextStepId = getNextVisibleStep(steps, currentStepIndex);
             if (nextStepId) {
                 setCurrentStep(nextStepId);
             }
         } else {
             handleFormSubmit();
         }
     }, [currentStepIndex, isLastStep, steps]);
 
 
     // ---- UPDATED goToPreviousStep ----
     const goToPreviousStep = useCallback(() => {
         console.log("Previous Codes")
         const prevStepId = getPreviousCompletedStep(steps, currentStepIndex);
         if (prevStepId) {
             setCurrentStep(prevStepId);
         }
     }, [currentStepIndex, steps]);*/


    const handleFormSubmit = () => {
        alert('eCAN Registration submitted successfully!');
        // R
        //localStorage.removeItem('ecan-current-step');
        //localStorage.removeItem('ecan-verified-phone');
        setCurrentStep('can-criteria');
        setSteps(stepsConfig);
        //setCurrentScreen('verification');
        // setUserData({ phone: '', errors: { phone: '' } });
    };

    const setMinor = (value: any) => {
        setSteps(prev =>
            prev.map(step => {
                if (step.id === 'guardian-details') {
                    return { ...step, visible: value == "M" };
                }
                return step; // keep all other steps same
            })
        );
    };

    const setJoint = (value: string) => {
        console.log("Joint Value", value)

        setSteps(prev =>
            prev.map(step =>
                step.id === 'sole-secondary'
                    ? { ...step, visible: value !== 'SI' } // show if NOT SI
                    : step
            )
        );
    };


    const setRegType = (value: any) => {

        setSteps(prev =>
            prev.map(step => {
                if (step.id === 'depository-details') {
                    return { ...step, visible: value === 'D' };
                }
                return step; // keep all other steps same
            })
        );
    };

    // FIX: Use useMemo for renderStep to prevent unnecessary re-renders
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
                return <CanCriteria {...commonProps} onCompletionUpdate={canCriteriaCompletionUpdate} onMinorStatusChange={(value) => setMinor(value)}
                    onJointStatusChange={(value) => setJoint(value)} onChangeRegType={(value: any) => setRegType(value)} />;

            case 'sole-primary':
                return <SolePrimaryHolder {...commonProps} onCompletionUpdate={solePrimaryCompletionUpdate} />;

            case 'sole-secondary':
                return <SoleSecondaryHolder {...commonProps} onCompletionUpdate={soleSecondaryCompletionUpdate} />;

            case 'bank-accounts':
                return <BankAccounts {...commonProps} onCompletionUpdate={bankAccountsCompletionUpdate} />;
            case 'nominees':
                return <Nominees {...commonProps} onCompletionUpdate={nomineesCompletionUpdate} />;
            case 'guardian-details':
                return <GuardianDetails {...commonProps} onCompletionUpdate={guardianCompletionUpdate} />;
            case 'summary-view':
                return <SummaryFinalization {...commonProps} onCompletionUpdate={summaryCompletionUpdate} />;
            case 'depository-details':
                return <DepositoryDetails {...commonProps} onCompletionUpdate={depositoryCompletionUpdate} />;

            default:
                return <SolePrimaryHolder {...commonProps} onCompletionUpdate={solePrimaryCompletionUpdate} />;
        }
    }, [
        currentStep,
        goToNextStep,
        goToPreviousStep,
        isFirstStep,
        isLastStep,
        listings,      // ✅ added
        investorId,
        canCriteriaCompletionUpdate,
        solePrimaryCompletionUpdate,
        bankAccountsCompletionUpdate,
        nomineesCompletionUpdate,
        summaryCompletionUpdate,
        depositoryCompletionUpdate
        //proofUploadCompletionUpdate
    ]);




    // Show registration form
    return (
        <div className="min-h-screen bg-[#1F1A1A]">


            {/* MAIN CONTENT */}
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                {/* RESPONSIVE LAYOUT: STACK ON MOBILE, SIDE-BY-SIDE ON DESKTOP */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar - full width on mobile, fixed width on desktop */}
                    <div className="w-90 flex-shrink-0">
                        <Sidebar
                            steps={steps}
                            currentStep={currentStep}
                            onStepClick={setCurrentStep}
                        />
                    </div>

                    {/* Content Card */}
                    <div className="flex-1">
                        <div className=" bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-[#2A2A2A] p-4 sm:p-6">
                            {renderStep}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

}