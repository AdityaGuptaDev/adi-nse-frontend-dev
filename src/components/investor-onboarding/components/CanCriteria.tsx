// components/steps/SolePrimaryHolder.tsx
import { useState, useEffect, useInsertionEffect, use } from 'react';
import { StepComponentProps } from '../types';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { OnboardingService } from '@/services/onboardingService';
import { USER_DATA } from '@/utils/constants';
import { getLS, removeLS, setLS } from '@/utils/helpers';
import { getInvestor, getUserByInvestorId } from '@/api/holder';

interface CanCriteriaProps extends StepComponentProps {
    onMinorStatusChange?: (value: any) => void;
    onJointStatusChange?: (value: any) => void;
    onChangeRegType?: (value: any) => void;

}


const investorCategory = [
    { value: "I", label: "Individual" },
    { value: "M", label: "Minor" },
    { value: "S", label: "Sole-proprietor" },
]

const CAN_CRITERIA_KEY = "can-criteria";


export default function CanCriteria({
    onCompletionUpdate,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    data,
    investorId,
    onMinorStatusChange,
    onJointStatusChange,
    onChangeRegType



}: CanCriteriaProps) {
    const [holders, setHolders] = useState(1)

    const [formData, setFormData] = useState({
        holding_nature: '',
        investor_category: '',
        tax_status: '',
        holders: holders,
        investor_id: investorId,
        last_kyc_step: 'can-criteria',
        next_kyc_step: 'sole-primary',
        mode_of_registration: ''

    });
    //let users: any = getLS(USER_DATA);


    let users: any = getLS("INVESTOR_DATA") || getLS(USER_DATA);


    useEffect(() => {
        // console.log("Users in can criteria=", users)
        if (users) {
            setTimeout(() => {
                loadInvestorData();
            }, 1000);



        }
    }, []);


    const loadInvestorData = async () => {

        try {
            const response = await getUserByInvestorId(users?.InvestorRegistration?.user_id);
            removeLS("INVESTOR_DATA");
            setLS("INVESTOR_DATA", response?.data?.data);

            const investor = response?.data?.data?.InvestorRegistration;
            if (investor) {
                setFormData(prev => ({
                    ...prev,
                    mode_of_registration: investor?.mode_of_registration || '',
                    holding_nature: investor?.holding_nature || '',
                    investor_category: investor?.investor_category || '',
                    holders: investor?.holders || 1,
                    tax_status: investor?.tax_status || ''

                }));
                setHolders(investor?.holders);
            }
        } catch (error) {
            console.error("Error fetching investor data:", error);
            return null;
        }
    }


    /*useEffect(() => {
        const saved = localStorage.getItem(CAN_CRITERIA_KEY);
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);
    useEffect(() => {
        if (users) {
            const investor = users?.InvestorRegistration;

            const saved = localStorage.getItem(CAN_CRITERIA_KEY);
            if (saved) {
                setFormData(JSON.parse(saved));
            } else {
                if (users?.InvestorRegistration?.last_kyc_step) {
                    setFormData(prev => ({
                        ...prev,
                        mode_of_registration: investor?.mode_of_registration || '',
                        holding_nature: investor?.holding_nature || '',
                        investor_category: investor?.investor_category || '',
                        holders: investor?.holders || '',
                        tax_status: investor?.tax_status || ''

                    }));
                    //localStorage.setItem(CAN_CRITERIA_KEY, JSON.stringify(formData))


                }

            }


        }
    }, [])*/

    const handleMinorChange = (value: any) => {
        onMinorStatusChange?.(value);  // sends value to parent
    };

    const handleJointChange = (value: any) => {
        onJointStatusChange?.(value); // sends value to parent
    };
    /*const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(CAN_CRITERIA_KEY);
        return saved
            ? JSON.parse(saved)
            : {
                holding_nature: '',
                investor_category: '',
                tax_status: '',
                holders: holders,
                investor_id: users?.InvestorRegistration?.id,
                last_kyc_step: 2
            };
    });*/
    /* useEffect(() => {
         localStorage.setItem(CAN_CRITERIA_KEY, JSON.stringify(formData));
     }, [formData]);*/



    const isFormValid =
        formData.holding_nature.trim() !== '' &&
        formData.investor_category.trim() !== '' &&
        formData.tax_status !== '';

    useEffect(() => {
        onCompletionUpdate(isFormValid);
    }, [isFormValid, onCompletionUpdate]);

    useEffect(() => {
        const saved = localStorage.getItem(CAN_CRITERIA_KEY);
        if (saved) {
            setFormData(prev => ({
                ...prev,
                ...JSON.parse(saved)
            }));
        }
    }, []);


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // localStorage.setItem(CAN_CRITERIA_KEY, JSON.stringify(updated));
            return updated;
        });
        /*if (field === "investor_category") {
            if (value == 'M') {
                setFormData((prev: any) => ({ ...prev, 'holders': 2 }));

            } else if (value == 'S') {
                setFormData((prev: any) => ({ ...prev, 'holders': 1 }));
                //setFormData((prev: any) => ({ ...prev, 'tax_status': 1 }));

            } else {
                setFormData((prev: any) => ({ ...prev, 'holders': 1 }));

            }
        }*/
        //setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isFormValid) {
            try {
                //localStorage.setItem(CAN_CRITERIA_KEY, JSON.stringify(formData))

                let res: any = await api.post(`/kyc/investor_registration`, formData);
                loadInvestorData();
                onNext();
            } catch (err) {
                console.log(err)
            }
        }
    };



    const handleRegType = (value: any) => {
        onChangeRegType?.(value);
    }

    const filteredInvestorCategory = (() => {
        if (formData.holding_nature === "JO" || formData.holding_nature === "AS") {
            return investorCategory.filter((item: any) => item.value === "I");
        }
        return investorCategory; // all options allowed
    })();


    return (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-xl">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent mb-6">eCan Criteria</h2>
            
            <div className='w-50 mb-5'>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                    Choice of eCAN Registration <span className="text-[#F59E0B]">*</span>
                </label>
                <select
                    //value={onChangeRegType}
                    value={formData.mode_of_registration}
                    onChange={(e: any) => {
                        handleRegType(e.target.value)
                        handleInputChange('mode_of_registration', e.target.value)


                    }}
                    className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                    required
                >
                    <option value="" className="bg-[#1F1A1A]">Select</option>
                    <option value="E" className="bg-[#1F1A1A]">Completely Electronic</option>
                    <option value="D" className="bg-[#1F1A1A]">Demat Electronic</option>
                </select>
            </div>



            {/* Account Type */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                        Holding Nature <span className="text-[#F59E0B]">*</span>
                    </label>
                    <select
                        value={formData.holding_nature}
                        onChange={(e) => {
                            handleInputChange('holding_nature', e.target.value)
                            handleJointChange(e.target.value)
                            if (e.target.value !== 'SI') {
                                setHolders(2)
                                setFormData(prev => {
                                    const updated = { ...prev, holders: 2 };
                                    return updated;
                                });

                            } else {
                                setFormData(prev => {
                                    const updated = { ...prev, holders: 1 };
                                    return updated;
                                });
                                setHolders(1)

                            }

                        }}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        required
                    >
                        <option value="" className="bg-[#1F1A1A]">Select</option>
                        <option value="SI" className="bg-[#1F1A1A]">Single</option>
                        <option value="JO" className="bg-[#1F1A1A]">Joint</option>
                        <option value="AS" className="bg-[#1F1A1A]">Anyone or Survivor</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                        Investor Category <span className="text-[#F59E0B]">*</span>
                    </label>
                    <select
                        value={formData.investor_category}
                        onChange={(e) => {
                            handleInputChange('investor_category', e.target.value)
                            handleMinorChange(e.target.value)

                            if (e.target.value == 'M') {
                                setFormData(prev => {
                                    const updated = { ...prev, holders: 2 };
                                    return updated;
                                });
                                setHolders(2)
                            } else {
                                setHolders(1)
                                setFormData(prev => {
                                    const updated = { ...prev, holders: 1 };
                                    return updated;
                                });
                            }

                        }}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        required
                    >
                        <option value="" className="bg-[#1F1A1A]">Select</option>
                        {filteredInvestorCategory.map((item: any) => {
                            return (
                                <option key={item.value} value={item.value} className="bg-[#1F1A1A]">
                                    {item.label}
                                </option>
                            );
                        })}


                    </select>
                </div>
            </div>

            {/* Tax Status */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                        Tax Status <span className="text-[#F59E0B]">*</span>
                    </label>

                    <select
                        value={formData.tax_status}
                        onChange={(e) => handleInputChange('tax_status', e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        required
                    >
                        <option value="" className="bg-[#1F1A1A]">Select Tax Status</option>
                        {data?.tax_status?.map((option: any) => (
                            <option key={option.id} value={option.id} className="bg-[#1F1A1A]">
                                {option.status}
                            </option>
                        ))}
                    </select>


                </div>


                {/* Holders Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                        Holders <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                        type="text"
                        value={holders}
                        onChange={(e) => handleInputChange('holders', holders.toString())}
                        className="w-full px-3 py-2 bg-[#1F1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        required
                    />

                </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-[#2A2A2A]">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${isFirstStep
                        ? 'bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-[#1F1A1A] text-[#F9FAFB] border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:border-[#F59E0B] transition-all'
                        }`}
                >
                    Previous
                </button>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${isFormValid
                        ? 'bg-gradient-to-r from-[#F59E0B] to-[#B45309] text-white hover:opacity-90 shadow-lg'
                        : 'bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed'
                        }`}
                >
                    {isLastStep ? 'Submit' : 'Next'}
                </button>
            </div>
        </form >
    );
}