/**
 * 动画时长常量：与 :root 中的 --duration-* 保持一致
 * 供 GSAP 等 JS 动画使用，便于全局调速
 *
 * duration: 动画时长
 * delay: 延迟开始（与 duration 配合，避免「快但鬼畜」）
 * stagger: 序列元素间隔
 */
export const DURATION_INSTANT = 0.1
export const DURATION_SHORT = 0.45
export const DURATION_MEDIAN = 0.8
export const DURATION_LONG = 1
export const DURATION_EXTRA_LONG = 2.5

/** 延迟：与 duration 同比例缩放，避免节奏失调 */
export const DELAY_INITIAL = 0.2
export const DELAY_MEDIAN = 0.3
export const DELAY_SHORT = 0.1

/** 序列间隔：stagger 与 duration 同比例 */
export const STAGGER_LONG = 0.2
export const STAGGER_MEDIAN = 0.1
export const STAGGER_SHORT = 0.08
export const STAGGER_CHAR = 0.025
