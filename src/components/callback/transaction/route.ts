import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { saveTransaction } from '../transactionStore'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { order_id, status } = body

        console.log('✅ Callback received:', body)

        if (!order_id || !status) {
            return NextResponse.json({ error: 'Missing order_id or status' }, { status: 400 })
        }

        // Save transaction status
        saveTransaction(order_id, status)

        return NextResponse.json({ message: 'Callback received successfully' })
        //return NextResponse.redirect('https://localhost:3000/transaction/success?order_id=12345')

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
