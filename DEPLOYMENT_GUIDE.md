# Kurumsal Indirim Deployment Guide

## English Version

### 1. **Prerequisites**
- Remote server with Docker and Docker Compose installed
- Domain configured: `kurumsalindirim.mfa.gov.tr` (and subdomains)
- Wildcard DNS record: `*.kurumsalindirim.mfa.gov.tr`

### 2. **Setup Traefik Proxy (One-time setup)**

On your remote server:

```bash
# Create directory for Traefik configuration
mkdir -p /root/code/traefik-public/

# Copy the Traefik configuration file to your server
# (You'll need to transfer docker-compose.traefik.yml to your server)

# Create the public network
docker network create traefik-public

# Set environment variables for Traefik
export USERNAME=admin
export PASSWORD=your_secure_password
export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
export DOMAIN=kurumsalindirim.mfa.gov.tr
export EMAIL=your-email@mfa.gov.tr

# Start Traefik
cd /root/code/traefik-public/
docker compose -f docker-compose.traefik.yml up -d
```

### 3. **Prepare Environment Files**

Create your production environment file on the server:

```bash
# Create .env.production file with your values
cat > .env.production << EOF
DOMAIN=kurumsalindirim.mfa.gov.tr
FRONTEND_HOST=https://kurumsalindirim.mfa.gov.tr
ENVIRONMENT=production
PROJECT_NAME='Kurumsal Indirim Production'
STACK_NAME=kurumsal-indirim
BACKEND_CORS_ORIGINS="https://kurumsalindirim.mfa.gov.tr,https://api.kurumsalindirim.mfa.gov.tr"
SECRET_KEY=your-generated-secret-key
FIRST_SUPERUSER=admin@kurumsalindirim.mfa.gov.tr
FIRST_SUPERUSER_PASSWORD=your-secure-password
POSTGRES_SERVER=your-db-host
POSTGRES_DB=kurumsalindirim_prod
POSTGRES_USER=your-db-user
POSTGRES_PASSWORD=your-db-password
KEYCLOAK_URL=https://keycloak.kurumsalindirim.mfa.gov.tr
EOF
```

### 4. **Deploy the Application**

```bash
# Copy your application files to the server
# Then run:
docker compose -f docker-compose.yml --env-file .env.production up -d
```

### 5. **Key URLs After Deployment**

- **Frontend**: `https://kurumsalindirim.mfa.gov.tr`
- **Backend API**: `https://api.kurumsalindirim.mfa.gov.tr`
- **Keycloak**: `https://keycloak.kurumsalindirim.mfa.gov.tr`
- **Traefik Dashboard**: `https://traefik.kurumsalindirim.mfa.gov.tr`

### 6. **Important Notes**

- Your project has been enhanced with Keycloak for authentication
- The project name is "Kurumsal Indirim" instead of the original template name
- Multi-language support (English/Turkish) is implemented
- The main domain is `kurumsalindirim.mfa.gov.tr` (not the original template domain)
- All services are containerized with Docker and orchestrated with Docker Compose

### 7. **Verification Steps**

```bash
# Check if all services are running
docker compose ps

# Check logs
docker compose logs

# Verify specific services
docker compose logs backend
docker compose logs frontend
docker compose logs keycloak
```

---

## Türkçe Sürüm

### 1. **Ön Koşullar**
- Docker ve Docker Compose yüklü uzak sunucu
- Yapılandırılmış alan adı: `kurumsalindirim.mfa.gov.tr` (ve alt alanlar)
- Joker karakter DNS kaydı: `*.kurumsalindirim.mfa.gov.tr`

### 2. **Traefik Proxy Kurulumu (Tek seferlik kurulum)**

Uzak sunucunuzda:

```bash
# Traefik yapılandırması için dizin oluşturun
mkdir -p /root/code/traefik-public/

# Traefik yapılandırma dosyasını sunucunuza kopyalayın
# (docker-compose.traefik.yml dosyasını sunucunuza aktarmanız gerekir)

# Genel ağı oluşturun
docker network create traefik-public

# Traefik için ortam değişkenlerini ayarlayın
export USERNAME=admin
export PASSWORD=guvenli_sifreniz
export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
export DOMAIN=kurumsalindirim.mfa.gov.tr
export EMAIL=emailiniz@mfa.gov.tr

# Traefik'i başlatın
cd /root/code/traefik-public/
docker compose -f docker-compose.traefik.yml up -d
```

### 3. **Ortam Dosyalarını Hazırlama**

Sunucuda üretim ortamı dosyanızı oluşturun:

```bash
# .env.production dosyasını değerlerinizle oluşturun
cat > .env.production << EOF
DOMAIN=kurumsalindirim.mfa.gov.tr
FRONTEND_HOST=https://kurumsalindirim.mfa.gov.tr
ENVIRONMENT=production
PROJECT_NAME='Kurumsal Indirim Production'
STACK_NAME=kurumsal-indirim
BACKEND_CORS_ORIGINS="https://kurumsalindirim.mfa.gov.tr,https://api.kurumsalindirim.mfa.gov.tr"
SECRET_KEY=olusturulan-gizli-anahtar
FIRST_SUPERUSER=admin@kurumsalindirim.mfa.gov.tr
FIRST_SUPERUSER_PASSWORD=guvenli-sifreniz
POSTGRES_SERVER=veritabani-sunucunuz
POSTGRES_DB=kurumsalindirim_prod
POSTGRES_USER=veritabani-kullanici
POSTGRES_PASSWORD=veritabani-sifre
KEYCLOAK_URL=https://keycloak.kurumsalindirim.mfa.gov.tr
EOF
```

### 4. **Uygulamayı Dağıtma**

```bash
# Uygulama dosyalarınızı sunucuya kopyalayın
# Ardından çalıştırın:
docker compose -f docker-compose.yml --env-file .env.production up -d
```

### 5. **Dağıtımdan Sonra Ana URL'ler**

- **Arayüz**: `https://kurumsalindirim.mfa.gov.tr`
- **Arka Uç API**: `https://api.kurumsalindirim.mfa.gov.tr`
- **Keycloak**: `https://keycloak.kurumsalindirim.mfa.gov.tr`
- **Traefik Kontrol Paneli**: `https://traefik.kurumsalindirim.mfa.gov.tr`

### 6. **Önemli Notlar**

- Projeniz kimlik doğrulama için Keycloak ile geliştirilmiştir
- Proje adı orijinal şablon adı yerine "Kurumsal Indirim"'dir
- Çoklu dil desteği (İngilizce/Türkçe) uygulanmıştır
- Ana alan adı `kurumsalindirim.mfa.gov.tr`'dir (orijinal şablon alanı değil)
- Tüm servisler Docker ile konteynerleştirilmiş ve Docker Compose ile yönetilmektedir

### 7. **Doğrulama Adımları**

```bash
# Tüm servislerin çalışıp çalışmadığını kontrol edin
docker compose ps

# Günlükleri kontrol edin
docker compose logs

# Belirli servisleri doğrulayın
docker compose logs backend
docker compose logs frontend
docker compose logs keycloak
```