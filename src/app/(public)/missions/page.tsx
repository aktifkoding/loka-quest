"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy } from "lucide-react";

interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch("/api/v1/missions");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch missions");
        }

        setMissions(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat misi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Misi Budaya</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pilih misi untuk memulai petualangan pembelajaran budaya Indonesia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Link key={mission.id} href={`/missions/${mission.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{mission.title}</CardTitle>
                    <span
                      className={`text-xs px-3 py-1 rounded-full capitalize ${getDifficultyColor(
                        mission.difficulty
                      )}`}
                    >
                      {mission.difficulty}
                    </span>
                  </div>
                  <CardDescription>{mission.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>{mission.xp_reward} XP</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Mainkan Misi
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {missions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Belum ada misi tersedia saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
