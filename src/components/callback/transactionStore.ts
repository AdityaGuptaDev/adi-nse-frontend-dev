// lib/transactionStore.ts

const transactions = new Map<string, string>()

export function saveTransaction(orderId: string, status: string) {
    transactions.set(orderId, status)
}

export function getTransactionStatus(orderId: string): string | undefined {
    return transactions.get(orderId)
}
