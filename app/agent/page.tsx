"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  ClipboardList,
  Home,
  KeyRound,
  MessageSquare,
  Mic,
  Newspaper,
  TrendingUp,
} from "lucide-react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LeadRow = {
  id: string;
  full_name: string;
  title: string;
  status: string;
  created_at: string;
};

type InquiryRow = {
  id: string;
  message: string;
  created_at: string;
};

type Stats = {
  availableListings: number;
  rentals: number;
  sold: number;
  properties: number;
  newLeads: number;
  inquiries: number;
  news: number;
  podcasts: number;
};

const emptyStats: Stats = {
  availableListings: 0,
  rentals: 0,
  sold: 0,
  properties: 0,
  newLeads: 0,
  inquiries: 0,
  news: 0,
  podcasts: 0,
};

function formatAdminDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

async function safeCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const extra = supabase as unknown as {
          from: (table: string) => {
            select: (
              columns: string,
              options: { count: "exact"; head: true },
            ) => PromiseLike<{ count: number | null; error: { message: string } | null }>;
          };
        };

        const [
          availableListings,
          rentals,
          sold,
          properties,
          newLeads,
          inquiries,
          news,
          podcasts,
          leadsResult,
          inquiriesResult,
        ] = await Promise.all([
          safeCount(
            supabase
              .from("properties")
              .select("*", { count: "exact", head: true })
              .eq("listing_kind", "sale")
              .eq("status", "available"),
          ),
          safeCount(supabase.from("properties").select("*", { count: "exact", head: true }).eq("listing_kind", "rent")),
          safeCount(supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "sold")),
          safeCount(supabase.from("properties").select("*", { count: "exact", head: true })),
          safeCount(supabase.from("listing_leads").select("*", { count: "exact", head: true }).eq("status", "new")),
          safeCount(supabase.from("inquiries").select("*", { count: "exact", head: true })),
          safeCount(extra.from("news_updates").select("*", { count: "exact", head: true })),
          safeCount(extra.from("podcast_videos").select("*", { count: "exact", head: true })),
          supabase
            .from("listing_leads")
            .select("id, full_name, title, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("inquiries").select("id, message, created_at").order("created_at", { ascending: false }).limit(5),
        ]);

        if (cancelled) return;
        setStats({
          availableListings,
          rentals,
          sold,
          properties,
          newLeads,
          inquiries,
          news,
          podcasts,
        });
        setRecentLeads((leadsResult.data as LeadRow[] | null) ?? []);
        setRecentInquiries((inquiriesResult.data as InquiryRow[] | null) ?? []);
        setNotice(null);
      } catch {
        if (!cancelled) {
          setStats(emptyStats);
          setNotice("Connect Supabase to load live listing, lead, and inquiry counts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = [
    { title: "Available Listings", value: stats.availableListings, icon: Building2, tone: "bg-karim-700" },
    { title: "Rentals", value: stats.rentals, icon: KeyRound, tone: "bg-karim-900" },
    { title: "Sold Properties", value: stats.sold, icon: TrendingUp, tone: "bg-black" },
    { title: "Total Properties", value: stats.properties, icon: Home, tone: "bg-karim-800" },
    { title: "New Leads", value: stats.newLeads, icon: ClipboardList, tone: "bg-karim-700" },
    { title: "Inquiries", value: stats.inquiries, icon: MessageSquare, tone: "bg-karim-900" },
    { title: "News Updates", value: stats.news, icon: Newspaper, tone: "bg-black" },
    { title: "Podcast Episodes", value: stats.podcasts, icon: Mic, tone: "bg-karim-800" },
  ];

  const quickActions = [
    { href: "/agent/properties", label: "Manage Properties", icon: Building2, color: "from-karim-600 to-karim-800" },
    { href: "/agent/rentals", label: "Manage Rentals", icon: KeyRound, color: "from-karim-800 to-black" },
    { href: "/agent/listing-leads", label: "View Leads", icon: ClipboardList, color: "from-zinc-800 to-black" },
    { href: "/agent/newsroom-updates", label: "Newsroom Updates", icon: Newspaper, color: "from-karim-700 to-karim-900" },
  ];

  return (
    <div className="space-y-5">
      <AgentPageHeader title="Dashboard" breadcrumb="listing overview" />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-karim-200 border-t-karim-700" />
        </div>
      ) : (
        <>
          {notice ? <p className="mb-4 text-sm text-zinc-500">{notice}</p> : null}

          <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`flex items-center gap-4 px-5 py-6 text-white ${item.tone}`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Icon size={26} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold leading-none">{item.value}</span>
                      <ArrowUp size={16} className="text-white/90" />
                    </div>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    href={action.href}
                    className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-karim-300 hover:shadow-md"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white`}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-zinc-800">{action.label}</span>
                    <ArrowRight size={16} className="text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-karim-700" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">Recent Leads</h2>
                <Link href="/agent/listing-leads" className="text-xs font-medium text-karim-700 hover:underline">
                  View all
                </Link>
              </div>
              {recentLeads.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No leads yet</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{lead.full_name}</p>
                        <p className="text-xs text-zinc-500">{lead.title || "Listing request"}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          lead.status === "new" ? "bg-karim-100 text-karim-900" : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">Recent Inquiries</h2>
              </div>
              {recentInquiries.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No inquiries yet</p>
              ) : (
                <div className="space-y-3">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{inquiry.message}</p>
                      <span className="shrink-0 text-[10px] text-zinc-400">{formatAdminDate(inquiry.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
