import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    const generatedPath = join(process.cwd(), 'generated', 'Introduction.md');
    
    if (!existsSync(generatedPath)) {
        console.error(`File not found at path: ${generatedPath}`);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    let fileContent: string;
    try {
        fileContent = readFileSync(generatedPath, 'utf-8');
    } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ fileContent })
}
