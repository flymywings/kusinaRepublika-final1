# Rebuild the 26-second dialogue-led mix from the original voice and synthesized stems.
param(
    [string]$EffectsPath,
    [string]$OutputPath,
    [double]$CutLength = 26,
    [switch]$CueEmphasis
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot 'shore-mix.wav'
$voice = Join-Path $root 'public/narration.mp3'
$music = Join-Path $root 'public/tsunami-score.wav'
$effects = Join-Path $root 'public/tsunami-effects.wav'
if ($EffectsPath) { $effects = $EffectsPath }
if ($OutputPath) { $out = $OutputPath }
$rate = 48000
$culture = [Globalization.CultureInfo]::InvariantCulture
$duration = $CutLength.ToString($culture)
$scoreTail = if ($CueEmphasis) { 1.18 } else { 1.75 }
$effectsTail = if ($CueEmphasis) { .40 } else { 1.35 }
$scoreFade = ($CutLength - $scoreTail).ToString($culture)
$effectsFade = ($CutLength - $effectsTail).ToString($culture)
$scoreTailText = $scoreTail.ToString($culture)
$effectsTailText = $effectsTail.ToString($culture)

# Clip boundaries sit in low-level handles between sentences. Stretching the
# first five phrases slightly preserves the starts of later phrases and shortens gaps.
$phrases = @(
    @{ Start=0;     End=2.89;  Tempo=.945 }
    @{ Start=3.26;  End=5.55;  Tempo=.912 }
    @{ Start=6.04;  End=10.74; Tempo=.966 }
    @{ Start=11.14; End=16.67; Tempo=.988 }
    @{ Start=16.97; End=19;    Tempo=.973 }
    @{ Start=19.32; End=25.08; Tempo=1 }
)
$parts = [System.Collections.Generic.List[string]]::new()
$inputs = (0..($phrases.Count-1) | ForEach-Object { "[take$_]" }) -join ''
$parts.Add("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=$($phrases.Count)$inputs")
foreach ($i in 0..($phrases.Count-1)) {
    $phrase = $phrases[$i]
    $start = $phrase.Start.ToString($culture)
    $end = $phrase.End.ToString($culture)
    $tempo = $phrase.Tempo.ToString($culture)
    $delaySamples = [int]($phrase.Start*$rate)
    $fade = if ($i -eq 0) { '0.006' } else { '0.02' }
    $parts.Add("[take${i}]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,atempo=$tempo,afade=d=$fade,areverse,afade=d=0.026,areverse,adelay=${delaySamples}S:all=1[phrase$i]")
}
$voiceParts = (0..($phrases.Count-1) | ForEach-Object { "[phrase$_]" }) -join ''
$parts.Add("${voiceParts}amix=inputs=$($phrases.Count):normalize=0,volume=5.75dB,apad,atrim=duration=$duration,asplit=3[voice][musicKey][fxKey]")
$parts.Add("[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=-6.8dB,afade=d=0.55,afade=t=out:st=${scoreFade}:d=${scoreTailText}[score]")
$parts.Add('[score][musicKey]sidechaincompress=threshold=.045:ratio=2.1:attack=40:release=315[scoreDuck]')

# Separate level rides over the fault swell, shoreline retreat, and footsteps.
$effectsGain = "pow(10,(-13-3.5*clip((t-7.7)/.45,0,1)*clip((11.45-t)/.55,0,1)-4.5*clip((t-13.55)/.4,0,1)*clip((17.55-t)/.55,0,1)-3.5*clip((t-19.03)/.4,0,1))/20)"
if ($CueEmphasis) { $effectsGain = 'pow(10,-10.6/20)' }
$parts.Add("[2:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=65,highshelf=f=3500:g=-2.5,volume='${effectsGain}':eval=frame,afade=t=out:st=${effectsFade}:d=${effectsTailText}[detail]")
$parts.Add('[detail][fxKey]sidechaincompress=threshold=.07:ratio=1.65:attack=30:release=245[detailDuck]')
$parts.Add("[voice][scoreDuck][detailDuck]amix=inputs=3:normalize=0:duration=first,aresample=192000,alimiter=limit=.81:attack=5:release=95:level=0:latency=1,aresample=48000,atrim=duration=$duration[mix]")
$graph = $parts -join ';'
& ffmpeg -v error -y -i $voice -i $music -i $effects -filter_complex $graph -map '[mix]' -c:a pcm_s24le $out
if ($LASTEXITCODE -ne 0) { throw "FFmpeg mix failed ($LASTEXITCODE)" }
& ffprobe -v error -show_entries stream=codec_name,sample_rate,channels,duration -of compact $out
& ffmpeg -hide_banner -nostats -i $out -af 'ebur128=peak=true' -f null NUL 2>&1 |
    Select-String '^\s+I:|^\s+LRA:|^\s+Peak:'
if ($LASTEXITCODE -ne 0) { throw "FFmpeg loudness check failed ($LASTEXITCODE)" }

