"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Phone, User, Calendar, Clock, ArrowRight, CheckCircle } from "lucide-react";

const SPECIALTIES = [
  { value: "cardiology", label: "Cardiology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "neurology", label: "Neurology" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "general", label: "General Medicine" },
];

const BRANCHES = [
  { value: "jubilee_hills", label: "Jubilee Hills" },
  { value: "banjara_hills", label: "Banjara Hills" },
  { value: "hitech_city", label: "Hitech City" },
  { value: "secunderabad", label: "Secunderabad" },
];

const DOCTORS: Record<string, string[]> = {
  cardiology: ["Dr. Priya Sharma", "Dr. Rajesh Kumar"],
  orthopedics: ["Dr. Anil Gupta", "Dr. Suresh Patel"],
  neurology: ["Dr. Meera Reddy", "Dr. Vikram Singh"],
  pediatrics: ["Dr. Anita Desai", "Dr. Kiran Rao"],
  general: ["Dr. Sujatha Menon", "Dr. Chandrashekar"],
};

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

export default function PatientIntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    phone: "",
    specialty: "",
    branch: "",
    doctor_name: "",
    preferred_date: "",
    preferred_time: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      specialty: value,
      doctor_name: DOCTORS[value]?.[0] || "",
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setStep(3);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.patient_name && formData.phone.length >= 10;
  const isStep2Valid = formData.specialty && formData.branch && formData.preferred_date && formData.preferred_time;

  if (submitted) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Appointment Requested!</h2>
            <p className="text-muted-foreground mb-4">
              Our AI assistant Asha will call you shortly at <strong>{formData.phone}</strong> to confirm your appointment details.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Apollo HealthLine</CardTitle>
          <CardDescription>Book your appointment with our AI assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>1</div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>2</div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>3</div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="patient_name"
                    placeholder="Enter your full name"
                    value={formData.patient_name}
                    onChange={(e) => handleChange("patient_name", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select value={formData.specialty} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={formData.branch} onValueChange={(v) => handleChange("branch", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_date">Preferred Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="preferred_date"
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => handleChange("preferred_date", e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Select value={formData.preferred_time} onValueChange={(v) => handleChange("preferred_time", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={!isStep2Valid || isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Book Appointment"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}