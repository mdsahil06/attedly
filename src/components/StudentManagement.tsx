import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  QrCode as QrIcon,
  X,
  Download,
  UserPlus
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudent, setNewStudent] = useState({ roll_no: '', name: '', course: '' });
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    const data = await res.json();
    setStudents(data);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    });
    if (res.ok) {
      setNewStudent({ roll_no: '', name: '', course: '' });
      setIsModalOpen(false);
      fetchStudents();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadQR = (rollNo: string) => {
    const svg = document.getElementById(`qr-${rollNo}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${rollNo}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 mt-1">Register and manage student QR profiles</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all transform active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total: {filteredStudents.length} Students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Roll No</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold text-center">QR Code</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{student.roll_no}</td>
                  <td className="px-6 py-4 text-gray-600">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <QrIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input 
                    type="text"
                    required
                    value={newStudent.roll_no}
                    onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. CS2024001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                  <input 
                    type="text"
                    required
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. B.Tech CS"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all mt-4"
                >
                  Register Student
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Viewer Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center"
            >
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-gray-500 font-mono text-sm">{selectedStudent.roll_no}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 inline-block mb-6">
                <QRCodeSVG 
                  id={`qr-${selectedStudent.roll_no}`}
                  value={selectedStudent.roll_no} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <button 
                onClick={() => downloadQR(selectedStudent.roll_no)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                Download QR Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
