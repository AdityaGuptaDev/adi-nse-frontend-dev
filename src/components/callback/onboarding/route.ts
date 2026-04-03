'use client'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()

        console.log('✅ Callback received:', data)

        // TODO: process or store the data

        return NextResponse.json({ message: 'Callback received successfully' }, { status: 200 })
    } catch (error) {
        console.error('❌ Error parsing request:', error)
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

export function GET() {
    return NextResponse.json({ error: 'GET method not allowed' }, { status: 405 })
}
