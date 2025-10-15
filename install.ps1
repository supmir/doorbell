if (-not ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
        [Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator."
    exit
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)){
    Write-Host "Installing Node.js..."
    powershell -c "irm https://community.chocolatey.org/install.ps1|iex"
    choco install nodejs --version="22.20.0"
} else {
    Write-Host "Node.js already installed."
}


$apiKey = Read-Host "Enter Discord API Key:"
$actionChannelID = Read-Host "Enter Action Channel ID:"
$logChannelID = Read-Host "Enter Log Channel ID:"

[System.Environment]::SetEnvironmentVariable("DOORBELL_TOKEN", $apiKey, "User")
[System.Environment]::SetEnvironmentVariable("ACTION_CHANNEL_ID", $actionChannelID, "User")
[System.Environment]::SetEnvironmentVariable("LOG_CHANNEL_ID", $logChannelID, "User")

Write-Host "Systen environment variables updated"


$folderPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mainScript = Join-Path $folderPath "index.js"
$startupScript = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\doorbell.cmd"
Write-Host "Installing doorbell at $startupScript..."

$nodePath = (Get-Command node).Source

"@echo off
`"$nodePath`" `"$mainScript`"
exit" | Out-File -Encoding ASCII $startupScript

Write-Host "Installed doorbell at $startupScript"

$apiKey = Read-Host "Installation complete. Press enter to exit..."



