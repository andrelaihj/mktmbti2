# 打包脚本 - 双击运行

# 进入项目目录
cd "$PSScriptRoot"

Write-Host "正在打包项目..."

# 运行打包命令
npm run build

Write-Host "打包完成！"
Write-Host "请打开 dist 文件夹查看"
Write-Host "直接双击 index.html 即可在其他电脑上运行"

# 打开dist文件夹
explorer.exe "$PSScriptRoot\dist"

Pause
