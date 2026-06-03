import { DAY_IMAGES } from "./index";

const imageReady = new Map<number, Promise<void>>();

/** Decode trip day hero image; safe to call repeatedly. */
export function preloadDayImage(day: number): Promise<void> {
  if (day < 1 || day > 5) return Promise.resolve();

  const existing = imageReady.get(day);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    const src = DAY_IMAGES[day as 1 | 2 | 3 | 4 | 5];
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();
    const finish = () => {
      if (typeof img.decode === "function") {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    img.onload = finish;
    img.onerror = () => resolve();
    img.src = src;
  });

  imageReady.set(day, promise);
  return promise;
}
