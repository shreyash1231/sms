"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TD, TRow } from "@/components/ui/table";
import { logout } from "@/lib/auth";
import {jwtDecode} from "jwt-decode";
import { Label } from "@/components/ui/label";

type Student = {
  id: number;
  fullName: string;
  email: string;
  course: string;
  graduationYear: number;
  score: number;
  isActive: boolean;
  ownerId: number;
  rank?: number;
};

type Page = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Student[];
};

type DecodedToken = {
  id: number;
  role: "ADMIN" | "USER";
  exp: number;
};

const api = () => process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: number; role: "ADMIN" | "USER" } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [list, setList] = useState<Page | null>(null);
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { router.push("/login"); return; }
    try {
      const decoded = jwtDecode<DecodedToken>(t);
      setMe({ id: decoded.id, role: decoded.role });
      setToken(t);
    } catch {
      logout();
    }
  }, [router]);

  const headers = useMemo(() => ({ Authorization: "Bearer " + token }), [token]);

  async function load() {
    try {
      const params: any = { q, course, year, page, limit };
      const res = await axios.get(api() + "/api/students", { params, headers });
      setList(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load");
    }
  }

  useEffect(() => { if (token) load(); }, [token, q, course, year, page, limit]);

  // CRUD state
  const [form, setForm] = useState<Partial<Student>>({ score: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const resetForm = () => { setForm({ score: 0 }); setEditingId(null); };

  async function save() {
    setError("");
    if (me?.role !== "ADMIN") return; // Only ADMIN can create/edit

    try {
      if (editingId) {
        await axios.put(api() + "/api/students/" + editingId, form, { headers });
      } else {
        await axios.post(api() + "/api/students", form, { headers });
      }
      resetForm();
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.join(", ") ||
        e?.response?.data?.error ||
        "Failed to save"
      );
    }
  }

  async function softDelete(id: number) {
    if (me?.role !== "ADMIN") return; // Only ADMIN can delete
    if (!confirm("Soft delete this student?")) return;

    try {
      await axios.delete(api() + "/api/students/" + id, { headers });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to delete");
    }
  }

  if (!me) return null;

  return (
    <main className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="badge">{me.role}</span>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="grid md:grid-cols-5 gap-3">
          <div className="flex flex-col">
            <Label htmlFor="search">Search name/email</Label>
            <Input id="search" placeholder="Search name/email" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="courseFilter">Course</Label>
            <Input id="courseFilter" placeholder="Course" value={course} onChange={e=>setCourse(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="yearFilter">Year</Label>
            <Input id="yearFilter" placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} />
          </div>
          <div className="flex flex-col justify-end">
            <Button onClick={()=>setPage(1)}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {me.role === "ADMIN" && (
  <Card>
    <CardHeader><CardTitle>Create / Edit Student</CardTitle></CardHeader>
    <CardContent className="grid md:grid-cols-5 gap-3">
      <div className="flex flex-col">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Full Name"
          value={form.fullName || ""}
          onChange={e => setForm(s => ({ ...s, fullName: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="Email"
          value={form.email || ""}
          onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="course">Course</Label>
        <Input
          id="course"
          placeholder="Course"
          value={form.course || ""}
          onChange={e => setForm(s => ({ ...s, course: e.target.value }))}
        />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="graduationYear">Graduation Year</Label>
        <Input
          id="graduationYear"
          placeholder="Graduation Year"
          value={form.graduationYear?.toString() || ""}
          onChange={e => setForm(s => ({ ...s, graduationYear: Number(e.target.value) }))}
        />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="score">Score (0-100)</Label>
        <Input
          id="score"
          placeholder="Score (0-100)"
          value={(form.score ?? "").toString()}
          onChange={e => setForm(s => ({ ...s, score: Number(e.target.value) }))}
        />
      </div>

      {/* 🔹 Active dropdown only in edit mode */}
      {editingId && (
        <div className="flex flex-col">
          <Label htmlFor="isActive">Active</Label>
          <select
            id="isActive"
            value={form.isActive ? "Yes" : "No"}
            onChange={e => setForm(s => ({ ...s, isActive: e.target.value === "Yes" }))}
            className="border rounded px-2 py-1"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      )}

      <div className="flex flex-col justify-end">
        <Button onClick={save}>{editingId ? "Update" : "Create"}</Button>
      </div>
    </CardContent>
    {error && <div className="text-red-400 text-sm px-6">{error}</div>}
  </Card>
)}


      {/* Student List */}
      <Card className="overflow-x-auto">
        <Table>
          <THead>
            <TRow>
              <TH>Rank</TH>
              <TH>Full Name</TH>
              <TH>Email</TH>
              <TH>Course</TH>
              <TH>Year</TH>
              <TH>Score</TH>
              <TH>Active</TH>
              <TH>Actions</TH>
            </TRow>
          </THead>
          <tbody>
            {list?.data?.map(s => {
              const canEdit = me.role === "ADMIN";
              return (
                <TRow key={s.id}>
                  <TD>{s.rank}</TD>
                  <TD>{s.fullName}</TD>
                  <TD>{s.email}</TD>
                  <TD>{s.course}</TD>
                  <TD>{s.graduationYear}</TD>
                  <TD>{s.score}</TD>
                  <TD>{s.isActive ? "Yes" : "No"}</TD>
                  <TD className="space-x-2">
                    {canEdit && (
                      <>
                        <Button
                          onClick={()=>{ setEditingId(s.id); setForm({ ...s }); window.scrollTo({top:0, behavior:"smooth"}); }}
                        >
                          Edit
                        </Button>
                        <Button className="bg-white/10 text-white border border-slate-700"
                          onClick={()=>softDelete(s.id)}
                        >
                          Soft Delete
                        </Button>
                      </>
                    )}
                  </TD>
                </TRow>
              );
            })}
          </tbody>
        </Table>

        <div className="flex items-center justify-between pt-4 px-6 pb-6">
          <div>Page {list?.page} of {list?.totalPages}</div>
          <div className="space-x-2">
            <Button disabled={(list?.page||1)<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
            <Button disabled={(list?.page||1) >= (list?.totalPages||1)} onClick={()=>setPage(p=>p+1)}>Next</Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
