import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  QrCode
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    recentRecords: [] as any[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          fetch('/api/students'),
          fetch(`/api/attendance?date=${new Date().toISOString().split('T')[0]}`)
        ]);
        
        const students = await studentsRes.json();
        const attendance = await attendanceRes.json();
        
        setStats({
          totalStudents: students.length,
          presentToday: attendance.length,
          attendanceRate: students.length > 0 ? Math.round((attendance.length / students.length) * 100) : 0,
          recentRecords: attendance.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchData();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', shadow: 'shadow-blue-100' },
    { label: 'Present Today', value: stats.presentToday, icon: CheckCircle, color: 'bg-green-500', shadow: 'shadow-green-100' },
    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: TrendingUp, color: 'bg-purple-500', shadow: 'shadow-purple-100' },
    { label: 'Avg. Time', value: '09:15 AM', icon: Clock, color: 'bg-orange-500', shadow: 'shadow-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of today's attendance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg ${card.shadow}`}>
              <card.icon className="text-white w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Attendance</h2>
            <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Roll No</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentRecords.length > 0 ? (
                  stats.recentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {record.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{record.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{record.roll_no}</td>
                      <td className="px-6 py-4 text-gray-600">{record.course}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                          {record.time}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No attendance records for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold">Add Student</p>
                <p className="text-xs opacity-70">Register new student</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-all group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold">Scan QR</p>
                <p className="text-xs opacity-70">Mark attendance now</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
