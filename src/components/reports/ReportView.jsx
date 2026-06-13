import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { LayoutGrid, CheckCircle2, CircleDashed, Tag, Video, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const Donut = ({ percentage, color, emptyColor = "rgba(255,255,255,0.05)" }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="transform -rotate-90 w-14 h-14" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke={emptyColor} strokeWidth="10" fill="transparent" />
        <circle 
          cx="48" cy="48" r={radius} stroke={color} strokeWidth="10" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          className="transition-all duration-1000 ease-out" strokeLinecap="round" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
};

const MultiDonut = ({ data, total }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="transparent" />
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const strokeLength = (item.value / total) * circumference;
          const strokeDasharray = `${strokeLength} ${circumference}`;
          const offset = currentOffset;
          currentOffset -= strokeLength;
          return (
            <circle
              key={i}
              cx="48" cy="48" r={radius}
              stroke={item.color}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-white leading-none">{total}</span>
        <span className="text-[10px] text-gray-400 mt-1 uppercase">Tasks</span>
      </div>
    </div>
  );
};

const DecorativeDonut = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="transform -rotate-90 w-14 h-14" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
        {data.map((item, i) => {
          if (item.value === 0) return null;
          const strokeLength = (item.value / total) * circumference;
          const strokeDasharray = `${strokeLength} ${circumference}`;
          const offset = currentOffset;
          currentOffset -= strokeLength;
          return (
            <circle
              key={i}
              cx="48" cy="48" r={radius}
              stroke={item.color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
    </div>
  );
};

function ReportView() {
  const { tasks } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

    const stats = useMemo(() => {
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();
    const targetTime = targetYear * 12 + targetMonth;
    
    const now = new Date();
    const currentRealMonth = now.getMonth();
    const currentRealYear = now.getFullYear();
    const currentTime = currentRealYear * 12 + currentRealMonth;

    const filteredTasks = tasks.filter(t => {
      // Fallback to today if task has no date
      const dateStr = t.createdAt || t.dateCreated || t.dueDateTime || now.toISOString();
      const d = new Date(dateStr);
      const taskTime = d.getFullYear() * 12 + d.getMonth();
      
      const isDone = t.status === 'done' || t.completed;
      
      if (isDone) {
        // Các task đã hoàn thành được cộng dồn đến tháng đang xem
        return taskTime <= targetTime;
      } else {
        // Các task chưa hoàn thành sẽ tự động Roll-over (chuyển sang) tháng hiện tại
        // Không hiển thị task đang làm ở các tháng trong quá khứ
        return targetTime >= currentTime && taskTime <= targetTime;
      }
    });

    let total = filteredTasks.length;
    let completed = 0;
    let inProgress = 0;
    let planned = 0;
    
    // Tag stats mapping based on the image
    const tagsMap = {
      'Social': { count: 0, color: '#8B5CF6' },
      'Digital': { count: 0, color: '#F97316' },
      'Quay': { count: 0, color: '#3B82F6' },
      'Livestream': { count: 0, color: '#EC4899' },
      'Khác': { count: 0, color: '#10B981' },
    };

    let motionCount = 0;
    let motionInTitle = 0;
    
    filteredTasks.forEach(t => {
      if (t.status === 'done' || t.completed) completed++;
      else if (t.status === 'in-progress') inProgress++;
      else planned++; // treating everything else as planned/todo

      // Map tags or taskType aggressively to match DB reality
      let mappedTag = 'Khác';
      const searchStr = `${t.taskType || ''} ${t.tag || ''} ${t.order || ''} ${t.title || ''} ${t.description || ''}`.toLowerCase();
      
      if (searchStr.includes('social')) mappedTag = 'Social';
      else if (searchStr.includes('digital')) mappedTag = 'Digital';
      else if (searchStr.includes('quay')) mappedTag = 'Quay';
      else if (searchStr.includes('livestream')) mappedTag = 'Livestream';
      
      tagsMap[mappedTag].count++;

      // Motion tasks logic
      const isMotion = searchStr.includes('motion');
      if (isMotion) {
        motionCount++;
        if (t.title && t.title.toLowerCase().includes('motion')) {
          motionInTitle++;
        }
      }
    });

    // Handle empty state gracefully by ensuring percentages don't divide by zero
    const safeTotal = total === 0 ? 1 : total; 

    const completedPercent = Math.round((completed / safeTotal) * 100);
    const inProgressPercent = Math.round((inProgress / safeTotal) * 100);
    const motionPercent = Math.round((motionCount / safeTotal) * 100);
    
    const tagData = Object.keys(tagsMap).map(key => ({
      name: key,
      value: tagsMap[key].count,
      color: tagsMap[key].color,
      percent: Math.round((tagsMap[key].count / safeTotal) * 100)
    })).sort((a, b) => b.value - a.value);
    
    const numTagsWithData = tagData.filter(t => t.value > 0).length;

    const motionKhac = motionCount - motionInTitle;
    const motionInTitlePercent = motionCount > 0 ? Math.round((motionInTitle / motionCount) * 100) : 0;
    const motionKhacPercent = motionCount > 0 ? Math.round((motionKhac / motionCount) * 100) : 0;

    return {
      total,
      completed, completedPercent,
      inProgress, inProgressPercent,
      planned,
      tagData, numTagsWithData,
      motionCount, motionPercent,
      motionInTitle, motionKhac,
      motionInTitlePercent, motionKhacPercent
    };
  }, [tasks, selectedDate]);

  const currentDateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const currentMonthYear = `Tháng ${selectedDate.getMonth() + 1}, ${selectedDate.getFullYear()}`;

  return (
    <div className="flex-1 overflow-y-auto p-6 text-gray-200 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Báo cáo tổng quan – {currentMonthYear}</h1>
            <p className="text-sm text-gray-500">Dữ liệu cập nhật đến {currentDateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center glass-card !rounded-full px-4 py-2">
              <button onClick={handlePrevMonth} className="p-1 hover:text-white text-gray-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="mx-4 text-sm font-medium flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> {currentMonthYear}</span>
              <button onClick={handleNextMonth} className="p-1 hover:text-white text-gray-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button className="flex items-center gap-2 glass-card !rounded-full hover:bg-white/10 transition-colors px-5 py-2 text-sm font-medium text-white">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>

        {/* 5 Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              <LayoutGrid className="w-4 h-4" /> Tổng số task
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-xs text-gray-500">— so với tháng trước</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-4 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{stats.completed}</div>
                <div className="text-xs text-gray-500">— so với tháng trước</div>
              </div>
            </div>
            <Donut percentage={stats.completedPercent} color="#10B981" />
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-semibold mb-4 uppercase tracking-wider">
                <CircleDashed className="w-4 h-4" /> Đang thực hiện
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{stats.inProgress}</div>
                <div className="text-xs text-gray-400 font-medium">+ {stats.planned} PLANNED</div>
              </div>
            </div>
            <Donut percentage={stats.inProgressPercent} color="#3B82F6" />
          </div>

          {/* Card 4 */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-4 uppercase tracking-wider">
                <Tag className="w-4 h-4" /> Theo tag
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{stats.numTagsWithData}</div>
                <div className="text-xs text-gray-500">loại tag</div>
              </div>
            </div>
            <DecorativeDonut data={stats.tagData} />
          </div>

          {/* Card 5 */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-4 uppercase tracking-wider">
                <Video className="w-4 h-4" /> Motion tasks
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">{stats.motionCount}</div>
                <div className="text-xs font-medium text-orange-400"><span className="font-bold">{stats.motionPercent}%</span> tổng số task</div>
              </div>
            </div>
            <Donut percentage={stats.motionPercent} color="#F97316" />
          </div>
        </div>

        {/* Section 1: Phân loại task theo tag */}
        <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Phân loại task theo tag</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Tag</th>
                    <th className="pb-3 font-semibold">Số task</th>
                    <th className="pb-3 font-semibold">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {stats.tagData.map((tag, idx) => (
                    <tr key={idx}>
                      <td className="py-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${tag.color}20` }}>
                          <Tag className="w-3.5 h-3.5" style={{ color: tag.color }} />
                        </div>
                        <span className="font-medium">{tag.name}</span>
                      </td>
                      <td className="py-3 text-white font-medium">{tag.value}</td>
                      <td className="py-3 font-semibold" style={{ color: tag.color }}>{tag.percent}%</td>
                    </tr>
                  ))}
                  <tr className="text-gray-400 font-medium">
                    <td className="py-3 pt-4">Tổng</td>
                    <td className="py-3 pt-4 text-white">{stats.total}</td>
                    <td className="py-3 pt-4">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-px bg-white/5 hidden lg:block"></div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10">
            <MultiDonut data={stats.tagData} total={stats.total} />
            <div className="flex flex-col gap-3">
              {stats.tagData.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></div>
                  <span className="w-24 text-gray-300">{tag.name}</span>
                  <span className="w-6 font-semibold text-white text-right">{tag.value}</span>
                  <span className="w-12 text-gray-500 text-right">({tag.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Phân loại motion tasks */}
        <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Phân loại motion tasks</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-5 backdrop-blur-md">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">Tổng số motion tasks</div>
                <div className="text-3xl font-bold text-white mb-2">{stats.motionCount}</div>
                <div className="text-xs font-medium text-orange-400"><span className="font-bold">{stats.motionPercent}%</span> tổng số task</div>
              </div>
              <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-5 backdrop-blur-md">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">Motion trong title</div>
                <div className="text-3xl font-bold text-white mb-2">{stats.motionInTitle}</div>
                <div className="text-xs font-medium text-orange-400"><span className="font-bold">{stats.motionInTitlePercent}%</span> tổng motion tasks</div>
              </div>
            </div>
          </div>
          <div className="w-px bg-white/5 hidden lg:block"></div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10">
            <MultiDonut 
              data={[
                { value: stats.motionInTitle, color: '#F97316' },
                { value: stats.motionKhac, color: '#EAB308' }
              ]} 
              total={stats.motionCount} 
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                <span className="w-32 text-gray-300">Motion trong title</span>
                <span className="w-6 font-semibold text-white text-right">{stats.motionInTitle}</span>
                <span className="w-12 text-gray-500 text-right">({stats.motionInTitlePercent}%)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span className="w-32 text-gray-300">Khác</span>
                <span className="w-6 font-semibold text-white text-right">{stats.motionKhac}</span>
                <span className="w-12 text-gray-500 text-right">({stats.motionKhacPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 mt-8 pb-4">
          Lưu ý: Báo cáo dựa trên dữ liệu tasks trong hệ thống Orbit.
        </div>

      </div>
    </div>
  );
}

export default ReportView;
