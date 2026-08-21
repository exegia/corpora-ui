import { FILE_ICON_CLASS, FILE_ICON_THEME_CSS } from './theme';
import type { FileIconProps } from './types';

/**
 * CFM file icon — badge variant.
 * Switches between light and dark artwork automatically. See `./theme.ts`.
 */
export function FileBadgeCfm({ size = 64, title = 'CFM file', className, ...props }: FileIconProps) {
  return (
    <svg
      viewBox="-36 -48 1060 1114"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={className ? `${FILE_ICON_CLASS} ${className}` : FILE_ICON_CLASS}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <style>{FILE_ICON_THEME_CSS}</style>
      <g data-theme-layer="light">
    <defs>
        <path d="M664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L109.998165,560.737898 C70.6476165,558.461053 45.7264718,552.07676 27.8248558,534.175144 C20.030222,526.38051 13.6516509,517.288754 8.9746663,507.306848 C0,488.152567 0,463.435045 0,414 C0,364.564955 0,339.847433 8.9746663,320.693152 C13.6516509,310.711246 20.030222,301.61949 27.8248558,293.824856 C45.7264718,275.92324 70.6476165,269.538947 109.998165,267.262102 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 Z" id="cfm-badge-l-path-1"></path>
        <linearGradient x1="17.6604798%" y1="0%" x2="49.177195%" y2="97.4557292%" id="cfm-badge-l-linearGradient-2">
            <stop stopColor="#FBFAFF" offset="0%"></stop>
            <stop stopColor="#E8E7F0" offset="100%"></stop>
        </linearGradient>
        <path d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C664.135334,22.0470049 664.135334,22.0470049 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C906.574274,297.524519 906.574274,297.524519 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C881.683622,979.482341 881.683622,979.482341 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C142.511147,979.488853 142.511147,979.488853 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C142.511147,44.5111473 142.511147,44.5111473 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z" id="cfm-badge-l-path-3"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-4">
            <feOffset dx="12" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="19.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.825750613 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-5">
            <feGaussianBlur stdDeviation="5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-10" dy="14" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.989073057   0 0 0 0 0.989073057   0 0 0 0 0.989073057  0 0 0 1 0" type="matrix" in="shadowInnerInner1" result="shadowMatrixInner1"></feColorMatrix>
            <feGaussianBlur stdDeviation="5.5" in="SourceAlpha" result="shadowBlurInner2"></feGaussianBlur>
            <feOffset dx="4" dy="-10" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
            <feComposite in="shadowOffsetInner2" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner2"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" type="matrix" in="shadowInnerInner2" result="shadowMatrixInner2"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-6">
            <feOffset dx="0" dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0889199747   0 0 0 0 0.0889199747   0 0 0 0 0.0889199747  0 0 0 0.03 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="cfm-badge-l-linearGradient-7">
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="cfm-badge-l-linearGradient-8">
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
        </linearGradient>
        <path d="M190,0 L380,0 C469.566859,0 514.350288,0 542.175144,27.8248558 C549.969778,35.6194896 556.348349,44.7112465 561.025334,54.6931524 C570,73.8474329 570,98.5649553 570,148 C570,197.435045 570,222.152567 561.025334,241.306848 C556.348349,251.288754 549.969778,260.38051 542.175144,268.175144 C514.350288,296 469.566859,296 380,296 L190,296 C100.433141,296 55.6497116,296 27.8248558,268.175144 C20.030222,260.38051 13.6516509,251.288754 8.9746663,241.306848 C0,222.152567 0,197.435045 0,148 C0,98.5649553 0,73.8474329 8.9746663,54.6931524 C13.6516509,44.7112465 20.030222,35.6194896 27.8248558,27.8248558 C55.6497116,0 100.433141,0 190,0 Z" id="cfm-badge-l-path-9"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-10">
            <feOffset dx="15" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="13.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0196078431   0 0 0 0 0   0 0 0 0 0.309803922  0 0 0 0.121568627 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-11">
            <feGaussianBlur stdDeviation="7.5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-12" dy="-9" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.572021293 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <g id="cfm-badge-l-text-12"><g transform="translate(51, 36)">
<defs>
<g>
<g id="cfm-badge-l-cfm-badge-l-lbl-glyph0-0">
<path d="M 0 40 L 120 40 L 120 -141 L 0 -141 Z M 14.203125 -133 L 105.796875 -133 L 60 -58.40625 Z M 8 -127.40625 L 55.203125 -50.59375 L 8 26.40625 Z M 64.796875 -50.59375 L 112 -127.40625 L 112 26.40625 Z M 14.203125 32 L 60 -42.59375 L 105.796875 32 Z M 14.203125 32 "/>
</g>
<g id="cfm-badge-l-cfm-badge-l-lbl-glyph0-1">
<path d="M 141.40625 -41.203125 L 111.40625 -50.203125 C 106.40625 -33.59375 94.59375 -24.796875 77.40625 -24.796875 C 54 -24.796875 39.59375 -42.203125 39.59375 -70.40625 C 39.59375 -98.796875 54 -116 77.203125 -116 C 94.59375 -116 106.40625 -107.203125 111.40625 -90.59375 L 141.796875 -99.796875 C 134.203125 -128.59375 112 -144 77.40625 -144 C 35.203125 -144 6.40625 -114.796875 6.40625 -70.40625 C 6.40625 -26.203125 35.203125 3.203125 77.59375 3.203125 C 112 3.203125 133.796875 -12.40625 141.40625 -41.203125 Z M 141.40625 -41.203125 "/>
</g>
<g id="cfm-badge-l-cfm-badge-l-lbl-glyph0-2">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -60 L 88.40625 -60 L 88.40625 -86.59375 L 42.796875 -86.59375 L 42.796875 -114.40625 L 99.796875 -114.40625 L 99.796875 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
<g id="cfm-badge-l-cfm-badge-l-lbl-glyph0-3">
<path d="M 11.59375 0 L 41.40625 0 L 41.40625 -125.59375 L 67.40625 0 L 111.59375 0 L 137.796875 -125.59375 L 137.796875 0 L 167.40625 0 L 167.40625 -141 L 113 -141 L 89.59375 -14.40625 L 66 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
</g>
</defs>
<g id="cfm-badge-l-cfm-badge-l-lbl-surface1">
<g>
  <use xlinkHref="#cfm-badge-l-cfm-badge-l-lbl-glyph0-1" x="0.172602" y="182"/>
  <use xlinkHref="#cfm-badge-l-cfm-badge-l-lbl-glyph0-2" x="151.332602" y="182"/>
  <use xlinkHref="#cfm-badge-l-cfm-badge-l-lbl-glyph0-3" x="259.292602" y="182"/>
</g>
</g>
</g></g>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-l-filter-13">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="11" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.24543391   0 0 0 0 0.172711707   0 0 0 0 0  0 0 0 0.93 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="cfm-badge-l-icon/file/cfm/badge-light" stroke="none" fill="none" xlinkHref="#cfm-badge-l-path-1">
        <g id="cfm-badge-l-Sheet">
            <use fill="black" fillOpacity="1" filter="url(#cfm-badge-l-filter-4)" xlinkHref="#cfm-badge-l-path-3"></use>
            <use fill="url(#cfm-badge-l-linearGradient-2)" fillRule="evenodd" xlinkHref="#cfm-badge-l-path-3"></use>
            <use fill="black" fillOpacity="1" filter="url(#cfm-badge-l-filter-5)" xlinkHref="#cfm-badge-l-path-3"></use>
        </g>
        <g id="cfm-badge-l-Lines" filter="url(#cfm-badge-l-filter-6)" opacity="0.13" strokeWidth="1" fillRule="evenodd" transform="translate(266.5027, 355.518)">
            <path d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z" id="cfm-badge-l-Line-1" fill="url(#cfm-badge-l-linearGradient-7)" fillRule="nonzero"></path>
            <path d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z" id="cfm-badge-l-Line-2" fill="url(#cfm-badge-l-linearGradient-8)" fillRule="nonzero"></path>
            <path d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z" id="cfm-badge-l-Line-3" fill="url(#cfm-badge-l-linearGradient-8)" fillRule="nonzero"></path>
        </g>
        <g id="cfm-badge-l-Badge" strokeWidth="1" fillRule="evenodd" transform="translate(0, 266)">
            <g id="cfm-badge-l-Badge-Plate" opacity="0.98">
                <use fill="black" fillOpacity="1" filter="url(#cfm-badge-l-filter-10)" xlinkHref="#cfm-badge-l-path-9"></use>
                <use fill="#F7B500" fillRule="evenodd" xlinkHref="#cfm-badge-l-path-9"></use>
                <use fill="black" fillOpacity="1" filter="url(#cfm-badge-l-filter-11)" xlinkHref="#cfm-badge-l-path-9"></use>
            </g>
            <g id="cfm-badge-l-Label" fill="#EDEBF1" fillOpacity="1">
                <use filter="url(#cfm-badge-l-filter-13)" xlinkHref="#cfm-badge-l-text-12"></use>
                <use xlinkHref="#cfm-badge-l-text-12"></use>
            </g>
        </g>
    </g>
</g>
      <g data-theme-layer="dark">
    <defs>
        <path d="M664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L109.998165,560.737898 C70.6476165,558.461053 45.7264718,552.07676 27.8248558,534.175144 C20.030222,526.38051 13.6516509,517.288754 8.9746663,507.306848 C0,488.152567 0,463.435045 0,414 C0,364.564955 0,339.847433 8.9746663,320.693152 C13.6516509,310.711246 20.030222,301.61949 27.8248558,293.824856 C45.7264718,275.92324 70.6476165,269.538947 109.998165,267.262102 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 Z" id="cfm-badge-d-path-1"></path>
        <linearGradient x1="25.9355099%" y1="0%" x2="63.5613444%" y2="91.834983%" id="cfm-badge-d-linearGradient-2">
            <stop stopColor="#2A2A2A" stopOpacity="0.980392157" offset="0%"></stop>
            <stop stopColor="#050505" offset="100%"></stop>
        </linearGradient>
        <path d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C664.135334,22.0470049 664.135334,22.0470049 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C906.574274,297.524519 906.574274,297.524519 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C881.683622,979.482341 881.683622,979.482341 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C142.511147,979.488853 142.511147,979.488853 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C142.511147,44.5111473 142.511147,44.5111473 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z" id="cfm-badge-d-path-3"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-4">
            <feOffset dx="12" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="28.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-5">
            <feGaussianBlur stdDeviation="4" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-10" dy="14" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.194256757   0 0 0 0 0.194256757   0 0 0 0 0.194256757  0 0 0 1 0" type="matrix" in="shadowInnerInner1" result="shadowMatrixInner1"></feColorMatrix>
            <feGaussianBlur stdDeviation="4" in="SourceAlpha" result="shadowBlurInner2"></feGaussianBlur>
            <feOffset dx="4" dy="-10" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
            <feComposite in="shadowOffsetInner2" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner2"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.03 0" type="matrix" in="shadowInnerInner2" result="shadowMatrixInner2"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-6">
            <feOffset dx="0" dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0889199747   0 0 0 0 0.0889199747   0 0 0 0 0.0889199747  0 0 0 0.03 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <path d="M190,0 L380,0 C469.566859,0 514.350288,0 542.175144,27.8248558 C549.969778,35.6194896 556.348349,44.7112465 561.025334,54.6931524 C570,73.8474329 570,98.5649553 570,148 C570,197.435045 570,222.152567 561.025334,241.306848 C556.348349,251.288754 549.969778,260.38051 542.175144,268.175144 C514.350288,296 469.566859,296 380,296 L190,296 C100.433141,296 55.6497116,296 27.8248558,268.175144 C20.030222,260.38051 13.6516509,251.288754 8.9746663,241.306848 C0,222.152567 0,197.435045 0,148 C0,98.5649553 0,73.8474329 8.9746663,54.6931524 C13.6516509,44.7112465 20.030222,35.6194896 27.8248558,27.8248558 C55.6497116,0 100.433141,0 190,0 Z" id="cfm-badge-d-path-7"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-8">
            <feOffset dx="-9" dy="-18" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="13.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0196078431   0 0 0 0 0   0 0 0 0 0.309803922  0 0 0 0.121568627 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-9">
            <feGaussianBlur stdDeviation="7" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-14" dy="-3" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.44 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <g id="cfm-badge-d-text-10"><g transform="translate(51, 36)">
<defs>
<g>
<g id="cfm-badge-d-cfm-badge-d-lbl-glyph0-0">
<path d="M 0 40 L 120 40 L 120 -141 L 0 -141 Z M 14.203125 -133 L 105.796875 -133 L 60 -58.40625 Z M 8 -127.40625 L 55.203125 -50.59375 L 8 26.40625 Z M 64.796875 -50.59375 L 112 -127.40625 L 112 26.40625 Z M 14.203125 32 L 60 -42.59375 L 105.796875 32 Z M 14.203125 32 "/>
</g>
<g id="cfm-badge-d-cfm-badge-d-lbl-glyph0-1">
<path d="M 141.40625 -41.203125 L 111.40625 -50.203125 C 106.40625 -33.59375 94.59375 -24.796875 77.40625 -24.796875 C 54 -24.796875 39.59375 -42.203125 39.59375 -70.40625 C 39.59375 -98.796875 54 -116 77.203125 -116 C 94.59375 -116 106.40625 -107.203125 111.40625 -90.59375 L 141.796875 -99.796875 C 134.203125 -128.59375 112 -144 77.40625 -144 C 35.203125 -144 6.40625 -114.796875 6.40625 -70.40625 C 6.40625 -26.203125 35.203125 3.203125 77.59375 3.203125 C 112 3.203125 133.796875 -12.40625 141.40625 -41.203125 Z M 141.40625 -41.203125 "/>
</g>
<g id="cfm-badge-d-cfm-badge-d-lbl-glyph0-2">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -60 L 88.40625 -60 L 88.40625 -86.59375 L 42.796875 -86.59375 L 42.796875 -114.40625 L 99.796875 -114.40625 L 99.796875 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
<g id="cfm-badge-d-cfm-badge-d-lbl-glyph0-3">
<path d="M 11.59375 0 L 41.40625 0 L 41.40625 -125.59375 L 67.40625 0 L 111.59375 0 L 137.796875 -125.59375 L 137.796875 0 L 167.40625 0 L 167.40625 -141 L 113 -141 L 89.59375 -14.40625 L 66 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
</g>
</defs>
<g id="cfm-badge-d-cfm-badge-d-lbl-surface1">
<g>
  <use xlinkHref="#cfm-badge-d-cfm-badge-d-lbl-glyph0-1" x="0.172602" y="182"/>
  <use xlinkHref="#cfm-badge-d-cfm-badge-d-lbl-glyph0-2" x="151.332602" y="182"/>
  <use xlinkHref="#cfm-badge-d-cfm-badge-d-lbl-glyph0-3" x="259.292602" y="182"/>
</g>
</g>
</g></g>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="cfm-badge-d-filter-11">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="11.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.652951134 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="cfm-badge-d-icon/file/cfm/badge-dark" stroke="none" fill="none" xlinkHref="#cfm-badge-d-path-1">
        <g id="cfm-badge-d-Sheet">
            <use fill="black" fillOpacity="1" filter="url(#cfm-badge-d-filter-4)" xlinkHref="#cfm-badge-d-path-3"></use>
            <use fill="url(#cfm-badge-d-linearGradient-2)" fillRule="evenodd" xlinkHref="#cfm-badge-d-path-3"></use>
            <use fill="black" fillOpacity="1" filter="url(#cfm-badge-d-filter-5)" xlinkHref="#cfm-badge-d-path-3"></use>
        </g>
        <g id="cfm-badge-d-Lines" filter="url(#cfm-badge-d-filter-6)" opacity="0.13" strokeWidth="1" fillRule="evenodd" transform="translate(266.5027, 355.518)" fill="#B2B2B2">
            <path d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z" id="cfm-badge-d-Line-1" fillRule="nonzero"></path>
            <path d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z" id="cfm-badge-d-Line-2" fillRule="nonzero"></path>
            <path d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z" id="cfm-badge-d-Line-3" fillRule="nonzero"></path>
        </g>
        <g id="cfm-badge-d-Badge" strokeWidth="1" fillRule="evenodd" transform="translate(0, 266)">
            <g id="cfm-badge-d-Badge-Plate">
                <use fill="black" fillOpacity="1" filter="url(#cfm-badge-d-filter-8)" xlinkHref="#cfm-badge-d-path-7"></use>
                <use fill="#F7B500" fillRule="evenodd" xlinkHref="#cfm-badge-d-path-7"></use>
                <use fill="black" fillOpacity="1" filter="url(#cfm-badge-d-filter-9)" xlinkHref="#cfm-badge-d-path-7"></use>
            </g>
            <g id="cfm-badge-d-Label" fill="#EDEBF1" fillOpacity="1">
                <use filter="url(#cfm-badge-d-filter-11)" xlinkHref="#cfm-badge-d-text-10"></use>
                <use xlinkHref="#cfm-badge-d-text-10"></use>
            </g>
        </g>
    </g>
</g>
    </svg>
  );
}

export default FileBadgeCfm;
