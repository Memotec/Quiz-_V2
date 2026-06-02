import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  FolderOpen,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  initAuth 
} from '../utils/googleAuth';
import { 
  extractSpreadsheetId, 
  fetchSpreadsheetInfo, 
  fetchQuestionsFromGoogleSheet,
  listGoogleSheetsFromDrive,
  DriveFile
} from '../utils/sheetsApi';
import { Question } from '../types';
import { User } from 'firebase/auth';

interface GoogleSheetsConfigProps {
  onSyncComplete: (questions: Question[], sourceName: string) => void;
  currentQuestionsCount: number;
  activeCourseId?: string;
}

export default function GoogleSheetsConfig({ 
  onSyncComplete,
  currentQuestionsCount,
  activeCourseId
}: GoogleSheetsConfigProps) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Tab state: manual link entering or Google Drive file browser
  const [configSource, setConfigSource] = useState<'manual' | 'drive'>('manual');

  // Google Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [loadingDriveFiles, setLoadingDriveFiles] = useState<boolean>(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState<string>('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Spreadsheet state
  const [sheetUrlOrId, setSheetUrlOrId] = useState<string>(() => {
    if (activeCourseId === 'vccs_4g_moi') {
      return 'https://docs.google.com/spreadsheets/d/1e6kJx1BzziQN2oOIBK_1CRAZb-M3Rqsq/edit';
    }
    return 'https://docs.google.com/spreadsheets/d/1KbAVjbQuQWHxyD_Al8EbHOdPa0ROerUW/edit';
  });

  // Automatically update input field when active course changes reactive style
  useEffect(() => {
    if (activeCourseId === 'vccs_4g_moi') {
      setSheetUrlOrId('https://docs.google.com/spreadsheets/d/1e6kJx1BzziQN2oOIBK_1CRAZb-M3Rqsq/edit');
    } else if (activeCourseId === 'vccs_4g_mn') {
      setSheetUrlOrId('https://docs.google.com/spreadsheets/d/1KbAVjbQuQWHxyD_Al8EbHOdPa0ROerUW/edit');
    }
  }, [activeCourseId]);

  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [loadingSheetInfo, setLoadingSheetInfo] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync state tracking on startup
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoadingAuth(true);
    setSyncStatus({ type: null, message: null });
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      setSyncStatus({ 
        type: 'error', 
        message: err.message || 'Lỗi đăng nhập Google. Vui lòng thử lại.' 
      });
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    setLoadingAuth(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSpreadsheetTitle(null);
      setSheetsList([]);
      setSelectedSheet('');
      setSyncStatus({ type: 'success', message: 'Đã đăng xuất tài khoản Google.' });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Step 1: Connect spreadsheet, fetch sheet names (tabs)
  const handleConnectSpreadsheet = async () => {
    if (!token) {
      setSyncStatus({
        type: 'error',
        message: 'Vui lòng đăng nhập Google để kết nối và nạp dữ liệu từ trang tính của bạn.'
      });
      return;
    }

    const spreadsheetId = extractSpreadsheetId(sheetUrlOrId);
    if (!spreadsheetId) {
      setSyncStatus({
        type: 'error',
        message: 'URL hoặc ID bảng tính không hợp lệ. Vui lòng kiểm tra lại.'
      });
      return;
    }

    setLoadingSheetInfo(true);
    setSyncStatus({ type: null, message: null });
    setSpreadsheetTitle(null);
    setSheetsList([]);

    try {
      const info = await fetchSpreadsheetInfo(spreadsheetId, token);
      setSpreadsheetTitle(info.title);
      setSheetsList(info.sheets);
      
      if (info.sheets.length > 0) {
        // Safe default index or find a sheet with questions in name
        const defaultValue = info.sheets.find(s => s.toLowerCase().includes('quiz') || s.toLowerCase().includes('câu hỏi')) || info.sheets[0];
        setSelectedSheet(defaultValue);
        setSyncStatus({
          type: 'success',
          message: `Kết nối thành công tới: "${info.title}"! Vui lòng chọn trang tính chứa dữ liệu bên dưới.`
        });
      } else {
        throw new Error('Bảng tính này không chứa bất kỳ trang tính con (tab) nào.');
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Lỗi kết nối bảng tính. Hãy kiểm tra quyền truy cập của tài khoản hoặc tính hợp lệ của ID.'
      });
    } finally {
      setLoadingSheetInfo(false);
    }
  };

  // Step 2: Grab questions and fire sync lifting
  const handleSyncQuestions = async () => {
    if (!token) return;
    const spreadsheetId = extractSpreadsheetId(sheetUrlOrId);
    if (!spreadsheetId || !selectedSheet) {
      setSyncStatus({
        type: 'error',
        message: 'Phạm vi đồng bộ chưa chính xác. Hãy chọn một trang cụ thể.'
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: null, message: null });

    try {
      const result = await fetchQuestionsFromGoogleSheet(spreadsheetId, selectedSheet, token);
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.questions.length > 0) {
        onSyncComplete(result.questions, `Google Sheets [${spreadsheetTitle || 'Custom'}]`);
        setSyncStatus({
          type: 'success',
          message: `Đồng bộ thành công! Đã nạp chính xác ${result.questions.length} câu hỏi mới vào hệ thống.`
        });
      } else {
        throw new Error('Không giải mã được dữ liệu câu hỏi nào. Đảm bảo bảng tính có đủ 4 cột (STT, Chủ đề, Câu hỏi, Đáp án).');
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Lỗi đồng bộ câu hỏi.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Drive listing and search support
  const handleLoadDriveFiles = async (query = "") => {
    if (!token) return;
    setLoadingDriveFiles(true);
    try {
      const files = await listGoogleSheetsFromDrive(token, query);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setSyncStatus({
        type: 'error',
        message: 'Không thể tải danh sách tập tin từ Google Drive. Vui lòng xác minh lại quyền truy cập.'
      });
    } finally {
      setLoadingDriveFiles(false);
    }
  };

  useEffect(() => {
    if (configSource === 'drive' && token) {
      handleLoadDriveFiles(driveSearchQuery);
    }
  }, [configSource, token, driveSearchQuery]);

  const handleSelectDriveFile = async (file: DriveFile) => {
    setSelectedFileId(file.id);
    setSheetUrlOrId(file.id);
    
    setLoadingSheetInfo(true);
    setSyncStatus({ type: null, message: null });
    setSpreadsheetTitle(null);
    setSheetsList([]);

    try {
      const info = await fetchSpreadsheetInfo(file.id, token!);
      setSpreadsheetTitle(info.title);
      setSheetsList(info.sheets);
      
      if (info.sheets.length > 0) {
        const defaultValue = info.sheets.find(s => s.toLowerCase().includes('quiz') || s.toLowerCase().includes('câu hỏi')) || info.sheets[0];
        setSelectedSheet(defaultValue);
        setSyncStatus({
          type: 'success',
          message: `Đã kết nối thành công tới "${info.title}" từ Google Drive của bạn! Hãy chọn trang cần đồng bộ phía dưới.`
        });
      } else {
        throw new Error('Tệp này không chứa bất kỳ trang tính nào.');
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Lỗi nạp thông tin tệp từ Google Drive.'
      });
    } finally {
      setLoadingSheetInfo(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm space-y-5" id="google-sheets-config-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              Kết Nối Google Sheets
              <span className="text-[10px] font-mono select-none px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider animate-pulse">
                Dynamic Cloud
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Sử dụng Google Sheets của riêng bạn làm ngân hàng câu hỏi</p>
          </div>
        </div>

        {/* Dynamic User Banner status */}
        {!loadingAuth && user && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 self-start sm:self-center">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Avatar'} 
                className="w-5 h-5 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5 h-5 bg-indigo-600 rounded-full text-white text-[10px] font-black flex items-center justify-center">
                {user.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
            <div className="text-left font-sans">
              <span className="text-[10px] text-slate-400 font-medium block leading-none">Liên kết bởi</span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5 max-w-[120px] truncate" title={user.email || ''}>
                {user.displayName || user.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 font-bold transition-colors ml-1 p-0.5 cursor-pointer"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main integration UI */}
      {loadingAuth ? (
        <div className="py-6 text-center flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Đang truy xuất thông tin bảo mật...</span>
        </div>
      ) : !user ? (
        <div className="py-2.5 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tại sao nên kết nối Google Sheets?
            </span>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 font-normal">
              <li>Cho phép bạn nạp câu hỏi từ <strong>bảng tính cá nhân</strong> một cách an toàn và bảo mật.</li>
              <li>Tự động bỏ qua lỗi chặn kiểm soát CORS bảo mật của trình duyệt.</li>
              <li>Hỗ trợ xử lý cả các bảng tính ở chế độ <strong>riêng tư</strong> mà bạn có quyền chỉnh sửa.</li>
            </ul>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer text-xs"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>Đăng nhập với Google để bắt đầu</span>
          </button>
        </div>
      ) : (
        /* Connected auth UI */
        <div className="space-y-4">
          {/* Config source tab selector */}
          <div className="flex border-b border-slate-100 pb-1.5 gap-4">
            <button
              onClick={() => setConfigSource('manual')}
              className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                configSource === 'manual' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Liên Kết Thủ Công (Link/ID)
            </button>
            <button
              onClick={() => setConfigSource('drive')}
              className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                configSource === 'drive' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Duyệt Google Drive
            </button>
          </div>

          {configSource === 'manual' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ID hoặc Liên Kết Google Sheets:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={sheetUrlOrId}
                  onChange={(e) => setSheetUrlOrId(e.target.value)}
                  placeholder="Nhập link Google Sheets hoặc Spreadsheet ID..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700 font-sans"
                />
                <button
                  onClick={handleConnectSpreadsheet}
                  disabled={loadingSheetInfo || !sheetUrlOrId}
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold font-sans cursor-pointer flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
                >
                  {loadingSheetInfo ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Kết Nối</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                *Mẹo: Đã điền sẵn link bảng dữ liệu chuẩn VCCS 4G để bạn trải nghiệm ngay.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={driveSearchQuery}
                  onChange={(e) => setDriveSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm mẫu bảng tính từ Google Drive..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>

              {loadingDriveFiles ? (
                <div className="py-7 text-center flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-450 text-slate-400 font-medium">Đang lướt tìm trong Drive của bạn...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-7 text-center bg-slate-50 rounded-2xl text-slate-400 border border-dashed border-slate-200 font-medium text-xs">
                  <FolderOpen className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
                  Không tìm thấy bảng tính nào trong Drive.
                </div>
              ) : (
                <div className="max-h-[190px] overflow-y-auto border border-slate-150 rounded-2xl divide-y divide-slate-100 bg-white shadow-inner">
                  {driveFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleSelectDriveFile(file)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all hover:bg-slate-50 cursor-pointer ${
                        selectedFileId === file.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600 pl-2.5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileSpreadsheet className={`w-4 h-4 flex-shrink-0 ${
                          selectedFileId === file.id ? 'text-indigo-650 text-indigo-600 font-bold' : 'text-emerald-600'
                        }`} />
                        <div className="min-w-0">
                          <span className={`text-xs block truncate ${
                            selectedFileId === file.id ? 'font-black text-indigo-950' : 'font-medium text-slate-700'
                          }`}>
                            {file.name}
                          </span>
                          {file.modifiedTime && (
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              Cập nhật: {new Date(file.modifiedTime).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab sheets section if successfully fetched info */}
          {sheetsList.length > 0 && (
            <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 block">
                  Đã kết nối: <span className="text-indigo-700 font-black">"{spreadsheetTitle}"</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wide block">Chọn trang tính (Tab):</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="w-full bg-white border border-indigo-100 text-indigo-950 font-bold px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {sheetsList.map(tabName => (
                      <option key={tabName} value={tabName}>{tabName}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleSyncQuestions}
                    disabled={isSyncing || !selectedSheet}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Nạp & Đồng Bộ Câu Hỏi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Alerts for Actions feedback */}
      {syncStatus.message && (
        <div className={`p-4 rounded-2xl flex items-start gap-2.5 text-xs transition-all duration-300 ${
          syncStatus.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' 
            : 'bg-rose-50 border border-rose-150 text-rose-800'
        }`} id="sync-alerts-box">
          {syncStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="font-sans font-medium leading-relaxed">
            {syncStatus.message}
          </div>
        </div>
      )}
    </div>
  );
}
