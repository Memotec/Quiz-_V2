import { Question } from '../types';
import { backupQuestions } from '../data/backupQuestions';

export interface SyncResult {
  questions: Question[];
  source: 'google_sheets' | 'local_backup';
  error: string | null;
}

export async function syncQuestionsFromSheet(): Promise<SyncResult> {
  const url = `https://docs.google.com/spreadsheets/d/1KbAVjbQuQWHxyD_Al8EbHOdPa0ROerUW/export?format=csv`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Phản hồi mạng không hợp lệ: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text || text.length < 100) {
      throw new Error("Dữ liệu nhận được quá ngắn hoặc trống.");
    }
    
    // Parse CSV safely
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentCell += '"';
            i++; // skip next quote
          } else {
            inQuotes = false;
          }
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentCell.trim());
          currentCell = '';
        } else if (char === '\r' || char === '\n') {
          if (char === '\r' && nextChar === '\n') {
            i++; // skip \n
          }
          currentRow.push(currentCell.trim());
          rows.push(currentRow);
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
    }
    if (currentRow.length > 0 || currentCell !== '') {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }
    
    if (rows.length < 2) {
      throw new Error("CSV không có dữ liệu câu hỏi.");
    }
    
    const parsedQuestions: Question[] = [];
    
    for (let idx = 1; idx < rows.length; idx++) {
      const row = rows[idx];
      if (row.length < 4) continue;
      
      const stt = row[0];
      const category = row[1];
      const rawQuestionContent = row[2];
      const answer = row[3];
      
      if (!stt || !category || !rawQuestionContent) continue;
      
      const lines = rawQuestionContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let questionTitle = '';
      const options: { key: string; text: string }[] = [];
      const optionPattern = /^[a-d]\.\s*(.*)/i;
      
      for (const line of lines) {
        const match = line.match(optionPattern);
        if (match) {
          const key = line[0].toLowerCase();
          const optText = match[1];
          options.push({ key, text: optText });
        } else {
          if (questionTitle) {
            questionTitle += '\n' + line;
          } else {
            questionTitle = line;
          }
        }
      }
      
      if (questionTitle.startsWith('"') && questionTitle.endsWith('"')) {
        questionTitle = questionTitle.slice(1, -1);
      }
      
      parsedQuestions.push({
        id: `q-${stt}-${idx}`,
        stt: parseInt(stt, 10) || idx,
        category: category.trim(),
        title: questionTitle.trim(),
        options: options,
        answer: answer.toLowerCase().trim()
      });
    }
    
    if (parsedQuestions.length === 0) {
      throw new Error("Không giải mã được tệp câu hỏi nào.");
    }
    
    return {
      questions: parsedQuestions,
      source: 'google_sheets',
      error: null
    };
    
  } catch (error: any) {
    console.warn("Lỗi đồng bộ Google Sheets, đang chạy chế độ dữ liệu offline:", error);
    return {
      questions: backupQuestions,
      source: 'local_backup',
      error: error.message || 'Lỗi mạng không xác định'
    };
  }
}
