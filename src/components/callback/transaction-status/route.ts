
import { NextRequest, NextResponse } from 'next/server'
import { getTransactionStatus } from '../transactionStore'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const status = getTransactionStatus(orderId)

    if (!status) {
        return NextResponse.json({ status: 'pending' })
    }

    return NextResponse.json({ status })
}
