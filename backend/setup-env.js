const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class EnvSetup {
  constructor() {
    this.envExamplePath = path.join(__dirname, '.env.example');
    this.envPath = path.join(__dirname, '.env');
  }

  generateSecureKey(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('base64');
  }

  readEnvExample() {
    if (!fs.existsSync(this.envExamplePath)) {
      throw new Error('.env.example file not found');
    }
    return fs.readFileSync(this.envExamplePath, 'utf8');
  }

  createEnvFile() {
    if (fs.existsSync(this.envPath)) {
      console.log('⚠️  .env file already exists. Backing up...');
      const backupPath = `${this.envPath}.backup.${Date.now()}`;
      fs.copyFileSync(this.envPath, backupPath);
      console.log(`📁 Backup created: ${backupPath}`);
    }

    const envTemplate = this.readEnvExample();
    
    const replacements = {
      'your_jwt_secret': this.generateSecureKey(64),
      'your_32_char_encryption_key': this.generateEncryptionKey(),
      'mongodb+srv://username:password@cluster.mongodb.net/evoting': 'mongodb+srv://your_username:your_password@your-cluster.mongodb.net/evoting?retryWrites=true&w=majority'
    };

    let envContent = envTemplate;
    for (const [placeholder, value] of Object.entries(replacements)) {
      envContent = envContent.replace(new RegExp(placeholder, 'g'), value);
    }

    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ .env file created successfully!');
    
    // Set file permissions to read-only for owner (Unix-like systems)
    if (process.platform !== 'win32') {
      fs.chmodSync(this.envPath, 0o600);
    }

    this.displayNextSteps();
  }

  displayNextSteps() {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Update MONGO_URI in .env with your MongoDB Atlas connection string');
    console.log('2. Make sure .env is added to .gitignore');
    console.log('3. Never commit .env to version control!');
    console.log('4. For production, use environment variables on your hosting platform');
    console.log('\n🔐 Your keys have been generated and are ready for use.');
  }
}

// Run the setup
const setup = new EnvSetup();
setup.createEnvFile();