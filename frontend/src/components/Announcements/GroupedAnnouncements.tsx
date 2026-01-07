import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { app__models__announcement__AnnouncementPublic } from "@/client";
import { AnnouncementCard } from "./AnnouncementCard";

interface GroupedAnnouncementsProps {
  announcements: app__models__announcement__AnnouncementPublic[];
}

export function GroupedAnnouncements({ announcements }: GroupedAnnouncementsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* -------------------- helpers -------------------- */

  const matchesSearch = (a: app__models__announcement__AnnouncementPublic) =>
    !searchTerm ||
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  const isNew = (a: app__models__announcement__AnnouncementPublic) => {
    if (!a.created_date) return false;
    const d = new Date(a.created_date);
    const limit = new Date();
    limit.setDate(limit.getDate() - 10);
    return d > limit;
  };

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: p[key] === false }));

  /* -------------------- data -------------------- */

  // Filter new announcements
  const newAnnouncements = useMemo(
    () => announcements.filter((a) => isNew(a) && matchesSearch(a)),
    [announcements, searchTerm]
  );

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, app__models__announcement__AnnouncementPublic[]> = {};
    announcements.forEach((a) => {
      if (!matchesSearch(a)) return;
      const cat = a.category || "Uncategorized";
      map[cat] = map[cat] || [];
      map[cat].push(a);
    });
    return map;
  }, [announcements, searchTerm]);

  const categories = Object.keys(grouped).sort();

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Announcements</h1>

        <div className="flex items-center gap-4 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 w-56 min-w-[14rem]"
          >
            <option value="all">All Categories</option>
            <option value="new">New</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative w-64 min-w-[16rem]">
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* NEW (virtual) */}
      {(selectedCategory === "all" || selectedCategory === "new") &&
        newAnnouncements.length > 0 && (
          <div className="space-y-4">
            <div
              onClick={() => toggle("new")}
              className="flex items-center gap-3 cursor-pointer bg-muted/60 px-4 py-3 rounded-md"
            >
              <div className="w-5 flex justify-center shrink-0">
                {expanded["new"] !== false ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
              <div className="w-64 min-w-[16rem] truncate font-semibold text-blue-600">
                New
              </div>
              <Badge variant="secondary" className="shrink-0">
                {newAnnouncements.length}
              </Badge>
            </div>

            {expanded["new"] !== false && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newAnnouncements.map((a) => (
                  <AnnouncementCard key={`new-${a.id}`} announcement={a} />
                ))}
              </div>
            )}
          </div>
        )}

      {/* Categories */}
      {categories.map((category) => {
        if (selectedCategory !== "all" && selectedCategory !== category) return null;
        if (grouped[category].length === 0) return null;

        const open = expanded[category] !== false;

        return (
          <div key={category} className="space-y-4">
            <div
              onClick={() => toggle(category)}
              className="flex items-center gap-3 cursor-pointer bg-muted/60 px-4 py-3 rounded-md"
            >
              <div className="w-5 flex justify-center shrink-0">
                {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
              <div className="w-64 min-w-[16rem] truncate font-semibold">{category}</div>
              <Badge variant="outline" className="shrink-0">
                {grouped[category].length}
              </Badge>
            </div>

            {open && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[category].map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty states */}
      {announcements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements available.
        </div>
      )}

      {announcements.length > 0 &&
        newAnnouncements.length === 0 &&
        categories.every((c) => grouped[c].length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No announcements match your search.
          </div>
        )}
    </div>
  );
}
