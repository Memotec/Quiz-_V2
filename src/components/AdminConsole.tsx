import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Award, Activity, FileText, RefreshCw, 
  AlertCircle, CheckCircle, Trash2, Calendar, Clock, 
  ShieldCheck, ArrowRight, UserCheck, TrendingUp
} from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, getDocs, collectionGroup, query, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ExamHistoryItem } from '../types';

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
}

interface AdminConsoleProps {
  onPrintReport: (data: any) => void;
  questionsCount: number;
}

export default function AdminConsole({ onPrintReport, questionsCount }: AdminConsoleProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allHistory, setAllHistory] = useState<(ExamHistoryItem & { candidateEmail?: string; candidateName?: string; userId?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'candidates' | 'history'>('candidates');

  // Load all users and their respective histories from Firestore
  const loadAdminData = async (showLoadingOverlay = true) => {
    if (showLoadingOverlay) setLoading(true);
    try {
      // 1. Fetch all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserProfile[] = [];
      usersSnap.forEach(uDoc => {
        fetchedUsers.push({ id: uDoc.id, ...uDoc.data() } as UserProfile);
      });
      setUsers(fetchedUsers);

      // Create a map of userId -> email and displayName
      const userMap = new Map<string, UserProfile>();
      fetchedUsers.forEach(u => userMap.set(u.id, u));

      // 2. Fetch all history items using Collection Group
      const historySnap = await getDocs(collectionGroup(db, 'history'));
      const fetchedHistory: (ExamHistoryItem & { candidateEmail?: string; candidateName?: string; userId?: string })[] = [];
      
      historySnap.forEach(hDoc => {
        const data = hDoc.data();
        const userId = data.userId || hDoc.ref.parent.parent?.id; // Parent of history subcollection is the user doc
        const candidate = userId ? userMap.get(userId) : null;
        
        fetchedHistory.push({
          id: data.id,
          userId: userId || '',
          date: data.date,
          mode: data.mode,
          categoryName: data.categoryName,
          totalQuestions: data.totalQuestions,
          correctAnswersCount: data.correctAnswersCount,
          score: data.score,
          timeSpentSeconds: data.timeSpentSeconds,
          passed: data.passed,
          candidateEmail: candidate?.email || data.userId || 'Thí sinh tự do',
          candidateName: candidate?.displayName || ''
        });
      });

      // Sort histories (recent first) to show in the table
      fetchedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllHistory(fetchedHistory);

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Quản trị viên:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadAdminData(false);
  };

  // Computations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const exams = allHistory.filter(h => h.mode === 'exam');
    const practices = allHistory.filter(h => h.mode === 'practice');
    
    // Average exam score
    const totalExamScores = exams.reduce((acc, h) => acc + h.score, 0);
    const avgScore = exams.length > 0 ? totalExamScores / exams.length : 0;
    
    // Passing count rate
    const passedCount = exams.filter(h => h.passed).length;
    const passRate = exams.length > 0 ? (passedCount / exams.length) * 100 : 0;

    return {
      totalUsers,
      totalExams: exams.length,
      totalPractices: practices.length,
      averageExamScore: avgScore,
      passingRate: passRate
    };
  }, [users, allHistory]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u => 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return allHistory;
    return allHistory.filter(h => 
      (h.candidateEmail && h.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (h.candidateName && h.candidateName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      h.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allHistory, searchTerm]);

  const getUserMetrics = (userId: string) => {
    const userRuns = allHistory.filter(h => h.userId === userId);
    const exams = userRuns.filter(h => h.mode === 'exam');
    const totalExams = exams.length;
    const totalPractices = userRuns.filter(h => h.mode === 'practice').length;
    const avgScore = totalExams > 0 ? exams.reduce((sum, current) => sum + current.score, 0) / totalExams : 0;
    const passedExams = exams.filter(h => h.passed).length;
    const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;

    return {
      totalExams,
      totalPractices,
      avgScore,
      passRate
    };
  };

  // Format Date
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Format seconds to text
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}p:${s}s`;
  };

  return (
    <div className="space-y-6" id="admin-console-root">
      {/* Title & Headline Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
                Chế độ Quản Trị Viên (Administrator)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              Bảng Điều Khiển Hệ Thống VCCS 4G
            </h2>
            <p className="text-xs text-indigo-150 leading-relaxed max-w-xl">
              Giám sát chất lượng ôn luyện, tra cứu điểm thi thật, thống kê hiệu suất học viên chuẩn hóa thời gian thực.
            </p>
          </div>
          
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 text-xs font-black transition cursor-pointer self-stretch sm:self-auto justify-center"
            id="admin-refresh-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Làm Mới Dữ Liệu
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-slate-850 text-sm">Đang tải học bạ VCCS...</h3>
            <p className="text-xs text-slate-400">Đang đồng bộ dữ liệu người dùng và lịch sử làm bài</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="admin-metrics-grid">
            {/* Total candidates */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Thí Sinh Đăng Ký</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-slate-800">{stats.totalUsers}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tài khoản Google liên kết</span>
              </div>
            </div>

            {/* Total exam runs */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lượt Thi Thử</span>
                <div className="p-2 bg-emerald-50 text-emerald-605 text-emerald-600 rounded-lg"><Award className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-slate-800">{stats.totalExams}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Sát hạch chuẩn có thời gian</span>
              </div>
            </div>

            {/* Total practice runs */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lượt Luyện Tập</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-slate-800">{stats.totalPractices}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tự do, xem đáp án tức thì</span>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Điểm Số Trung Bình</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-indigo-750 text-indigo-700">{stats.averageExamScore.toFixed(1)} /10</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tính trên tất cả đợt thi</span>
              </div>
            </div>

            {/* Passing Rate */}
            <div className={`p-4.5 rounded-2xl border shadow-sm space-y-2 ${
              stats.passingRate >= 70 
                ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950' 
                : 'bg-indigo-50/45 border-indigo-100 text-indigo-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Tỷ Lệ Đạt (Pass Rate)</span>
                <div className="p-2 bg-white rounded-lg shadow-sm"><UserCheck className="w-4 h-4 text-emerald-600" /></div>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-slate-800">{stats.passingRate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Đạt yêu cầu (Từ 7.0 điểm)</span>
              </div>
            </div>
          </div>

          {/* Table Area and Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Tab header toggles & search bar layout */}
            <p className="border-b border-slate-100 py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start">
                <button
                  onClick={() => {
                    setActiveSubTab('candidates');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'candidates'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh Sách Thí Sinh ({users.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSubTab('history');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'history'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sổ Học Bạ Toàn Hệ Thống ({allHistory.length})</span>
                </button>
              </span>

              {/* Live search bar */}
              <span className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeSubTab === 'candidates' 
                      ? 'Tìm theo tên, email...' 
                      : 'Tìm theo Gmail, tên, chuyên đề...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </span>
            </p>

            {/* List rendered based on subtab */}
            {activeSubTab === 'candidates' ? (
              filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium">
                  Không tìm thấy đăng ký nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/55 border-b border-slate-100 font-bold text-slate-500 font-mono">
                        <th className="p-4 pl-6">Thí sinh / Học viên</th>
                        <th className="p-4 text-center">Lượt ôn luyện</th>
                        <th className="p-4 text-center">Lượt thi thử</th>
                        <th className="p-4 text-center">Điểm số trung bình</th>
                        <th className="p-4 text-center">Tỷ lệ đạt (Pass)</th>
                        <th className="p-4 text-right pr-6">Liên kết lúc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => {
                        const metrics = getUserMetrics(u.id);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              {u.photoURL ? (
                                <img 
                                  src={u.photoURL} 
                                  alt="Avatar" 
                                  className="w-7 h-7 rounded-full border border-slate-105"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-55 text-indigo-700 font-bold flex items-center justify-center bg-indigo-100">
                                  {(u.displayName || u.email || 'C')[0].toUpperCase()}
                                </div>
                              )}
                              <div className="font-medium text-slate-800">
                                <span className="block font-semibold">{u.displayName || 'Thí sinh ẩn danh'}</span>
                                <span className="block text-[10px] text-slate-400 font-mono">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-slate-600">
                              {metrics.totalPractices}
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-slate-600">
                              {metrics.totalExams}
                            </td>
                            <td className="p-4 text-center font-mono">
                              {metrics.totalExams > 0 ? (
                                <span className="font-bold text-indigo-650 font-sans mt-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                  {metrics.avgScore.toFixed(1)} /10
                                </span>
                              ) : (
                                <span className="text-slate-350 italic text-[10px]">Chưa thi</span>
                              )}
                            </td>
                            <td className="p-4 text-center font-mono">
                              {metrics.totalExams > 0 ? (
                                <span className={`px-2 py-0.5 rounded font-sans text-[10.5px] font-semibold ${
                                  metrics.passRate >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {metrics.passRate.toFixed(0)}%
                                </span>
                              ) : (
                                <span className="text-slate-350 italic text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right pr-6 font-mono text-slate-400 text-[10.5px]">
                              {u.createdAt ? formatDate(u.createdAt.toDate ? u.createdAt.toDate().toISOString() : u.createdAt) : 'Ngoại tuyến'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* All system-wide Exam history logs */
              filteredHistory.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium">
                  Hệ thống chưa ghi nhận lượt nộp bài nào khớp với bộ lọc.
                </div>
              ) : (
                <div className="overflow-x-auto animate-fade-in">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/55 border-b border-slate-100 font-bold text-slate-500 font-mono">
                        <th className="p-4 pl-6">Thí sinh / Học viên</th>
                        <th className="p-4">Thời gian thi</th>
                        <th className="p-4">Chế độ</th>
                        <th className="p-4">Chuyên đề bài làm</th>
                        <th className="p-4 text-center">Tổng câu</th>
                        <th className="p-4 text-center">Đáp án đúng</th>
                        <th className="p-4 text-center">Điểm số</th>
                        <th className="p-4 text-center">Kết đạt</th>
                        <th className="p-4 text-right pr-6">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHistory.map((item, idx) => {
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/20 transition-colors">
                            {/* Candidate info column */}
                            <td className="p-4 pl-6">
                              <span className="block font-bold text-slate-800">{item.candidateName || 'Candidate'}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{item.candidateEmail}</span>
                            </td>

                            {/* Timestamp */}
                            <td className="p-4 font-mono text-[11px] text-slate-500">
                              {formatDate(item.date)}
                            </td>

                            {/* Practice or Exam */}
                            <td className="p-4 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.mode === 'exam' 
                                  ? 'bg-[#8c5211]/10 text-[#8c5211]' 
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {item.mode === 'exam' ? 'Thi Thử' : 'Luyện Học'}
                              </span>
                            </td>

                            {/* Category scoped */}
                            <td className="p-4 font-medium text-slate-600 max-w-[150px] truncate" title={item.categoryName}>
                              {item.categoryName}
                            </td>

                            {/* Total Questions count */}
                            <td className="p-4 text-center font-mono text-slate-600 font-bold">
                              {item.totalQuestions}
                            </td>

                            {/* Correct Answers */}
                            <td className="p-4 text-center font-mono font-bold text-emerald-600 text-sm">
                              {item.correctAnswersCount}
                            </td>

                            {/* Scores scaled to 10 */}
                            <td className="p-4 text-center font-mono text-indigo-700 font-extrabold text-sm">
                              {item.score.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">/10</span>
                            </td>

                            {/* Passed status indicator */}
                            <td className="p-4 text-center font-bold">
                              {item.passed ? (
                                <span className="text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 py-0.5 rounded text-[10.5px]" title="Đánh giá học phần ĐẠT YÊU CẦU">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Đạt
                                </span>
                              ) : (
                                <span className="text-rose-600 flex items-center justify-center gap-1 bg-rose-50 py-0.5 rounded text-[10.5px]" title="Đánh giá học phần CHƯA ĐẠT">
                                  <AlertCircle className="w-3 h-3 text-rose-500" /> Chưa Đạt
                                </span>
                              )}
                            </td>

                            {/* Detailed action triggers - Print report PDF */}
                            <td className="p-4 text-right pr-6">
                              <button
                                onClick={() => onPrintReport({
                                  ...item,
                                  date: item.date,
                                  mode: item.mode,
                                  categoryName: item.categoryName,
                                  totalQuestions: item.totalQuestions,
                                  correctAnswersCount: item.correctAnswersCount,
                                  score: item.score,
                                  timeSpentSeconds: item.timeSpentSeconds,
                                  passed: item.passed,
                                  // Pass user specific parameters
                                  candidateEmail: item.candidateEmail
                                })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-150 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg hover:border-indigo-150 transition cursor-pointer font-bold font-sans text-[11px] border border-slate-200"
                                title="Kiểm tra tờ bài làm chi tiết & xuất báo cáo PDF A4"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Xem PDF</span>
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
