// Static artwork for the boy and his big loyal dog companion.
const INK = "#302b2d";
const SKIN = "#c68e69";
const SKIN_D = "#a86f4f";
const HAND = "#d29c76";
const HAIR = "#2a1f1c";
const HAIR_L = "#74584d";
const IRIS = "#3a2519";
const CREAM = "#e1ddd3";
const MOUTH = "#4a201b";
const CHEEK = "#8f5238";
const SILVER = "#e9e9f0";

// Big Dog Palette
const DOG_GOLD = "#d99543";
const DOG_GOLD_D = "#b97328";
const DOG_CHEST = "#f7ebcf";
const DOG_EAR = "#b87024";
const DOG_NOSE = "#231a19";
const DOG_TONGUE = "#ff7380";

export const OUTFITS = {
  street: {
    tee: "#2c2729", teeD: "#4a4245", graphic: "#f5c542",
    jeans: "#8fa9c4", jeansD: "#68829f", jeansL: "#b3c8dc",
    shoe: "#f7f4ee", sole: "#e1ddd3", accent: "#a47c66",
    hp: "#e6dcc8", hpD: "#b89f80", chain: "#e8c15a", watch: "#302b2d",
    collar: "#e0533c",
  },
  cream: {
    tee: "#efe7d6", teeD: "#d3c9b3", graphic: "#e0663a",
    jeans: "#3b3537", jeansD: "#24201f", jeansL: "#554e50",
    shoe: "#f7f4ee", sole: "#cfc7b6", accent: "#e0663a",
    hp: "#a4b2b0", hpD: "#7f908e", chain: "#e9e9f0", watch: "#302b2d",
    collar: "#567c52",
  },
  olive: {
    tee: "#6d7c4e", teeD: "#4f5c37", graphic: "#f3ead2",
    jeans: "#d6c49f", jeansD: "#b3a07a", jeansL: "#e6d9b9",
    shoe: "#f7f4ee", sole: "#e1ddd3", accent: "#6d7c4e",
    hp: "#302b2d", hpD: "#1d191a", chain: "#e8c15a", watch: "#302b2d",
    collar: "#d46b38",
  },
};

const S = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

const arm = (o, name, x, y, rot, watch) => `
<g data-p="${name}" transform="translate(${x} ${y}) rotate(${rot})">
  <rect x="-7.5" y="-7.5" width="49" height="15" rx="7.5" fill="${INK}" stroke="${INK}" stroke-width="7"/>
  <g data-p="${name}O" transform="translate(34 0)">
    <rect x="-7" y="-7" width="35" height="14" rx="7" fill="${INK}" stroke="${INK}" stroke-width="7"/>
    <circle cx="33" cy="0" r="9" fill="${INK}" stroke="${INK}" stroke-width="7"/>
  </g>
  <rect x="-7.5" y="-7.5" width="49" height="15" rx="7.5" fill="${SKIN}"/>
  <path d="M-13 -14 Q8 -17 25 -14 L27 14 Q8 17 -13 14 Q-18 0 -13 -14 Z" fill="${o.tee}" ${S}/>
  <path d="M22 -13 L24 13" fill="none" stroke="${o.teeD}" stroke-width="2.4" stroke-linecap="round"/>
  <g data-p="${name}F" transform="translate(34 0)">
    <rect x="-7" y="-7" width="35" height="14" rx="7" fill="${SKIN}"/>
    <circle cx="33" cy="0" r="9" fill="${HAND}"/>
    ${
      watch
        ? `<rect x="14" y="-8.5" width="9" height="17" rx="3" fill="${o.watch}" stroke="${INK}" stroke-width="2"/>
    <rect x="15.6" y="-4" width="5.8" height="8" rx="1.8" fill="${CREAM}"/>`
        : `<rect x="15" y="-8" width="6" height="16" rx="3" fill="${o.chain}" stroke="${INK}" stroke-width="1.8"/>`
    }
  </g>
</g>`;

