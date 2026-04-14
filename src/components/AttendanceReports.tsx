import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Download, 
  Filter,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceReports() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  const fetchRecords = async () => {
    const res = await fetch(`/api/attendance?date=${selectedDate}`);
    const data = await res.json();
    setRecords(data);
  };

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Roll No', 'Course', 'Date', 'Time'];
    const rows = filteredRecords.map(r => [r.name, r.roll_no, r.course, r.date, r.time]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-500 mt-1">View and export historical attendance data</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gray-200 transition-all transform active:scale-95"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="relative w-full sm:max-w-xs">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredRecords.length} records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Roll No</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {record.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{record.roll_no}</td>
                    <td className="px-6 py-4 text-gray-600">{record.course}</td>
                    <td className="px-6 py-4 text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-gray-600">{record.time}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No records found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
          <p className="text-sm text-gray-500">
            Page 1 of 1
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-gray-200 rounded-lg bg-white text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button disabled className="p-2 border border-gray-200 rounded-lg bg-white text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
