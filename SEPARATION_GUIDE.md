# Separation Guide: Backend, Frontend, and Database Deployment

This document explains how to deploy the Kurumsal Indirim application with separated backend, frontend, and database components.

## Overview

The application has been separated into three independent deployable components:
- **Backend**: FastAPI application running on port 8000
- **Frontend**: React application served via NGINX
- **Database**: PostgreSQL database for data persistence
- **Authentication**: Keycloak for user management

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured in `.env` file
- Access to hosting platform (cloud provider, Kubernetes cluster, or server)

## Environment Configuration

First, ensure your `.env` file contains all necessary variables:

```bash
# Domain Configuration
DOMAIN=your-domain.com
FRONTEND_HOST=https://your-domain.com
ENVIRONMENT=production

# Project Configuration
PROJECT_NAME='Kurumsal Indirim'
STACK_NAME=kurumsal-indirim

# Security - Change these values for production!
SECRET_KEY=your-super-secret-key-here
FIRST_SUPERUSER=admin@your-domain.com
FIRST_SUPERUSER_PASSWORD=your-secure-admin-password

# Database Configuration
POSTGRES_SERVER=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=your_database_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# Email Configuration
SMTP_HOST=your-smtp-server.com
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=your-smtp-password
EMAILS_FROM_EMAIL=noreply@your-domain.com
SMTP_TLS=True
SMTP_SSL=False
SMTP_PORT=587

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.your-domain.com
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-backend-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_FRONTEND_CLIENT_ID=your-frontend-client-id

# Docker Image Configuration
DOCKER_IMAGE_BACKEND=your-registry/backend
DOCKER_IMAGE_FRONTEND=your-registry/frontend
TAG=latest
```

## Deployment Options

### Option 1: Separate Docker Compose Files (Recommended for staging/development)

#### 1. Deploy Database First

```bash
cd db
docker-compose -f docker-compose.db.yml up -d
```

Wait for the database to be healthy before proceeding:
```bash
docker-compose -f docker-compose.db.yml ps
```

#### 2. Deploy Backend

```bash
cd ../backend
docker-compose -f docker-compose.backend.yml up -d
```

#### 3. Deploy Frontend

```bash
cd ../frontend
docker-compose -f docker-compose.frontend.yml up -d
```

### Option 2: Cloud Provider Deployment (Production)

#### Backend Deployment to Cloud

For AWS ECS/Fargate:
1. Build and push the backend image to ECR
2. Create ECS service with the backend image
3. Configure security groups to allow traffic on port 8000
4. Set up load balancer to route `/api/*` requests to the backend

For Google Cloud Run:
1. Build and push the backend image to Container Registry
2. Deploy to Cloud Run with proper environment variables
3. Configure IAM and networking

#### Frontend Deployment to Cloud

For AWS S3 + CloudFront:
1. Build the frontend: `npm run build`
2. Upload static assets to S3 bucket
3. Configure CloudFront distribution with origin pointing to S3
4. Set up SSL certificate and domain

For Netlify/Vercel:
1. Connect your repository to the platform
2. Configure build settings
3. Deploy

#### Database Deployment to Cloud

Choose one of the following managed database services:
- AWS RDS PostgreSQL
- Google Cloud SQL for PostgreSQL
- Azure Database for PostgreSQL
- DigitalOcean Managed Databases

Configure:
- Connection pooling
- Backups
- Monitoring
- Security groups/firewall rules

### Option 3: Kubernetes Deployment (Production)

Create separate deployments for each component:

#### 1. Database Deployment

Apply the database configuration:
```bash
kubectl apply -f k8s/database-deployment.yml
```

#### 2. Backend Deployment

Apply the backend configuration:
```bash
kubectl apply -f k8s/backend-deployment.yml
```

#### 3. Frontend Deployment

Apply the frontend configuration:
```bash
kubectl apply -f k8s/frontend-deployment.yml
```

#### 4. Ingress Configuration

Apply the ingress rules:
```bash
kubectl apply -f k8s/ingress.yml
```

## Health Checks

### Backend Health Check
- Endpoint: `GET /api/v1/utils/health-check/`
- Expected response: `{"status": "ok"}`

### Frontend Health Check
- Endpoint: `GET /`
- Expected response: 200 OK with HTML content

### Database Health Check
- Use PostgreSQL client to connect to the database
- Execute: `SELECT 1;`

## Monitoring and Logging

### Backend
- Application logs: Standard output
- Error tracking: Sentry (if configured)
- Performance: Built-in metrics endpoint

### Frontend
- Client-side errors: Console logs
- User interactions: Analytics (if configured)
- Performance: Browser DevTools

### Database
- Query performance: PostgreSQL logs
- Connection pooling: Monitor active connections
- Storage: Disk space monitoring

