import type { FileIconProps } from "./types"

/**
 * Corpus file icon — badge variant.
 * Light/dark artwork layers switch on Tailwind's `dark` variant.
 */
export function FileBadgeCorpus({
  size = 64,
  title = "Corpus file",
  className,
  ...props
}: FileIconProps) {
  return (
    <svg
      viewBox="-44 -48 1068 1114"
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
            id="corpus-badge-l-linearGradient-2"
          >
            <stop stopColor="#FBFAFF" offset="0%"></stop>
            <stop stopColor="#E8E7F0" offset="100%"></stop>
          </linearGradient>
          <path
            d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z"
            id="corpus-badge-l-path-3"
          ></path>

          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-badge-l-filter-5"
          >
            <feGaussianBlur
              stdDeviation="5"
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
              values="0 0 0 0 0.989073057   0 0 0 0 0.989073057   0 0 0 0 0.989073057  0 0 0 1 0"
              type="matrix"
              in="shadowInnerInner1"
              result="shadowMatrixInner1"
            ></feColorMatrix>
            <feGaussianBlur
              stdDeviation="5.5"
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
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0"
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
            id="corpus-badge-l-filter-6"
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
            id="corpus-badge-l-linearGradient-7"
          >
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
          </linearGradient>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-badge-l-filter-9"
          >
            <feOffset
              dx="0"
              dy="4"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="4"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.655695735   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0"
              type="matrix"
              in="shadowBlurOuter1"
              result="shadowMatrixOuter1"
            ></feColorMatrix>
            <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
          <path
            d="M190,0 L688,0 C777.566859,0 822.350288,0 850.175144,27.8248558 C857.969778,35.6194896 864.348349,44.7112465 869.025334,54.6931524 C878,73.8474329 878,98.5649553 878,148 C878,197.435045 878,222.152567 869.025334,241.306848 C864.348349,251.288754 857.969778,260.38051 850.175144,268.175144 C822.350288,296 777.566859,296 688,296 L190,296 C100.433141,296 55.6497116,296 27.8248558,268.175144 C20.030222,260.38051 13.6516509,251.288754 8.9746663,241.306848 C0,222.152567 0,197.435045 0,148 C0,98.5649553 0,73.8474329 8.9746663,54.6931524 C13.6516509,44.7112465 20.030222,35.6194896 27.8248558,27.8248558 C55.6497116,0 100.433141,0 190,0 Z"
            id="corpus-badge-l-path-10"
          ></path>
          <filter
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            id="corpus-badge-l-filter-11"
          >
            <feOffset
              dx="-9"
              dy="-18"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="13.5"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feComposite
              in="shadowBlurOuter1"
              in2="SourceAlpha"
              operator="out"
              result="shadowBlurOuter1"
            ></feComposite>
            <feColorMatrix
              values="0 0 0 0 0.0196078431   0 0 0 0 0   0 0 0 0 0.309803922  0 0 0 0.121568627 0"
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
            id="corpus-badge-l-filter-12"
          >
            <feGaussianBlur
              stdDeviation="6"
              in="SourceAlpha"
              result="shadowBlurInner1"
            ></feGaussianBlur>
            <feOffset
              dx="-16"
              dy="0"
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
              values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.577441023 0"
              type="matrix"
              in="shadowInnerInner1"
            ></feColorMatrix>
          </filter>
          <g id="corpus-badge-l-text-13">
            <g transform="translate(60, 48)">
              <defs>
                <g>
                  <g id="corpus-badge-l-lbl-glyph0-1">
                    <path d="M 125.84375 -36.671875 L 99.140625 -44.671875 C 94.703125 -29.90625 84.1875 -22.078125 68.890625 -22.078125 C 48.0625 -22.078125 35.25 -37.5625 35.25 -62.65625 C 35.25 -87.9375 48.0625 -103.234375 68.703125 -103.234375 C 84.1875 -103.234375 94.703125 -95.40625 99.140625 -80.640625 L 126.203125 -88.828125 C 119.4375 -114.453125 99.6875 -128.15625 68.890625 -128.15625 C 31.328125 -128.15625 5.703125 -102.171875 5.703125 -62.65625 C 5.703125 -23.3125 31.328125 2.84375 69.0625 2.84375 C 99.6875 2.84375 119.078125 -11.03125 125.84375 -36.671875 Z M 125.84375 -36.671875 " />
                  </g>
                  <g id="corpus-badge-l-lbl-glyph0-2">
                    <path d="M 71.5625 3.03125 C 111.25 3.03125 137.59375 -23.140625 137.59375 -62.65625 C 137.59375 -102.34375 111.25 -128.515625 71.5625 -128.515625 C 31.859375 -128.515625 5.703125 -102.34375 5.703125 -62.65625 C 5.703125 -23.140625 31.859375 3.03125 71.5625 3.03125 Z M 71.5625 -22.078125 C 49.65625 -22.078125 35.25 -38.09375 35.25 -62.65625 C 35.25 -87.390625 49.65625 -103.421875 71.5625 -103.421875 C 93.453125 -103.421875 108.046875 -87.390625 108.046875 -62.65625 C 108.046875 -38.09375 93.453125 -22.078125 71.5625 -22.078125 Z M 71.5625 -22.078125 " />
                  </g>
                  <g id="corpus-badge-l-lbl-glyph0-3">
                    <path d="M 10.328125 0 L 38.09375 0 L 38.09375 -58.390625 L 83.84375 0 L 117.84375 0 L 72.796875 -54.109375 C 96.125 -56.609375 109.109375 -69.78125 109.109375 -89.53125 C 109.109375 -111.78125 92.921875 -125.484375 64.265625 -125.484375 L 10.328125 -125.484375 Z M 63.1875 -103.421875 C 74.9375 -103.421875 81.875 -98.796875 81.875 -89.53125 C 81.875 -80.453125 74.9375 -76 63.1875 -76 L 38.09375 -76 L 38.09375 -103.421875 Z M 63.1875 -103.421875 " />
                  </g>
                  <g id="corpus-badge-l-lbl-glyph0-4">
                    <path d="M 10.328125 0 L 38.09375 0 L 38.09375 -50.734375 L 64.265625 -50.734375 C 92.921875 -50.734375 109.109375 -65.140625 109.109375 -88.109375 C 109.109375 -111.25 92.921875 -125.484375 64.265625 -125.484375 L 10.328125 -125.484375 Z M 63.1875 -103.0625 C 74.9375 -103.0625 81.875 -98.078125 81.875 -88.109375 C 81.875 -78.140625 74.9375 -73.15625 63.1875 -73.15625 L 38.09375 -73.15625 L 38.09375 -103.0625 Z M 63.1875 -103.0625 " />
                  </g>
                  <g id="corpus-badge-l-lbl-glyph0-5">
                    <path d="M 62.125 3.03125 C 94.515625 3.03125 113.921875 -16.375 113.921875 -45.390625 L 113.921875 -125.484375 L 85.265625 -125.484375 L 85.265625 -50.015625 C 85.265625 -33.8125 76.890625 -23.859375 62.125 -23.859375 C 47.171875 -23.859375 38.625 -33.8125 38.625 -50.015625 L 38.625 -125.484375 L 9.96875 -125.484375 L 9.96875 -45.390625 C 9.96875 -16.375 29.546875 3.03125 62.125 3.03125 Z M 62.125 3.03125 " />
                  </g>
                  <g id="corpus-badge-l-lbl-glyph0-6">
                    <path d="M 104.484375 -37.375 C 104.484375 -55.890625 93.984375 -67.8125 75.46875 -73.6875 L 53.046875 -80.640625 C 44.328125 -83.484375 40.046875 -88.109375 40.046875 -94.515625 C 40.046875 -102.53125 46.28125 -107.328125 55.53125 -107.328125 C 65.859375 -107.328125 72.984375 -102 75.65625 -90.953125 L 102.171875 -95.046875 C 98.609375 -115.875 81.34375 -128.515625 55.359375 -128.515625 C 28.296875 -128.515625 11.21875 -113.734375 11.21875 -92.203125 C 11.21875 -75.65625 22.609375 -63.1875 39.875 -58.03125 L 59.984375 -51.796875 C 71.5625 -48.234375 75.65625 -43.25 75.65625 -34.890625 C 75.65625 -25.09375 69.0625 -19.046875 57.140625 -19.046875 C 43.96875 -19.046875 33.8125 -27.40625 31.5 -45.21875 L 3.921875 -39.6875 C 8.015625 -10.140625 27.953125 3.03125 57.140625 3.03125 C 87.21875 3.03125 104.484375 -13.171875 104.484375 -37.375 Z M 104.484375 -37.375 " />
                  </g>
                </g>
              </defs>
              <g>
                <g>
                  <use
                    href="#corpus-badge-l-lbl-glyph0-1"
                    x="0.162793"
                    y="162"
                  />
                  <use
                    href="#corpus-badge-l-lbl-glyph0-2"
                    x="134.374792"
                    y="162"
                  />
                  <use
                    href="#corpus-badge-l-lbl-glyph0-3"
                    x="280.512792"
                    y="162"
                  />
                  <use
                    href="#corpus-badge-l-lbl-glyph0-4"
                    x="402.976792"
                    y="162"
                  />
                  <use
                    href="#corpus-badge-l-lbl-glyph0-5"
                    x="518.854793"
                    y="162"
                  />
                  <use
                    href="#corpus-badge-l-lbl-glyph0-6"
                    x="645.768793"
                    y="162"
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
            id="corpus-badge-l-filter-14"
          >
            <feOffset
              dx="0"
              dy="4"
              in="SourceAlpha"
              result="shadowOffsetOuter1"
            ></feOffset>
            <feGaussianBlur
              stdDeviation="5.5"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.0161792652   0 0 0 0 0   0 0 0 0 0  0 0 0 0.462951134 0"
              type="matrix"
              in="shadowBlurOuter1"
            ></feColorMatrix>
          </filter>
        </defs>
        <g stroke="none" fill="none">
          <g>
            <use
              fill="black"
              filter="url(#corpus-badge-l-filter-4)"
              href="#corpus-badge-l-path-3"
            ></use>
            <use
              fill="url(#corpus-badge-l-linearGradient-2)"
              fillRule="evenodd"
              href="#corpus-badge-l-path-3"
            ></use>
            <use
              fill="black"
              filter="url(#corpus-badge-l-filter-5)"
              href="#corpus-badge-l-path-3"
            ></use>
          </g>
          <g
            filter="url(#corpus-badge-l-filter-6)"
            opacity="0.13"
            fillRule="evenodd"
            transform="translate(266.5027, 355.518)"
          >
            <path
              d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z"
              fill="url(#corpus-badge-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
            <path
              d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z"
              fill="url(#corpus-badge-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
            <path
              d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z"
              fill="url(#corpus-badge-l-linearGradient-7)"
              fillRule="nonzero"
            ></path>
          </g>
          <g
            filter="url(#corpus-badge-l-filter-9)"
            fillRule="evenodd"
            transform="translate(0, 266)"
          >
            <g>
              <use
                fill="black"
                filter="url(#corpus-badge-l-filter-11)"
                href="#corpus-badge-l-path-10"
              ></use>
              <use
                fill="#F7B500"
                fillRule="evenodd"
                href="#corpus-badge-l-path-10"
              ></use>
              <use
                fill="black"
                filter="url(#corpus-badge-l-filter-12)"
                href="#corpus-badge-l-path-10"
              ></use>
            </g>
            <g fill="#EDEBF1">
              <use
                filter="url(#corpus-badge-l-filter-14)"
                href="#corpus-badge-l-text-13"
              ></use>
              <use href="#corpus-badge-l-text-13"></use>
            </g>
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
            id="corpus-badge-d-linearGradient-2"
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
            id="corpus-badge-d-filter-4"
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
            id="corpus-badge-d-filter-5"
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
              filter="url(#corpus-badge-d-filter-4)"
              href="#corpus-badge-l-path-3"
            ></use>
            <use
              fill="url(#corpus-badge-d-linearGradient-2)"
              fillRule="evenodd"
              href="#corpus-badge-l-path-3"
            ></use>
            <use
              fill="black"
              filter="url(#corpus-badge-d-filter-5)"
              href="#corpus-badge-l-path-3"
            ></use>
          </g>
          <g
            filter="url(#corpus-badge-l-filter-6)"
            opacity="0.13"
            fillRule="evenodd"
            transform="translate(266.5027, 355.518)"
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
          <g
            filter="url(#corpus-badge-l-filter-9)"
            fillRule="evenodd"
            transform="translate(0, 266)"
          >
            <g>
              <use
                fill="black"
                filter="url(#corpus-badge-l-filter-11)"
                href="#corpus-badge-l-path-10"
              ></use>
              <use
                fill="#F7B500"
                fillRule="evenodd"
                href="#corpus-badge-l-path-10"
              ></use>
              <use
                fill="black"
                filter="url(#corpus-badge-l-filter-12)"
                href="#corpus-badge-l-path-10"
              ></use>
            </g>
            <g fill="#EDEBF1">
              <use
                filter="url(#corpus-badge-l-filter-14)"
                href="#corpus-badge-l-text-13"
              ></use>
              <use href="#corpus-badge-l-text-13"></use>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default FileBadgeCorpus
