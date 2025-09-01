#!/usr/bin/env npx tsx

import * as fs from 'fs/promises';
import * as path from 'path';

interface WikiPageResponse {
  id: number;
  name: string;
  url: string;
  content: string;
  path: string;
}

interface AttachmentReference {
  altText: string;
  filename: string;
  fullPath: string;
}

interface WikiDownloadConfig {
  orgUrl: string;
  project: string;
  wikiName: string;
  wikiPagePath: string;
  accessToken: string;
  apiVersion: string;
  outputFile: string;
  attachmentsDir: string;
}

class WikiContentDownloader {
  private config: WikiDownloadConfig;
  private authHeader: string;

  constructor(config: WikiDownloadConfig) {
    this.config = config;
    // Create Basic auth header (empty username, token as password)
    const credentials = Buffer.from(`:${config.accessToken}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  async downloadWikiContent(): Promise<void> {
    try {
      console.log('Starting wiki content download...');
      
      // Encode wiki name and path
      const wikiNameEncoded = encodeURIComponent(this.config.wikiName);
      const pathEncoded = encodeURIComponent(this.config.wikiPagePath);
      
      // Construct URL
      const url = `${this.config.orgUrl}${this.config.project}/_apis/wiki/wikis/${wikiNameEncoded}/pages?path=${pathEncoded}&includeContent=true&api-version=${this.config.apiVersion}`;
      
      console.log('Constructed URL:', url);
      console.log('Encoded Path:', pathEncoded);
      console.log('Wiki Name:', this.config.wikiName);
      console.log('Encoded Wiki Name:', wikiNameEncoded);

      // Create output directory
      await fs.mkdir(path.dirname(this.config.outputFile), { recursive: true });

      // Fetch wiki content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const data: WikiPageResponse = await response.json();
      
      console.log('Response is valid JSON');
      
      if (!data.content) {
        console.log('Response does not have content field');
        console.log('Available fields:', Object.keys(data));
        return;
      }

      console.log('Response has content field');
      
      // Save wiki content to file
      await fs.writeFile(this.config.outputFile, data.content, 'utf-8');
      console.log(`Saved wiki page to ${this.config.outputFile}`);

      // Process attachments
      await this.processAttachments(data.content, wikiNameEncoded);
      
    } catch (error) {
      console.error('Error downloading wiki content:', error);
      throw error;
    }
  }

  private async processAttachments(content: string, wikiNameEncoded: string): Promise<void> {
    console.log('Searching for .attachments references in wiki content...');
    
    // Create attachments directory
    await fs.mkdir(this.config.attachmentsDir, { recursive: true });
    
    // Find attachment references using regex
    const attachmentRefs = this.findAttachmentReferences(content);
    
    if (attachmentRefs.length === 0) {
      console.log('No .attachments references found in wiki content');
      return;
    }

    console.log('Found attachment references:');
    attachmentRefs.forEach(ref => {
      console.log(`- ${ref.altText}: ${ref.fullPath}`);
    });

    // Download each attachment
    for (const ref of attachmentRefs) {
      await this.downloadAttachment(ref, wikiNameEncoded);
    }
  }

  private findAttachmentReferences(content: string): AttachmentReference[] {
    // Regex to match: ![alt text](/.attachments/filename) or ![alt text](.attachments/filename)
    const attachmentRegex = /!\[([^\]]*)\]\(([./]*attachments\/[^)]+)\)/g;
    const references: AttachmentReference[] = [];
    
    let match;
    while ((match = attachmentRegex.exec(content)) !== null) {
      const [, altText, fullPath] = match;
      const filename = fullPath.replace(/.*attachments\//, '');
      
      references.push({
        altText: altText || 'image',
        filename,
        fullPath
      });
    }
    
    return references;
  }

  private async downloadAttachment(ref: AttachmentReference, wikiNameEncoded: string): Promise<void> {
    try {
      console.log(`Downloading attachment: ${ref.filename}`);
      
      // Construct attachment URL
      const attachmentUrl = `${this.config.orgUrl}${this.config.project}/_apis/wiki/wikis/${wikiNameEncoded}/attachments?name=${encodeURIComponent(ref.filename)}&api-version=${this.config.apiVersion}`;
      
      const response = await fetch(attachmentUrl, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader
        }
      });
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const filePath = path.join(this.config.attachmentsDir, ref.filename);
        await fs.writeFile(filePath, Buffer.from(buffer));
        console.log(`Successfully saved: ${filePath}`);
      } else {
        console.log(`Failed to download ${ref.filename} (HTTP ${response.status})`);
      }
      
    } catch (error) {
      console.error(`Error downloading attachment ${ref.filename}:`, error);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const config: WikiDownloadConfig = {
    orgUrl: process.env.ORG_URL || '',
    project: process.env.PROJECT || '',
    wikiName: process.env.WIKI_NAME || '',
    wikiPagePath: process.env.WIKI_PAGE_PATH || '',
    accessToken: process.env.SYSTEM_ACCESSTOKEN || '',
    apiVersion: '7.1',
    outputFile: 'generated/Introduction.md',
    attachmentsDir: 'generated/.attachments'
  };

  // Validate required environment variables
  const requiredVars = ['ORG_URL', 'PROJECT', 'WIKI_NAME', 'WIKI_PAGE_PATH', 'SYSTEM_ACCESSTOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  const downloader = new WikiContentDownloader(config);
  
  try {
    await downloader.downloadWikiContent();
    console.log('Wiki content download completed successfully');
  } catch (error) {
    console.error('Wiki content download failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { WikiContentDownloader };
export type { WikiDownloadConfig };
