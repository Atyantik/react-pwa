/**
 * Promisify timeout, time in miliseconds
 * @param time miliseconds
 * @returns Promise<void>
 */
const delay = (time: number) => new Promise((resolve) => { setTimeout(resolve, time); });

export const HomeData = async () => {
  // delay of 2 seconds
  await delay(2000);
  return {
    content: 'Develop Progressive Web Applications with Ease.',
  };
};

export const ChildData = async () => {
  await delay(2000);
  return {
    name: 'Stewie',
  };
};

export const ParentData = async () => {
  await delay(2000);
  return {
    name: 'Peter',
  };
};
