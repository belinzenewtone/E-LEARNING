module.exports = {
  apps: [
    {
      name: "web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/learning-os",
      env_file: "/var/www/learning-os/.env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "api",
      script: "dist/index.js",
      cwd: "/var/www/learning-os/apps/api",
      env_file: "/var/www/learning-os/apps/api/.env",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
