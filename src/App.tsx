import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  RefreshCw, 
  Github, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  LogIn,
  LogOut,
  User,
  CloudLightning,
  ShieldCheck
} from 'lucide-react';
import { syncQuestionsFromSheet } from './utils/sync';
import { Question, QuizMode, ExamHistoryItem, AppStats, SavedQuizSession } from './types';
import Dashboard from './components/Dashboard';
import QuestionBrowser from './components/QuestionBrowser';
import QuizEngine from './components/QuizEngine';
import HistoryStats from './components/HistoryStats';
import ExamReportPDF from './components/ExamReportPDF';
import AdminConsole from './components/AdminConsole';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './utils/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [syncSource, setSyncSource] = useState<'google_sheets' | 'local_backup' | string>('local_backup');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard'); // dashboard, browser, stats
  
  // Firebase AUTH State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSyncingHistory, setIsSyncingHistory] = useState<boolean>(false);
  const [bgSyncEnabled, setBgSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vccs_bg_sync_enabled') !== 'false';
  });

  // Dynamic Viewport Mode (Responsive Desktop vs Simulated Mobile Phone Chassis)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>(() => {
    return (localStorage.getItem('vccs_device_mode') as 'responsive' | 'mobile') || 'mobile';
  });

  const handleToggleDeviceMode = (mode: 'responsive' | 'mobile') => {
    setDeviceMode(mode);
    localStorage.setItem('vccs_device_mode', mode);
  };

  // Google Sheet integration sync callback
  const handleGoogleSheetSyncComplete = (newQuestions: Question[], sourceName: string) => {
    setQuestions(newQuestions);
    setSyncSource(sourceName);
    setSyncError(null);
  };
  
  // Active quiz session states
  const [activeSession, setActiveSession] = useState<{
    mode: QuizMode;
    questionCount: number;
    selectedCategories: string[];
    shuffle: boolean;
    durationMinutes: number;
    restoredSession?: SavedQuizSession | null;
  } | null>(null);

  const [savedSessionData, setSavedSessionData] = useState<SavedQuizSession | null>(null);

  // Score History state
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [printData, setPrintData] = useState<any>(null);

  // Unique categories list
  const categories = useMemo(() => {
    if (questions.length === 0) return [];
    return Array.from(new Set(questions.map(q => q.category)));
  }, [questions]);

  // Sync questions from Google Sheet
  const loadQuestions = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsLoading(true);
    const result = await syncQuestionsFromSheet();
    setQuestions(result.questions);
    setSyncSource(result.source);
    setSyncError(result.error);
    setIsLoading(false);
  };

  // Periodic background sync of questions based on global setting
  useEffect(() => {
    if (!bgSyncEnabled) return;
    
    // Periodically fetch every 3 minutes
    const interval = setInterval(() => {
      console.log('Background refreshing questions list from Google Sheets source...');
      loadQuestions(false);
    }, 3 * 60 * 1050);

    return () => clearInterval(interval);
  }, [bgSyncEnabled]);

  // Listen for Authentication state change and fetch/sync history to/from Firestore
  useEffect(() => {
    loadQuestions();

    // Check for saved quiz progress in localStorage on mount
    try {
      const stored = localStorage.getItem('vccs_active_quiz_session');
      if (stored) {
        setSavedSessionData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Lỗi phân tích phiên học lý thuyết đang làm dở:', e);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        // 1. Sync / Save user profile to Firestore `/users/{userId}`
        const userPath = `users/${firebaseUser.uid}`;
        try {
          await setDoc(doc(db, userPath), {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn('Lỗi ghi thông tin người dùng vào Firestore:', err);
        }

        // 2. Load and reconcile history from Firestore subcollection
        setIsSyncingHistory(true);
        const historyPath = `users/${firebaseUser.uid}/history`;
        try {
          const snapshot = await getDocs(collection(db, historyPath));
          const cloudHistory: ExamHistoryItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            cloudHistory.push({
              id: data.id,
              date: data.date,
              mode: data.mode,
              categoryName: data.categoryName,
              totalQuestions: data.totalQuestions,
              correctAnswersCount: data.correctAnswersCount,
              score: data.score,
              timeSpentSeconds: data.timeSpentSeconds,
              passed: data.passed
            });
          });

          // Reconcile with local localStorage history
          const localString = localStorage.getItem('vccs_quiz_history_v2');
          const localHistory: ExamHistoryItem[] = localString ? JSON.parse(localString) : [];

          // Union map to avoid duplicates, key is history item ID
          const mergedMap = new Map<string, ExamHistoryItem>();
          cloudHistory.forEach(item => mergedMap.set(item.id, item));

          const pendingUploads: ExamHistoryItem[] = [];
          localHistory.forEach(item => {
            if (!mergedMap.has(item.id)) {
              mergedMap.set(item.id, item);
              pendingUploads.push(item);
            }
          });

          // Convert back to list and sort chronologically ascending (as expected by standard reverse renderer)
          const mergedList = Array.from(mergedMap.values());
          mergedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setHistory(mergedList);
          localStorage.setItem('vccs_quiz_history_v2', JSON.stringify(mergedList));

          // Batch upload any missing local sessions to Cloud
          if (pendingUploads.length > 0) {
            const batch = writeBatch(db);
            pendingUploads.forEach((item) => {
              const itemRef = doc(db, `users/${firebaseUser.uid}/history/${item.id}`);
              batch.set(itemRef, {
                ...item,
                userId: firebaseUser.uid,
                createdAt: serverTimestamp()
              });
            });
            await batch.commit();
            console.log(`Đã đồng bộ lên Cloud ${pendingUploads.length} bài làm cũ`);
          }

        } catch (err) {
          console.error('Lỗi đồng bộ lịch sử từ Cloud:', err);
        } finally {
          setIsSyncingHistory(false);
        }
      } else {
        // Offline / Unauthenticated fallback
        try {
          const stored = localStorage.getItem('vccs_quiz_history_v2');
          if (stored) {
            setHistory(JSON.parse(stored));
          } else {
            setHistory([]);
          }
        } catch (e) {
          setHistory([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Login handler
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Lỗi đăng nhập Google Auth:', err);
    }
  };

  // Logout handler
  const handleSignOut = async () => {
    try {
      if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản? Kết quả làm bài sẽ tiếp tục được lưu ngoại tuyến ở trình duyệt này.')) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  // Save history item handler (Both local storage state and Firestore cloud syncing)
  const handleSaveHistory = async (newItem: Omit<ExamHistoryItem, 'id' | 'date'>) => {
    const freshItem: ExamHistoryItem = {
      ...newItem,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString()
    };
    
    const updatedHistory = [...history, freshItem];
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem('vccs_quiz_history_v2', JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Lỗi lưu lịch sử làm bài vào localStorage:', err);
    }

    // Save to Firestore subcollection if logged in
    if (auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const path = `users/${userUid}/history/${freshItem.id}`;
      try {
        await setDoc(doc(db, path), {
          ...freshItem,
          userId: userUid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  // Clean / Clear history log
  const handleClearHistory = async () => {
    const backupHistory = [...history];
    setHistory([]);
    try {
      localStorage.removeItem('vccs_quiz_history_v2');
      
      // Delete from Firestore
      if (auth.currentUser) {
        const userUid = auth.currentUser.uid;
        const batch = writeBatch(db);
        backupHistory.forEach((item) => {
          const path = `users/${userUid}/history/${item.id}`;
          batch.delete(doc(db, path));
        });
        await batch.commit();
      }
    } catch (err) {
      console.error('Lỗi làm sạch dữ liệu lịch sử:', err);
    }
  };

  // Compute aggregated statistics from history
  const stats = useMemo((): AppStats => {
    const practices = history.filter(h => h.mode === 'practice');
    const exams = history.filter(h => h.mode === 'exam');
    
    // Avg exam score calculation
    const totalExamScores = exams.reduce((acc, h) => acc + h.score, 0);
    const avgScore = exams.length > 0 ? totalExamScores / exams.length : 0;
    
    // Passing count rate
    const passedCount = exams.filter(h => h.passed).length;
    const passRate = exams.length > 0 ? (passedCount / exams.length) * 100 : 0;

    // Correct rates breakdown by categories based on questions
    // Map of Category -> { correctCount, totalAnsweredPool }
    const catRate: Record<string, { correct: number; total: number }> = {};
    
    // Populate with categories we found
    categories.forEach(cat => {
      catRate[cat] = { correct: 0, total: 0 };
    });

    // Populate using quiz statistics or just simple default structure
    // Let's compute weights based on actual exams completed
    history.forEach(item => {
      // For each item, add the correct count to its specified category name
      // If it is "Tất cả", distribute proportional or add to each
      const catsInvolved = item.categoryName === 'Tất cả' ? categories : item.categoryName.split(',').map(s => s.trim());
      
      catsInvolved.forEach(catName => {
        if (catRate[catName]) {
          // Approximate distributed correctness
          const proportionAnswered = item.totalQuestions / catsInvolved.length;
          const proportionCorrect = item.correctAnswersCount / catsInvolved.length;
          
          catRate[catName].total += Math.round(proportionAnswered);
          catRate[catName].correct += Math.round(proportionCorrect);
        }
      });
    });

    // Ensure we don't have zeros if categories lists have no records yet
    categories.forEach(cat => {
      if (catRate[cat].total === 0) {
        // Set zero default
        catRate[cat] = { correct: 0, total: 0 };
      }
    });

    return {
      totalPractices: practices.length,
      totalExams: exams.length,
      averageExamScore: avgScore,
      passingRate: passRate,
      categoryCorrectRate: catRate
    };
  }, [history, categories]);

  // Navigation tab switcher template helper
  const handleStartSession = (mode: QuizMode, options: { 
    selectedCategories: string[]; 
    questionCount: number; 
    shuffle: boolean;
    durationMinutes: number;
  }) => {
    setActiveSession({
      mode,
      ...options
    });
  };

  const handleRestoreSession = (session: SavedQuizSession) => {
    setActiveSession({
      mode: session.mode,
      questionCount: session.questionCount,
      selectedCategories: session.selectedCategories,
      shuffle: session.shuffle,
      durationMinutes: session.durationMinutes,
      restoredSession: session
    });
    setSavedSessionData(null);
  };

  const handleClearSavedSession = () => {
    if (confirm('Bạn có chắc chắn muốn xóa lượt lưu trữ bài thi đang dở dang này không?')) {
      localStorage.removeItem('vccs_active_quiz_session');
      setSavedSessionData(null);
    }
  };

  const handleExitSession = () => {
    localStorage.removeItem('vccs_active_quiz_session');
    setSavedSessionData(null);
    setActiveSession(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white flex flex-col" id="main-app-container">
      {/* Top Controller Bar - lets users choose and toggle layouts comfortably */}
      <div className="bg-slate-900 border-b border-slate-800 text-white text-[10.5px] px-4 py-2 flex items-center justify-between shrink-0 select-none z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider font-mono text-slate-300">
            CHẾ ĐỘ HIỂN THỊ HỆ THỐNG
          </span>
        </div>
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => handleToggleDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-indigo-650 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 Di Động (Khuyên Dùng)
          </button>
          <button
            onClick={() => handleToggleDeviceMode('responsive')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
              deviceMode === 'responsive'
                ? 'bg-indigo-650 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💻 Toàn Màn Hình
          </button>
        </div>
      </div>

      {/* Simulator view wrapper framing */}
      <div className={`flex-1 flex flex-col justify-center items-center ${deviceMode === 'mobile' ? 'md:bg-slate-950 md:py-6 md:px-4' : 'bg-slate-50/50'}`} id="viewport-layout-wrapper">
        <div 
          className={`w-full flex-1 flex flex-col transition-all duration-300 ${
            deviceMode === 'mobile' 
              ? 'md:max-w-[430px] md:h-[860px] md:max-h-[92vh] md:rounded-[48px] md:border-[12px] md:border-slate-800 md:shadow-2xl md:bg-white md:overflow-hidden md:relative md:ring-4 md:ring-slate-900/40 flex-none active-mobile-simulator' 
              : 'min-h-screen'
          }`}
          id="simulated-viewport-container"
        >
          {/* Simulated Mobile Device Top Notch & Signal status bar */}
          {deviceMode === 'mobile' && (
            <div className="hidden md:flex bg-slate-900 text-white px-6 pt-3 pb-2 text-[10px] font-bold justify-between items-center relative select-none shrink-0" id="simulated-status-bar">
              <span className="font-mono text-slate-300">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {/* Speaker notch receiver for premium hardware simulator looks */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-4.5 rounded-full bg-slate-950 flex items-center justify-center gap-1.5 shadow-inner">
                <div className="w-10 h-0.5 bg-slate-800 rounded-full" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-slate-300">
                <span>VCCS Net</span>
                <span>📶</span>
                <span>🔋 99%</span>
              </div>
            </div>
          )}

          {/* Internal application scroll frame container */}
          <div className={`flex-1 flex flex-col overflow-y-auto bg-slate-50/50 ${deviceMode === 'mobile' ? 'md:h-0' : ''}`} id="app-internal-scroller">
      
      {/* Sleek Header / Navigation Navbar */}
      {!activeSession && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            
            {/* Logo Heading left side */}
            <div 
              onClick={() => {
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 leading-none">
                  VCCS Quiz 4G
                </h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  Trắc Nghiệm Lý Thuyết
                </span>
              </div>
            </div>

            {/* Tab Selection controller (Only visible if NOT in active quiz session) */}
            <nav className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/55' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Trang Chủ</span>
              </button>
              
              <button
                onClick={() => setActiveTab('browser')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'browser' 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/55' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Kho Câu Hỏi</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/55' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Thống Kê</span>
              </button>

              {currentUser?.email === 'tailieutbtt@gmail.com' && (
                <button
                  onClick={() => setActiveTab('admin_console')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin_console' 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50/55 border border-indigo-150' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Quản Trị</span>
                </button>
              )}

              {/* Refresh / Dynamic Sync Button */}
              <button
                onClick={() => loadQuestions(true)}
                title="Đồng bộ lại từ Google Sheets"
                className="p-2 ml-1 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50/50 transition-colors cursor-pointer"
                id="btn-sync-google-sheets"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>

              {/* Google Authentication Controller */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                {currentUser ? (
                  <div className="flex items-center gap-1.5">
                    {/* User Profile Info */}
                    <div className="hidden md:flex flex-col text-right">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[124px]">
                        {currentUser.displayName || currentUser.email}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 leading-none justify-end">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                        Đồng bộ Cloud
                      </span>
                    </div>
                    {/* User profile avatar or simple letter circle */}
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full border border-slate-200 outline-2 outline-indigo-50"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-[10px] text-indigo-700">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    {/* Signout Button */}
                    <button
                      onClick={handleSignOut}
                      title="Đăng xuất tài khoản"
                      className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50/50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-1.5 bg-[#a36a28]/10 hover:bg-[#a36a28]/2 focus:outline-none text-[#8c5211] px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-[#ebd8ba]"
                    title="Đăng nhập để tự động lưu trữ và đồng bộ kết quả lên Cloud"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Cloud Sync</span>
                  </button>
                )}
              </div>
            </nav>

          </div>
        </header>
      )}

      {/* Main Body content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="main-content-layout">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
              <GraduationCap className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Đang Đồng Bộ Ngân Hàng Câu Hỏi...</h3>
              <p className="text-xs text-slate-400 mt-1">Đang nạp dữ liệu câu hỏi lý thuyết trực tiếp từ Google Sheets của bạn</p>
            </div>
          </div>
        ) : activeSession ? (
          /* Active test taking simulation takes precedence */
          <QuizEngine
            questions={questions}
            mode={activeSession.mode}
            questionCount={activeSession.questionCount}
            selectedCategories={activeSession.selectedCategories}
            shuffle={activeSession.shuffle}
            durationMinutes={activeSession.durationMinutes}
            onExit={handleExitSession}
            onSaveHistory={handleSaveHistory}
            onPrintReport={setPrintData}
            restoredSession={activeSession.restoredSession}
            currentUser={currentUser}
          />
        ) : !currentUser ? (
          /* High-Fidelity Login Gate with detailed role choices */
          <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-slate-100 p-8 md:p-10 shadow-lg space-y-6 text-center animate-fade-in" id="login-welcome-gate">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center font-black shadow-inner">
              <GraduationCap className="w-9 h-9" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Hệ Thống Trắc Nghiệm Đào Tạo VCCS 4G</h3>
              <p className="text-xs text-slate-400 font-medium px-4">
                Vui lòng kết nối tài khoản Google của bạn để xác thực vai trò học tập và kích hoạt học bạ đồng bộ đám mây
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
              <div className="p-4 bg-[#8c5211]/5 border border-[#ebd8ba]/30 rounded-2xl space-y-2">
                <span className="text-[10.5px] font-black text-[#8c5211] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  Vai trò: Thí sinh
                </span>
                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                  Sử dụng tài khoản Gmail cá nhân để làm bài thi tính giờ sát hạch hoặc luyện tập tự do. Hệ thống sẽ chấm điểm và lưu lịch sử bài làm.
                </p>
              </div>
              
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                <span className="text-[10.5px] font-black text-indigo-700 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Vai trò: Quản trị
                </span>
                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                  Đăng nhập qua Gmail <strong className="text-indigo-900 font-bold">tailieutbtt@gmail.com</strong> để toàn quyền cấu hình live Google Sheets & lướt xem học bạ toàn bộ học sinh.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-white font-heavy py-4 px-6 rounded-2xl border border-slate-950 transition-all shadow-md hover:shadow-lg cursor-pointer text-xs font-bold"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Đăng nhập nhanh bằng tài khoản Google</span>
              </button>
              
              <p className="text-[10px] text-slate-400 font-medium">
                *Hệ thống sử dụng dịch vụ Google Sign-In an toàn tuyệt đối.
              </p>
            </div>
          </div>
        ) : (
          /* Main tab routers */
          <div>
            {activeTab === 'dashboard' && (
              <Dashboard
                questions={questions}
                categories={categories}
                onStartQuiz={handleStartSession}
                syncSource={syncSource}
                syncError={syncError}
                onSelectTab={setActiveTab}
                stats={stats}
                onSyncComplete={handleGoogleSheetSyncComplete}
                onPrintReport={setPrintData}
                savedSessionData={savedSessionData}
                onRestoreSession={handleRestoreSession}
                onClearSavedSession={handleClearSavedSession}
                bgSyncEnabled={bgSyncEnabled}
                onToggleBgSync={(enabled: boolean) => {
                  setBgSyncEnabled(enabled);
                  localStorage.setItem('vccs_bg_sync_enabled', String(enabled));
                }}
                isAdmin={currentUser?.email === 'tailieutbtt@gmail.com'}
              />
            )}
            
            {activeTab === 'browser' && (
              <QuestionBrowser
                questions={questions}
                categories={categories}
              />
            )}

            {activeTab === 'stats' && (
              <HistoryStats
                history={history}
                stats={stats}
                onClearHistory={handleClearHistory}
                onSelectTab={setActiveTab}
                onPrintReport={setPrintData}
              />
            )}

            {activeTab === 'admin_console' && currentUser?.email === 'tailieutbtt@gmail.com' && (
              <AdminConsole 
                onPrintReport={setPrintData}
                questionsCount={questions.length}
              />
            )}
          </div>
        )}
      </main>

      {/* Polished Site Footer */}
      {!activeSession && (
        <footer className="bg-white border-t border-slate-100 mt-12 py-6 text-xs text-slate-400 font-medium" id="main-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 uppercase font-mono tracking-wider font-bold text-[10px] text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Nguồn cấp dữ liệu:</span>
              <span className="text-indigo-600">{syncSource === 'google_sheets' ? 'Google Sheets Live Cloud' : 'Bộ lưu trữ dự phòng Offline'}</span>
            </div>
            
            <div className="text-center md:text-right space-y-1">
              <p>© {new Date().getFullYear()} - Hệ Thống Trắc Nghiệm Đào Tạo Công Nghệ VCCS 4G.</p>
              <p className="text-[10px] text-slate-300">Thiết kế tinh tế theo phong cách Swiss UI • Chạy ổn định ngoại tuyến.</p>
            </div>
          </div>
        </footer>
      )}

          </div> {/* close #app-internal-scroller */}
        </div> {/* close #simulated-viewport-container */}
      </div> {/* close #viewport-layout-wrapper */}

      {printData && (
        <ExamReportPDF 
          data={printData} 
          onClose={() => setPrintData(null)} 
        />
      )}

    </div>
  );
}
