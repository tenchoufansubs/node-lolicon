exports.discord = {
  email: process.env.DISCORD_EMAIL || null,
  password: process.env.DISCORD_PASSWORD || null,
};

exports.dropbox = {
  key: process.env.DROPBOX_KEY || null,
  secret: process.env.DROPBOX_SECRET || null,
  token: process.env.DROPBOX_TOKEN || null,
};
