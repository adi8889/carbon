import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { serve } from '@hono/node-server';
const app = new Hono();
const prisma = new PrismaClient();
app.get('/students', async (c) => {
  const students = await prisma.student.findMany();
  return c.json(students);
});
app.get('/students/enriched', async (c) => {
  const students = await prisma.student.findMany({
    include: { proctor: true }
  });
  return c.json(students);
});
app.get('/professors', async (c) => {
  const professors = await prisma.professor.findMany();
  return c.json(professors);
});
app.post('/students', async (c) => {
  const data = await c.req.json();
  const existingStudent = await prisma.student.findUnique({
    where: { aadharNumber: data.aadharNumber },
  });
  if (existingStudent) {
    return c.json({ error: 'Student with this Aadhar number already exists' }, 400);
  }
  const student = await prisma.student.create({
    data,
  });
  return c.json(student);
});
app.post('/professors', async (c) => {
  const data = await c.req.json();
  const existingProfessor = await prisma.professor.findUnique({
    where: { aadharNumber: data.aadharNumber },
  });
  if (existingProfessor) {
    return c.json({ error: 'Professor with this Aadhar number already exists' }, 400);
  }
  const professor = await prisma.professor.create({
    data,
  });
  return c.json(professor);
});
app.get('/professors/:professorId/proctorships', async (c) => {
  const { professorId } = c.req.param();
  const proctorships = await prisma.student.findMany({
    where: { proctorId: professorId },
  });
  return c.json(proctorships);
});
app.patch('/students/:studentId', async (c) => {
  const { studentId } = c.req.param();
  const data = await c.req.json();
  const student = await prisma.student.update({
    where: { id: studentId },
    data,
  });
  return c.json(student);
});
app.patch('/professors/:professorId', async (c) => {
  const { professorId } = c.req.param();
  const data = await c.req.json();
  const professor = await prisma.professor.update({
    where: { id: professorId },
    data,
  });
  return c.json(professor);
});
app.delete('/students/:studentId', async (c) => {
  const { studentId } = c.req.param();
  await prisma.student.delete({
    where: { id: studentId },
  });
  return c.json({ message: 'Student deleted' });
});
app.delete('/professors/:professorId', async (c) => {
  const { professorId } = c.req.param();
  await prisma.professor.delete({
    where: { id: professorId },
  });
  return c.json({ message: 'Professor deleted' });
});
app.post('/professors/:professorId/proctorships', async (c) => {
  const { professorId } = c.req.param();
  const { studentId } = await c.req.json();
  const proctorship = await prisma.proctorship.create({
    data: {
      professorId,
      studentId,
    },
  });
  return c.json(proctorship);
});
app.get('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param();
  const membership = await prisma.libraryMembership.findUnique({
    where: { studentId },
  });
  return c.json(membership);
});
app.post('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param();
  const data = await c.req.json();
  const membership = await prisma.libraryMembership.create({
    data: {
      ...data,
      studentId,
    },
  });
  return c.json(membership);
});
app.patch('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param();
  const data = await c.req.json();
  const membership = await prisma.libraryMembership.update({
    where: { studentId },
    data,
  });
  return c.json(membership);
});
app.delete('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param();
  await prisma.libraryMembership.delete({
    where: { studentId },
  });
  return c.json({ message: 'Library membership deleted' });
});
// Use the Hono app with a Node.js server
serve(app);
console.log('Server running on http://localhost:3000');