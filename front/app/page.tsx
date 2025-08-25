import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container py-20">
      <Card>
        <CardHeader><CardTitle>Student Management System</CardTitle></CardHeader>
        <CardContent className="space-x-4">
          <Link href="/login" className="underline">Login</Link>
          <Link href="/register" className="underline">Register</Link>
        </CardContent>
      </Card>
    </main>
  );
}
