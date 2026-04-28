param ()

# Exclude directories
$exclude = @("node_modules", "target", "dist", ".git", ".antigravity", "peers")

Get-ChildItem -Path . -Recurse | Where-Object { 
    $item = $_
    $skip = $false
    foreach ($ex in $exclude) {
        if ($item.FullName -match "\\$ex\\") {
            $skip = $true
            break
        }
    }
    !$skip -and !$item.PSIsContainer
} | ForEach-Object {
    $file = $_.FullName
    try {
        $content = Get-Content -Path $file -Raw -ErrorAction Stop
        $changed = $false
        
        if ($content -cMatch "LuminaMart") {
            $content = $content -cReplace "LuminaMart", "Sanvara"
            $changed = $true
        }
        if ($content -cMatch "Lumina Mart") {
            $content = $content -cReplace "Lumina Mart", "Sanvara"
            $changed = $true
        }
        if ($content -cMatch "luminamart") {
            $content = $content -cReplace "luminamart", "sanvara"
            $changed = $true
        }
        if ($content -cMatch "lumina-mart") {
            $content = $content -cReplace "lumina-mart", "sanvara"
            $changed = $true
        }

        if ($changed) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "Replaced in $file"
        }
    } catch {
        # Ignore
    }
}
