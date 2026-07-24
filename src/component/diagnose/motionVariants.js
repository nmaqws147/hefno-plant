export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

export const fadeUpStagger = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};
