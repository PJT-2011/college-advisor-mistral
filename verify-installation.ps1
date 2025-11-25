# Verify Installation - Run this to check everything is ready

Write-Host "`nVERIFYING INSTALLATION...`n" -ForegroundColor Cyan

$checks = @()

# Check 1: Node Modules
if (Test-Path "node_modules") {
    $packageCount = (Get-ChildItem node_modules -Directory | Measure-Object).Count
    Write-Host "[OK] node_modules exists - $packageCount packages" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "[FAIL] node_modules missing - Run: npm install" -ForegroundColor Red
    $checks += $false
}

# Check 2: Config Files
$configFiles = @(
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "tailwind.config.ts",
    "postcss.config.js",
    ".eslintrc.json"
)

$configOk = $true
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $configOk = $false
    }
}
$checks += $configOk

# Check 3: Environment Files
if (Test-Path ".env.example") {
    Write-Host "✅ .env.example exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "❌ .env.example missing" -ForegroundColor Red
    $checks += $false
}

if (Test-Path ".env.cpu-optimized") {
    Write-Host "✅ .env.cpu-optimized exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.cpu-optimized missing" -ForegroundColor Yellow
}

if (Test-Path ".env") {
    Write-Host "✅ .env configured" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "⚠️  .env not configured - Copy .env.cpu-optimized to .env" -ForegroundColor Yellow
    $checks += $false
}

# Check 4: Prisma Files
if (Test-Path "prisma/schema.prisma") {
    Write-Host "✅ Prisma schema exists" -ForegroundColor Green
    $checks += $true
} else {
    Write-Host "❌ Prisma schema missing" -ForegroundColor Red
    $checks += $false
}

if (Test-Path "prisma/seed.js") {
    Write-Host "✅ Seed script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Seed script missing" -ForegroundColor Red
}

# Check 5: Source Files
$srcChecks = @{
    "src/app" = "App directory"
    "src/agents" = "AI agents"
    "src/tools" = "AI tools"
    "src/lib" = "Core libraries"
    "src/components" = "UI components"
}

$srcOk = $true
foreach ($path in $srcChecks.Keys) {
    if (Test-Path $path) {
        Write-Host "✅ $($srcChecks[$path])" -ForegroundColor Green
    } else {
        Write-Host "❌ $($srcChecks[$path]) missing at $path" -ForegroundColor Red
        $srcOk = $false
    }
}
$checks += $srcOk

# Check 6: Mistral Model
if (Test-Path "models") {
    $modelFiles = Get-ChildItem models -Filter "*.gguf" -ErrorAction SilentlyContinue
    if ($modelFiles) {
        Write-Host "✅ Mistral model found: $($modelFiles[0].Name)" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host "⚠️  Mistral model not downloaded (4.37GB required)" -ForegroundColor Yellow
        Write-Host "   Download from: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF" -ForegroundColor Gray
        $checks += $false
    }
} else {
    Write-Host "⚠️  models/ directory missing - Create it and download Mistral model" -ForegroundColor Yellow
    $checks += $false
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
$passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
$totalChecks = $checks.Count
$percentage = [math]::Round(($passedChecks / $totalChecks) * 100)

Write-Host "`n📊 VERIFICATION SUMMARY" -ForegroundColor Yellow
Write-Host "   Passed: $passedChecks / $totalChecks ($percentage%)" -ForegroundColor $(if ($percentage -eq 100) { "Green" } else { "Yellow" })

if ($percentage -eq 100) {
    Write-Host "`n🎉 ALL CHECKS PASSED! Ready to run." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "   1. npm run db:push" -ForegroundColor White
    Write-Host "   2. npm run db:seed" -ForegroundColor White
    Write-Host "   3. npm run dev" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some checks failed. Review errors above." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "`n📝 QUICK FIX:" -ForegroundColor Cyan
        Write-Host "   Copy-Item .env.cpu-optimized .env" -ForegroundColor White
        Write-Host "   notepad .env  # Configure DATABASE_URL and NEXTAUTH_SECRET" -ForegroundColor White
    }
    
    if (-not (Test-Path "models")) {
        Write-Host "`n📦 DOWNLOAD MODEL:" -ForegroundColor Cyan
        Write-Host "   1. Create folder: New-Item -ItemType Directory models" -ForegroundColor White
        Write-Host "   2. Download: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF" -ForegroundColor White
        Write-Host "   3. File: mistral-7b-instruct-v0.3.Q4_K_M.gguf (4.37GB)" -ForegroundColor White
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
