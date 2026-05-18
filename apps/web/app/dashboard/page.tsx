"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Phone, Users, CheckCircle, XCircle, AlertTriangle, TrendingUp, DollarSign, RefreshCw, Bell } from "lucide-react";

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
  call_outcome: string | null;
  created_at: string;
}

interface Analytics {
  total: number;
  pending: number;
  called: number;
  confirmed: number;
  no_answer: number;
  escalated: number;
  failed: number;
  confirmation_rate: number;
  no_show_reduction: number;
  cost_saved: number;
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

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [aptRes, anaRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/analytics"),
      ]);
      const aptData = await aptRes.json();
      const anaData = await anaRes.json();
      setAppointments(aptData);
      setAnalytics(anaData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const sendReminder = async (id: number) => {
    setSendingReminder(id);
    try {
      await fetch(`/api/appointments/${id}/reminder`, { method: "POST" });
      await fetchData();
    } catch (error) {
      console.error("Failed to send reminder:", error);
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Apollo HealthLine Dashboard</h1>
            <p className="text-muted-foreground">Monitor appointments and AI call status</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Link href="/patient">
              <Button>New Appointment</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.confirmed || 0}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.escalated || 0}</p>
                  <p className="text-xs text-muted-foreground">Escalated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${analytics?.cost_saved?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">Cost Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analytics?.confirmation_rate || 0}%</p>
                <p className="text-xs text-muted-foreground">Confirmation Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{analytics?.no_answer || 0}</p>
                <p className="text-xs text-muted-foreground">No Answer</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">{analytics?.no_show_reduction || 0}%</p>
                </div>
                <p className="text-xs text-muted-foreground">No-Show Reduction</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No appointments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apt.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{apt.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{SPECIALTY_LABELS[apt.specialty] || apt.specialty}</TableCell>
                      <TableCell>{BRANCH_LABELS[apt.branch] || apt.branch}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{apt.preferred_date}</p>
                          <p className="text-xs text-muted-foreground">{apt.preferred_time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[apt.status]}>
                          {STATUS_LABELS[apt.status] || apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/appointments/${apt.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          {apt.status !== "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendReminder(apt.id)}
                              disabled={sendingReminder === apt.id}
                            >
                              <Bell className="w-3 h-3 mr-1" />
                              {sendingReminder === apt.id ? "Sending..." : "Reminder"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}