function MinerIcon() {
  return (
    <svg viewBox="0 0 96 64" fill="none" className="h-full w-full">
      <rect x="2" y="8" width="92" height="48" rx="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="32" r="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="68" cy="32" r="13" stroke="currentColor" strokeWidth="2" />
      <path d="M28 19v26M15 32h26M19 23l18 18M37 23 19 41" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path d="M68 19v26M55 32h26M59 23l18 18M77 23 59 41" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <path d="M10 50h76" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <circle cx="48" cy="32" r="2.5" fill="currentColor" />
    </svg>
  );
}

function BitcoinIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" />
      <text x="24" y="32" textAnchor="middle" fill="currentColor" fontSize="26" fontWeight="700" fontFamily="Arial, sans-serif">
        ₿
      </text>
    </svg>
  );
}

function EthereumIcon() {
  return (
    <svg viewBox="0 0 40 56" fill="none" className="h-full w-full">
      <path d="M20 2 4 28l16 9 16-9L20 2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 39 4 30l16 24 16-24-16 9Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 2v35M4 28l16 9 16-9" stroke="currentColor" strokeWidth="1.4" opacity="0.65" />
    </svg>
  );
}

function LitecoinIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" />
      <text x="24" y="33" textAnchor="middle" fill="currentColor" fontSize="28" fontWeight="700" fontFamily="Arial, sans-serif">
        Ł
      </text>
    </svg>
  );
}

function PickaxeIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <path d="M10 18c14-8 30-8 44 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 20 20 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 14c2 9 7 14 14 16M56 14c-2 9-7 14-14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 40 56" fill="none" className="h-full w-full">
      <path d="M23 2 7 31h12l-3 23 18-31H22l1-21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path d="M18 6 12 42M36 6 30 42M8 18h32M6 30h32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function HexMinerIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <path d="M32 4 56 18v28L32 60 8 46V18L32 4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M22 24h12a8 8 0 1 1 0 16h-4l10 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="19" r="2.5" fill="currentColor" />
    </svg>
  );
}

function FanIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M24 20c-3-9 1-14 7-11 5 3 2 9-4 12M28 24c9-3 14 1 11 7-3 5-9 2-12-4M24 28c3 9-1 14-7 11-5-3-2-9 4-12M20 24c-9 3-14-1-11-7 3-5 9-2 12 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-full w-full">
      <rect x="12" y="12" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="2" />
      <rect x="21" y="21" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 12V5M28 12V5M36 12V5M20 44v7M28 44v7M36 44v7M12 20H5M12 28H5M12 36H5M44 20h7M44 28h7M44 36h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DogecoinIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" />
      <text x="24" y="33" textAnchor="middle" fill="currentColor" fontSize="27" fontWeight="700" fontFamily="Arial, sans-serif">
        Ð
      </text>
    </svg>
  );
}

export default function HeroBackdrop() {
  return (
    <>
      <div className="hero-backdrop-left pointer-events-none absolute inset-y-0 left-0 hidden w-[24%] overflow-hidden sm:block" aria-hidden="true">
        <div className="absolute left-[6%] top-[22%] h-16 w-16 text-accent opacity-[0.10] hero-icon-7">
          <HexMinerIcon />
        </div>
        <div className="absolute left-[18%] top-[66%] h-11 w-11 text-aqua opacity-[0.10] hero-icon-8">
          <FanIcon />
        </div>
        <div className="absolute left-[3%] top-[72%] h-12 w-12 text-violet opacity-[0.09] hero-icon-9">
          <ChipIcon />
        </div>
        <div className="absolute left-[16%] top-[40%] h-10 w-10 text-amber opacity-[0.10] hero-icon-3">
          <DogecoinIcon />
        </div>
      </div>
      <div className="hero-backdrop pointer-events-none absolute inset-y-0 right-0 hidden w-[65%] overflow-hidden sm:block" aria-hidden="true">
      <div className="absolute right-[8%] top-[16%] h-24 w-36 text-accent opacity-[0.10] hero-icon-1">
        <MinerIcon />
      </div>
      <div className="absolute right-[36%] top-[54%] h-14 w-14 text-amber opacity-[0.11] hero-icon-2">
        <BitcoinIcon />
      </div>
      <div className="absolute right-[62%] top-[14%] h-14 w-10 text-aqua opacity-[0.10] hero-icon-3">
        <EthereumIcon />
      </div>
      <div className="absolute right-[18%] top-[62%] h-16 w-16 text-aqua opacity-[0.09] hero-icon-4">
        <PickaxeIcon />
      </div>
      <div className="absolute right-[52%] top-[68%] h-10 w-7 text-amber opacity-[0.11] hero-icon-6">
        <BoltIcon />
      </div>
      <div className="absolute right-[72%] top-[42%] h-11 w-11 text-accent opacity-[0.10] hero-icon-5">
        <HashIcon />
      </div>
      <div className="absolute right-[5%] top-[66%] h-12 w-12 text-aqua opacity-[0.09] hero-icon-2">
        <LitecoinIcon />
      </div>
      </div>
    </>
  );
}
