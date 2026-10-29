"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, CheckCircle } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  questions: Array<{ id: string; prompt: string; choices: string[] }>;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch("/api/v1/assessments");
        const data = await res.json();
        if (res.ok) setAssessments(data.data || []);
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Assessment Pembelajaran</h1>
            <p className="text-muted-foreground">
              Ukur pemahaman Anda tentang budaya Indonesia.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Memuat assessment...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {assessment.description}
                        </CardDescription>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full capitalize ${
                          assessment.assessment_type === "pre"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {assessment.assessment_type === "pre" ? "Pre-test" : "Post-test"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>{assessment.questions.length} pertanyaan</span>
                      </div>
                      <Button>Kerjakan Assessment</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {assessments.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Belum ada assessment tersedia.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
