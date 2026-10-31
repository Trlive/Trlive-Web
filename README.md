# TR Live Web Paneli

Yönetim ve Ajans panelleri. Giriş, **uygulamadaki TR Live hesabıyla** yapılır:

| Panel | Kim girebilir |
|---|---|
| Yönetim Paneli (`/admin/login`) | Yönetici (`admin`) ve yardımcı admin (`support`) hesapları |
| Ajans Paneli (`/agency/login`) | Ajans sahibi ve ajans asistanı hesapları |

Sitede hiçbir şifre saklanmaz; yetki her istekte sunucuda denetlenir. Oturum yalnızca açık tarayıcı sekmesinde tutulur.

## Yayına alma (GitHub Pages)

1. Depoda **Settings → Pages → Source: GitHub Actions** seçin.
2. `main` dalına her yüklemede "Paneli yayınla" iş akışı çalışır ve panel `https://trlive.github.io/Trlive-Web/` adresine çıkar.
3. Sunucu adresi değişirse: **Settings → Secrets and variables → Actions → Variables** bölümüne `API_BASE_URL` ekleyin.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```
