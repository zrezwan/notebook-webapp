import { getUser, logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">You are now logged in.</p>
        <form action={logout}>
          <Button variant="outline">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
