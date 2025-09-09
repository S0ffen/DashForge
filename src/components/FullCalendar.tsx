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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

import { FaEdit } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

interface EventDB {
  id: string;
  userId: string;
  start: string; // ISO date string
  minutes: number;
  kind: string;
  notes?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export default function CalendarWithDialog() {
  const [eventsDB, setEventsDB] = useState<EventDB[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [signleEvent, setSingleEvent] = useState<EventDB | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [open, setOpen] = useState(false);
  const [dateISO, setDateISO] = useState<string>("");
  const [kind, setKind] = useState<"nauka" | "ćwiczenia" | "">("");
  const [minutes, setMinutes] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  //Edycja elementu
  const [editing, setEditing] = useState(false);

  async function submit() {
    if (!dateISO || !kind || !minutes) return;
    setSubmitting(true);
    if (editing && signleEvent) {
      // 🔹 edycja istniejącego eventu
      // 🔹 PUT (aktualizacja istniejącego zasobu)
      // PUT /api/updateEvents/[id] wysyłam pod taki endpoint i potem na podstawie id edytuję
      const res = await fetch(`/api/updateEvents/${signleEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: signleEvent.id,
          start: dateISO,
          kind,
          minutes,
        }),
      });
      console.log("update res", res);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Błąd");

      // aktualizacja w state
      setEventsDB((prev) => prev.map((ev) => (ev.id === data.id ? data : ev)));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === data.id
            ? {
                ...ev,
                title: `${data.kind} — ${data.minutes} min`,
                start: data.start,
              }
            : ev
        )
      );
      setOpen(false);
      setKind("");
      setMinutes(0);
      setSubmitting(false);
    } else {
      // 🔹 dodanie nowego elementu
      // 🔹 POST (tworzenie nowego zasobu)
      const res = await fetch("/api/saveEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: dateISO, kind, minutes }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) return alert(data?.error?.message ?? "Błąd");

      // rzutujemy do interfejsu EventDB który jest zgodny co jest w bazie
      setEventsDB((prev) => [...prev, data]);

      // dodajemy do tablicy kalendarza

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
      setSubmitting(false);
    }
  }
  const DeleteElement = async () => {
    if (!signleEvent) return;
    const res = await fetch(`/api/getEvents/${signleEvent.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    console.log("delete res", res, data);
    setShowEventDetails(false);
    setEvents((prev) => prev.filter((ev) => ev.id !== signleEvent.id));
    setEventsDB((prev) => prev.filter((ev) => ev.id !== signleEvent.id));
  };

  useEffect(() => {
    const loadEvents = async () => {
      const res = await fetch("/api/getEvents");
      const data = await res.json();
      console.log("loaded events", { res, data });
      if (res.ok) {
        // pełne dane z bazy zgodne z interfacem EventDB
        setEventsDB(data);
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
    console.log("eventsDB", eventsDB);
  }, [events]);

  const eventClick = (info: any) => {
    setShowEventDetails(true);
    const eventId = info.event.id;
    const infoEvent = eventsDB.find((event) => event.id === eventId) ?? null;
    console.log("infoEvent", infoEvent);
    setSingleEvent(infoEvent);
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
              {editing ? "Edytuj wpis" : "Dodaj wpis"} (
              {dateISO ? new Date(dateISO).toLocaleDateString() : ""}){" "}
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
            <Textarea placeholder="Type your message here." />
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
            <CardTitle>
              {signleEvent?.kind} - {signleEvent?.minutes}
            </CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <Button
                onClick={() => {
                  setOpen(true);
                  setDateISO(signleEvent?.start || "");
                  setKind(signleEvent?.kind as any);
                  setEditing(true); // tryb edycji
                  setMinutes(signleEvent?.minutes || 0);
                }}
              >
                <FaEdit />
              </Button>
              <Button onClick={() => setShowEventDetails(false)}>
                <IoCloseCircleSharp />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <MdDelete />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Do you want to delete selected element?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      element from database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => DeleteElement()}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>ID: {signleEvent?.id}</p>
            <p>START:{signleEvent?.start?.toString()}</p>
            <p>Czas trwania:{signleEvent?.minutes}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
