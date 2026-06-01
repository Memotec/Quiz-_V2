import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAnswer, QuizMode, ExamHistoryItem, SavedQuizSession } from '../types';
import { ChevronLeft, ChevronRight, Bookmark, ArrowLeft, Send, Check, X, Timer, HelpCircle, Activity, Award, LogOut, RefreshCw, Eye, EyeOff, Maximize2, Minimize2, Type, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAccessToken, googleSignIn } from '../utils/googleAuth';
import { exportExamToGoogleDoc, compileReportToText } from '../utils/docsApi';

interface QuizEngineProps {
  questions: Question[];
  mode: QuizMode;
  questionCount: number;
  selectedCategories: string[];
  shuffle: boolean;
  durationMinutes: number;
  onExit: () => void;
  onSaveHistory: (item: Omit<ExamHistoryItem, 'id' | 'date'>) => void;
  onPrintReport?: (data: any) => void;
  restoredSession?: SavedQuizSession | null;
  currentUser?: any;
}

export default function QuizEngine({
  questions,
  mode,
  questionCount,
  selectedCategories,
  shuffle,
  durationMinutes,
  onExit,
  onSaveHistory,
  onPrintReport,
  restoredSession,
  currentUser
}: QuizEngineProps) {
  // Prep question array on startup
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => {
    if (restoredSession) {
      return restoredSession.sessionQuestions;
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (restoredSession) {
      return restoredSession.currentIndex;
    }
    return 0;
  });
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>(() => {
    if (restoredSession) {
      return restoredSession.answers;
    }
    return {};
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (restoredSession) {
      return restoredSession.timeRemaining;
    }
    return durationMinutes * 60;
  });
  const [timeSpent, setTimeSpent] = useState<number>(() => {
    if (restoredSession) {
      return restoredSession.timeSpent;
    }
    return 0;
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter keys for feedback review
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'flagged'>('all');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Focus & size optimization states
  const [isFocusMode, setIsFocusMode] = useState<boolean>(true); // default to true to increase concentration immediately
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl' | '2xl'>('xl'); // default to 'xl' for bold and distinct readability

  // Ref to track if we initialized from a restored session to bypass the re-shuffling useEffect
  const restoredRef = useRef<boolean>(!!restoredSession);

  // Submit confirmation modal state
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Google Docs export states
  const [exportingDoc, setExportingDoc] = useState<boolean>(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // Sync fullscreen change listener to support Esc key exits gracefully
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.warn("Fullscreen request rejected. Using simulated full-viewport focus state instead.", err);
          setIsFullscreen(!isFullscreen); // Toggle simulated mode
        });
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => {
          console.warn("Error exiting fullscreen. Toggling simulated state.", err);
          setIsFullscreen(false);
        });
    }
  };

  // Initialize questions
  useEffect(() => {
    if (restoredRef.current) {
      // Bypassed fresh initialization pool on startup as we restored from localStorage.
      // Next time props change, it will reset normally so we disable the flag.
      restoredRef.current = false;

      // Launch the timer immediately on restored session
      if (mode === 'exam') {
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              handleForceSubmit();
              return 0;
            }
            return prev - 1;
          });
          setTimeSpent(prev => prev + 1);
        }, 1000);
      } else {
        timerRef.current = setInterval(() => {
          setTimeSpent(prev => prev + 1);
        }, 1000);
      }

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    // 1. Filter by category
    let pool = [...questions];
    
    // 2. Shuffle if requested
    if (shuffle) {
      pool = pool.sort(() => Math.random() - 0.5);
    } else {
      // Sort by STT
      pool = pool.sort((a,b) => a.stt - b.stt);
    }

    // 3. Take the count
    const limit = questionCount === -1 ? pool.length : Math.min(questionCount, pool.length);
    const selected = pool.slice(0, limit);
    
    setSessionQuestions(selected);
    
    // Initialize answers map
    const initialAnswers: Record<string, UserAnswer> = {};
    selected.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOptionKey: null,
        isCorrect: null,
        isFlagged: false
      };
    });
    setAnswers(initialAnswers);
    setCurrentIndex(0);
    setIsCompleted(false);
    setTimeRemaining(durationMinutes * 60);
    setTimeSpent(0);

    // Build timer
    if (mode === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      // Just track elapsed time for practice
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, mode, questionCount, selectedCategories, shuffle, durationMinutes]);

  // Effect to automatically save ongoing quiz progress to localStorage
  useEffect(() => {
    if (sessionQuestions.length > 0 && !isCompleted) {
      try {
        const stateToSave: SavedQuizSession = {
          mode,
          questionCount,
          selectedCategories,
          shuffle,
          durationMinutes,
          sessionQuestions,
          currentIndex,
          answers,
          timeRemaining,
          timeSpent
        };
        localStorage.setItem('vccs_active_quiz_session', JSON.stringify(stateToSave));
      } catch (err) {
        console.warn('Lỗi lưu tiến trình thi sang localStorage:', err);
      }
    }
  }, [currentIndex, answers, timeRemaining, timeSpent, sessionQuestions, isCompleted, mode, questionCount, selectedCategories, shuffle, durationMinutes]);

  // Effect to clean up stored active session when quiz is completed
  useEffect(() => {
    if (isCompleted) {
      localStorage.removeItem('vccs_active_quiz_session');
    }
  }, [isCompleted]);

  const handleForceSubmit = () => {
    setIsCompleted(true);
  };

  // Option selection
  const handleSelectOption = (optionKey: string) => {
    if (isCompleted) return;
    const currentQ = sessionQuestions[currentIndex];
    if (!currentQ) return;

    const isCorrect = optionKey.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

    // In practice mode, users can click to answer.
    // In exam mode, they can do same, but we show no correctness colors until completed.
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOptionKey: optionKey,
        isCorrect: mode === 'practice' ? isCorrect : null
      }
    }));
  };

  // Flag toggle
  const toggleFlag = () => {
    const currentQ = sessionQuestions[currentIndex];
    if (!currentQ) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isFlagged: !prev[currentQ.id]?.isFlagged
      }
    }));
  };

  // Submit test
  const handleSubmitTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalQ = sessionQuestions.length;
    let correctCount = 0;
    const finalizedAnswers = { ...answers };

    sessionQuestions.forEach(q => {
      const ansObj = finalizedAnswers[q.id] || {
        selectedOptionKey: null,
        isCorrect: false,
        isFlagged: false
      };
      finalizedAnswers[q.id] = ansObj;
      const isCorrect = ansObj?.selectedOptionKey?.trim().toLowerCase() === q.answer.trim().toLowerCase();
      ansObj.isCorrect = isCorrect;
      if (isCorrect) {
        correctCount++;
      }
    });

    setAnswers(finalizedAnswers);
    setIsCompleted(true);

    // Convert score out of 10
    const rawScore = (correctCount / totalQ) * 10;
    const roundedScore = Math.round(rawScore * 10) / 10;
    const passed = roundedScore >= 7.0; // 7.0 passing grade standard Vietnamese rating

    // Save detailed results for PDF export
    try {
      const detailedReport = {
        date: new Date().toISOString(),
        mode: mode,
        categoryName: selectedCategories.length === 4 ? "Tất cả" : selectedCategories.join(', '),
        totalQuestions: totalQ,
        correctAnswersCount: correctCount,
        score: roundedScore,
        timeSpentSeconds: timeSpent,
        passed: passed,
        questions: sessionQuestions,
        answers: finalizedAnswers
      };
      localStorage.setItem('vccs_recent_exam_details', JSON.stringify(detailedReport));
    } catch (err) {
      console.error('Lỗi lưu báo cáo chi tiết:', err);
    }

    // Save to server/local history
    onSaveHistory({
      mode: mode,
      categoryName: selectedCategories.length === 4 ? "Tất cả" : selectedCategories.join(', '),
      totalQuestions: totalQ,
      correctAnswersCount: correctCount,
      score: roundedScore,
      timeSpentSeconds: timeSpent,
      passed: passed
    });
  };

  // Export results to Google Docs using Docs API
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
          throw new Error('Bạn cần đăng nhập bằng tài khoản Google để xuất file bồi dưỡng.');
        }
      }

      const totalQ = sessionQuestions.length;
      const correctCount = (Object.values(answers) as UserAnswer[]).filter(a => a.isCorrect === true).length;
      const finalScore = Math.round(((correctCount / totalQ) * 10) * 10) / 10;
      const passed = finalScore >= 7.0;

      const reportData = {
        date: new Date().toISOString(),
        mode: mode,
        categoryName: selectedCategories.length === 4 ? "Tất cả" : selectedCategories.join(', '),
        totalQuestions: totalQ,
        correctAnswersCount: correctCount,
        score: finalScore,
        timeSpentSeconds: timeSpent,
        passed: passed,
        questions: sessionQuestions,
        answers: answers
      };

      const email = currentUser?.email || 'Thí sinh tự do';
      const docTitle = `Ket qua sat hach VCCS 4G - ${email.split('@')[0]} - ${new Date().toLocaleDateString('vi-VN')}`;
      const reportText = compileReportToText(reportData, email);

      const result = await exportExamToGoogleDoc(docTitle, reportText, token);
      if (result.error) {
        throw new Error(result.error);
      }

      setDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error('Lỗi xuất Google Docs:', err);
      setDocError(err.message || 'Lỗi không xác định khi liên kết xuất Google Docs.');
    } finally {
      setExportingDoc(false);
    }
  };

  // Time format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = sessionQuestions[currentIndex];
  const totalQuestionsCount = sessionQuestions.length;
  
  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Question navigation list
  const activeAnswer = answers[currentQuestion.id];
  const isSelected = activeAnswer?.selectedOptionKey !== null;

  // Grade Screen layout
  if (isCompleted) {
    // Generate overall results
    const totalQ = sessionQuestions.length;
    const correctCount = (Object.values(answers) as UserAnswer[]).filter(a => a.isCorrect === true).length;
    const finalScore = Math.round(((correctCount / totalQ) * 10) * 10) / 10;
    const ratioPercentage = Math.round((correctCount / totalQ) * 100);
    const passed = finalScore >= 7.0;

    // Filtered questions for the feedback list
    const filteredReviewQuestions = sessionQuestions.filter(q => {
      const ansObj = answers[q.id];
      if (reviewFilter === 'all') return true;
      if (reviewFilter === 'correct') return ansObj && ansObj.isCorrect === true;
      if (reviewFilter === 'incorrect') return ansObj && (ansObj.isCorrect === false || ansObj.selectedOptionKey === null);
      if (reviewFilter === 'flagged') return ansObj && ansObj.isFlagged === true;
      return true;
    });

    const displayMinsSpent = Math.floor(timeSpent / 60);
    const displaySecsSpent = timeSpent % 60;

    // Scroll to detail handler
    const handleScrollToQuestion = (questionId: string, isCorrect: boolean, isUnanswered: boolean) => {
      // Guarantee visibility by adjusting filter if the question isn't present
      if (reviewFilter !== 'all') {
        if (reviewFilter === 'correct' && !isCorrect) {
          setReviewFilter('all');
        } else if (reviewFilter === 'incorrect' && isCorrect) {
          setReviewFilter('all');
        }
      }

      // Wait a frame for React state update before querying DOM
      setTimeout(() => {
        const el = document.getElementById(`review-card-${questionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Clear any active highlights
          document.querySelectorAll('.flash-highlight-active').forEach(item => {
            item.classList.remove('ring-4', 'ring-indigo-500/50', 'bg-indigo-50/10', 'flash-highlight-active');
          });
          
          // Apply highlight visual effect
          el.classList.add('ring-4', 'ring-indigo-500/50', 'bg-indigo-50/10', 'flash-highlight-active');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-indigo-500/50', 'bg-indigo-50/10', 'flash-highlight-active');
          }, 3500);
        }
      }, 80);
    };

    return (
      <div className="space-y-6" id="quiz-completed-review-root">
        {/* Exam Results Scorecard Hero */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                passed 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT HẠNG'}
              </span>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                {passed 
                  ? 'Chúc Mừng! Bạn Đã Vượt Qua Học Phần 🎉' 
                  : 'Tiếc Quá! Hãy Xem Lại Và Cố Gắng Thêm Lần Sau 💪'
                }
              </h2>
              <p className="text-sm text-slate-500 max-w-xl">
                Bạn đã hoàn thành bài {mode === 'practice' ? 'luyện tập tự do' : 'thi thử tính giờ'} gồm {totalQ} câu hỏi. Dưới đây là thống kê chi tiết hiệu suất trả lời câu hỏi và kết quả đánh giá kỹ năng của bạn.
              </p>

              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Thời gian học</span>
                  <span className="text-sm font-bold text-slate-700">{displayMinsSpent} phút {displaySecsSpent === 0 ? '' : `${displaySecsSpent} giây`}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Chế độ bài làm</span>
                  <span className="text-sm font-bold text-slate-700 uppercase">{mode === 'practice' ? 'Luyện tập' : 'Thi thử'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Số câu chính xác</span>
                  <span className="text-sm font-bold text-slate-700">{correctCount} / {totalQ} câu</span>
                </div>
              </div>
            </div>

            {/* Score Ring circular visual chart element */}
            <div className="flex flex-col items-center justify-center bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative min-w-[200px]">
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke={passed ? '#10b981' : '#f43f5e'}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - ratioPercentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold text-slate-800 font-mono">{finalScore.toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">ĐIỂM SỐ</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase block">{ratioPercentage}% Trả lời đúng</span>
              </div>
            </div>
          </div>

          {/* Interactive Bảng Thống Kê / Bản Đồ Tổng Hợp Chi Tiết */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Bản đồ hiệu suất làm bài chi tiết
              </h4>
              <p className="text-[10px] text-slate-400">Nhấp vào từng câu để di chuyển nhanh đến phần giải thích đáp án và lỗi sai</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
              <div className="bg-emerald-50 border border-emerald-100/80 rounded-xl p-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</span>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">Đáp án đúng</span>
                  <span className="text-xs font-bold text-emerald-800">{correctCount} câu</span>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-100/80 rounded-xl p-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">✗</span>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">Đáp án sai</span>
                  <span className="text-xs font-bold text-rose-800">{(Object.values(answers) as UserAnswer[]).filter(a => a.selectedOptionKey !== null && a.isCorrect === false).length} câu</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100/80 rounded-xl p-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">⚪</span>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">Chưa trả lời</span>
                  <span className="text-xs font-bold text-amber-800">{(Object.values(answers) as UserAnswer[]).filter(a => a.selectedOptionKey === null).length} câu</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3">
              {sessionQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const isCorrect = ans?.isCorrect === true;
                const isUnanswered = ans?.selectedOptionKey === null;

                let cellStyle = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300";
                let badgeChar = "✗";

                if (isUnanswered) {
                  cellStyle = "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300";
                  badgeChar = "—";
                } else if (isCorrect) {
                  cellStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300";
                  badgeChar = "✓";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleScrollToQuestion(q.id, isCorrect, isUnanswered)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${cellStyle}`}
                  >
                    <span>Câu {idx + 1}</span>
                    <span className="opacity-80 font-extrabold">{badgeChar}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3 justify-center lg:justify-start">
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay Lại Trang Chủ
            </button>

            {/* Download PDF button */}
            <button
              onClick={() => {
                const reportData = {
                  date: new Date().toISOString(),
                  mode: mode,
                  categoryName: selectedCategories.length === 4 ? "Tất cả" : selectedCategories.join(', '),
                  totalQuestions: totalQ,
                  correctAnswersCount: correctCount,
                  score: finalScore,
                  timeSpentSeconds: timeSpent,
                  passed: passed,
                  questions: sessionQuestions,
                  answers: answers
                };
                if (onPrintReport) {
                  onPrintReport(reportData);
                }
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              title="Xuất bảng điểm kết quả thi thành PDF chuẩn A4"
            >
              <FileText className="w-4 h-4 text-emerald-100 animate-pulse" />
              Xuất PDF / In Kết Quả
            </button>

            <button
              onClick={handleExportToGoogleDocs}
              disabled={exportingDoc}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
                exportingDoc
                  ? 'bg-slate-100 border border-slate-200 text-slate-400'
                  : 'bg-indigo-600 hover:bg-indigo-705 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              }`}
              title="Xuất bài thi trực tiếp vào tệp Google Docs"
            >
              <FileText className="w-4 h-4 text-indigo-100 animate-pulse" />
              {exportingDoc ? 'Đang xuất Docs...' : 'Xuất Google Docs'}
            </button>

            <button
              onClick={() => {
                // Trigger reload of identical session configuration
                setIsCompleted(false);
                setCurrentIndex(0);
                // Reset state triggers reload inside useEffect
                setAnswers({});
                setTimeSpent(0);
                setTimeRemaining(durationMinutes * 60);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              Làm Lại Đợt Khác
            </button>
          </div>

          {docUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 mt-4">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Đã đồng bộ báo cáo bồi dưỡng lên Google Drive của bạn thành công!
              </span>
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition text-xs"
              >
                Mở trong Google Docs →
              </a>
            </div>
          )}

          {docError && (
            <div className="p-4 bg-rose-50 border border-rose-255 border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-1.5 mt-4">
              <span>⚠️ <strong>Lỗi:</strong> {docError}</span>
            </div>
          )}
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Đáp Án &amp; Xem Lại Câu Hỏi Chi Tiết
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Phân tích từng câu hỏi đã trả lời để học sâu, nhớ kỹ từ lỗi sai</p>
            </div>

            {/* Filter tags toolbar */}
            <div className="flex flex-wrap bg-white border border-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({totalQ})
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'correct' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đúng ({correctCount})
              </button>
              <button
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'incorrect' ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sai / Chưa Làm ({totalQ - correctCount})
              </button>
            </div>
          </div>

          {/* Render target review cards */}
          {filteredReviewQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-12 text-center text-slate-400 text-xs">
              Mục này hiện đang trống. Hãy kiểm tra bộ lọc khác.
            </div>
          ) : (
            <div className="space-y-4" id="review-cards-accordion">
              {filteredReviewQuestions.map((q, qIndex) => {
                const ans = answers[q.id];
                const isUserCorrect = ans?.isCorrect === true;
                
                return (
                  <div 
                    key={q.id} 
                    id={`review-card-${q.id}`}
                    className={`bg-white rounded-2xl border p-5 md:p-6 shadow-sm transition-all duration-200 ${
                      ans?.selectedOptionKey === null 
                        ? 'border-amber-200 bg-amber-50/10'
                        : isUserCorrect 
                          ? 'border-emerald-100 bg-emerald-50/5' 
                          : 'border-rose-100 bg-rose-50/5'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                          Câu {sessionQuestions.indexOf(q) + 1}
                        </span>
                        <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                          {q.category}
                        </span>
                      </div>

                      {/* Display Status tag */}
                      <div>
                        {ans?.selectedOptionKey === null ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            Chưa trả lời
                          </span>
                        ) : isUserCorrect ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Trả lời đúng
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 border border-rose-250 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-0.5">
                            <X className="w-3 h-3" /> Trả lời sai
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-slate-800 font-semibold mt-4 text-sm leading-relaxed">
                      {q.title}
                    </h4>

                    {/* Options list static render */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map(opt => {
                        const isChosen = ans?.selectedOptionKey === opt.key;
                        const isCorrectKey = q.answer.trim().toLowerCase() === opt.key.trim().toLowerCase();

                        let optCardStyle = 'bg-slate-50 text-slate-600 border-slate-100';
                        let optCircleStyle = 'bg-slate-200 text-slate-600';
                        let checkboxStyle = isChosen 
                          ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold' 
                          : 'bg-white border-slate-250 text-slate-350';

                        if (isCorrectKey) {
                          // Correct option is always green
                          optCardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold';
                          optCircleStyle = 'bg-emerald-500 text-white';
                          if (isChosen) {
                            checkboxStyle = 'bg-emerald-600 text-white border-emerald-700 font-extrabold';
                          }
                        } else if (isChosen && !isUserCorrect) {
                          // Wrong user choice is highlighted red
                          optCardStyle = 'bg-rose-50 border-rose-200 text-rose-950 font-semibold';
                          optCircleStyle = 'bg-rose-500 text-white';
                          checkboxStyle = 'bg-rose-600 text-white border-rose-700 font-extrabold';
                        }

                        return (
                          <div 
                            key={opt.key} 
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-all ${optCardStyle}`}
                          >
                            {/* Checkbox marked with 'X' standard format representing candidate choice */}
                            <div className="flex items-center gap-1.5 shrink-0 select-none">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-[11px] font-extrabold font-mono shadow-sm transition-all ${checkboxStyle}`} title={isChosen ? "Đáp án bạn chọn" : "Không chọn"}>
                                {isChosen ? 'X' : ' '}
                              </div>
                              <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-[10.5px] uppercase ${optCircleStyle}`}>
                                {opt.key}
                              </span>
                            </div>
                            <span className="leading-relaxed pt-0.5">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <span>Khoá đáp án chính xác: </span>
                        <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono font-bold">
                          {q.answer}
                        </strong>
                      </div>
                      
                      {ans?.selectedOptionKey && !isUserCorrect && (
                        <div className="text-rose-600 font-medium">
                          Bạn đã chọn: <strong className="uppercase font-mono font-bold bg-rose-50 px-2 py-0.5 rounded">{ans.selectedOptionKey}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ TEST SESSION SCREEN ---
  return (
    <div 
      className="min-h-screen py-8 px-4 flex flex-col items-center justify-center bg-slate-50 transition-all duration-300" 
      id="active-quiz-engine-root"
    >
      {/* Top backlink & utilities toolbar */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between text-xs font-semibold px-2">
        <button
          onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn thoát khỏi lượt làm bài này? Mọi câu trả lời chưa nộp sẽ bị mất.")) {
              localStorage.removeItem('vccs_active_quiz_session');
              onExit();
            }
          }}
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Trang chủ</span>
        </button>

        <div className="flex items-center gap-3 text-slate-400">
          <span>Chế độ: <strong className="text-slate-700 uppercase">{mode === 'practice' ? 'Luyện Lớp' : 'Thi Thử'}</strong></span>
          <span>•</span>
          <span>Đã chọn: <strong className="text-slate-700">{(Object.values(answers) as UserAnswer[]).filter(a => a.selectedOptionKey !== null).length}/{totalQuestionsCount} câu</strong></span>
        </div>
      </div>

      {/* Main Authentic Exam Candidate Window (High Fidelity Replica) */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col">
        {/* Dark Blue/Slate Header Bar */}
        <div className="bg-[#1e293b] px-6 py-4 flex items-center justify-between text-white relative border-t-[5px] border-emerald-500 rounded-t-3xl select-none">
          {/* Candidate identity */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">
              Thí sinh: <strong className="font-extrabold text-white">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'u1'}</strong> {currentUser?.email ? `(${currentUser.email.split('@')[0]})` : '(u1)'}
            </span>
          </div>

          {/* Golden/Amber Timer countdown ticker */}
          <div className="flex items-center font-mono font-extrabold text-[#fbbf24] text-xl md:text-2xl tracking-wide">
            {mode === 'practice' ? formatTime(timeSpent) : formatTime(timeRemaining)}
          </div>
        </div>

        {/* Content Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 bg-white">
          
          {/* LEFT: Question Section (Col 8) */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[420px] space-y-6">
            <div className="space-y-5">
              {/* Question Index title in Violet (#4f46e5) */}
              <div className="flex items-center justify-between">
                <h2 className="text-[#4f46e5] font-bold text-2xl tracking-tight leading-none">
                  Câu {currentIndex + 1}
                </h2>

                {/* Question metadata like status or flag */}
                <div className="flex items-center gap-3">
                  {currentQuestion.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-400 px-2 py-0.5 rounded-md select-none">
                      {currentQuestion.category}
                    </span>
                  )}
                  <button
                    onClick={toggleFlag}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeAnswer?.isFlagged 
                        ? 'bg-amber-100 border-amber-305 text-amber-700' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title="Đánh dấu câu hỏi cần xem lại"
                  >
                    <Bookmark className={`w-4 h-4 ${activeAnswer?.isFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Bold Charcoal Question text */}
              <p className="text-[#1e293b] font-bold text-[17px] md:text-lg leading-relaxed tracking-normal pt-1">
                {currentQuestion.title}
              </p>

              {/* Four options list matching image layout */}
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {currentQuestion.options.map(option => {
                  const optChosen = activeAnswer?.selectedOptionKey === option.key;
                  const isCorrectAnswerKey = option.key === currentQuestion.answer;

                  // CSS styles based on candidate state
                  let btnStyle = 'border-slate-250 bg-white hover:border-indigo-300 hover:bg-slate-50 text-[#1e293b]';
                  let keyLabelStyle = 'text-slate-900';

                  if (mode === 'practice') {
                    if (isSelected) {
                      if (isCorrectAnswerKey) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-[#065f46] font-semibold';
                        keyLabelStyle = 'text-emerald-700';
                      } else if (optChosen) {
                        btnStyle = 'border-rose-400 bg-rose-50 text-[#991b1b] font-semibold';
                        keyLabelStyle = 'text-rose-700';
                      } else {
                        btnStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 pointer-events-none opacity-50';
                        keyLabelStyle = 'text-slate-300';
                      }
                    } else if (optChosen) {
                      btnStyle = 'border-[#4f46e5] bg-indigo-50/50 text-indigo-950 font-bold';
                      keyLabelStyle = 'text-[#4f46e5]';
                    }
                  } else {
                    // Exam mode styling (No correct answer leak, solid color when selected)
                    if (optChosen) {
                      btnStyle = 'bg-[#4f46e5] border-[#4f46e5] text-white font-semibold shadow-md shadow-indigo-100/50';
                      keyLabelStyle = 'text-white';
                    }
                  }

                  return (
                    <button
                      key={option.key}
                      onClick={() => handleSelectOption(option.key)}
                      disabled={mode === 'practice' && isSelected}
                      className={`w-full text-left py-4 px-5 border rounded-xl flex items-start gap-1.5 transition-all select-none cursor-pointer duration-100 ${btnStyle}`}
                    >
                      <span className={`font-bold mr-1 shrink-0 ${keyLabelStyle}`}>
                        {option.key}.
                      </span>
                      <span className="leading-relaxed font-semibold">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Diagnostic Explanation block for practice users */}
              {mode === 'practice' && isSelected && (
                <div className="p-4 rounded-xl text-xs leading-relaxed flex items-start gap-3 mt-4 border bg-indigo-50/40 border-indigo-100/60 text-indigo-900">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
                  <div>
                    <strong className="block font-bold mb-0.5">Giải thích ôn luyện:</strong>
                    Đáp án chính xác là <strong className="uppercase font-mono font-extrabold bg-indigo-100 text-indigo-950 px-1.5 py-0.5 rounded text-[11px]">{currentQuestion.answer}</strong>. {currentQuestion.explanation || 'Hãy lưu ý kiến thức chuyên môn này để làm bài thật tốt ở vòng thi chính thức.'}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Control Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-auto">
              {/* QUAY LẠI Button */}
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex-1 py-3 border border-slate-300 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl bg-white hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-center"
              >
                QUAY LẠI
              </button>

              {/* TIẾP THEO Button */}
              <button
                onClick={() => {
                  if (currentIndex < totalQuestionsCount - 1) {
                    setCurrentIndex(prev => prev + 1);
                  }
                }}
                disabled={currentIndex === totalQuestionsCount - 1}
                className="flex-1 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-center"
              >
                TIẾP THEO
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Progress Tracking Sideboard (Col 4) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-[#f8fafc] border border-slate-100 p-5 md:p-6 rounded-3xl flex flex-col justify-between h-full min-h-[380px] w-full">
              
              {/* TIẾN ĐỘ title header */}
              <div>
                <h4 className="font-bold text-[#1e293b] text-sm tracking-widest uppercase mb-4 select-none">
                  TIẾN ĐỘ
                </h4>

                {/* Grid layout containing question boxes */}
                <div className="grid grid-cols-5 gap-2 md:gap-2.5">
                  {sessionQuestions.map((q, qIdx) => {
                    const ansObj = answers[q.id];
                    const isAns = ansObj?.selectedOptionKey !== null;
                    const isFlag = ansObj?.isFlagged === true;
                    const isCurrent = currentIndex === qIdx;

                    let stateClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                    
                    if (isAns) {
                      stateClass = 'bg-indigo-50 border-indigo-250 text-indigo-700';
                    }
                    if (isFlag) {
                      stateClass = 'bg-amber-50 border-amber-300 text-amber-700';
                    }
                    if (isCurrent) {
                      stateClass = 'bg-[#4f46e5] border-[#4f46e5] text-white font-bold shadow-sm';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(qIdx)}
                        className={`aspect-square w-11 h-11 border text-sm font-semibold rounded-lg flex items-center justify-center transition cursor-pointer select-none ${stateClass}`}
                        title={`Câu hỏi ${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RED "NỘP BÀI" button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-[#ef4444] hover:bg-red-650 hover:bg-[#ee3e3e] text-white text-[13px] font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-center cursor-pointer transition w-full block mt-8 shadow-sm shadow-red-100 duration-150 active:scale-[0.99]"
              >
                NỘP BÀI
              </button>

            </div>
          </div>

        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-50 text-[#ef4444] rounded-full flex items-center justify-center font-bold text-3xl shadow-sm border border-red-100 select-none">
                ⚠️
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-800">
                  Xác Nhận Nộp Bài Thi?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống bồi dưỡng sẽ tự động thu bài, tính thang điểm bách phân, và lập bảng phân tích lỗi sai và đáp án chuẩn form lập tức.
                </p>
              </div>

              {/* Warnings about unanswered questions if any */}
              {(() => {
                const totalQ = sessionQuestions.length;
                const answeredCount = (Object.values(answers) as UserAnswer[]).filter(a => a.selectedOptionKey !== null).length;
                const unansweredCount = totalQ - answeredCount;

                if (unansweredCount > 0) {
                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1 text-left">
                      <p className="font-bold">⚠️ Cảnh báo câu chưa trả lời:</p>
                      <p>Bạn vẫn còn <strong className="font-mono text-sm underline">{unansweredCount}</strong> câu hỏi chưa chọn đáp án trên tổng số {totalQ} câu hỏi.</p>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-950 rounded-xl text-xs text-center font-semibold">
                      ✓ Tuyệt vời! Bạn đã hoàn thành đầy đủ {totalQ}/{totalQ} câu hỏi.
                    </div>
                  );
                }
              })()}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl bg-white hover:bg-slate-50 transition cursor-pointer text-center"
                >
                  Hủy / Làm tiếp
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmitTest();
                  }}
                  className="flex-1 py-3 bg-[#ef4444] hover:bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer text-center"
                >
                  Xác Nhận Nộp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
