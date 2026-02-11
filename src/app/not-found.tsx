import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-3 text-muted-foreground">
        This page doesn&apos;t exist.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
