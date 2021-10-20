import { preloadImages } from './utils';
import { gsap } from 'gsap';

import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";

// initialize Splitting on the intro_title elements
Splitting();

// center title that is initially visible (the large one) and it's letters
const initialTitle = document.querySelector('#center-title-initial')
const initialTitleChars = [...initialTitle.querySelectorAll('span.char')];

// the smaller version of the center title (first step animation) and it's letters
const centerTitle = document.querySelector('#center-title');
// it's position
let centerTitlePosition = {x: centerTitle.offsetLeft, y: centerTitle.offsetTop};
const centerTitleChars = [...centerTitle.querySelectorAll('span.char')];

// this will be the same as the center title (repetition) and it's chars will be revealed as the center title chars animate up/down
// this will be the element that stays visible in the end as the new center title
const repeatedCenterTitle = document.querySelector('#center-title-repeated')
const repeatedCenterTitleChars = [...repeatedCenterTitle.querySelectorAll('span.char')];

// top title element and it's letters
const topTitle = document.querySelector('#top-title');
const topTitleChars = [...topTitle.querySelectorAll('span.char')];
// it's position
let topTitlePosition = {x: topTitle.offsetLeft, y: topTitle.offsetTop};

// bottom title element  and it's letters
const bottomTitle = document.querySelector('#bottom-title');
const bottomTitleChars = [...bottomTitle.querySelectorAll('span.char')];
// it's position
let bottomTitlePosition = {x: bottomTitle.offsetLeft, y: bottomTitle.offsetTop};

// rows of titles
const rows = {
    top: document.querySelector('.intro__title-row.intro__top'),
    midTop: document.querySelector('.intro__title-row.intro__mid-top'),
    center: document.querySelector('.intro__title-row.intro__center'),
    midBottom: document.querySelector('.intro__title-row.intro__mid-bottom'),
    bottom: document.querySelector('.intro__title-row.intro__bottom'),
};

// rows children (title elements)
const rowsTitles = {};
Object.keys(rows).forEach( (row, pos) => {
    rowsTitles[row] = [...rows[row].querySelectorAll('.intro__title')];
});

// the content sections elements (images and name)
const contentSections = [...document.querySelectorAll('.content__section')];
// content sections pictures
const contentSectionsPhotos = {};
// content sections headings
const contentSectionsHeadings = {};
Object.keys(rows).forEach( (row, pos) => {
    contentSectionsPhotos[row] = [...contentSections[pos].querySelectorAll('.strip__img')];
    contentSectionsHeadings[row] = contentSections[pos].querySelector('.content__heading-wrap');
});

// gets the position (x,y) of each row's first title element
// this will be used to know how much to translate the titles to their neighbour's position (y-axis) and how much to tanslate the center, top and bottom titles to the beginning of the row (x-axis)
const getRowsPosition = () => {
    let positions = {};
    for (const row in rowsTitles) {
        if (rowsTitles.hasOwnProperty(row)) {
            positions[row] = {x: rowsTitles[row][0].offsetLeft, y: rowsTitles[row][0].offsetTop}
        }
    }
    return positions;
}
const rowsPositions = getRowsPosition();

// contentSectionsPhotos.bottom doesn't have image elements...
// get all content section photos except for the last entry (contentSectionsPhotos.bottom)
let photos = Object.values(contentSectionsPhotos).slice(0, -1)

// hide all initially except the initial title (chars)
gsap.set([
    topTitleChars, 
    bottomTitleChars, 
    centerTitleChars, 
    repeatedCenterTitleChars,
    Object.values(rowsTitles),
    photos],
    { opacity: 0 }
);

// create the gsap timeline
const introTimeline = gsap.timeline({
    paused: true,
    defaults: {
        duration: 0.7,
        ease: 'expo.inOut',
    },
    // add initial delay
    delay: 0.4
})
.addLabel('start', 0)
// step1: switch between the large "center title" and the smaller "center title" element
.to(initialTitleChars, {
    y: pos => pos%2 ? '100%' : '-100%',
    stagger: 0.02
}, 'start')
.to(centerTitleChars, {
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: 0.02,
    onComplete: () => centerTitle.style.overflow = 'visible'
}, 'start+=0.15')

.addLabel('step2', '>')
// even "center title" chars will animate to the top
.to(centerTitleChars.filter((_,i) => i%2==0), {
    y: topTitlePosition.y - centerTitlePosition.y,
    stagger: 0.08
}, 'step2')
// odd "top title" chars slide in
.to(topTitleChars.filter((_,i) => i%2!=0), {
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: 0.08,
    onComplete: () => {
        gsap.set(centerTitleChars.filter((_,i) => i%2==0), { opacity: 0 });
        gsap.set(topTitleChars.filter((_,i) => i%2==0), { opacity: 1 });
    }
}, 'step2')

// odd "center title" chars will animate to the bottom
.to(centerTitleChars.filter((_,i) => i%2!=0), {
    y: bottomTitlePosition.y - centerTitlePosition.y,
    stagger: 0.08
}, 'step2')
// even "bottom title" chars slide in
.to(bottomTitleChars.filter((_,i) => i%2==0), {
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: 0.08,
    onComplete: () => {
        gsap.set(centerTitleChars.filter((_,i) => i%2!=0), { opacity: 0 });
        gsap.set(bottomTitleChars.filter((_,i) => i%2!=0), { opacity: 1 });
    }
}, 'step2')

