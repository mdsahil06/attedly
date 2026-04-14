import javax.swing.*;
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
}
