/**
 * Google Docs API integration helper for exporting candidate exam results.
 */
import { Question, UserAnswer } from '../types';

export interface DocsExportResult {
  documentId: string | null;
  documentUrl: string | null;
  error: string | null;
}

/**
 * Compiles the detailed exam results into a beautifully formatted plaintext layout suitable for a Google Doc.
 */
export function compileReportToText(
  data: {
    date: string;
    mode: 'practice' | 'exam';
    categoryName: string;
    totalQuestions: number;
    correctAnswersCount: number;
    score: number;
    timeSpentSeconds: number;
    passed: boolean;
    questions?: Question[];
    answers?: Record<string, UserAnswer>;
  },
  candidateEmail: string
): string {
  const dateFormatted = new Date(data.date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const minutes = Math.floor(data.timeSpentSeconds / 60);
  const seconds = data.timeSpentSeconds % 60;
  const passedText = data.passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT TIÊU CHUẨN';

  const sections = [
    '================================================================================',
    '                   BÁO CÁO KẾT QUẢ SÁT HẠCH TRẮC NGHIỆM VCCS                  ',
    '================================================================================',
    '',
    `Thí sinh / Học viên: ${candidateEmail}`,
    `Giờ làm bài thi:    ${dateFormatted}`,
    `Cấu trúc chuyên đề:  ${data.categoryName}`,
    `Định dạng làm bài:   ${data.mode === 'exam' ? 'Thi Thử Tính Giờ' : 'Luyện Tập Tự Do'}`,
    `Thời gian hoàn thành: ${minutes} phút ${seconds} giây`,
    `Điểm số đạt được:    ${data.score.toFixed(1)} / 10.0`,
    `Số câu đúng:         ${data.correctAnswersCount} / ${data.totalQuestions} câu`,
    `Đánh giá tổng hợp:   ${passedText}`,
    '',
    '--------------------------------------------------------------------------------',
    '                   CHI TIẾT ĐÁP ÁN BÀI LÀM CỦA THÍ SINH                        ',
    '--------------------------------------------------------------------------------',
    ''
  ];

  if (data.questions && data.answers) {
    data.questions.forEach((q, idx) => {
      const ansObj = data.answers?.[q.id];
      const isCorrect = ansObj?.isCorrect === true;
      const chosenLabel = ansObj?.selectedOptionKey?.trim().toUpperCase() || 'CHƯA LÀM';
      const correctLabel = q.answer.trim().toUpperCase();

      sections.push(`Câu ${idx + 1}: ${q.title}`);
      sections.push(`  * Chuyên mục: ${q.category}`);
      sections.push(`  * Lựa chọn của bạn: [ ${chosenLabel} ] ${ansObj?.selectedOptionKey === null ? '(BỎ QUA)' : isCorrect ? '(ĐÚNG ✓)' : '(SAI ĐÁNH DẤU X)'}`);
      sections.push(`  * Đáp án chính xác:  [ ${correctLabel} ]`);
      sections.push('  * Các phương án lựa chọn:');

      q.options.forEach(opt => {
        const isChosen = chosenLabel === opt.key.toUpperCase();
        const isCorrectOpt = correctLabel === opt.key.toUpperCase();
        
        let marker = '    [ ]';
        if (isChosen && isCorrectOpt) {
          marker = '    [✓]'; // Correctly answered
        } else if (isChosen && !isCorrectOpt) {
          marker = '    [X]'; // Wrong choice
        } else if (!isChosen && isCorrectOpt) {
          marker = '    [•]'; // Unselected correct answer
        }

        sections.push(`${marker} ${opt.key.toUpperCase()}. ${opt.text}`);
      });

      sections.push(`  * Giải thích câu hỏi: ${(q as any).explanation || 'Hãy lưu ý kiến thức chuyên môn này để thực hành tốt hơn.'}`);
      sections.push('');
    });
  }

  sections.push('================================================================================');
  sections.push('            BÁO CÁO ĐÃ ĐƯỢC XÁC THỰC ĐIỆN TỬ VÀ LƯU TRỮ HỌC BẠ               ');
  sections.push('================================================================================');

  return sections.join('\n');
}

/**
 * Creates a brand new Google Doc with the specified title and inserts formatted exam report text.
 */
export async function exportExamToGoogleDoc(
  title: string,
  reportText: string,
  accessToken: string
): Promise<DocsExportResult> {
  try {
    // 1. Create a blank Google Document
    const createUrl = 'https://docs.googleapis.com/v1/documents';
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      console.error('Docs API Creation Error:', errText);
      throw new Error(`Không thể khởi tạo tệp tài liệu Google Docs mới (${createResponse.status}).`);
    }

    const docData = await createResponse.json();
    const documentId = docData.documentId;
    if (!documentId) {
      throw new Error('Không tìm thấy ID tài liệu được trả về từ máy chủ Google.');
    }

    // 2. Perform BatchUpdate to insert the full text content at index 1
    const updateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: reportText,
              location: {
                index: 1
              }
            }
          }
        ]
      })
    });

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      console.error('Docs API BatchUpdate Error:', errText);
      throw new Error(`Đã tạo tệp có ID ${documentId} nhưng không thể ghi nội dung văn bản vào.`);
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return {
      documentId,
      documentUrl,
      error: null
    };

  } catch (error: any) {
    console.error('exportExamToGoogleDoc failed:', error);
    return {
      documentId: null,
      documentUrl: null,
      error: error.message || 'Lỗi không xác định khi kết nối Máy chủ Google Docs'
    };
  }
}
