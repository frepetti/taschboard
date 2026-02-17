$files = Get-ChildItem -Path . -Include "*.tsx","*.ts" -Recurse | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Regex: replace "package@version" with "package"
    $newContent = $content -replace 'from (["''])(.+?)@\d+\.\d+\.\d+(.*?)["'']', 'from $1$2$3$1'
    
    if ($content -ne $newContent) {
        Write-Host "Fixing $file"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
    }
}
