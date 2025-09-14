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
  note?: string;
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
  const [kind, setKind] = useState<"Learning" | "Exercise" | "">("");
  const [minutes, setMinutes] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  //Edycja elementu
  const [editing, setEditing] = useState(false);
  //Notatka dla eventu
  const [notes, setNotes] = useState("");

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
          note: notes,
        }),
      });
      console.log("update res", res);
      console.log("update note", notes);
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
    } else {
      // 🔹 dodanie nowego elementu
      // 🔹 POST (tworzenie nowego zasobu)
      const res = await fetch("/api/saveEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: dateISO, kind, minutes, note: notes }),
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
    }
    console.log("here");
    setOpen(false);
    setEditing(false);
    setKind("");
    setMinutes(0);
    setSubmitting(false);
    setNotes("");
    setShowEventDetails(false);
    loadEvents(); // odświeżenie listy eventów po dodaniu nowego
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
        backgroundColor: d.kind === "nauka" ? "#3b82f6" : "#22c55e", // niebieski/zielony
      }));
      setEvents(ev);
    } else {
      alert(data?.error?.message ?? "Błąd ładowania");
    }
  };
  useEffect(() => {
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
    setNotes(infoEvent?.note || "");
  };

  return (
    <>
      <div className="bg-[#F4EDEA]">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={eventClick}
          firstDay={1} // tydzień zaczyna się od poniedziałku
          eventClassNames={() => ["cursor-pointer"]} // Tailwind
          dateClick={(info) => {
            setDateISO(new Date(info.dateStr).toISOString());
            setOpen(true);
          }}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit entry" : "Add entry"} (
                {dateISO ? new Date(dateISO).toLocaleDateString() : ""}){" "}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Typ</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Exercise">Exercise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Duration</Label>
                <Input
                  type="number"
                  min={1}
                  value={minutes || ""}
                  onChange={(e) =>
                    setMinutes(parseInt(e.target.value || "0", 10))
                  }
                />
              </div>
              <Label>Note</Label>
              <Textarea
                placeholder="Type your message here."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={submitting || !kind || !minutes}
              >
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {showEventDetails && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              {signleEvent?.kind} - {signleEvent?.minutes}
            </CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <div className="flex gap-2">
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
                        This action cannot be undone. This will permanently
                        delete element from database.
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

                <Button onClick={() => setShowEventDetails(false)}>
                  <IoCloseCircleSharp />
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex items-center gap-2 mt-2">
                <span>Event ID: </span>
                <Input
                  disabled
                  placeholder={signleEvent?.id}
                  className="w-100"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span>duration:{signleEvent?.minutes}</span>
                <Input
                  disabled
                  value={signleEvent?.minutes || ""}
                  className="w-100"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p>Kind: {signleEvent?.kind}</p>
                <Input
                  disabled
                  value={signleEvent?.kind || ""}
                  className="w-100"
                />
              </div>

              <p>Note:</p>
              <Textarea disabled value={signleEvent?.note || ""} />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
