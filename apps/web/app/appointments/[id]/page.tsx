"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrowLeft, Phone, Calendar, MapPin, User, Clock, RefreshCw } from "lucide-react";

interface TranscriptEntry {
  role: string;
  content: string;
  timestamp?: string;
}

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  specialty: string;
  preferred_date: string;
  preferred_time: string;
  branch: string;
  doctor_name: string | null;
  status: string;
  bolna_call_id: string | null;
  call_outcome: string | null;
  transcript: string | null;
  duration: number | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  called: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  no_answer: "bg-red-100 text-red-800",
  escalated: "bg-orange-100 text-orange-800",
  failed: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  called: "Called",
  confirmed: "Confirmed",
  no_answer: "No Answer",
  escalated: "Escalated",
  failed: "Failed",
};

const SPECIALTY_LABELS: Record<string, string> = {
  cardiology: "Cardiology",
  orthopedics: "Orthopedics",
  neurology: "Neurology",
  pediatrics: "Pediatrics",
  general: "General Medicine",
};

const BRANCH_LABELS: Record<string, string> = {
  jubilee_hills: "Jubilee Hills",
  banjara_hills: "Banjara Hills",
  hitech_city: "Hitech City",
  secunderabad: "Secunderabad",
};

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Appointment not found</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let transcriptEntries: TranscriptEntry[] = [];
  if (appointment.transcript) {
    try {
      transcriptEntries = JSON.parse(appointment.transcript);
    } catch {
      transcriptEntries = [{ role: "system", content: appointment.transcript }];
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{appointment.patient_name}</h1>
            <p className="text-muted-foreground">Appointment #{appointment.id}</p>
          </div>
          <Badge className={STATUS_COLORS[appointment.status]}>
            {STATUS_LABELS[appointment.status] || appointment.status}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.preferred_date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.preferred_time}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{BRANCH_LABELS[appointment.branch] || appointment.branch}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{SPECIALTY_LABELS[appointment.specialty] || appointment.specialty}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Call ID</p>
                <p className="font-mono text-sm">{appointment.bolna_call_id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p>{formatDuration(appointment.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outcome</p>
                <p>{appointment.call_outcome || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{new Date(appointment.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transcript available yet</p>
                <p className="text-sm">Transcript will appear after the call is completed</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcriptEntries.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${entry.role === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        entry.role === "agent"
                          ? "bg-blue-100 text-blue-900"
                          : entry.role === "patient"
                          ? "bg-green-100 text-green-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">
                        {entry.role === "agent" ? "Asha (AI)" : entry.role === "patient" ? appointment.patient_name : "System"}
                      </p>
                      <p className="text-sm">{entry.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}