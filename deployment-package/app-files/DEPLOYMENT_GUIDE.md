# Deployment Guide for Shared Hosting

## Server Information
- **Subdomain**: bukukira.uitmappx.com
- **Database**: uitmappx_accpro
- **DB User**: uitmappx_accpro
- **DB Password**: accpro@2026
- **DB Host**: localhost

## Prerequisites Checklist

### 1. Server Requirements
Verify your shared hosting has:
- [ ] PHP 8.2 or higher
- [ ] MySQL 5.7+ or MariaDB 10.3+
- [ ] PHP Extensions:
  - BCMath
  - Ctype
  - Fileinfo
  - JSON
  - Mbstring
  - OpenSSL
  - PDO
  - Tokenizer
  - XML
  - GD (for QR codes)
  - ZIP (for Excel exports)
- [ ] Composer (or ability to upload vendor folder)
- [ ] Node.js/npm (or upload built assets)

### 2. Pre-Deployment Steps (On Your Local Machine)

#### A. Build Frontend Assets
```bash
# Install dependencies if not already done
npm install

# Build for production
npm run build
```

#### B. Install PHP Dependencies
```bash
# Install production dependencies only
composer install --optimize-autoloader --no-dev
```

#### C. Optimize Laravel
```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Create optimized class loader
php artisan optimize

# Cache configurations for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### D. Create Production .env File
Create a new file `.env.production` with these settings:

```env
APP_NAME=BukuKira
APP_ENV=production
APP_KEY=base64:t/dG67Rv0JrThMDoV1Rpoirb4I7qF8t/o89piCm3WIs=
APP_DEBUG=false
APP_URL=https://bukukira.uitmappx.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=uitmappx_accpro
DB_USERNAME=uitmappx_accpro
DB_PASSWORD=accpro@2026

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.uitmappx.com
SESSION_SECURE_COOKIE=true

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Deployment Steps

### 3. File Upload Structure

Your shared hosting typically has this structure:
```
/home/username/
  ├── public_html/          # This is your web root
  │   └── bukukira.uitmappx.com/  # Your subdomain folder
  └── app_data/             # Or similar private folder (varies by host)
```

**IMPORTANT**: Laravel's `public` folder should be the ONLY folder in your web root!

#### Recommended Structure:
```
/home/username/
  ├── public_html/
  │   └── bukukira.uitmappx.com/  # Point subdomain here
  │       └── (contents of Laravel's public folder)
  └── bukukira-app/         # All other Laravel files
      ├── app/
      ├── bootstrap/
      ├── config/
      ├── database/
      ├── resources/
      ├── routes/
      ├── storage/
      ├── vendor/
      └── ...
```

### 4. Upload Files

#### Option A: Via cPanel File Manager or FTP

1. **Upload Laravel application** (excluding public folder):
   - Upload all files EXCEPT the `public` folder to `/home/username/bukukira-app/`
   - Files to upload:
     - app/
     - bootstrap/
     - config/
     - database/
     - resources/
     - routes/
     - storage/
     - vendor/ (if Composer not available on server)
     - artisan
     - composer.json
     - composer.lock
     - package.json
     - .env (rename from .env.production)

2. **Upload public folder contents**:
   - Upload contents of `public/` folder to `/home/username/public_html/bukukira.uitmappx.com/`
   - This includes:
     - index.php
     - .htaccess
     - build/ (compiled assets from Vite)
     - images/
     - storage/ (symlink - may need to recreate)

#### Option B: Via Git (if available)
```bash
cd /home/username/bukukira-app
git clone your-repository .
composer install --optimize-autoloader --no-dev
npm install && npm run build
```

### 5. Configure index.php

Edit `/home/username/public_html/bukukira.uitmappx.com/index.php`:

**Original:**
```php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
```

**Change to:**
```php
require __DIR__.'/../../../bukukira-app/vendor/autoload.php';
$app = require_once __DIR__.'/../../../bukukira-app/bootstrap/app.php';
```

### 6. Set File Permissions