## Security Considerations

### Backend Security
- Use HTTPS for all API calls
- Validate and sanitize all inputs
- Implement rate limiting
- Use secure headers

### Frontend Security
- Content Security Policy (CSP) headers
- XSS protection
- Secure cookies if applicable
- Input validation on the client side

### Database Security
- Encrypt data in transit and at rest
- Regular security patches
- Access control and authentication
- Network isolation

## Scaling Strategies

### Horizontal Scaling
- Backend: Add more instances behind a load balancer
- Frontend: CDN distribution for static assets
- Database: Read replicas for read-heavy workloads

### Vertical Scaling
- Increase CPU/memory allocation for services
- Upgrade database instance size
- Optimize application code for efficiency

## Backup and Recovery

### Database Backup
- Automated daily backups
- Point-in-time recovery capability
- Off-site backup storage

### Application Backup
- Version control for application code
- Infrastructure as Code (IaC) for reproducible deployments
- Configuration backup

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check if database service is running
   - Verify connection string and credentials
   - Ensure network connectivity between services

2. **Environment Variables Not Loaded**
   - Confirm .env file exists and has correct permissions
   - Check that variables are properly formatted
   - Verify Docker Compose file references the correct env file

3. **Health Check Failures**
   - Check application logs for errors
   - Verify dependencies are available
   - Confirm ports are correctly mapped

4. **Frontend Cannot Reach Backend API**
   - Check CORS configuration
   - Verify API URL is correctly set
   - Ensure backend is accessible from frontend

## Migration Process

If migrating from existing deployment:

1. **Backup Current System**
   - Export database
   - Document current configuration

2. **Prepare New Infrastructure**
   - Set up separated services
   - Configure networking

3. **Data Migration**
   - Import database to new location
   - Verify data integrity

4. **DNS Update**
   - Update DNS records to point to new infrastructure
   - Monitor for any routing issues

5. **Monitoring Setup**
   - Configure alerts for each component
   - Set up logging aggregation

## Best Practices

1. **Infrastructure as Code**
   - Store deployment configurations in version control
   - Use templates for consistent deployments

2. **Automated Testing**
   - Implement CI/CD pipeline
   - Run tests before deployment

3. **Monitoring and Alerting**
   - Set up proactive monitoring
   - Define SLAs and alert thresholds

4. **Security**
   - Regular security audits
   - Vulnerability scanning
   - Access controls and permissions

---

## Turkish Translation

# Ayrıştırma Kılavuzu: Arka Uç, Önyüz ve Veritabanı Dağıtımı

Bu belge, Kurumsal İndirim uygulamasının ayrılmış arka uç, önyüz ve veritabanı bileşenleriyle nasıl dağıtılacağını açıklar.

## Genel Bakış

Uygulama üç bağımsız dağıtılabilir bileşene ayrılmıştır:
- **Arka Uç**: 8000 numaralı bağlantı noktasında çalışan FastAPI uygulaması
- **Önyüz**: NGINX ile sunulan React uygulaması
- **Veritabanı**: Veri kalıcılığı için PostgreSQL veritabanı
- **Kimlik Doğrulama**: Kullanıcı yönetimi için Keycloak

## Ön Koşullar

- Docker ve Docker Compose yüklü olmalı
- Ortam değişkenleri `.env` dosyasında yapılandırılmış olmalı
- Barındırma platformuna erişim (bulut sağlayıcısı, Kubernetes kümesi veya sunucu)

## Ortam Yapılandırması

Öncelikle `.env` dosyanızın tüm gerekli değişkenleri içerdiğinden emin olun:

```bash
# Alan Adı Yapılandırması
DOMAIN=sizin-alaniniz.com
FRONTEND_HOST=https://sizin-alaniniz.com
ENVIRONMENT=production

# Proje Yapılandırması
PROJECT_NAME='Kurumsal İndirim'
STACK_NAME=kurumsal-indirim

# Güvenlik - Üretim için bu değerleri değiştirin!
SECRET_KEY=çok-gizli-anahtarınız-burada
FIRST_SUPERUSER=admin@sizin-alaniniz.com
FIRST_SUPERUSER_PASSWORD=güvenli-yönetici-parolanız

# Veritabanı Yapılandırması
POSTGRES_SERVER=veritabani-sunucunuz
POSTGRES_PORT=5432
POSTGRES_DB=veritabani_adiniz
POSTGRES_USER=veritabani_kullanici
POSTGRES_PASSWORD=güvenli_parolaniz

# E-posta Yapılandırması
SMTP_HOST=smtp-sunucunuz.com
SMTP_USER=noreply@sizin-alaniniz.com
SMTP_PASSWORD=smtp-parolaniz
EMAILS_FROM_EMAIL=noreply@sizin-alaniniz.com
SMTP_TLS=True
SMTP_SSL=False
SMTP_PORT=587

# Keycloak Yapılandırması
KEYCLOAK_URL=https://keycloak.sizin-alaniniz.com
KEYCLOAK_REALM=gercek-alaniniz
KEYCLOAK_CLIENT_ID=arka-uc-istemci-id
KEYCLOAK_CLIENT_SECRET=istemci-gizli-kodunuz
KEYCLOAK_FRONTEND_CLIENT_ID=ön-yüz-istemci-id

# Docker Görüntüsü Yapılandırması
DOCKER_IMAGE_BACKEND=kayıtlı_alaniniz/arka-uc
DOCKER_IMAGE_FRONTEND=kayıtlı_alaniniz/ön-yüz
TAG=latest
```

