import * as React from 'react';

// @#@#@# need to type this correctly
const Icon: any = {
    Graph: (props: any) => (<svg onClick={props.onClick} width='30' height='18' viewBox='0 0 30 18' fill='none' >
        <rect x='0.543579' y='7.96997' width='2.87659' height='6.48' fill='#433E3E' />
        <rect x='5.33789' y='4.72998' width='2.87659' height='9.72' fill='#433E3E' />
        <rect x='10.1322' y='1.48999' width='2.87659' height='12.96' fill='#433E3E' />
        <path d='M18.7402 3.9491C20.8707 5.06084 21.4216 7.49806 19.9931 9.38774C18.5647 11.2774 15.6831 11.9236 13.5525 10.8118C11.4219 9.70008 10.8711 7.26285 12.2996 5.37318C13.728 3.4835 16.6096 2.83736 18.7402 3.9491Z' fill='#D9D9D9' stroke='#1A4B78' strokeWidth='2' />
        <rect width='1.80545' height='7.25655' transform='matrix(0.601379 -0.799978 0.886122 0.464955 19.1864 10.9788)' fill='#D9D9D9' />
        <rect width='1.80545' height='7.25655' transform='matrix(0.601379 -0.799978 0.886122 0.464955 19.1864 10.9788)' fill='#1A4B78' />
    </svg>),
    Gear: (props: any) => (<svg onClick={props.onClick} width='19' height='19' viewBox='0 0 19 19' fill='none' >
        <path d='M9.93336 12.5285C11.4356 12.5285 12.6533 11.2869 12.6533 9.75506C12.6533 8.22326 11.4356 6.98157 9.93336 6.98157C8.43111 6.98157 7.21338 8.22326 7.21338 9.75506C7.21338 11.2869 8.43111 12.5285 9.93336 12.5285Z' fill='#716C6C' />
        <path d='M16.8444 8.27153L15.8491 5.82106L17.1867 4.208L15.3734 2.359L13.8001 3.72999L11.3458 2.70083L10.7814 0.51001H9.00954L8.43662 2.72985L6.03878 3.7605L4.49346 2.359L2.68014 4.208L3.99786 5.86178L3.01787 8.31859L0.866821 8.83048V10.6795L3.04381 11.2855L4.05441 13.73L2.68014 15.302L4.49346 17.151L6.11744 15.8015L8.48005 16.7925L9.02676 19H10.8401L11.3882 16.7934L13.7914 15.7785C14.1919 16.0705 15.3734 17.151 15.3734 17.151L17.1867 15.302L15.8411 13.6835L16.8366 11.2323L18.9999 10.6584L19 8.83048L16.8444 8.27153Z' fill='#716C6C' />
        <circle cx='10' cy='10' r='4' fill='white' />
    </svg>
    ),
    FullScreen: (props: any) => (<svg onClick={props.onClick} width='28' height='26' viewBox='0 0 28 26' fill='none' >
        <rect x='0.915527' width='27' height='26' fill='#EFEBEB' />
        <path d='M11.2081 4.19922H7.77728H4.34644V10.8479M4.34644 15.047V21.6957H11.2081M16.6975 4.19922H23.9022V10.8479M17.0405 21.6957H23.9022V15.047' stroke='#716C6C' strokeWidth='2' />
    </svg>
    ),
    Rotate: (props: any) => (<svg onClick={props.onClick} width='28' height='27' viewBox='0 0 28 27' fill='none' >
        <rect x='0.915527' y='0.210449' width='27' height='26' fill='#EFEBEB' />
        <path d='M21.3246 10.0296C20.1957 7.42525 17.6176 5.60522 14.6176 5.60522C10.8242 5.60522 7.70518 8.51547 7.33813 12.2417' stroke='#716C6C' strokeWidth='1.02515' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M18.2756 10.0295H21.4945C21.737 10.0295 21.9335 9.8314 21.9335 9.58705V6.34253' stroke='#716C6C' strokeWidth='1.02515' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M7.94678 15.9287C9.07567 18.533 11.6538 20.3531 14.6537 20.3531C18.4471 20.3531 21.5662 17.4428 21.9332 13.7166' stroke='#716C6C' strokeWidth='1.02515' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M10.996 15.9287H7.77707C7.53465 15.9287 7.33813 16.1268 7.33813 16.3711V19.6157' stroke='#716C6C' strokeWidth='1.02515' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
    ),
    CameraLens: (props: any) => (<svg onClick={props.onClick} width='28' height='27' viewBox='0 0 28 27' fill='none' >
        <rect x='0.915527' y='0.421143' width='27' height='26' fill='#EFEBEB' />
        <path d='M23.9649 13.3685C23.9649 18.4591 19.8718 22.579 14.8311 22.579C9.79034 22.579 5.69727 18.4591 5.69727 13.3685C5.69727 8.2779 9.79034 4.15796 14.8311 4.15796C19.8718 4.15796 23.9649 8.2779 23.9649 13.3685Z' stroke='#716C6C' />
        <path d='M17.5424 13.3684C17.5424 14.8837 16.3248 16.1053 14.8311 16.1053C13.3375 16.1053 12.1199 14.8837 12.1199 13.3684C12.1199 11.8532 13.3375 10.6316 14.8311 10.6316C16.3248 10.6316 17.5424 11.8532 17.5424 13.3684Z' fill='#716C6C' stroke='#716C6C' />
        <path d='M21.2537 18.7632L16.9719 11.296' stroke='#716C6C' />
        <path d='M12.5379 21.8995L17.1244 14.6184' stroke='#716C6C' />
        <path d='M6.26765 15.9775L14.8311 15.8188' stroke='#716C6C' />
        <path d='M12.6901 11.5332L18.0507 4.65912' stroke='#716C6C' />
        <path d='M23.7498 11.5644L13.7607 10.1316' stroke='#716C6C' />
        <path d='M8.79801 5.81571L12.3003 13.6644' stroke='#716C6C' />
    </svg>
    ),
    LetterI: (props: any) => (<svg onClick={props.onClick} width='26' height='25' viewBox='0 0 26 25' fill='none' >
        <rect x='0.0563965' y='0.710449' width='25' height='24' fill='#EFEBEB' />
        <path d='M10.4041 5.39404H14.3787V8.09912H10.4041V5.39404ZM10.4041 9.33936H14.3787V19.7104H10.4041V9.33936Z' fill='#716C6C' />
    </svg>

    ),
    GridBox: (props: any) => (<svg onClick={props.onClick} width='26' height='26' viewBox='0 0 26 26' fill='none' >
        <rect width='26' height='26' fill='#EFEBEB' />
        <rect x='5' y='5' width='16' height='1' fill='#716C6C' />
        <rect x='5' y='6' width='1' height='14' fill='#716C6C' />
        <rect x='10' y='6' width='1' height='14' fill='#716C6C' />
        <rect x='15' y='6' width='1' height='14' fill='#716C6C' />
        <rect x='20' y='6' width='1' height='14' fill='#716C6C' />
        <rect x='5' y='10' width='16' height='1' fill='#716C6C' />
        <rect x='5' y='15' width='16' height='1' fill='#716C6C' />
        <rect x='5' y='20' width='16' height='1' fill='#716C6C' />
    </svg>

    ),
    Download: (props: any) => (<svg onClick={props.onClick} width='28' height='27' viewBox='0 0 28 27' fill='none' >
        <rect x='0.915527' y='0.973633' width='27' height='26' fill='#EFEBEB' />
        <path d='M15.3662 22.5525L9.34064 16.0788L21.3918 16.0788L15.3662 22.5525Z' fill='#716C6C' />
        <rect x='12.6902' y='5.28931' width='5.35211' height='11.8684' fill='#716C6C' />
        <rect x='5.19727' y='22.5525' width='19.2676' height='2.15789' fill='#716C6C' />
    </svg>
    ),
    ChartDisplay: (props: any) => (<svg onClick={props.onClick} width='28' height='27' viewBox='0 0 28 27' fill='none' >
        <rect x='0.915527' y='0.184082' width='27' height='26' fill='#EFEBEB' />
        <path d='M7.33813 6.11841V21.7632H22.8593M9.47898 20.1447C10.1926 15.4693 13.8677 6.11841 22.8593 6.11841' stroke='#716C6C' strokeWidth='2' />
    </svg>
    ),
    CloseX: (props: any) => (<svg onClick={props.onClick} width='18' height='17' viewBox='0 0 18 17' fill='none' >
        <path d='M2 2L15 15' stroke='black' strokeWidth='4' strokeLinejoin='round' />
        <path d='M2 15L16 2' stroke='black' strokeWidth='4' strokeLinejoin='round' />
    </svg>
    ),
    ColorWheel: (props: any) => (<svg onClick={props.onClick} width='100%' height='100%' style={{ maxWidth: '28px', maxHeight: '27px' }} viewBox='-100 -100 750 725'>
        <rect x='-100' y='-100' width='750' height='750' fill='#EFEBEB' />
        <path d='m 511.48146,205.29524 c 11.90567,44.43259 11.90567,84.97693 0,129.40952 L 487.31476,349.3424 270,270 490.20449,192.09986 z' style={{ fill: '#fefe33' }} />
        <path d='m 334.70476,28.518543 c 44.43259,11.905676 79.54502,32.17785 112.07193,64.704761 L 447.40047,118.09589 270,270 313.06484,40.508134 z' style={{ fill: '#fb9902' }} />
        <path d='m 446.77669,93.223304 c 32.52692,32.526916 52.79909,67.639346 64.70477,112.071936 L 270,270 z' style={{ fill: '#fabc02' }} />
        <path d='M 93.223305,93.223305 C 125.75022,60.696393 160.86265,40.42422 205.29524,28.518543 L 231.20546,44.501656 270,270 92.739568,120.0571 z' style={{ fill: '#fe2712' }} />
        <path d='m 205.29524,28.518543 c 44.43259,-11.905676 84.97693,-11.905676 129.40952,0 L 270,270 z' style={{ fill: '#fd5308' }} />
        <path d='m 28.518543,334.70476 c -11.905676,-44.43259 -11.905676,-84.97693 0,-129.40952 L 56.311276,186.62718 270,270 55.854788,349.40527 z' style={{ fill: '#8601af' }} />
        <path d='M 28.518543,205.29524 C 40.424219,160.86265 60.696393,125.75022 93.223305,93.223305 L 270,270 z' style={{ fill: '#a7194b' }} />
        <path d='M 205.29524,511.48146 C 160.86265,499.57578 125.75022,479.30361 93.223305,446.7767 L 95.307837,418.58874 270,270 231.0453,499.70648 z' style={{ fill: '#0247fe' }} />
        <path d='M 93.223305,446.7767 C 60.696393,414.24978 40.42422,379.13735 28.518543,334.70476 L 270,270 z' style={{ fill: '#3d01a4' }} />
        <path d='m 446.7767,446.7767 c -32.52692,32.52691 -67.63935,52.79908 -112.07194,64.70476 L 310.45335,496.38826 270,270 446.04632,421.15701 z' style={{ fill: '#66b032' }} />
        <path d='m 334.70476,511.48146 c -44.43259,11.90567 -84.97693,11.90567 -129.40952,0 L 270,270 z' style={{ fill: '#0391ce' }} />
        <path d='M 511.48146,334.70476 C 499.57578,379.13735 479.30361,414.24978 446.7767,446.7767 L 270,270 511.48146,334.70476 z' style={{ fill: '#d0ea2b' }} />
        <circle cx='270' cy='270' r='153.79581' style={{ fill: '#EFEBEB' }} />
    </svg>)
}

export default Icon;