Via SSH or cPanel Terminal:
```bash
# Navigate to your app directory
cd /home/username/bukukira-app

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Storage and cache directories need write permissions
chmod -R 775 storage bootstrap/cache

# If using shared hosting, you might need 777
# chmod -R 777 storage bootstrap/cache
```

### 7. Create Storage Link

If your hosting has SSH access:
```bash
cd /home/username/bukukira-app
php artisan storage:link
```

Or manually create symlink from:
- `/home/username/public_html/bukukira.uitmappx.com/storage` → `/home/username/bukukira-app/storage/app/public`

### 8. Database Migration

Via SSH:
```bash
cd /home/username/bukukira-app
php artisan migrate --force
php artisan db:seed --force
```

Or import your database via phpMyAdmin:
```bash
# Export from local
php artisan db:dump > database_backup.sql

# Then import via phpMyAdmin on shared hosting
```

### 9. Configure .htaccess (if needed)

Ensure `/home/username/public_html/bukukira.uitmappx.com/.htaccess` exists:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 10. Point Subdomain to Public Folder

In cPanel:
1. Go to **Domains** or **Subdomains**
2. Find `bukukira.uitmappx.com`
3. Set **Document Root** to: `/home/username/public_html/bukukira.uitmappx.com`
4. Save changes

### 11. Post-Deployment Tasks

```bash
# Clear and cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate application key if needed
php artisan key:generate

# Create admin user
php artisan db:seed --class=AdminSeeder
```

## Verification Checklist

- [ ] Visit https://bukukira.uitmappx.com - should load without errors
- [ ] Check error logs: `/home/username/bukukira-app/storage/logs/laravel.log`
- [ ] Test login functionality
- [ ] Test file uploads
- [ ] Test database connections
- [ ] Test email sending (if configured)
- [ ] Check all routes work correctly
- [ ] Verify assets load correctly (CSS, JS, images)

## Common Issues & Solutions

### 500 Internal Server Error
1. Check file permissions on `storage/` and `bootstrap/cache/`
2. Check `.env` file exists and has correct values
3. Check `storage/logs/laravel.log` for details
4. Ensure `APP_KEY` is set in `.env`

### 404 on all routes except homepage
1. Check `.htaccess` exists in public folder
2. Verify `mod_rewrite` is enabled
3. Check subdomain points to correct directory

### CSS/JS not loading
1. Run `npm run build` again locally
2. Re-upload `public/build/` folder
3. Check `APP_URL` in `.env` matches your domain
4. Clear browser cache

### Database connection failed
1. Verify database credentials in `.env`
2. Check if database user has all privileges
3. Try connecting via phpMyAdmin with same credentials

### Storage link broken
1. Recreate symlink manually via File Manager
2. Or upload files directly to `public/storage/`

### Permission denied errors
1. Increase permissions: `chmod -R 777 storage bootstrap/cache`
2. Check with hosting provider about proper permission settings

## Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Set `APP_ENV=production`
- [ ] Use strong, unique `APP_KEY`
- [ ] Keep `.env` file outside web root (it is)
- [ ] Disable directory listing
- [ ] Set up SSL certificate (Let's Encrypt via cPanel)
- [ ] Configure CORS if needed
- [ ] Set up regular database backups
- [ ] Keep Laravel and dependencies updated

## Performance Optimization

```bash
# Enable opcache (check php.ini)
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000

# Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize Composer autoloader
composer install --optimize-autoloader --no-dev
```

## Maintenance Mode

To enable maintenance mode:
```bash
php artisan down --secret="your-secret-token"
```

To disable:
```bash
php artisan up
```

Access site during maintenance: `https://bukukira.uitmappx.com/your-secret-token`

## Useful Commands via SSH

```bash
# Navigate to app
cd /home/username/bukukira-app

# Clear all caches
php artisan optimize:clear

# View logs
tail -f storage/logs/laravel.log

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Run queue worker (if using)
php artisan queue:work --daemon
```

## Contact Support If Needed

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check server error logs via cPanel
3. Contact hosting support for server-specific issues
4. Ensure all server requirements are met
