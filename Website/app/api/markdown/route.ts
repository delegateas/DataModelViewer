import { NextResponse } from 'next/server'
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    const generatedPath = join(process.cwd(), 'generated', 'Introduction.md');
    let fileContent = undefined;
    try {
        fileContent = readFileSync(generatedPath, 'utf-8');
    } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ fileContent })
}
