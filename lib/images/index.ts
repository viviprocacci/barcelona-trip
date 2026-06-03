import day1 from "./guatemala1.jpg";
import day2 from "./guatemala 2.jpg";
import day3 from "./guatemala 3.jpg";
import day4 from "./guatemala4.jpg";
import day5 from "./guatemala5.jpg";

/** Trip day → bundled image URL. */
export const DAY_IMAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: day1,
  2: day2,
  3: day3,
  4: day4,
  5: day5,
};

/** Static crop focus for 16:9 hero strip (tuned per photo). */
export const DAY_IMAGE_FOCUS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "50% 40%", // Santa Catalina arch + Agua
  2: "68% 56%", // Woman on deck + Lake Atitlán volcanoes
  3: "48% 62%", // Fuego eruption + hiker
  4: "52% 66%", // Cliff jumpers + turquoise water
  5: "46% 54%", // Hammock terrace + San Pedro volcano
};
