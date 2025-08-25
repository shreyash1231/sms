"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      const res = await axios.post(base + "/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <main className="container py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader><CardTitle>Login</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <Button className="w-full" type="submit">Sign In</Button>
          </form>
          <div className="mt-3 text-sm text-slate-400">
            No account? <Link href="/register" className="underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
