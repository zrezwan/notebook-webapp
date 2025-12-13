import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/backgrounds/pinkMarble.jpg')",
          backgroundSize: "cover",
          backgroundColor: "#f7f2f4",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        <div
          className="relative mx-auto flex items-center justify-center rounded-xl overflow-hidden"
          style={{
            aspectRatio: "667 / 884",
            height: "87.5vh",
            maxHeight: "900px",
            backgroundImage: "url('/backgrounds/notebook.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            boxShadow: "18px 20px 30px -14px rgba(0,0,0,0.45)",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center px-6 py-8 translate-x-5 md:translate-x-6 -translate-y-2">
            <Card className="w-full max-w-lg bg-transparent shadow-none border-0">
              <CardHeader className="text-center pb-1">
                <CardTitle className="text-3xl">Notebook</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mx-auto max-w-[18rem] space-y-3 -mt-1">
                  {children}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
