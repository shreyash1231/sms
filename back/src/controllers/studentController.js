const { PrismaClient } = require("@prisma/client");
const { validateStudent } = require("../utils/validate");
const { denseRank } = require("../utils/ranking");
const prisma = new PrismaClient();

exports.getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const q = req.query.q?.trim();
    const course = req.query.course?.trim();
    const year = req.query.year ? parseInt(req.query.year) : undefined;

    // Determine visibility based on role
    const includeInactive = req.user.role === "ADMIN";

    const where = {
      ...(includeInactive ? {} : { isActive: true }), // Admin sees all, user only active
      ...(q ? { OR: [{ fullName: { contains: q } }, { email: { contains: q } }] } : {}),
      ...(course ? { course } : {}),
      ...(year ? { graduationYear: year } : {}),
    };

    const skip = (page - 1) * limit;

    const [data, total, allForRank] = await Promise.all([
      prisma.student.findMany({ where, skip, take: limit, orderBy: [{ score: "desc" }, { id: "asc" }] }),
      prisma.student.count({ where }),
      prisma.student.findMany({ where, orderBy: [{ score: "desc" }, { id: "asc" }] }),
    ]);

    const rankMap = denseRank(allForRank);
    const ranked = data.map(s => ({ ...s, rank: rankMap[s.id] }));

    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data: ranked });
  } catch (err) {
    next(err);
  }
};



exports.createStudent = async (req, res, next) => {
  try {
    let email;

    if (req.user.role === "ADMIN") {
      email = req.body.email;
    } 
    const errors = validateStudent({
      ...req.body,
      email,
    });
    if (errors.length) return res.status(400).json({ errors });
    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already exists with this email" });
    }
    const createdStudent = await prisma.student.create({
      data: {
        fullName: req.body.fullName,
        email,
        course: req.body.course,
        graduationYear: Number(req.body.graduationYear),
        score: Number(req.body.score),
        ownerId: req.user.id,
      },
    });

    res.json({
      message: req.user.role === "ADMIN"
        ? "Student created successfully"
        : "Student created successfully",
      student: createdStudent,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    // Only ADMIN can update
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only ADMIN can update student data" });
    }

    // ID from route param
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Student ID is required in the route" });

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Prepare updated data including isActive
    const updatedData = {
      fullName: req.body.fullName ?? student.fullName,
      email: req.body.email ?? student.email,
      course: req.body.course ?? student.course,
      graduationYear: req.body.graduationYear ?? student.graduationYear,
      score: req.body.score ?? student.score,
      isActive: req.body.isActive !== undefined ? req.body.isActive : student.isActive,
    };

    // Validate updated data
    const errors = validateStudent(updatedData);
    if (errors.length) return res.status(400).json({ errors });

    const updated = await prisma.student.update({
      where: { id },
      data: updatedData,
    });

    res.json({
      message: "Student updated successfully",
      student: updated,
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteStudent = async (req, res, next) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only ADMIN can delete student data" });
    }

    const id = Number(req.params.id);
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const updated = await prisma.student.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: "Student deleted successfully",
      student: updated,
    });
  } catch (err) {
    next(err);
  }
};
