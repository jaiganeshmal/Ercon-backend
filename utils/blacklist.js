// Simple in-memory blacklist
let blacklist = [];

export const addToBlacklist = (token) => {
  blacklist.push(token);
};

export const isBlacklisted = (token) => {
  return blacklist.includes(token);
};
