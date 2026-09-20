const S = "currentColor";

function Head({ cx = 150, cy = 40 }: { cx?: number; cy?: number }) {
  return <circle cx={cx} cy={cy} r="18" />;
}

/** Seated hand mobility: fingers open and close, wrist rotates. */
function HandDemo() {
  return (
    <svg viewBox="0 0 300 200" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" className="h-full w-full">
      {/* seated body */}
      <Head cx={110} cy={54} />
      <path d="M110 72v56M110 128h44M84 92h52" />
      <path d="M110 128 96 176M154 128v48" />
      {/* forearm */}
      <path d="M136 92h38" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-12 174 92;14 174 92;-12 174 92" dur="2.4s" repeatCount="indefinite" />
        <path d="M174 92h22" />
        {/* fingers spread / close */}
        <g>
          <animateTransform attributeName="transform" type="scale" values="1;1.35;1" dur="1.2s" repeatCount="indefinite" additive="sum" />
          <path d="M196 92l20-16M196 92h24M196 92l20 16M196 92l14-24" transform="translate(-196 -92) translate(196 92)" />
        </g>
      </g>
    </svg>
  );
}

/** LSVT BIG reaching: both arms sweep from low to full overhead extension. */
function ReachDemo() {
  return (
    <svg viewBox="0 0 300 200" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" className="h-full w-full">
      <Head />
      <path d="M150 58v66M150 124l-26 52M150 124l26 52" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 150 78;-58 150 78;0 150 78" dur="2.6s" repeatCount="indefinite" />
        <path d="M150 78 100 104" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 150 78;58 150 78;0 150 78" dur="2.6s" repeatCount="indefinite" />
        <path d="M150 78 200 104" />
      </g>
      <circle cx="150" cy="16" r="7" fill={S} stroke="none" opacity=".6">
        <animate attributeName="opacity" values=".2;1;.2" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** Fluid rhythm step: alternating high marching steps. */
function StepDemo() {
  return (
    <svg viewBox="0 0 300 200" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" className="h-full w-full">
      <Head />
      <path d="M150 58v66" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-26 150 124;18 150 124;-26 150 124" dur="1.6s" repeatCount="indefinite" />
        <path d="M150 124 126 178" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="18 150 124;-26 150 124;18 150 124" dur="1.6s" repeatCount="indefinite" />
        <path d="M150 124 174 178" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="24 150 78;-24 150 78;24 150 78" dur="1.6s" repeatCount="indefinite" />
        <path d="M150 78 106 96" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-24 150 78;24 150 78;-24 150 78" dur="1.6s" repeatCount="indefinite" />
        <path d="M150 78 194 96" />
      </g>
    </svg>
  );
}

export const demos = [
  {
    Demo: HandDemo,
    cue: "Open wide, close slow — 10 reps each hand",
    steps: [
      "Sit tall with both feet flat on the floor.",
      "Rest your forearm on your thigh, palm facing up.",
      "Spread every finger as wide as you can, hold 2 seconds.",
      "Close into a soft fist, then rotate the wrist and repeat.",
    ],
  },
  {
    Demo: ReachDemo,
    cue: "Reach BIG toward the star — 8 slow reps",
    steps: [
      "Stand or sit tall, arms relaxed at your sides.",
      "Sweep both arms out and up as high as comfortable.",
      "Stretch the fingertips toward the star, hold 3 seconds.",
      "Lower slowly with control and breathe out.",
    ],
  },
  {
    Demo: StepDemo,
    cue: "March to the beat — 30 seconds",
    steps: [
      "Hold a stable chair or counter if balance feels unsure.",
      "Lift one knee high, swing the opposite arm forward.",
      "Place the heel down first with a big, wide stride.",
      "Keep an even rhythm — count 1-2, 1-2 out loud.",
    ],
  },
];
