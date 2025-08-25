"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER"|"ADMIN">("USER");
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      await axios.post(base + "/api/auth/register", { name, email, password, role });
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Register failed");
    }
  };

  return (
    <main className="container py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader><CardTitle>Register</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" /></div>
            <div><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></div>
            <div>
              <Label>Role</Label>
              <Select value={role} onChange={e=>setRole(e.target.value as "USER"|"ADMIN")}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </CardContent>
        <div className="mt-3 text-sm text-slate-400">
            Already have a account? <Link href="/login" className="underline">Login</Link>
      </div>
      </Card>
      
    </main>
  );
}
