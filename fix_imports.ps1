$files = Get-ChildItem -Path "components/ui" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Regex:
    # 1. from quote
    # 2. package name (lazy)
    # 3. @version
    # 4. suffix (path or whatever)
    # 5. closing quote
    # Replace with: from quote + package name + suffix + closing quote
    $newContent = $content -replace 'from (["''])(.+?)@\d+\.\d+\.\d+(.*?)["'']', 'from $1$2$3$1'
    
    if ($content -ne $newContent) {
        Write-Host "Fixing $file"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
    }
}
