import React from 'react';
import { ExamHistoryItem, AppStats } from '../types';
import { Award, CheckCircle, Clock, BarChart3, TrendingUp, RefreshCw, Trash2, Calendar, FileQuestion, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryStatsProps {
  history: ExamHistoryItem[];
  stats: AppStats;
  onClearHistory: () => void;
  onSelectTab: (tab: string) => void;
  onPrintReport?: (data: any) => void;
}

export default function HistoryStats({ history, stats, onClearHistory, onSelectTab, onPrintReport }: HistoryStatsProps) {
  const [recentExam, setRecentExam] = React.useState<any>(null);

  // Query most recent detailed exam on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('vccs_recent_exam_details');
      if (raw) {
        setRecentExam(JSON.parse(raw));
      }
    } catch {
      // safe fallback
    }
  }, []);
  
  // Format dates
  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Generate coordinates for SVG Sparkline Chart
  const lineChartPoints = React.useMemo(() => {
    if (history.length === 0) return "";
    const width = 600;
    const height = 150;
    const padding = 20;
    
    // Sort chronological ascending for line chart
    const examSessions = [...history]
      .filter(h => h.mode === 'exam')
      .slice(-10); // Show max last 10 exams

    if (examSessions.length < 2) return "";

    const xStep = (width - padding * 2) / (examSessions.length - 1);
    
    return examSessions.map((item, index) => {
      const x = padding + index * xStep;
      // Map score 0 -> 10 to y height (reversed coordinates)
      const scorePercentage = item.score / 10;
      const y = height - padding - scorePercentage * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }, [history]);

  const examSessionsForChart = React.useMemo(() => {
    return [...history].filter(h => h.mode === 'exam').slice(-10);
  }, [history]);

  return (
    <div className="space-y-6" id="history-stats-root">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total practice runs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Luyện tập</span>
            <span className="text-2xl font-bold text-slate-800">{stats.totalPractices}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">lượt làm bài</span>
          </div>
        </div>

        {/* Total mocks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Thi thử</span>
            <span className="text-2xl font-bold text-slate-800">{stats.totalExams}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">lượt thi tính giờ</span>
          </div>
        </div>

        {/* Avg score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Điểm TB Thi Thử</span>
            <span className="text-2xl font-bold text-slate-800">
              {stats.totalExams > 0 ? stats.averageExamScore.toFixed(1) : '0.0'}
              <span className="text-sm font-normal text-slate-400">/10</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">phác họa kiểm tra</span>
          </div>
        </div>

        {/* Pass rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Tỉ Lệ Đạt (&gt;= 7.0)</span>
            <span className="text-2xl font-bold text-slate-800">
              {stats.totalExams > 0 ? `${Math.round(stats.passingRate)}%` : '0%'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">định dạng thi thử</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Chart & Correct Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category breakdown (2cols equivalent or single col block) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-1 lg:col-span-1 space-y-5">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-md">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Năng Lực Theo Danh Mục
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Đo lường tỉ lệ trả lời đúng theo chủ đề học</p>
          </div>

          <div className="space-y-4 pt-1">
            {Object.entries(stats.categoryCorrectRate).map(([cat, info]) => {
              const score = info.total > 0 ? Math.round((info.correct / info.total) * 100) : 0;
              let barColor = 'bg-indigo-600';
              let textBg = 'bg-indigo-50 text-indigo-700';
              if (score >= 80) {
                barColor = 'bg-emerald-500';
                textBg = 'bg-emerald-50 text-emerald-700';
              } else if (score >= 50) {
                barColor = 'bg-amber-500';
                textBg = 'bg-amber-50 text-amber-700';
              } else if (info.total > 0) {
                barColor = 'bg-rose-500';
                textBg = 'bg-rose-50 text-rose-700';
              }

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 max-w-[70%] truncate" title={cat}>{cat}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${textBg}`}>
                      {info.correct}/{info.total} đúng ({score}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                      style={{ width: `${Math.max(3, score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SVG Progress chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-md">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Biểu Đồ Xu Hướng Điểm Số
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Tiến trình làm bài của 10 bài thi thử gần nhất</p>
          </div>

          {examSessionsForChart.length < 2 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 rounded-xl my-4">
              <FileQuestion className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Cần làm ít nhất 2 bài thi thử để vẽ biểu đồ tiến trình</p>
              <button 
                onClick={() => onSelectTab('exam')}
                className="mt-2 text-xs text-indigo-600 hover:align-middle font-semibold hover:underline"
              >
                Bắt đầu thi thử ngay →
              </button>
            </div>
          ) : (
            <div className="flex-1 my-4 flex flex-col justify-end">
              <div className="relative w-full h-[150px] bg-slate-50/50 rounded-xl border border-slate-100 p-2">
                {/* Visual marker lines */}
                <div className="absolute top-[20px] left-0 w-full border-t border-slate-200/50 border-dashed text-[9px] text-slate-400 pl-2">Xuất sắc (8-10)</div>
                <div className="absolute top-[65px] left-0 w-full border-t border-slate-200/50 border-dashed text-[9px] text-slate-400 pl-2">Đạt yêu cầu (7)</div>
                <div className="absolute top-[110px] left-0 w-full border-t border-slate-200/50 border-dashed text-[9px] text-slate-400 pl-2">Yếu (&lt; 6)</div>

                {/* SVG Graph wrapper */}
                <svg viewBox="0 0 600 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  {examSessionsForChart.map((item, idx) => {
                    const x = 20 + idx * ((600 - 40) / (examSessionsForChart.length - 1));
                    return (
                      <line 
                        key={`grid-${idx}`} 
                        x1={x} y1={20} x2={x} y2={130} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                    );
                  })}
                  
                  {/* Glow path */}
                  <polyline
                    fill="none"
                    stroke="#a5b4fc"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                    points={lineChartPoints}
                  />

                  {/* Main Line */}
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={lineChartPoints}
                  />

                  {/* Nodes Circles with popups or badges */}
                  {examSessionsForChart.map((item, idx) => {
                    const xStep = (600 - 40) / (examSessionsForChart.length - 1);
                    const x = 20 + idx * xStep;
                    const scorePercentage = item.score / 10;
                    const y = 150 - 20 - scorePercentage * (150 - 40);

                    return (
                      <g key={`node-${idx}`} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke={item.passed ? "#10b981" : "#f43f5e"}
                          strokeWidth="3.5"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="fill-slate-700 font-mono"
                        >
                          {item.score.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 px-2 font-mono">
                <span>Cũ nhất ({formatDateString(examSessionsForChart[0].date).split(',')[0]})</span>
                <span>Bài thi thử chuẩn gần đây nhất</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-md">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Lịch Sử Làm Bài Gần Đây
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Danh sách toàn bộ các lượt ôn tập và thi thử đã thực hiện</p>
          </div>
          <div className="flex gap-2">
            {recentExam && (
              <button
                onClick={() => onPrintReport && onPrintReport(recentExam)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/75 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                title="Xuất PDF chi tiết lần làm bài gần nhất của bạn"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-650 animate-pulse" />
                Xuất PDF Bài Gần Nhất
              </button>
            )}
            {history.length > 0 && (
              <button
                onClick={() => {
                  if(confirm("Bạn có chắc chắn muốn xóa sạch lịch sử kết quả làm bài? Hành động này không thể hoàn tác.")) {
                    onClearHistory();
                  }
                }}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-all"
                id="btn-clear-history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa Lịch Sử
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-100 text-center rounded-xl bg-slate-50/20">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Chưa có kết quả lịch sử làm bài nào.</p>
            <p className="text-[10px] text-slate-400 mt-1">Hãy tham gia luyện tập hoặc thi thử để bắt đầu ghi nhận kết quả!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100" id="history-table-container">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase font-mono">
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4">Chế Độ</th>
                  <th className="p-4">Chủ Đề / Danh Mục</th>
                  <th className="p-4 text-center">Số Câu Trực Quan</th>
                  <th className="p-4 text-center">Kết Quả</th>
                  <th className="p-4 text-right">Điểm Số</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {[...history].reverse().map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs whitespace-nowrap">
                      {formatDateString(item.date)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.mode === 'practice' ? (
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Luyện tập
                        </span>
                      ) : (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Thi thử
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700 max-w-[200px] truncate" title={item.categoryName}>
                      {item.categoryName}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-slate-500">
                      {item.totalQuestions}
                    </td>
                    <td className="p-4 text-center font-mono text-xs">
                      <span className="text-emerald-600 font-semibold">{item.correctAnswersCount}</span>
                      <span className="text-slate-400">/{item.totalQuestions}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700 font-mono">
                      {item.score.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">đ</span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {item.mode === 'practice' ? (
                        <span className="text-slate-400 text-xs">-</span>
                      ) : item.passed ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5">
                          ĐẠT
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5">
                          CHƯA ĐẠT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
