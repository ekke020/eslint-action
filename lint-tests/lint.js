const bad = '"wrong stuff"';

const badArray = ['"a"', 'b', 'c', 'd'];

const badFunction = () => {
  console.log('This is not indented correctly: ', bad);
};

export const test = () => {
  badFunction();
  const a = badArray[0];
  console.log('hello: ',a);
};
