import { Question } from '../types';

export interface SpreadsheetInfo {
  title: string;
  sheets: string[];
}

export interface SheetsSyncResult {
  questions: Question[];
  error: string | null;
}

/**
 * Parses out spreadsheet ID from common formats:
 * - Direct ID: 1KbAVjbQuQWHxyD_Al8EbHOdPa0ROerUW
 * - Shareable links, edit URLs, export URLs
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  // Try pattern /d/(ID)/
  const dPattern = /\/d\/([a-zA-Z0-9-_]+)/;
  const dMatch = trimmed.match(dPattern);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }
  
  // Try pattern id=(ID)
  const idPattern = /[?&]id=([a-zA-Z0-9-_]+)/;
  const idMatch = trimmed.match(idPattern);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  
  return trimmed; // fallback assumes the raw string is the ID
}

/**
 * Fetches basic info about a Google Spreadsheet (Title and Sheet tab names)
 */
export async function fetchSpreadsheetInfo(spreadsheetId: string, accessToken: string): Promise<SpreadsheetInfo> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Sheets API Error Details:', errorBody);
    
    if (errorBody.includes('must not be an Office file') || errorBody.includes('Office file') || errorBody.includes('FAILED_PRECONDITION')) {
      throw new Error(`Tập tin này hiện tại là định dạng Excel (.xlsx) lưu trữ trên Google Drive. Google Sheets API không hỗ trợ đọc trực tiếp tệp Excel.

Để khắc phục, bạn vui lòng thực hiện:
1. Mở tập tin .xlsx này trong Google Drive.
2. Nhấp vào menu "Tệp" (File) -> Chọn "Lưu dưới dạng Trang tính Google" (Save as Google Sheets).
3. Quay lại ứng dụng và thực hiện đồng bộ hóa bằng Trang tính Google mới vừa tạo.`);
    }
    
    throw new Error(`Không thể kết nối đến Google Sheets API (${response.status}). Vui lòng xác định lại quyền truy cập hoặc ID Trang tính.`);
  }
  
  const data = await response.json();
  const title = data.properties?.title || 'Bảng tính câu hỏi';
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title || '').filter(Boolean);
  
  return { title, sheets };
}

/**
 * Fetches sheet data ranges and parses them into Question array
 */
export async function fetchQuestionsFromGoogleSheet(
  spreadsheetId: string,
  sheetName: string,
  accessToken: string
): Promise<SheetsSyncResult> {
  try {
    // Escape sheet name if it contains spaces or weird characters
    const encodedRange = encodeURIComponent(`${sheetName}!A:D`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Phản hồi Sheets API lỗi: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.values as string[][];
    
    if (!rows || rows.length < 2) {
      throw new Error('Bảng tính không chứa đủ dữ liệu dòng hoặc dòng tiêu đề.');
    }
    
    const parsedQuestions: Question[] = [];
    
    // Rows loop starting from 1 (skipping header)
    for (let idx = 1; idx < rows.length; idx++) {
      const row = rows[idx];
      if (!row || row.length < 4) continue;
      
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
        id: `gs-${stt}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        stt: parseInt(stt, 10) || idx,
        category: category.trim(),
        title: questionTitle.trim(),
        options: options,
        answer: answer.toLowerCase().trim()
      });
    }
    
    if (parsedQuestions.length === 0) {
      throw new Error('Không giải thích được định dạng câu hỏi nào trong bảng tính này.');
    }
    
    return {
      questions: parsedQuestions,
      error: null
    };
    
  } catch (error: any) {
    console.error('Error fetching questions from sheets API:', error);
    return {
      questions: [],
      error: error.message || 'Lỗi không xác định khi nạp dữ liệu từ Google Sheets API'
    };
  }
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Searches and lists Google Sheets spreadsheets from the user's Google Drive.
 */
export async function listGoogleSheetsFromDrive(accessToken: string, querySearch: string = ""): Promise<DriveFile[]> {
  const qStr = ["mimeType = 'application/vnd.google-apps.spreadsheet'", "trashed = false"];
  if (querySearch.trim() !== "") {
    const escapedQuery = querySearch.replace(/'/g, "\\'");
    qStr.push(`name contains '${escapedQuery}'`);
  }
  const q = encodeURIComponent(qStr.join(" and "));
  // Request metadata fields including webViewLink and modifiedTime
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime%20desc&pageSize=20`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Drive API Error Details:', errorBody);
    throw new Error(`Lỗi Google Drive API (${response.status}). Vui lòng kiểm tra lại quyền truy cập của ứng dụng.`);
  }
  
  const data = await response.json();
  return data.files || [];
}
