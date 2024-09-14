const generateSessionId = () => {
  return Math.random().toString(36).substr(2, 9); // Generates a random string
};

export { generateSessionId };
