/**
 * Complete Setup Script for College Advisor Mistral
 * 
 * Run this after installing dependencies to set up the project.
 */

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  College Advisor Mistral - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

# Step 1: Check Prerequisites
Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow
Write-Host "`n"

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check npm
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "  ✓ npm $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host "  ✓ PostgreSQL installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ PostgreSQL not found in PATH (you may need to install it)" -ForegroundColor Yellow
}

Write-Host "`n"

# Step 2: Install Dependencies
Write-Host "[2/7] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
npm install --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Step 3: Environment Setup
Write-Host "[3/7] Setting up environment..." -ForegroundColor Yellow

if (Test-Path .env) {
    Write-Host "  ⚠ .env file already exists, skipping" -ForegroundColor Yellow
} else {
    Copy-Item .env.example .env
    Write-Host "  ✓ Created .env file from example" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Edit .env and add your DATABASE_URL" -ForegroundColor Yellow
}

Write-Host "`n"

# Step 4: Model Directory
Write-Host "[4/7] Creating models directory..." -ForegroundColor Yellow

if (!(Test-Path models)) {
    New-Item -Path "models" -ItemType Directory | Out-Null
    Write-Host "  ✓ Created models/ directory" -ForegroundColor Green
} else {
    Write-Host "  ⚠ models/ directory already exists" -ForegroundColor Yellow
}

Write-Host "`n"
Write-Host "  📥 DOWNLOAD REQUIRED:" -ForegroundColor Cyan
Write-Host "  Download Mistral model from:" -ForegroundColor White
Write-Host "  https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF`n" -ForegroundColor White
Write-Host "  Recommended: mistral-7b-instruct-v0.3.Q4_K_M.gguf (4.37GB)" -ForegroundColor White
Write-Host "  Place the downloaded file in: ./models/`n" -ForegroundColor White

# Step 5: Database Setup (skip if DATABASE_URL not configured)
Write-Host "[5/7] Database setup..." -ForegroundColor Yellow

$envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue
if ($envContent -and $envContent -match 'DATABASE_URL="postgresql://') {
    Write-Host "  Running Prisma migrations..." -ForegroundColor Gray
    npx prisma db push --skip-generate 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Database schema created" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Database migration failed (check your DATABASE_URL)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ DATABASE_URL not configured in .env, skipping" -ForegroundColor Yellow
    Write-Host "  Configure DATABASE_URL then run: npm run db:push" -ForegroundColor Gray
}

Write-Host "`n"

# Step 6: Generate Prisma Client
Write-Host "[6/7] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate --quiet 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Prisma client generation failed" -ForegroundColor Yellow
}

Write-Host "`n"

# Step 7: Seed Database (if DB is ready)
Write-Host "[7/7] Seeding database..." -ForegroundColor Yellow

if ($envContent -and $envContent -match 'DATABASE_URL="postgresql://') {
    node prisma/seed.js 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Database seeded with campus resources" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Database seeding failed (run manually: npm run db:seed)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Skipping (database not configured)" -ForegroundColor Yellow
}

Write-Host "`n"

# Final Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "1. Edit .env file:" -ForegroundColor White
Write-Host "   - Set DATABASE_URL to your PostgreSQL connection string" -ForegroundColor Gray
Write-Host "   - Verify MISTRAL_MODEL_PATH points to downloaded model" -ForegroundColor Gray
Write-Host "   - Set NEXTAUTH_SECRET to a random string" -ForegroundColor Gray
Write-Host "`n"

Write-Host "2. Download Mistral Model:" -ForegroundColor White
Write-Host "   - Visit: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF" -ForegroundColor Gray
Write-Host "   - Download: mistral-7b-instruct-v0.3.Q4_K_M.gguf" -ForegroundColor Gray
Write-Host "   - Place in: ./models/" -ForegroundColor Gray
Write-Host "`n"

Write-Host "3. Run database migrations:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Gray
Write-Host "   npm run db:seed" -ForegroundColor Gray
Write-Host "`n"

Write-Host "4. Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n"

Write-Host "5. Open in browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host "`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Need help? Check README.md for details" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"
