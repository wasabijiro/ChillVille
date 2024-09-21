export const NounsGlasses = () => (
  <div className="w-32 h-12 relative mb-2">
    {/* Left lens */}
    <div className="absolute left-0 w-14 h-full bg-red-500">
      <div className="absolute inset-1 flex">
        <div className="w-1/2 h-full bg-white"></div>
        <div className="w-1/2 h-full bg-black"></div>
      </div>
    </div>

    {/* Right lens */}
    <div className="absolute right-0 w-14 h-full bg-red-500">
      <div className="absolute inset-1 flex">
        <div className="w-1/2 h-full bg-white"></div>
        <div className="w-1/2 h-full bg-black"></div>
      </div>
    </div>

    {/* Bridge */}
    <div className="absolute left-1/2 top-1/2 w-4 h-2 bg-red-500 -translate-x-1/2 -translate-y-1/2"></div>

    {/* Left arm */}
    <div className="absolute left-0 top-1/2 w-3 h-2 bg-red-500 -translate-y-1/2 -translate-x-full"></div>

    {/* Right arm */}
    <div className="absolute right-0 top-1/2 w-3 h-2 bg-red-500 -translate-y-1/2 translate-x-full"></div>
  </div>
)