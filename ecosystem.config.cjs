module.exports = {
  apps: [
    {
      name: "calibration-app",
      cwd: "/home/artificialintelligence/Documents/project/calibration",
      script: "npm",
      args: "run start -- -p 8009",
      interpreter: "none",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
