import { gsap } from 'gsap';

import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";

Splitting();

// frame element
const frame = document.querySelector('.frame');

// center title initially visible
const initialTitle = document.querySelector('#center-title-initial')
const initialTitleChars = [...initialTitle.querySelectorAll('span.char')];

// center title (smaller)
const centerTitle = document.querySelector('#center-title')
let centerTitlePosition = centerTitle.offsetTop;
const centerTitleChars = [...centerTitle.querySelectorAll('span.char')];

// center title (repetition)
const repeatedCenterTitle = document.querySelector('#center-title-repeated')
const repeatedCenterTitleChars = [...repeatedCenterTitle.querySelectorAll('span.char')];

// top title
const topTitle = document.querySelector('#top-title');
const topTitleChars = [...topTitle.querySelectorAll('span.char')];
let topTitlePosition = topTitle.offsetTop;

// bottom title
const bottomTitle = document.querySelector('#bottom-title');
const bottomTitleChars = [...bottomTitle.querySelectorAll('span.char')];
let bottomTitlePosition = bottomTitle.offsetTop;

const intro = gsap.timeline()
.addLabel('start', 0)
// hide all initially except the initial title (chars)
.set([topTitleChars, bottomTitleChars, centerTitleChars, repeatedCenterTitleChars], {
    opacity: 0
}, 'start')
.to(frame, {
    duration: 0.5,
    ease: 'power3.inOut',
    opacity: 0,
    scale: 0.99
}, 'start+=0.4')
.to(initialTitleChars, {
    duration: 0.5,
    ease: 'power3.inOut',
    y: pos => pos%2 ? '100%' : '-100%',
    stagger: 0.02
}, 'start+=0.4')
.to(centerTitleChars, {
    duration: 0.5,
    ease: 'power3.inOut',
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: 0.03,
    onComplete: () => centerTitle.style.overflow = 'visible'
}, 'start+=0.7')
.to(centerTitleChars.filter((_,i) => i%2==0), {
    duration: 0.7,
    ease: 'expo.inOut',
    y: topTitlePosition - centerTitlePosition,
    stagger: {amount: 0.5, from: 0}
}, 'start+=1.4')
.to(centerTitleChars.filter((_,i) => i%2!=0), {
    duration: 0.7,
    ease: 'expo.inOut',
    y: bottomTitlePosition - centerTitlePosition,
    stagger: {amount: 0.5, from: 0}
}, 'start+=1.4')
.to(repeatedCenterTitleChars, {
    duration: 0.7,
    ease: 'expo.inOut',
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: {amount: 0.5, from: 0}
}, 'start+=1.4')
.to(topTitleChars.filter((_,i) => i%2!=0), {
    duration: 0.7,
    ease: 'expo.inOut',
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: {amount: 0.5, from: 0},
    onComplete: () => {
        gsap.set(centerTitleChars.filter((_,i) => i%2==0), {
            opacity: 0
        });
        gsap.set(topTitleChars.filter((_,i) => i%2==0), {
            opacity: 1
        });
    }
}, 'start+=1.4')
.to(bottomTitleChars.filter((_,i) => i%2==0), {
    duration: 0.7,
    ease: 'expo.inOut',
    startAt: { y: pos => pos%2 ? '100%' : '-100%', opacity: 1 },
    y: '0%',
    stagger: {amount: 0.5, from: 0},
    onComplete: () => {
        gsap.set(centerTitleChars.filter((_,i) => i%2!=0), {
            opacity: 0
        });
        gsap.set(bottomTitleChars.filter((_,i) => i%2!=0), {
            opacity: 1
        });
    }
}, 'start+=1.4')
.to([topTitle, repeatedCenterTitle, bottomTitle],  {
    duration: 0.5,
    ease: 'power3.inOut',
    x: -610,
    stagger: 0.06
})



