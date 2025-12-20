import { NextResponse } from 'next/server'
import { version } from '../../../package.json'
import { isEntraIdEnabled, isPasswordAuthDisabled } from '@/lib/auth/entraid'

export async function GET() {
    return NextResponse.json({
        version,
        entraIdEnabled: isEntraIdEnabled(),
        passwordAuthDisabled: isPasswordAuthDisabled()
    })
}
