import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";
import { UPDATES } from "@/lib/site-data";

export const Route = createFileRoute("/updates")({
  head: () => ({ meta: [{ title: "Cập nhật ứng dụng — Golden Time" }] }),
  component: UpdatesPage,
});

const TYPE_COLOR: Record<string, string> = {
  "Tính năng mới": "bg-[oklch(0.94_0.16_140)] text-[oklch(0.35_0.15_145)]",
  "Cải tiến": "bg-[oklch(0.94_0.14_85)] text-[oklch(0.4_0.16_70)]",
  "Sửa lỗi": "bg-[oklch(0.94_0.06_30)] text-[oklch(0.4_0.15_30)]",
};

function UpdatesPage() {
  return (
    <SiteShell>
      <Section>
        <SectionHeading
          eyebrow="Changelog"
          title="Cập nhật ứng dụng"
          subtitle="Theo dõi các tính năng mới, cải tiến và bản vá của Golden Time."
        />
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border md:left-1/2" />
          <div className="space-y-10">
            {UPDATES.map((u, idx) => (
              <div key={u.version} className={`relative md:grid md:grid-cols-2 md:gap-10 ${idx % 2 ? "md:[&>*:first-child]:col-start-2" : ""}`}>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 h-3 w-3 rounded-full gt-gradient ring-4 ring-background" />
                <div className="pl-12 md:pl-0 md:pr-10">
                  <div className="bg-white rounded-3xl border border-border p-6 hover:gt-shadow transition-all">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-cream text-primary">v{u.version}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[u.type]}`}>{u.type}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{u.date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-3">{u.title}</h3>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {u.changes.map((c) => (
                        <li key={c} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}