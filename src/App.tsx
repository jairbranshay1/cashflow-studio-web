import React, { useEffect, useState } from "react";

type Plan = "free" | "pro";

type OfferType = "workshop" | "program" | "digital" | "coaching";

type HostPlatform =
  | "stan"
  | "gumroad"
  | "shopify"
  | "squarespace"
  | "notion"
  | "other";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type AudienceSize = "small" | "medium" | "large";

type OfferStatus = "draft" | "ready";

export interface Offer {
  id: string;
  name: string;
  niche: string;
  audienceDescription: string;
  mainProblem: string;
  desiredOutcome: string;
  offerType: OfferType;
  sessionsCount?: number;
  sessionLengthMinutes?: number;
  includesReplays: boolean;
  hasGroupChat: boolean;
  bonuses: string;
  hostPlatform: HostPlatform;
  hostPlatformOther?: string;
  experienceLevel: ExperienceLevel;
  audienceSize: AudienceSize;
  isFirstPaidOffer: boolean;
  price: number;
  currency: string;
  status: OfferStatus;
  createdAt: string;
}

type View =
  | "landing"
  | "auth"
  | "dashboard"
  | "wizard"
  | "offerDetail";

interface User {
  id: string;
  email: string;
  plan: Plan;
}

const LOCAL_STORAGE_USER_KEY = "cashflowStudioUser";
const LOCAL_STORAGE_OFFERS_KEY = "cashflowStudioOffers";

