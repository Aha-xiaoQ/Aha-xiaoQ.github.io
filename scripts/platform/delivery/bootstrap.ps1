param(
    [ValidateSet('Push','Check')][string]$Mode = 'Push',
    [switch]$ElevationTried
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding
$exitCode = 1

function Refresh-ToolPath {
    $parts = @($env:Path,
        [Environment]::GetEnvironmentVariable('Path','Machine'),
        [Environment]::GetEnvironmentVariable('Path','User'),
        (Join-Path $env:ProgramFiles 'Git\cmd'),
        (Join-Path $env:ProgramFiles 'GitHub CLI'),
        (Join-Path $env:ProgramFiles 'nodejs'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Git\cmd'),
        (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links'))
    $env:Path = ($parts | Where-Object { $_ }) -join ';'
}
function Find-Tool([string]$Name) {
    Refresh-ToolPath
    $command = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($command) { return $command.Source }
    return $null
}
function Ensure-Tool([string]$Name, [string]$Id, [string]$Title) {
    $found = Find-Tool $Name
    if ($found) { return $found }
    $winget = Find-Tool 'winget.exe'
    if (-not $winget) { throw "缺少 $Title，并且找不到 winget。请按照 README 中的官方地址安装工具，再重新双击 START.cmd。" }
    Write-Host "首次准备：安装 $Title。Windows 可能要求安装授权。"
    & $winget install --id $Id --exact --source winget --accept-source-agreements --accept-package-agreements --disable-interactivity | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "$Title 安装未成功，已停止，不会继续推送。" }
    $found = Find-Tool $Name
    if (-not $found) { throw "$Title 安装后未找到可执行文件。关闭窗口后重新运行 START.cmd。" }
    return $found
}
function Verify-Package {
    $base = [IO.Path]::GetFullPath($PSScriptRoot) + [IO.Path]::DirectorySeparatorChar
    $index = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'integrity.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($index.schemaVersion -ne 1) { throw '校验清单版本不正确。' }
    foreach ($entry in $index.files) {
        $target = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $entry.path))
        if (-not $target.StartsWith($base, [StringComparison]::OrdinalIgnoreCase)) { throw '校验清单出现越界路径。' }
        $item = Get-Item -LiteralPath $target -Force
        if ($item.PSIsContainer -or (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)) { throw "文件不安全：$($entry.path)" }
        $actual = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $entry.sha256) { throw "网站更新包损坏或被修改：$($entry.path)。请重新解压完整 ZIP。" }
    }
}

try {
    Write-Host ''
    Write-Host '在下_小Q · 网站平台 · 架构与双语更新 一键推送'
    Write-Host '目标仓库：Aha-xiaoQ/Aha-xiaoQ.github.io   分支：main'
    Write-Host '使用独立工作区，不覆盖已有本地工程；不强推、不修改 Pages 设置。'
    Write-Host ''
    Write-Host '由同一套平台流程构建与检查，任何失败都会停止推送。原始作品和试玩受校验保护。'
    Verify-Package
    $git = Ensure-Tool 'git.exe' 'Git.Git' 'Git for Windows'
    $gh = Ensure-Tool 'gh.exe' 'GitHub.cli' 'GitHub CLI'
    $node = Ensure-Tool 'node.exe' 'OpenJS.NodeJS.LTS' 'Node.js LTS'
    $version = (& $node --version).Trim()
    if ([int]($version.TrimStart('v').Split('.')[0]) -lt 22) {
        $winget = Find-Tool 'winget.exe'
        if (-not $winget) { throw "Node.js $version 太旧，需要 22 或更新版本。" }
        Write-Host '需要更新 Node.js 至受支持版本。'
        & $winget install --id OpenJS.NodeJS.LTS --exact --source winget --accept-source-agreements --accept-package-agreements --disable-interactivity | Out-Host
        if ($LASTEXITCODE -ne 0) { throw 'Node.js 更新失败，请按 README 手动升级后重试。' }
        $node = Find-Tool 'node.exe'
        $version = (& $node --version).Trim()
        if ([int]($version.TrimStart('v').Split('.')[0]) -lt 22) { throw 'PATH 仍指向旧 Node.js。请重新打开窗口，或修正已有版本管理器设置。' }
    }
    $npmCommand = Find-Tool 'npm.cmd'
    if (-not $npmCommand) { throw '找不到 npm.cmd，请修复 Node.js 安装。' }
    $npmCli = Join-Path (Split-Path -Parent $npmCommand) 'node_modules\npm\bin\npm-cli.js'
    if (-not (Test-Path -LiteralPath $npmCli -PathType Leaf)) { throw '找不到 npm-cli.js，请使用包含 npm 的完整 Node.js 安装。' }

    # Some original repository tests create symbolic links, even on Windows.
    & $node (Join-Path $PSScriptRoot 'lib\probe-symlink.mjs')
    if ($LASTEXITCODE -ne 0) {
        if ($ElevationTried) { throw '当前 Windows 策略不允许符号链接测试。没有跳过测试，也没有推送。' }
        Write-Host ''
        Write-Host '原有安全测试需要创建临时符号链接。当前账户没有该权限，将请求一次 Windows 管理员确认。'
        Write-Host '不会自动开启开发者模式，也不会修改全局执行策略。取消授权将停止。'
        $powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
        $arguments = '-NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -Mode ' + $Mode + ' -ElevationTried'
        $child = Start-Process -FilePath $powershell -ArgumentList $arguments -Verb RunAs -Wait -PassThru
        $exitCode = $child.ExitCode
    } else {
        $env:XIAOQ_GIT = $git
        $env:XIAOQ_GH = $gh
        $env:XIAOQ_NPM_CLI = $npmCli
        # Ensure Git can locate the official CLI credential helper in this process only.
        $env:Path = (Split-Path -Parent $gh) + ';' + (Split-Path -Parent $git) + ';' + (Split-Path -Parent $node) + ';' + $env:Path
        $operation = '--push'
        if ($Mode -eq 'Check') { $operation = '--check-only' }
        & $node (Join-Path $PSScriptRoot 'update.mjs') $operation
        $exitCode = $LASTEXITCODE
    }
} catch {
    Write-Host ''
    Write-Host ('已停止：' + $_.Exception.Message) -ForegroundColor Red
    $exitCode = 1
}
if ($ElevationTried) { Write-Host ''; Read-Host '按 Enter 关闭此窗口' | Out-Null }
exit $exitCode