// "repeated center title" chars slide in to fill the gaps 
.to(repeatedCenterTitleChars, {
    startAt: { y: pos => pos%2 == 0 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: index => index%2 == 0 ? 0.08*(index/2) : 0.08*(index-(index-1)/2-1)
}, 'step2')

.addLabel('step2End', '>');

// now both the "top title", "repeated center title" and "bottom title" will animate to the left of the viewport (x position of the first title in the row)
// then the rowsTitles (repeated title elements per row) will scale up and fade in
const elemsArr = [topTitle, repeatedCenterTitle, bottomTitle];
const delay = 1/12;
elemsArr.forEach((el, pos) => {
    
    introTimeline.addLabel('step3', 'step2End+=' + pos*delay)
    .to(el, {
        duration: 0.5,
        x: rowsPositions.top.x - topTitlePosition.x,
        onComplete: () => {
            gsap.set(el, {opacity: 0});
            gsap.set(rowsTitles[['top','center','bottom'][pos]][0], {opacity: 1});
        }
    }, 'step3')
    .to(rowsTitles[['top','center','bottom'][pos]].slice(1),  {
        ease: 'expo',
        startAt: {scale:0.7},
        opacity: 1,
        scale: 1,
        stagger: 0.09
    }, 'step3+=0.3');

    // for both the center and bottom rows:
    // - hide it's titles
    // - position the midTop/midBottom titles on top of the center/bottom titles and animate them to their original position
    // - slide in the center/bottom titles again
    if ( pos ) {
        introTimeline
        .set(pos === 1 ? rowsTitles.center : rowsTitles.bottom, {
            ease: 'expo',
            opacity: 0,
            stagger: 0.09
        }, 'step3+=1')
        .to(pos === 1 ? rowsTitles.midTop : rowsTitles.midBottom, {
            ease: 'expo',
            startAt: {
                y: rowsPositions.center.y - rowsPositions.midTop.y,
                opacity: 1
            },
            y: 0,
            stagger: 0.09
        },'step3+=1')
        .to(pos === 1 ? rowsTitles.center : rowsTitles.bottom, {
            ease: 'expo',
            startAt: {
                y: '100%',
                opacity: 1
            },
            y: 0,
            stagger: 0.09
        },'step3+=1.15');
    }
});

// photos animation
introTimeline.to(photos, {
    duration: 2,
    ease: 'expo',
    startAt: {
        scale: 0.1,
        opacity: 1
    },
    scale: 1,
    stagger: 0.02
},'step3+=1.2');


// hovers

// show heading element (shows name and view all link)
// scale up images
// hide row
// set pointer-events to auto
let hoverInTimeline = [];
let hoverOutTimeline = [];
Object.keys(rows).forEach( (row, pos) => {
    contentSections[pos].addEventListener('mouseenter', () => {
        if ( introTimeline.progress() < 0.8 ) return;
        
        if ( hoverOutTimeline[pos] ) {
            hoverOutTimeline[pos].kill();
        }

        hoverInTimeline[pos] = gsap.timeline({
            defaults: {duration: 0.9, ease: 'expo'}
        })
        .addLabel('start', 0)
        .set(rows[row], {
            opacity: 0
        }, 'start')
        
        .set(contentSectionsHeadings[row], {
            pointerEvents: 'auto'
        }, 'start')
        .to(contentSectionsHeadings[row], {
            opacity: 1
        }, 'start')

        .to(contentSectionsHeadings[row].children, {
            startAt: {
                opacity: 0,
                y: '-100%'
            },
            y: '0%',
            opacity: 1,
            stagger: -0.06
        }, 'start')

        .to(contentSectionsPhotos[row], {
            scale: 1.15,
            //stagger: 0.025
        }, 'start');
    });
    contentSections[pos].addEventListener('mouseleave', () => {
        if ( introTimeline.progress() < 0.8 ) return;
        
        if ( hoverInTimeline[pos] ) {
            hoverInTimeline[pos].kill();
        }
        
        hoverOutTimeline[pos] = gsap.timeline({
            defaults: {duration: 0.9, ease: 'expo'}
        })
        .addLabel('start', 0)
        .to(rows[row], {
            opacity: 1
        }, 'start')
        .set(contentSectionsHeadings[row], {
            pointerEvents: 'none'
        }, 'start')
        .set(contentSectionsHeadings[row].children, {
            opacity: 0
        }, 'start')

        .to(contentSectionsPhotos[row], {
            scale: 1
        }, 'start');
    });
});

// scale up image on hover
/*
document.querySelectorAll('.strip__img').forEach(photo => {
    photo.addEventListener('mouseenter', () => {
        if ( introTimeline.progress() < 0.6 ) return;
        gsap.killTweensOf(photo);
        gsap.set(photo, {zIndex: 9999})
        gsap.to(photo, {
            duration: 0.8,
            ease: 'expo',
            scale: 1.15
        });
    });
    photo.addEventListener('mouseleave', () => {
        if ( introTimeline.progress() < 0.6 ) return;
        gsap.killTweensOf(photo);
        gsap.set(photo, {zIndex: 1})
        gsap.to(photo, {
            duration: 1.5,
            ease: 'expo',
            scale: 1
        });
    });
});
*/

// preload images then remove loader (loading class) 
preloadImages('.strip__img').then(() => {
    document.body.classList.remove('loading');
    introTimeline.play();
});