## Dağıtım Seçenekleri

### Seçenek 1: Ayrı Docker Compose Dosyaları (Hazırlık/geliştirme için önerilir)

#### 1. Öncelikle Veritabanını Dağıtın

```bash
cd db
docker-compose -f docker-compose.db.yml up -d
```

Devam etmeden önce veritabanının sağlıklı olduğundan emin olun:
```bash
docker-compose -f docker-compose.db.yml ps
```

#### 2. Arka Ucu Dağıtın

```bash
cd ../backend
docker-compose -f docker-compose.backend.yml up -d
```

#### 3. Önyüzü Dağıtın

```bash
cd ../frontend
docker-compose -f docker-compose.frontend.yml up -d
```

### Seçenek 2: Bulut Sağlayıcı Dağıtımı (Üretim için)

#### Arka Ucu Buluta Dağıtmak

AWS ECS/Fargate için:
1. Arka uç görüntüsünü ECR'ye oluşturun ve gönderin
2. ECS servisini arka uç görüntüsüyle oluşturun
3. 8000 numaralı bağlantı noktasında trafiğe izin verecek güvenlik gruplarını yapılandırın
4. Yük dengeleyiciyi `/api/*` isteklerini arka uca yönlendirecek şekilde ayarlayın

Google Cloud Run için:
1. Arka uç görüntüsünü Container Registry'e oluşturun ve gönderin
2. Uygun ortam değişkenleriyle Cloud Run'a dağıtın
3. IAM ve ağ yapılandırmasını yapın

#### Önyüzü Buluta Dağıtmak

AWS S3 + CloudFront için:
1. Önyüzü oluşturun: `npm run build`
2. Statik varlıkları S3 bucket'ına yükleyin
3. CloudFront dağıtımını S3'ü hedef alacak şekilde yapılandırın
4. SSL sertifikası ve alan adını ayarlayın

Netlify/Vercel için:
1. Depoya platformla bağlantıyı kurun
2. Derleme ayarlarını yapılandırın
3. Dağıtın

#### Veritabanını Buluta Dağıtmak

Aşağıdaki yönetilen veritabanı hizmetlerinden birini seçin:
- AWS RDS PostgreSQL
- Google Cloud SQL for PostgreSQL
- Azure Database for PostgreSQL
- DigitalOcean Managed Databases

Yapılandırın:
- Bağlantı havuzu
- Yedeklemeler
- İzleme
- Güvenlik grupları/güvenlik duvarı kuralları

### Seçenek 3: Kubernetes Dağıtımı (Üretim için)

Her bileşen için ayrı dağıtımlar oluşturun:

#### 1. Veritabanı Dağıtımı

Veritabanı yapılandırmasını uygulayın:
```bash
kubectl apply -f k8s/database-deployment.yml
```

#### 2. Arka Uç Dağıtımı

Arka uç yapılandırmasını uygulayın:
```bash
kubectl apply -f k8s/backend-deployment.yml
```

#### 3. Önyüz Dağıtımı

Önyüz yapılandırmasını uygulayın:
```bash
kubectl apply -f k8s/frontend-deployment.yml
```

#### 4. Giriş (Ingress) Yapılandırması

Giriş kurallarını uygulayın:
```bash
kubectl apply -f k8s/ingress.yml
```

## Sağlık Kontrolleri

### Arka Uç Sağlık Kontrolü
- Uç Nokta: `GET /api/v1/utils/health-check/`
- Beklenen yanıt: `{"durum": "tamam"}`

### Önyüz Sağlık Kontrolü
- Uç Nokta: `GET /`
- Beklenen yanıt: 200 OK ile HTML içeriği

### Veritabanı Sağlık Kontrolü
- PostgreSQL istemcisiyle veritabanına bağlanın
- Çalıştırın: `SELECT 1;`

## İzleme ve Günlük Kaydı

### Arka Uç
- Uygulama günlükleri: Standart çıktı
- Hata takibi: Sentry (yapılandırılmışsa)
- Performans: Dahili metrik uç noktası

