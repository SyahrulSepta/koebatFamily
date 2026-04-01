import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileDown,
  FileSpreadsheet,
  Image as ImageIcon,
  MapPin,
  Network,
  Pencil,
  Phone,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
};

function Button({ className, variant = "default", type = "button", style, ...props }: ButtonProps) {
  const variantClass = {
    default: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-200",
    outline: "bg-white text-slate-900 hover:bg-slate-50 border border-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
    destructive: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
  }[variant];

  const variantStyle: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
    default: { background: "#0f172a", color: "#ffffff", border: "1px solid #0f172a" },
    secondary: { background: "#e2e8f0", color: "#0f172a", border: "1px solid #e2e8f0" },
    outline: { background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" },
    ghost: { background: "transparent", color: "#334155", border: "1px solid transparent" },
    destructive: { background: "#dc2626", color: "#ffffff", border: "1px solid #dc2626" },
  };

  return (
    <button
      type={type}
      style={{ borderRadius: 16, ...variantStyle[variant], ...style }}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className
      )}
      {...props}
    />
  );
}

function Input({ className, style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{ borderRadius: 12, border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", ...style }}
      className={cn(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={{ borderRadius: 12, border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", ...style }}
      className={cn(
        "min-h-[96px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-slate-800", className)} {...props} />;
}

function Card({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div style={{ border: "1px solid #e2e8f0", background: "#ffffff", ...style }} className={cn("border border-slate-200 bg-white", className)} {...props} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-500", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

function Badge({
  className,
  variant = "default",
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
}) {
  const variantClass = {
    default: "bg-slate-900 text-white border border-slate-900",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "bg-white text-slate-700 border border-slate-300",
  }[variant];

  const variantStyle: Record<"default" | "secondary" | "outline", React.CSSProperties> = {
    default: { background: "#0f172a", color: "#ffffff", border: "1px solid #0f172a" },
    secondary: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" },
    outline: { background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1" },
  };

  return (
    <span
      style={{ borderRadius: 12, ...variantStyle[variant], ...style }}
      className={cn("inline-flex items-center px-2.5 py-1 text-xs font-medium", variantClass, className)}
      {...props}
    >
      {children}
    </span>
  );
}

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={cn("relative max-h-[90vh] w-full overflow-hidden bg-white shadow-2xl", className)}>
        <button
          type="button"
          onClick={() => context.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          Tutup
        </button>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

type SelectItemDef = { value: string; label: string };
type SelectContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
  items: SelectItemDef[];
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function reactNodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join("");
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return reactNodeToText(element.props.children);
  }
  return "";
}

function extractSelectItems(children: React.ReactNode, items: SelectItemDef[] = []): SelectItemDef[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const element = child as React.ReactElement<{
      value?: string;
      children?: React.ReactNode;
    }>;

    if ((element.type as any)?.displayName === "LocalSelectItem") {
      const label = reactNodeToText(element.props.children).trim();
      items.push({ value: element.props.value || "", label });
      return;
    }

    if (element.props?.children) {
      extractSelectItems(element.props.children, items);
    }
  });
  return items;
}

function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const items = useMemo(() => extractSelectItems(children), [children]);
  return <SelectContext.Provider value={{ value, onValueChange, items }}>{children}</SelectContext.Provider>;
}

function SelectTrigger({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext);
  if (!context) return null;

  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
        className
      )}
      value={context.value ?? ""}
      onChange={(e) => context.onValueChange?.(e.target.value)}
    >
      {context.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function SelectValue(_props: { placeholder?: string }) {
  return null;
}

function SelectContent(_props: { children: React.ReactNode }) {
  return null;
}

function SelectItem(_props: { value: string; children: React.ReactNode }) {
  return null;
}
SelectItem.displayName = "LocalSelectItem";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2 bg-slate-100 p-1", className)} {...props} />;
}

function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const active = context.value === value;
  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/70",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div>{children}</div>;
}

function ScrollArea({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto", className)}>{children}</div>;
}

type Gender = "Laki-laki" | "Perempuan" | "";

type Member = {
  id: string;
  name: string;
  gender: Gender;
  birthDate?: string;
  address: string;
  phone: string;
  photo?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  name: string;
  gender: Gender;
  birthDate: string;
  address: string;
  phone: string;
  photo?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  notes?: string;
};

type FormErrors = Partial<
  Record<"name" | "address" | "phone" | "fatherId" | "motherId" | "spouseId", string>
>;

type RelationDraft = {
  fatherId: string;
  motherId: string;
  spouseId: string;
};

type DataQualityItem = {
  id: string;
  name: string;
  missingPhoto: boolean;
  missingBirthDate: boolean;
  missingPhone: boolean;
  missingAddress: boolean;
  missingParents: boolean;
};

type RelationWarning = {
  memberId: string;
  memberName: string;
  type: "missing_reference" | "one_way_spouse" | "self_reference" | "invalid_parent_pair";
  message: string;
};

type AppProfile = {
  familyName: string;
  subtitle: string;
  hometown: string;
  familySlug: string;
};

type BackupPackage = {
  schemaVersion: string;
  exportedAt: string;
  storageDriver: "local" | "supabase";
  profile: AppProfile;
  members: Member[];
};

type SupabaseConfig = {
  url: string;
  anonKey: string;
  enabled: boolean;
};

type CloudSyncStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

type AuthState = {
  email: string;
  session: Session | null;
  status: "signed_out" | "sending_link" | "signed_in" | "error";
  message: string;
};

type InviteRole = "editor" | "viewer";

type FamilyInvite = {
  inviteCode: string;
  familySlug: string;
  ownerUserId: string;
  invitedEmail?: string;
  role: InviteRole;
  status: "sent" | "accepted" | "expired";
  acceptedUserId?: string;
  acceptedAt?: string;
  expiresAt: string;
  createdAt: string;
};

type FamilyAccess = {
  ownerUserId: string;
  role: "owner" | InviteRole;
  familySlug: string;
};

type ReadOnlyShareSnapshot = {
  profile: AppProfile;
  members: Member[];
  sharedAt: string;
  hiddenFields: {
    phone: boolean;
    address: boolean;
    notes: boolean;
  };
};

type FamilyShareLink = {
  shareToken: string;
  familySlug: string;
  ownerUserId: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  snapshot: ReadOnlyShareSnapshot;
};

type PublicShareState = {
  type: "idle" | "loading" | "viewing" | "error";
  message: string;
  snapshot: ReadOnlyShareSnapshot | null;
  shareToken: string;
  familySlug: string;
  expiresAt?: string;
};

const STORAGE_KEY = "keluargaku-mvp-data";
const ENV_SUPABASE_URL = typeof import.meta !== "undefined" ? ((import.meta as any).env?.VITE_SUPABASE_URL || "") : "";
const ENV_SUPABASE_ANON_KEY = typeof import.meta !== "undefined" ? ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "") : "";
const SHARE_PARAM_KEY = "share";
const SHARE_FAMILY_PARAM_KEY = "family";
const SHARE_SB_URL_HASH_KEY = "sbUrl";
const SHARE_SB_KEY_HASH_KEY = "sbKey";
const PROFILE_STORAGE_KEY = "keluargaku-mvp-profile";
const BACKUP_STORAGE_KEY = "keluargaku-mvp-last-backup";
const SUPABASE_CONFIG_STORAGE_KEY = "keluargaku-mvp-supabase-config";
const AUTH_EMAIL_STORAGE_KEY = "keluargaku-mvp-auth-email";
const APP_SCHEMA_VERSION = "1.1.0";

const emptyRelationDraft: RelationDraft = {
  fatherId: "unassigned",
  motherId: "unassigned",
  spouseId: "unassigned",
};

const chartColors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

const defaultProfile: AppProfile = {
  familyName: "KeluargaKu",
  subtitle: "Arsip silsilah keluarga digital",
  hometown: "Indonesia",
  familySlug: "keluargaku",
};

function normalizeAppProfile(profile: AppProfile): AppProfile {
  const familyName = profile.familyName?.trim() || defaultProfile.familyName;
  return {
    familyName,
    subtitle: typeof profile.subtitle === "string" ? profile.subtitle : defaultProfile.subtitle,
    hometown: typeof profile.hometown === "string" ? profile.hometown : defaultProfile.hometown,
    familySlug: slugifyFamilyName(profile.familySlug || familyName),
  };
}

const MAX_PHOTO_DIMENSION = 960;
const LARGE_PHOTO_BYTES = 1024 * 1024 * 1.5;

async function resizeImageFileToDataUrl(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
) {
  const maxWidth = options?.maxWidth ?? MAX_PHOTO_DIMENSION;
  const maxHeight = options?.maxHeight ?? MAX_PHOTO_DIMENSION;
  const quality = options?.quality ?? 0.78;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar."));
    img.src = dataUrl;
  });

  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia untuk memproses gambar.");

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL("image/jpeg", quality);
}

const defaultSupabaseConfig: SupabaseConfig = {
  url: ENV_SUPABASE_URL,
  anonKey: ENV_SUPABASE_ANON_KEY,
  enabled: Boolean(ENV_SUPABASE_URL && ENV_SUPABASE_ANON_KEY),
};

const SUPABASE_SQL_SETUP = `create table if not exists family_profiles (
  family_slug text not null,
  owner_user_id uuid not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (family_slug, owner_user_id)
);

create table if not exists family_members (
  row_id text primary key,
  family_slug text not null,
  owner_user_id uuid not null,
  member_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists family_invites (
  invite_code text primary key,
  family_slug text not null,
  owner_user_id uuid not null,
  invited_email text,
  role text not null default 'viewer',
  status text not null default 'sent',
  accepted_user_id uuid,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists family_share_links (
  share_token text primary key,
  family_slug text not null,
  owner_user_id uuid not null,
  payload jsonb not null,
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_family_members_family_slug_owner
  on family_members (family_slug, owner_user_id);

create index if not exists idx_family_invites_family_slug_owner
  on family_invites (family_slug, owner_user_id);

create index if not exists idx_family_share_links_family_slug_owner
  on family_share_links (family_slug, owner_user_id);

alter table family_profiles enable row level security;
alter table family_members enable row level security;
alter table family_invites enable row level security;
alter table family_share_links enable row level security;

drop policy if exists "family_profiles_owner_all" on family_profiles;
drop policy if exists "family_members_family_access" on family_members;
drop policy if exists "family_invites_owner_or_guest" on family_invites;
drop policy if exists "family_share_links_owner_manage" on family_share_links;
drop policy if exists "family_share_links_public_read_active" on family_share_links;

create policy "family_profiles_owner_all"
on family_profiles
for all
using (
  auth.uid() = owner_user_id
  or exists (
    select 1 from family_invites fi
    where fi.family_slug = family_profiles.family_slug
      and fi.owner_user_id = family_profiles.owner_user_id
      and fi.status = 'accepted'
      and (
        fi.accepted_user_id = auth.uid()
        or lower(coalesce(fi.invited_email, '')) = lower(coalesce(auth.email(), ''))
      )
  )
)
with check (auth.uid() = owner_user_id);

create policy "family_members_family_access"
on family_members
for all
using (
  auth.uid() = owner_user_id
  or exists (
    select 1 from family_invites fi
    where fi.family_slug = family_members.family_slug
      and fi.owner_user_id = family_members.owner_user_id
      and fi.status = 'accepted'
      and (
        fi.accepted_user_id = auth.uid()
        or lower(coalesce(fi.invited_email, '')) = lower(coalesce(auth.email(), ''))
      )
  )
)
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1 from family_invites fi
    where fi.family_slug = family_members.family_slug
      and fi.owner_user_id = family_members.owner_user_id
      and fi.status = 'accepted'
      and fi.role = 'editor'
      and (
        fi.accepted_user_id = auth.uid()
        or lower(coalesce(fi.invited_email, '')) = lower(coalesce(auth.email(), ''))
      )
  )
);

create policy "family_invites_owner_or_guest"
on family_invites
for all
using (
  auth.uid() = owner_user_id
  or accepted_user_id = auth.uid()
  or lower(coalesce(invited_email, '')) = lower(coalesce(auth.email(), ''))
)
with check (
  auth.uid() = owner_user_id
  or lower(coalesce(invited_email, '')) = lower(coalesce(auth.email(), ''))
);

create policy "family_share_links_owner_manage"
on family_share_links
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "family_share_links_public_read_active"
on family_share_links
for select
using (is_active = true and expires_at > now());`;

const seedMembers: Member[] = [
  {
    id: "m-1",
    name: "Budi Santoso",
    gender: "Laki-laki",
    birthDate: "1970-01-10",
    address: "Jakarta Selatan",
    phone: "081234567890",
    spouseId: "m-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-2",
    name: "Siti Rahma",
    gender: "Perempuan",
    birthDate: "1972-05-15",
    address: "Jakarta Selatan",
    phone: "081298765432",
    spouseId: "m-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-3",
    name: "Andi Pratama",
    gender: "Laki-laki",
    birthDate: "1995-03-12",
    address: "Bandung",
    phone: "081355566677",
    fatherId: "m-1",
    motherId: "m-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-4",
    name: "Maya Lestari",
    gender: "Perempuan",
    birthDate: "1998-07-23",
    address: "Surabaya",
    phone: "081377788899",
    fatherId: "m-1",
    motherId: "m-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyForm: FormState = {
  name: "",
  gender: "",
  birthDate: "",
  address: "",
  phone: "",
  photo: "",
  fatherId: "unassigned",
  motherId: "unassigned",
  spouseId: "unassigned",
  notes: "",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function generateInviteCode() {
  return `INV-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function getStatusToneClass(type: CloudSyncStatus["type"] | AuthState["status"]) {
  if (type === "error") return "border-red-200 bg-red-50 text-red-700";
  if (type === "success" || type === "signed_in") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (type === "loading" || type === "sending_link") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function buildInviteShareText(familyName: string, invite: FamilyInvite) {
  return `Halo, Anda diundang ke keluarga ${familyName}.

Login ke aplikasi, lalu masukkan kode invite ini: ${invite.inviteCode}
Family slug: ${invite.familySlug}`;
}

function buildInviteMailtoLink(familyName: string, invite: FamilyInvite) {
  const to = invite.invitedEmail || "";
  const subject = `Undangan akses keluarga ${familyName}`;
  const body = buildInviteShareText(familyName, invite);
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function sendFamilyInviteEmailViaEdgeFunction(
  config: SupabaseConfig,
  familyName: string,
  invite: FamilyInvite,
  session: Session | null
) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");
  if (!invite.invitedEmail) throw new Error("Email anggota keluarga belum diisi.");

  const { data, error } = await client.functions.invoke("send-family-invite-email", {
    body: {
      familyName,
      inviteCode: invite.inviteCode,
      familySlug: invite.familySlug,
      invitedEmail: invite.invitedEmail,
      role: invite.role,
      ownerEmail: session.user.email || "",
    },
  });

  if (error) throw error;
  return data;
}

function sanitizeMembersForReadOnlyShare(members: Member[]) {
  return members.map((member) => ({
    ...member,
    address: member.address ? getAddressBucket(member.address) : "",
    phone: "",
    notes: "",
  }));
}

function buildReadOnlyShareSnapshot(profile: AppProfile, members: Member[]): ReadOnlyShareSnapshot {
  return {
    profile: normalizeAppProfile(profile),
    members: sanitizeMembersForReadOnlyShare(members),
    sharedAt: new Date().toISOString(),
    hiddenFields: {
      phone: true,
      address: true,
      notes: true,
    },
  };
}

async function refreshActiveReadOnlyShareLinks(
  config: SupabaseConfig,
  profile: AppProfile,
  members: Member[],
  session: Session | null
) {
  const links = await listFamilyShareLinksInSupabase(
    config,
    profile.familySlug || profile.familyName,
    session
  );

  let updatedCount = 0;
  const updatedLinks = await Promise.all(
    links.map(async (link) => {
      if (!link.isActive) return link;
      const snapshot = await refreshFamilyShareLinkSnapshotInSupabase(
        config,
        link.shareToken,
        profile,
        members,
        session
      );
      updatedCount += 1;
      return {
        ...link,
        snapshot,
        updatedAt: new Date().toISOString(),
      };
    })
  );

  return { updatedLinks, updatedCount };
}

function readPublicShareConfigFromLocation() {
  if (typeof window === "undefined") return null;
  const rawHash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  if (!rawHash) return null;

  const hashParams = new URLSearchParams(rawHash);
  const url = hashParams.get(SHARE_SB_URL_HASH_KEY) || "";
  const anonKey = hashParams.get(SHARE_SB_KEY_HASH_KEY) || "";

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function buildReadOnlyShareUrl(shareToken: string, familySlug: string, config?: SupabaseConfig) {
  if (typeof window === "undefined") return `?${SHARE_PARAM_KEY}=${shareToken}&${SHARE_FAMILY_PARAM_KEY}=${familySlug}`;
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM_KEY, shareToken);
  url.searchParams.set(SHARE_FAMILY_PARAM_KEY, familySlug);

  const effectiveUrl = config?.url || ENV_SUPABASE_URL;
  const effectiveAnonKey = config?.anonKey || ENV_SUPABASE_ANON_KEY;
  if (effectiveUrl && effectiveAnonKey) {
    const hashParams = new URLSearchParams();
    hashParams.set(SHARE_SB_URL_HASH_KEY, effectiveUrl);
    hashParams.set(SHARE_SB_KEY_HASH_KEY, effectiveAnonKey);
    url.hash = hashParams.toString();
  }

  return url.toString();
}

function createPublicSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;

  try {
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  } catch {
    return null;
  }
}

async function createFamilyShareLinkInSupabase(
  config: SupabaseConfig,
  profile: AppProfile,
  members: Member[],
  session: Session | null
): Promise<FamilyShareLink> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const familySlug = slugifyFamilyName(profile.familySlug || profile.familyName);
  const access = await resolveFamilyAccess(config, familySlug, session);
  const ownerUserId = access?.ownerUserId || session.user.id;
  if ((access?.role || "owner") !== "owner") {
    throw new Error("Hanya owner yang dapat membuat link baca-saja.");
  }

  const now = new Date().toISOString();
  const snapshot = buildReadOnlyShareSnapshot(profile, members);
  const link: FamilyShareLink = {
    shareToken: `share_${uid()}${uid()}`,
    familySlug,
    ownerUserId,
    isActive: true,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: now,
    updatedAt: now,
    snapshot,
  };

  const { error } = await client.from("family_share_links").insert({
    share_token: link.shareToken,
    family_slug: link.familySlug,
    owner_user_id: link.ownerUserId,
    payload: link.snapshot,
    is_active: link.isActive,
    expires_at: link.expiresAt,
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  });
  if (error) throw error;

  return link;
}

async function listFamilyShareLinksInSupabase(
  config: SupabaseConfig,
  familySlug: string,
  session: Session | null
): Promise<FamilyShareLink[]> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const normalizedSlug = slugifyFamilyName(familySlug);
  const { data, error } = await client
    .from("family_share_links")
    .select("share_token, family_slug, owner_user_id, payload, is_active, expires_at, created_at, updated_at")
    .eq("family_slug", normalizedSlug)
    .eq("owner_user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    shareToken: row.share_token as string,
    familySlug: row.family_slug as string,
    ownerUserId: row.owner_user_id as string,
    isActive: Boolean(row.is_active),
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    snapshot: (row.payload as ReadOnlyShareSnapshot) || buildReadOnlyShareSnapshot(defaultProfile, []),
  }));
}

async function refreshFamilyShareLinkSnapshotInSupabase(
  config: SupabaseConfig,
  shareToken: string,
  profile: AppProfile,
  members: Member[],
  session: Session | null
) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const snapshot = buildReadOnlyShareSnapshot(profile, members);
  const { error } = await client
    .from("family_share_links")
    .update({ payload: snapshot, updated_at: new Date().toISOString() })
    .eq("share_token", shareToken)
    .eq("owner_user_id", session.user.id);

  if (error) throw error;
  return snapshot;
}

async function setFamilyShareLinkActiveStateInSupabase(
  config: SupabaseConfig,
  shareToken: string,
  isActive: boolean,
  session: Session | null
) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const { error } = await client
    .from("family_share_links")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("share_token", shareToken)
    .eq("owner_user_id", session.user.id);

  if (error) throw error;
  return true;
}

async function resolveFamilyShareLinkFromSupabase(
  config: SupabaseConfig,
  shareToken: string,
  familySlug?: string
): Promise<{ snapshot: ReadOnlyShareSnapshot; expiresAt: string }> {
  const client = createPublicSupabaseClient(config.url, config.anonKey);
  if (!client) throw new Error("Konfigurasi Supabase belum siap untuk mode baca-saja. Buat ulang link share setelah Supabase URL dan anon key terisi, lalu salin link yang baru.");

  const { data, error } = await client
    .from("family_share_links")
    .select("payload, family_slug, is_active, expires_at")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Link share tidak ditemukan.");
  if (!data.is_active) throw new Error("Link share sudah dinonaktifkan.");
  if (familySlug && String(data.family_slug) !== slugifyFamilyName(familySlug)) {
    throw new Error("Link share tidak cocok dengan keluarga yang diminta.");
  }

  const expired = data.expires_at ? new Date(String(data.expires_at)).getTime() < Date.now() : false;
  if (expired) throw new Error("Link share sudah kedaluwarsa.");

  const payload = (data.payload || {}) as Partial<ReadOnlyShareSnapshot>;
  const familyName =
    typeof payload.profile?.familyName === "string" && payload.profile.familyName.trim()
      ? payload.profile.familyName
      : defaultProfile.familyName;

  return {
    snapshot: {
      profile: {
        familyName,
        subtitle:
          typeof payload.profile?.subtitle === "string"
            ? payload.profile.subtitle
            : defaultProfile.subtitle,
        hometown:
          typeof payload.profile?.hometown === "string"
            ? payload.profile.hometown
            : defaultProfile.hometown,
        familySlug:
          typeof payload.profile?.familySlug === "string"
            ? slugifyFamilyName(payload.profile.familySlug)
            : slugifyFamilyName(familyName),
      },
      members: sanitizeImportedMembers(payload.members) || [],
      sharedAt:
        typeof payload.sharedAt === "string" && payload.sharedAt
          ? payload.sharedAt
          : new Date().toISOString(),
      hiddenFields: {
        phone: true,
        address: true,
        notes: true,
        ...(payload.hiddenFields || {}),
      },
    },
    expiresAt: String(data.expires_at || ""),
  };
}

function slugifyFamilyName(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "keluargaku"
  );
}

function normalizeSelectValue(value?: string) {
  return !value || value === "unassigned" ? undefined : value;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function readMembers(): Member[] {
  if (typeof window === "undefined") return seedMembers;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedMembers;

  try {
    const parsed = JSON.parse(raw);
    const normalized = sanitizeImportedMembers(Array.isArray(parsed) ? parsed : parsed?.members);
    return normalized || seedMembers;
  } catch {
    return seedMembers;
  }
}

function saveMembers(members: Member[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function readProfile(): AppProfile {
  if (typeof window === "undefined") return defaultProfile;
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return defaultProfile;

  try {
    const parsed = JSON.parse(raw);
    const familyName =
      typeof parsed?.familyName === "string" && parsed.familyName.trim()
        ? parsed.familyName
        : defaultProfile.familyName;

    return {
      familyName,
      subtitle: typeof parsed?.subtitle === "string" ? parsed.subtitle : defaultProfile.subtitle,
      hometown: typeof parsed?.hometown === "string" ? parsed.hometown : defaultProfile.hometown,
      familySlug:
        typeof parsed?.familySlug === "string" && parsed.familySlug.trim()
          ? slugifyFamilyName(parsed.familySlug)
          : slugifyFamilyName(familyName),
    };
  } catch {
    return defaultProfile;
  }
}

function saveProfile(profile: AppProfile) {
  if (typeof window === "undefined") return;
  const normalizedProfile: AppProfile = {
    ...profile,
    familySlug: slugifyFamilyName(profile.familySlug || profile.familyName),
  };
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalizedProfile));
}

function readLastBackupAt() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(BACKUP_STORAGE_KEY) || "";
}

function saveLastBackupAt(value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BACKUP_STORAGE_KEY, value);
}

function readSupabaseConfig(): SupabaseConfig {
  if (typeof window === "undefined") return defaultSupabaseConfig;
  const raw = window.localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
  if (!raw) return defaultSupabaseConfig;

  try {
    const parsed = JSON.parse(raw);
    return {
      url: typeof parsed?.url === "string" ? parsed.url.trim() : "",
      anonKey: typeof parsed?.anonKey === "string" ? parsed.anonKey.trim() : "",
      enabled: Boolean(parsed?.enabled),
    };
  } catch {
    return defaultSupabaseConfig;
  }
}

function saveSupabaseConfig(config: SupabaseConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function readAuthEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_EMAIL_STORAGE_KEY) || "";
}

function saveAuthEmail(value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_EMAIL_STORAGE_KEY, value);
}

function sortByName(members: Member[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name, "id"));
}

function buildChildMap(members: Member[]) {
  const childMap = new Map<string, string[]>();

  members.forEach((member) => {
    [member.fatherId, member.motherId].forEach((parentId) => {
      if (!parentId) return;
      const children = childMap.get(parentId) || [];
      children.push(member.id);
      childMap.set(parentId, children);
    });
  });

  return childMap;
}

function resolveMainBloodlineFocusId(members: Member[], focusId?: string) {
  if (!focusId) return undefined;

  const memberMap = new Map(members.map((member) => [member.id, member]));
  const childMap = buildChildMap(members);
  const focusMember = memberMap.get(focusId);
  if (!focusMember) return undefined;

  const hasBloodlineConnection = (member?: Member) => {
    if (!member) return false;
    return Boolean(member.fatherId || member.motherId || (childMap.get(member.id) || []).length);
  };

  if (hasBloodlineConnection(focusMember)) return focusMember.id;

  const spouse = focusMember.spouseId ? memberMap.get(focusMember.spouseId) : undefined;
  if (hasBloodlineConnection(spouse)) return spouse?.id;

  return focusMember.id;
}

function collectAncestorIds(memberMap: Map<string, Member>, startId?: string) {
  const visited = new Set<string>();
  const queue = startId ? [startId] : [];

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    const currentMember = memberMap.get(currentId);
    if (!currentMember) continue;

    [currentMember.fatherId, currentMember.motherId].forEach((parentId) => {
      if (parentId && memberMap.has(parentId) && !visited.has(parentId)) {
        queue.push(parentId);
      }
    });
  }

  return visited;
}

function collectDescendantBloodlineIds(childMap: Map<string, string[]>, startIds: string[]) {
  const visited = new Set<string>();
  const queue = [...startIds];

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    (childMap.get(currentId) || []).forEach((childId) => {
      if (!visited.has(childId)) {
        queue.push(childId);
      }
    });
  }

  return visited;
}

function countBloodlineDescendants(startIds: string[], childMap: Map<string, string[]>) {
  const visited = collectDescendantBloodlineIds(childMap, startIds);
  return visited.size;
}

function getFounderIds(members: Member[], focusId?: string) {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const childMap = buildChildMap(members);
  const resolvedFocusId = resolveMainBloodlineFocusId(members, focusId);

  if (!resolvedFocusId || !memberMap.has(resolvedFocusId)) {
    return members.slice(0, 2).map((member) => member.id);
  }

  const ancestorIds = collectAncestorIds(memberMap, resolvedFocusId);
  const rootAncestorIds = [...ancestorIds].filter((id) => {
    const member = memberMap.get(id);
    if (!member) return false;
    return !ancestorIds.has(member.fatherId || "") && !ancestorIds.has(member.motherId || "");
  });

  if (!rootAncestorIds.length) {
    return [resolvedFocusId];
  }

  const founderCandidates = rootAncestorIds.map((id) => {
    const member = memberMap.get(id)!;
    const spouseId = member.spouseId && memberMap.has(member.spouseId) ? member.spouseId : undefined;
    const candidateIds = spouseId ? [id, spouseId] : [id];
    return {
      ids: candidateIds,
      descendantCount: countBloodlineDescendants(candidateIds, childMap),
      member,
      spouse: spouseId ? memberMap.get(spouseId) : undefined,
    };
  });

  founderCandidates.sort((a, b) => {
    if (b.descendantCount !== a.descendantCount) return b.descendantCount - a.descendantCount;
    const aDate = a.member.birthDate || a.spouse?.birthDate || "9999-12-31";
    const bDate = b.member.birthDate || b.spouse?.birthDate || "9999-12-31";
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    return a.member.name.localeCompare(b.member.name, "id");
  });

  return founderCandidates[0]?.ids || [resolvedFocusId];
}

function collectMainFamilyIds(members: Member[], focusId?: string) {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const childMap = buildChildMap(members);
  const founderIds = getFounderIds(members, focusId).filter((id) => memberMap.has(id));
  const bloodlineIds = collectDescendantBloodlineIds(childMap, founderIds);

  founderIds.forEach((id) => bloodlineIds.add(id));

  const spouseIds = new Set<string>();
  bloodlineIds.forEach((id) => {
    const spouseId = memberMap.get(id)?.spouseId;
    if (spouseId && memberMap.has(spouseId)) {
      spouseIds.add(spouseId);
    }
  });

  return {
    founderIds,
    bloodlineIds,
    familyIds: new Set([...bloodlineIds, ...spouseIds]),
  };
}

function calculateGenerationMap(members: Member[], focusId?: string) {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const childMap = buildChildMap(members);
  const { founderIds, bloodlineIds, familyIds } = collectMainFamilyIds(members, focusId);
  const levels = new Map<string, number>();

  const isBloodline = (id?: string): id is string => Boolean(id && bloodlineIds.has(id));
  const isInFamily = (id?: string): id is string => Boolean(id && familyIds.has(id));

  founderIds.forEach((id) => {
    levels.set(id, 1);
    const spouseId = memberMap.get(id)?.spouseId;
    if (isInFamily(spouseId)) {
      levels.set(spouseId, 1);
    }
  });

  let changed = true;
  while (changed) {
    changed = false;

    [...bloodlineIds].forEach((id) => {
      const member = memberMap.get(id);
      if (!member) return;

      const parentLevels = [member.fatherId, member.motherId]
        .filter(isBloodline)
        .map((parentId) => levels.get(parentId))
        .filter((level): level is number => typeof level === "number");

      if (!levels.has(id) && parentLevels.length) {
        levels.set(id, Math.max(...parentLevels) + 1);
        changed = true;
      }

      const memberLevel = levels.get(id);
      if (typeof memberLevel === "number" && isInFamily(member.spouseId) && !levels.has(member.spouseId)) {
        levels.set(member.spouseId, memberLevel);
        changed = true;
      }

      (childMap.get(id) || []).forEach((childId) => {
        if (!isBloodline(childId)) return;
        if (levels.has(childId)) return;

        const child = memberMap.get(childId);
        if (!child) return;

        const childParentLevels = [child.fatherId, child.motherId]
          .filter(isBloodline)
          .map((parentId) => levels.get(parentId))
          .filter((level): level is number => typeof level === "number");

        if (childParentLevels.length) {
          levels.set(childId, Math.max(...childParentLevels) + 1);
          changed = true;
        }
      });
    });
  }

  [...familyIds].forEach((id) => {
    if (levels.has(id)) return;
    const spouseId = memberMap.get(id)?.spouseId;
    if (spouseId && levels.has(spouseId)) {
      levels.set(id, levels.get(spouseId)!);
    }
  });

  return levels;
}

function calculateGenerationCount(members: Member[], focusId?: string) {
  const generationMap = calculateGenerationMap(members, focusId);
  return generationMap.size ? Math.max(...generationMap.values()) : 0;
}

function sortChildrenByBirthDate(members: Member[]) {
  return [...members].sort((a, b) => {
    if (a.birthDate && b.birthDate) return a.birthDate.localeCompare(b.birthDate);
    if (a.birthDate) return -1;
    if (b.birthDate) return 1;
    return a.name.localeCompare(b.name, "id");
  });
}

function formatDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getAddressBucket(address: string) {
  const normalized = address.trim();
  if (!normalized) return "Tanpa alamat";

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] || normalized;
}

function calculateCouples(members: Member[]) {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const seen = new Set<string>();

  return members.flatMap((member) => {
    if (!member.spouseId) return [];
    const spouse = memberMap.get(member.spouseId);
    if (!spouse) return [];

    const key = [member.id, spouse.id].sort().join(":");
    if (seen.has(key)) return [];
    seen.add(key);

    const childCount = members.filter((child) => {
      const parentIds = [child.fatherId, child.motherId].filter(Boolean) as string[];
      if (!parentIds.length) return false;
      return parentIds.every((id) => id === member.id || id === spouse.id);
    }).length;

    return [{ first: member, second: spouse, childCount }];
  });
}

function calculateAddressSummary(members: Member[]) {
  const counts = new Map<string, number>();

  members.forEach((member) => {
    const bucket = getAddressBucket(member.address);
    counts.set(bucket, (counts.get(bucket) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "id"));
}

function getBirthOrder(member: Member, members: Member[]) {
  if (!member.fatherId && !member.motherId) return undefined;

  const siblings = sortChildrenByBirthDate(
    members.filter((candidate) => {
      if (member.fatherId && member.motherId) {
        return candidate.fatherId === member.fatherId && candidate.motherId === member.motherId;
      }
      if (member.fatherId) return candidate.fatherId === member.fatherId;
      if (member.motherId) return candidate.motherId === member.motherId;
      return false;
    })
  );

  const index = siblings.findIndex((candidate) => candidate.id === member.id);
  return index >= 0 ? index + 1 : undefined;
}

function countPhoneDigits(value: string) {
  return value.split("").filter((char) => "0123456789".includes(char)).length;
}

function validateMemberForm(form: FormState) {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Nama lengkap wajib diisi.";
  if (!form.address.trim()) errors.address = "Alamat wajib diisi.";

  if (!form.phone.trim()) {
    errors.phone = "Nomor hape wajib diisi.";
  } else if (countPhoneDigits(form.phone.trim()) < 8) {
    errors.phone = "Format nomor hape belum valid.";
  }

  const fatherId = normalizeSelectValue(form.fatherId);
  const motherId = normalizeSelectValue(form.motherId);
  const spouseId = normalizeSelectValue(form.spouseId);

  if (fatherId && motherId && fatherId === motherId) {
    errors.fatherId = "Ayah dan ibu tidak boleh orang yang sama.";
    errors.motherId = "Ayah dan ibu tidak boleh orang yang sama.";
  }

  if (spouseId && (spouseId === fatherId || spouseId === motherId)) {
    errors.spouseId = "Pasangan tidak boleh sama dengan ayah atau ibu.";
  }

  return errors;
}

function sanitizeImportedMembers(data: unknown): Member[] | null {
  if (!Array.isArray(data)) return null;

  const normalized: Member[] = data
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index) => {
      const createdAt =
        typeof item.createdAt === "string" && item.createdAt ? item.createdAt : new Date().toISOString();
      const updatedAt =
        typeof item.updatedAt === "string" && item.updatedAt ? item.updatedAt : createdAt;

      const gender: Gender =
        item.gender === "Laki-laki" || item.gender === "Perempuan"
          ? (item.gender as Gender)
          : "";

      return {
        id:
          typeof item.id === "string" && item.id.trim()
            ? item.id
            : `m-import-${index + 1}-${uid()}`,
        name: typeof item.name === "string" ? item.name.trim() : "",
        gender,
        birthDate: typeof item.birthDate === "string" ? item.birthDate : undefined,
        address: typeof item.address === "string" ? item.address.trim() : "",
        phone: typeof item.phone === "string" ? item.phone.trim() : "",
        photo: typeof item.photo === "string" ? item.photo : "",
        fatherId: typeof item.fatherId === "string" ? item.fatherId : undefined,
        motherId: typeof item.motherId === "string" ? item.motherId : undefined,
        spouseId: typeof item.spouseId === "string" ? item.spouseId : undefined,
        notes: typeof item.notes === "string" ? item.notes : "",
        createdAt,
        updatedAt,
      };
    })
    .filter((member) => member.name);

  return normalized;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function sanitizeImportedCsv(text: string): Member[] | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => parseCsvLine(line));

  const records = rows.map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] || "";
    });
    return record;
  });

  const members = records
    .map((record, index) => ({
      id: `m-csv-${index + 1}-${uid()}`,
      name: (record.name || "").trim(),
      gender:
        record.gender === "Laki-laki" || record.gender === "Perempuan"
          ? (record.gender as Gender)
          : "",
      birthDate: (record.birthDate || "").trim() || undefined,
      address: (record.address || "").trim(),
      phone: (record.phone || "").trim(),
      photo: (record.photo || "").trim(),
      notes: (record.notes || "").trim(),
      fatherId: undefined,
      motherId: undefined,
      spouseId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    .filter((member) => member.name);

  if (!members.length) return null;

  const nameMap = new Map(members.map((member) => [member.name.toLowerCase(), member.id]));

  return members.map((member, index) => {
    const record = records[index];
    const fatherName = (record.fatherName || "").trim().toLowerCase();
    const motherName = (record.motherName || "").trim().toLowerCase();
    const spouseName = (record.spouseName || "").trim().toLowerCase();

    return {
      ...member,
      fatherId: fatherName ? nameMap.get(fatherName) : undefined,
      motherId: motherName ? nameMap.get(motherName) : undefined,
      spouseId: spouseName ? nameMap.get(spouseName) : undefined,
    };
  });
}

function buildCsvTemplate() {
  return [
    "name,gender,birthDate,address,phone,fatherName,motherName,spouseName,notes",
    "Budi Santoso,Laki-laki,1970-01-10,Jakarta Selatan,081234567890,,,Siti Rahma,Kepala keluarga",
    "Siti Rahma,Perempuan,1972-05-15,Jakarta Selatan,081298765432,,,Budi Santoso,Ibu keluarga",
    "Andi Pratama,Laki-laki,1995-03-12,Bandung,081355566677,Budi Santoso,Siti Rahma,,Anak pertama",
  ].join("\n");
}

function calculateDataQuality(members: Member[]): DataQualityItem[] {
  return members.map((member) => ({
    id: member.id,
    name: member.name,
    missingPhoto: !member.photo,
    missingBirthDate: !member.birthDate,
    missingPhone: !member.phone.trim(),
    missingAddress: !member.address.trim(),
    missingParents: !member.fatherId && !member.motherId,
  }));
}

function calculateDuplicateSummary(members: Member[]) {
  const nameCounts = new Map<string, number>();
  const phoneCounts = new Map<string, number>();

  members.forEach((member) => {
    const normalizedName = member.name.trim().toLowerCase();
    const normalizedPhone = member.phone.trim();
    if (normalizedName) nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);
    if (normalizedPhone) phoneCounts.set(normalizedPhone, (phoneCounts.get(normalizedPhone) || 0) + 1);
  });

  return members.filter((member) => {
    const normalizedName = member.name.trim().toLowerCase();
    const normalizedPhone = member.phone.trim();
    return (
      (normalizedName && (nameCounts.get(normalizedName) || 0) > 1) ||
      (normalizedPhone && (phoneCounts.get(normalizedPhone) || 0) > 1)
    );
  });
}

function calculateRelationshipWarnings(members: Member[]): RelationWarning[] {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const warnings: RelationWarning[] = [];

  members.forEach((member) => {
    const relationEntries = [
      { key: "fatherId", label: "Ayah", value: member.fatherId },
      { key: "motherId", label: "Ibu", value: member.motherId },
      { key: "spouseId", label: "Pasangan", value: member.spouseId },
    ] as const;

    relationEntries.forEach((entry) => {
      if (!entry.value) return;
      if (entry.value === member.id) {
        warnings.push({
          memberId: member.id,
          memberName: member.name,
          type: "self_reference",
          message: `${entry.label} mengarah ke dirinya sendiri.`,
        });
        return;
      }
      if (!memberMap.has(entry.value)) {
        warnings.push({
          memberId: member.id,
          memberName: member.name,
          type: "missing_reference",
          message: `${entry.label} mengarah ke anggota yang tidak ditemukan.`,
        });
      }
    });

    if (member.fatherId && member.motherId && member.fatherId === member.motherId) {
      warnings.push({
        memberId: member.id,
        memberName: member.name,
        type: "invalid_parent_pair",
        message: "Ayah dan ibu mengarah ke anggota yang sama.",
      });
    }

    if (member.spouseId) {
      const spouse = memberMap.get(member.spouseId);
      if (spouse && spouse.spouseId !== member.id) {
        warnings.push({
          memberId: member.id,
          memberName: member.name,
          type: "one_way_spouse",
          message: `Pasangan dengan ${spouse.name} belum saling terhubung dua arah.`,
        });
      }
    }
  });

  return warnings;
}

function autoFillRelationships(nextForm: FormState, members: Member[]) {
  const result = { ...nextForm };
  const fatherId = normalizeSelectValue(result.fatherId);
  const motherId = normalizeSelectValue(result.motherId);

  const father = fatherId ? members.find((member) => member.id === fatherId) : undefined;
  const mother = motherId ? members.find((member) => member.id === motherId) : undefined;

  if (father?.spouseId && !motherId && father.spouseId !== result.id) {
    result.motherId = father.spouseId;
  }

  if (mother?.spouseId && !fatherId && mother.spouseId !== result.id) {
    result.fatherId = mother.spouseId;
  }

  return result;
}

function autoFillRelationDraft(nextDraft: RelationDraft, members: Member[]) {
  const result = { ...nextDraft };
  const fatherId = normalizeSelectValue(result.fatherId);
  const motherId = normalizeSelectValue(result.motherId);

  const father = fatherId ? members.find((member) => member.id === fatherId) : undefined;
  const mother = motherId ? members.find((member) => member.id === motherId) : undefined;

  if (father?.spouseId && !motherId) result.motherId = father.spouseId;
  if (mother?.spouseId && !fatherId) result.fatherId = mother.spouseId;

  return result;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return url;
}

function printHtmlDocument(innerHtml: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Print iframe unavailable");
  }

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Cetak Silsilah Keluarga</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px 0; font-size: 24px; }
          p { margin: 0 0 16px 0; color: #475569; }
          .sheet { border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; }
          button { display: none !important; }
        </style>
      </head>
      <body>
        <h1>KeluargaKu</h1>
        <p>Tampilan silsilah keluarga yang sedang aktif.</p>
        <div class="sheet">${innerHtml}</div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

function createCloudSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  if (!config.enabled || !config.url || !config.anonKey) return null;

  try {
    return createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  } catch {
    return null;
  }
}

async function sendCloudMagicLink(config: SupabaseConfig, email: string) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");

  const redirectTo = typeof window !== "undefined" ? window.location.href : undefined;
  const { error } = await client.auth.signInWithOtp({
    email,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });
  if (error) throw error;
  return true;
}

async function testCloudSupabaseConnection(config: SupabaseConfig, session: Session | null) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const { error } = await client.from("family_profiles").select("family_slug").limit(1);
  if (error) throw error;
  return true;
}

async function resolveFamilyAccess(
  config: SupabaseConfig,
  familySlug: string,
  session: Session | null
): Promise<FamilyAccess | null> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const normalizedSlug = slugifyFamilyName(familySlug);

  const { data: ownerProfile, error: ownerProfileError } = await client
    .from("family_profiles")
    .select("family_slug, owner_user_id")
    .eq("family_slug", normalizedSlug)
    .eq("owner_user_id", session.user.id)
    .maybeSingle();

  if (ownerProfileError) throw ownerProfileError;
  if (ownerProfile) {
    return {
      ownerUserId: ownerProfile.owner_user_id as string,
      role: "owner",
      familySlug: ownerProfile.family_slug as string,
    };
  }

  const sessionEmail = session.user.email?.trim().toLowerCase() || "";
  const { data: inviteRow, error: inviteError } = await client
    .from("family_invites")
    .select("family_slug, owner_user_id, role, status, invited_email, accepted_user_id, expires_at")
    .eq("family_slug", normalizedSlug)
    .or(`accepted_user_id.eq.${session.user.id},invited_email.eq.${sessionEmail}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inviteError) throw inviteError;
  if (!inviteRow) return null;

  const expired = inviteRow.expires_at ? new Date(inviteRow.expires_at).getTime() < Date.now() : false;
  if (expired) return null;

  const acceptedForUser =
    inviteRow.status === "accepted" &&
    (inviteRow.accepted_user_id === session.user.id ||
      (inviteRow.invited_email && String(inviteRow.invited_email).toLowerCase() === sessionEmail));

  if (!acceptedForUser) return null;

  return {
    ownerUserId: inviteRow.owner_user_id as string,
    role: (inviteRow.role as InviteRole) || "viewer",
    familySlug: inviteRow.family_slug as string,
  };
}

async function createFamilyInviteInSupabase(
  config: SupabaseConfig,
  familySlug: string,
  invitedEmail: string,
  role: InviteRole,
  session: Session | null
): Promise<FamilyInvite> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const normalizedSlug = slugifyFamilyName(familySlug);
  const { data: ownerProfile, error: ownerProfileError } = await client
    .from("family_profiles")
    .select("family_slug, owner_user_id")
    .eq("family_slug", normalizedSlug)
    .eq("owner_user_id", session.user.id)
    .maybeSingle();

  if (ownerProfileError) throw ownerProfileError;
  if (!ownerProfile) throw new Error("Hanya pemilik keluarga yang dapat membuat invite.");

  const invite: FamilyInvite = {
    inviteCode: generateInviteCode(),
    familySlug: normalizedSlug,
    ownerUserId: session.user.id,
    invitedEmail: invitedEmail.trim().toLowerCase() || undefined,
    role,
    status: "sent",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    createdAt: new Date().toISOString(),
  };

  const { error } = await client.from("family_invites").insert({
    invite_code: invite.inviteCode,
    family_slug: invite.familySlug,
    owner_user_id: invite.ownerUserId,
    invited_email: invite.invitedEmail || null,
    role: invite.role,
    status: invite.status,
    expires_at: invite.expiresAt,
    created_at: invite.createdAt,
  });
  if (error) throw error;

  return invite;
}

async function listFamilyInvitesInSupabase(
  config: SupabaseConfig,
  familySlug: string,
  session: Session | null
): Promise<FamilyInvite[]> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const normalizedSlug = slugifyFamilyName(familySlug);
  const { data, error } = await client
    .from("family_invites")
    .select("invite_code, family_slug, owner_user_id, invited_email, role, status, accepted_user_id, accepted_at, expires_at, created_at")
    .eq("family_slug", normalizedSlug)
    .eq("owner_user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    inviteCode: row.invite_code as string,
    familySlug: row.family_slug as string,
    ownerUserId: row.owner_user_id as string,
    invitedEmail: (row.invited_email as string) || undefined,
    role: (row.role as InviteRole) || "viewer",
    status: (row.status as "sent" | "accepted" | "expired") || "sent",
    acceptedUserId: (row.accepted_user_id as string) || undefined,
    acceptedAt: (row.accepted_at as string) || undefined,
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
  }));
}