const eye = (side, cx) => {
  const cy = 68;
  const almond = `M${cx - 11} ${cy} Q${cx} ${cy - 13} ${cx + 11} ${cy} Q${cx} ${cy + 9.5} ${cx - 11} ${cy} Z`;
  return `
<clipPath id="clip${side}"><path d="${almond}"/></clipPath>
<g data-p="eye${side}">
  <path d="${almond}" fill="#fbf9f5"/>
  <g clip-path="url(#clip${side})">
    <g data-p="pup${side}">
      <circle cx="${cx}" cy="${cy}" r="6.4" fill="${IRIS}"/>
      <circle cx="${cx}" cy="${cy}" r="3.2" fill="${INK}"/>
      <circle cx="${cx + 2.4}" cy="${cy - 2.6}" r="1.8" fill="#fff"/>
    </g>
  </g>
  <path d="M${cx - 12} ${cy + 0.5} Q${cx} ${cy - 14} ${cx + 12} ${cy + 0.5}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
</g>`;
};

// Big Dog SVG definition
const makeBigDog = (o) => `
<g data-p="dogContainer">
  <!-- Dog Shadow -->
  <ellipse data-p="dogShadow" cx="5" cy="5" rx="38" ry="8" fill="#1c1210" opacity="0.32"/>

  <!-- Floating Snore Zzz -->
  <g data-p="dogZzz" opacity="0" transform="translate(18 -55)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#6d7c99">Z</text>
    <text x="9" y="-9" font-family="system-ui, sans-serif" font-weight="900" font-size="10" fill="#8898b8">z</text>
    <text x="16" y="-16" font-family="system-ui, sans-serif" font-weight="900" font-size="8" fill="#a4b4d4">z</text>
  </g>

  <!-- Bark "WOOF!" Comic Bubble -->
  <g data-p="dogBark" opacity="0" transform="translate(32 -96)">
    <path d="M-6 4 L-14 14 L-4 8 Z" fill="#e0533c"/>
    <rect x="-10" y="-22" width="64" height="24" rx="7" fill="#e0533c" stroke="${INK}" stroke-width="2.5"/>
    <text x="22" y="-6" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#ffffff" letter-spacing="1">WOOF!</text>
  </g>

  <g data-p="dogRoot">
    <!-- Fluffy Tail -->
    <g data-p="dogTail" transform="translate(-22 -22)">
      <path d="M0 0 C-18 -8 -36 -2 -34 -24 C-32 -38 -18 -42 -8 -30 C-2 -22 -4 -8 0 0 Z" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M-24 -14 C-28 -24 -20 -30 -12 -25" fill="none" stroke="${DOG_GOLD_D}" stroke-width="2.2" stroke-linecap="round"/>
    </g>

    <!-- Hind Quarters -->
    <path d="M-24 -4 C-30 -22 -14 -42 2 -42 C10 -42 16 -30 14 -4 Z" fill="${DOG_GOLD_D}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <ellipse cx="-16" cy="-2" rx="14" ry="7" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3"/>

    <!-- Torso -->
    <g data-p="dogTorso">
      <path d="M-20 -18 C-24 -56 -4 -78 16 -78 C32 -78 40 -50 32 -18 C30 -6 -18 -6 -20 -18 Z" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M0 -14 C-4 -42 6 -68 18 -72 C28 -68 32 -42 24 -14 Z" fill="${DOG_CHEST}"/>

      <path d="M3 -67 Q16 -63 31 -69" fill="none" stroke="${o.collar || "#e0533c"}" stroke-width="5.5" stroke-linecap="round"/>
      <circle cx="16" cy="-61" r="3.2" fill="${o.chain}" stroke="${INK}" stroke-width="1.8"/>
    </g>

    <!-- Paws -->
    <g data-p="dogPawL" transform="translate(4 -4)">
      <path d="M-6 -26 L-6 -4 C-6 3 6 3 6 -4 L6 -26 Z" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <ellipse cx="0" cy="-2" rx="7.5" ry="5.5" fill="${DOG_CHEST}" stroke="${INK}" stroke-width="2.2"/>
    </g>
    <g data-p="dogPawR" transform="translate(24 -4)">
      <path d="M-6 -26 L-6 -4 C-6 3 6 3 6 -4 L6 -26 Z" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <ellipse cx="0" cy="-2" rx="7.5" ry="5.5" fill="${DOG_CHEST}" stroke="${INK}" stroke-width="2.2"/>
    </g>

    <!-- Head & Muzzle -->
    <g data-p="dogHead" transform="translate(18 -76)">
      <!-- Back Floppy Ear -->
      <g data-p="dogEarL" transform="translate(-14 -14)">
        <path d="M0 0 C-14 -2 -22 18 -16 34 C-10 40 2 30 5 12 Z" fill="${DOG_EAR}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      </g>

      <!-- Head Base -->
      <path d="M-16 -12 C-18 -32 14 -34 26 -16 C34 -3 28 20 8 20 C-10 20 -14 0 -16 -12 Z" fill="${DOG_GOLD}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>

      <!-- Jowls & Nose -->
      <path d="M12 -8 C28 -8 38 6 32 16 C26 24 10 24 6 15 Z" fill="${DOG_CHEST}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M26 -3 Q33 -3 31 4 Q25 8 22 3 Z" fill="${DOG_NOSE}"/>

      <!-- Mouth & Tongue -->
      <g data-p="dogMouth" transform="translate(20 12)">
        <path d="M0 0 Q6 8 12 0 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.2"/>
        <path data-p="dogTongue" d="M2 2 Q6 12 10 2 Z" fill="${DOG_TONGUE}"/>
      </g>

      <!-- Awake Eyes -->
      <g data-p="dogEyes">
        <ellipse cx="2" cy="-10" rx="4.5" ry="5.2" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <g data-p="dogPupL">
          <circle cx="2.5" cy="-9.5" r="3.2" fill="${IRIS}"/>
          <circle cx="3.8" cy="-11" r="1.1" fill="#fff"/>
        </g>
        <ellipse cx="15" cy="-10" rx="4.5" ry="5.2" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <g data-p="dogPupR">
          <circle cx="15.5" cy="-9.5" r="3.2" fill="${IRIS}"/>
          <circle cx="16.8" cy="-11" r="1.1" fill="#fff"/>
        </g>
        <circle cx="2" cy="-17" r="1.6" fill="${DOG_EAR}"/>
        <circle cx="15" cy="-17" r="1.6" fill="${DOG_EAR}"/>
      </g>

      <!-- Sleeping Eyes -->
      <g data-p="dogSleepEyes" opacity="1" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round">
        <path d="M-1 -8 Q3 -4 7 -8"/>
        <path d="M12 -8 Q16 -4 20 -8"/>
      </g>

      <!-- Front Floppy Ear -->
      <g data-p="dogEarR" transform="translate(-4 -14)">
        <path d="M0 0 C-10 -4 -20 16 -14 36 C-8 44 4 36 6 16 Z" fill="${DOG_EAR}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
        <path d="M-6 8 C-10 18 -6 28 -2 30" fill="none" stroke="${DOG_GOLD_D}" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</g>`;

