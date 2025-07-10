const scanner = require('sonarqube-scanner');
scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'shahzaazaib_react-s3-deploy',  // Replace with your real key
      'sonar.organization': 'shahzaazaib',                // Replace with your org name
      'sonar.sources': 'src',
    },
  },
  () => process.exit()
);
