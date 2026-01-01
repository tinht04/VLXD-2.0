import React, { useState, useMemo, useEffect } from 'react';
import { Invoice } from '../types';
import { StorageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { BrainCircuit, Loader2, Download } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'quarter' | 'year'>('week');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoadingData(true);
        const data = await StorageService.getInvoices();
        setInvoices(data);
        setLoadingData(false);
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const data: Record<string, number> = {};

    invoices.forEach(inv => {
      const d = new Date(inv.date);
      let key = '';

      if (timeframe === 'week') {
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
            key = d.toLocaleDateString('vi-VN', { weekday: 'short' });
        }
      } else if (timeframe === 'quarter') {
         if (d.getFullYear() === now.getFullYear()) {
             const q = Math.floor((d.getMonth() + 3) / 3);
             key = `Quý ${q}`;
         }
      } else {
        key = d.getFullYear().toString();
      }

      if (key) {
        data[key] = (data[key] || 0) + inv.totalAmount;
      }
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices, timeframe]);

  const totalRevenue = useMemo(() => {
      return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    setAiAnalysis('');
    const result = await GeminiService.analyzeBusiness(invoices);
    setAiAnalysis(result || "Không có phản hồi.");
    setLoadingAi(false);
  };
  
  const handleDownloadCSV = async () => {
      const csv = await StorageService.exportInvoicesToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doanh_Thu_VLXD.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-semibold text-slate-700">{label}</p>
          <p className="text-blue-600 font-bold">
            {payload[0].value?.toLocaleString('vi-VN')} đ
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (loadingData) {
      return (
          <div className="flex h-64 items-center justify-center text-slate-400">
              <Loader2 className="animate-spin h-8 w-8 mr-2"/> Đang tải báo cáo...
          </div>
      )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Báo Cáo Doanh Thu</h2>
           <p className="text-slate-500 text-sm">Theo dõi dòng tiền cửa hàng</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button onClick={handleDownloadCSV} className="p-2 bg-green-50 text-green-700 rounded hover:bg-green-100">
                <Download className="h-5 w-5" />
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['week', 'quarter', 'year'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            timeframe === t 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {t === 'week' ? '7 Ngày' : t === 'quarter' ? 'Quý' : 'Năm'}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Tổng Doanh Thu (Kỳ này)</p>
            <h3 className="text-3xl font-bold">{totalRevenue.toLocaleString('vi-VN')} đ</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium mb-1">Số lượng đơn hàng</p>
            <h3 className="text-3xl font-bold text-slate-800">{invoices.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium mb-1">Trợ lý Kinh Doanh</p>
             <h3 className="text-lg font-bold text-slate-800">Phân tích AI</h3>
           </div>
           <button 
            onClick={handleAiAnalysis}
            disabled={loadingAi}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50"
           >
               {loadingAi ? <Loader2 className="animate-spin h-6 w-6"/> : <BrainCircuit className="h-6 w-6" />}
           </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
             <h3 className="text-lg font-bold text-slate-700 mb-6">Biểu đồ tăng trưởng</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `${value/1000000}tr`} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* AI Output Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-purple-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-500"></div>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                 <BrainCircuit className="h-5 w-5 text-purple-600 mr-2" />
                 Góc nhìn chuyên gia
             </h3>
             
             {aiAnalysis ? (
                 <div className="prose prose-sm prose-slate max-h-[300px] overflow-y-auto">
                     <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-[250px] text-center text-slate-400">
                     <BrainCircuit className="h-12 w-12 mb-3 opacity-20" />
                     <p className="text-sm">Nhấn nút màu tím ở trên để AI phân tích dữ liệu bán hàng của bạn.</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};