async function acceptFamilyInviteInSupabase(
  config: SupabaseConfig,
  inviteCode: string,
  session: Session | null
): Promise<FamilyInvite> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const normalizedCode = inviteCode.trim().toUpperCase();
  if (!normalizedCode) throw new Error("Kode invite wajib diisi.");

  const { data, error } = await client
    .from("family_invites")
    .select("invite_code, family_slug, owner_user_id, invited_email, role, status, accepted_user_id, accepted_at, expires_at, created_at")
    .eq("invite_code", normalizedCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Kode invite tidak ditemukan.");

  const sessionEmail = session.user.email?.trim().toLowerCase() || "";
  const invitedEmail = (data.invited_email as string | null)?.toLowerCase() || "";
  if (invitedEmail && invitedEmail !== sessionEmail) {
    throw new Error("Invite ini ditujukan untuk email yang berbeda.");
  }

  const expired = data.expires_at ? new Date(String(data.expires_at)).getTime() < Date.now() : false;
  if (expired) throw new Error("Invite sudah kedaluwarsa.");

  const acceptedInvite: FamilyInvite = {
    inviteCode: data.invite_code as string,
    familySlug: data.family_slug as string,
    ownerUserId: data.owner_user_id as string,
    invitedEmail: (data.invited_email as string) || undefined,
    role: (data.role as InviteRole) || "viewer",
    status: "accepted",
    acceptedUserId: session.user.id,
    acceptedAt: new Date().toISOString(),
    expiresAt: data.expires_at as string,
    createdAt: data.created_at as string,
  };

  const { error: updateError } = await client
    .from("family_invites")
    .update({
      status: "accepted",
      accepted_user_id: session.user.id,
      accepted_at: acceptedInvite.acceptedAt,
    })
    .eq("invite_code", normalizedCode);

  if (updateError) throw updateError;

  return acceptedInvite;
}

