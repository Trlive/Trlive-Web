
import {
  Settings,
  Store,
  UserRound,
  ShieldCheck,
  LockKeyhole,
  Info,
} from "lucide-react";
import PanelShell from "@/components/panel-shell";

export default function DealerSettingsPage() {
  return (
    <PanelShell panel="dealer">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <Settings size={17} />
            Coin Bayisi
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Bayi Ayarları
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Bayi hesabınıza ait bilgileri ve işlem yetkilerini görüntüleyin.
          </p>
        </div>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Store className="text-amber-400" size={22} />
            <h2 className="font-semibold text-white">Bayi Bilgileri</h2>
          </div>

          <div className="mt-5 divide-y divide-zinc-800">
            <InfoRow label="Bayi adı" value="Backend bağlantısı bekleniyor" />
            <InfoRow label="Bayi ID" value="—" />
            <InfoRow label="Bayi sahibi" value="—" />
            <InfoRow label="Hesap durumu" value="Henüz doğrulanmadı" />
          </div>
        </section>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-amber-400" size={22} />
            <h2 className="font-semibold text-white">Bayi Yetkileri</h2>
          </div>

          <div className="mt-5 space-y-3">
            <PermissionRow
              icon={<UserRound size={18} />}
              title="Coin işlemleri"
              description="Yetkilendirilmiş Coin işlemlerini görüntüleme"
            />
            <PermissionRow
              icon={<Store size={18} />}
              title="Bayi işlem geçmişi"
              description="Bayi hesabının işlem kayıtlarını inceleme"
            />
            <PermissionRow
              icon={<LockKeyhole size={18} />}
              title="Bakiye ve işlem güvenliği"
              description="Bakiye ve işlem kontrolleri sunucu üzerinden yapılacak"
            />
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <p className="text-xs leading-6 text-zinc-400">
            Bu ekran mevcut bayi sistemini kullanacaktır.
            Buradan yeni bayi, bakiye veya yetki oluşturulmaz.
            Hesap bilgileri ve işlem izinleri backend üzerinden
            doğrulanmalıdır.
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
