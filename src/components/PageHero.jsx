export default function PageHero({ title, subtitle }) {
  return (
    <div className="relative py-10 md:py-14 text-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-foreground">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Logo */}


        {/* Subtitle pill */}
        {subtitle && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-white/80">{subtitle}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
          {title}
        </h1>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-10 bg-accent/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <div className="h-px w-10 bg-accent/60" />
        </div>
      </div>
    </div>
  );
}