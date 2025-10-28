import { noteApi, NoteResponse } from '../../../core/services/api';

/**
 * CLI script to fetch notes from the API
 * Usage: npm run fetch-notes [options]
 * 
 * Options:
 *   --all       Fetch all notes (default)
 *   --recent    Fetch recent notes (last 10)
 *   --search    Search notes with query
 */

interface FetchOptions {
  includeDeleted?: boolean;
  limit?: number;
  searchQuery?: string;
}

/**
 * Fetch notes from the API
 */
export async function fetchNotesFromAPI(options: FetchOptions = {}): Promise<NoteResponse[]> {
  try {
    console.log('Fetching notes from API...');
    
    const { includeDeleted = false, limit, searchQuery } = options;
    
    let notes: NoteResponse[];
    
    if (searchQuery) {
      console.log(`Searching for: "${searchQuery}"`);
      notes = await noteApi.search(searchQuery);
    } else {
      notes = await noteApi.findAll(includeDeleted);
    }
    
    // Apply limit if specified
    if (limit) {
      notes = notes.slice(0, limit);
    }
    
    console.log(`✅ Successfully fetched ${notes.length} note(s)`);
    
    return notes;
  } catch (error) {
    console.error('❌ Failed to fetch notes:', error);
    throw error;
  }
}

/**
 * Display notes in a formatted way
 */
export function displayNotes(notes: NoteResponse[]): void {
  if (notes.length === 0) {
    console.log('No notes found.');
    return;
  }
  
  console.log('\n📝 Notes:');
  console.log('━'.repeat(80));
  
  notes.forEach((note, index) => {
    console.log(`\n${index + 1}. ${note.title}`);
    console.log(`   ID: ${note._id}`);
    console.log(`   Date: ${new Date(note.meetingTime).toLocaleString()}`);
    console.log(`   Duration: ${formatDuration(note.duration)}`);
    
    if (note.content) {
      const preview = note.content.substring(0, 100);
      console.log(`   Content: ${preview}${note.content.length > 100 ? '...' : ''}`);
    }
    
    if (note.summary) {
      if (note.summary.actionItems && Array.isArray(note.summary.actionItems)) {
        console.log(`   Action Items: ${note.summary.actionItems.length}`);
      }
      if (note.summary.decisions && Array.isArray(note.summary.decisions)) {
        console.log(`   Decisions: ${note.summary.decisions.length}`);
      }
    }
    
    console.log(`   Created: ${new Date(note.createdAt).toLocaleString()}`);
  });
  
  console.log('\n━'.repeat(80));
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }
}

/**
 * Save notes to a file (for development/testing)
 */
export function exportNotesToFile(notes: NoteResponse[], filename: string = 'notes-export.json'): void {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const exportPath = path.join(process.cwd(), 'src', 'pages', 'HomePage', 'constants', filename);
    const data = JSON.stringify(notes, null, 2);
    
    fs.writeFileSync(exportPath, data, 'utf-8');
    console.log(`\n✅ Notes exported to: ${exportPath}`);
  } catch (error) {
    console.error('❌ Failed to export notes:', error);
  }
}

// CLI execution (if running from command line)
if (typeof window === 'undefined' && require.main === module) {
  (async () => {
    try {
      const args = process.argv.slice(2);
      const options: FetchOptions = {};
      
      // Parse command-line arguments
      if (args.includes('--deleted')) {
        options.includeDeleted = true;
      }
      
      const recentIndex = args.indexOf('--recent');
      if (recentIndex !== -1) {
        options.limit = 10;
      }
      
      const searchIndex = args.indexOf('--search');
      if (searchIndex !== -1) {
        options.searchQuery = args[searchIndex + 1];
      }
      
      // Fetch notes
      const notes = await fetchNotesFromAPI(options);
      
      // Display notes
      displayNotes(notes);
      
      // Option to export
      if (args.includes('--export')) {
        exportNotesToFile(notes);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      process.exit(1);
    }
  })();
}
