import { NextResponse } from 'next/server'
import { version } from '../../../package.json'

export async function GET() {
    return NextResponse.json({ version })
}
