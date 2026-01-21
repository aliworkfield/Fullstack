# Kurumsal Indirim Frontend

This is the frontend component of the Kurumsal Indirim application, containing the React UI and all frontend logic.

## Project Structure

```
frontend/
├── src/                    # Source code
│   ├── auth/              # Authentication components
│   ├── client/            # API client
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── routes/            # Route definitions
│   ├── services/          # Frontend services
│   └── utils/             # Utility functions
├── public/                # Static assets
├── dist/                  # Build output (generated)
├── Dockerfile             # Docker configuration
├── Dockerfile.prod        # Production Docker configuration
├── package.json           # Node.js dependencies
├── vite.config.ts         # Build configuration
├── tsconfig.json          # TypeScript configuration
├── nginx.conf             # NGINX configuration
└── nginx-backend-not-found.conf  # NGINX error handling
```

## Environment Variables

The frontend uses the following environment variables (typically set during build):

```bash
# API URL
VITE_API_URL=https://api.your-domain.com
```

## Build and Run

### Using Docker (Recommended)

```bash
# Build the image
docker build -f Dockerfile.prod -t kurumsal-indirim-frontend:production .

# Run the container
docker run -d -p 80:80 -e VITE_API_URL=https://api.your-domain.com kurumsal-indirim-frontend:production
```

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export VITE_API_URL=https://api.your-domain.com

# Run development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build
```

## Deployment

The frontend is designed to be deployed as a static site served by NGINX. When deployed, it communicates with the backend API using the `VITE_API_URL` environment variable.

For production deployment, use the production Dockerfile which creates an optimized image with NGINX serving the built assets.

---

## Turkish Translation

# Kurumsal İndirim Önyüz

Bu, Kurumsal İndirim uygulamasının önyüz bileşenidir ve React arayüzünü ve tüm önyüz mantığını içerir.

## Proje Yapısı

```
frontend/
├── src/                    # Kaynak kodu
│   ├── auth/              # Kimlik doğrulama bileşenleri
│   ├── client/            # API istemcisi
│   ├── components/        # React bileşenleri
│   ├── hooks/             # Özel React kancaları
│   ├── routes/            # Rota tanımlamaları
│   ├── services/          # Önyüz servisleri
│   └── utils/             # Yardımcı fonksiyonlar
├── public/                # Statik varlıklar
├── dist/                  # Derleme çıktısı (oluşturulan)
├── Dockerfile             # Docker yapılandırması
├── Dockerfile.prod        # Üretim Docker yapılandırması
├── package.json           # Node.js bağımlılıkları
├── vite.config.ts         # Derleme yapılandırması
├── tsconfig.json          # TypeScript yapılandırması
├── nginx.conf             # NGINX yapılandırması
└── nginx-backend-not-found.conf  # NGINX hata işleme
```

## Ortam Değişkenleri

Önyüz aşağıdaki ortam değişkenlerini kullanır (genellikle derleme sırasında ayarlanır):

```bash
# API URL'si
VITE_API_URL=https://api.alaniniz.com
```

## Derleme ve Çalıştırma

### Docker Kullanarak (Önerilen)

```bash
# Görüntüyü derleyin
docker build -f Dockerfile.prod -t kurumsal-indirim-önyüz:production .

# Konteyneri çalıştırın
docker run -d -p 80:80 -e VITE_API_URL=https://api.alaniniz.com kurumsal-indirim-önyüz:production
```

### Yerel Geliştirme

```bash
# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın
export VITE_API_URL=https://api.alaniniz.com

# Geliştirme sunucusunu çalıştırın
npm run dev
```

### Üretim Derlemesi

```bash
# Üretim için derleyin
npm run build
```

## Dağıtım

Önyüz, NGINX tarafından sunulan statik bir site olarak dağıtılması için tasarlanmıştır. Dağıtıldığında, `VITE_API_URL` ortam değişkenini kullanarak arka uç API'siyle iletişim kurar.

Üretim dağıtımında, derlenmiş varlıkları sunan optimize edilmiş bir görüntü oluşturan üretim Dockerfile'ını kullanın.