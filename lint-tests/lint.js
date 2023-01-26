const bad = 'wrong stuff';

const badArray = ['a', 'b', 'c', 'd'];

export const test = () => {
  const a = badArray[0];
  console.log(a, bad);
};

const badFunction = () => {
  console.log('This is not indented correctly');
};
badFunction();
export default test;
