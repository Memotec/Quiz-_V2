import React, { useState, useEffect } from 'react';
import { PlayCircle, GraduationCap, Settings2, BookOpen, Clock, Activity, CheckCircle, HelpCircle, Sparkles, Filter, ChevronRight, Award, FileText, User, ShieldCheck } from 'lucide-react';
import { Question, QuizMode, SavedQuizSession } from '../types';
import { motion } from 'motion/react';
import GoogleSheetsConfig from './GoogleSheetsConfig';

interface DashboardProps {
  questions: Question[];
  categories: string[];
  onStartQuiz: (mode: QuizMode, options: { 
    selectedCategories: string[]; 
    questionCount: number; 
    shuffle: boolean;
    durationMinutes: number;
  }) => void;
  syncSource: 'google_sheets' | 'local_backup' | string;
  syncError: string | null;
  onSelectTab: (tab: string) => void;
  stats: {
    totalPractices: number;
    totalExams: number;
    averageExamScore: number;
  };
  onSyncComplete: (questions: Question[], sourceName: string) => void;
  onPrintReport?: (data: any) => void;
  savedSessionData?: SavedQuizSession | null;
  onRestoreSession?: (session: SavedQuizSession) => void;
  onClearSavedSession?: () => void;
  bgSyncEnabled?: boolean;
  onToggleBgSync?: (enabled: boolean) => void;
  isAdmin?: boolean;
}

