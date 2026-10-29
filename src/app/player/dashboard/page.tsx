import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Target, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PlayerDashboardPage() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const [progressRes, achievementsRes, attemptsRes] = await Promise.all([
      supabase.from("player_progress").select("*").eq("profile_id", user.id).single(),
      supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("profile_id", user.id),
      supabase
        .from("mission_attempts")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const progress = progressRes.data || {
      total_xp: 0,
      missions_completed: 0,
      current_level: 1,
    };
    const achievements = achievementsRes.data || [];
    const recentAttempts = attemptsRes.data || [];

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Dasbor Pemain</h1>
              <p className="text-muted-foreground">
                Selamat datang, {user.email}! Lihat progres Anda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{progress.total_xp}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level {progress.current_level}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Misi Selesai</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{progress.missions_completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terus lanjutkan!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pencapaian</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{achievements.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Badge diperoleh
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pencapaian Terbaru</CardTitle>
                  <CardDescription>Badge yang telah Anda raih</CardDescription>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="space-y-3">
                      {achievements.map((ua: { achievements: { title: string; icon: string; description: string } }) => (
                        <div
                          key={ua.achievements.title}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-2xl">{ua.achievements.icon}</span>
                          <div>
                            <p className="font-medium">{ua.achievements.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {ua.achievements.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Belum ada pencapaian. Mainkan misi untuk mulai meraih badge!
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Misi Terakhir</CardTitle>
                  <CardDescription>Riwayat attempt terbaru</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentAttempts.length > 0 ? (
                    <div className="space-y-3">
                      {recentAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">Misi #{attempt.mission_id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              Nilai: {attempt.score} • XP: {attempt.xp_earned}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              attempt.completed
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {attempt.completed ? "Selesai" : "Berjalan"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Belum ada attempt misi. Yuk mulai main!
                    </p>
                  )}
                  <Button asChild className="w-full mt-4">
                    <Link href="/explore">
                      Jelajahi Misi <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect("/auth/login");
  }
}
