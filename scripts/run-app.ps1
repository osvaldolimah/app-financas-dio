Param(
    [ValidateSet('dev','preview')]
    [string]$Mode = 'dev'
)

$ErrorActionPreference = 'Stop'

# $PSScriptRoot nem sempre está definido quando executado de certas shells; usa MyInvocation
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "Projeto: $scriptDir"

function Check-Command($cmd){
    try{
        & $cmd --version > $null 2>&1
        return $true
    }catch{
        return $false
    }
}

if(-not (Check-Command node)){
    Write-Error "Node não encontrado. Instale Node.js (recomendado >=16) e tente novamente."
    exit 1
}
if(-not (Check-Command npm)){
    Write-Error "npm não encontrado. Instale o Node.js que inclui npm e tente novamente."
    exit 1
}

Write-Host "Instalando dependências (se necessário)..."
npm install

switch($Mode){
    'dev' {
        Write-Host "Iniciando em modo dev (abrindo nova janela do PowerShell)..."
        Start-Process powershell -ArgumentList "-NoExit","-Command","npm run dev"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:5173"
        break
    }
    'preview' {
        Write-Host "Fazendo build e iniciando preview..."
        npm run build
        # abre preview em nova janela para manter processo visível
        Start-Process powershell -ArgumentList "-NoExit","-Command","npm run preview -- --port 5174"
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:5174"
        break
    }
}

Write-Host "Script iniciado. Veja a janela do PowerShell aberta para logs do servidor."
