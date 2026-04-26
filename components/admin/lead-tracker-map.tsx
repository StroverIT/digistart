"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import {
  Building2,
  CheckCircle2,
  Globe,
  MapPinned,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type LeadStatus = "pending" | "accepted" | "rejected";

interface Lead {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  fullInfo: string;
  hasWebsite: boolean;
  visited: boolean;
  contacted: boolean;
  status: LeadStatus;
}

const mockLeads: Lead[] = [
  {
    id: "ld-001",
    name: "Салон Белисима",
    address: "ул. Пиротска 18, София",
    coordinates: { lat: 42.6996, lng: 23.3219 },
    fullInfo: "Семеен салон с постоянен клиентски поток. Мениджърът е на място след 11:00.",
    hasWebsite: false,
    visited: false,
    contacted: false,
    status: "pending",
  },
  {
    id: "ld-002",
    name: "Кафе Меридиан",
    address: "бул. Витоша 64, София",
    coordinates: { lat: 42.6895, lng: 23.3197 },
    fullInfo: "Собственикът е отворен за маркетинг предложения, но иска бързи резултати.",
    hasWebsite: false,
    visited: true,
    contacted: false,
    status: "pending",
  },
  {
    id: "ld-003",
    name: "Автосервиз Драйв+",
    address: "бул. Сливница 212, София",
    coordinates: { lat: 42.7159, lng: 23.2725 },
    fullInfo: "Имат активен сайт и Google Business профил. Да се пропусне физическо посещение.",
    hasWebsite: true,
    visited: false,
    contacted: false,
    status: "pending",
  },
  {
    id: "ld-004",
    name: "Фитнес Енерджи Хъб",
    address: "жк. Младост 1А, София",
    coordinates: { lat: 42.6515, lng: 23.3782 },
    fullInfo: "Проведена среща и последващо обаждане. Потвърдиха интерес към месечен план.",
    hasWebsite: false,
    visited: true,
    contacted: true,
    status: "accepted",
  },
  {
    id: "ld-005",
    name: "Ресторант Градина",
    address: "ул. Шипка 34, София",
    coordinates: { lat: 42.6943, lng: 23.3381 },
    fullInfo: "Обектът отказа оферта след презентация. Няма нужда от нова визита този месец.",
    hasWebsite: false,
    visited: true,
    contacted: true,
    status: "rejected",
  },
];

type StatusFilter = "all" | "accepted" | "rejected";

const markerCache = new Map<string, DivIcon>();

function getMarkerColor(lead: Lead) {
  if (lead.hasWebsite) return "#6b7280";
  if (lead.status === "accepted") return "#16a34a";
  if (lead.status === "rejected") return "#dc2626";
  if (!lead.visited) return "#2563eb";
  if (lead.visited && !lead.contacted) return "#eab308";
  return "#2563eb";
}

function getMarkerIcon(lead: Lead, active: boolean) {
  const color = getMarkerColor(lead);
  const cacheKey = `${color}-${active ? "active" : "default"}`;
  const existingIcon = markerCache.get(cacheKey);

  if (existingIcon) {
    return existingIcon;
  }

  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: ${color};
      border: 2px solid white;
      box-shadow: ${active ? "0 0 0 4px rgba(37,99,235,0.35)" : "0 2px 6px rgba(15,23,42,0.35)"};
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  markerCache.set(cacheKey, icon);
  return icon;
}

export function LeadTrackerMap() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [hideWebsites, setHideWebsites] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (hideWebsites && lead.hasWebsite) return false;
      if (statusFilter === "accepted") return lead.status === "accepted";
      if (statusFilter === "rejected") return lead.status === "rejected";
      return true;
    });
  }, [hideWebsites, leads, statusFilter]);

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead))
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPinned className="h-5 w-5 text-blue-600" />
            Карта на потенциални клиенти
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2">
            <Switch checked={hideWebsites} onCheckedChange={setHideWebsites} id="hide-websites" />
            <Label htmlFor="hide-websites" className="cursor-pointer font-medium">
              Скрий обекти със сайтове
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
              Филтър по статус
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger id="status-filter" className="w-[220px] bg-white">
                <SelectValue placeholder="Избери статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Покажи всички</SelectItem>
                <SelectItem value="accepted">Само приети</SelectItem>
                <SelectItem value="rejected">Само отказани</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="h-[70vh] min-h-[560px] overflow-hidden rounded-xl border border-border bg-white">
        <MapContainer
          center={[42.6977, 23.3219]}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredLeads.map((lead) => (
            <Marker
              key={lead.id}
              position={[lead.coordinates.lat, lead.coordinates.lng]}
              icon={getMarkerIcon(lead, selectedLeadId === lead.id)}
              eventHandlers={{
                click: () => setSelectedLeadId(lead.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -12]}>
                <div className="space-y-0.5">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.address}</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <Sheet open={Boolean(selectedLead)} onOpenChange={(open) => !open && setSelectedLeadId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {!selectedLead ? null : (
            <div className="flex h-full flex-col">
              <SheetHeader className="px-0">
                <SheetTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {selectedLead.name}
                </SheetTitle>
                <SheetDescription>{selectedLead.address}</SheetDescription>
              </SheetHeader>

              <div className="space-y-5 py-4">
                {selectedLead.hasWebsite && (
                  <Badge
                    className="w-full justify-start rounded-md border-red-200 bg-red-50 px-3 py-2 text-red-700"
                    variant="outline"
                  >
                    <ShieldAlert className="mr-1 h-4 w-4" />
                    ИМА САЙТ - НЕ ПОСЕЩАВАЙ!
                  </Badge>
                )}

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm leading-relaxed text-foreground">{selectedLead.fullInfo}</p>
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visited-check" className="font-medium">
                      Посетен обект
                    </Label>
                    <Checkbox
                      id="visited-check"
                      checked={selectedLead.visited}
                      onCheckedChange={(checked) =>
                        updateLead(selectedLead.id, { visited: checked === true })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="contacted-check" className="font-medium">
                      Свързали сме се
                    </Label>
                    <Checkbox
                      id="contacted-check"
                      checked={selectedLead.contacted}
                      onCheckedChange={(checked) =>
                        updateLead(selectedLead.id, { contacted: checked === true })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead-status" className="font-medium">
                    Краен статус
                  </Label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(value) =>
                      updateLead(selectedLead.id, { status: value as LeadStatus })
                    }
                  >
                    <SelectTrigger id="lead-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">В процес</SelectItem>
                      <SelectItem value="accepted">Приета оферта</SelectItem>
                      <SelectItem value="rejected">Отказана оферта</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      Уебсайт
                    </p>
                    <p className={cn("text-sm font-semibold", selectedLead.hasWebsite ? "text-red-600" : "text-green-600")}>
                      {selectedLead.hasWebsite ? "Наличен" : "Липсва"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <PhoneCall className="h-3.5 w-3.5" />
                      Контакт
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedLead.contacted ? "Осъществен" : "Не е осъществен"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Промените се запазват локално и се отразяват веднага върху маркерите.
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