async function pushFamilyBackupToSupabase(config: SupabaseConfig, payload: BackupPackage, session: Session | null) {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const familySlug = slugifyFamilyName(payload.profile.familySlug);
  const access = await resolveFamilyAccess(config, familySlug, session);
  const ownerUserId = access?.ownerUserId || session.user.id;
  const effectiveRole = access?.role || "owner";

  if (effectiveRole === "viewer") {
    throw new Error("Akun ini hanya memiliki akses viewer dan tidak bisa mengubah data.");
  }

  const profileRow = {
    family_slug: familySlug,
    owner_user_id: ownerUserId,
    payload: payload.profile,
    updated_at: payload.exportedAt,
  };

  const memberRows = payload.members.map((member) => ({
    row_id: `${ownerUserId}:${familySlug}:${member.id}`,
    family_slug: familySlug,
    owner_user_id: ownerUserId,
    member_id: member.id,
    payload: member,
    created_at: member.createdAt,
    updated_at: member.updatedAt,
  }));

  const { error: profileError } = await client.from("family_profiles").upsert(profileRow, {
    onConflict: "family_slug,owner_user_id",
  });
  if (profileError) throw profileError;

  const { data: existingRows, error: existingError } = await client
    .from("family_members")
    .select("member_id")
    .eq("family_slug", familySlug)
    .eq("owner_user_id", ownerUserId);
  if (existingError) throw existingError;

  const incomingIds = new Set(payload.members.map((member) => member.id));
  const idsToDelete = (existingRows || [])
    .map((row) => row.member_id as string)
    .filter((memberId) => !incomingIds.has(memberId));

  if (memberRows.length) {
    const { error: memberError } = await client.from("family_members").upsert(memberRows, {
      onConflict: "row_id",
    });
    if (memberError) throw memberError;
  }

  if (idsToDelete.length) {
    const { error: deleteError } = await client
      .from("family_members")
      .delete()
      .eq("family_slug", familySlug)
      .eq("owner_user_id", ownerUserId)
      .in("member_id", idsToDelete);
    if (deleteError) throw deleteError;
  }

  return true;
}

