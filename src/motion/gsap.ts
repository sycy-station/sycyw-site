'use client';

import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.6 });

export const EASE = {
  soft: 'power3.out',
  glide: 'expo.out',
} as const;

export const TIMING = {
  splashHold: 0.45,
  splashLogo: 0.9,
  orbitIn: 0.7,
  travel: 0.38,
  reveal: 0.3,
  /** legacy TIMING.aboutType（520ms），打字机开场延迟 */
  aboutType: 0.52,
  /** legacy TIMING.aboutTypeBack（820ms），返场打字延迟 */
  aboutTypeBack: 0.82,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, Flip, ScrollTrigger, useGSAP };
