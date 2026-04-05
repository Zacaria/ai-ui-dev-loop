import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-assisted UI dev loop template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Use <code className="font-mono">/dev-loop</code> as a deterministic
            surface for browser automation, console inspection, and UI color
            token checks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dev-loop">Open /dev-loop</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/health">Hit /api/health</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