async function pullFamilyBackupFromSupabase(
  config: SupabaseConfig,
  familySlug: string,
  session: Session | null
): Promise<BackupPackage | null> {
  const client = createCloudSupabaseClient(config);
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  if (!session?.user) throw new Error("Silakan login terlebih dahulu.");

  const access = await resolveFamilyAccess(config, familySlug, session);
  const ownerUserId = access?.ownerUserId || session.user.id;

  const { data: profileRow, error: profileError } = await client
    .from("family_profiles")
    .select("payload, updated_at")
    .eq("family_slug", slugifyFamilyName(familySlug))
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (profileError) throw profileError;

  const { data: memberRows, error: memberError } = await client
    .from("family_members")
    .select("payload, updated_at")
    .eq("family_slug", slugifyFamilyName(familySlug))
    .eq("owner_user_id", ownerUserId)
    .order("updated_at", { ascending: true });

  if (memberError) throw memberError;

  const importedMembers = sanitizeImportedMembers((memberRows || []).map((row) => row.payload));
  if (!profileRow && !importedMembers?.length) return null;

  const remoteProfilePayload = (profileRow?.payload || {}) as Partial<AppProfile>;
  const familyName =
    typeof remoteProfilePayload.familyName === "string" && remoteProfilePayload.familyName.trim()
      ? remoteProfilePayload.familyName
      : defaultProfile.familyName;

  const profile: AppProfile = {
    familyName,
    subtitle:
      typeof remoteProfilePayload.subtitle === "string"
        ? remoteProfilePayload.subtitle
        : defaultProfile.subtitle,
    hometown:
      typeof remoteProfilePayload.hometown === "string"
        ? remoteProfilePayload.hometown
        : defaultProfile.hometown,
    familySlug:
      typeof remoteProfilePayload.familySlug === "string" && remoteProfilePayload.familySlug.trim()
        ? slugifyFamilyName(remoteProfilePayload.familySlug)
        : slugifyFamilyName(familyName || familySlug),
  };

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    storageDriver: "supabase",
    profile,
    members: importedMembers || [],
  };
}



function Avatar({ member, size = "md" }: { member: Member; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-sm",
    lg: "h-20 w-20 text-lg",
  };

  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        className={`${sizeClasses[size]} rounded-2xl object-cover border shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl border bg-slate-100 flex items-center justify-center font-semibold text-slate-700 shadow-sm`}
    >
      {initials(member.name) || <UserRound className="h-4 w-4" />}
    </div>
  );
}

function SmallMemberCard({
  member,
  active,
  onClick,
}: {
  member: Member;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3 transition hover:shadow-sm ${
        active ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar member={member} size="sm" />
        <div className="min-w-0">
          <div className="font-medium truncate">{member.name}</div>
          <div className="text-xs text-slate-500 truncate">
            {[member.gender, member.phone || "Belum ada nomor"].filter(Boolean).join(" • ")}
          </div>
        </div>
      </div>
    </button>
  );
}

function RelationCard({
  title,
  member,
  onSelect,
}: {
  title: string;
  member?: Member;
  onSelect?: (id: string) => void;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        {member ? (
          <button className="w-full" onClick={() => onSelect?.(member.id)}>
            <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-slate-50 transition">
              <Avatar member={member} size="sm" />
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{member.name}</div>
                <div className="text-xs text-slate-500 truncate">
                  {[member.gender, member.phone || "Tanpa nomor"].filter(Boolean).join(" • ")}
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">Belum diisi</div>
        )}
      </CardContent>
    </Card>
  );
}

function TreeNode({
  member,
  label,
  onSelect,
}: {
  member?: Member;
  label: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      {member ? (
        <button onClick={() => onSelect?.(member.id)} className="text-left">
          <div className="w-48 rounded-3xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <Avatar member={member} size="md" />
              <div className="min-w-0">
                <div className="font-semibold truncate">{member.name}</div>
                <div className="text-xs text-slate-500 truncate">
                  {[member.gender, member.phone || "Tanpa nomor"].filter(Boolean).join(" • ")}
                </div>
              </div>
            </div>
          </div>
        </button>
      ) : (
        <div className="w-48 rounded-3xl border border-dashed bg-white/70 p-6 text-center text-sm text-slate-400">
          Belum dihubungkan
        </div>
      )}
    </div>
  );
}

function DescendantCard({
  member,
  members,
  onSelect,
  visited = [],
}: {
  member: Member;
  members: Member[];
  onSelect?: (id: string) => void;
  visited?: string[];
}) {
  const spouse = member.spouseId ? members.find((candidate) => candidate.id === member.spouseId) : undefined;
  const birthOrder = getBirthOrder(member, members);
  const descendants = sortChildrenByBirthDate(
    members.filter(
      (candidate) =>
        ![...visited, member.id].includes(candidate.id) &&
        (candidate.fatherId === member.id || candidate.motherId === member.id)
    )
  );
  const hasDescendants = descendants.length > 0;
  const [expanded, setExpanded] = useState(visited.length <= 1);

  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap items-start gap-4">
          <TreeNode label={birthOrder ? `Anak ke-${birthOrder}` : "Anak"} member={member} onSelect={onSelect} />
          {spouse ? <TreeNode label="Pasangan" member={spouse} onSelect={onSelect} /> : null}
        </div>

        {hasDescendants ? (
          <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            {expanded ? "Sembunyikan" : "Tampilkan"} cabang ({descendants.length})
          </Button>
        ) : null}
      </div>

      {hasDescendants ? (
        expanded ? (
          <div className="mt-4 border-l-2 border-slate-100 pl-4">
            <DescendantBranch parent={member} members={members} onSelect={onSelect} visited={visited} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Cabang keturunan disembunyikan. Klik tombol untuk melihat anak, cucu, dan seterusnya.
          </div>
        )
      ) : null}
    </div>
  );
}

