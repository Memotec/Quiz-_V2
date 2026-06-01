import React, { useEffect, useState } from 'react';
import { Question, UserAnswer } from '../types';
import { 
  X, Printer, Calendar, Award, Clock, ArrowLeft, CheckCircle2, 
  HelpCircle, BookOpen, User, Check, AlertCircle, FileText
} from 'lucide-react';
import { getAccessToken, googleSignIn } from '../utils/googleAuth';
import { exportExamToGoogleDoc, compileReportToText } from '../utils/docsApi';

interface ExamReportPDFProps {
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
  };
  onClose: () => void;
}

export default function ExamReportPDF({ data, onClose }: ExamReportPDFProps) {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Thí sinh tự do');

  // Google Docs state hooks
  const [exportingDoc, setExportingDoc] = useState<boolean>(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const handleExportToGoogleDocs = async () => {
    setExportingDoc(true);
    setDocError(null);
    setDocUrl(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const loginData = await googleSignIn();
        if (loginData?.accessToken) {
          token = loginData.accessToken;
        } else {
          throw new Error('Bạn cần đăng nhập Google để tiến hành xuất file Tài liệu bồi dưỡng.');
        }
      }

      const docTitle = `Ket qua sat hach VCCS 4G - ${currentUserEmail.split('@')[0]} - ${new Date().toLocaleDateString('vi-VN')}`;
      const reportText = compileReportToText(data, currentUserEmail);

      const result = await exportExamToGoogleDoc(docTitle, reportText, token);
      if (result.error) {
        throw new Error(result.error);
      }

      setDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error('Lỗi xuất Google Docs từ bảng PDF:', err);
      setDocError(err.message || 'Lỗi không xác định khi đồng bộ tài liệu Google Docs.');
    } finally {
      setExportingDoc(false);
    }
  };

  // Load user email directly from Firebase/localStorage auth if present
  useEffect(() => {
    if ((data as any).candidateEmail) {
      setCurrentUserEmail((data as any).candidateEmail);
      return;
    }
    try {
      const stored = localStorage.getItem('vccs_google_user');
      if (stored) {
        const userObj = JSON.parse(stored);
        if (userObj && userObj.email) {
          setCurrentUserEmail(userObj.email);
        }
      }
    } catch {
      // safe fallback
    }
  }, [data]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const formatSecsToMins = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m} phút ${s} giây`;
  };

  // Group questions by category and calculate success rate
  const categoryStats = React.useMemo(() => {
    const statsMap: Record<string, { total: number; correct: number }> = {};
    
    if (data.questions && data.answers) {
      data.questions.forEach(q => {
        const userAns = data.answers?.[q.id];
        const isCor = userAns?.isCorrect === true;
        
        if (!statsMap[q.category]) {
          statsMap[q.category] = { total: 0, correct: 0 };
        }
        statsMap[q.category].total += 1;
        if (isCor) {
          statsMap[q.category].correct += 1;
        }
      });
    } else {
      // Fallback if detailed questions are not saved
      statsMap[data.categoryName] = { 
        total: data.totalQuestions, 
        correct: data.correctAnswersCount 
      };
    }
    
    return Object.entries(statsMap).map(([title, val]) => {
      const rate = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
      return { title, ...val, rate };
    });
  }, [data]);

  const handleTriggerPrint = () => {
    // Small timeout to let state flush
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Shared inner template to avoid duplication
  const renderReportContent = (isForScreen: boolean) => {
    return (
      <div className={`bg-white font-sans ${isForScreen ? 'p-6 md:p-8' : 'p-10'} space-y-8 text-slate-800`}>
        {/* Document Header Logo / Brand Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-indigo-600 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">4G</span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">Hệ thống Đào tạo VCCS 4G</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Báo cáo kết quả đánh giá năng lực lý thuyết</p>
              </div>
            </div>
          </div>
          
          <div className="text-left sm:text-right font-mono text-xs text-slate-500 space-y-0.5">
            <div>Mã số báo cáo: <span className="font-bold text-slate-700 font-sans">#VCCS-{(new Date(data.date).getTime() / 1000).toFixed(0)}</span></div>
            <div>Giờ kết xuất: <span className="text-slate-700 font-sans">{formatDate(new Date().toISOString())}</span></div>
          </div>
        </div>

        {/* Certificate Style Title Banner */}
        <div className="text-center py-4 space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">BÁO CÁO KẾT QUẢ ĐỢT {data.mode === 'exam' ? 'THI THỬ CHUẨN' : 'LUYỆN TẬP'}</h2>
          <p className="text-xs text-slate-400 font-medium">Ban chỉ đạo Đào tạo & Khảo thí Lý thuyết Công nghệ Viễn thông VCCS</p>
        </div>

        {/* Candidate Profile Details Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/60 text-sm">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-400 font-medium">Học viên / Thí sinh:</span>
              <strong className="text-slate-800 font-semibold">{currentUserEmail}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-400 font-medium">Ngày giờ dự thi:</span>
              <span className="text-slate-800 font-medium">{formatDate(data.date)}</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-400 font-medium">Cấu trúc chuyên đề:</span>
              <span className="text-slate-800 font-bold max-w-[200px] truncate" title={data.categoryName}>{data.categoryName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-400 font-medium">Thời gian hoàn thành:</span>
              <span className="text-slate-800 font-medium">{formatSecsToMins(data.timeSpentSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Scoring Statistics Grid Dashboard of the PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="border border-slate-150 p-4 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Định dạng</span>
            <span className="text-sm font-black text-slate-800 font-mono block mt-1 uppercase bg-slate-100 text-slate-700 py-1 rounded-lg">
              {data.mode === 'exam' ? 'Thi Thử' : 'Luyện Tập'}
            </span>
          </div>

          <div className="border border-slate-150 p-4 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Số câu chính xác</span>
            <span className="text-lg font-black text-slate-800 font-mono block mt-1">
              {data.correctAnswersCount} <span className="text-xs text-slate-400 font-normal">/ {data.totalQuestions} câu</span>
            </span>
          </div>

          <div className="border border-slate-150 p-4 rounded-xl text-center shadow-sm relative overflow-hidden">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Tổng điểm số</span>
            <span className="text-xl font-black block mt-1 font-mono text-indigo-650">
              {data.score.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10.0</span>
            </span>
          </div>

          <div className={`border p-4 rounded-xl text-center shadow-sm ${
            data.passed 
              ? 'bg-emerald-50/40 border-emerald-250 text-emerald-800' 
              : 'bg-rose-50/40 border-rose-250 text-rose-800'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Đánh giá chung</span>
            <span className="text-base font-black tracking-wider block mt-1">
              {data.passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
            </span>
          </div>
        </div>

        {/* Category breakdown Analysis */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            📊 Phân tích hiệu suất theo danh mục / chuyên đề học tập:
          </h3>
          <div className="overflow-hidden border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 font-mono">
                  <th className="p-3">Chuyên Đề / Danh Mục Đào Tạo</th>
                  <th className="p-3 text-center">Tổng Số Câu Hỏi</th>
                  <th className="p-3 text-center font-black">Đáp Án Đúng</th>
                  <th className="p-3 text-right">Tỉ Lệ Trả Lời Đúng (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {categoryStats.map((cat, idx) => {
                  let badgeBg = 'bg-indigo-50 text-indigo-700';
                  if (cat.rate >= 80) badgeBg = 'bg-emerald-50 text-emerald-700';
                  else if (cat.rate >= 50) badgeBg = 'bg-amber-50 text-amber-700';
                  else badgeBg = 'bg-rose-50 text-rose-700';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-700">{cat.title}</td>
                      <td className="p-3 text-center font-mono">{cat.total}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600">{cat.correct}</td>
                      <td className="p-3 text-right font-mono font-black select-all">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] ${badgeBg}`}>
                          {cat.rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Verification Seal for Authenticity */}
        <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono border-t border-slate-100 print-avoid-break">
          <div className="text-left space-y-1 text-slate-400">
            <p className="font-black uppercase tracking-widest text-[9px]">Ghi chú khảo bồi dưỡng:</p>
            <p>• Điểm xét đạt tiêu chuẩn chuyên nghiệp là ≥ 7.0 / 10.</p>
            <p>• Báo cáo này có giá trị lưu trữ nội bộ ngành viễn thông.</p>
          </div>
          <div className="text-right space-y-12">
            <div>
              <p className="font-bold text-slate-700 uppercase">Hội Đồng Đánh Giá VCCS 4G</p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">(Đã ký duyệt điện tử và ghi sổ học bạ)</p>
            </div>
            <div className="font-sans font-bold text-indigo-650 tracking-wider inline-block border-2 border-indigo-600 px-3 py-1 rounded-lg mr-2 uppercase text-[10px]">
              VCCS 4G PASSED VERIFIED
            </div>
          </div>
        </div>

        {/* Question Review Grid (Only print if questions details are attached) */}
        {data.questions && data.answers && data.questions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 print-avoid-break">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              📓 Chi tiết bài khảo thí & Đơn lỗi sai học tập:
            </h3>
            
            <div className="space-y-6">
              {data.questions.map((q, idx) => {
                const userAns = data.answers?.[q.id];
                const cleanUserAns = userAns?.selectedOptionKey?.trim().toUpperCase() || 'CHƯA LÀM';
                const cleanCorAns = q.answer.trim().toUpperCase();
                const isCor = userAns?.isCorrect === true;

                return (
                  <div key={q.id} className="p-5 border border-slate-200 rounded-xl space-y-3 print-avoid-break bg-slate-50/10">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-400 uppercase tracking-widest">Câu hỏi {idx + 1} <span className="text-[9px] lowercase opacity-70">({q.category})</span></span>
                      
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                        userAns?.selectedOptionKey === null 
                          ? 'bg-amber-50 border border-amber-200/60 text-amber-600'
                          : isCor
                            ? 'bg-emerald-50 border border-emerald-200/60 text-emerald-700'
                            : 'bg-rose-50 border border-rose-200/60 text-rose-700'
                      }`}>
                        {userAns?.selectedOptionKey === null 
                          ? 'Bỏ qua' 
                          : isCor 
                            ? 'Đúng (✓)' 
                            : 'Sai (✗)'
                        }
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-xs md:text-sm leading-relaxed">{q.title}</p>
                    
                    {/* Render Choices Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {q.options.map(opt => {
                        const isChosen = cleanUserAns === opt.key.toUpperCase();
                        const isCorrectKey = cleanCorAns === opt.key.toUpperCase();

                        let optStyle = 'border-slate-200 text-slate-600 bg-white';
                        let optLetterStyle = 'bg-slate-100 text-slate-500';
                        let checkboxStyle = isChosen 
                          ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold' 
                          : 'bg-white border-slate-300 text-slate-300';

                        if (isCorrectKey) {
                          optStyle = 'border-emerald-400 text-emerald-950 bg-emerald-55 bg-emerald-50 font-semibold';
                          optLetterStyle = 'bg-emerald-500 text-white';
                          if (isChosen) {
                            checkboxStyle = 'bg-emerald-600 text-white border-emerald-700 font-extrabold';
                          }
                        } else if (isChosen && !isCor) {
                          optStyle = 'border-rose-350 text-rose-950 bg-rose-50 font-medium';
                          optLetterStyle = 'bg-rose-500 text-white';
                          checkboxStyle = 'bg-rose-600 text-white border-rose-700 font-extrabold';
                        }

                        return (
                          <div key={opt.key} className={`border p-2.5 rounded-xl flex items-start gap-2.5 ${optStyle}`}>
                            <div className="flex items-center gap-1.5 shrink-0 select-none">
                              {/* Square box marked with bold X showing candidate choice selection */}
                              <div className={`w-5 h-5 rounded border flex items-center justify-center font-mono text-[11px] font-black shadow-sm ${checkboxStyle}`}>
                                {isChosen ? 'X' : ' '}
                              </div>
                              <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center font-mono font-black text-[10px] uppercase ${optLetterStyle}`}>
                                {opt.key}
                              </span>
                            </div>
                            <span className="flex-1 text-[11px] leading-relaxed pt-0.5">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Meta-Choice Details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-1.5 border-t border-slate-100 text-[11px] font-medium">
                      <div>Đáp án lựa chọn của bạn: <strong className={isCor ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>{cleanUserAns}</strong></div>
                      <div>Đáp án chính xác: <strong className="text-emerald-700 font-bold">{cleanCorAns}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 1. On-Screen Interactive Print Preview Modal Overlay */}
      <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto align-middle animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
          
          {/* Action Header bar inside preview window */}
          <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base leading-none">Bản in Kết Quả Thi</h3>
                <span className="text-[10px] text-slate-400 font-mono">Bảng báo cáo đầy đủ tối ưu chuẩn A4 PDF</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerPrint}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition active:scale-95 cursor-pointer shadow-md shadow-indigo-900/30 font-sans"
              >
                <Printer className="w-4 h-4 animate-bounce" />
                <span>In Báo Cáo / Xuất PDF</span>
              </button>

              <button
                onClick={handleExportToGoogleDocs}
                disabled={exportingDoc}
                className={`text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition active:scale-95 cursor-pointer shadow-md shadow-indigo-900/30 font-sans ${
                  exportingDoc 
                    ? 'bg-slate-700 text-slate-400' 
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-100 animate-pulse" />
                <span>{exportingDoc ? 'Đang lưu Docs...' : 'Lưu Vào Google Docs'}</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition active:scale-90 cursor-pointer"
                title="Đóng bảng xem trước"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tips notification */}
          <div className="bg-amber-50 border-b border-amber-100 p-3 text-center text-[10px] font-semibold text-amber-800 flex items-center justify-center gap-1 px-4 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Mẹo: Trong hộp thoại In mở ra, chọn <strong>"Lưu dưới dạng PDF"</strong> (Save as PDF) và tick chọn <strong>"Đồ họa nền"</strong> (Background graphics) để giữ màu sắc chuẩn nhất!</span>
          </div>

          {docUrl && (
            <div className="bg-emerald-100 border-b border-emerald-250 p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 animate-fade-in font-sans">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                Đồng bộ báo cáo bồi dưỡng lên Google Drive thành công!
              </span>
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition text-xs"
              >
                Mở trong Google Docs →
              </a>
            </div>
          )}

          {docError && (
            <div className="bg-rose-100 border-b border-rose-250 p-3.5 text-xs text-rose-950 flex items-center gap-1.5 px-6 animate-fade-in font-sans">
              <span>⚠️ <strong>Lỗi liên kết:</strong> {docError}</span>
            </div>
          )}

          {/* Preview canvas section scrollable */}
          <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 flex justify-center">
            {/* Styled card mirroring paper standard dimensions */}
            <div className="bg-white w-full max-w-3xl shadow-md rounded-2xl overflow-hidden border border-slate-200">
              {renderReportContent(true)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Quay Lại Luyện Học
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hidden absolute print area strictly rendered for the browser print thread */}
      <div id="print-area">
        {renderReportContent(false)}
      </div>
    </>
  );
}
