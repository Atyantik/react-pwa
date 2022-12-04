/**
 * @param time miliseconds
 * @returns Promise<void>
 */
export const delay = (time: number) => new Promise((resolve) => {
  setTimeout(resolve, time);
});
