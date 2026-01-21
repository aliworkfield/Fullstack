# Production Build Instructions

This document explains how to build and deploy your application for production using the separated components.

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured in `.env` file
- Access to a container registry (optional but recommended for production)

## Environment Configuration

Make sure your `.env` file contains all necessary production variables:

```bash
# Production Environment Configuration
DOMAIN=your-domain.com
FRONTEND_HOST=https://your-domain.com
ENVIRONMENT=production

# Project Configuration
PROJECT_NAME='Kurumsal Indirim Production'
STACK_NAME=kurumsal-indirim

# Backend CORS - Update for production domains
BACKEND_CORS_ORIGINS="https://your-domain.com,https://api.your-domain.com"

# Security - CHANGE THESE VALUES FOR PRODUCTION!
SECRET_KEY=your-very-secure-production-key-here
FIRST_SUPERUSER=your-admin-email@domain.com
FIRST_SUPERUSER_PASSWORD=your-very-secure-admin-password

# Database Configuration
POSTGRES_SERVER=your-production-db-host
POSTGRES_PORT=5432
POSTGRES_DB=your_production_db
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your-secure-db-password

# Email Configuration
SMTP_HOST=your-smtp-server.com
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=your-smtp-password
EMAILS_FROM_EMAIL=noreply@your-domain.com

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.your-domain.com
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-backend-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_FRONTEND_CLIENT_ID=your-frontend-client-id

# Docker Image Configuration (for production registry)
DOCKER_IMAGE_BACKEND=your-registry/kurumsal-indirim-backend
DOCKER_IMAGE_FRONTEND=your-registry/kurumsal-indirim-frontend
TAG=latest
```

## Building for Production

### 1. Build Backend Image

```bash
cd backend
docker build -f Dockerfile.prod -t kurumsal-indirim-backend:production .
```

If using a container registry:

```bash
cd backend
docker build -f Dockerfile.prod -t your-registry/kurumsal-indirim-backend:latest .
docker push your-registry/kurumsal-indirim-backend:latest
```

### 2. Build Frontend Image

```bash
cd ../frontend
docker build -f Dockerfile.prod -t kurumsal-indirim-frontend:production .
```

If using a container registry:

```bash
cd ../frontend
docker build -f Dockerfile.prod -t your-registry/kurumsal-indirim-frontend:latest .
docker push your-registry/kurumsal-indirim-frontend:latest
```

### 3. Deploy Using Production Compose File

```bash
# Deploy all services
docker-compose -f production-docker-compose.yml up -d

# Or deploy with specific environment
DOMAIN=your-domain.com docker-compose -f production-docker-compose.yml up -d
```

## Alternative: Build and Deploy Everything at Once

You can also use the build script to automate the process:

```bash
# Make the script executable (Linux/Mac)
chmod +x build-and-deploy.sh

# Run the build and deployment
./build-and-deploy.sh
```

## Production Deployment with External Services

When you need to connect to external PostgreSQL and Keycloak services:

1. Update the `.env.external` file with your external service details
2. Use the external services compose file:

```bash
# Deploy with external services
DOMAIN=your-domain.com docker-compose -f production-external-services.yml up -d
```

## Production Deployment Options

### Option 1: Self-Hosted Server

1. SSH into your production server
2. Copy your code and configuration files
3. Build the images using the commands above
4. Run `docker-compose -f production-docker-compose.yml up -d`

### Option 2: Cloud Platform (AWS, GCP, Azure)

1. Push images to cloud container registry
2. Use cloud deployment services (ECS, GKE, AKS)
3. Configure load balancers and SSL certificates

### Option 3: Kubernetes

1. Convert the compose file to Kubernetes manifests
2. Deploy to your Kubernetes cluster
3. Configure ingress controllers and SSL termination

## Security Considerations

### Image Security
- Scan images for vulnerabilities
- Use minimal base images
- Run containers as non-root users
- Keep images updated

### Network Security
- Use private networks between services
- Limit exposed ports
- Configure firewalls appropriately
- Use SSL/TLS for all communications

### Secrets Management
- Never hardcode secrets in images
- Use environment variables or secret management systems
- Rotate secrets regularly
- Limit access to sensitive data

## Monitoring and Maintenance

### Health Checks
- Monitor service health endpoints
- Set up alerts for failed health checks
- Log application and system metrics

### Backup Strategy
- Regular database backups
- Version control for configuration files
- Disaster recovery plan

### Updates
- Blue-green deployment strategy
- Rolling updates for zero downtime
- Automated testing before deployment

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check logs: `docker-compose -f production-docker-compose.yml logs -f`
   - Verify environment variables are set correctly
   - Ensure database is accessible

2. **SSL/HTTPS issues**
   - Verify SSL certificates are properly mounted
   - Check nginx configuration
   - Confirm domain DNS settings