export default function Dashboard({ 
  questions, 
  categories, 
  onStartQuiz, 
  syncSource, 
  syncError,
  onSelectTab,
  stats,
  onSyncComplete,
  onPrintReport,
  savedSessionData,
  onRestoreSession,
  onClearSavedSession,
  bgSyncEnabled = true,
  onToggleBgSync,
  isAdmin = false
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<QuizMode>('practice');
  const [selectedCats, setSelectedCats] = useState<string[]>(['Tất cả']);
  const [qCount, setQCount] = useState<number>(20);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [recentExam, setRecentExam] = useState<any>(null);

  // Load recent exam details from local storage for quick PDF download
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vccs_recent_exam_details');
      if (raw) {
        setRecentExam(JSON.parse(raw));
      }
    } catch {
      // safe fallback
    }
  }, []);

  const toggleCategory = (cat: string) => {
    if (cat === 'Tất cả') {
      setSelectedCats(['Tất cả']);
      return;
    }
    
    let updated = [...selectedCats].filter(c => c !== 'Tất cả');
    if (updated.includes(cat)) {
      updated = updated.filter(c => c !== cat);
      if (updated.length === 0) {
        updated = ['Tất cả'];
      }
    } else {
      updated.push(cat);
    }
    setSelectedCats(updated);
  };

  const getActiveQuestionPoolSize = () => {
    if (selectedCats.includes('Tất cả')) {
      return questions.length;
    }
    return questions.filter(q => selectedCats.includes(q.category)).length;
  };

  const handleLaunch = () => {
    const finalCats = selectedCats.includes('Tất cả') ? categories : selectedCats;
    const poolSize = getActiveQuestionPoolSize();
    const finalCount = qCount === -1 ? poolSize : Math.min(qCount, poolSize);
    
    onStartQuiz(activeTab, {
      selectedCategories: finalCats,
      questionCount: finalCount,
      shuffle: shuffleQuestions,
      durationMinutes: durationMinutes
    });
  };

  // Preset quick counts based on pool size
  const renderCountButtons = () => {
    const maxPool = getActiveQuestionPoolSize();
    const presets = [10, 20, 30, 50];
    
    return (
      <div className="flex flex-wrap gap-2" id="question-count-presets">
        {presets.map(val => {
          if (val > maxPool) return null;
          return (
            <button
              key={val}
              type="button"
              onClick={() => setQCount(val)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                qCount === val
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {val} câu hỏi
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setQCount(-1)} // -1 is code for "All"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            qCount === -1
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả còn lại ({maxPool})
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="dashboard-root">
      
      {/* Banner / Welcome Hero */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-lg overflow-hidden border border-indigo-950">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none translate-x-12 translate-y-4 scale-110">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        
        <div className="max-w-2xl space-y-4 relative z-10">
          {/* Quick status badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${syncSource === 'google_sheets' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-indigo-200">
              {syncSource === 'google_sheets' ? 'Đã Đồng Bộ Google Sheets' : 'Sử Dụng Dữ Liệu Dự Phòng'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hệ Thống Luyện Thi Lý Thuyết VCCS 4G
          </h2>
          <p className="text-xs md:text-sm text-indigo-150 leading-relaxed max-w-xl">
            Tối ưu hóa kiến thức về TCP/IP, Cấu hình, Khai thác đầu cuối CWP và Phần cứng thông qua các chế độ luyện tập thông minh và thi thử chuẩn cấu trúc.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-indigo-250">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>{questions.length} câu hỏi chuẩn hóa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Thống kê & phân tích trực quan</span>
            </div>
            {syncError && (
              <div className="text-amber-300 flex items-center gap-1" title={syncError}>
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Không kết nối được Google Sheet trực tiếp (đang dùng offline)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Active Saved Session Banner */}
      {savedSessionData && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center md:justify-between gap-5 animate-pulse-subtle">
          <div className="flex items-start gap-3.5 text-amber-900">
            <div className="p-3 bg-amber-500/15 text-amber-700 rounded-2xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm tracking-tight text-amber-950">Bạn có lượt thi/luyện tập đang dở dang!</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Hệ thống phát hiện có một lượt <strong>{savedSessionData.mode === 'practice' ? 'Luyện tập' : 'Thi thử'}</strong> ({savedSessionData.sessionQuestions.length} câu) chưa hoàn thành.
                Thời gian đã làm: <strong>{Math.floor(savedSessionData.timeSpent / 60)} phút {savedSessionData.timeSpent % 60} giây</strong>. Bạn có muốn tiếp tục làm tiếp không?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onRestoreSession?.(savedSessionData)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              Tiếp Tục Làm Bài
            </button>
            <button
              onClick={onClearSavedSession}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200/80 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Bỏ Qua & Xóa
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Category overview Cards */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {isAdmin ? (
            <GoogleSheetsConfig 
              onSyncComplete={onSyncComplete} 
              currentQuestionsCount={questions.length} 
            />
          ) : (
            <div className="bg-gradient-to-br from-[#ebd8ba]/10 via-amber-50/5 to-slate-50 p-5 rounded-3xl border border-[#ebd8ba]/30 shadow-sm space-y-4" id="candidate-profile-summary-card">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                  <User className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">Hồ Sơ Thí Sinh</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Báo cáo năng lực học tập cá nhân</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Vai trò chính:</span>
                  <span className="font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded text-[10px] uppercase font-mono">Thí sinh</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Lượt luyện tập:</span>
                  <span className="font-mono font-bold text-slate-700">{stats.totalPractices} lượt</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Lượt thi thử:</span>
                  <span className="font-mono font-bold text-slate-700">{stats.totalExams} lượt</span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                💡 Cổng luyện thi hỗ trợ tự do <strong>Luyện tập</strong> hoặc <strong>Thi thử</strong>. Toàn bộ đáp án đúng/sai, thời gian làm và học bạ điện tử sẽ được lưu trữ và bồi đắp liên tục trên đám mây.
              </div>
            </div>
          )}
          
          {/* Beautiful Recent Exam Card with PDF export */}
          {recentExam && (
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-inner">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider block">Bài thi thử gần nhất</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {new Date(recentExam.date).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white border border-indigo-50/50 p-2.5 rounded-xl shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Điểm số</span>
                  <span className="text-sm font-black font-mono text-indigo-650">{recentExam.score.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">/10</span></span>
                </div>
                <div className="bg-white border border-indigo-50/50 p-2.5 rounded-xl shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Kết quả</span>
                  <span className={`text-xs font-black block mt-0.5 tracking-wider ${recentExam.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {recentExam.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onPrintReport && onPrintReport(recentExam)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-indigo-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-98"
                title="Xuất PDF chi tiết bài thi để lưu trữ kết quả học tập"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Xuất kết quả PDF (A4)
              </button>
            </div>
          )}
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Phân Phối Theo Chủ Đề
            </h3>
            
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {categories.map((cat, idx) => {
                const count = questions.filter(q => q.category === cat).length;
                const ratio = Math.round((count / questions.length) * 100);
                
                let iconBg = 'bg-amber-100 text-amber-800';
                if (cat === 'Khai thác đầu cuối CWP') iconBg = 'bg-emerald-100 text-emerald-800';
                if (cat === 'Phần cứng') iconBg = 'bg-[#a36a28]/20 text-[#8c5211]';
                if (cat === 'Cấu hình') iconBg = 'bg-[#ebd8ba]/30 text-[#8c5211]';

                return (
                  <div key={cat} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${iconBg}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-700 block max-w-[150px] md:max-w-xs truncate" title={cat}>
                          {cat}
                        </span>
                        <span className="text-[10px] text-slate-400">{count} câu hỏi ({ratio}%)</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCats([cat]);
                        onSelectTab('browser');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                      title="Xem ngân hàng câu hỏi"
                    >
                      Xem <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Configuration & Launch panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              Thiết Lập Phiên Làm Bài
            </h3>
            
            {/* Mode switch */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('practice');
                  setQCount(20);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'practice'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Luyện Tập
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('exam');
                  setQCount(30); // Default 30 questions for exam
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'exam'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Thi Thử
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Description of active mode */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-indigo-950 text-xs leading-relaxed flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              {activeTab === 'practice' ? (
                <div>
                  <strong className="text-indigo-900 block font-semibold mb-0.5">💡 Chế độ Luyện Tập:</strong>
                  Thích hợp cho ôn luyện tự do. Bạn có thể xem kết quả đúng/sai ngay lập tức ở từng câu trả lời. Bộ đếm ngược thời gian sẽ không áp đặt, cho phép bạn học tập thoải mái không áp lực.
                </div>
              ) : (
                <div>
                  <strong className="text-purple-900 block font-semibold mb-0.5">⏱️ Chế độ Thi Thử Tính Giờ:</strong>
                  Sát hạch năng lực thực tế. Kết quả chỉ được tiết lộ sau khi bạn bấm <strong>"Nộp bài"</strong> hoặc hết giờ làm bài hoàn toàn. Bạn có thể đánh dấu câu hỏi cần xem lại để quản lý thời gian thi tốt hơn.
                </div>
              )}
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Bước 1: Chọn phạm vi câu hỏi
              </span>
              <div className="flex flex-wrap gap-2" id="category-selector-pills">
                <button
                  type="button"
                  onClick={() => toggleCategory('Tất cả')}
                  className={`px-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCats.includes('Tất cả')
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả chủ đề
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCats.includes(cat)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions count Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Bước 2: Chọn số lượng câu hỏi
              </span>
              {renderCountButtons()}
            </div>

            {/* Advanced configurations toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              
              {/* Shuffle configuration */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Xáo trộn câu hỏi</span>
                  <span className="text-[10px] text-slate-400">Đảo thứ tự câu và các phương án</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShuffleQuestions(!shuffleQuestions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shuffleQuestions ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Countdown time timer limit for Exam */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl relative">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Thời gian thi thử</span>
                  <span className="text-[10px] text-slate-400">Tính giờ làm bài (phút)</span>
                </div>
                {activeTab === 'exam' ? (
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 text-indigo-700 hover:border-slate-300 rounded-lg p-1.5 text-xs font-bold focus:outline-none"
                    id="select-duration-minutes"
                  >
                    <option value={10}>10 phút</option>
                    <option value={20}>20 phút</option>
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                  </select>
                ) : (
                  <span className="text-xs text-slate-400 italic">Không giới hạn</span>
                )}
              </div>

            </div>

            {/* Launch Action Button */}
            <button
              onClick={handleLaunch}
              className="w-full mt-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all animate-bounce-slow"
              id="btn-start-quiz-session"
            >
              <PlayCircle className="w-5 h-5" />
              Bắt đầu {activeTab === 'practice' ? 'Luyện Tập' : 'Thi Thử'} Thử Thách
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