const App: React.FC = () => {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Load from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView("dashboard");
    }
    const storedOffers = localStorage.getItem(LOCAL_STORAGE_OFFERS_KEY);
    if (storedOffers) {
      setOffers(JSON.parse(storedOffers));
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_OFFERS_KEY, JSON.stringify(offers));
  }, [offers]);

  const handleLogin = (email: string) => {
    const newUser: User = {
      id: "user-" + Date.now(),
      email,
      plan: "free", // default – you’ll wire up billing later
    };
    setUser(newUser);
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setOffers([]);
    setSelectedOfferId(null);
    setView("landing");
  };

  const handleCreateOffer = (offer: Offer) => {
    setOffers((prev) => [...prev, offer]);
    setSelectedOfferId(offer.id);
    setView("offerDetail");
  };

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || null;
  const offersCount = offers.length;
  const maxFreeOffers = 1;

  const isOnFreePlan = user?.plan === "free";
  const reachedFreeLimit = isOnFreePlan && offersCount >= maxFreeOffers;

  // Top-level routing
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Header
          user={user}
          onLoginClick={() => setView("auth")}
          onDashboardClick={() => setView("dashboard")}
        />
        <main className="flex-1">
          <Landing onGetStarted={() => setView("auth")} />
        </main>
        <Footer />
      </div>
    );
  }

  if (view === "auth") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Header
          user={user}
          onLoginClick={() => {}}
          onDashboardClick={() => setView("dashboard")}
        />
        <main className="flex-1 flex items-center justify-center">
          <AuthForm
            onAuthenticated={(email) => handleLogin(email)}
            onBack={() => setView("landing")}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    // safety fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">
            Please log in to access Cashflow Studio.
          </h1>
          <button
            onClick={() => setView("auth")}
            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (view === "wizard") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Header
          user={user}
          onLoginClick={() => {}}
          onDashboardClick={() => setView("dashboard")}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl p-4 md:p-8">
            <OfferWizard
              user={user}
              onCancel={() => setView("dashboard")}
              onComplete={handleCreateOffer}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === "offerDetail" && selectedOffer) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Header
          user={user}
          onLoginClick={() => {}}
          onDashboardClick={() => setView("dashboard")}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl p-4 md:p-8 space-y-8">
            <button
              onClick={() => setView("dashboard")}
              className="text-sm text-slate-300 hover:text-slate-100 mb-4"
            >
              ← Back to dashboard
            </button>
            <OfferSummary offer={selectedOffer} />
            <SalesCopyBlock offer={selectedOffer} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header
        user={user}
        onLoginClick={() => {}}
        onDashboardClick={() => setView("dashboard")}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl p-4 md:p-8 space-y-8">
          <DashboardHeader user={user} offersCount={offersCount} />
          {reachedFreeLimit && (
            <PlanUpgradeNotice maxFreeOffers={maxFreeOffers} />
          )}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Offers</h2>
            <button
              onClick={() => {
                if (reachedFreeLimit) {
                  alert(
                    "You’re on the free plan, which allows 1 offer. Upgrade to Pro in a real version to unlock unlimited offers."
                  );
                  return;
                }
                setView("wizard");
              }}
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 font-semibold text-sm"
            >
              + Create New Offer
            </button>
          </div>
          <OffersList
            offers={offers}
            onSelect={(id) => {
              setSelectedOfferId(id);
              setView("offerDetail");
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

// -----------------
// Presentational Components
// -----------------

const Header: React.FC<{
  user: User | null;
  onLoginClick: () => void;
  onDashboardClick: () => void;
  onLogout?: () => void;
}> = ({ user, onLoginClick, onDashboardClick, onLogout }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={onDashboardClick} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            $
          </div>
          <div className="flex flex-col leading-tight text-left">
            <span className="font-semibold text-sm sm:text-base">
              Cashflow Studio
            </span>
            <span className="text-xs text-slate-400">
              Turn content into offers
            </span>
          </div>
        </button>
        <div className="flex items-center gap-3 text-sm">
          {!user && (
            <>
              <button
                onClick={onLoginClick}
                className="px-3 py-1 rounded border border-slate-700 hover:border-slate-500"
              >
                Log in
              </button>
            </>
          )}
          {user && (
            <>
              <span className="hidden sm:inline text-slate-300">
                {user.email} ·{" "}
                {user.plan === "free" ? "Free plan" : "Pro subscriber"}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-1 rounded border border-slate-700 hover:border-slate-500"
                >
                  Log out
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Landing: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
            For IG, TikTok & YouTube educators
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Turn your content into a{" "}
            <span className="text-emerald-400">clear, sellable offer</span> in
            under an hour.
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Cashflow Studio walks you through choosing your offer, structuring
            it, pricing it, and then writes your landing page copy, social posts
            and DM script — so you can finally say “yes” when people ask if you
            coach or have a program.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm"
            >
              Get started free
            </button>
            <span className="text-xs text-slate-400">
              No credit card required · 1 offer free
            </span>
          </div>
          <ul className="text-xs md:text-sm text-slate-300 space-y-1">
            <li>• Guided Offer Wizard — workshop, program, digital, or 1:1</li>
            <li>• Auto-generated landing page layout & copy</li>
            <li>• Launch scripts for posts & DMs</li>
          </ul>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
          <h2 className="text-lg font-semibold">Plans</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-2 text-sm">
              <div className="font-semibold">Starter</div>
              <div className="text-2xl font-bold">$0</div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• 1 full offer</li>
                <li>• Full offer structure</li>
                <li>• Preview of sales copy</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500 bg-slate-900/80 p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Pro</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                  Best for launching
                </span>
              </div>
              <div className="text-2xl font-bold">$21</div>
              <div className="text-xs text-slate-300">per month</div>
              <div className="text-[11px] text-emerald-300">
                or $202/year (≈20% off)
              </div>
              <ul className="text-xs text-slate-300 space-y-1 pt-1">
                <li>• Unlimited offers</li>
                <li>• Full landing page copy</li>
                <li>• Social posts & DM scripts</li>
                <li>• Export & future templates</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            You can start on the free plan and upgrade once you’re ready to
            launch multiple offers.
          </p>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="border-t border-slate-800 text-xs text-slate-500 py-3 px-4 text-center">
    Cashflow Studio · Turn your knowledge into cashflow. This is a demo web app
    skeleton — hook it to your backend & billing to go live.
  </footer>
);

const AuthForm: React.FC<{
  onAuthenticated: (email: string) => void;
  onBack: () => void;
}> = ({ onAuthenticated, onBack }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
      <button
        onClick={onBack}
        className="text-xs text-slate-300 hover:text-slate-100"
      >
        ← Back
      </button>
      <h2 className="text-xl font-semibold">Log in / Sign up</h2>
      <p className="text-xs text-slate-400">
        For this starter version, just enter your email to create a local
        account stored in your browser.
      </p>
      <div className="space-y-2">
        <label className="text-xs text-slate-300">Email</label>
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        onClick={() => {
          if (!email) {
            alert("Please enter an email.");
            return;
          }
          onAuthenticated(email);
        }}
        className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-400 font-semibold text-sm text-slate-950"
      >
        Continue
      </button>
    </div>
  );
};

const DashboardHeader: React.FC<{ user: User; offersCount: number }> = ({
  user,
  offersCount,
}) => {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Welcome back 👋</h1>
      <p className="text-sm text-slate-300">
        You’re on the{" "}
        <span className="font-semibold">
          {user.plan === "free" ? "Starter (Free)" : "Pro"}
        </span>{" "}
        plan. You currently have{" "}
        <span className="font-semibold">{offersCount}</span>{" "}
        {offersCount === 1 ? "offer" : "offers"} saved.
      </p>
    </div>
  );
};

const PlanUpgradeNotice: React.FC<{ maxFreeOffers: number }> = ({
  maxFreeOffers,
}) => (
  <div className="rounded-lg border border-amber-500/60 bg-amber-500/10 p-4 text-xs text-amber-100 space-y-1">
    <div className="font-semibold">Free plan limit reached</div>
    <p>
      The free plan lets you create up to{" "}
      <span className="font-semibold">{maxFreeOffers}</span> offer. In a live
      version, you’d be able to upgrade to Pro ($21/mo or $202/yr) to unlock
      unlimited offers and full copy exports.
    </p>
  </div>
);

const OffersList: React.FC<{
  offers: Offer[];
  onSelect: (id: string) => void;
}> = ({ offers, onSelect }) => {
  if (offers.length === 0) {
    return (
      <div className="text-sm text-slate-400 border border-dashed border-slate-700 rounded-lg p-4">
        You don’t have any offers yet. Click “Create New Offer” to run through
        the wizard and build your first one.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {offers.map((offer) => (
        <button
          key={offer.id}
          onClick={() => onSelect(offer.id)}
          className="text-left bg-slate-900/70 border border-slate-800 hover:border-emerald-500/60 rounded-lg p-4 space-y-2 text-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{offer.name || "Untitled offer"}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {offer.offerType}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            Helping {offer.audienceDescription || "your people"} go from{" "}
            {offer.mainProblem || "their current struggle"} to{" "}
            {offer.desiredOutcome || "their desired result"}.
          </p>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>
              {offer.currency}
              {offer.price.toFixed(0)}
            </span>
            <span className="capitalize">{offer.status}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// -----------------
// Offer Wizard
// -----------------

interface OfferWizardProps {
  user: User;
  onCancel: () => void;
  onComplete: (offer: Offer) => void;
}

const OfferWizard: React.FC<OfferWizardProps> = ({
  onCancel,
  onComplete,
}) => {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [audienceDescription, setAudienceDescription] = useState("");
  const [mainProblem, setMainProblem] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("workshop");
  const [sessionsCount, setSessionsCount] = useState<number>(1);
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState<number>(60);
  const [includesReplays, setIncludesReplays] = useState(true);
  const [hasGroupChat, setHasGroupChat] = useState(false);
  const [bonuses, setBonuses] = useState("");
  const [hostPlatform, setHostPlatform] = useState<HostPlatform>("stan");
  const [hostPlatformOther, setHostPlatformOther] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("beginner");
  const [audienceSize, setAudienceSize] = useState<AudienceSize>("small");
  const [isFirstPaidOffer, setIsFirstPaidOffer] = useState(true);
  const [price, setPrice] = useState<number>(97);
  const [currency, setCurrency] = useState<string>("$");
  const [status, setStatus] = useState<OfferStatus>("ready");

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onCancel();
    }
  };

  const handleFinish = () => {
    const newOffer: Offer = {
      id: "offer-" + Date.now(),
      name: name || "Untitled Offer",
      niche,
      audienceDescription,
      mainProblem,
      desiredOutcome,
      offerType,
      sessionsCount,
      sessionLengthMinutes,
      includesReplays,
      hasGroupChat,
      bonuses,
      hostPlatform,
      hostPlatformOther,
      experienceLevel,
      audienceSize,
      isFirstPaidOffer,
      price,
      currency,
      status,
      createdAt: new Date().toISOString(),
    };
    onComplete(newOffer);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Offer Wizard</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span>Step {step} of {totalSteps}</span>
        <div className="flex-1 h-1 rounded bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">About you & your people</h3>
          <Field label="Working title for this offer (you can change later)">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Credit Confidence Bootcamp"
            />
          </Field>
          <Field label="What do you create content about?">
            <input
              className="input"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Money, credit, side hustles..."
            />
          </Field>
          <Field label="Who is this for? (describe your ideal client)">
            <textarea
              className="input min-h-[60px]"
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              placeholder="New traders, busy moms, ex-offenders rebuilding credit..."
            />
          </Field>
          <Field label="What is the main problem they’re stuck on?">
            <textarea
              className="input min-h-[60px]"
              value={mainProblem}
              onChange={(e) => setMainProblem(e.target.value)}
              placeholder="They’re overwhelmed and don’t know where to start with fixing their credit..."
            />
          </Field>
          <Field label="After your offer, what result should they have?">
            <textarea
              className="input min-h-[60px]"
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="Have a clear plan to get to 700+ credit and 3 accounts in good standing..."
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">Offer format & structure</h3>
          <Field label="What kind of offer do you want to create?">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill
                label="Live workshop"
                value="workshop"
                selected={offerType}
                onSelect={(v) => setOfferType(v as OfferType)}
              />
              <RadioPill
                label="4-week program"
                value="program"
                selected={offerType}
                onSelect={(v) => setOfferType(v as OfferType)}
              />
              <RadioPill
                label="Digital product"
                value="digital"
                selected={offerType}
                onSelect={(v) => setOfferType(v as OfferType)}
              />
              <RadioPill
                label="1:1 coaching"
                value="coaching"
                selected={offerType}
                onSelect={(v) => setOfferType(v as OfferType)}
              />
            </div>
          </Field>
          {(offerType === "workshop" || offerType === "program") && (
            <>
              <Field label="How many live sessions?">
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={sessionsCount}
                  onChange={(e) =>
                    setSessionsCount(Number(e.target.value) || 1)
                  }
                />
              </Field>
              <Field label="Session length (minutes)">
                <input
                  className="input"
                  type="number"
                  min={15}
                  value={sessionLengthMinutes}
                  onChange={(e) =>
                    setSessionLengthMinutes(Number(e.target.value) || 60)
                  }
                />
              </Field>
              <Field>
                <label className="flex items-center gap-2 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={includesReplays}
                    onChange={(e) => setIncludesReplays(e.target.checked)}
                  />
                  Includes call replays
                </label>
              </Field>
            </>
          )}
          <Field>
            <label className="flex items-center gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={hasGroupChat}
                onChange={(e) => setHasGroupChat(e.target.checked)}
              />
              Includes group chat / community
            </label>
          </Field>
          <Field label="Any bonuses you’d like to include?">
            <textarea
              className="input min-h-[60px]"
              value={bonuses}
              onChange={(e) => setBonuses(e.target.value)}
              placeholder="Workbook, templates, private Q&A call..."
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">Where you’ll deliver it</h3>
          <Field label="Where will you host or deliver this offer?">
            <div className="grid grid-cols-2 gap-2">
              <RadioPill
                label="Stan"
                value="stan"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
              <RadioPill
                label="Gumroad"
                value="gumroad"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
              <RadioPill
                label="Shopify"
                value="shopify"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
              <RadioPill
                label="Squarespace/Wix"
                value="squarespace"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
              <RadioPill
                label="Notion / Doc"
                value="notion"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
              <RadioPill
                label="Other"
                value="other"
                selected={hostPlatform}
                onSelect={(v) => setHostPlatform(v as HostPlatform)}
              />
            </div>
          </Field>
          {hostPlatform === "other" && (
            <Field label="Where exactly? (optional)">
              <input
                className="input"
                value={hostPlatformOther}
                onChange={(e) => setHostPlatformOther(e.target.value)}
                placeholder="Zoom + Stripe, custom site, etc."
              />
            </Field>
          )}
          <h3 className="font-semibold pt-3">Your experience & audience</h3>
          <Field label="How experienced are you with this topic?">
            <div className="flex gap-2 flex-wrap">
              <RadioPill
                label="Just starting"
                value="beginner"
                selected={experienceLevel}
                onSelect={(v) => setExperienceLevel(v as ExperienceLevel)}
              />
              <RadioPill
                label="Pretty solid"
                value="intermediate"
                selected={experienceLevel}
                onSelect={(v) => setExperienceLevel(v as ExperienceLevel)}
              />
              <RadioPill
                label="Expert / seasoned"
                value="advanced"
                selected={experienceLevel}
                onSelect={(v) => setExperienceLevel(v as ExperienceLevel)}
              />
            </div>
          </Field>
          <Field label="How big is your audience? (roughly)">
            <div className="flex gap-2 flex-wrap">
              <RadioPill
                label="Under 5k"
                value="small"
                selected={audienceSize}
                onSelect={(v) => setAudienceSize(v as AudienceSize)}
              />
              <RadioPill
                label="5k–50k"
                value="medium"
                selected={audienceSize}
                onSelect={(v) => setAudienceSize(v as AudienceSize)}
              />
              <RadioPill
                label="50k+"
                value="large"
                selected={audienceSize}
                onSelect={(v) => setAudienceSize(v as AudienceSize)}
              />
            </div>
          </Field>
          <Field>
            <label className="flex items-center gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isFirstPaidOffer}
                onChange={(e) => setIsFirstPaidOffer(e.target.checked)}
              />
              This is my first paid offer
            </label>
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">Pricing & status</h3>
          <Field label="Currency symbol">
            <input
              className="input w-20"
              value={currency}
              onChange={(e) => setCurrency(e.target.value || "$")}
            />
          </Field>
          <Field label="Price you want to charge (you can adjust later)">
            <input
              className="input"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Offer status">
            <div className="flex gap-2">
              <RadioPill
                label="Draft"
                value="draft"
                selected={status}
                onSelect={(v) => setStatus(v as OfferStatus)}
              />
              <RadioPill
                label="Ready to launch"
                value="ready"
                selected={status}
                onSelect={(v) => setStatus(v as OfferStatus)}
              />
            </div>
          </Field>
          <div className="text-xs text-slate-400 border border-slate-800 rounded-lg p-3">
            In a future version, this step could show a recommended price range
            based on your experience, audience size, and format (e.g. $97–$197
            for a first workshop) — but here you can simply choose a number that
            feels fair.
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handleBack}
          className="px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 text-xs"
        >
          {step === 1 ? "Back" : "Previous"}
        </button>
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
          >
            Save Offer
          </button>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label?: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="space-y-1">
    {label && <div className="text-xs text-slate-200">{label}</div>}
    {children}
  </div>
);

const RadioPill: React.FC<{
  label: string;
  value: string;
  selected: string;
  onSelect: (v: string) => void;
}> = ({ label, value, selected, onSelect }) => {
  const isActive = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`px-3 py-1.5 rounded-full border text-xs ${
        isActive
          ? "border-emerald-500 bg-emerald-500/20 text-emerald-100"
          : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
};

// -----------------
// Offer Summary & Sales Copy
// -----------------

const OfferSummary: React.FC<{ offer: Offer }> = ({ offer }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h2 className="text-xl font-semibold mb-1">{offer.name}</h2>
          <p className="text-xs text-slate-400">
            Created to help {offer.audienceDescription || "your audience"} go
            from{" "}
            <span className="italic">
              {offer.mainProblem || "their current struggle"}
            </span>{" "}
            to{" "}
            <span className="italic">
              {offer.desiredOutcome || "their desired outcome"}
            </span>
            .
          </p>
        </div>
        <div className="text-right text-xs text-slate-300">
          <div className="font-semibold">
            {offer.currency}
            {offer.price.toFixed(0)}
          </div>
          <div className="capitalize">{offer.status}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        <SummaryItem label="Offer type" value={offer.offerType} />
        <SummaryItem label="Experience level" value={offer.experienceLevel} />
        <SummaryItem label="Audience size" value={offer.audienceSize} />
        {(offer.offerType === "workshop" || offer.offerType === "program") && (
          <>
            <SummaryItem
              label="Sessions"
              value={`${offer.sessionsCount || 1} x ${
                offer.sessionLengthMinutes || 60
              } min`}
            />
            <SummaryItem
              label="Replays"
              value={offer.includesReplays ? "Included" : "No replays"}
            />
          </>
        )}
        <SummaryItem
          label="Group chat"
          value={offer.hasGroupChat ? "Yes" : "No"}
        />
        <SummaryItem
          label="Host"
          value={
            offer.hostPlatform === "other"
              ? offer.hostPlatformOther || "Other"
              : offer.hostPlatform
          }
        />
      </div>

      {offer.bonuses && (
        <div className="pt-3 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-200 mb-1">
            Bonuses
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-line">
            {offer.bonuses}
          </p>
        </div>
      )}
    </div>
  );
};

const SummaryItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="space-y-0.5">
    <div className="text-[11px] text-slate-400">{label}</div>
    <div className="text-xs text-slate-100 capitalize">{value}</div>
  </div>
);

const SalesCopyBlock: React.FC<{ offer: Offer }> = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const hero = generateHero(offer);
  const who = generateWhoSection(offer);
  const problem = generateProblemSection(offer);
  const outcome = generateOutcomeSection(offer);
  const whatYouGet = generateWhatYouGetSection(offer);
  const faq = generateFAQSection(offer);
  const cta = generateCTASection(offer);

  const fullCopy = [
    hero,
    "",
    who,
    "",
    problem,
    "",
    outcome,
    "",
    whatYouGet,
    "",
    faq,
    "",
    cta,
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Could not copy to clipboard. You can copy manually.");
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Landing page layout & copy (universal)
        </h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 text-xs"
        >
          {copied ? "Copied!" : "Copy full page"}
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Paste this into your landing page tool (Stan, Gumroad, Shopify,
        Squarespace, Notion, etc.). You can adjust length and sections based on
        the platform.
      </p>
      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs whitespace-pre-wrap text-slate-100 max-h-[420px] overflow-auto">
        {fullCopy}
      </pre>
    </div>
  );
};

// -----------------
// Sales Copy Generators
// -----------------

function generateHero(offer: Offer): string {
  const offerTypeLabel =
    offer.offerType === "workshop"
      ? "live workshop"
      : offer.offerType === "program"
      ? "4-week program"
      : offer.offerType === "digital"
      ? "digital toolkit"
      : "1:1 coaching";

  return [
    "HERO SECTION",
    "Headline:",
    `${offer.name} – a ${offerTypeLabel} to help ${
      offer.audienceDescription || "your people"
    } finally go from ${offer.mainProblem || "stuck and confused"} to ${
      offer.desiredOutcome || "clear, confident action"
    }.`,
    "",
    "Subheadline:",
    `Stop trying to piece everything together from random posts. Get a step-by-step plan, support, and accountability to actually make this happen.`,
  ].join("\n");
}

function generateWhoSection(offer: Offer): string {
  return [
    "WHO THIS IS FOR",
    `This is for you if:`,
    `• You are ${offer.audienceDescription || "tired of doing this alone"}.`,
    `• You’re stuck because ${offer.mainProblem || "you don’t have a clear plan."}`,
    `• You want ${offer.desiredOutcome ||
      "a clear roadmap and someone to walk you through it."}`,
  ].join("\n");
}

function generateProblemSection(offer: Offer): string {
  return [
    "THE PROBLEM",
    `Right now, you’re likely dealing with:`,
    `• ${offer.mainProblem || "Overwhelm, mixed information and second-guessing every move."}`,
    `• Trying to learn from YouTube, TikTok and random posts but not seeing real results.`,
    `• Feeling like you “should” be further along by now.`,
  ].join("\n");
}

function generateOutcomeSection(offer: Offer): string {
  return [
    "THE PROMISE / OUTCOME",
    `By the end of ${offer.name}, you will:`,
    `• Have ${offer.desiredOutcome ||
      "a simple, repeatable plan you can trust."}`,
    `• Know exactly what to do next instead of guessing.`,
    `• Feel more confident because you’re not doing this alone.`,
  ].join("\n");
}

function generateWhatYouGetSection(offer: Offer): string {
  const lines: string[] = [];
  lines.push("WHAT YOU GET");

  if (offer.offerType === "workshop" || offer.offerType === "program") {
    lines.push(
      `• ${
        offer.sessionsCount || 1
      } live ${offer.sessionLengthMinutes || 60}-minute session(s) where we break everything down step by step.`
    );
    if (offer.includesReplays) {
      lines.push("• Replays so you can rewatch anytime.");
    }
  }

  if (offer.offerType === "digital") {
    lines.push(
      "• A complete digital toolkit (templates, checklists or scripts) you can reuse over and over."
    );
  }

  if (offer.offerType === "coaching") {
    lines.push(
      "• Private 1:1 calls tailored to your exact situation and goals."
    );
  }

  if (offer.hasGroupChat) {
    lines.push("• Group chat/community so you don’t have to do this alone.");
  }

  if (offer.bonuses) {
    lines.push(`• Bonuses: ${offer.bonuses}`);
  }

  lines.push(
    `• Access and delivery via ${
      offer.hostPlatform === "other"
        ? offer.hostPlatformOther || "your chosen platform"
        : offer.hostPlatform
    }.`
  );

  return lines.join("\n");
}

function generateFAQSection(offer: Offer): string {
  const priceLine = `${offer.currency}${offer.price.toFixed(0)}`;

  return [
    "FAQ",
    "",
    "Q: How much time do I need?",
    `A: Plan for ${
      offer.offerType === "program"
        ? "about 2–3 hours per week between calls and implementation."
        : offer.offerType === "workshop"
        ? "the live session plus a bit of time to apply what you learn."
        : "a few focused hours to go through the material and implement."
    }`,
    "",
    "Q: Do I need to be advanced to join?",
    `A: No. This is designed for ${
      offer.experienceLevel === "beginner"
        ? "beginners who want a solid foundation."
        : offer.experienceLevel === "intermediate"
        ? "people who already know the basics but need structure to get results."
        : "people who are serious about leveling up what they’re already doing."
    }`,
    "",
    "Q: What if I can’t make it live?",
    offer.offerType === "workshop" || offer.offerType === "program"
      ? `A: Replays ${
          offer.includesReplays ? "are included" : "may be available depending on the session."
        }, so you can catch up on your schedule.`
      : "A: This is digital / 1:1, so timing is flexible.",
    "",
    "Q: What does it cost?",
    `A: The investment is ${priceLine}.`,
    "If this helps you reach the outcome we’re aiming for, it can easily pay for itself many times over.",
  ].join("\n");
}

function generateCTASection(offer: Offer): string {
  const priceLine = `${offer.currency}${offer.price.toFixed(0)}`;
  return [
    "CALL TO ACTION",
    `Ready to stop trying to figure this out alone and actually get ${offer.desiredOutcome ||
      "results"}?`,
    "",
    `→ Tap the button to join ${offer.name} for ${priceLine}.`,
    "Spots may be limited depending on how many people we can realistically support well.",
  ].join("\n");
}

export default App;
