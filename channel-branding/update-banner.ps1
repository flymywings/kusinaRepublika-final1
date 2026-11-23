Add-Type -AssemblyName System.Drawing
$dir = 'C:/Users/Win 10/Downloads/new video edit/channel-branding'
$gen = 'C:/Users/Win 10/.codex/generated_images/01a1b16f-6f12-7e12-bb17-33c741e8db89'
Copy-Item -LiteralPath "$gen/exec-46f3f998-6ed3-4d04-99c8-e1585d7d847e.png" -Destination "$dir/avatar-toast.png"
Copy-Item -LiteralPath "$gen/exec-8c466cb4-218e-4a32-99c1-b5c2c975336c.png" -Destination "$dir/avatar-side-sip.png"
$src = [System.Drawing.Image]::FromFile("$gen/exec-92561711-ea93-4de0-9d0e-84e5ca269bfb.png")
$bmp = New-Object System.Drawing.Bitmap 2560,1440
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($src,0,0,2560,1440)
$g.ScaleTransform((2560.0/$src.Width),(1440.0/$src.Height))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$family = New-Object System.Drawing.FontFamily 'Franklin Gothic Heavy'
$path.AddString('SUBSCRIBE',$family,0,200,[System.Drawing.PointF]::new(0,0),[System.Drawing.StringFormat]::GenericTypographic)
$b = $path.GetBounds()
$scale = 1060.0/$b.Width
$m = New-Object System.Drawing.Drawing2D.Matrix
$m.Translate(-$b.X,-$b.Y)
$path.Transform($m)
$m.Reset(); $m.Scale($scale,$scale); $path.Transform($m)
$m.Reset(); $m.Translate((($src.Width-1060)/2),480); $path.Transform($m)
$ink = [System.Drawing.ColorTranslator]::FromHtml('#230c26')
$cream = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fff0ce'))
$pen = [System.Drawing.Pen]::new($ink,11)
$pen.LineJoin = 'Round'
$g.DrawPath($pen,$path)
$g.FillPath($cream,$path)
$bmp.Save("$dir/channel-banner-v2.png",[System.Drawing.Imaging.ImageFormat]::Png)
$pen.Dispose();$cream.Dispose();$path.Dispose();$family.Dispose();$m.Dispose();$g.Dispose();$bmp.Dispose();$src.Dispose()
Get-ChildItem -LiteralPath $dir | Select-Object Name,Length