3. **Performance problems**
   - Monitor resource usage
   - Adjust worker counts in backend
   - Consider adding caching with Redis

## Best Practices

1. **Environment Consistency**
   - Use the same base images in dev, staging, and production
   - Maintain similar configurations across environments
   - Test deployments in staging before production

2. **Security**
   - Regularly update dependencies
   - Use secrets management
   - Implement proper authentication and authorization

3. **Reliability**
   - Implement proper health checks
   - Use restart policies
   - Plan for disaster recovery

---

## Turkish Translation

# Üretim Derleme Talimatları

Bu belge, ayrılmış bileşenleri kullanarak uygulamanızı üretim için nasıl derleyip dağıtabileceğinizi açıklar.

## Ön Koşullar

- Docker ve Docker Compose yüklü olmalı
- Ortam değişkenleri `.env` dosyasında yapılandırılmış olmalı
- Konteyner kayıt merkezine erişim (isteğe bağlı ancak üretim için önerilir)

## Ortam Yapılandırması

`.env` dosyanızın tüm gerekli üretim değişkenlerini içerdiğinden emin olun:

```bash
# Üretim Ortamı Yapılandırması
DOMAIN=sizin-alaniniz.com
FRONTEND_HOST=https://sizin-alaniniz.com
ENVIRONMENT=production

# Proje Yapılandırması
PROJECT_NAME='Kurumsal İndirim Üretim'
STACK_NAME=kurumsal-indirim

# Arka Uç CORS - Üretim alan adları için güncelleyin
BACKEND_CORS_ORIGINS="https://sizin-alaniniz.com,https://api.sizin-alaniniz.com"

# Güvenlik - BU DEĞERLERİ ÜRETİM İÇİN DEĞİŞTİRİN!
SECRET_KEY=çok-güvenli-üretim-anahtarınız-burada
FIRST_SUPERUSER=yönetici-emailiniz@alan.com
FIRST_SUPERUSER_PASSWORD=çok-güvenli-yönetici-parolaniz

# Harici PostgreSQL Veritabanı Yapılandırması
EXTERNAL_POSTGRES_SERVER=harici-veritabani-sunucunuz.com
EXTERNAL_POSTGRES_PORT=5432
EXTERNAL_POSTGRES_DB=üretim_veritabaniniz
EXTERNAL_POSTGRES_USER=veritabani_kullanici
EXTERNAL_POSTGRES_PASSWORD=güvenli-veritabani-parolaniz

# E-posta Yapılandırması
SMTP_HOST=smtp-sunucunuz.com
SMTP_USER=noreply@sizin-alaniniz.com
SMTP_PASSWORD=smtp-parolaniz
EMAILS_FROM_EMAIL=noreply@sizin-alaniniz.com

# Harici Keycloak Yapılandırması
EXTERNAL_KEYCLOAK_URL=https://keycloak.sizin-alaniniz.com
EXTERNAL_KEYCLOAK_REALM=alanadiniz
EXTERNAL_KEYCLOAK_CLIENT_ID=arka-uc-istemci-id
EXTERNAL_KEYCLOAK_CLIENT_SECRET=müşteri-gizli-kodunuz
EXTERNAL_KEYCLOAK_FRONTEND_CLIENT_ID=ön-yüz-istemci-id

# Docker Görüntüsü Yapılandırması (üretim kayıt merkezi için)
DOCKER_IMAGE_BACKEND=kayıtmerkeziniz/kurumsal-indirim-arkauc
DOCKER_IMAGE_FRONTEND=kayıtmerkeziniz/kurumsal-indirim-önyüz
TAG=latest
```

## Üretim İçin Derleme

### 1. Arka Uç Görüntüsünü Derleyin

```bash
cd backend
docker build -f Dockerfile.prod -t kurumsal-indirim-arkauc:production .
```

Bir konteyner kayıt merkezi kullanıyorsanız:

```bash
cd backend
docker build -f Dockerfile.prod -t kayıtmerkeziniz/kurumsal-indirim-arkauc:latest .
docker push kayıtmerkeziniz/kurumsal-indirim-arkauc:latest
```

### 2. Önyüz Görüntüsünü Derleyin

```bash
cd ../frontend
docker build -f Dockerfile.prod -t kurumsal-indirim-önyüz:production .
```

Bir konteyner kayıt merkezi kullanıyorsanız:

```bash
cd ../frontend
docker build -f Dockerfile.prod -t kayıtmerkeziniz/kurumsal-indirim-önyüz:latest .
docker push kayıtmerkeziniz/kurumsal-indirim-önyüz:latest
```

### 3. Üretim Kompozisyon Dosyasını Kullanarak Dağıtın

```bash
# Tüm servisleri dağıt
docker-compose -f production-docker-compose.yml up -d

# Veya belirli bir ortamla dağıt
DOMAIN=sizin-alaniniz.com docker-compose -f production-docker-compose.yml up -d
```

