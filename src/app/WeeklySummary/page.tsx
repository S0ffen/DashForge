import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";

type Minute = {
  id: number;
  summary: string;
  date: string;
};

const minutes: Minute[] = [
  {
    id: 1,
    summary: "Discussed project milestones and assigned tasks for next week.",
    date: "2024-06-03",
  },
  {
    id: 2,
    summary: "Reviewed last week's progress and identified blockers.",
    date: "2024-06-10",
  },
  {
    id: 3,
    summary: "Finalized sprint goals and planned deployment.",
    date: "2024-06-17",
  },
];

export default function WeeklySummaryPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {minutes.map((minute) => (
                <li key={minute.id} className="p-4 rounded-md border">
                  <div className="text-sm text-muted-foreground">
                    {minute.date}
                  </div>
                  <div className="font-medium">{minute.summary}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
