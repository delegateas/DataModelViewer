import { NextResponse } from 'next/server'
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    const generatedPath = join(process.cwd(), 'generated', 'Introduction.md');
    const stubsPath = join(process.cwd(), 'stubs', 'Introduction.md');
    let fileContent;
    try {
        fileContent = readFileSync(generatedPath, 'utf-8');
    } catch (err) {
        fileContent = readFileSync(stubsPath, 'utf-8');
    }
    return NextResponse.json({ fileContent })
}