export const BOY_VIEWBOX = "-60 0 320 295";

const makeBoy = (o) => `
<circle cx="100" cy="150" r="99" fill="${SKIN}" opacity="0.28"/>
<circle cx="100" cy="150" r="88" fill="${CREAM}"/>
<ellipse data-p="shadow" cx="100" cy="286" rx="50" ry="7" fill="#1c1210" opacity="0.35"/>

<!-- Boy Character -->
<g data-p="root">
  <g ${S}>
    <path d="M55 204 L99 204 L98 264 Q98 268 94 268 L60 268 Q55 268 55 264 Q46 234 55 204 Z" fill="${o.jeans}"/>
    <path d="M101 204 L145 204 Q154 234 145 264 Q145 268 140 268 L106 268 Q102 268 102 264 Z" fill="${o.jeans}"/>
    <ellipse cx="72" cy="232" rx="9" ry="16" fill="${o.jeansL}" stroke="none" opacity="0.55"/>
    <ellipse cx="128" cy="232" rx="9" ry="16" fill="${o.jeansL}" stroke="none" opacity="0.55"/>
    <path d="M78 208 Q82 236 80 246 M122 208 Q118 236 120 246 M57 249 Q78 256 97 250 M57 257 Q78 264 97 258 M103 250 Q122 256 143 249 M103 258 Q122 264 143 257" fill="none" stroke="${o.jeansD}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M58 222 L74 222 L74 240 L58 240 M142 222 L126 222 L126 240 L142 240" fill="none" stroke="${o.jeansD}" stroke-width="2.4" stroke-linejoin="round"/>

    <path d="M50 270 Q50 257 66 257 L99 257 L99 282 Q99 287 94 287 L56 287 Q49 287 49 280 Z" fill="${o.shoe}"/>
    <path d="M49.5 276 L99 276 L99 282 Q99 287 94 287 L56 287 Q49.5 287 49.5 281 Z" fill="${o.sole}"/>
    <path d="M50 270 Q50 258 62 257.5 Q69 258 71 270 Z" fill="${o.accent}"/>
    <path d="M78 262 L92 264 M78 268 L92 270" fill="none" stroke-width="2"/>

    <path d="M150 270 Q150 257 134 257 L101 257 L101 282 Q101 287 106 287 L144 287 Q151 287 151 280 Z" fill="${o.shoe}"/>
    <path d="M150.5 276 L101 276 L101 282 Q101 287 106 287 L144 287 Q150.5 287 150.5 281 Z" fill="${o.sole}"/>
    <path d="M150 270 Q150 258 138 257.5 Q131 258 129 270 Z" fill="${o.accent}"/>
    <path d="M122 262 L108 264 M122 268 L108 270" fill="none" stroke-width="2"/>
  </g>

  <g data-p="upper">
    <path d="M52 124 Q52 106 78 104 L122 104 Q148 106 148 124 L152 205 Q152 215 140 215 L60 215 Q48 215 48 205 Z" fill="${o.tee}" ${S}/>
    <path d="M62 148 Q70 160 64 176 M138 148 Q130 160 136 176 M58 194 Q64 202 60 210 M142 194 Q136 202 140 210" fill="none" stroke="${o.teeD}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="100" cy="162" r="15" fill="${o.graphic}" stroke="${INK}" stroke-width="2.6"/>
    <ellipse cx="94.5" cy="157" rx="1.9" ry="2.8" fill="${INK}"/>
    <ellipse cx="105.5" cy="157" rx="1.9" ry="2.8" fill="${INK}"/>
    <path d="M92 165 Q100 174 108 165" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>

    <rect x="88" y="96" width="24" height="22" rx="9" fill="${SKIN_D}" ${S}/>
    <path d="M79 106 Q100 133 121 106 L116 102.5 Q100 120 84 102.5 Z" fill="${o.teeD}" ${S}/>

    <path d="M87 110 Q100 140 113 110" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M87 110 Q100 140 113 110" fill="none" stroke="${o.chain}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="100" cy="125" r="3.6" fill="${o.chain}" stroke="${INK}" stroke-width="1.8"/>

    <g data-p="head">
      <g transform="translate(100 108) scale(0.94) translate(-100 -108)">
        <path d="M55 52 Q50 62 54 76 L60 72 Q58 64 61 54 Z" fill="${HAIR}" opacity="0.55"/>
        <path d="M145 52 Q150 62 146 76 L140 72 Q142 64 139 54 Z" fill="${HAIR}" opacity="0.55"/>
        <ellipse cx="56.5" cy="70" rx="8" ry="11" fill="${SKIN}" ${S}/>
        <ellipse cx="143.5" cy="70" rx="8" ry="11" fill="${SKIN}" ${S}/>
        <ellipse cx="56.5" cy="71" rx="3.5" ry="5.5" fill="${SKIN_D}" opacity="0.6"/>
        <ellipse cx="143.5" cy="71" rx="3.5" ry="5.5" fill="${SKIN_D}" opacity="0.6"/>
        <circle cx="56.5" cy="81.5" r="2.6" fill="${SILVER}" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="143.5" cy="81.5" r="2.6" fill="${SILVER}" stroke="${INK}" stroke-width="1.6"/>
        <path d="M57 58 C57 34 76 22 100 22 C124 22 143 34 143 58 C143 76 135 92 120 101 Q110 108 100 108 Q90 108 80 101 C65 92 57 76 57 58 Z" fill="${SKIN}" ${S}/>
        <path d="M66 86 Q70 100 90 104 Q100 106 110 104 Q130 100 134 86 Q128 97 112 100 Q100 102 88 100 Q72 97 66 86 Z" fill="${SKIN_D}" opacity="0.28"/>

        <g data-p="feat">
          <circle data-p="cheekL" cx="76" cy="85" r="6" fill="${CHEEK}" opacity="0.2"/>
          <circle data-p="cheekR" cx="124" cy="85" r="6" fill="${CHEEK}" opacity="0.2"/>
          <g data-p="eyes">${eye("L", 84)}${eye("R", 116)}</g>
          <g data-p="arcs" opacity="0" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round">
            <path d="M74 71 Q84 60 94 71"/><path d="M106 71 Q116 60 126 71"/>
          </g>
          <path data-p="browL" d="M70 56 Q83 50 97 54" fill="none" stroke="${HAIR}" stroke-width="5.2" stroke-linecap="round"/>
          <path data-p="browR" d="M103 54 Q117 50 130 56" fill="none" stroke="${HAIR}" stroke-width="5.2" stroke-linecap="round"/>
          <path d="M100.5 70 Q98.5 80 96.5 84.5 M93.5 86.5 Q100 91 106.5 86.5" fill="none" stroke="${SKIN_D}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="97.6" cy="87.6" r="1.3" fill="${SKIN_D}"/><circle cx="102.6" cy="87.6" r="1.3" fill="${SKIN_D}"/>
          <path data-p="tear" opacity="0" d="M75 82 q-4 7 0 10 q4 -3 0 -10 z" fill="#c9d2d1" stroke="${INK}" stroke-width="2"/>
          <path data-p="mouth" d="M90 94 Q100 99 110 94 Q100 99 90 94 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
        </g>

        <path data-p="hair" d="M54 56 C43 30 55 3 83 -3 Q92 -9 100 -4 Q108 -9 117 -3 C145 3 157 30 146 56 C147 62 149 68 146 74 C142 66 141 60 139 55 C137 49 131 47 127 51 L130 58 C123 51 116 47 110 43 Q104 37 100 35 Q96 37 90 43 C84 47 77 51 70 58 L73 51 C69 47 63 49 61 55 C59 61 58 67 54 74 C52 68 54 62 54 56 Z" fill="${HAIR}" ${S}/>
        <path d="M62 30 Q75 10 98 8 M104 8 Q130 10 140 30 M76 30 Q86 18 96 20 M104 20 Q116 18 126 30 M60 50 Q64 40 70 36 M140 50 Q136 40 130 36" fill="none" stroke="${HAIR_L}" stroke-width="2.6" stroke-linecap="round" opacity="0.75"/>
        <path d="M76 12 Q82 4 92 4 M110 4 Q120 3 126 10" fill="none" stroke="${HAIR_L}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>

        <path d="M54 60 C48 24 72 3 100 3 C128 3 152 24 146 60" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
        <path d="M54 60 C48 24 72 3 100 3 C128 3 152 24 146 60" fill="none" stroke="${o.hp}" stroke-width="4" stroke-linecap="round"/>
        <rect x="44" y="55" width="20" height="36" rx="10" fill="${o.hp}" stroke="${INK}" stroke-width="3.2"/>
        <ellipse cx="54" cy="73" rx="4.6" ry="10" fill="${o.hpD}"/>
        <circle cx="54" cy="73" r="2" fill="${o.accent}"/>
        <rect x="136" y="55" width="20" height="36" rx="10" fill="${o.hp}" stroke="${INK}" stroke-width="3.2"/>
        <ellipse cx="146" cy="73" rx="4.6" ry="10" fill="${o.hpD}"/>
        <circle cx="146" cy="73" r="2" fill="${o.accent}"/>
      </g>
    </g>

    ${arm(o, "armL", 66, 122, 95, true)}
    ${arm(o, "armR", 134, 122, 85, false)}
  </g>
</g>

<!-- Big Dog Companion (Placed after boy to render in front when running around) -->
${makeBigDog(o)}
`;

export const boyInner = (name = "street") => makeBoy(OUTFITS[name] || OUTFITS.street);