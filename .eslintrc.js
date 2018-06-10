module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    "node": true
  },
  extends: 'airbnb-base',
  rules: {    
    "no-underscore-dangle": ["error", { "allow": ["_id"] }]
  }
}