import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database Path
  const DB_PATH = path.join(process.cwd(), "db.json");

  // Initialize DB if not exists
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [
        { id: "2021-0001", surname: "Admin", name: "System Administrator", role: "admin", password: "password", securityQuestion: "What is your role?", securityAnswer: "admin", profilePic: "" },
        { id: "2021-0002", surname: "Smith", name: "Dr. John Smith", role: "faculty", password: "password", securityQuestion: "What is your favorite color?", securityAnswer: "blue", profilePic: "" },
        { id: "2021-0003", surname: "Sanchez", name: "Cidric Sanchez", role: "student", password: "password", securityQuestion: "What is your favorite color?", securityAnswer: "blue", profilePic: "", balance: 1500, grades: [
          { subject: "Mathematics", grade: "1.25", instructor: "Dr. Smith" },
          { subject: "Physics", grade: "1.50", instructor: "Prof. Jones" }
        ], schedule: [
          { day: "Monday", time: "08:00 - 10:00", subject: "Mathematics", location: "Room 301", instructor: "Dr. Smith" },
          { day: "Wednesday", time: "10:00 - 12:00", subject: "Physics", location: "Lab 1", instructor: "Prof. Jones" }
        ] },
        { id: "2021-0004", surname: "Garcia", name: "Maria Garcia", role: "staff", password: "password", securityQuestion: "What is your favorite color?", securityAnswer: "blue", profilePic: "" }
      ],
      announcements: [
        { id: 1, title: "Final Exams Schedule", content: "Final exams will start on April 15th.", date: "2026-03-15", role: "all" },
        { id: 2, title: "Faculty Meeting", content: "Emergency meeting at 3 PM today.", date: "2026-03-20", role: "faculty" }
      ],
      messages: [],
      financialAid: [],
      resetRequests: [],
      auditLogs: [],
      scholarshipPrograms: [
        { id: 1, name: "Academic Excellence Scholarship", description: "For students with GPA above 1.5", coverage: "100% Tuition", deadline: "2026-05-01" },
        { id: 2, name: "Sports Scholarship", description: "For varsity players", coverage: "50% Tuition + Allowance", deadline: "2026-06-15" }
      ],
      recommendations: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }

  const getDB = () => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    // Ensure all keys exist to prevent "Cannot read properties of undefined (reading 'push')"
    const requiredKeys = {
      users: [],
      announcements: [],
      messages: [],
      financialAid: [],
      resetRequests: [],
      auditLogs: [],
      notifications: [],
      scholarshipPrograms: [],
      recommendations: []
    };
    
    let modified = false;
    for (const [key, defaultValue] of Object.entries(requiredKeys)) {
      if (!data[key]) {
        data[key] = defaultValue;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }
    
    return data;
  };
  const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

  const logAction = (userId: string, action: string, details: string) => {
    const db = getDB();
    db.auditLogs.push({
      id: Date.now(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    saveDB(db);
  };

  const createNotification = (userId: string, title: string, message: string, type: string = 'info') => {
    const db = getDB();
    db.notifications.push({
      id: Date.now(),
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    });
    saveDB(db);
  };

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { schoolId, password } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === schoolId && u.password === password);
    
    if (user) {
      logAction(user.id, "LOGIN", "User logged into the system");
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid ID or Password" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { surname, name, role, course, yearLevel, password, securityQuestion, securityAnswer } = req.body;
    const db = getDB();
    
    // Auto-generate School ID
    const year = new Date().getFullYear().toString().slice(-2);
    const students = db.users.filter((u: any) => u.role === 'student');
    const studentNum = (students.length + 1).toString().padStart(8, '0');
    const generatedId = `SCC-${year}-${studentNum}`;

    const newUser = { 
      id: generatedId, 
      surname, 
      name, 
      role: role || "student", 
      course, 
      yearLevel, 
      password,
      securityQuestion,
      securityAnswer,
      balance: 0, 
      grades: [], 
      schedule: [] 
    };
    db.users.push(newUser);
    saveDB(db);
    logAction(generatedId, "REGISTER", `New user registered with role: ${role || "student"}. Generated ID: ${generatedId}`);
    createNotification(generatedId, "Welcome!", "Welcome to the Student Aid Portal. Your School ID is " + generatedId, "success");
    res.json({ success: true, user: newUser });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { schoolId } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === schoolId);
    if (user) {
      res.json({ success: true, securityQuestion: user.securityQuestion });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { schoolId, securityAnswer, newPassword } = req.body;
    const db = getDB();
    const index = db.users.findIndex((u: any) => u.id === schoolId && u.securityAnswer.toLowerCase() === securityAnswer.toLowerCase());
    if (index !== -1) {
      db.users[index].password = newPassword;
      saveDB(db);
      logAction(schoolId, "PASSWORD_RESET", "User reset their password via security question");
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Incorrect security answer" });
    }
  });

  app.post("/api/auth/request-reset", (req, res) => {
    const { schoolId, name } = req.body;
    const db = getDB();
    const request = { id: Date.now(), schoolId, name, status: "pending", date: new Date().toISOString() };
    db.resetRequests.push(request);
    saveDB(db);
    res.json({ success: true });
  });

  app.get("/api/admin/reset-requests", (req, res) => {
    res.json(getDB().resetRequests || []);
  });

  app.post("/api/admin/approve-reset", (req, res) => {
    const { requestId, newPassword } = req.body;
    const db = getDB();
    const requestIndex = db.resetRequests.findIndex((r: any) => r.id === requestId);
    if (requestIndex !== -1) {
      const schoolId = db.resetRequests[requestIndex].schoolId;
      const userIndex = db.users.findIndex((u: any) => u.id === schoolId);
      if (userIndex !== -1) {
        db.users[userIndex].password = newPassword;
        db.resetRequests[requestIndex].status = "approved";
        saveDB(db);
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } else {
      res.status(404).json({ success: false, message: "Request not found" });
    }
  });

  app.post("/api/users/profile-pic", (req, res) => {
    const { schoolId, profilePic } = req.body;
    const db = getDB();
    const index = db.users.findIndex((u: any) => u.id === schoolId);
    if (index !== -1) {
      db.users[index].profilePic = profilePic;
      saveDB(db);
      logAction(schoolId, "PROFILE_PIC_UPDATE", "User updated their profile picture");
      res.json({ success: true, user: db.users[index] });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });

  // User Management
  app.get("/api/users", (req, res) => {
    res.json(getDB().users);
  });

  app.put("/api/users/:id", (req, res) => {
    const db = getDB();
    const index = db.users.findIndex((u: any) => u.id === req.params.id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...req.body };
      saveDB(db);
      res.json({ success: true, user: db.users[index] });
    } else {
      res.status(404).json({ success: false });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const db = getDB();
    db.users = db.users.filter((u: any) => u.id !== req.params.id);
    saveDB(db);
    logAction("ADMIN", "USER_DELETE", `User ${req.params.id} was deactivated/deleted`);
    res.json({ success: true });
  });

  // Audit Logs
  app.get("/api/admin/audit-logs", (req, res) => {
    res.json(getDB().auditLogs);
  });

  // Announcements
  app.get("/api/announcements", (req, res) => {
    res.json(getDB().announcements);
  });

  app.post("/api/announcements", (req, res) => {
    const db = getDB();
    const announcement = { ...req.body, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    db.announcements.push(announcement);
    saveDB(db);
    logAction("ADMIN", "ANNOUNCEMENT_CREATE", `New announcement: ${announcement.title}`);
    res.json(announcement);
  });

  // Scholarship Programs
  app.get("/api/scholarships", (req, res) => {
    res.json(getDB().scholarshipPrograms || []);
  });

  app.post("/api/scholarships", (req, res) => {
    const db = getDB();
    const program = { ...req.body, id: Date.now() };
    db.scholarshipPrograms.push(program);
    saveDB(db);
    logAction("ADMIN", "SCHOLARSHIP_CREATE", `New scholarship program: ${program.name}`);
    res.json(program);
  });

  app.delete("/api/scholarships/:id", (req, res) => {
    const db = getDB();
    db.scholarshipPrograms = db.scholarshipPrograms.filter((p: any) => p.id !== parseInt(req.params.id));
    saveDB(db);
    res.json({ success: true });
  });

  // Recommendations
  app.get("/api/recommendations", (req, res) => {
    res.json(getDB().recommendations || []);
  });

  app.post("/api/recommendations", (req, res) => {
    const db = getDB();
    const recommendation = { ...req.body, id: Date.now(), date: new Date().toISOString() };
    db.recommendations.push(recommendation);
    saveDB(db);
    logAction(req.body.facultyId, "RECOMMENDATION_CREATE", `Recommendation for student: ${req.body.studentId}`);
    res.json(recommendation);
  });

  // Messaging
  app.get("/api/messages/:userId", (req, res) => {
    const db = getDB();
    const userMessages = db.messages.filter((m: any) => m.to === req.params.userId || m.from === req.params.userId);
    res.json(userMessages);
  });

  app.post("/api/messages", (req, res) => {
    const db = getDB();
    const newMessage = { ...req.body, id: Date.now(), timestamp: new Date().toISOString() };
    db.messages.push(newMessage);
    saveDB(db);
    createNotification(req.body.to, "New Message", `You received a new message from ${req.body.fromName || 'a user'}`, "info");
    res.json(newMessage);
  });

  // Notifications
  app.get("/api/notifications/:userId", (req, res) => {
    const db = getDB();
    const userNotifications = db.notifications.filter((n: any) => n.userId === req.params.userId);
    res.json(userNotifications);
  });

  app.post("/api/notifications/mark-read", (req, res) => {
    const { userId } = req.body;
    const db = getDB();
    db.notifications.forEach((n: any) => {
      if (n.userId === userId) n.read = true;
    });
    saveDB(db);
    res.json({ success: true });
  });

  // Financial Aid
  app.post("/api/financial-aid", (req, res) => {
    const db = getDB();
    const application = { ...req.body, id: Date.now(), status: "pending", date: new Date().toISOString() };
    db.financialAid.push(application);
    saveDB(db);
    logAction(req.body.studentId, "FINANCIAL_AID_APPLY", `Applied for ${req.body.program}`);
    createNotification("ADMIN", "New Application", `${req.body.studentName} applied for ${req.body.program}`, "info");
    res.json(application);
  });

  app.get("/api/financial-aid", (req, res) => {
    res.json(getDB().financialAid);
  });

  app.put("/api/financial-aid/:id/status", (req, res) => {
    const { status } = req.body;
    const db = getDB();
    const index = db.financialAid.findIndex((f: any) => f.id === parseInt(req.params.id));
    if (index !== -1) {
      db.financialAid[index].status = status;
      const studentId = db.financialAid[index].studentId;
      saveDB(db);
      logAction("ADMIN", "FINANCIAL_AID_UPDATE", `Application ${req.params.id} status updated to ${status}`);
      createNotification(studentId, "Application Update", `Your application for ${db.financialAid[index].program} has been ${status}`, status === 'approved' ? 'success' : 'error');
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Application not found" });
    }
  });

  // Policies
  app.get("/api/policies", (req, res) => {
    res.json({
      registration: "All students must provide valid information. School IDs are auto-generated upon successful registration.",
      roles: "Students can apply for aid and track academics. Faculty can provide recommendations. Staff manage documents. Admins oversee the entire system.",
      guide: "To apply for financial aid, navigate to the Financial Aid tab and click 'Apply Now'. Ensure all required documents are uploaded."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
