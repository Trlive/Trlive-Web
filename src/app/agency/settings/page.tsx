
import {
  Building2,
  ShieldCheck,
  UserRound,
  LockKeyhole,
  Info,
  Settings,
} from "lucide-react";
import PanelShell from "@/components/panel-shell";

export default function AgencySettingsPage() {
  return (
    <PanelShell panel="agency">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <Settings size={17} />
            Ajans yönetimi
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Ajans Ayarları
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ajans hesabınıza ait bilgileri ve yetki durumunu görüntüleyin.
          </p>
        </div>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Building2 className="text-amber-400" size={22} />
            <h2 className="font-semibold text-white">Ajans Bilgileri</h2>
          </div>

          <div className="mt-5 divide-y divide-zinc-800">
            <InfoRow label="Ajans adı" value="Backend bağlantısı bekleniyor" />
            <InfoRow label="Ajans ID" value="—" />
            <InfoRow label="Ajans sahibi" value="—" />
            <InfoRow label="Hesap durumu" value="Henüz doğrulanmadı" />
          </div>
        </section>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-amber-400" size={22} />
            <h2 className="font-semibold text-white">Ajans Yetkileri</h2>
          </div>

          <div className="mt-5 space-y-3">
            <PermissionRow
              icon={<UserRound size={18} />}
              title="Yayıncı yönetimi"
              description="Ajansa bağlı yayıncıları görüntüleme"
            />
            <PermissionRow
              icon={<Building2 size={18} />}
              title="Ajans ödülleri"
              description="Ajansa tanımlanan WIP ödüllerini görüntüleme"
            />
            <PermissionRow
              icon={<LockKeyhole size={18} />}
              title="WIP gönderim yetkisi"
              description="Yetki ve stok kontrolü sunucu üzerinden yapılacak"
            />
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <p className="text-xs leading-6 text-zinc-400">
            Ajans bilgileri ve yetkiler mevcut TR Live sisteminden
            okunacaktır. Bu sayfa yeni ajans veya yetki oluşturmaz.
            Hesap güvenliği için yetki kontrolleri backend tarafında
            uygulanmalıdır.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function PermissionRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 p-4">
      <div className="text-amber-400">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