function DescendantBranch({
  parent,
  members,
  onSelect,
  visited = [],
}: {
  parent: Member;
  members: Member[];
  onSelect?: (id: string) => void;
  visited?: string[];
}) {
  if (visited.includes(parent.id)) return null;

  const nextVisited = [...visited, parent.id];
  const descendants = sortChildrenByBirthDate(
    members.filter(
      (member) => !nextVisited.includes(member.id) && (member.fatherId === parent.id || member.motherId === parent.id)
    )
  );

  if (!descendants.length) {
    return visited.length === 0 ? (
      <div className="mx-auto max-w-sm rounded-3xl border border-dashed bg-white p-6 text-center text-sm text-slate-400">
        Belum ada keturunan yang terhubung.
      </div>
    ) : null;
  }

  return (
    <div className="space-y-5">
      {descendants.map((child) => (
        <DescendantCard key={child.id} member={child} members={members} onSelect={onSelect} visited={nextVisited} />
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-red-500">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </div>
  );
}

function MemberFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  members,
  errors,
  onSave,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  members: Member[];
  errors: FormErrors;
  onSave: () => void;
  editing: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectableMembers = useMemo(
    () => sortByName(members).filter((member) => member.id !== form.id),
    [members, form.id]
  );
  const selectedFather = members.find((member) => member.id === normalizeSelectValue(form.fatherId));
  const selectedMother = members.find((member) => member.id === normalizeSelectValue(form.motherId));
  const selectedSpouse = members.find((member) => member.id === normalizeSelectValue(form.spouseId));

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const optimizedPhoto = await resizeImageFileToDataUrl(file, {
      maxWidth: MAX_PHOTO_DIMENSION,
      maxHeight: MAX_PHOTO_DIMENSION,
      quality: file.size > LARGE_PHOTO_BYTES ? 0.72 : 0.82,
    });

    setForm((prev) => ({ ...prev, photo: optimizedPhoto }));
  } catch {
    window.alert("Foto gagal diproses. Coba pilih gambar lain atau ukuran yang lebih kecil.");
  } finally {
    event.target.value = "";
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl rounded-3xl p-0 sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[320px_minmax(0,1fr)]">
            <div className="border-b bg-slate-50 p-6 md:border-b-0 md:border-r">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit anggota" : "Tambah anggota"}</DialogTitle>
                <DialogDescription>
                  Lengkapi data inti: nama, foto, jenis kelamin, tanggal lahir, alamat, nomor hape, dan hubungan keluarga.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="relative">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="h-28 w-28 rounded-3xl object-cover border shadow-sm" />
                  ) : (
                    <div className="h-28 w-28 rounded-3xl border border-dashed bg-white flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Upload foto
                  </Button>
                  {form.photo ? (
                    <Button type="button" variant="ghost" onClick={() => setForm((prev) => ({ ...prev, photo: "" }))}>
                      Hapus
                    </Button>
                  ) : null}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Sparkles className="h-4 w-4" /> Hubungan otomatis aktif
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Saat memilih ayah atau ibu, pasangan yang sudah terhubung akan mengisi field orang tua pasangannya secara otomatis. Saat memilih pasangan, hubungan pasangan akan otomatis berlaku dua arah saat data disimpan.
                </p>
              </div>

              <div className="mb-4 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-600">
                <div className="font-medium text-slate-800">Preview hubungan</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {selectedFather ? <Badge variant="outline" className="rounded-xl">Ayah: {selectedFather.name}</Badge> : null}
                  {selectedMother ? <Badge variant="outline" className="rounded-xl">Ibu: {selectedMother.name}</Badge> : null}
                  {selectedSpouse ? <Badge variant="outline" className="rounded-xl">Pasangan: {selectedSpouse.name}</Badge> : null}
                  {!selectedFather && !selectedMother && !selectedSpouse ? (
                    <span className="text-slate-500">Belum ada relasi yang dipilih.</span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pb-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Andi Pratama"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <FieldError message={errors.name} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Jenis kelamin</Label>
                  <Select
                    value={form.gender || "unassigned"}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        gender: value === "unassigned" ? "" : (value as Gender),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Belum diisi</SelectItem>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="birthDate">Tanggal lahir</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">Tanggal lahir dipakai untuk menentukan urutan anak keberapa.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    placeholder="Contoh: Jl. Mawar No. 12, Bandung"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  />
                  <FieldError message={errors.address} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Nomor hape</Label>
                  <Input
                    id="phone"
                    placeholder="081234567890"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <FieldError message={errors.phone} />
                </div>

                <div className="space-y-2">
                  <Label>Ayah</Label>
                  <Select
                    value={form.fatherId || "unassigned"}
                    onValueChange={(value) =>
                      setForm((prev) => autoFillRelationships({ ...prev, fatherId: value }, members))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ayah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Belum diisi</SelectItem>
                      {selectableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.fatherId} />
                </div>

                <div className="space-y-2">
                  <Label>Ibu</Label>
                  <Select
                    value={form.motherId || "unassigned"}
                    onValueChange={(value) =>
                      setForm((prev) => autoFillRelationships({ ...prev, motherId: value }, members))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ibu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Belum diisi</SelectItem>
                      {selectableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.motherId} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Pasangan</Label>
                  <Select
                    value={form.spouseId || "unassigned"}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, spouseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasangan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Belum diisi</SelectItem>
                      {selectableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.spouseId} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan opsional</Label>
                  <Textarea
                    id="notes"
                    placeholder="Contoh: Tinggal di rumah keluarga utama"
                    value={form.notes || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t bg-white px-6 py-4">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={onSave}>{editing ? "Simpan perubahan" : "Tambah anggota"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function runSelfChecks() {
  const parsed = parseCsvLine('Budi,"Jakarta, Selatan",0812');
  console.assert(parsed.length === 3, "CSV parser should keep quoted commas intact");
  console.assert(parsed[1] === "Jakarta, Selatan", "CSV parser should preserve quoted cell value");

  const imported = sanitizeImportedCsv(
    [
      "name,gender,birthDate,address,phone,fatherName,motherName,spouseName,notes",
      "Budi,Laki-laki,1970-01-10,Jakarta,0812,,,Siti,",
      "Siti,Perempuan,1972-05-15,Jakarta,0813,,,Budi,",
      "Andi,Laki-laki,1995-03-12,Bandung,0814,Budi,Siti,,",
    ].join("\n")
  );

  console.assert(Boolean(imported) && imported!.length === 3, "CSV import should create 3 members");
  console.assert(imported?.[2].fatherId === imported?.[0].id, "CSV import should link father by name");
  console.assert(imported?.[2].motherId === imported?.[1].id, "CSV import should link mother by name");
  console.assert(Boolean(imported?.[0].updatedAt), "Imported CSV member should have updatedAt");

  const familySample: Member[] = [
    {
      id: "root-1",
      name: "Budi",
      gender: "Laki-laki",
      address: "Jakarta",
      phone: "0811",
      spouseId: "root-2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "root-2",
      name: "Siti",
      gender: "Perempuan",
      address: "Jakarta",
      phone: "0812",
      spouseId: "root-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "child-1",
      name: "Andi",
      gender: "Laki-laki",
      address: "Bandung",
      phone: "0813",
      fatherId: "root-1",
      motherId: "root-2",
      spouseId: "child-2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "child-2",
      name: "Rina",
      gender: "Perempuan",
      address: "Bandung",
      phone: "0814",
      spouseId: "child-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const generationMap = calculateGenerationMap(familySample, "child-1");
  console.assert(generationMap.get("root-1") === 1, "Founder should be generation 1");
  console.assert(generationMap.get("root-2") === 1, "Founder spouse should be generation 1");
  console.assert(generationMap.get("child-1") === 2, "Child should be generation 2");
  console.assert(
    generationMap.get("child-2") === 2,
    "Child spouse should follow child generation, not become generation 1"
  );

  const familyWithExtraBranch: Member[] = [
    ...familySample,
    {
      id: "grandchild-1",
      name: "Dina",
      gender: "Perempuan",
      address: "Bandung",
      phone: "0815",
      fatherId: "child-1",
      motherId: "child-2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "outsider-1",
      name: "Cabang Lain",
      gender: "Laki-laki",
      address: "Solo",
      phone: "0816",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const founderIds = getFounderIds(familyWithExtraBranch, "grandchild-1");
  console.assert(founderIds.includes("root-1"), "Main founder should stay on top ancestor line");
  console.assert(founderIds.includes("root-2"), "Main founder spouse should be included as generation 1");
  console.assert(founderIds.length === 2, "Generation 1 should contain only the main founder pair");

  console.assert(
    slugifyFamilyName("Keluarga Zainal & Suparti") === "keluarga-zainal-suparti",
    "Family slug should normalize spaces and symbols"
  );

  const backupPackage: BackupPackage = {
    schemaVersion: APP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    storageDriver: "local",
    profile: defaultProfile,
    members: seedMembers,
  };
  const parsedProfileBackup = JSON.parse(JSON.stringify(backupPackage));
  console.assert(Array.isArray(parsedProfileBackup.members), "Backup payload should include members array");
  console.assert(
    parsedProfileBackup.profile.familyName === defaultProfile.familyName,
    "Backup payload should include app profile"
  );
  console.assert(
    parsedProfileBackup.schemaVersion === APP_SCHEMA_VERSION,
    "Backup payload should include schema version"
  );
  console.assert(
    createCloudSupabaseClient(defaultSupabaseConfig) === null,
    "Cloud client should stay null when config is incomplete"
  );
}

if (typeof window !== "undefined") {
  runSelfChecks();
}

export default function KeluargaKuMVP() {
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [profile, setProfile] = useState<AppProfile>(defaultProfile);
  const [selectedId, setSelectedId] = useState<string>(seedMembers[0]?.id || "");
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "Laki-laki" | "Perempuan">("all");
  const [generationFilter, setGenerationFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [relationDraft, setRelationDraft] = useState<RelationDraft>(emptyRelationDraft);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [lastPdfUrl, setLastPdfUrl] = useState("");
  const [lastBackupAt, setLastBackupAt] = useState("");
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(defaultSupabaseConfig);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    type: "idle",
    message: "Mode lokal aktif. Anda bisa menghubungkan Supabase kapan saja.",
  });
  const [authState, setAuthState] = useState<AuthState>({
    email: "",
    session: null,
    status: "signed_out",
    message: "Silakan login dengan magic link untuk memakai sinkronisasi online.",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("viewer");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);
  const [familyShareLinks, setFamilyShareLinks] = useState<FamilyShareLink[]>([]);
  const [shareStatus, setShareStatus] = useState<CloudSyncStatus>({
    type: "idle",
    message: "Buat link baca-saja agar keluarga lain cukup membuka link tanpa login dan tanpa invite email.",
  });
  const [publicShareState, setPublicShareState] = useState<PublicShareState>({
    type: "idle",
    message: "",
    snapshot: null,
    shareToken: "",
    familySlug: "",
  });
  const [inviteStatus, setInviteStatus] = useState<CloudSyncStatus>({
    type: "idle",
    message: "Owner dapat membuat invite. Perlu diketahui: aplikasi ini belum mengirim email otomatis, jadi undangan dikirim dengan cara salin pesan atau buka email client."
  });
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const supabaseClientRef = useRef<SupabaseClient | null>(null);
  const importCsvInputRef = useRef<HTMLInputElement | null>(null);
  const treeExportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = readMembers();
    const storedProfile = readProfile();
    const storedLastBackupAt = readLastBackupAt();
    const storedSupabaseConfig = readSupabaseConfig();
    const storedAuthEmail = readAuthEmail();
    setMembers(sortByName(stored));
    setProfile(storedProfile);
    setLastBackupAt(storedLastBackupAt);
    setSupabaseConfig(storedSupabaseConfig);
    setAuthState((prev) => ({ ...prev, email: storedAuthEmail }));
    if (stored[0]?.id) setSelectedId(stored[0].id);
  }, []);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (!authState.session || !supabaseConfig.enabled) return;
    if (!familyShareLinks.some((link) => link.isActive)) return;

    const normalizedProfile = normalizeAppProfile(profile);
    const timer = window.setTimeout(async () => {
      try {
        const refreshed = await refreshActiveReadOnlyShareLinks(
          supabaseConfig,
          normalizedProfile,
          members,
          authState.session
        );
        setFamilyShareLinks(refreshed.updatedLinks);
      } catch {
        // Abaikan error auto-refresh profil agar tidak mengganggu input utama.
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [
    profile.familyName,
    profile.subtitle,
    profile.hometown,
    members,
    authState.session,
    supabaseConfig.enabled,
    supabaseConfig.url,
    supabaseConfig.anonKey,
    familyShareLinks,
  ]);

  useEffect(() => {
    saveSupabaseConfig(supabaseConfig);
  }, [supabaseConfig]);

  useEffect(() => {
    saveAuthEmail(authState.email);
  }, [authState.email]);

  useEffect(() => {
    const client = createCloudSupabaseClient(supabaseConfig);
    supabaseClientRef.current = client;

    if (!client) {
      setAuthState((prev) => ({
        ...prev,
        session: null,
        status: "signed_out",
        message: "Lengkapi konfigurasi Supabase lalu aktifkan cloud mode.",
      }));
      return;
    }

    let isMounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const session = data.session;
      setAuthState((prev) => ({
        ...prev,
        session,
        status: session ? "signed_in" : "signed_out",
        message: session
          ? `Login sebagai ${session.user.email || "pengguna"}.`
          : "Silakan login dengan magic link untuk memakai sinkronisasi online.",
      }));
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setAuthState((prev) => ({
        ...prev,
        session,
        status: session ? "signed_in" : "signed_out",
        message: session
          ? `Login sebagai ${session.user.email || "pengguna"}.`
          : "Silakan login dengan magic link untuk memakai sinkronisasi online.",
      }));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseConfig]);

  useEffect(() => {
    return () => {
      if (lastPdfUrl) window.URL.revokeObjectURL(lastPdfUrl);
    };
  }, [lastPdfUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const shareToken = url.searchParams.get(SHARE_PARAM_KEY) || "";
    const familySlug = url.searchParams.get(SHARE_FAMILY_PARAM_KEY) || "";
    const publicShareConfig = readPublicShareConfigFromLocation();
    const effectivePublicConfig =
      supabaseConfig.url && supabaseConfig.anonKey
        ? supabaseConfig
        : publicShareConfig
        ? {
            ...supabaseConfig,
            url: publicShareConfig.url,
            anonKey: publicShareConfig.anonKey,
            enabled: true,
          }
        : supabaseConfig;

    if (!shareToken) {
      setPublicShareState((prev) => ({ ...prev, type: "idle", shareToken: "", familySlug: "", snapshot: null }));
      return;
    }

    let cancelled = false;
    const loadSharedView = async () => {
      try {
        setPublicShareState({
          type: "loading",
          message: "Memuat tampilan baca-saja dari link share...",
          snapshot: null,
          shareToken,
          familySlug,
        });
        const result = await resolveFamilyShareLinkFromSupabase(effectivePublicConfig, shareToken, familySlug || undefined);
        if (cancelled) return;
        setPublicShareState({
          type: "viewing",
          message: "Mode baca-saja aktif.",
          snapshot: result.snapshot,
          shareToken,
          familySlug: result.snapshot.profile.familySlug,
          expiresAt: result.expiresAt,
        });
      } catch (error) {
        if (cancelled) return;
        setPublicShareState({
          type: "error",
          message: error instanceof Error ? error.message : "Gagal memuat link share.",
          snapshot: null,
          shareToken,
          familySlug,
        });
      }
    };

    loadSharedView();
    return () => {
      cancelled = true;
    };
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const generationCount = useMemo(() => calculateGenerationCount(members, selectedId), [members, selectedId]);
  const generationMap = useMemo(() => calculateGenerationMap(members, selectedId), [members, selectedId]);
  const founderIds = useMemo(() => getFounderIds(members, selectedId), [members, selectedId]);
  const founderMembers = useMemo(
    () => founderIds.map((id) => members.find((member) => member.id === id)).filter(Boolean) as Member[],
    [founderIds, members]
  );
  const generationSummary = useMemo(
    () =>
      Array.from({ length: generationCount }, (_, index) => {
        const level = index + 1;
        const items = members.filter((member) => generationMap.get(member.id) === level);
        return {
          level,
          total: items.length,
          male: items.filter((member) => member.gender === "Laki-laki").length,
          female: items.filter((member) => member.gender === "Perempuan").length,
        };
      }),
    [generationCount, generationMap, members]
  );
  const couples = useMemo(() => calculateCouples(members), [members]);
  const membersWithBirthDate = useMemo(
    () =>
      [...members]
        .filter((member) => member.birthDate)
        .sort((a, b) => (a.birthDate || "").localeCompare(b.birthDate || "")),
    [members]
  );
  const oldestMember = membersWithBirthDate[0];
  const youngestMember = membersWithBirthDate[membersWithBirthDate.length - 1];
  const addressSummary = useMemo(() => calculateAddressSummary(members), [members]);
  const largestCouple = useMemo(
    () => [...couples].sort((a, b) => b.childCount - a.childCount || a.first.name.localeCompare(b.first.name, "id"))[0],
    [couples]
  );
  const familyStats = useMemo(
    () => ({
      firstGenerationHeads: generationSummary[0]?.total || 0,
      totalCouples: couples.length,
      averageChildrenPerCouple: couples.length
        ? (couples.reduce((sum, couple) => sum + couple.childCount, 0) / couples.length).toFixed(1)
        : "0.0",
    }),
    [couples, generationSummary]
  );
  const generationChartData = useMemo(
    () => generationSummary.map((item) => ({ name: `G${item.level}`, lakiLaki: item.male, perempuan: item.female })),
    [generationSummary]
  );
  const addressChartData = useMemo(() => addressSummary.slice(0, 6), [addressSummary]);
  const dataQuality = useMemo(() => calculateDataQuality(members), [members]);
  const duplicateMembers = useMemo(() => calculateDuplicateSummary(members), [members]);
  const relationshipWarnings = useMemo(() => calculateRelationshipWarnings(members), [members]);
  const completenessStats = useMemo(() => {
    const total = members.length || 1;
    const complete = dataQuality.filter(
      (item) => !item.missingPhoto && !item.missingBirthDate && !item.missingPhone && !item.missingAddress
    ).length;

    return {
      complete,
      completionRate: Math.round((complete / total) * 100),
      missingPhoto: dataQuality.filter((item) => item.missingPhoto).length,
      missingBirthDate: dataQuality.filter((item) => item.missingBirthDate).length,
      missingPhone: dataQuality.filter((item) => item.missingPhone).length,
      missingAddress: dataQuality.filter((item) => item.missingAddress).length,
      missingParents: dataQuality.filter((item) => item.missingParents).length,
    };
  }, [dataQuality, members.length]);
  const backupStatusLabel = lastBackupAt ? formatDateTime(lastBackupAt) : "Belum pernah backup";
  const backendSummary = useMemo(() => {
    const latestMemberUpdateAt = [...members]
      .map((member) => member.updatedAt || member.createdAt)
      .sort((a, b) => a.localeCompare(b));

    return {
      storageDriver: authState.session ? ("supabase" as const) : ("local" as const),
      schemaVersion: APP_SCHEMA_VERSION,
      syncedMembers: members.filter((member) => Boolean(member.updatedAt)).length,
      latestMemberUpdateAt: latestMemberUpdateAt[latestMemberUpdateAt.length - 1] || "",
    };
  }, [members, authState.session]);

  const filteredMembers = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    return sortByName(members).filter((member) => {
      const matchesKeyword = !keyword
        ? true
        : [member.name, member.gender, member.birthDate, member.address, member.phone]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
      const matchesGender = genderFilter === "all" ? true : member.gender === genderFilter;
      const matchesGeneration =
        generationFilter === "all" ? true : String(generationMap.get(member.id) || "") === generationFilter;
      return matchesKeyword && matchesGender && matchesGeneration;
    });
  }, [members, query, genderFilter, generationFilter, generationMap]);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedId) || filteredMembers[0] || members[0],
    [members, selectedId, filteredMembers]
  );

  const publicMembers = publicShareState.snapshot?.members || [];
  const publicProfile = publicShareState.snapshot?.profile || defaultProfile;
  const [publicSelectedId, setPublicSelectedId] = useState("");
  const publicGenerationMap = useMemo(
    () => calculateGenerationMap(publicMembers, publicSelectedId),
    [publicMembers, publicSelectedId]
  );
  const publicGenerationCount = useMemo(
    () => calculateGenerationCount(publicMembers, publicSelectedId),
    [publicMembers, publicSelectedId]
  );
  const publicFilteredMembers = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    return sortByName(publicMembers).filter((member) => {
      const matchesKeyword = !keyword
        ? true
        : [member.name, member.gender, member.birthDate, member.address]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
      const matchesGender = genderFilter === "all" ? true : member.gender === genderFilter;
      const matchesGeneration =
        generationFilter === "all" ? true : String(publicGenerationMap.get(member.id) || "") === generationFilter;
      return matchesKeyword && matchesGender && matchesGeneration;
    });
  }, [publicMembers, query, genderFilter, generationFilter, publicGenerationMap]);
  const publicSelectedMember = useMemo(
    () => publicMembers.find((member) => member.id === publicSelectedId) || publicFilteredMembers[0] || publicMembers[0],
    [publicMembers, publicSelectedId, publicFilteredMembers]
  );

  useEffect(() => {
    if (!selectedMember && members[0]) setSelectedId(members[0].id);
  }, [selectedMember, members]);

  useEffect(() => {
    if (!publicSelectedMember && publicMembers[0]) setPublicSelectedId(publicMembers[0].id);
  }, [publicSelectedMember, publicMembers]);

  useEffect(() => {
    if (!selectedMember) {
      setRelationDraft(emptyRelationDraft);
      return;
    }

    setRelationDraft({
      fatherId: selectedMember.fatherId || "unassigned",
      motherId: selectedMember.motherId || "unassigned",
      spouseId: selectedMember.spouseId || "unassigned",
    });
  }, [selectedMember]);

  const getMember = (id?: string) => (id ? memberMap.get(id) : undefined);
  const getChildren = (id?: string) =>
    sortChildrenByBirthDate(members.filter((member) => member.fatherId === id || member.motherId === id));

  const openCreate = () => {
    setFormErrors({});
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openCreateChild = (baseMember: Member) => {
    const spouse = baseMember.spouseId ? members.find((member) => member.id === baseMember.spouseId) : undefined;
    const nextForm: FormState = { ...emptyForm, address: baseMember.address };

    if (baseMember.gender === "Laki-laki") {
      nextForm.fatherId = baseMember.id;
      nextForm.motherId = spouse?.id || "unassigned";
    } else if (baseMember.gender === "Perempuan") {
      nextForm.motherId = baseMember.id;
      nextForm.fatherId = spouse?.id || "unassigned";
    } else {
      nextForm.fatherId = baseMember.id;
      nextForm.motherId = spouse?.id || "unassigned";
    }

    setFormErrors({});
    setForm(nextForm);
    setDialogOpen(true);
  };

  const openCreateSpouse = (baseMember: Member) => {
    setFormErrors({});
    setForm({ ...emptyForm, spouseId: baseMember.id, address: baseMember.address });
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setFormErrors({});
    setForm({
      id: member.id,
      name: member.name,
      gender: member.gender || "",
      birthDate: member.birthDate || "",
      address: member.address,
      phone: member.phone,
      photo: member.photo || "",
      fatherId: member.fatherId || "unassigned",
      motherId: member.motherId || "unassigned",
      spouseId: member.spouseId || "unassigned",
      notes: member.notes || "",
    });
    setDialogOpen(true);
  };

  const markBackupSaved = () => {
    const value = new Date().toISOString();
    saveLastBackupAt(value);
    setLastBackupAt(value);
  };

  const handleStartEmpty = () => {
    const confirmed = window.confirm("Mulai dari data kosong? Data anggota saat ini akan dihapus dari browser ini.");
    if (!confirmed) return;
    setMembers([]);
    setSelectedId("");
  };

  const handleAutoFixConsistency = () => {
    setMembers((prev) => {
      const existingIds = new Set(prev.map((member) => member.id));
      let changed = false;
      const now = new Date().toISOString();

      const sanitized = prev.map((member) => {
        const nextMember = { ...member };
        let memberChanged = false;

        if (nextMember.fatherId && !existingIds.has(nextMember.fatherId)) {
          nextMember.fatherId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.motherId && !existingIds.has(nextMember.motherId)) {
          nextMember.motherId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.spouseId && !existingIds.has(nextMember.spouseId)) {
          nextMember.spouseId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.fatherId === nextMember.id) {
          nextMember.fatherId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.motherId === nextMember.id) {
          nextMember.motherId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.spouseId === nextMember.id) {
          nextMember.spouseId = undefined;
          changed = true;
          memberChanged = true;
        }
        if (nextMember.fatherId && nextMember.motherId && nextMember.fatherId === nextMember.motherId) {
          nextMember.motherId = undefined;
          changed = true;
          memberChanged = true;
        }

        if (memberChanged) {
          nextMember.updatedAt = now;
        }

        return nextMember;
      });

      const localMap = new Map(sanitized.map((member) => [member.id, member]));
      sanitized.forEach((member) => {
        if (!member.spouseId) return;
        const spouse = localMap.get(member.spouseId);
        if (!spouse) return;
        if (!spouse.spouseId) {
          spouse.spouseId = member.id;
          spouse.updatedAt = now;
          changed = true;
        }
      });

      if (!changed) return prev;
      return sortByName(sanitized.map((member) => ({ ...member })));
    });

    window.alert("Perbaikan otomatis dasar selesai. Silakan cek ulang pusat validasi relasi.");
  };

  const handleSave = () => {
    const nextErrors = validateMemberForm(form);
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});
    const normalizedFatherId = normalizeSelectValue(form.fatherId);
    const normalizedMotherId = normalizeSelectValue(form.motherId);
    const normalizedSpouseId = normalizeSelectValue(form.spouseId);
    const memberId = form.id || `m-${uid()}`;

    setMembers((prev) => {
      let next = [...prev];
      const now = new Date().toISOString();
      const newMember: Member = {
        id: memberId,
        name: form.name.trim(),
        gender: form.gender || "",
        birthDate: form.birthDate || undefined,
        address: form.address.trim(),
        phone: form.phone.trim(),
        photo: form.photo || "",
        fatherId: normalizedFatherId,
        motherId: normalizedMotherId,
        spouseId: normalizedSpouseId,
        notes: form.notes?.trim() || "",
        createdAt: form.id
          ? prev.find((member) => member.id === form.id)?.createdAt || now
          : now,
        updatedAt: now,
      };

      const previousVersion = prev.find((member) => member.id === newMember.id);
      if (previousVersion?.spouseId && previousVersion.spouseId !== newMember.spouseId) {
        next = next.map((member) =>
          member.id === previousVersion.spouseId ? { ...member, spouseId: undefined, updatedAt: now } : member
        );
      }

      next = next.filter((member) => member.id !== newMember.id);
      next.push(newMember);

      if (newMember.spouseId) {
        next = next.map((member) => {
          if (member.id === newMember.spouseId) return { ...member, spouseId: newMember.id, updatedAt: now };
          if (
            member.id !== newMember.id &&
            member.spouseId === newMember.id &&
            member.id !== newMember.spouseId
          ) {
            return { ...member, spouseId: undefined, updatedAt: now };
          }
          return member;
        });
      }

      if (newMember.fatherId && newMember.motherId) {
        next = next.map((member) => {
          if (member.id === newMember.fatherId && (!member.spouseId || member.spouseId === newMember.motherId)) {
            return { ...member, spouseId: newMember.motherId, updatedAt: now };
          }
          if (member.id === newMember.motherId && (!member.spouseId || member.spouseId === newMember.fatherId)) {
            return { ...member, spouseId: newMember.fatherId, updatedAt: now };
          }
          return member;
        });
      }

      return sortByName(next);
    });

    setSelectedId(memberId);
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleDownloadCsvTemplate = () => {
    const blob = new Blob([buildCsvTemplate()], { type: "text/csv;charset=utf-8;" });
    const url = downloadBlob(blob, "template-keluargaku.csv");
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleExport = () => {
    const payload: BackupPackage = {
      schemaVersion: APP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      storageDriver: "local",
      profile: {
        ...profile,
        familySlug: slugifyFamilyName(profile.familySlug || profile.familyName),
      },
      members,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.profile.familySlug}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    markBackupSaved();
  };

  const handleSendMagicLink = async () => {
    try {
      if (!authState.email.trim()) {
        setAuthState((prev) => ({
          ...prev,
          status: "error",
          message: "Masukkan email terlebih dahulu.",
        }));
        return;
      }
      setAuthState((prev) => ({
        ...prev,
        status: "sending_link",
        message: "Mengirim magic link ke email...",
      }));
      await sendCloudMagicLink(supabaseConfig, authState.email.trim());
      setAuthState((prev) => ({
        ...prev,
        status: "signed_out",
        message: "Magic link terkirim. Buka email Anda lalu kembali ke aplikasi ini.",
      }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "Gagal mengirim magic link.",
      }));
    }
  };

  const handleSignOutCloud = async () => {
    const client = supabaseClientRef.current;
    if (!client) return;
    await client.auth.signOut();
    setCloudSyncStatus({
      type: "idle",
      message: "Anda telah logout dari sinkronisasi online.",
    });
  };

  const handleTestSupabase = async () => {
    try {
      setCloudSyncStatus({ type: "loading", message: "Menguji koneksi ke Supabase..." });
      await testCloudSupabaseConnection(supabaseConfig, authState.session);
      setCloudSyncStatus({
        type: "success",
        message: "Koneksi Supabase berhasil dan sesi login aktif.",
      });
    } catch (error) {
      setCloudSyncStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal menghubungkan Supabase.",
      });
    }
  };

  const handlePushToCloud = async () => {
    try {
      setCloudSyncStatus({ type: "loading", message: "Mengirim data keluarga ke Supabase..." });
      const normalizedProfile = normalizeAppProfile(profile);
      const payload: BackupPackage = {
        schemaVersion: APP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        storageDriver: "supabase",
        profile: normalizedProfile,
        members,
      };

      await pushFamilyBackupToSupabase(supabaseConfig, payload, authState.session);
      markBackupSaved();
      setProfile(normalizedProfile);

      let updatedShareCount = 0;
      try {
        const refreshed = await refreshActiveReadOnlyShareLinks(
          supabaseConfig,
          normalizedProfile,
          members,
          authState.session
        );
        updatedShareCount = refreshed.updatedCount;
        setFamilyShareLinks(refreshed.updatedLinks);
      } catch {
        // Jika refresh snapshot gagal, push data utama tetap dianggap berhasil.
      }

      setCloudSyncStatus({
        type: "success",
        message:
          updatedShareCount > 0
            ? `Push berhasil untuk keluarga ${payload.profile.familySlug}. ${updatedShareCount} link baca-saja aktif ikut diperbarui otomatis.`
            : `Push berhasil untuk keluarga ${payload.profile.familySlug}.`,
      });
    } catch (error) {
      setCloudSyncStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Push ke Supabase gagal.",
      });
    }
  };

  const handlePullFromCloud = async () => {
    try {
      setCloudSyncStatus({ type: "loading", message: "Mengambil data keluarga dari Supabase..." });
      const payload = await pullFamilyBackupFromSupabase(
        supabaseConfig,
        slugifyFamilyName(profile.familySlug || profile.familyName),
        authState.session
      );
      if (!payload) {
        setCloudSyncStatus({
          type: "error",
          message: "Belum ada data cloud untuk family slug ini.",
        });
        return;
      }
      setMembers(sortByName(payload.members));
      setProfile(payload.profile);
      setSelectedId(payload.members[0]?.id || "");
      setCloudSyncStatus({
        type: "success",
        message: `Pull berhasil. ${payload.members.length} anggota dimuat dari cloud.`,
      });
    } catch (error) {
      setCloudSyncStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Pull dari Supabase gagal.",
      });
    }
  };

  const handleCreateInvite = async () => {
    try {
      setInviteStatus({ type: "loading", message: "Membuat invite keluarga..." });
      const invite = await createFamilyInviteInSupabase(
        supabaseConfig,
        profile.familySlug || profile.familyName,
        inviteEmail,
        inviteRole,
        authState.session
      );
      setFamilyInvites((prev) => [invite, ...prev]);
      setInviteEmail("");

      if (invite.invitedEmail) {
        try {
          await sendFamilyInviteEmailViaEdgeFunction(
            supabaseConfig,
            profile.familyName,
            invite,
            authState.session
          );
          setInviteStatus({
            type: "success",
            message: `Invite berhasil dibuat dan email otomatis berhasil dikirim ke ${invite.invitedEmail}.`,
          });
        } catch (emailError) {
          setInviteStatus({
            type: "error",
            message:
              emailError instanceof Error
                ? `Invite berhasil dibuat, tetapi email otomatis gagal: ${emailError.message}`
                : "Invite berhasil dibuat, tetapi email otomatis gagal. Gunakan tombol salin invite atau buka email client.",
          });
        }
      } else {
        setInviteStatus({
          type: "success",
          message: `Invite berhasil dibuat. Kode: ${invite.inviteCode}. Karena email kosong, kirim undangan secara manual.`,
        });
      }
    } catch (error) {
      setInviteStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal membuat invite.",
      });
    }
  };

  const handleRefreshInvites = async () => {
    try {
      setInviteStatus({ type: "loading", message: "Memuat daftar invite keluarga..." });
      const invites = await listFamilyInvitesInSupabase(
        supabaseConfig,
        profile.familySlug || profile.familyName,
        authState.session
      );
      setFamilyInvites(invites);
      setInviteStatus({
        type: "success",
        message: `Daftar invite dimuat. Total ${invites.length} invite.`,
      });
    } catch (error) {
      setInviteStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal memuat invite.",
      });
    }
  };

  const handleAcceptInvite = async () => {
    try {
      setInviteStatus({ type: "loading", message: "Menerima invite keluarga..." });
      const invite = await acceptFamilyInviteInSupabase(supabaseConfig, inviteCodeInput, authState.session);
      setProfile((prev) => ({ ...prev, familySlug: invite.familySlug }));
      setInviteCodeInput("");
      setInviteStatus({
        type: "success",
        message: `Invite berhasil diterima untuk keluarga ${invite.familySlug}. Lanjutkan dengan Pull dari cloud.`,
      });
    } catch (error) {
      setInviteStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal menerima invite.",
      });
    }
  };

  const handleCreateReadOnlyShareLink = async () => {
    try {
      setShareStatus({ type: "loading", message: "Membuat link baca-saja..." });
      const link = await createFamilyShareLinkInSupabase(supabaseConfig, profile, members, authState.session);
      setFamilyShareLinks((prev) => [link, ...prev]);
      setShareStatus({
        type: "success",
        message: "Link baca-saja berhasil dibuat. Salin link dan kirim ke keluarga yang hanya perlu melihat.",
      });
    } catch (error) {
      setShareStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal membuat link baca-saja.",
      });
    }
  };

  const handleRefreshReadOnlyShareLinks = async () => {
    try {
      setShareStatus({ type: "loading", message: "Memuat daftar link baca-saja..." });
      const links = await listFamilyShareLinksInSupabase(
        supabaseConfig,
        profile.familySlug || profile.familyName,
        authState.session
      );
      setFamilyShareLinks(links);
      setShareStatus({
        type: "success",
        message: `Daftar link baca-saja dimuat. Total ${links.length} link.`,
      });
    } catch (error) {
      setShareStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal memuat link baca-saja.",
      });
    }
  };

  const handleRefreshReadOnlySnapshot = async (shareToken: string) => {
    try {
      setShareStatus({ type: "loading", message: "Memperbarui snapshot link baca-saja..." });
      const snapshot = await refreshFamilyShareLinkSnapshotInSupabase(
        supabaseConfig,
        shareToken,
        profile,
        members,
        authState.session
      );
      setFamilyShareLinks((prev) =>
        prev.map((link) =>
          link.shareToken === shareToken
            ? { ...link, snapshot, updatedAt: new Date().toISOString() }
            : link
        )
      );
      setShareStatus({
        type: "success",
        message: "Snapshot link baca-saja berhasil diperbarui. Viewer akan melihat versi terbaru saat membuka link.",
      });
    } catch (error) {
      setShareStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal memperbarui snapshot link baca-saja.",
      });
    }
  };

  const handleToggleReadOnlyShareLink = async (shareToken: string, isActive: boolean) => {
    try {
      setShareStatus({ type: "loading", message: isActive ? "Mengaktifkan link baca-saja..." : "Menonaktifkan link baca-saja..." });
      await setFamilyShareLinkActiveStateInSupabase(supabaseConfig, shareToken, isActive, authState.session);
      setFamilyShareLinks((prev) =>
        prev.map((link) =>
          link.shareToken === shareToken ? { ...link, isActive, updatedAt: new Date().toISOString() } : link
        )
      );
      setShareStatus({
        type: "success",
        message: isActive ? "Link baca-saja aktif kembali." : "Link baca-saja berhasil dinonaktifkan.",
      });
    } catch (error) {
      setShareStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal mengubah status link baca-saja.",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importMembersSource = Array.isArray(parsed) ? parsed : parsed?.members;
      const sanitized = sanitizeImportedMembers(importMembersSource);
      if (!sanitized) {
        window.alert("File JSON tidak valid atau tidak berisi data anggota keluarga.");
        event.target.value = "";
        return;
      }
      setMembers(sortByName(sanitized));
      setSelectedId(sanitized[0]?.id || "");
      if (!Array.isArray(parsed) && parsed?.profile) {
        const familyName =
          typeof parsed.profile.familyName === "string" && parsed.profile.familyName.trim()
            ? parsed.profile.familyName
            : defaultProfile.familyName;
        setProfile({
          familyName,
          subtitle:
            typeof parsed.profile.subtitle === "string"
              ? parsed.profile.subtitle
              : defaultProfile.subtitle,
          hometown:
            typeof parsed.profile.hometown === "string"
              ? parsed.profile.hometown
              : defaultProfile.hometown,
          familySlug:
            typeof parsed.profile.familySlug === "string" && parsed.profile.familySlug.trim()
              ? slugifyFamilyName(parsed.profile.familySlug)
              : slugifyFamilyName(familyName),
        });
      }
      window.alert("Data keluarga berhasil diimpor.");
    } catch {
      window.alert("Gagal membaca file. Pastikan format file JSON benar.");
    }

    event.target.value = "";
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const sanitized = sanitizeImportedCsv(text);
      if (!sanitized) {
        window.alert(
          "File CSV tidak valid atau kosong. Gunakan header seperti: name,gender,birthDate,address,phone,fatherName,motherName,spouseName,notes"
        );
        event.target.value = "";
        return;
      }
      setMembers(sortByName(sanitized));
      setSelectedId(sanitized[0]?.id || "");
      window.alert("Data keluarga dari CSV berhasil diimpor.");
    } catch {
      window.alert("Gagal membaca file CSV. Pastikan format file benar.");
    }

    event.target.value = "";
  };

  const handleSaveRelations = () => {
    if (!selectedMember) return;

    const nextErrors = validateMemberForm({
      id: selectedMember.id,
      name: selectedMember.name,
      gender: selectedMember.gender,
      birthDate: selectedMember.birthDate || "",
      address: selectedMember.address,
      phone: selectedMember.phone,
      photo: selectedMember.photo || "",
      fatherId: relationDraft.fatherId,
      motherId: relationDraft.motherId,
      spouseId: relationDraft.spouseId,
      notes: selectedMember.notes || "",
    });

    if (nextErrors.fatherId || nextErrors.motherId || nextErrors.spouseId) {
      window.alert(nextErrors.fatherId || nextErrors.motherId || nextErrors.spouseId || "Relasi tidak valid.");
      return;
    }

    const normalizedFatherId = normalizeSelectValue(relationDraft.fatherId);
    const normalizedMotherId = normalizeSelectValue(relationDraft.motherId);
    const normalizedSpouseId = normalizeSelectValue(relationDraft.spouseId);

    setMembers((prev) => {
      const now = new Date().toISOString();
      let next = prev.map((member) => {
        if (member.id === selectedMember.id) {
          return {
            ...member,
            fatherId: normalizedFatherId,
            motherId: normalizedMotherId,
            spouseId: normalizedSpouseId,
            updatedAt: now,
          };
        }
        return member;
      });

      next = next.map((member) => {
        if (member.id === selectedMember.id) return member;
        if (normalizedSpouseId && member.id === normalizedSpouseId) {
          return { ...member, spouseId: selectedMember.id, updatedAt: now };
        }
        if (!normalizedSpouseId && member.spouseId === selectedMember.id) {
          return { ...member, spouseId: undefined, updatedAt: now };
        }
        return member;
      });

      if (normalizedFatherId && normalizedMotherId) {
        next = next.map((member) => {
          if (member.id === normalizedFatherId && (!member.spouseId || member.spouseId === normalizedMotherId)) {
            return { ...member, spouseId: normalizedMotherId, updatedAt: now };
          }
          if (member.id === normalizedMotherId && (!member.spouseId || member.spouseId === normalizedFatherId)) {
            return { ...member, spouseId: normalizedFatherId, updatedAt: now };
          }
          return member;
        });
      }

      return sortByName(next);
    });

    window.alert("Relasi anggota berhasil diperbarui.");
  };

  const handleDelete = (memberId: string) => {
    const confirmed = window.confirm(
      "Hapus anggota ini? Relasi pasangan dan orang tua/anak yang terhubung akan dilepas."
    );
    if (!confirmed) return;

    setMembers((prev) =>
      sortByName(
        prev
          .filter((member) => member.id !== memberId)
          .map((member) => {
            const spouseId = member.spouseId === memberId ? undefined : member.spouseId;
            const fatherId = member.fatherId === memberId ? undefined : member.fatherId;
            const motherId = member.motherId === memberId ? undefined : member.motherId;
            const relationChanged =
              spouseId !== member.spouseId || fatherId !== member.fatherId || motherId !== member.motherId;

            return {
              ...member,
              spouseId,
              fatherId,
              motherId,
              updatedAt: relationChanged ? new Date().toISOString() : member.updatedAt,
            };
          })
      )
    );

    if (selectedId === memberId) {
      const remaining = members.filter((member) => member.id !== memberId);
      setSelectedId(remaining[0]?.id || "");
    }
  };

  const handlePrintTree = () => {
    const container = treeExportRef.current;
    if (!container) return;

    try {
      printHtmlDocument(container.innerHTML);
    } catch {
      window.alert(
        "Gagal membuka tampilan cetak di mode preview. Coba lagi setelah aplikasi dibuka di browser biasa."
      );
    }
  };

  const handleExportTreePdf = async () => {
    const container = treeExportRef.current;
    if (!container) return;

    try {
      setExportingPdf(true);
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const orientation = canvas.width > canvas.height ? "l" : "p";
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const imageHeight = (canvas.height * usableWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/png");

      let remainingHeight = imageHeight;
      let offsetY = 0;

      pdf.setFontSize(16);
      pdf.text("Silsilah Keluarga", margin, 8);
      pdf.addImage(imageData, "PNG", margin, margin + 4 + offsetY, usableWidth, imageHeight);
      remainingHeight -= usableHeight;

      while (remainingHeight > 0) {
        offsetY -= usableHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", margin, margin + 4 + offsetY, usableWidth, imageHeight);
        remainingHeight -= usableHeight;
      }

      const blob = pdf.output("blob");
      if (lastPdfUrl) window.URL.revokeObjectURL(lastPdfUrl);
      const url = downloadBlob(blob, `silsilah-keluarga-${new Date().toISOString().slice(0, 10)}.pdf`);
      setLastPdfUrl(url);
      markBackupSaved();
    } catch {
      window.alert(
        "Gagal mengekspor PDF di mode preview. Gunakan tombol unduh manual jika tersedia, atau coba lagi di browser biasa."
      );
    } finally {
      setExportingPdf(false);
    }
  };

    if (publicShareState.type === "loading") {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Memuat link keluarga...</div>
          <p className="mt-2 text-sm text-slate-500">{publicShareState.message}</p>
        </div>
      </div>
    );
  }

  if (publicShareState.type === "error") {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Link baca-saja tidak dapat dibuka</div>
          <p className="mt-2 text-sm text-slate-500">{publicShareState.message}</p>
        </div>
      </div>
    );
  }

  if (publicShareState.type === "viewing" && publicSelectedMember) {
    const publicMemberMap = new Map(publicMembers.map((member) => [member.id, member]));
    const publicGetMember = (id?: string) => (id ? publicMemberMap.get(id) : undefined);
    const publicFather = publicGetMember(publicSelectedMember.fatherId);
    const publicMother = publicGetMember(publicSelectedMember.motherId);
    const publicSpouse = publicGetMember(publicSelectedMember.spouseId);
    const publicChildren = sortChildrenByBirthDate(
      publicMembers.filter((member) => member.fatherId === publicSelectedMember.id || member.motherId === publicSelectedMember.id)
    );
    const publicGenerationSummary = Array.from({ length: publicGenerationCount }, (_, index) => {
      const level = index + 1;
      const items = publicMembers.filter((member) => publicGenerationMap.get(member.id) === level);
      return { level, total: items.length };
    });

    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="rounded-3xl border-none bg-slate-900 text-white shadow-lg" style={{ background: "#0f172a", color: "#ffffff", border: "none" }}>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <Badge className="bg-white/15 text-white" style={{ background: "rgba(255,255,255,0.16)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>
                    Mode baca-saja
                  </Badge>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight">{publicProfile.familyName}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300" style={{ color: "#cbd5e1" }}>
                    {publicProfile.subtitle || "Tampilan silsilah keluarga baca-saja"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400" style={{ color: "#94a3b8" }}>
                    Link ini hanya untuk melihat. Nomor hape, alamat detail, dan catatan anggota disembunyikan.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4" style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff" }}>
                  <div className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>Berlaku sampai</div>
                  <div className="mt-1 text-sm font-semibold">{formatDateTime(publicShareState.expiresAt) || "Tidak diketahui"}</div>
                  <div className="mt-2 text-xs text-slate-300" style={{ color: "#cbd5e1" }}>
                    Snapshot diperbarui: {formatDateTime(publicShareState.snapshot?.sharedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Daftar anggota</CardTitle>
                <CardDescription>Filter dan pilih anggota tanpa akses edit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 bg-white">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama, kota, atau tanggal lahir"
                    className="border-0 p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Filter jenis kelamin</Label>
                    <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as any)}>
                      <SelectTrigger className="rounded-2xl" />
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Filter generasi</Label>
                    <Select value={generationFilter} onValueChange={setGenerationFilter}>
                      <SelectTrigger className="rounded-2xl" />
                      <SelectContent>
                        <SelectItem value="all">Semua generasi</SelectItem>
                        {publicGenerationSummary.map((item) => (
                          <SelectItem key={item.level} value={String(item.level)}>
                            Generasi {item.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ScrollArea className="h-[500px] pr-3">
                  <div className="space-y-3">
                    {publicFilteredMembers.map((member) => (
                      <SmallMemberCard
                        key={member.id}
                        member={member}
                        active={publicSelectedMember?.id === member.id}
                        onClick={() => setPublicSelectedId(member.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar member={publicSelectedMember} size="lg" />
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">{publicSelectedMember.name}</h2>
                        <p className="text-sm text-slate-500">Profil anggota keluarga baca-saja</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {publicSelectedMember.gender ? <Badge variant="secondary">{publicSelectedMember.gender}</Badge> : null}
                        {publicSelectedMember.birthDate ? <Badge variant="outline">{formatDate(publicSelectedMember.birthDate)}</Badge> : null}
                        <Badge variant="outline">Generasi {publicGenerationMap.get(publicSelectedMember.id) || "-"}</Badge>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-700">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                          <span>{publicSelectedMember.address || "Wilayah tidak tersedia"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 mt-0.5 text-slate-400" />
                          <span>Disembunyikan pada mode baca-saja</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <RelationCard title="Ayah" member={publicFather} onSelect={setPublicSelectedId} />
                <RelationCard title="Ibu" member={publicMother} onSelect={setPublicSelectedId} />
                <RelationCard title="Pasangan" member={publicSpouse} onSelect={setPublicSelectedId} />
              </div>

              <Card className="rounded-3xl shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle>Pohon keluarga baca-saja</CardTitle>
                  <CardDescription>Cabang keluarga dapat dibuka tanpa login dan tanpa akses edit.</CardDescription>
                </CardHeader>
                <CardContent className="bg-gradient-to-b from-slate-50 to-white p-6">
                  <div className="rounded-3xl bg-white p-4 md:p-6">
                    <div className="overflow-x-auto">
                      <div className="min-w-[760px] space-y-10 py-2">
                        <div className="flex justify-center gap-10">
                          <TreeNode label="Ayah" member={publicFather} onSelect={setPublicSelectedId} />
                          <TreeNode label="Ibu" member={publicMother} onSelect={setPublicSelectedId} />
                        </div>
                        <div className="flex justify-center gap-10">
                          <TreeNode label="Anggota terpilih" member={publicSelectedMember} onSelect={setPublicSelectedId} />
                          <TreeNode label="Pasangan" member={publicSpouse} onSelect={setPublicSelectedId} />
                        </div>
                        <div className="rounded-3xl border bg-white/70 p-5">
                          <div className="mb-4 text-center text-xs uppercase tracking-wide text-slate-500">Keturunan</div>
                          <DescendantBranch parent={publicSelectedMember} members={publicMembers} onSelect={setPublicSelectedId} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Anak dan keturunan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {publicChildren.length ? (
                      publicChildren.map((child) => (
                        <button key={child.id} className="w-full text-left" onClick={() => setPublicSelectedId(child.id)}>
                          <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-slate-50 transition">
                            <Avatar member={child} size="sm" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{child.name}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {[child.gender, child.birthDate ? formatDate(child.birthDate) : ""].filter(Boolean).join(" • ")}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">Belum ada anak yang terhubung.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

const father = getMember(selectedMember?.fatherId);
  const mother = getMember(selectedMember?.motherId);
  const spouse = getMember(selectedMember?.spouseId);
  const children = getChildren(selectedMember?.id);
  const siblingMembers = selectedMember
    ? sortChildrenByBirthDate(
        members.filter(
          (member) =>
            member.id !== selectedMember.id &&
            ((selectedMember.fatherId && member.fatherId === selectedMember.fatherId) ||
              (selectedMember.motherId && member.motherId === selectedMember.motherId))
        )
      )
    : [];
  const selectedBirthOrder = selectedMember ? getBirthOrder(selectedMember, members) : undefined;
  const selectedIsFounder = selectedMember ? founderIds.includes(selectedMember.id) : false;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-3xl border-none bg-slate-900 text-white shadow-lg" style={{ background: "#0f172a", color: "#ffffff", border: "none" }}>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <Badge className="bg-white/15 text-white hover:bg-white/15" style={{ background: "rgba(255,255,255,0.16)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>MVP Web App</Badge>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{profile.familyName}</h1>
                  <p className="max-w-2xl text-sm md:text-base text-slate-300" style={{ color: "#cbd5e1" }}>
                    {profile.subtitle || "Arsip silsilah keluarga digital"}
                  </p>
                  <p className="max-w-2xl text-xs md:text-sm text-slate-400" style={{ color: "#94a3b8" }}>
                    Wilayah keluarga: {profile.hometown || "Belum diisi"}. Statistik generasi utama di bawah mengikuti anggota yang sedang dipilih pada daftar anggota.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
                  <div className="rounded-2xl bg-white/10 p-4" style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff" }}>
                    <div className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>Total anggota</div>
                    <div className="mt-1 text-2xl font-semibold">{members.length}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4" style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff" }}>
                    <div className="text-sm text-slate-300" style={{ color: "#cbd5e1" }}>Jumlah generasi utama</div>
                    <div className="mt-1 text-2xl font-semibold">{generationCount}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 grid gap-3 rounded-2xl border bg-slate-50 p-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="familyName">Nama keluarga / marga utama</Label>
                  <Input
                    id="familyName"
                    value={profile.familyName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        familyName: e.target.value,
                        familySlug: slugifyFamilyName(e.target.value),
                      }))
                    }
                    placeholder="Contoh: Keluarga Zainal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyHometown">Wilayah utama</Label>
                  <Input
                    id="familyHometown"
                    value={profile.hometown}
                    onChange={(e) => setProfile((prev) => ({ ...prev, hometown: e.target.value }))}
                    placeholder="Contoh: Jember"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="familySubtitle">Subjudul aplikasi keluarga</Label>
                  <Input
                    id="familySubtitle"
                    value={profile.subtitle}
                    onChange={(e) => setProfile((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Contoh: Arsip keluarga besar Bani Zainal"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 bg-white">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, alamat, nomor hape, atau tanggal lahir"
                  className="border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Filter jenis kelamin</Label>
                  <Select
                    value={genderFilter}
                    onValueChange={(value) => setGenderFilter(value as "all" | "Laki-laki" | "Perempuan")}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Semua jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filter generasi</Label>
                  <Select value={generationFilter} onValueChange={setGenerationFilter}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Semua generasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua generasi</SelectItem>
                      {generationSummary.map((item) => (
                        <SelectItem key={item.level} value={String(item.level)}>
                          Generasi {item.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="rounded-2xl" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />Tambah anggota
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => {
                    window.localStorage.removeItem(STORAGE_KEY);
                    setMembers(sortByName(seedMembers));
                    setSelectedId(seedMembers[0]?.id || "");
                  }}
                >
                  Reset data contoh
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleStartEmpty}>
                  Mulai kosong
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />Export JSON
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => importInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />Import JSON
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => importCsvInputRef.current?.click()}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />Import CSV
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleDownloadCsvTemplate}>
                  <Download className="h-4 w-4 mr-2" />Template CSV
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <input
                  ref={importCsvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImportCsv}
                />
              </div>

              <div className="mt-4 rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-medium text-slate-800">Status backup</div>
                <p className="mt-1 text-xs text-slate-500">Backup terakhir: {backupStatusLabel}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Semua data disimpan lokal di browser ini. Export JSON akan menyimpan profil keluarga dan seluruh anggota, sedangkan import CSV fokus untuk input massal anggota keluarga.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Ringkasan per generasi</CardTitle>
            <CardDescription>
              Jumlah anggota pada setiap level generasi di garis keluarga utama yang sedang dipilih. Pilih anggota berbeda untuk melihat garis keluarga utama yang lain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {generationSummary.map((item) => (
                <div key={item.level} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Generasi {item.level}</div>
                  <div className="mt-1 text-2xl font-semibold">{item.total}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Laki-laki: {item.male} • Perempuan: {item.female}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Kualitas data</CardTitle>
            <CardDescription>Memantau kelengkapan profil dan potensi data ganda sebelum keluarga bertambah besar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4" />Profil lengkap
                </div>
                <div className="mt-1 text-2xl font-semibold">{completenessStats.complete}</div>
                <div className="mt-2 text-xs text-slate-500">{completenessStats.completionRate}% dari seluruh anggota</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <AlertTriangle className="h-4 w-4" />Tanpa foto
                </div>
                <div className="mt-1 text-2xl font-semibold">{completenessStats.missingPhoto}</div>
                <div className="mt-2 text-xs text-slate-500">Anggota yang belum punya foto profil</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <AlertTriangle className="h-4 w-4" />Tanpa tanggal lahir
                </div>
                <div className="mt-1 text-2xl font-semibold">{completenessStats.missingBirthDate}</div>
                <div className="mt-2 text-xs text-slate-500">Berdampak pada urutan anak dan statistik usia</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Copy className="h-4 w-4" />Potensi duplikat
                </div>
                <div className="mt-1 text-2xl font-semibold">{duplicateMembers.length}</div>
                <div className="mt-2 text-xs text-slate-500">Nama atau nomor hape yang terdeteksi ganda</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-800">Checklist kelengkapan</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span>Alamat belum diisi</span>
                    <Badge variant="secondary" className="rounded-xl">
                      {completenessStats.missingAddress}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span>Nomor hape belum diisi</span>
                    <Badge variant="secondary" className="rounded-xl">
                      {completenessStats.missingPhone}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span>Orang tua belum terhubung</span>
                    <Badge variant="secondary" className="rounded-xl">
                      {completenessStats.missingParents}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-800">Daftar duplikasi terdeteksi</div>
                <div className="mt-3 space-y-2">
                  {duplicateMembers.length ? (
                    duplicateMembers.slice(0, 6).map((member) => (
                      <button
                        key={member.id}
                        className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                        onClick={() => setSelectedId(member.id)}
                      >
                        <span className="truncate pr-3">{member.name}</span>
                        <Badge variant="outline" className="rounded-xl">
                          {member.phone || "Tanpa nomor"}
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                      Belum ada duplikasi yang terdeteksi.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Ringkasan migrasi backend</CardTitle>
            <CardDescription>
              Metadata ini disiapkan supaya data lokal lebih mudah dipindahkan ke API atau database di tahap berikutnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Schema version</div>
                <div className="mt-1 text-2xl font-semibold">{backendSummary.schemaVersion}</div>
                <div className="mt-2 text-xs text-slate-500">Versi format backup dan migrasi</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Storage driver</div>
                <div className="mt-1 text-2xl font-semibold uppercase">{backendSummary.storageDriver}</div>
                <div className="mt-2 text-xs text-slate-500">Saat ini masih tersimpan lokal di browser</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Family slug</div>
                <div className="mt-1 text-lg font-semibold break-all">{profile.familySlug}</div>
                <div className="mt-2 text-xs text-slate-500">Identifier stabil untuk URL atau tenant keluarga</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Anggota siap sync</div>
                <div className="mt-1 text-2xl font-semibold">{backendSummary.syncedMembers}/{members.length}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Update terakhir: {backendSummary.latestMemberUpdateAt ? formatDateTime(backendSummary.latestMemberUpdateAt) : "Belum ada perubahan"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Sinkronisasi online (Supabase)</CardTitle>
            <CardDescription>
              Aplikasi dapat dipakai online lintas perangkat dengan login magic link. Data keluarga diikat ke akun yang sedang login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://xxxxx.supabase.co"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabaseAnonKey">Supabase anon key</Label>
                <Input
                  id="supabaseAnonKey"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig((prev) => ({ ...prev, anonKey: e.target.value }))}
                  placeholder="eyJhbGciOi..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="authEmail">Email login keluarga</Label>
                <Input
                  id="authEmail"
                  type="email"
                  value={authState.email}
                  onChange={(e) => setAuthState((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contoh@email.com"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={supabaseConfig.enabled ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSupabaseConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                >
                  {supabaseConfig.enabled ? "Cloud mode aktif" : "Aktifkan cloud mode"}
                </Button>
                <Button className="rounded-2xl" onClick={handleSendMagicLink} disabled={authState.status === "sending_link"}>
                  {authState.status === "sending_link" ? "Mengirim..." : "Kirim magic link"}
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleSignOutCloud}>
                  Logout cloud
                </Button>
              </div>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${getStatusToneClass(authState.status)}`}>
              {authState.message}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={handleTestSupabase}>
                Test koneksi
              </Button>
              <Button variant="outline" className="rounded-2xl" onClick={handlePushToCloud}>
                Push ke cloud
              </Button>
              <Button variant="outline" className="rounded-2xl" onClick={handlePullFromCloud}>
                Pull dari cloud
              </Button>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${getStatusToneClass(cloudSyncStatus.type)}`}>
              {cloudSyncStatus.message}
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-800">Invite anggota keluarga</div>
                <p className="mt-1 text-xs text-slate-500">
                  Owner dapat membuat invite untuk keluarga besar. Jika Edge Function email sudah di-deploy, aplikasi akan mencoba mengirim email otomatis saat invite dibuat. Jika belum, gunakan tombol salin invite atau buka email client untuk mengirim undangan manual.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email anggota keluarga</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="opsional@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role invite</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as InviteRole)}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="rounded-2xl" onClick={handleCreateInvite}>
                  Buat invite
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <div className="space-y-2">
                  <Label htmlFor="inviteCodeInput">Terima invite dengan kode</Label>
                  <Input
                    id="inviteCodeInput"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="INV-ABCD-EFGH"
                  />
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={handleAcceptInvite}>
                  Terima invite
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleRefreshInvites}>
                  Muat daftar invite
                </Button>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm ${inviteStatus.type === "idle" ? "border-slate-200 bg-white text-slate-600" : getStatusToneClass(inviteStatus.type)}`}>
                {inviteStatus.message}
              </div>

              <div className="space-y-2">
                {familyInvites.length ? (
                  familyInvites.slice(0, 6).map((invite) => (
                    <div key={invite.inviteCode} className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{invite.invitedEmail || "Invite tanpa email khusus"}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Kode: {invite.inviteCode} • Role: {invite.role} • Status: {invite.status}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Berlaku sampai: {formatDateTime(invite.expiresAt)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={async () => {
                            const shareText = buildInviteShareText(profile.familyName, invite);
                            try {
                              await navigator.clipboard.writeText(shareText);
                              setInviteStatus({ type: "success", message: `Pesan invite untuk ${invite.invitedEmail || invite.inviteCode} berhasil disalin.` });
                            } catch {
                              setInviteStatus({ type: "error", message: "Gagal menyalin pesan invite." });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />Salin invite
                        </Button>
                        {invite.invitedEmail ? (
                          <>
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={async () => {
                                try {
                                  setInviteStatus({ type: "loading", message: `Mengirim ulang email ke ${invite.invitedEmail}...` });
                                  await sendFamilyInviteEmailViaEdgeFunction(
                                    supabaseConfig,
                                    profile.familyName,
                                    invite,
                                    authState.session
                                  );
                                  setInviteStatus({ type: "success", message: `Email invite berhasil dikirim ke ${invite.invitedEmail}.` });
                                } catch (error) {
                                  setInviteStatus({
                                    type: "error",
                                    message:
                                      error instanceof Error
                                        ? `Gagal mengirim email invite: ${error.message}`
                                        : "Gagal mengirim email invite.",
                                  });
                                }
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />Kirim email
                            </Button>
                            <a
                              href={buildInviteMailtoLink(profile.familyName, invite)}
                              className="inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                            >
                              <Upload className="h-4 w-4 mr-2" />Buka email
                            </a>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed bg-white px-4 py-4 text-sm text-slate-500">
                    Belum ada invite yang dimuat. Owner dapat membuat invite baru atau klik tombol muat daftar invite.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4 space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-800">Link baca-saja tanpa login</div>
                <p className="mt-1 text-xs text-slate-500">
                  Gunakan fitur ini untuk anggota keluarga yang hanya perlu melihat silsilah. Link viewer tidak memerlukan login, tidak memerlukan invite email, dan otomatis menyembunyikan nomor hape, alamat detail, serta catatan.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="rounded-2xl" onClick={handleCreateReadOnlyShareLink}>
                  Buat link baca-saja
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleRefreshReadOnlyShareLinks}>
                  Muat daftar link
                </Button>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm ${shareStatus.type === "idle" ? "border-slate-200 bg-white text-slate-600" : getStatusToneClass(shareStatus.type)}`}>
                {shareStatus.message}
              </div>

              <div className="space-y-2">
                {familyShareLinks.length ? (
                  familyShareLinks.slice(0, 6).map((link) => {
                    const shareUrl = buildReadOnlyShareUrl(link.shareToken, link.familySlug, supabaseConfig);
                    return (
                      <div key={link.shareToken} className="rounded-2xl border bg-white px-4 py-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-800">Link viewer untuk {link.familySlug}</div>
                            <div className="mt-1 text-xs text-slate-500 break-all">{shareUrl}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              Status: {link.isActive ? "Aktif" : "Nonaktif"} • Berlaku sampai: {formatDateTime(link.expiresAt)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Snapshot terakhir: {formatDateTime(link.snapshot.sharedAt)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(shareUrl);
                                  setShareStatus({ type: "success", message: "Link baca-saja berhasil disalin." });
                                } catch {
                                  setShareStatus({ type: "error", message: "Gagal menyalin link baca-saja." });
                                }
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />Salin link
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => handleRefreshReadOnlySnapshot(link.shareToken)}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />Perbarui snapshot
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => handleToggleReadOnlyShareLink(link.shareToken, !link.isActive)}
                            >
                              {link.isActive ? "Nonaktifkan" : "Aktifkan ulang"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed bg-white px-4 py-4 text-sm text-slate-500">
                    Belum ada link baca-saja. Buat satu link lalu salin ke keluarga yang hanya perlu melihat.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-800">SQL setup Supabase + RLS</div>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100" style={{ background: "#0f172a", color: "#f8fafc" }}><code>{SUPABASE_SQL_SETUP}</code></pre>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Deploy publik</CardTitle>
            <CardDescription>
              Setelah Supabase siap, aplikasi ini bisa dipasang ke Vercel atau Netlify agar dapat dibuka dari link publik.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">1. Siapkan Supabase</div>
                <div className="mt-2 text-sm text-slate-700">Jalankan SQL tabel dan RLS, lalu test koneksi sampai status hijau.</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">2. Upload ke Git</div>
                <div className="mt-2 text-sm text-slate-700">Simpan proyek React ini ke GitHub agar mudah dihubungkan ke Vercel.</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">3. Deploy ke Vercel</div>
                <div className="mt-2 text-sm text-slate-700">Import repository, build, lalu buka link publik hasil deploy.</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">4. Login keluarga</div>
                <div className="mt-2 text-sm text-slate-700">Masuk dengan magic link dan sinkronkan data antar perangkat.</div>
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-800">Checklist publish</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div>• React app berhasil preview tanpa error compile</div>
                <div>• Supabase URL dan anon key sudah valid</div>
                <div>• SQL tabel + RLS sudah dijalankan</div>
                <div>• Magic link login berhasil</div>
                <div>• Push dan pull cloud berhasil minimal sekali</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Pusat validasi relasi</CardTitle>
                <CardDescription>Memeriksa relasi keluarga yang rusak atau belum konsisten, terutama setelah import data.</CardDescription>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={handleAutoFixConsistency}>
                <Sparkles className="h-4 w-4 mr-2" />Perbaiki otomatis dasar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Total peringatan relasi</div>
                <div className="mt-1 text-2xl font-semibold">{relationshipWarnings.length}</div>
                <div className="mt-2 text-xs text-slate-500">Semakin kecil semakin baik</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Referensi hilang</div>
                <div className="mt-1 text-2xl font-semibold">{relationshipWarnings.filter((item) => item.type === "missing_reference").length}</div>
                <div className="mt-2 text-xs text-slate-500">Ayah, ibu, atau pasangan tidak ditemukan</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Pasangan satu arah</div>
                <div className="mt-1 text-2xl font-semibold">{relationshipWarnings.filter((item) => item.type === "one_way_spouse").length}</div>
                <div className="mt-2 text-xs text-slate-500">Hubungan pasangan belum dua arah</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Relasi tidak valid</div>
                <div className="mt-1 text-2xl font-semibold">{relationshipWarnings.filter((item) => item.type === "self_reference" || item.type === "invalid_parent_pair").length}</div>
                <div className="mt-2 text-xs text-slate-500">Self-reference atau ayah/ibu ganda</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {relationshipWarnings.length ? relationshipWarnings.slice(0, 8).map((warning, index) => (
                <button key={`${warning.memberId}-${warning.type}-${index}`} className="flex w-full items-start justify-between gap-4 rounded-2xl border bg-white px-4 py-3 text-left hover:bg-slate-50" onClick={() => setSelectedId(warning.memberId)}>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{warning.memberName}</div>
                    <div className="mt-1 text-xs text-slate-500">{warning.message}</div>
                  </div>
                  <Badge variant="outline" className="rounded-xl">Cek</Badge>
                </button>
              )) : <div className="rounded-2xl border bg-slate-50 px-4 py-4 text-sm text-slate-500">Tidak ada masalah relasi yang terdeteksi.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Statistik keluarga</CardTitle>
            <CardDescription>
              Ringkasan cepat struktur keluarga, usia, pasangan, dan persebaran alamat. Statistik generasi utama mengikuti anggota yang sedang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Pendiri keluarga utama</div>
                <div className="mt-1 text-2xl font-semibold">{familyStats.firstGenerationHeads}</div>
                <div className="mt-2 text-xs text-slate-500">Root pada garis keluarga utama aktif</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Total pasangan</div>
                <div className="mt-1 text-2xl font-semibold">{familyStats.totalCouples}</div>
                <div className="mt-2 text-xs text-slate-500">Pasangan aktif yang saling terhubung</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Rata-rata anak</div>
                <div className="mt-1 text-2xl font-semibold">{familyStats.averageChildrenPerCouple}</div>
                <div className="mt-2 text-xs text-slate-500">Per pasangan yang tercatat</div>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Pasangan terbanyak anak</div>
                <div className="mt-1 text-lg font-semibold leading-tight">
                  {largestCouple ? `${largestCouple.first.name} & ${largestCouple.second.name}` : "Belum ada data"}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {largestCouple ? `${largestCouple.childCount} anak tercatat` : "Tambahkan pasangan dan anak untuk melihat statistik ini"}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-800">Grafik komposisi per generasi utama</div>
                <div className="mt-4 h-72 rounded-2xl bg-slate-50 p-3">
                  {generationChartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generationChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="lakiLaki" name="Laki-laki" fill="#0f172a" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="perempuan" name="Perempuan" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Belum ada data generasi untuk ditampilkan.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="text-sm font-medium text-slate-800">Anggota tertua dan termuda</div>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Tertua</div>
                    <div className="mt-1 font-semibold">{oldestMember ? oldestMember.name : "Belum ada data tanggal lahir"}</div>
                    <div className="text-xs text-slate-500">
                      {oldestMember?.birthDate
                        ? formatDate(oldestMember.birthDate)
                        : "Isi tanggal lahir anggota untuk mengaktifkan statistik usia"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Termuda</div>
                    <div className="mt-1 font-semibold">{youngestMember ? youngestMember.name : "Belum ada data tanggal lahir"}</div>
                    <div className="text-xs text-slate-500">
                      {youngestMember?.birthDate
                        ? formatDate(youngestMember.birthDate)
                        : "Isi tanggal lahir anggota untuk mengaktifkan statistik usia"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-4 lg:col-span-2">
                <div className="text-sm font-medium text-slate-800">Distribusi alamat / kota</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
                  <div className="h-72 rounded-2xl bg-slate-50 p-3">
                    {addressChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={addressChartData}
                            dataKey="total"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={45}
                            paddingAngle={2}
                          >
                            {addressChartData.map((entry, index) => (
                              <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Belum ada data alamat untuk ditampilkan.
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {addressSummary.slice(0, 6).map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate pr-3">{item.label}</span>
                        <Badge variant="secondary" className="rounded-xl">
                          {item.total}
                        </Badge>
                      </div>
                    ))}
                    {!addressSummary.length ? (
                      <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                        Belum ada data alamat.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />Daftar anggota
              </CardTitle>
              <CardDescription>{filteredMembers.length} anggota ditemukan setelah filter</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[560px] pr-3">
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <SmallMemberCard
                      key={member.id}
                      member={member}
                      active={selectedMember?.id === member.id}
                      onClick={() => setSelectedId(member.id)}
                    />
                  ))}
                  {!filteredMembers.length ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                      Tidak ada data yang cocok.
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedMember ? (
              <>
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <Avatar member={selectedMember} size="lg" />
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-2xl font-semibold tracking-tight">{selectedMember.name}</h2>
                            <p className="text-sm text-slate-500">Detail anggota keluarga terpilih</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Anggota ini menjadi acuan untuk statistik garis keluarga utama.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedMember.gender ? (
                                <Badge variant="secondary" className="rounded-xl">
                                  {selectedMember.gender}
                                </Badge>
                              ) : null}
                              {selectedBirthOrder ? (
                                <Badge variant="outline" className="rounded-xl">
                                  Anak ke-{selectedBirthOrder}
                                </Badge>
                              ) : null}
                              {selectedIsFounder ? (
                                <Badge variant="outline" className="rounded-xl">
                                  Pendiri utama
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <div className="grid gap-2 text-sm text-slate-700">
                            <div className="flex items-start gap-2">
                              <CalendarDays className="h-4 w-4 mt-0.5 text-slate-400" />
                              <span>{formatDate(selectedMember.birthDate) || "Tanggal lahir belum diisi"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                              <span>{selectedMember.address || "Alamat belum diisi"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 mt-0.5 text-slate-400" />
                              <span>{selectedMember.phone || "Nomor hape belum diisi"}</span>
                            </div>
                          </div>
                          {selectedMember.notes ? (
                            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{selectedMember.notes}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-2xl" onClick={() => openCreateChild(selectedMember)}>
                          <Plus className="h-4 w-4 mr-2" />Tambah anak
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => openCreateSpouse(selectedMember)}>
                          <Plus className="h-4 w-4 mr-2" />Tambah pasangan
                        </Button>
                        <Button variant="secondary" className="rounded-2xl" onClick={() => openEdit(selectedMember)}>
                          <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                        <Button variant="destructive" className="rounded-2xl" onClick={() => handleDelete(selectedMember.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Navigasi cepat keluarga utama</CardTitle>
                    <CardDescription>
                      Lompat cepat ke pendiri utama, pasangan, atau saudara kandung dari anggota yang sedang dipilih.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm font-medium text-slate-800">Pendiri utama</div>
                      <div className="flex flex-wrap gap-2">
                        {founderMembers.length ? (
                          founderMembers.map((member) => (
                            <Button
                              key={member.id}
                              variant={selectedMember?.id === member.id ? "default" : "outline"}
                              className="rounded-2xl"
                              onClick={() => setSelectedId(member.id)}
                            >
                              {member.name}
                            </Button>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">Belum terdeteksi.</div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-800">Pasangan</div>
                        {spouse ? (
                          <Button
                            variant="outline"
                            className="rounded-2xl w-full justify-start"
                            onClick={() => setSelectedId(spouse.id)}
                          >
                            {spouse.name}
                          </Button>
                        ) : (
                          <div className="rounded-2xl border border-dashed px-4 py-3 text-sm text-slate-500">
                            Belum ada pasangan terhubung.
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-800">Saudara kandung</div>
                        <div className="flex flex-wrap gap-2">
                          {siblingMembers.length ? (
                            siblingMembers.map((member) => (
                              <Button
                                key={member.id}
                                variant="outline"
                                className="rounded-2xl"
                                onClick={() => setSelectedId(member.id)}
                              >
                                {member.name}
                              </Button>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed px-4 py-3 text-sm text-slate-500">
                              Belum ada saudara kandung terdeteksi.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="tree" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl">
                    <TabsTrigger value="tree" className="rounded-2xl">
                      <Network className="h-4 w-4 mr-2" />Pohon keluarga
                    </TabsTrigger>
                    <TabsTrigger value="relations" className="rounded-2xl">
                      <Users className="h-4 w-4 mr-2" />Relasi detail
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree">
                    <Card className="rounded-3xl shadow-sm overflow-hidden">
                      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle>Tampilan silsilah sederhana</CardTitle>
                          <CardDescription>
                            Keturunan ditampilkan berurutan berdasarkan tanggal lahir, setiap cabang bisa dibuka atau ditutup, dan tampilan ini bisa langsung dicetak atau diekspor ke PDF.
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="rounded-2xl" onClick={handlePrintTree}>
                            <Printer className="h-4 w-4 mr-2" />Cetak
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={handleExportTreePdf}
                            disabled={exportingPdf}
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            {exportingPdf ? "Mengekspor PDF..." : "Export PDF"}
                          </Button>
                          {lastPdfUrl ? (
                            <a
                              href={lastPdfUrl}
                              download={`silsilah-keluarga-${new Date().toISOString().slice(0, 10)}.pdf`}
                              className="inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4 mr-2" />Unduh PDF terakhir
                            </a>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="bg-gradient-to-b from-slate-50 to-white p-6">
                        <div ref={treeExportRef} className="rounded-3xl bg-white p-4 md:p-6">
                          <div className="mb-6 text-center">
                            <h3 className="text-xl font-semibold tracking-tight">Silsilah Keluarga</h3>
                            <p className="mt-1 text-sm text-slate-500">Fokus tampilan saat ini: {selectedMember.name}</p>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="min-w-[760px] space-y-10 py-2">
                              <div className="flex justify-center gap-10">
                                <TreeNode label="Ayah" member={father} onSelect={setSelectedId} />
                                <TreeNode label="Ibu" member={mother} onSelect={setSelectedId} />
                              </div>
                              <div className="flex justify-center gap-10">
                                <TreeNode label="Anggota terpilih" member={selectedMember} onSelect={setSelectedId} />
                                <TreeNode label="Pasangan" member={spouse} onSelect={setSelectedId} />
                              </div>
                              <div className="rounded-3xl border bg-white/70 p-5">
                                <div className="mb-4 text-center text-xs uppercase tracking-wide text-slate-500">Keturunan</div>
                                <DescendantBranch parent={selectedMember} members={members} onSelect={setSelectedId} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="relations">
                    <Card className="rounded-3xl shadow-sm mb-4">
                      <CardHeader>
                        <CardTitle>Edit relasi cepat</CardTitle>
                        <CardDescription>
                          Ubah ayah, ibu, atau pasangan langsung dari tab relasi tanpa membuka form edit lengkap.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Ayah</Label>
                            <Select
                              value={relationDraft.fatherId}
                              onValueChange={(value) =>
                                setRelationDraft((prev) => autoFillRelationDraft({ ...prev, fatherId: value }, members))
                              }
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Pilih ayah" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Belum diisi</SelectItem>
                                {sortByName(members)
                                  .filter((member) => member.id !== selectedMember.id)
                                  .map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ibu</Label>
                            <Select
                              value={relationDraft.motherId}
                              onValueChange={(value) =>
                                setRelationDraft((prev) => autoFillRelationDraft({ ...prev, motherId: value }, members))
                              }
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Pilih ibu" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Belum diisi</SelectItem>
                                {sortByName(members)
                                  .filter((member) => member.id !== selectedMember.id)
                                  .map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Pasangan</Label>
                            <Select
                              value={relationDraft.spouseId}
                              onValueChange={(value) => setRelationDraft((prev) => ({ ...prev, spouseId: value }))}
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Pilih pasangan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Belum diisi</SelectItem>
                                {sortByName(members)
                                  .filter((member) => member.id !== selectedMember.id)
                                  .map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button className="rounded-2xl" onClick={handleSaveRelations}>
                            Simpan relasi
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <RelationCard title="Ayah" member={father} onSelect={setSelectedId} />
                      <RelationCard title="Ibu" member={mother} onSelect={setSelectedId} />
                      <RelationCard title="Pasangan" member={spouse} onSelect={setSelectedId} />
                      <Card className="rounded-2xl">
                        <CardHeader className="pb-3">
                          <CardDescription>Anak berurutan dari yang paling tua</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {children.length ? (
                              children.map((child) => (
                                <button key={child.id} className="w-full text-left" onClick={() => setSelectedId(child.id)}>
                                  <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-slate-50 transition">
                                    <Avatar member={child} size="sm" />
                                    <div className="min-w-0">
                                      <div className="font-medium truncate">{child.name}</div>
                                      <div className="text-xs text-slate-500 truncate">
                                        {[child.gender, child.birthDate ? formatDate(child.birthDate) : "", child.phone || "Tanpa nomor"]
                                          .filter(Boolean)
                                          .join(" • ")}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">Belum diisi</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="rounded-3xl shadow-sm">
                <CardContent className="p-10 text-center text-slate-500">
                  <div className="space-y-4">
                    <div>Belum ada anggota keluarga. Tambahkan anggota pertama untuk memulai.</div>
                    <div className="flex justify-center gap-2">
                      <Button className="rounded-2xl" onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" />Tambah anggota pertama
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-2xl"
                        onClick={() => {
                          setMembers(sortByName(seedMembers));
                          setSelectedId(seedMembers[0]?.id || "");
                        }}
                      >
                        Gunakan data contoh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        members={members}
        errors={formErrors}
        onSave={handleSave}
        editing={Boolean(form.id)}
      />
    </div>
  );
}
