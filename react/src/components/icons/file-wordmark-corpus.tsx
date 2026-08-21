import type { FileIconProps } from "./types"

/**
 * Corpus file icon — wordmark variant.
 * Light/dark artwork layers switch on Tailwind's `dark` variant.
 */
export function FileWordmarkCorpus({
  size = 64,
  title = "Corpus file",
  className,
  ...props
}: FileIconProps) {
  return (
    <svg
      viewBox="0 -48 1024 1114"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g data-theme-layer="light" className="dark:hidden">
        <defs>
          <linearGradient
            x1="17.6604798%"
            y1="0%"
            x2="49.177195%"
            y2="97.4557292%"
            id="corpus-wordmark-l-linearGradient-2"
          >
            <stop stopColor="#FBFAFF" offset="0%"></stop>
            <stop stopColor="#E8E7F0" offset="100%"></stop>
          </linearGradient>
          <path
            d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z"
            id="corpus-wordmark-l-path-3"
          ></path>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-wordmark-l-filter-4"
          >
            <feOffset
              dx="12"
              dy="-3"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="28.5"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0 0"
              type="matrix"
              in="shadowBlurOuter1"
            ></feColorMatrix>
          </filter>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-wordmark-l-filter-5"
          >
            <feGaussianBlur
              stdDeviation="4"
              in="SourceAlpha"
              result="shadowBlurInner1"
            ></feGaussianBlur>
            <feOffset
              dx="-10"
              dy="14"
              in="shadowBlurInner1"
              result="shadowOffsetInner1"
            ></feOffset>
            <feComposite
              in="shadowOffsetInner1"
              in2="SourceAlpha"
              operator="arithmetic"
              k2="-1"
              k3="1"
              result="shadowInnerInner1"
            ></feComposite>
            <feColorMatrix
              values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 1 0"
              type="matrix"
              in="shadowInnerInner1"
              result="shadowMatrixInner1"
            ></feColorMatrix>
            <feGaussianBlur
              stdDeviation="4"
              in="SourceAlpha"
              result="shadowBlurInner2"
            ></feGaussianBlur>
            <feOffset
              dx="4"
              dy="-10"
              in="shadowBlurInner2"
              result="shadowOffsetInner2"
            ></feOffset>
            <feComposite
              in="shadowOffsetInner2"
              in2="SourceAlpha"
              operator="arithmetic"
              k2="-1"
              k3="1"
              result="shadowInnerInner2"
            ></feComposite>
            <feColorMatrix
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.03 0"
              type="matrix"
              in="shadowInnerInner2"
              result="shadowMatrixInner2"
            ></feColorMatrix>
            <feMerge>
              <feMergeNode in="shadowMatrixInner1"></feMergeNode>
              <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
          </filter>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-wordmark-l-filter-6"
          >
            <feOffset
              dx="0"
              dy="5"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="3.5"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.0889199747   0 0 0 0 0.0889199747   0 0 0 0 0.0889199747  0 0 0 0.03 0"
              type="matrix"
              in="shadowBlurOuter1"
              result="shadowMatrixOuter1"
            ></feColorMatrix>
            <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
          <linearGradient
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
            id="corpus-wordmark-l-linearGradient-7"
          >
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
          </linearGradient>
          <g id="corpus-wordmark-l-text-9">
            <g transform="translate(196.5, 746.762)">
              <defs>
                <g>
                  <g id="corpus-wordmark-l-lbl-glyph0-1">
                    <path d="M 21.453125 0.75 C 29.40625 0.75 34.953125 -5.25 34.953125 -12.75 C 34.953125 -20.09375 29.40625 -26.09375 21.453125 -26.09375 C 13.34375 -26.09375 7.796875 -20.09375 7.796875 -12.75 C 7.796875 -5.25 13.34375 0.75 21.453125 0.75 Z M 21.453125 0.75 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-2">
                    <path d="M 106.046875 -30.90625 L 83.546875 -37.65625 C 79.796875 -25.203125 70.953125 -18.59375 58.046875 -18.59375 C 40.5 -18.59375 29.703125 -31.65625 29.703125 -52.796875 C 29.703125 -74.09375 40.5 -87 57.90625 -87 C 70.953125 -87 79.796875 -80.40625 83.546875 -67.953125 L 106.34375 -74.84375 C 100.65625 -96.453125 84 -108 58.046875 -108 C 26.40625 -108 4.796875 -86.09375 4.796875 -52.796875 C 4.796875 -19.65625 26.40625 2.40625 58.203125 2.40625 C 84 2.40625 100.34375 -9.296875 106.046875 -30.90625 Z M 106.046875 -30.90625 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-3">
                    <path d="M 60.296875 2.546875 C 93.75 2.546875 115.953125 -19.5 115.953125 -52.796875 C 115.953125 -86.25 93.75 -108.296875 60.296875 -108.296875 C 26.84375 -108.296875 4.796875 -86.25 4.796875 -52.796875 C 4.796875 -19.5 26.84375 2.546875 60.296875 2.546875 Z M 60.296875 -18.59375 C 41.84375 -18.59375 29.703125 -32.09375 29.703125 -52.796875 C 29.703125 -73.65625 41.84375 -87.15625 60.296875 -87.15625 C 78.75 -87.15625 91.046875 -73.65625 91.046875 -52.796875 C 91.046875 -32.09375 78.75 -18.59375 60.296875 -18.59375 Z M 60.296875 -18.59375 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-4">
                    <path d="M 8.703125 0 L 32.09375 0 L 32.09375 -49.203125 L 70.65625 0 L 99.296875 0 L 61.34375 -45.59375 C 81 -47.703125 91.953125 -58.796875 91.953125 -75.453125 C 91.953125 -94.203125 78.296875 -105.75 54.15625 -105.75 L 8.703125 -105.75 Z M 53.25 -87.15625 C 63.15625 -87.15625 69 -83.25 69 -75.453125 C 69 -67.796875 63.15625 -64.046875 53.25 -64.046875 L 32.09375 -64.046875 L 32.09375 -87.15625 Z M 53.25 -87.15625 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-5">
                    <path d="M 8.703125 0 L 32.09375 0 L 32.09375 -42.75 L 54.15625 -42.75 C 78.296875 -42.75 91.953125 -54.90625 91.953125 -74.25 C 91.953125 -93.75 78.296875 -105.75 54.15625 -105.75 L 8.703125 -105.75 Z M 53.25 -86.84375 C 63.15625 -86.84375 69 -82.65625 69 -74.25 C 69 -65.84375 63.15625 -61.65625 53.25 -61.65625 L 32.09375 -61.65625 L 32.09375 -86.84375 Z M 53.25 -86.84375 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-6">
                    <path d="M 52.34375 2.546875 C 79.65625 2.546875 96 -13.796875 96 -38.25 L 96 -105.75 L 71.84375 -105.75 L 71.84375 -42.15625 C 71.84375 -28.5 64.796875 -20.09375 52.34375 -20.09375 C 39.75 -20.09375 32.546875 -28.5 32.546875 -42.15625 L 32.546875 -105.75 L 8.40625 -105.75 L 8.40625 -38.25 C 8.40625 -13.796875 24.90625 2.546875 52.34375 2.546875 Z M 52.34375 2.546875 " />
                  </g>
                  <g id="corpus-wordmark-l-lbl-glyph0-7">
                    <path d="M 88.046875 -31.5 C 88.046875 -47.09375 79.203125 -57.15625 63.59375 -62.09375 L 44.703125 -67.953125 C 37.34375 -70.34375 33.75 -74.25 33.75 -79.65625 C 33.75 -86.40625 39 -90.453125 46.796875 -90.453125 C 55.5 -90.453125 61.5 -85.953125 63.75 -76.65625 L 86.09375 -80.09375 C 83.09375 -97.65625 68.546875 -108.296875 46.65625 -108.296875 C 23.84375 -108.296875 9.453125 -95.84375 9.453125 -77.703125 C 9.453125 -63.75 19.046875 -53.25 33.59375 -48.90625 L 50.546875 -43.65625 C 60.296875 -40.65625 63.75 -36.453125 63.75 -29.40625 C 63.75 -21.15625 58.203125 -16.046875 48.15625 -16.046875 C 37.046875 -16.046875 28.5 -23.09375 26.546875 -38.09375 L 3.296875 -33.453125 C 6.75 -8.546875 23.546875 2.546875 48.15625 2.546875 C 73.5 2.546875 88.046875 -11.09375 88.046875 -31.5 Z M 88.046875 -31.5 " />
                  </g>
                </g>
              </defs>
              <g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-1"
                    x="0.445112"
                    y="137"
                  />
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-2"
                    x="31.255112"
                    y="137"
                  />
                </g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-3"
                    x="137.965112"
                    y="137"
                  />
                </g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-4"
                    x="254.725112"
                    y="137"
                  />
                </g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-5"
                    x="351.535112"
                    y="137"
                  />
                </g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-6"
                    x="442.795112"
                    y="137"
                  />
                </g>
                <g>
                  <use
                    href="#corpus-wordmark-l-lbl-glyph0-7"
                    x="543.355112"
                    y="137"
                  />
                </g>
              </g>
            </g>
          </g>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-wordmark-l-filter-10"
          >
            <feMorphology
              radius="0.5"
              operator="dilate"
              in="SourceAlpha"
              result="shadowSpreadOuter1"
            ></feMorphology>
            <feOffset
              dx="-3"
              dy="3"
              in="shadowSpreadOuter1"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feColorMatrix
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.0501685049 0"
              type="matrix"
              in="shadowOffsetOuter1"
            ></feColorMatrix>
          </filter>
        </defs>
        <g stroke="none" fill="none">
          <g>
            <use
              fill="black"
              filter="url(#corpus-wordmark-l-filter-4)"
              href="#corpus-wordmark-l-path-3"
            ></use>
            <use
              fill="url(#corpus-wordmark-l-linearGradient-2)"
              fillRule="evenodd"
              href="#corpus-wordmark-l-path-3"
            ></use>
            <use
              fill="black"
              filter="url(#corpus-wordmark-l-filter-5)"
              href="#corpus-wordmark-l-path-3"
            ></use>
          </g>
          <g
            filter="url(#corpus-wordmark-l-filter-6)"
            opacity="0.13"
            fillRule="evenodd"
            transform="translate(256.5027, 305.518)"
          >
            <path
              d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z"
              fill="url(#corpus-wordmark-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
            <path
              d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z"
              fill="url(#corpus-wordmark-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
            <path
              d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z"
              fill="url(#corpus-wordmark-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
          </g>
          <g fill="#D9A300">
            <use
              filter="url(#corpus-wordmark-l-filter-10)"
              href="#corpus-wordmark-l-text-9"
            ></use>
            <use href="#corpus-wordmark-l-text-9"></use>
          </g>
        </g>
      </g>
      <g data-theme-layer="dark" className="hidden dark:inline">
        <defs>
          <linearGradient
            x1="25.9355099%"
            y1="0%"
            x2="63.5613444%"
            y2="91.834983%"
            id="corpus-wordmark-d-linearGradient-2"
          >
            <stop
              stopColor="#2A2A2A"
              stopOpacity="0.980392157"
              offset="0%"
            ></stop>
            <stop stopColor="#050505" offset="100%"></stop>
          </linearGradient>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-wordmark-d-filter-5"
          >
            <feGaussianBlur
              stdDeviation="4"
              in="SourceAlpha"
              result="shadowBlurInner1"
            ></feGaussianBlur>
            <feOffset
              dx="-10"
              dy="14"
              in="shadowBlurInner1"
              result="shadowOffsetInner1"
            ></feOffset>
            <feComposite
              in="shadowOffsetInner1"
              in2="SourceAlpha"
              operator="arithmetic"
              k2="-1"
              k3="1"
              result="shadowInnerInner1"
            ></feComposite>
            <feColorMatrix
              values="0 0 0 0 0.194256757   0 0 0 0 0.194256757   0 0 0 0 0.194256757  0 0 0 1 0"
              type="matrix"
              in="shadowInnerInner1"
              result="shadowMatrixInner1"
            ></feColorMatrix>
            <feGaussianBlur
              stdDeviation="4"
              in="SourceAlpha"
              result="shadowBlurInner2"
            ></feGaussianBlur>
            <feOffset
              dx="4"
              dy="-10"
              in="shadowBlurInner2"
              result="shadowOffsetInner2"
            ></feOffset>
            <feComposite
              in="shadowOffsetInner2"
              in2="SourceAlpha"
              operator="arithmetic"
              k2="-1"
              k3="1"
              result="shadowInnerInner2"
            ></feComposite>
            <feColorMatrix
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.03 0"
              type="matrix"
              in="shadowInnerInner2"
              result="shadowMatrixInner2"
            ></feColorMatrix>
            <feMerge>
              <feMergeNode in="shadowMatrixInner1"></feMergeNode>
              <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
          </filter>
        </defs>
        <g stroke="none" fill="none">
          <g>
            <use
              fill="black"
              filter="url(#corpus-wordmark-l-filter-4)"
              href="#corpus-wordmark-l-path-3"
            ></use>
            <use
              fill="url(#corpus-wordmark-d-linearGradient-2)"
              fillRule="evenodd"
              href="#corpus-wordmark-l-path-3"
            ></use>
            <use
              fill="black"
              filter="url(#corpus-wordmark-d-filter-5)"
              href="#corpus-wordmark-l-path-3"
            ></use>
          </g>
          <g
            filter="url(#corpus-wordmark-l-filter-6)"
            opacity="0.13"
            fillRule="evenodd"
            transform="translate(256.5027, 305.518)"
            fill="#B2B2B2"
          >
            <path
              d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z"
              fillRule="nonzero"
            ></path>
            <path
              d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z"
              fillRule="nonzero"
            ></path>
            <path
              d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z"
              fillRule="nonzero"
            ></path>
          </g>
          <g fill="#F5C400">
            <use
              filter="url(#corpus-wordmark-l-filter-10)"
              href="#corpus-wordmark-l-text-9"
            ></use>
            <use href="#corpus-wordmark-l-text-9"></use>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default FileWordmarkCorpus
