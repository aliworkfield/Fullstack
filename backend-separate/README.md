# Kurumsal Indirim Backend

This is the backend component of the Kurumsal Indirim application, containing the FastAPI server and all backend logic.

## Project Structure

```
backend/
├── app/                    # Main application code
│   ├── api/               # API routes
│   ├── core/              # Core utilities and configuration
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   └── routers/           # API routers
├── scripts/               # Deployment scripts
├── tests/                 # Test files
├── Dockerfile             # Docker configuration
├── Dockerfile.prod        # Production Docker configuration
├── pyproject.toml         # Python dependencies
└── alembic.ini            # Database migration config
```

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Domain Configuration
DOMAIN=your-domain.com
FRONTEND_HOST=https://your-domain.com
ENVIRONMENT=production

# Security
SECRET_KEY=your-super-secret-key
FIRST_SUPERUSER=admin@your-domain.com
FIRST_SUPERUSER_PASSWORD=your-admin-password

# External Database Configuration
EXTERNAL_POSTGRES_SERVER=your-postgres-host.com
EXTERNAL_POSTGRES_PORT=5432
EXTERNAL_POSTGRES_DB=your_database_name
EXTERNAL_POSTGRES_USER=your_db_user
EXTERNAL_POSTGRES_PASSWORD=your_secure_password

# Email Configuration
SMTP_HOST=your-smtp-server.com
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=your-smtp-password
EMAILS_FROM_EMAIL=noreply@your-domain.com

# External Keycloak Configuration
EXTERNAL_KEYCLOAK_URL=https://keycloak.your-domain.com
EXTERNAL_KEYCLOAK_REALM=your-realm
EXTERNAL_KEYCLOAK_CLIENT_ID=your-backend-client-id
EXTERNAL_KEYCLOAK_CLIENT_SECRET=your-client-secret
EXTERNAL_KEYCLOAK_FRONTEND_CLIENT_ID=your-frontend-client-id

# Docker Configuration
DOCKER_IMAGE_BACKEND=your-registry/backend
TAG=latest
```

## Build and Run

### Using Docker (Recommended)

```bash
# Build the image
docker build -f Dockerfile.prod -t kurumsal-indirim-backend:production .

# Run with external services
docker run -d --env-file .env \
  -e EXTERNAL_POSTGRES_SERVER=$EXTERNAL_POSTGRES_SERVER \
  -e EXTERNAL_POSTGRES_USER=$EXTERNAL_POSTGRES_USER \
  -e EXTERNAL_POSTGRES_PASSWORD=$EXTERNAL_POSTGRES_PASSWORD \
  -e EXTERNAL_POSTGRES_DB=$EXTERNAL_POSTGRES_DB \
  -e EXTERNAL_KEYCLOAK_URL=$EXTERNAL_KEYCLOAK_URL \
  -p 8000:8000 \
  kurumsal-indirim-backend:production
```

### Using Docker Compose

```bash
# Run with external services
docker-compose -f production-external-services.yml up -d
```

## Endpoints

- Health Check: `GET /api/v1/utils/health-check/`
- API Documentation: `GET /docs`
- API Redoc: `GET /redoc`

## Deployment

For production deployment, use the production Dockerfile and ensure all environment variables are properly configured for your external services.

---

## Turkish Translation

# Kurumsal İndirim Arka Uç

Bu, Kurumsal İndirim uygulamasının arka uç bileşenidir ve FastAPI sunucusunu ve tüm arka uç mantığını içerir.

## Proje Yapısı

```
backend/
├── app/                    # Ana uygulama kodu
│   ├── api/               # API rotaları
│   ├── core/              # Çekirdek yardımcı programlar ve yapılandırma
│   ├── models/            # Veritabanı modelleri
│   ├── schemas/           # Pydantic şemaları
│   ├── services/          # İş mantığı
│   └── routers/           # API yönlendiricileri
├── scripts/               # Dağıtım betikleri
├── tests/                 # Test dosyaları
├── Dockerfile             # Docker yapılandırması
├── Dockerfile.prod        # Üretim Docker yapılandırması
├── pyproject.toml         # Python bağımlılıkları
└── alembic.ini            # Veritabanı geçiş yapılandırması
```

## Ortam Değişkenleri

Aşağıdaki değişkenlerle bir `.env` dosyası oluşturun:

```bash
# Alan Adı Yapılandırması
DOMAIN=alaniniz.com
FRONTEND_HOST=https://alaniniz.com
ENVIRONMENT=production

# Güvenlik
SECRET_KEY=çok-gizli-anahtariniz
FIRST_SUPERUSER=admin@alaniniz.com
FIRST_SUPERUSER_PASSWORD=yönetici-parolaniz

# Harici Veritabanı Yapılandırması
EXTERNAL_POSTGRES_SERVER=veritabani-sunucunuz.com
EXTERNAL_POSTGRES_PORT=5432
EXTERNAL_POSTGRES_DB=veritabani_adiniz
EXTERNAL_POSTGRES_USER=veritabani_kullanici
EXTERNAL_POSTGRES_PASSWORD=güvenli_veritabani_parolaniz

# E-posta Yapılandırması
SMTP_HOST=smtp-sunucunuz.com
SMTP_USER=noreply@alaniniz.com
SMTP_PASSWORD=smtp-parolaniz
EMAILS_FROM_EMAIL=noreply@alaniniz.com

# Harici Keycloak Yapılandırması
EXTERNAL_KEYCLOAK_URL=https://keycloak.alaniniz.com
EXTERNAL_KEYCLOAK_REALM=alaniniz
EXTERNAL_KEYCLOAK_CLIENT_ID=arka-uc-istemci-id
EXTERNAL_KEYCLOAK_CLIENT_SECRET=istemci-gizli-kodunuz
EXTERNAL_KEYCLOAK_FRONTEND_CLIENT_ID=ön-yüz-istemci-id

# Docker Yapılandırması
DOCKER_IMAGE_BACKEND=kayıtmerkeziniz/arka-uc
TAG=latest
```

## Derleme ve Çalıştırma

### Docker Kullanarak (Önerilen)

```bash
# Görüntüyü derleyin
docker build -f Dockerfile.prod -t kurumsal-indirim-arka-uc:production .

# Harici servislerle çalıştırın
docker run -d --env-file .env \
  -e EXTERNAL_POSTGRES_SERVER=$EXTERNAL_POSTGRES_SERVER \
  -e EXTERNAL_POSTGRES_USER=$EXTERNAL_POSTGRES_USER \
  -e EXTERNAL_POSTGRES_PASSWORD=$EXTERNAL_POSTGRES_PASSWORD \
  -e EXTERNAL_POSTGRES_DB=$EXTERNAL_POSTGRES_DB \
  -e EXTERNAL_KEYCLOAK_URL=$EXTERNAL_KEYCLOAK_URL \
  -p 8000:8000 \
  kurumsal-indirim-arka-uc:production
```

### Docker Compose Kullanarak

```bash
# Harici servislerle çalıştırın
docker-compose -f production-external-services.yml up -d
```

## Uç Noktalar

- Sağlık Kontrolü: `GET /api/v1/utils/health-check/`
- API Belgeleri: `GET /docs`
- API Redoc: `GET /redoc`

## Dağıtım

Üretim dağıtımında üretim Dockerfile'ını kullanın ve tüm ortam değişkenlerinin harici servisleriniz için doğru şekilde yapılandırıldığından emin olun.