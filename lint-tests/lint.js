const bad  = "wrong stuff"

 const badArray = ["a", 'b', 'c', 'd'];

const test = () => {
  const a = badArray[0];
  console.log(a);
};

test();

const badFunction = () => {
  console.log('This is not indented correctly');
};

badFunction();
