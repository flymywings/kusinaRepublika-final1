"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock3, HandHeart, HeartHandshake, Home, Languages,
  LockKeyhole, Mail, MapPin, MessageCircle, Package, Paperclip, Pencil, Send,
  ShieldCheck, Sparkles, UserRound, UsersRound, Wrench,
} from "lucide-react";

type Source = { id: string; group: string; title: string; source: string; pattern: string; partial?: boolean };
type Role = "Caller" | "Runner";
type AuthStep = "email" | "code" | "id";
type AskState = "prompt" | "processing" | "draft";
type CoordinateState = "agreement" | "chat";

const sources: Source[] = [
  { id: "01", group: "Landing", title: "Choose a ride", source: "/screens/landing-01-choose-ride.png", pattern: "Map-led entry, selection sheet, featured option, persistent action" },
  { id: "02", group: "Onboarding", title: "Route introduction", source: "/screens/onboarding-01-route-map.png", pattern: "Context map, progressive disclosure, bottom action area" },
  { id: "03", group: "Onboarding", title: "Service selection", source: "/screens/onboarding-02-services.png", pattern: "Visual category tiles, grouped choices, persistent navigation" },
  { id: "04", group: "Authentication", title: "Account entry", source: "/screens/auth-01-account.png", pattern: "Identity header, status badges, utility actions, account checklist" },
  { id: "05", group: "Homepage", title: "Rides home", source: "/screens/homepage-01-rides.png", pattern: "Mode switcher, search slab, recent rows, suggestions, promo rail" },
  { id: "06", group: "MVP", title: "Services catalogue", source: "/screens/mvp-01-services.png", pattern: "Dense tile catalogue, section hierarchy, four-tab navigation" },
  { id: "07", group: "MVP", title: "Add funds", source: "/screens/mvp-02-add-funds.png", pattern: "Focused form, one value input, quick chips, bottom CTA" },
  { id: "08", group: "MVP", title: "Reservation confirmed", source: "/screens/mvp-03-reservation.png", pattern: "Status headline, single summary card, compact edit action" },
  { id: "09", group: "AI MVP shell", title: "Context detail", source: "/screens/ai-mvp-01-route-detail.png", pattern: "Contextual map card for future assisted-intent explanation", partial: true },
  { id: "10", group: "AI MVP shell", title: "Recommendation options", source: "/screens/ai-mvp-02-driver-options.png", pattern: "Ranked options, verification cues, utility cards, recommendation area" },
];

const screens = ["Landing", "How it works", "Choose role", "Auth + Verification", "Home / Discover", "Request Details", "Coordinate", "Complete + Review", "Ask Kapit", "AI Match Results"];
const matches = [
  { name: "Andrea Santos", initials: "AS", image: "/assets/kapit-avatar-andrea-v1.webp", rating: "4.9", availability: "After class · 4:15 PM", skills: "Organizing", reason: "Available today · packed kits before", fit: 96 },
  { name: "Paolo Reyes", initials: "PR", image: "/assets/kapit-avatar-paolo-v1.webp", rating: "4.8", availability: "Free from 5:00 PM", skills: "Logistics", reason: "Nearby · handles event supplies", fit: 89 },
  { name: "Joy Dela Cruz", initials: "JD", image: "/assets/kapit-avatar-joy-v1.webp", rating: "5.0", availability: "Available this afternoon", skills: "Coordination", reason: "Trusted volunteer · schedule fits", fit: 82 },
];

function Asset({ source, small = false }: { source: Source; small?: boolean }) {
  return <div className={`source-frame ${small ? "small" : ""} ${source.partial ? "partial" : ""}`}><img src={source.source} alt={`${source.title} source export`} /></div>;
}

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "coral" | "success" | "dark" }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

