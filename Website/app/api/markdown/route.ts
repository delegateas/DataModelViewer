import { NextResponse } from 'next/server'
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    const filePath = join(process.cwd(), 'generated', 'Introduction.md');
    const fileContent = readFileSync(filePath, 'utf-8');
    return NextResponse.json({ fileContent })
}
