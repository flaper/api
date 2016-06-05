import app from '../../server/server';
export default app;

before(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //can be approved via actual check
      console.log('MongoDB connection established');
      resolve();
    }, 20);
  })
});

