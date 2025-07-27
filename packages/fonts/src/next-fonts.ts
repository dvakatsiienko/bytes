
import localNextFont from 'next/font/local';

export const robotoFlexVRFont = localNextFont({
    fallback: [ 'system-ui', 'sans-serif' ],
    src:      './RobotoFlex[GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght].ttf',
});

export const manropeVRFont = localNextFont({
    fallback: [ 'system-ui', 'sans-serif' ],
    src:      './Manrope[wght].woff2',
});

export const nextFonts = {
    robotoFlexVRFont,
    manropeVRFont,
};
