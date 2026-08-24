const adapters = {
  stripe: require('./stripe'),
  razorpay: require('./razorpay'),
  paypal: require('./paypal'),
  paytm: require('./paytm')
};

exports.getAdapter = (provider) => {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unsupported payment gateway: ${provider}`);
  }
  return adapter;
};
