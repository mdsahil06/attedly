import { useState } from 'react';
import { motion } from 'motion/react';
import { Code, Download, FileCode, Coffee } from 'lucide-react';

const JAVA_FILES = [
  {
    name: 'Student.java',
    code: `public class Student {
    private int id;
    private String rollNo;
    private String name;
    private String course;

    public Student(int id, String rollNo, String name, String course) {
        this.id = id;
        this.rollNo = rollNo;
        this.name = name;
        this.course = course;
    }

    // Getters and Setters
    public String getRollNo() { return rollNo; }
    public String getName() { return name; }
    public String getCourse() { return course; }
}`
  },
  {
    name: 'DatabaseHelper.java',
    code: `import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper {
    private static final String URL = "jdbc:sqlite:attendance.db";

    public static Connection connect() throws SQLException {
        return DriverManager.getConnection(URL);
    }

    public static void initialize() {
        String studentTable = "CREATE TABLE IF NOT EXISTS students (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "roll_no TEXT UNIQUE NOT NULL," +
                "name TEXT NOT NULL," +
                "course TEXT NOT NULL);";

        String attendanceTable = "CREATE TABLE IF NOT EXISTS attendance (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "student_id INTEGER," +
                "date TEXT," +
                "time TEXT," +
                "FOREIGN KEY(student_id) REFERENCES students(id));";

        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute(studentTable);
            stmt.execute(attendanceTable);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}`
  },
  {
    name: 'QRGenerator.java',
    code: `import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.nio.file.FileSystems;
import java.nio.file.Path;

public class QRGenerator {
    public static void generateQRCode(String text, String filePath) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 350, 350);
        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
    }
}`
  },
  {
    name: 'AttendanceSystem.java',
    code: `import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class AttendanceSystem extends JFrame {
    public AttendanceSystem() {
        setTitle("Student Attendance System");
        setSize(800, 600);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // Sidebar
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new GridLayout(5, 1));
        sidebar.setBackground(new Color(41, 128, 185));

        JButton btnDashboard = createNavButton("Dashboard");
        JButton btnAddStudent = createNavButton("Add Student");
        JButton btnScan = createNavButton("Scan QR");
        JButton btnReports = createNavButton("Reports");

        sidebar.add(btnDashboard);
        sidebar.add(btnAddStudent);
        sidebar.add(btnScan);
        sidebar.add(btnReports);

        add(sidebar, BorderLayout.WEST);

        // Main Content Area
        JPanel content = new JPanel();
        content.add(new JLabel("Welcome to Attendance Management System"));
        add(content, BorderLayout.CENTER);

        setVisible(true);
    }

    private JButton createNavButton(String text) {
        JButton btn = new JButton(text);
        btn.setForeground(Color.WHITE);
        btn.setBackground(new Color(52, 152, 219));
        btn.setFocusPainted(false);
        return btn;
    }

    public static void main(String[] args) {
        DatabaseHelper.initialize();
        new AttendanceSystem();
    }
}`
  }
];

export default function JavaSource() {
  const [selectedFile, setSelectedFile] = useState(JAVA_FILES[0]);

  const downloadFile = (file: typeof JAVA_FILES[0]) => {
    const blob = new Blob([file.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Java Source Reference</h1>
          <p className="text-gray-500 mt-1">View and download the Java Swing implementation of this system</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100">
          <Coffee className="w-5 h-5" />
          <span className="font-bold">Java Edition</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {JAVA_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                selectedFile.name === file.name
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <FileCode className="w-5 h-5" />
              <span className="font-semibold">{file.name}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="p-4 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-gray-400 text-sm font-mono">{selectedFile.name}</span>
            </div>
            <button 
              onClick={() => downloadFile(selectedFile)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-blue-300 font-mono text-sm leading-relaxed">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="text-blue-600" />
          Implementation Mapping
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900">Database</p>
              <p className="text-sm text-gray-600 mt-1">The Java <code className="bg-gray-200 px-1 rounded">DatabaseHelper</code> logic is implemented in our Node.js <code className="bg-gray-200 px-1 rounded">server.ts</code> using <code className="bg-gray-200 px-1 rounded">better-sqlite3</code>.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900">QR Generation</p>
              <p className="text-sm text-gray-600 mt-1">The Java <code className="bg-gray-200 px-1 rounded">QRGenerator</code> (ZXing) is replaced by the <code className="bg-gray-200 px-1 rounded">qrcode.react</code> library for instant browser rendering.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900">User Interface</p>
              <p className="text-sm text-gray-600 mt-1">The Java <code className="bg-gray-200 px-1 rounded">Swing</code> GUI is modernized using <code className="bg-gray-200 px-1 rounded">React</code> and <code className="bg-gray-200 px-1 rounded">Tailwind CSS</code> for a responsive web experience.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900">QR Scanning</p>
              <p className="text-sm text-gray-600 mt-1">Scanning is handled by <code className="bg-gray-200 px-1 rounded">html5-qrcode</code>, allowing students to be scanned via mobile phone or webcam directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
