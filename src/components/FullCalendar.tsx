"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CalendarWithDialog() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [event, setEvent] = useState<EventInput | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [open, setOpen] = useState(false);
  const [dateISO, setDateISO] = useState<string>("");
  const [kind, setKind] = useState<"nauka" | "ćwiczenia" | "">("");
  const [minutes, setMinutes] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!dateISO || !kind || !minutes) return;
    setSubmitting(true);
    const res = await fetch("/api/saveEvents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start: dateISO, kind, minutes }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return alert(data?.error?.message ?? "Błąd");
    setEvents((prev) => [
      ...prev,
      {
        id: data.id,
        title: `${data.kind} — ${data.minutes} min`,
        start: data.start,
        allDay: true,
      },
    ]);
    setOpen(false);
    setKind("");
    setMinutes(0);
  }

  useEffect(() => {
    const loadEvents = async () => {
      const res = await fetch("/api/getEvents");
      const data = await res.json();
      if (res.ok) {
        const ev = data.map((d: any) => ({
          id: d.id,
          title: `${d.kind} — ${d.minutes} min`,
          start: d.start,
          allDay: true,
        }));
        setEvents(ev);
      } else {
        alert(data?.error?.message ?? "Błąd ładowania");
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    console.log("events updated", events);
  }, [events]);

  const eventClick = (info: any) => {
    setShowEventDetails(true);
    setEvent(info.event);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={eventClick}
        dateClick={(info) => {
          setDateISO(new Date(info.dateStr).toISOString());
          setOpen(true);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Dodaj wpis ({new Date(dateISO).toLocaleDateString()})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Typ</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nauka">nauka</SelectItem>
                  <SelectItem value="ćwiczenia">ćwiczenia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Minuty</Label>
              <Input
                type="number"
                min={1}
                value={minutes || ""}
                onChange={(e) =>
                  setMinutes(parseInt(e.target.value || "0", 10))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={submit} disabled={submitting || !kind || !minutes}>
              {submitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showEventDetails && (
        <Card>
          <CardHeader>
            <CardTitle>{event?.title}</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <Button onClick={() => setShowEventDetails(false)}>X</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>{event?.id}</p>
            <p>{event?.start?.toString()}</p>
            <p>{event?.end?.toString()}</p>
            <p>{event?.allDay ? "Cały dzień" : "Nie cały dzień"}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
