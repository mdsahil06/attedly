public class Student {
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
}
