/* Single entry point for content. Every module validates its data at import time. */
export { contact } from './contact';
export { experience } from './experience';
export { mainNav, navLabels } from './navigation';
export { about, hero } from './profile';
export { projects, STATUS_LABEL, workInProgress, workPage } from './projects';
export { site } from './site';
export { skills } from './skills';
export { email, footerLinks, profileLinks } from './social';
export { story } from './story';
export type * from './schemas';
