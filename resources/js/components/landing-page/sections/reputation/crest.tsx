import { cn } from "@/lib/utils"

interface CrestProps {
    className?: string;
    variant?: string;
}

export const Crest = ({ className, variant }: CrestProps) => {
    switch (variant) {
        case "gold":
            return (
                <svg width="365" height="468" viewBox="0 0 365 468" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_312_85)">
                        <path d="M102.375 89.4753L127.059 64.7924L182.25 50.1384L236.445 64.7924L261.129 89.4753H286.72L295.916 98.6709V214.438L300.272 221.982L313.056 234.765V268.548L281.039 286.455V304.585L295.4 312.876V338.24L268.296 353.888L264.967 366.311L182.25 416.082L98.5368 366.311L95.2079 353.888L68.1036 338.24V312.876L82.4649 304.585V286.455L50.4485 268.548V234.765L63.2318 221.982L67.5879 214.438V98.6709L76.784 89.4753H102.375Z" fill="url(#paint0_linear_312_85)" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M100.373 85.6329L125.834 60.1368L182.25 45L238.666 60.1368L264.128 85.6329H292.585L302.071 95.1315V211.614L306.564 219.407L319.75 232.61V270.605L287.755 289.102V300.6L302.569 309.164V342.594L274.611 358.757L271.177 371.589L182.25 423L93.3233 371.589L89.8895 358.757L61.9313 342.594V309.164L76.7451 300.6V289.102L44.75 270.605V232.61L57.936 219.407L62.4293 211.614V95.1315L71.9151 85.6329H100.373ZM127.059 64.7924L102.375 89.4753H76.784L67.5879 98.6709V214.438L63.2318 221.982L50.4485 234.765V268.548L82.4649 286.455V304.585L68.1036 312.876V338.24L95.2079 353.888L98.5368 366.311L182.25 416.082L264.967 366.311L268.296 353.888L295.4 338.24V312.876L281.039 304.585V286.455L313.056 268.548V234.765L300.272 221.982L295.916 214.438V98.6709L286.72 89.4753H261.129L236.445 64.7924L182.25 50.1384L127.059 64.7924Z" fill="url(#paint1_linear_312_85)" />
                        <path d="M102.375 89.4753L127.059 64.7924L182.25 50.1384L236.445 64.7924L261.129 89.4753H286.72L295.916 98.6709V214.438L300.272 221.982L313.056 234.765V268.548L281.039 286.455V304.585L295.4 312.876V338.24L268.296 353.888L264.967 366.311L182.25 416.082L98.5368 366.311L95.2079 353.888L68.1036 338.24V312.876L82.4649 304.585V286.455L50.4485 268.548V234.765L63.2318 221.982L67.5879 214.438V98.6709L76.784 89.4753H102.375Z" stroke="#C2AA71" strokeWidth="2" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M100.373 85.6329L125.834 60.1368L182.25 45L238.666 60.1368L264.128 85.6329H292.585L302.071 95.1315V211.614L306.564 219.407L319.75 232.61V270.605L287.755 289.102V300.6L302.569 309.164V342.594L274.611 358.757L271.177 371.589L182.25 423L93.3233 371.589L89.8895 358.757L61.9313 342.594V309.164L76.7451 300.6V289.102L44.75 270.605V232.61L57.936 219.407L62.4293 211.614V95.1315L71.9151 85.6329H100.373ZM127.059 64.7924L102.375 89.4753H76.784L67.5879 98.6709V214.438L63.2318 221.982L50.4485 234.765V268.548L82.4649 286.455V304.585L68.1036 312.876V338.24L95.2079 353.888L98.5368 366.311L182.25 416.082L264.967 366.311L268.296 353.888L295.4 338.24V312.876L281.039 304.585V286.455L313.056 268.548V234.765L300.272 221.982L295.916 214.438V98.6709L286.72 89.4753H261.129L236.445 64.7924L182.25 50.1384L127.059 64.7924Z" stroke="#C2AA71" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M137.08 72.5097L182.75 66L228.42 72.5097L252.682 96.5456L255.536 114.572L268.381 125.589V135.103L280.75 145.619V325.387L263.624 335.903L256.964 352.427L182.25 402L108.536 352.427L101.876 335.903L84.75 325.387V145.619L97.1189 135.103V125.589L109.964 114.572L112.818 96.5456L137.08 72.5097Z" stroke="#BDA157" strokeWidth="2" />
                        <path d="M90.75 288V155L103.25 146V131L109.75 125V119L143.75 84.5L182.25 79L220.75 84.5L254.75 119V125L261.25 131V146L273.75 155V288L182.25 348L90.75 288Z" stroke="#BDA157" strokeWidth="8" strokeLinejoin="bevel" />
                        <path d="M140.728 360.698L147.572 341.651L98.75 309V323.058L112.439 334.395L116.545 346.186L140.728 360.698ZM140.728 360.698L182.25 387L223.772 360.698M223.772 360.698L216.928 341.651L265.75 309V323.058L252.061 334.395L247.955 346.186L223.772 360.698Z" stroke="#BDA157" strokeWidth="10" />
                        <circle cx="182.25" cy="108.5" r="23" stroke="#BDA157" strokeWidth="15" />
                        <circle cx="182.25" cy="108.5" r="12.5" stroke="#BDA157" strokeWidth="2" />
                        <circle cx="182.25" cy="174.5" r="12.5" stroke="#BDA157" strokeWidth="2" />
                        <circle cx="83.75" cy="102" r="6" stroke="#BDA157" strokeWidth="2" />
                        <circle cx="280.75" cy="102" r="6" stroke="#BDA157" strokeWidth="2" />
                        <circle cx="69.75" cy="249" r="6" stroke="#BDA157" strokeWidth="2" />
                        <circle cx="294.75" cy="249" r="6" stroke="#BDA157" strokeWidth="2" />
                        <path d="M244.75 112L182.25 293L119.75 112" stroke="#BDA157" strokeWidth="10" />
                        <path d="M228.75 93.3359L182.25 228L135.75 93.3359" stroke="#BDA157" strokeWidth="3" />
                        <path d="M106.75 125.5L174.75 330H189.75L257.75 125.5" stroke="#BDA157" strokeWidth="5" />
                        <path d="M182.25 139V162M182.25 187V278.5" stroke="#BDA157" strokeWidth="2" />
                        <path d="M146.75 246.5L106.25 235V226.5L136.75 217V212L106.25 207.5V199L158.25 188L182.25 196L206.25 188L258.25 199V207.5L227.75 212V217L258.25 226.5V235L217.75 246.5M150.25 258.5H106.25V279L182.25 257L258.25 279V258.5H214.25" stroke="#BDA157" strokeWidth="2" strokeLinejoin="bevel" />
                        <path d="M120.75 170L106.25 178.5V189H126.25" stroke="#BDA157" strokeWidth="2" strokeLinejoin="bevel" />
                        <path d="M243.75 170L258.25 178.5V189H238.25" stroke="#BDA157" strokeWidth="2" strokeLinejoin="bevel" />
                    </g>
                    <defs>
                        <filter id="filter0_d_312_85" x="0.25" y="0.5" width="364" height="467" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix" />
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                            <feOffset />
                            <feGaussianBlur stdDeviation="21.75" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix type="matrix" values="0 0 0 0 0.741176 0 0 0 0 0.631373 0 0 0 0 0.341176 0 0 0 1 0" />
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_312_85" />
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_312_85" result="shape" />
                        </filter>
                        <linearGradient id="paint0_linear_312_85" x1="182.25" y1="188.5" x2="182.25" y2="423" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FEFFFF" />
                            <stop offset="1" stopColor="#F3E2B5" />
                        </linearGradient>
                        <linearGradient id="paint1_linear_312_85" x1="182.25" y1="188.5" x2="182.25" y2="423" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FEFFFF" />
                            <stop offset="1" stopColor="#F3E2B5" />
                        </linearGradient>
                    </defs>
                </svg>
            )
        default:
            return (
                <svg className={cn("", className)} width="211" height="280" viewBox="0 0 211 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_312_138)">
                        <path d="M52.4225 44.4149L68.748 28.0902L105.25 18.3984L141.093 28.0902L157.418 44.4149H174.344L180.426 50.4966V127.062L183.307 132.052L191.761 140.506V162.849L170.586 174.692V186.683L180.085 192.167V208.942L162.159 219.291L159.957 227.507L105.25 260.425L49.8838 227.507L47.6822 219.291L29.756 208.942V192.167L39.2543 186.683V174.692L18.0794 162.849V140.506L26.534 132.052L29.415 127.062V50.4966L35.497 44.4149H52.4225Z" fill="url(#paint0_linear_312_138)" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M51.0979 41.8736L67.9378 25.0111L105.25 15L142.562 25.0111L159.401 41.8736H178.223L184.496 48.1557V125.194L187.468 130.348L196.189 139.081V164.209L175.028 176.443V184.048L184.826 189.712V211.821L166.335 222.511L164.064 230.998L105.25 265L46.4357 230.998L44.1647 222.511L25.6739 211.821V189.712L35.4713 184.048V176.443L14.3105 164.209V139.081L23.0315 130.348L26.0032 125.194V48.1557L32.2769 41.8736H51.0979ZM68.748 28.0902L52.4225 44.4149H35.497L29.415 50.4966V127.062L26.534 132.052L18.0794 140.506V162.849L39.2543 174.692V186.683L29.756 192.167V208.942L47.6822 219.291L49.8838 227.507L105.25 260.425L159.957 227.507L162.159 219.291L180.085 208.942V192.167L170.586 186.683V174.692L191.761 162.849V140.506L183.307 132.052L180.426 127.062V50.4966L174.344 44.4149H157.418L141.093 28.0902L105.25 18.3984L68.748 28.0902Z" fill="url(#paint1_linear_312_138)" />
                        <path d="M52.4225 44.4149L68.748 28.0902L105.25 18.3984L141.093 28.0902L157.418 44.4149H174.344L180.426 50.4966V127.062L183.307 132.052L191.761 140.506V162.849L170.586 174.692V186.683L180.085 192.167V208.942L162.159 219.291L159.957 227.507L105.25 260.425L49.8838 227.507L47.6822 219.291L29.756 208.942V192.167L39.2543 186.683V174.692L18.0794 162.849V140.506L26.534 132.052L29.415 127.062V50.4966L35.497 44.4149H52.4225Z" stroke="#5F6064" strokeWidth="2" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M51.0979 41.8736L67.9378 25.0111L105.25 15L142.562 25.0111L159.401 41.8736H178.223L184.496 48.1557V125.194L187.468 130.348L196.189 139.081V164.209L175.028 176.443V184.048L184.826 189.712V211.821L166.335 222.511L164.064 230.998L105.25 265L46.4357 230.998L44.1647 222.511L25.6739 211.821V189.712L35.4713 184.048V176.443L14.3105 164.209V139.081L23.0315 130.348L26.0032 125.194V48.1557L32.2769 41.8736H51.0979ZM68.748 28.0902L52.4225 44.4149H35.497L29.415 50.4966V127.062L26.534 132.052L18.0794 140.506V162.849L39.2543 174.692V186.683L29.756 192.167V208.942L47.6822 219.291L49.8838 227.507L105.25 260.425L159.957 227.507L162.159 219.291L180.085 208.942V192.167L170.586 186.683V174.692L191.761 162.849V140.506L183.307 132.052L180.426 127.062V50.4966L174.344 44.4149H157.418L141.093 28.0902L105.25 18.3984L68.748 28.0902Z" stroke="#5F6064" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M75.3735 33.194L105.578 28.8887L135.783 33.194L151.83 49.0908L153.718 61.0133L162.213 68.2993V74.5918L170.393 81.5466V200.441L159.066 207.396L154.662 218.325L105.248 251.111L56.4954 218.325L52.0905 207.396L40.7637 200.441V81.5466L48.9442 74.5918V68.2993L57.4393 61.0133L59.3271 49.0908L75.3735 33.194Z" stroke="#8E9196" strokeWidth="2" />
                        <path d="M44.7324 175.714V87.7514L52.9996 81.799V71.8783L57.2986 67.9101V63.9418L79.7853 41.1244L105.248 37.4868L130.711 41.1244L153.198 63.9418V67.9101L157.497 71.8783V81.799L165.764 87.7514V175.714L105.248 215.397L44.7324 175.714Z" fill="white" fillOpacity="0.2" stroke="#8E9196" strokeWidth="8" strokeLinejoin="bevel" />
                        <path d="M77.7887 223.795L82.3153 211.198L50.0254 189.603V198.901L59.0786 206.399L61.7946 214.197L77.7887 223.795ZM77.7887 223.795L105.25 241.19L132.712 223.795M132.712 223.795L128.185 211.198L160.475 189.603V198.901L151.422 206.399L148.706 214.197L132.712 223.795Z" stroke="#8E9196" strokeWidth="10" />
                        <circle cx="105.248" cy="56.9972" r="12.672" stroke="#8E9196" strokeWidth="15" />
                        <circle cx="105.247" cy="56.9974" r="7.92857" stroke="#8E9196" strokeWidth="2" />
                        <circle cx="105.247" cy="100.648" r="7.92857" stroke="#8E9196" strokeWidth="2" />
                        <circle cx="40.1042" cy="52.6985" r="3.62963" stroke="#8E9196" strokeWidth="2" />
                        <circle cx="170.393" cy="52.6985" r="3.62963" stroke="#8E9196" strokeWidth="2" />
                        <circle cx="30.8464" cy="149.921" r="3.62963" stroke="#8E9196" strokeWidth="2" />
                        <circle cx="179.659" cy="149.921" r="3.62963" stroke="#8E9196" strokeWidth="2" />
                        <path d="M146.584 59.312L105.248 179.021L63.9121 59.312" stroke="#8E9196" strokeWidth="10" />
                        <path d="M136.006 46.9683L105.252 136.032L74.498 46.9683" stroke="#8E9196" strokeWidth="3" />
                        <path d="M55.3184 68.2407L100.292 203.492H110.213L155.186 68.2407" stroke="#8E9196" strokeWidth="5" />
                        <path d="M105.248 77.1694V92.3811M105.248 108.915V169.431" stroke="#8E9196" strokeWidth="2" />
                        <path d="M81.7681 148.267L54.9824 140.661V135.04L75.1544 128.757V125.45L54.9824 122.473V116.852L89.374 109.577L105.247 114.868L121.12 109.577L155.512 116.852V122.473L135.34 125.45V128.757L155.512 135.04V140.661L128.726 148.267M84.083 156.204H54.9824V169.762L105.247 155.212L155.512 169.762V156.204H126.411" stroke="#8E9196" strokeWidth="2" strokeLinejoin="bevel" />
                        <path d="M64.5724 97.6719L54.9824 103.294V110.238H68.2099" stroke="#8E9196" strokeWidth="2" strokeLinejoin="bevel" />
                        <path d="M145.924 97.6719L155.514 103.294V110.238H142.286" stroke="#8E9196" strokeWidth="2" strokeLinejoin="bevel" />
                    </g>
                    <defs>
                        <filter id="filter0_d_312_138" x="0.0105467" y="0.7" width="210.479" height="278.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix" />
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                            <feOffset />
                            <feGaussianBlur stdDeviation="6.65" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix type="matrix" values="0 0 0 0 0.945098 0 0 0 0 0.956863 0 0 0 0 0.984314 0 0 0 1 0" />
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_312_138" />
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_312_138" result="shape" />
                        </filter>
                        <linearGradient id="paint0_linear_312_138" x1="105.25" y1="15" x2="105.25" y2="265" gradientUnits="userSpaceOnUse">
                            <stop offset="0.427885" stopColor="#F1F4FB" />
                            <stop offset="1" stopColor="#BEC1C8" />
                        </linearGradient>
                        <linearGradient id="paint1_linear_312_138" x1="105.25" y1="15" x2="105.25" y2="265" gradientUnits="userSpaceOnUse">
                            <stop offset="0.427885" stopColor="#F1F4FB" />
                            <stop offset="1" stopColor="#BEC1C8" />
                        </linearGradient>
                    </defs>
                </svg>
            )
    }
}