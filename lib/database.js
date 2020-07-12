const fs = require("fs");

function openFile() {
  return new Promise((resolve) => {
    fs.readFile(__dirname + "/../users.json", "utf8", (err, data) => {
      resolve(JSON.parse(data));
    });
  });
}

function writeFile(newData) {
  return new Promise((resolve) => {
    fs.writeFile(
      __dirname + "/../users.json",
      JSON.stringify(newData, null, 2),
      () => {
        resolve();
      }
    );
  });
}

module.exports = {
  find: async (email) => {
    const users = await openFile();

    return users.find((user) => user.email === email);
  },
  create: async (user) => {
    const users = await openFile();

    let highestId = 0;

    users.forEach((user) => {
      if (!highestId || user.id > highestId) {
        highestId = user.id;
      }
    });

    user.id = highestId + 1;

    users.push(user);

    writeFile(users);

    return user;
  },
  update: (user) => {},
  delete: (user) => {},
};
