// components/Sidebar.tsx
import { Step } from '../index';
import { Check, Circle, CheckCircle2, TrendingUp } from 'lucide-react';


interface SidebarProps {
    steps: Step[];
    currentStep: string;
    onStepClick: (stepId: string) => void;
}

const getStepIcon = (index: number, completed: boolean, isCurrent: boolean) => {
    const iconClass = `w-5 h-5 ${completed ? 'text-green-500' :
        isCurrent ? 'text-blue-500' :
            'text-gray-400'
        }`;

    if (completed) {
        return <CheckCircle2 className={iconClass} />;
    }

    return <Circle className={iconClass} />;
};


export default function Sidebar({ steps, currentStep, onStepClick }: SidebarProps) {

    const completedCount = steps.filter(step => step.completed).length;
    const progressPercentage = (completedCount / steps.length) * 100;

    return (
        <>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">CAN Criteria</h2>
                    </div>
                    <p className="text-sm text-gray-600">Complete all steps to finish</p>
                </div>

                {/* Steps Navigation */}
                <nav className="space-y-3 mb-6">
                    {steps.map((step, index) => {
                        const isCurrent = currentStep === step.id;

                        if (step.visible == true) {

                            return (
                                <button
                                    key={step.id}
                                    // onClick={() => onStepClick(step.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${isCurrent
                                        ? 'bg-blue-50 border-blue-300 shadow-md shadow-blue-100'
                                        : step.completed
                                            ? 'bg-green-50 border-green-300 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Step Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isCurrent
                                            ? 'bg-blue-100'
                                            : step.completed
                                                ? 'bg-green-100'
                                                : 'bg-gray-100'
                                            }`}>
                                            {getStepIcon(index, step.completed, isCurrent)}
                                        </div>

                                        {/* Step Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <span className={`text-xs font-medium uppercase tracking-wide ${isCurrent
                                                        ? 'text-blue-600'
                                                        : step.completed
                                                            ? 'text-green-600'
                                                            : 'text-gray-500'
                                                        }`}>
                                                    </span>
                                                    <p className={`font-semibold mt-0.5 ${isCurrent
                                                        ? 'text-blue-900'
                                                        : step.completed
                                                            ? 'text-green-900'
                                                            : 'text-gray-700'
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                </div>

                                                {/* Completion Check */}
                                                {step.completed && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        }
                    })}
                </nav>

                {/* Progress Section */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Overall Progress</h3>
                        <span className="text-sm font-bold text-blue-600">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${progressPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-900">{completedCount}</span> of{' '}
                            <span className="font-semibold text-gray-900">{steps.length}</span> completed
                        </p>

                        {completedCount === steps.length && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <Check className="w-3 h-3" />
                                Complete
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/*<div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">CAN Criteria</h2>

            <nav className="space-y-2">
                {steps.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => onStepClick(step.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${currentStep === step.id
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : step.completed
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{step.label}</span>
                            {step.completed && (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${(steps.filter(step => step.completed).length / steps.length) * 100}%`
                        }}
                    ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    {steps.filter(step => step.completed).length} of {steps.length} steps completed
                </p>
            </div>
        </div> */}
        </>
    );
}