### Önyüz
- Tarayıcı tarafı hataları: Konsol günlükleri
- Kullanıcı etkileşimleri: Analitik (yapılandırılmışsa)
- Performans: Tarayıcı Geliştirici Araçları

### Veritabanı
- Sorgu performansı: PostgreSQL günlükleri
- Bağlantı havuzu: Aktif bağlantıları izleyin
- Depolama: Disk alanı izleme

## Güvenlik Hususları

### Arka Uç Güvenliği
- Tüm API çağrıları için HTTPS kullanın
- Tüm girişleri doğrulayın ve temizleyin
- Oran sınırlama uygulayın
- Güvenli başlıklar kullanın

### Önyüz Güvenliği
- İçerik Güvenlik Politikası (CSP) başlıkları
- XSS koruma
- Güvenli çerezler (uygulanabilirse)
- İstemci tarafında giriş doğrulama

### Veritabanı Güvenliği
- Aktarma ve depolama sırasında verileri şifreleyin
- Düzenli güvenlik yamaları
- Erişim kontrolü ve kimlik doğrulama
- Ağ yalıtımı

## Ölçekleme Stratejileri

### Yatay Ölçekleme
- Arka Uç: Yük dengeleyicinin arkasına daha fazla örnek ekleyin
- Önyüz: Statik varlıklar için CDN dağıtımı
- Veritabanı: Okumaya dayalı iş yükleri için salt okunur kopyalar

### Dikey Ölçekleme
- Hizmetler için CPU/bellek tahsisi artırın
- Veritabanı örneği boyutunu yükseltin
- Verimlilik için uygulama kodunu optimize edin

## Yedekleme ve Kurtarma

### Veritabanı Yedekleme
- Otomatik günlük yedeklemeler
- Zaman noktası kurtarma yeteneği
- Yerleşim dışı yedekleme depolama

### Uygulama Yedekleme
- Sürüm kontrolü için uygulama kodu
- Yeniden üretilebilir dağıtımlar için Altyapı Olarak Kod (IaC)
- Yapılandırma yedekleme

## Sorun Giderme

### Yaygın Sorunlar

1. **Veritabanı Bağlantı Sorunları**
   - Veritabanı servisinin çalışıp çalışmadığını kontrol edin
   - Bağlantı dizesi ve kimlik bilgilerini doğrulayın
   - Hizmetler arasında ağ bağlantısını sağlayın

2. **Ortam Değişkenleri Yüklenmiyor**
   - .env dosyasının var olduğunu ve doğru izinlere sahip olduğunu kontrol edin
   - Değişkenlerin düzgün biçimlendirildiğini doğrulayın
   - Docker Compose dosyasının doğru env dosyasını başvurduğunu kontrol edin

3. **Sağlık Kontrolü Başarısızlıkları**
   - Hata için uygulama günlüklerini kontrol edin
   - Bağımlılıkların mevcut olup olmadığını doğrulayın
   - Portların doğru eşlendiğini onaylayın

4. **Önyüz Arka Uç API'sine Ulaşamıyor**
   - CORS yapılandırmasını kontrol edin
   - API URL'sinin doğru ayarlandığını doğrulayın
   - Arka ucun önyüzden erişilebilir olduğunu sağlayın

## Geçiş Süreci

Mevcut dağıtımdan geçiş yapılıyorsa:

1. **Mevcut Sistemi Yedekleyin**
   - Veritabanını dışa aktarın
   - Mevcut yapılandırmayı belgeleyin

2. **Yeni Altyapıyı Hazırlayın**
   - Ayrılmış hizmetleri kurun
   - Ağ yapılandırmasını yapın

3. **Veri Geçişi**
   - Veritabanını yeni konuma aktarın
   - Veri bütünlüğünü doğrulayın

4. **DNS Güncellemesi**
   - DNS kayıtlarını yeni altyapıyı işaret edecek şekilde güncelleyin
   - Yönlendirme sorunlarını izleyin

5. **İzleme Kurulumu**
   - Her bileşen için uyarıları yapılandırın
   - Günlük toplama ayarlayın

## En İyi Uygulamalar

1. **Altyapı Olarak Kod**
   - Dağıtım yapılandırmalarını sürüm kontrolünde saklayın
   - Tutarlı dağıtımlar için şablonlar kullanın

2. **Otomatik Test**
   - CI/CD boru hattı uygulayın
   - Dağıtımdan önce testleri çalıştırın

3. **İzleme ve Uyarı**
   - Proaktif izleme kurun
   - SLA'ları ve uyarı eşiğini tanımlayın

4. **Güvenlik**
   - Düzenli güvenlik denetimleri
   - Açıklık taraması
   - Erişim kontrolleri ve izinler