function PrimaryButton({ children, onClick, disabled = false, secondary = false }: { children: ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button className={`primary-button ${secondary ? "secondary" : ""}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function AppBar({ title, onBack, action }: { title?: string; onBack?: () => void; action?: ReactNode }) {
  return <div className="app-bar">{onBack ? <button className="icon-button" onClick={onBack} aria-label="Go back"><ArrowLeft /></button> : <span className="app-bar-spacer" />}<strong>{title}</strong><div className="app-bar-action">{action ?? <span className="app-bar-spacer" />}</div></div>;
}

function FactCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="fact-card"><span><Icon /></span><small>{label}</small><strong>{value}</strong></div>;
}

function ProfileAvatar({ person, small = false }: { person: typeof matches[number]; small?: boolean }) {
  return <img className={`profile-avatar ${small ? "small" : ""}`} src={person.image} alt="" />;
}

function PersonCard({ person, onChoose }: { person: typeof matches[number]; onChoose: () => void }) {
  return <button className="person-card" onClick={onChoose}><ProfileAvatar person={person} /><span className="person-copy"><span className="person-line"><strong>{person.name}</strong><Chip tone="success"><BadgeCheck /> Verified</Chip></span><small><CalendarDays /> {person.availability}</small><em>{person.skills}</em><span className="match-reason"><Sparkles /> {person.reason}</span></span><b>{person.fit}%<small>fit</small></b></button>;
}

function Metric({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return <div className="metric"><Icon /><strong>{value}</strong><small>{label}</small></div>;
}

function BottomNav({ screen, go }: { screen: number; go: (screen: number) => void }) {
  const items = [{ label: "Home", icon: Home, target: 4 }, { label: "Ask Kapit", icon: Sparkles, target: 8 }, { label: "Messages", icon: MessageCircle, target: 6 }, { label: "Profile", icon: UserRound, target: 3 }];
  return <footer className="bottom-nav" aria-label="Primary navigation">{items.map(({ label, icon: Icon, target }) => <button key={label} className={screen === target ? "active" : ""} onClick={() => go(target)} aria-label={label} title={label}><Icon /></button>)}</footer>;
}

function PhoneShell({ screen, go, children }: { screen: number; go: (screen: number) => void; children: ReactNode }) {
  return <div className="phone"><div className="status" role="img" aria-label="iPhone status bar: 9:41, cellular signal, Wi-Fi, and battery" /><article>{children}</article>{screen >= 4 && <BottomNav screen={screen} go={go} />}</div>;
}

export default function Page() {
  const [tab, setTab] = useState<"kapit" | "source">("kapit");
  const [screen, setScreen] = useState(0);
  const [role, setRole] = useState<Role>("Caller");
  const [verified, setVerified] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [askState, setAskState] = useState<AskState>("prompt");
  const [prompt, setPrompt] = useState("May extra hands ba sa pag-pack ng learning kits this afternoon?");
  const [draft, setDraft] = useState({ title: "Help pack learning kits", schedule: "Today · 4:30 PM", location: "LPU Cavite · Student Hub", exchange: "Volunteer help · 2 people" });
  const [coordinateState, setCoordinateState] = useState<CoordinateState>("agreement");
  const [coordinateBack, setCoordinateBack] = useState(5);
  const [participant, setParticipant] = useState(matches[0]);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("Volunteer");
  const [selectedSource, setSelectedSource] = useState(0);
  const [inspect, setInspect] = useState(false);

  const go = (next: number) => setScreen(Math.max(0, Math.min(9, next)));
  const openCoordinate = (person = matches[0], back = 5) => { setParticipant(person); setCoordinateBack(back); setCoordinateState("agreement"); go(6); };

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName) || target.isContentEditable) return;
      if (tab === "source") {
        if (event.key === "ArrowRight") setSelectedSource((value) => (value + 1) % sources.length);
        if (event.key === "ArrowLeft") setSelectedSource((value) => (value + sources.length - 1) % sources.length);
        if (event.key === "Enter") setInspect(true);
        if (event.key === "Escape") setInspect(false);
      } else {
        if (event.key === "ArrowRight") go(screen + 1);
        if (event.key === "ArrowLeft") go(screen - 1);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [screen, tab]);

  const nextAuthStep = () => {
    if (authStep === "email") setAuthStep("code");
    else if (authStep === "code") setAuthStep("id");
    else { setVerified(true); go(4); }
  };
  const processPrompt = () => { setAskState("processing"); window.setTimeout(() => setAskState("draft"), 600); };

  const renderScreen = () => {
    if (screen === 0) return <section className="screen welcome-screen"><div className="utility-row"><button className="language-pill"><Languages /> English <ChevronDown /></button><button className="text-button" onClick={() => go(3)}>Sign in</button></div><div className="welcome-mark"><img src="/kapit-logo.svg" alt="Kapit" /></div><div className="welcome-copy"><h1>Help nearby.<br /><em>Grow together.</em></h1><p>Trusted local help, made simple.</p></div><div className="screen-actions"><PrimaryButton onClick={() => go(1)}>Get started <ArrowRight /></PrimaryButton><button className="text-button centered" onClick={() => go(3)}>I have an account</button></div></section>;

    if (screen === 1) return <section className="screen"><AppBar title="How Kapit works" onBack={() => go(0)} action={<Chip>1 of 3</Chip>} /><div className="flow-heading"><h1>Five clear steps.</h1></div><div className="journey-path">{[["Post", Package], ["Respond", HeartHandshake], ["Choose", BadgeCheck], ["Chat", MessageCircle], ["Complete", CheckCircle2]].map(([title, Icon], index) => { const StepIcon = Icon as LucideIcon; return <div className="journey-node" key={title as string}><b>{index + 1}</b><span><StepIcon /></span><strong>{title as string}</strong></div>; })}</div><div className="journey-art"><span><HandHeart /></span><i /><span><HeartHandshake /></span></div><div className="screen-actions"><PrimaryButton onClick={() => go(2)}>Choose your role <ArrowRight /></PrimaryButton></div></section>;

    if (screen === 2) return <section className="screen"><AppBar title="Choose a role" onBack={() => go(1)} action={<Chip>2 of 3</Chip>} /><div className="flow-heading"><h1>How will you use Kapit?</h1></div><div className="role-stack visual"><button className={`role-row ${role === "Caller" ? "selected" : ""}`} onClick={() => setRole("Caller")}><span><HandHeart /></span><p><strong>Need help</strong><em>Post a local request</em></p>{role === "Caller" ? <CheckCircle2 /> : <ChevronRight />}</button><button className={`role-row ${role === "Runner" ? "selected" : ""}`} onClick={() => setRole("Runner")}><span><HeartHandshake /></span><p><strong>Offer help</strong><em>Find nearby requests</em></p>{role === "Runner" ? <CheckCircle2 /> : <ChevronRight />}</button></div><div className="role-graphic"><UsersRound /><span><b>One community</b><small>Switch roles anytime</small></span></div><div className="screen-actions"><PrimaryButton onClick={() => go(3)}>Continue <ArrowRight /></PrimaryButton></div></section>;

    if (screen === 3) return <section className="screen auth-screen"><AppBar title="Verify" onBack={() => go(2)} action={<Chip>3 of 3</Chip>} /><div className="flow-heading"><h1>{authStep === "email" ? "Use your LPU email." : authStep === "code" ? "Enter the code." : "Add your school ID."}</h1></div>{authStep === "email" && <div className="auth-graphic"><Mail /><BadgeCheck /></div>}{authStep === "email" && <label className="field"><span>Email</span><div><Mail /><input aria-label="LPU email address" defaultValue="mia@lpu.edu.ph" /></div></label>}{authStep === "code" && <><div className="otp" aria-label="Verification code">{["4", "3", "0", "3", "5", "2"].map((digit, index) => <span key={index}>{digit}</span>)}</div><button className="text-button centered">Resend code</button></>}{authStep === "id" && <div className="id-card visual"><span><UserRound /></span><i /><i /><i /><strong>School ID</strong><small>Private verification</small></div>}<small className="privacy-line boxed"><LockKeyhole /> Your details stay private.</small><div className="screen-actions"><PrimaryButton onClick={nextAuthStep}>{authStep === "email" ? "Send code" : authStep === "code" ? "Confirm code" : "Verify ID"} <ArrowRight /></PrimaryButton>{authStep === "id" && <button className="text-button centered" onClick={() => go(4)}>Later</button>}</div></section>;

    if (screen === 4) {
      const caller = role === "Caller";
      return <section className="screen home-screen"><AppBar action={<button className="avatar-button" onClick={() => go(3)} aria-label="Profile"><span className="avatar">MS</span></button>} /><div className="home-heading"><span><small>HI, MIA</small><h1>{caller ? "What do you need?" : "Ready to help?"}</h1></span>{verified && <Chip tone="success"><BadgeCheck /> Verified</Chip>}</div><div className="role-segment"><button className={caller ? "active" : ""} onClick={() => setRole("Caller")}>Need help</button><button className={!caller ? "active" : ""} onClick={() => setRole("Runner")}>Offer help</button></div><button className="community-feature" onClick={() => go(5)}><span><Chip tone="coral">Nearby</Chip><strong>Help pack learning kits</strong><small>Today · 4:30 PM</small></span></button><button className="ask-entry" onClick={() => go(8)}><Sparkles /><span><strong>Ask Kapit</strong></span><ArrowRight /></button><div className="section-title"><strong>Explore</strong><Chip>{category}</Chip></div><div className="service-grid large">{[["Errands", Package], ["Volunteer", HandHeart], ["Tutoring", BookOpen], ["Resources", Wrench]].map(([label, Icon]) => { const ServiceIcon = Icon as LucideIcon; return <button key={label as string} className={category === label ? "active" : ""} onClick={() => setCategory(label as string)}><span><ServiceIcon /></span><small>{label as string}</small></button>; })}</div><button className="text-button centered">2 more nearby <ArrowRight /></button></section>;
    }

    if (screen === 5) return <section className="screen request-screen"><AppBar title="Request" onBack={() => go(4)} action={<Chip tone="success">Open</Chip>} /><div className="request-photo hero-photo large" role="img" aria-label="LPU students packing learning kits" /><div className="request-heading"><h1>Help pack learning kits</h1><p>Two people needed.</p></div><div className="fact-grid"><FactCard icon={CalendarDays} label="WHEN" value="Today · 4:30 PM" /><FactCard icon={MapPin} label="WHERE" value="Student Hub" /><FactCard icon={UsersRound} label="PEOPLE" value="2 helpers" /><FactCard icon={HeartHandshake} label="EXCHANGE" value="Volunteer" /></div><small className="privacy-line boxed"><LockKeyhole /> Exact location unlocks after agreement.</small><div className="screen-actions"><PrimaryButton onClick={() => openCoordinate(matches[0], 5)}>{role === "Caller" ? "View responses" : "Offer help"} <ArrowRight /></PrimaryButton></div></section>;

    if (screen === 6 && coordinateState === "agreement") return <section className="screen coordinate-screen"><AppBar title="Agreement" onBack={() => go(coordinateBack)} action={<Chip tone="success">Ready</Chip>} /><div className="participant-card"><ProfileAvatar person={participant} /><p><strong>{participant.name}</strong><small><BadgeCheck /> Verified · ★ {participant.rating}</small></p></div><div className="agreement-graphic"><Package /><span /><CalendarDays /><span /><MapPin /></div><div className="fact-grid compact"><FactCard icon={Package} label="TASK" value="Learning kits" /><FactCard icon={CalendarDays} label="TIME" value="4:30 PM" /><FactCard icon={MapPin} label="PLACE" value="Student Hub" /><FactCard icon={HeartHandshake} label="TYPE" value="Volunteer" /></div><small className="privacy-line boxed"><LockKeyhole /> Meeting details stay private.</small><div className="screen-actions"><PrimaryButton onClick={() => setCoordinateState("chat")}>Confirm <MessageCircle /></PrimaryButton></div></section>;

    if (screen === 6) return <section className="screen coordinate-screen"><AppBar onBack={() => setCoordinateState("agreement")} action={<button className="icon-button" aria-label="Share request"><Send /></button>} /><div className="chat-person"><ProfileAvatar person={participant} /><p><strong>{participant.name}</strong><small><BadgeCheck /> Verified</small></p><Chip tone="success">Safe</Chip></div><button className="pinned-request" onClick={() => go(5)}><Package /><span><strong>Learning kits · 4:30 PM</strong></span><ChevronRight /></button><div className="chat-thread"><div className="bubble theirs">I can help after class.<small>4:02 PM</small></div><div className="bubble mine">See you at 4:30.<small>Seen</small></div><div className="bubble theirs">I’ll bring tape. 🙂<small>4:06 PM</small></div></div><div className="schedule-card"><CalendarDays /><span><small>CONFIRMED</small><strong>Today · 4:30 PM</strong></span><CheckCircle2 /></div><div className="message-compose"><button aria-label="Attach file"><Paperclip /></button><span>Message {participant.name.split(" ")[0]}</span><button aria-label="Send message"><ArrowRight /></button></div><div className="screen-actions"><PrimaryButton onClick={() => go(7)}>Complete <Check /></PrimaryButton></div></section>;

    if (screen === 7) return <section className="screen complete-screen"><AppBar title="Complete" onBack={() => go(6)} /><div className="impact-photo hero-photo large" role="img" aria-label="LPU volunteers with completed learning kits" /><div className="completion-check"><CheckCircle2 /></div><div className="completion-copy"><h1>Small help. Real impact.</h1></div><div className="metrics"><Metric icon={Clock3} value="1.5" label="hours" /><Metric icon={Package} value="24" label="kits" /><Metric icon={UsersRound} value="12" label="people" /></div><div className="feedback-block"><strong>How did it go?</strong><div className="feedback-row">{["Great", "Good", "Needs help"].map((option) => <button key={option} className={feedback === option ? "selected" : ""} onClick={() => setFeedback(option)}>{option}</button>)}</div></div><div className="screen-actions"><PrimaryButton disabled={!feedback} onClick={() => go(4)}>Done <ArrowRight /></PrimaryButton></div></section>;

    if (screen === 8) return <section className="screen ask-screen"><AppBar title="Ask Kapit" onBack={() => go(4)} action={<Chip tone="coral"><Sparkles /> Assist</Chip>} /><div className="flow-heading"><h1>Say it your way.</h1></div>{askState !== "draft" && <label className="prompt-box"><span>YOUR REQUEST</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} /><small><ShieldCheck /> You approve before posting.</small></label>}{askState === "processing" && <div className="processing"><Sparkles /><strong>Building your draft…</strong></div>}{askState === "draft" && <div className="draft-form"><div className="draft-title"><span><small>DRAFT</small><strong>Review</strong></span><Pencil /></div>{([["Title", "title"], ["Time", "schedule"], ["Area", "location"], ["Type", "exchange"]] as const).map(([label, key]) => <label key={key}><span>{label}</span><input value={draft[key]} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} /></label>)}</div>}<div className="ai-flow-graphic" aria-hidden><span><MessageCircle /></span><ArrowRight /><span><Sparkles /></span><ArrowRight /><span><Check /></span></div><div className="screen-actions">{askState === "draft" ? <PrimaryButton onClick={() => go(9)}>Find matches <ArrowRight /></PrimaryButton> : <PrimaryButton disabled={askState === "processing" || !prompt.trim()} onClick={processPrompt}>Create draft <Sparkles /></PrimaryButton>}</div></section>;

    return <section className="screen match-screen"><AppBar title="Matches" onBack={() => go(8)} action={<Chip tone="success">3 verified</Chip>} /><div className="flow-heading"><h1>Best matches.</h1></div><div className="people-list">{matches.map((person) => <PersonCard key={person.name} person={person} onChoose={() => openCoordinate(person, 9)} />)}</div><small className="privacy-line boxed"><ShieldCheck /> You choose. Details stay hidden.</small><div className="screen-actions"><button className="text-button centered" onClick={() => go(4)}>Not now</button></div></section>;
  };

  return <main className="kapit"><header className="showcase-header"><div className="brand"><img src="/kapit-logo.svg" alt="" /><strong>kapit</strong><small>DESIGN BUILD</small></div><nav aria-label="Showcase mode"><button className={tab === "kapit" ? "active" : ""} onClick={() => setTab("kapit")}>Kapit Mockups</button><button className={tab === "source" ? "active" : ""} onClick={() => setTab("source")}>Source References</button></nav></header>{tab === "kapit" ? <div className="workspace"><aside><small>10 EDITABLE SCREENS</small>{screens.map((title, index) => <button className={screen === index ? "active" : ""} onClick={() => go(index)} key={title}><b>{String(index + 1).padStart(2, "0")}</b>{title}</button>)}<p className="note"><b>Prototype mode</b><br />Local state only. No accounts, maps, payments, or live AI.</p></aside><section className="stage"><PhoneShell screen={screen} go={go}>{renderScreen()}</PhoneShell></section><section className="details"><small>SCREEN {String(screen + 1).padStart(2, "0")} / 10</small><h2>{screens[screen]}</h2><p>Clean Uber-inspired hierarchy with Kapit community detail.</p><hr /><small>TRUST CUE</small><p>Verified identity · privacy boundary · protected coordination</p><small>STATE</small><p>{role} mode · {verified ? "Verified" : "Preview"}</p></section></div> : <div className="sources">{!inspect ? <><div className="source-intro"><small>SOURCE / 10 · PRESERVED</small><h1>Mobile UI source baseline</h1><p>Original exports remain available as visual references. Kapit concepts live in the primary tab.</p></div><div className="source-grid">{sources.map((source, index) => <button className={selectedSource === index ? "selected" : ""} onClick={() => { setSelectedSource(index); setInspect(true); }} key={source.id}><Asset source={source} small /><small>{source.group}</small><strong>{source.title}</strong></button>)}</div></> : <div className="source-inspect"><div className="rail">{sources.map((source, index) => <button className={selectedSource === index ? "active" : ""} onClick={() => setSelectedSource(index)} key={source.id}>{source.id} · {source.title}</button>)}</div><div className="source-view"><Asset source={sources[selectedSource]} /></div><div className="source-info"><small>{sources[selectedSource].group}</small><h2>{sources[selectedSource].title}</h2><p>{sources[selectedSource].pattern}</p><button onClick={() => setInspect(false)}>Back to all sources</button></div></div>}</div>}</main>;
}
