'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function TransactionSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const [status, setStatus] = useState<string>('paid')
    const dataParam = searchParams.get('data')
    const [transaction, setTransaction] = useState<any>(null)


    useEffect(() => {
        if (dataParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(dataParam))
                setTransaction(parsed)
            } catch (error) {
                console.error('Failed to parse transaction data:', error)
            }
        }
    }, [dataParam])

    /* if (!transaction) {
         return (
             <div className="flex h-screen items-center justify-center text-gray-500">
                 Loading transaction data...
             </div>
         )
     }*/

    /*useEffect(() => {
        if (!orderId) return

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/callback/transaction-status?order_id=${orderId}`)
                const data = await res.json()
                setStatus(data.status)
            } catch (error) {
                console.error(error)
                setStatus('error')
            }
        }

        fetchStatus()
    }, [orderId])*/

    /*if (!orderId) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Missing order ID</p>
            </div>
        )
    }*/

    const renderStatus = () => {
        switch (status) {
            case 'paid':
                return (
                    <div className="flex flex-col items-center text-green-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-2xl font-semibold">Transaction Successful!</h2>
                    </div>
                )
            case 'pending':
                return (
                    <div className="flex flex-col items-center text-yellow-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mb-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6l4 2"
                            />
                        </svg>
                        <h2 className="text-2xl font-semibold">Waiting for confirmation...</h2>
                    </div>
                )
            case 'error':
                return (
                    <div className="flex flex-col items-center text-red-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        <h2 className="text-2xl font-semibold">Error fetching status</h2>
                    </div>
                )
            default:
                return (
                    <div className="flex flex-col items-center text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mb-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6l4 2"
                            />
                        </svg>
                        <h2 className="text-2xl font-semibold">Checking transaction...</h2>
                    </div>
                )
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center animate-fadeIn">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Transaction Status</h1>
                <p className="text-gray-500 mb-6">Reference No: V2025071106740{orderId}</p>
                {renderStatus()}
            </div>
        </div>
    )
}
