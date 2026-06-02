import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Award, Activity, FileText, RefreshCw, 
  AlertCircle, CheckCircle, Trash2, Calendar, Clock, 
  ShieldCheck, ArrowRight, UserCheck, TrendingUp,
  Plus, Edit2, Check, X, ShieldAlert, KeyRound, Mail, UserPlus
} from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, getDocs, collectionGroup, query, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ExamHistoryItem } from '../types';
import { Candidate } from '../data/candidates';

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
  candidates?: Candidate[];
  onUpdateCandidates?: (newCandidates: Candidate[]) => Promise<void>;
}

export default function AdminConsole({ 
  onPrintReport, 
  questionsCount,
  candidates = [],
  onUpdateCandidates
}: AdminConsoleProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allHistory, setAllHistory] = useState<(ExamHistoryItem & { candidateEmail?: string; candidateName?: string; userId?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'candidates' | 'users' | 'history'>('candidates');

  // Candidate form & action states
  const [newCandName, setNewCandName] = useState<string>('');
  const [newCandEmail, setNewCandEmail] = useState<string>('');
  const [newCandPassword, setNewCandPassword] = useState<string>('');
  const [newCandIsAdmin, setNewCandIsAdmin] = useState<boolean>(false);
  const [editingCandId, setEditingCandId] = useState<string | null>(null);

  const [editCandName, setEditCandName] = useState<string>('');
  const [editCandEmail, setEditCandEmail] = useState<string>('');
  const [editCandPassword, setEditCandPassword] = useState<string>('');
  const [editCandIsAdmin, setEditCandIsAdmin] = useState<boolean>(false);

  // Filter candidates matching searchTerm
  const filteredCandidates = useMemo(() => {
    const list = candidates || [];
    if (!searchTerm) return list;
    return list.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim()) {
      alert('Vui lòng nhập Họ & Tên thí sinh!');
      return;
    }
    
    // Find next cand ID index sequentially
    const list = candidates || [];
    const maxNum = list.reduce((max, c) => {
      const match = c.id.match(/^cand_(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        return val > max ? val : max;
      }
      return max;
    }, 0);
    const newId = `cand_${maxNum + 1}`;
    
    const newCand: Candidate = {
      id: newId,
      name: newCandName.trim(),
      email: newCandEmail.trim() || `${newId}@vccs.local`,
      password: newCandPassword.trim() || undefined,
      isAdmin: newCandIsAdmin
    };

    if (onUpdateCandidates) {
      await onUpdateCandidates([...list, newCand]);
    }
    
    // Reset fields
    setNewCandName('');
    setNewCandEmail('');
    setNewCandPassword('');
    setNewCandIsAdmin(false);
  };

  const handleStartEditCandidate = (cand: Candidate) => {
    setEditingCandId(cand.id);
    setEditCandName(cand.name);
    setEditCandEmail(cand.email);
    setEditCandPassword(cand.password || '');
    setEditCandIsAdmin(!!cand.isAdmin);
  };

  const handleSaveEditCandidate = async (id: string) => {
    if (!editCandName.trim()) {
      alert('Họ tên không được rỗng!');
      return;
    }
    
    const list = candidates || [];
    const updatedList = list.map(c => {
      if (c.id === id) {
        return {
          ...c,
          name: editCandName.trim(),
          email: editCandEmail.trim() || `${id}@vccs.local`,
          password: editCandPassword.trim() || undefined,
          isAdmin: editCandIsAdmin
        };
      }
      return c;
    });

    if (onUpdateCandidates) {
      await onUpdateCandidates(updatedList);
    }
    setEditingCandId(null);
  };

  const handleDeleteCandidate = async (id: string) => {
    const list = candidates || [];
    const target = list.find(c => c.id === id);
    if (!target) return;
    
    const countText = `Bạn có chắc chắn muốn xóa thí sinh "${target.name}"?`;
    if (confirm(countText)) {
      const updatedList = list.filter(c => c.id !== id);
      if (onUpdateCandidates) {
        await onUpdateCandidates(updatedList);
      }
    }
  };

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
                  type="button"
                  onClick={() => {
                    setActiveSubTab('candidates');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'candidates'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh Sách Thí Sinh ({candidates.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('users');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'users'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Đã Liên Kết Auth ({users.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('history');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'history'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sổ Học Bạ Hệ Thống ({allHistory.length})</span>
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
                      ? 'Tìm thí sinh có tên...' 
                      : activeSubTab === 'users'
                      ? 'Tìm Gmail, tên...' 
                      : 'Tìm theo Gmail, tên, chuyên đề...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all text-slate-700 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </span>
            </p>

            {/* List rendered based on subtab */}
            {activeSubTab === 'candidates' ? (
              <div className="space-y-0" id="candidates-tab-view">
                {/* Add New Candidate Inline Section */}
                <div className="p-5 bg-slate-50 border-b border-slate-100" id="add-candidate-section">
                  <form onSubmit={handleAddCandidate} className="flex flex-col xl:flex-row items-end gap-3.5 max-w-7xl mx-auto">
                    <div className="flex-1 space-y-1.5 w-full">
                      <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">
                        Họ & Tên Thí Sinh
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="VD: Tô Minh Tâm, Đặng Chí Thanh..."
                          value={newCandName}
                          onChange={(e) => setNewCandName(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none transition text-slate-800"
                        />
                        <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 w-full">
                      <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">
                        Email Đăng Nhập (Tự động cấp nếu trống)
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="VD: tominhtam@vccs.local"
                          value={newCandEmail}
                          onChange={(e) => setNewCandEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl pl-9 pr-3 py-2 text-xs font-mono outline-none transition text-slate-800"
                        />
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="w-full xl:w-52 space-y-1.5">
                      <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">
                        Mật Khẩu Xác Thực (Mặc định: tbtt@2026)
                      </span>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Nhập password hoặc để trống"
                          value={newCandPassword}
                          onChange={(e) => setNewCandPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none transition"
                        />
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pb-2 mr-3 whitespace-nowrap self-center">
                      <input
                        type="checkbox"
                        id="newCandIsAdmin"
                        checked={newCandIsAdmin}
                        onChange={(e) => setNewCandIsAdmin(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="newCandIsAdmin" className="text-xs font-black text-indigo-950 cursor-pointer select-none">
                        Quyền Quản trị (Admin)
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer self-stretch xl:self-auto justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Thí Sinh</span>
                    </button>
                  </form>
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs font-medium">
                    Không tìm thấy thí sinh nào khớp với từ khóa tìm kiếm.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/55 border-b border-slate-100 font-bold text-slate-500 font-mono">
                          <th className="p-4 pl-6">ID Thí Sinh</th>
                          <th className="p-4">Họ & Tên</th>
                          <th className="p-4">Email / Tài khoản</th>
                          <th className="p-4">Mật khẩu xác thực</th>
                          <th className="p-4">Nhóm quyền hạn</th>
                          <th className="p-4 text-right pr-6">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCandidates.map(c => {
                          const isEditing = editingCandId === c.id;
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-4 pl-6 font-mono font-bold text-indigo-700">
                                {c.id}
                              </td>
                              <td className="p-4 font-bold text-slate-800">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCandName}
                                    onChange={(e) => setEditCandName(e.target.value)}
                                    className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-150 text-slate-800 font-bold"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-extrabold text-slate-900">{c.name}</span>
                                    {c.isAdmin && (
                                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 font-mono text-slate-500">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCandEmail}
                                    onChange={(e) => setEditCandEmail(e.target.value)}
                                    className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-150 text-slate-600 font-mono"
                                  />
                                ) : (
                                  c.email
                                )}
                              </td>
                              <td className="p-4 font-mono">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCandPassword}
                                    placeholder="tbtt@2026"
                                    onChange={(e) => setEditCandPassword(e.target.value)}
                                    className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-150 text-slate-700 font-mono"
                                  />
                                ) : (
                                  c.password ? (
                                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                                      🔑 {c.password}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Mặc định (tbtt@2026)</span>
                                  )
                                )}
                              </td>
                              <td className="p-4">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      id={`edit-role-check-${c.id}`}
                                      checked={editCandIsAdmin}
                                      onChange={(e) => setEditCandIsAdmin(e.target.checked)}
                                      className="w-4 h-4 text-indigo-650 border-slate-300 rounded"
                                    />
                                    <label htmlFor={`edit-role-check-${c.id}`} className="text-xs font-bold text-slate-700 cursor-pointer">
                                      Nhóm Quản trị (Admin)
                                    </label>
                                  </div>
                                ) : (
                                  <span className={`inline-flex items-center gap-1 font-extrabold ${c.isAdmin ? 'text-amber-700' : 'text-slate-400'}`}>
                                    {c.isAdmin ? 'Quản Trị (Admin)' : 'Thí Sinh Thường'}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right pr-6 whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditCandidate(c.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-black text-[10px] flex items-center gap-0.5 shadow transition cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" /> Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCandId(null)}
                                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-black text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                                    >
                                      <X className="w-3 h-3" /> Hủy
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditCandidate(c)}
                                      className="px-2.5 py-1 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-black flex items-center gap-1 transition cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" /> Sửa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCandidate(c.id)}
                                      className="px-2.5 py-1 border border-rose-100 hover:bg-rose-50 hover:text-rose-700 text-rose-500 rounded-lg text-[10px] font-black flex items-center gap-1 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" /> Xóa
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : activeSubTab === 'users' ? (
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
