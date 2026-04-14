import java.sql.*;
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
}
