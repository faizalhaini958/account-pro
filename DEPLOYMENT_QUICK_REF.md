# Quick Deployment Reference

## Server Info
- **URL**: https://bukukira.uitmappx.com
- **DB Name**: uitmappx_accpro
- **DB User**: uitmappx_accpro  
- **DB Pass**: accpro@2026

## Quick Steps

### 1️⃣ Prepare Locally
```bash
# Run the preparation script
./deploy-prepare.sh

# Or manually:
npm run build
composer install --optimize-autoloader --no-dev
php artisan optimize
```

### 2️⃣ Upload Files
```
Upload to server:
  deployment-package/app-files/*     → ~/bukukira-app/
  deployment-package/public-files/*  → ~/public_html/bukukira.uitmappx.com/
```

### 3️⃣ Fix index.php
Edit `~/public_html/bukukira.uitmappx.com/index.php`:

```php
// Change these two lines:
require __DIR__.'/../../../bukukira-app/vendor/autoload.php';
$app = require_once __DIR__.'/../../../bukukira-app/bootstrap/app.php';
```

### 4️⃣ Set Permissions (via SSH)
```bash
cd ~/bukukira-app
chmod -R 775 storage bootstrap/cache
# If doesn't work, try:
# chmod -R 777 storage bootstrap/cache
```

### 5️⃣ Run Migrations
```bash
cd ~/bukukira-app
php artisan migrate --force
php artisan storage:link
```

### 6️⃣ Point Subdomain
cPanel → Domains → Set document root to:
```
/home/username/public_html/bukukira.uitmappx.com
```

### 7️⃣ Test
Visit: https://bukukira.uitmappx.com

## Troubleshooting

**500 Error?**
```bash
chmod -R 777 storage bootstrap/cache
tail -f storage/logs/laravel.log
```

**CSS/JS not loading?**
- Check APP_URL in .env
- Re-upload public/build/ folder
- Clear browser cache

**Database error?**
- Verify credentials in .env
- Test in phpMyAdmin

**404 on routes?**
- Check .htaccess in public folder
- Verify mod_rewrite enabled

## Important Files

### Must have in public folder:
- ✅ index.php (with updated paths)
- ✅ .htaccess
- ✅ build/ folder (from npm run build)

### Must have proper permissions:
- ✅ storage/ (775 or 777)
- ✅ bootstrap/cache/ (775 or 777)

### Critical .env settings:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bukukira.uitmappx.com
DB_DATABASE=uitmappx_accpro
DB_USERNAME=uitmappx_accpro
DB_PASSWORD=accpro@2026
```

## Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# View logs
tail -f storage/logs/laravel.log

# Maintenance mode
php artisan down
php artisan up
```

## Pre-flight Checklist

Before uploading:
- [ ] Built assets: `npm run build`
- [ ] Production .env configured
- [ ] Composer dependencies installed
- [ ] APP_DEBUG=false
- [ ] APP_ENV=production

After uploading:
- [ ] index.php paths updated
- [ ] Permissions set (storage, bootstrap/cache)
- [ ] Migrations run
- [ ] Storage linked
- [ ] Subdomain points to correct folder
- [ ] Site loads without errors
- [ ] Login works
- [ ] Database connected

---
For full details, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
