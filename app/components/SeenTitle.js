export default function SeenTitle() {
  return (
    <>
      {/* 
        SVG filter:
        ทำ texture แบบซ่า ๆ + รอยขูดขีด
        แต่ยังคงขอบมนของตัวอักษร
      */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter
            id="seen-scrape"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            {/* grain texture */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.15"
              numOctaves="3"
              seed="12"
              result="grain"
            />

            <feColorMatrix
              in="grain"
              type="matrix"
              values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 8 -3.65
              "
              result="speckles"
            />

            {/* horizontal scratch texture */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.42"
              numOctaves="2"
              seed="5"
              result="scratchNoise"
            />

            <feColorMatrix
              in="scratchNoise"
              type="matrix"
              values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 6 -3.25
              "
              result="scratches"
            />

            {/* merge textures */}
            <feComposite
              in="speckles"
              in2="scratches"
              operator="over"
              result="allMarks"
            />

            {/* cut texture into text */}
            <feComposite
              in="SourceGraphic"
              in2="allMarks"
              operator="out"
            />
          </filter>
        </defs>
      </svg>

      <h1 className="seen-title" aria-label="SEEN">
        SEEN
      </h1>
    </>
  );
}