## Alternatif: Harici Servislerle Dağıtım

Harici PostgreSQL ve Keycloak servislerine bağlanmanız gerektiğinde:

1. `.env.external` dosyasını harici servis detaylarınızla güncelleyin
2. Harici servisler kompozisyon dosyasını kullanın:

```bash
# Harici servislerle dağıt
DOMAIN=sizin-alaniniz.com docker-compose -f production-external-services.yml up -d
```

## Alternatif: Her Şeyi Bir Kerede Derleyin ve Dağıtın

İşlemi otomatikleştirmek için derleme komut dosyasını da kullanabilirsiniz:

```bash
# Komut dosyasını çalıştırılabilir yapın (Linux/Mac)
chmod +x build-and-deploy.sh

# Derleme ve dağıtım işlemini çalıştırın
./build-and-deploy.sh
```

## Üretim Dağıtım Seçenekleri

### Seçenek 1: Kendi Sunucunuza Sahip Olun

1. Üretim sunucunuza SSH ile bağlanın
2. Kodunuzu ve yapılandırma dosyalarınızı kopyalayın
3. Yukarıdaki komutları kullanarak görüntüleri oluşturun
4. `docker-compose -f production-docker-compose.yml up -d` komutunu çalıştırın

### Seçenek 2: Bulut Platformu (AWS, GCP, Azure)

1. Görüntüleri bulut konteyner kayıt merkezine gönderin
2. Bulut dağıtım hizmetlerini kullanın (ECS, GKE, AKS)
3. Yük dengeleyicileri ve SSL sertifikalarını yapılandırın

### Seçenek 3: Kubernetes

1. Kompozisyon dosyasını Kubernetes manifesto dosyalarına dönüştürün
2. Kubernetes kümenize dağıtın
3. Giriş denetleyicilerini ve SSL sonlandırmayı yapılandırın

## Güvenlik Hususları

### Görüntü Güvenliği
- Görüntüleri açıklara karşı tarayın
- Minimal temel görüntüler kullanın
- Konteynerleri kök olmayan kullanıcı olarak çalıştırın
- Görüntüleri düzenli güncelleyin

### Ağ Güvenliği
- Servisler arasında özel ağlar kullanın
- Maruz kalan portları sınırlayın
- Güvenlik duvarlarını uygun şekilde yapılandırın
- Tüm iletişimler için SSL/TLS kullanın

### Gizli Bilgi Yönetimi
- Asla gizli bilgileri görüntülere sabit kodlamayın
- Ortam değişkenleri veya gizli yönetim sistemleri kullanın
- Gizli bilgileri düzenli olarak yenileyin
- Hassas verilere erişimi sınırlayın

## İzleme ve Bakım

### Sağlık Kontrolleri
- Servis sağlık uç noktalarını izleyin
- Başarısız sağlık kontrolleri için uyarılar ayarlayın
- Uygulama ve sistem ölçümlerini günlükle

### Yedekleme Stratejisi
- Düzenli veritabanı yedekleri
- Sürüm kontrolü için yapılandırma dosyaları
- Felaket kurtarma planı

### Güncellemeler
- Sıfır kesinti süresi için mavi-yeşil dağıtım stratejisi
- Sıfır kesinti süresi için yuvarlak dönüşüm güncellemeleri
- Dağıtımdan önce otomatik testler

## Sorun Giderme

### Yaygın Sorunlar

1. **Uygulama başlamıyor**
   - Günlükleri kontrol edin: `docker-compose -f production-docker-compose.yml logs -f`
   - Ortam değişkenlerinin doğru ayarlandığından emin olun
   - Veritabanına erişilebildiğinden emin olun

2. **SSL/HTTPS sorunları**
   - SSL sertifikalarının doğru şekilde monte edildiğini doğrulayın
   - nginx yapılandırmasını kontrol edin
   - Alan adı DNS ayarlarını onaylayın

3. **Performans sorunları**
   - Kaynak kullanımı izleyin
   - Arka uçtaki işçi sayılarını ayarlayın
   - Redis ile önbellekleme eklemeyi düşünün

## En İyi Uygulamalar

1. **Ortam Tutarlılığı**
   - Geliştirme, hazırlık ve üretimde aynı temel görüntüleri kullanın
   - Ortamlar arasında benzer yapılandırmalar koruyun
   - Üretimden önce hazırlık ortamında dağıtımları test edin

2. **Güvenlik**
   - Bağımlılıkları düzenli güncelleyin
   - Gizli bilgi yönetimi kullanın
   - Uygun kimlik doğrulama ve yetkilendirme uygulayın

3. **Güvenilirlik**
   - Uygun sağlık kontrolleri uygulayın
   - Yeniden başlatma politikaları kullanın
   - Felaket kurtarma planı yapın