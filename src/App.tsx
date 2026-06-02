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
  ShieldCheck,
  Plus,
  Trash,
  FileSpreadsheet,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { syncQuestionsFromSheet } from './utils/sync';
import { Question, QuizMode, ExamHistoryItem, AppStats, SavedQuizSession, Course } from './types';
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
  signInWithRedirect,
  getRedirectResult,
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
import { DEFAULT_CANDIDATES, DEFAULT_CANDIDATE_PASSWORD, Candidate } from './data/candidates';

const DEFAULT_COURSES: Course[] = [
  {
    id: 'vccs_4g_mn',
    name: 'VCCS 4G MN (Chuẩn)',
    spreadsheetId: '1KbAVjbQuQWHxyD_Al8EbHOdPa0ROerUW',
    isCustom: false
  },
  {
    id: 'vccs_4g_moi',
    name: 'Khóa Thi VCCS Mới (Spreadsheet mới)',
    spreadsheetId: '1e6kJx1BzziQN2oOIBK_1CRAZb-M3Rqsq',
    isCustom: false
  }
];

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [syncSource, setSyncSource] = useState<'google_sheets' | 'local_backup' | string>('local_backup');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard'); // dashboard, browser, stats
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  });

  // Firebase AUTH State & Custom Candidate State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => {
    try {
      const saved = localStorage.getItem('vccs_custom_candidate_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc custom candidate từ cache:', e);
    }
    return null;
  });

  // Admin role permission check helper
  const isUserAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.email === 'tailieutbtt@gmail.com' ||
      currentUser.email === 'tranvantruong@vccs.local' ||
      !!(currentUser as any).isAdmin
    );
  }, [currentUser]);
  
  // Course Management State
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('vccs_available_courses');
      if (saved) {
        const parsed = JSON.parse(saved) as Course[];
        const customOnly = parsed.filter(p => p.isCustom);
        return [...DEFAULT_COURSES, ...customOnly];
      }
    } catch (e) {
      console.warn('Lỗi phân tích vccs_available_courses:', e);
    }
    return DEFAULT_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    return localStorage.getItem('vccs_current_course_id') || 'vccs_4g_mn';
  });

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === activeCourseId) || courses[0];
  }, [courses, activeCourseId]);

  // Modal State for adding custom courses
  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCourseUrl, setNewCourseUrl] = useState<string>('');
  const [addCourseError, setAddCourseError] = useState<string>('');

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourseError('');
    if (!isUserAdmin) {
      setAddCourseError('Chỉ Quản trị viên mới được quyền thêm khóa thi mới.');
      return;
    }
    if (!newCourseName.trim()) {
      setAddCourseError('Vui lòng nhập tên khóa thi');
      return;
    }
    
    let sheetId = newCourseUrl.trim();
    if (sheetId.includes('/d/')) {
      const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      } else {
        setAddCourseError('Đường dẫn bảng tính không hợp lệ...');
        return;
      }
    } else if (sheetId.includes('id=')) {
      const match = sheetId.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      } else {
        setAddCourseError('Liên kết bảng tính không hợp lệ...');
        return;
      }
    }
    
    if (!sheetId) {
      setAddCourseError('ID hoặc URL Trang tính không hợp lệ.');
      return;
    }

    const nCourse: Course = {
      id: `course-${Date.now()}`,
      name: newCourseName.trim(),
      spreadsheetId: sheetId,
      isCustom: true
    };

    setCourses(prev => [...prev, nCourse]);
    setActiveCourseId(nCourse.id);
    
    setNewCourseName('');
    setNewCourseUrl('');
    setShowAddCourseModal(false);
  };

  const handleDeleteCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserAdmin) {
      alert('Chỉ Quản trị viên mới được quyền xóa các khóa thi.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa khóa thi tùy chọn này?')) {
      if (courseId === activeCourseId) {
        setActiveCourseId('vccs_4g_mn');
      }
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  // Sync courses with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vccs_available_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('Lỗi ghi vccs_available_courses:', e);
    }
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('vccs_current_course_id', activeCourseId);
  }, [activeCourseId]);
  
  // Dynamic candidates matching Firestore / localStorage / DEFAULT_CANDIDATES
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const cached = localStorage.getItem('vccs_custom_candidates');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return DEFAULT_CANDIDATES;
  });

  // Custom Candidate Login System States
  const [loginMode, setLoginMode] = useState<'candidate' | 'other'>('candidate');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('vccs_custom_candidates');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return DEFAULT_CANDIDATES[0].id;
  });
  const [candidatePasswordInput, setCandidatePasswordInput] = useState<string>('');
  const [candidateLoginError, setCandidateLoginError] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [googleAuthLoading, setGoogleAuthLoading] = useState<boolean>(false);

  const processAuthError = (err: any): string => {
    if (!err) return 'Lỗi xác thực không xác định.';
    const code = err.code || '';
    const message = err.message || '';
    
    if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain') || message.includes('unauthorized domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'Đang tải...';
      return `LỖI MIỀN CHƯA ĐƯỢC ỦY QUYỀN (unauthorized-domain):\n\n` +
        `Tên miền hiện tại [ ${currentHost} ] chưa được khai báo chấp thuận trong bảng điều khiển Firebase Console của bạn.\n\n` +
        `👉 Cách khắc phục:\n` +
        `1. Truy cập trang quản trị Firebase Console của bạn.\n` +
        `2. Đi tới mục: Authentication -> Settings (Cài đặt) -> Authorized domains (Miền được ủy quyền).\n` +
        `3. Nhấp "Thêm miền" (Add Domain) và dán chính xác tên miền này vào danh sách:\n` +
        `   📍 ${currentHost}\n` +
        `4. Lưu lại cấu hình và tải lại trang này để đăng nhập qua Google Auth thành công!`;
    }
    
    if (code === 'auth/popup-blocked') {
      return 'Cửa sổ đăng nhập pop-up đã bị trình duyệt chặn (popup-blocked). Vui lòng cấp quyền mở pop-up cho trang này hoặc sử dụng nút "Đăng nhập Redirect" bên dưới.';
    }
    
    if (code === 'auth/cancelled-popup-request') {
      return 'Yêu cầu đăng nhập đã bị hủy do cửa sổ popup bị đóng trước khi hoàn tất.';
    }

    return message || err.toString();
  };

  // Set default candidate selection when list changes
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      const activeExists = candidates.some(c => c.id === selectedCandidateId);
      if (!activeExists) {
        setSelectedCandidateId(candidates[0].id);
      }
    }
  }, [candidates, selectedCandidateId]);

  const [isSyncingHistory, setIsSyncingHistory] = useState<boolean>(false);
  const [bgSyncEnabled, setBgSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vccs_bg_sync_enabled') !== 'false';
  });

  // Dynamic Viewport Mode (Responsive Desktop vs Simulated Mobile Phone Chassis)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>(() => {
    return (localStorage.getItem('vccs_device_mode') as 'responsive' | 'mobile') || 'responsive';
  });

  const [detectedPlatform, setDetectedPlatform] = useState<string>('');

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setDetectedPlatform(isMobile ? 'Thiết bị Di động' : 'Máy tính / PC');
    
    // Auto-select optimal viewport if the user hasn't explicitly saved a preference
    const savedPreference = localStorage.getItem('vccs_device_mode');
    if (!savedPreference) {
      setDeviceMode('responsive');
    }
  }, []);

  const handleToggleDeviceMode = (mode: 'responsive' | 'mobile') => {
    setDeviceMode(mode);
    localStorage.setItem('vccs_device_mode', mode);
  };

  // Google Sheet integration sync callback
  const handleGoogleSheetSyncComplete = (newQuestions: Question[], sourceName: string) => {
    setQuestions(newQuestions);
    setSyncSource(sourceName);
    setSyncError(null);
    setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    try {
      localStorage.setItem(`vccs_course_questions_${activeCourseId}`, JSON.stringify(newQuestions));
    } catch (e) {
      console.warn('Lỗi lưu câu hỏi của khóa thi:', e);
    }
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
  const loadQuestions = async (isManualRefresh = false, courseId?: string) => {
    if (isManualRefresh) setIsLoading(true);
    const targetCourseId = courseId || activeCourseId;
    const targetCourse = courses.find(c => c.id === targetCourseId) || courses[0];

    // Check localStorage cache first
    let cachedQuestions: Question[] = [];
    try {
      const saved = localStorage.getItem(`vccs_course_questions_${targetCourseId}`);
      if (saved) {
        cachedQuestions = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc vccs_course_questions từ cache:', e);
    }

    if (cachedQuestions.length > 0) {
      setQuestions(cachedQuestions);
      setSyncSource(`Bộ nhớ tạm [${targetCourse?.name || 'Custom'}]`);
      if (!isManualRefresh) setIsLoading(false);
    }

    const result = await syncQuestionsFromSheet(targetCourse?.spreadsheetId);
    
    if (result.source === 'google_sheets') {
      setQuestions(result.questions);
      setSyncSource(`Google Sheets [${targetCourse?.name || 'Custom'}]`);
      setSyncError(null);
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      // Cache the newly fetched questions
      try {
        localStorage.setItem(`vccs_course_questions_${targetCourseId}`, JSON.stringify(result.questions));
      } catch (e) {
        console.warn('Lỗi ghi vccs_course_questions vào cache:', e);
      }
    } else {
      // It fell back to local_backup or offline
      if (cachedQuestions.length > 0) {
        // Keep using cached questions!
        setQuestions(cachedQuestions);
        setSyncSource(`Danh sách lưu sẵn [${targetCourse?.name || 'Custom'}]`);
        setSyncError(`Không thể tải trực tuyến mới nhất. Đang sử dụng dữ liệu đã đồng bộ sẵn của khóa thi này.`);
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      } else {
        if (targetCourseId === 'vccs_4g_mn') {
          setQuestions(result.questions);
          setSyncSource('Dữ liệu mặc định');
          setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setQuestions([]);
          setSyncSource('Bình thường/Chưa đồng bộ');
        }
        setSyncError(result.error);
      }
    }
    setIsLoading(false);
  };

  // Load questions on change of activeCourseId (reactive loading)
  useEffect(() => {
    loadQuestions(true, activeCourseId);
  }, [activeCourseId]);

  // Periodic background sync of questions based on global setting
  useEffect(() => {
    if (!bgSyncEnabled) return;
    
    // Periodically fetch every 3 minutes
    const interval = setInterval(() => {
      console.log('Background refreshing questions list from Google Sheets source...');
      loadQuestions(false, activeCourseId);
    }, 3 * 60 * 1050);

    return () => clearInterval(interval);
  }, [bgSyncEnabled, activeCourseId]);

  // Sync candidate list from Firestore, self-seed if missing
  useEffect(() => {
    const syncCandidates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'candidates'));
        if (querySnapshot.empty) {
          // Firestore is empty for candidates. Seed it with initial DEFAULT_CANDIDATES
          console.log('Seeding initial candidates into database...');
          const batch = writeBatch(db);
          DEFAULT_CANDIDATES.forEach((cand) => {
            const candDoc = doc(db, 'candidates', cand.id);
            batch.set(candDoc, {
              id: cand.id,
              name: cand.name,
              email: cand.email,
              password: cand.password || '',
              isAdmin: !!cand.isAdmin,
              lastLogin: cand.lastLogin || ''
            });
          });
          await batch.commit();
          setCandidates(DEFAULT_CANDIDATES);
          localStorage.setItem('vccs_custom_candidates', JSON.stringify(DEFAULT_CANDIDATES));
        } else {
          // Load candidates from Firestore
          const list: Candidate[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Candidate);
          });
          // Sort cand_ id nicely
          list.sort((a, b) => {
            const numA = parseInt(a.id.replace('cand_', ''), 10) || 0;
            const numB = parseInt(b.id.replace('cand_', ''), 10) || 0;
            return numA - numB;
          });
          setCandidates(list);
          localStorage.setItem('vccs_custom_candidates', JSON.stringify(list));
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách thí sinh từ Firestore, dùng dữ liệu có sẵn:', err);
      }
    };
    syncCandidates();
  }, []);

  const handleUpdateCandidates = async (newCandidates: Candidate[]) => {
    setCandidates(newCandidates);
    localStorage.setItem('vccs_custom_candidates', JSON.stringify(newCandidates));
    
    try {
      const batch = writeBatch(db);
      // Clean up deleted ones first
      const existingSnap = await getDocs(collection(db, 'candidates'));
      existingSnap.forEach((docSnap) => {
        if (!newCandidates.some(c => c.id === docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });
      
      // Write/update current ones
      newCandidates.forEach((cand) => {
        const candDoc = doc(db, 'candidates', cand.id);
        batch.set(candDoc, {
          id: cand.id,
          name: cand.name,
          email: cand.email,
          password: cand.password || '',
          isAdmin: !!cand.isAdmin,
          lastLogin: cand.lastLogin || ''
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('Lỗi khi đồng bộ cập nhật ứng viên lên Firestore:', err);
    }
  };

  // Handle Firebase Auth Google Redirect results on boot
  useEffect(() => {
    setGoogleAuthLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Đăng nhập qua Redirect thành công:', result.user);
          setCurrentUser(result.user);
          localStorage.removeItem('vccs_custom_candidate_user');
        }
      })
      .catch((error: any) => {
        console.error('Lỗi nhận kết quả từ Redirect:', error);
        if (error && error.code !== 'auth/popup-closed') {
          setGoogleAuthError(processAuthError(error));
        }
      })
      .finally(() => {
        setGoogleAuthLoading(false);
      });
  }, []);

  // Listen for Authentication state change and fetch/sync history to/from Firestore
  useEffect(() => {
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
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        localStorage.removeItem('vccs_custom_candidate_user');
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
        // No firebaseUser, check if there is a cached custom candidate user
        let customCandidateRestored = false;
        try {
          const cachedCustom = localStorage.getItem('vccs_custom_candidate_user');
          if (cachedCustom) {
            const parsed = JSON.parse(cachedCustom);
            setCurrentUser(parsed);
            customCandidateRestored = true;
            
            // Re-load candidate history from candidate-specific localStorage index
            const candHistoryKey = `vccs_quiz_history_v2_cand_${parsed.uid}`;
            const stored = localStorage.getItem(candHistoryKey);
            if (stored) {
              setHistory(JSON.parse(stored));
            } else {
              setHistory([]);
            }
          }
        } catch (e) {
          console.warn('Lỗi phục hồi custom candidate:', e);
        }

        if (!customCandidateRestored) {
          setCurrentUser(null);
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
      }
    });

    return () => unsubscribe();
  }, []);

  // Login handler
  const handleSignIn = async () => {
    setGoogleAuthError(null);
    setGoogleAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Lỗi đăng nhập Google Auth:', err);
      // Check if popup blocked or cancelled
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request' || err?.message?.toLowerCase().includes('popup')) {
        setGoogleAuthError('Cửa sổ Pop-up đã bị chặn bởi sandbox iframe. Đang chuyển cấu hình sang đăng nhập Chuyển hướng trang (Redirect)...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirErr: any) {
          console.error('Lỗi Chuyển Hướng Google Auth:', redirErr);
          setGoogleAuthError(processAuthError(redirErr));
          setGoogleAuthLoading(false);
        }
      } else {
        setGoogleAuthError(processAuthError(err));
        setGoogleAuthLoading(false);
      }
    }
  };

  const handleSignInRedirectOnly = async () => {
    setGoogleAuthError(null);
    setGoogleAuthLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error('Lỗi đăng nhập Redirect:', err);
      setGoogleAuthError(processAuthError(err));
      setGoogleAuthLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setCurrentUser({
      uid: 'guest',
      email: 'guest@vccs.local',
      displayName: 'Học viên (Khách)',
      photoURL: null,
      emailVerified: true
    } as any);
  };

  // Logout handler
  const handleSignOut = async () => {
    try {
      if (currentUser?.uid && (currentUser.uid.startsWith('cand_') || currentUser.uid === 'guest')) {
        localStorage.removeItem('vccs_custom_candidate_user');
        setCurrentUser(null);
        // Restore default guest/fallback history
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
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === selectedCandidateId);
    if (cand) {
      const requiredPassword = cand.password || DEFAULT_CANDIDATE_PASSWORD;
      if (candidatePasswordInput === requiredPassword) {
        const timestamp = new Date().toISOString();
        
        // Update candidates array with lastLogin timestamp
        const updatedCandidates = candidates.map(c => {
          if (c.id === cand.id) {
            return { ...c, lastLogin: timestamp };
          }
          return c;
        });
        
        // Save to state and db asynchronously
        await handleUpdateCandidates(updatedCandidates);

        const fakeUser = {
          uid: cand.id,
          email: cand.email,
          displayName: cand.name,
          photoURL: null,
          emailVerified: true,
          isAdmin: !!cand.isAdmin
        } as any;
        
        localStorage.setItem('vccs_custom_candidate_user', JSON.stringify(fakeUser));
        setCurrentUser(fakeUser);
        setCandidateLoginError(null);
        setCandidatePasswordInput('');

        // Load cand specific history
        try {
          const candHistoryKey = `vccs_quiz_history_v2_cand_${cand.id}`;
          const stored = localStorage.getItem(candHistoryKey);
          if (stored) {
            setHistory(JSON.parse(stored));
          } else {
            setHistory([]);
          }
        } catch (err) {
          setHistory([]);
        }
      } else {
        const passwordHint = cand.password ? "Mật khẩu riêng cấu hình cho thí sinh này" : "tbtt@2026";
        setCandidateLoginError(`Mật khẩu không chính xác! Vui lòng kiểm tra lại (${passwordHint}).`);
      }
    }
  };

  const handleCloseWindow = () => {
    if (confirm('Bạn có chắc chắn muốn đóng trình trắc nghiệm và thoát cửa sổ thi này không?')) {
      window.close();
      // fallback message if browser security blocks window.close
      setTimeout(() => {
        alert('Do cấu hình bảo mật của trình duyệt, cửa sổ không thể tự động đóng. Vui lòng bấm dấu [X] trên tab của trình duyệt để thoát trang thi.');
      }, 300);
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
    
    const isCustomCandidate = currentUser?.uid && currentUser.uid.startsWith('cand_');
    const storageKey = isCustomCandidate ? `vccs_quiz_history_v2_cand_${currentUser.uid}` : 'vccs_quiz_history_v2';

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      if (!isCustomCandidate) {
        localStorage.setItem('vccs_quiz_history_v2', JSON.stringify(updatedHistory));
      }
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
    const isCustomCandidate = currentUser?.uid && currentUser.uid.startsWith('cand_');
    const storageKey = isCustomCandidate ? `vccs_quiz_history_v2_cand_${currentUser.uid}` : 'vccs_quiz_history_v2';

    try {
      localStorage.removeItem(storageKey);
      if (!isCustomCandidate) {
        localStorage.removeItem('vccs_quiz_history_v2');
      }
      
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
          {detectedPlatform && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[9.5px]">
              Tự động tối ưu: <strong className="text-indigo-300">{detectedPlatform}</strong>
            </span>
          )}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Logo Heading left side + Course Switcher */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
                    {activeCourse?.name || 'VCCS Quiz 4G'}
                  </h1>
                  <div className="text-[10px] text-slate-400 font-semibold tracking-tight mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="uppercase tracking-wider font-mono font-bold text-indigo-500/90">Trắc nghiệm</span>
                    {questions.length > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-bold">{questions.length} câu hỏi</span>
                      </>
                    )}
                    {lastSyncTime && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">Cập nhật: {lastSyncTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Selector Dropdown Pill */}
              <div className="flex items-center gap-1.5 bg-slate-100/70 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="hidden leading-none text-[9.5px] font-black uppercase text-slate-400 tracking-wide font-mono sm:inline">Khóa Thi:</span>
                <select
                  value={activeCourseId}
                  onChange={(e) => setActiveCourseId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none pr-1 max-w-[130px] sm:max-w-[185px] truncate cursor-pointer font-sans"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {isUserAdmin && (
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    title="Thêm khóa thi mới..."
                    className="p-1 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer ml-0.5"
                  >
                    <Plus className="w-3.5 h-3.5 font-bold" />
                  </button>
                )}
                {isUserAdmin && activeCourse.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCourse(activeCourse.id, e)}
                    title="Xóa khóa thi này"
                    className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
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

              {isUserAdmin && (
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
              <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-3">
                {currentUser ? (
                  <div className="flex items-center gap-1.5">
                    {/* User Profile Info */}
                    <div className="hidden md:flex flex-col text-right">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[124px]">
                        {currentUser.displayName || currentUser.email}
                      </span>
                      {currentUser.uid === 'guest' ? (
                        <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5 leading-none justify-end">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          Học Ngoại Tuyến
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 leading-none justify-end">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                          Đồng bộ Cloud
                        </span>
                      )}
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
                      className="ml-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Đăng xuất</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-1.5 bg-[#a36a28]/10 hover:bg-[#a36a28]/20 focus:outline-none text-[#8c5211] px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-[#ebd8ba]"
                    title="Đăng nhập để tự động lưu trữ và đồng bộ kết quả lên Cloud"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Cloud Sync</span>
                  </button>
                )}

                {/* Close window action button */}
                <button
                  onClick={handleCloseWindow}
                  title="Thoát và đóng cửa sổ thi"
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đóng cửa sổ</span>
                </button>
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
              <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Hệ thống ôn luyện thi Trắc Nghiệm Đội TT</h3>
              <p className="text-xs text-slate-400 font-medium px-4">
                Vui lòng xác thực thông tin Thí sinh trong danh sách hoặc sử dụng Google để tiếp tục học tập.
              </p>
            </div>

            {/* Segment Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button 
                type="button"
                onClick={() => setLoginMode('candidate')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${loginMode === 'candidate' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Thí sinh có tên</span>
              </button>
              <button 
                type="button"
                onClick={() => setLoginMode('other')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${loginMode === 'other' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Quản trị & Đăng nhập khác</span>
              </button>
            </div>

            {loginMode === 'candidate' ? (
              /* Custom Predefined Candidates Login Box */
              <form onSubmit={handleCandidateLogin} className="space-y-4 pt-2 text-left">
                <div className="bg-indigo-50/40 border border-indigo-100/60 p-4 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-indigo-600 text-white rounded-bl-xl text-[9px] font-bold uppercase tracking-wider font-mono">
                    Danh Sách Học Viên
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pr-10">
                    Chọn tên của bạn dưới danh sách học viên chính thức và nhập mật khẩu mặc định <strong className="text-indigo-950 font-bold">tbtt@2026</strong> để bắt đầu ghi nhận học bạ.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Chọn Họ & Tên Thí sinh
                  </label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-bold outline-none transition-all cursor-pointer"
                  >
                    {candidates.map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        👦 {cand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Mật khẩu xác thực mặc định
                  </label>
                  <input
                    type="password"
                    value={candidatePasswordInput}
                    onChange={(e) => setCandidatePasswordInput(e.target.value)}
                    placeholder="Nhập password mặc định (tbtt@2026)"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-4 py-3.5 text-sm text-slate-800 outline-none transition-all font-semibold"
                  />
                </div>

                {candidateLoginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{candidateLoginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl border border-indigo-700 transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Xác Nhận Đăng Nhập Trang Thi</span>
                </button>
                
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    className="text-xs text-slate-400 hover:text-indigo-600 font-semibold transition-all underline decoration-dashed hover:decoration-solid"
                  >
                    Hoặc làm bài nhanh ẩn danh ở chế độ Khách
                  </button>
                </div>
              </form>
            ) : (
              /* Administrative and Other Authentication Choices */
              <div className="pt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
                  <div className="p-4 bg-[#8c5211]/5 border border-[#ebd8ba]/30 rounded-2xl space-y-2">
                    <span className="text-[10.5px] font-black text-[#8c5211] flex items-center gap-1.5 uppercase font-[#8c5211] tracking-wider">
                      <User className="w-3.5 h-3.5" />
                      Mở rộng tự do
                    </span>
                    <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                      Sử dụng Gmail cá nhân tùy ý để làm bài thi tính giờ sát hạch. Điểm và lịch sử sẽ được đồng bộ đám mây chuẩn.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2 max-h-[150px] overflow-hidden">
                    <span className="text-[10.5px] font-black text-indigo-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Phòng đào tạo/Admin
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      Đăng nhập <strong className="text-indigo-950">tailieutbtt@gmail.com</strong> để cấu hình live Google Sheets & xuất báo cáo PDF toàn khóa.
                    </p>
                  </div>
                </div>

                {/* Beautiful IFrame Security Warning notice */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl text-[11px] font-medium text-left space-y-2.5 leading-relaxed">
                  <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping h-2 w-2" />
                    <span>LỖI CHẶN CỬA SỔ POP-UP GOOGLE AUTH:</span>
                  </div>
                  <p>
                    Vị trí xem trước (Sandbox Iframe) của AI Studio có chính sách bảo mật mặc định chặn mở cửa sổ mới. Để xử lý triệt để hãy bấm nút dưới đây để chạy app trong tab độc lập:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold py-2.5 px-3 rounded-xl border border-amber-700 transition-all text-[11px] shadow-sm cursor-pointer whitespace-nowrap text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5 outline-none" />
                      <span>Khắc phục nhanh: Mở Tab mới</span>
                    </a>
                    
                    <button
                      type="button"
                      onClick={handleSignInRedirectOnly}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 font-extrabold py-2.5 px-3 rounded-xl border border-indigo-200 transition-all text-[11px] shadow-sm cursor-pointer"
                    >
                      <span>Đăng nhập Redirect</span>
                    </button>
                  </div>
                </div>

                {googleAuthError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-905 rounded-2xl text-[12px] font-bold flex flex-col gap-2.5 text-left shadow-inner">
                    <div className="flex items-center gap-1.5 font-extrabold text-rose-950 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>Thông tin kiểm tra & Hướng dẫn xử lý:</span>
                    </div>
                    <div className="text-slate-800 font-semibold leading-relaxed font-sans whitespace-pre-line bg-white/60 p-3 rounded-xl border border-rose-100 select-all">
                      {googleAuthError}
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="button"
                  disabled={googleAuthLoading}
                  onClick={handleSignIn}
                  className={`w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-6 rounded-2xl border border-slate-950 transition-all font-black shadow-md hover:shadow-lg cursor-pointer text-xs ${googleAuthLoading ? 'opacity-70 cursor-not-allowed animate-pulse' : ''}`}
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{googleAuthLoading ? 'Đang kết nối để xác thực...' : 'Chạy Liên Kết Đăng Nhập Học Viên Qua Google'}</span>
                </button>

                {/* Guest / Bypass Button */}
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-6 rounded-2xl border border-slate-200 transition-all font-extrabold cursor-pointer text-xs"
                  title="Bỏ qua đăng nhập để làm bài thi & luyện tập offline ngay bằng lưu trữ local"
                >
                  <span>Sát hạch tự do bằng tài khoản Khách</span>
                </button>
              </div>
            )}
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
                isAdmin={isUserAdmin}
                activeCourseId={activeCourseId}
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

            {activeTab === 'admin_console' && isUserAdmin && (
              <AdminConsole 
                onPrintReport={setPrintData}
                questionsCount={questions.length}
                candidates={candidates}
                onUpdateCandidates={handleUpdateCandidates}
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
              <span className="text-indigo-600 font-sans">{syncSource !== 'local_backup' ? syncSource : 'Bộ lưu trữ dự phòng Offline'}</span>
            </div>
            
            <div className="text-center md:text-right space-y-1">
              <p>© {new Date().getFullYear()} - Hệ thống ôn luyện thi Trắc Nghiệm Đội TT.</p>
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

      {showAddCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in" id="add-course-modal">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Thêm Khóa Thi Trắc Nghiệm Mới
              </h3>
              <button 
                onClick={() => setShowAddCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition p-1 text-sm shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tên Khóa Thi / Chủ Đề:</label>
                <input 
                  type="text" 
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Ví dụ: VCCS Mới (Kỳ thi 2026), Đào Tạo Nội Bộ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Link hoặc ID Google Sheets mới:</label>
                <input 
                  type="text" 
                  value={newCourseUrl}
                  onChange={(e) => setNewCourseUrl(e.target.value)}
                  placeholder="Dán URL Google Sheets hoặc ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700"
                  required
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  * Hệ thống sẽ tự động bóc tách ID bảng tính của bạn để đồng bộ hóa dữ liệu.
                </p>
              </div>

              {addCourseError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium">
                  ⚠️ {addCourseError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-heavy text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Đồng bộ & Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
