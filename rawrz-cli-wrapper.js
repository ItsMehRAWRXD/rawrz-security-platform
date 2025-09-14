// RawrZ CLI Wrapper - Bridge between web API and CLI functionality
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const execAsync = promisify(exec);

class RawrZStandalone {
    constructor() {
        this.uploadDir = path.join(__dirname, 'uploads');
        this.dataDir = path.join(__dirname, 'data');
        this.logsDir = path.join(__dirname, 'logs');
        this.initializeDirectories();
    }

    async initializeDirectories() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.dataDir, { recursive: true });
            await fs.mkdir(this.logsDir, { recursive: true });
        } catch (error) {
            console.log('[ERROR] Failed to create directories:', error.message);
        }
    }

    // Execute CLI command and return structured response
    async executeCLI(command, args = []) {
        try {
            const fullCommand = `node ${path.join(__dirname, 'rawrz-standalone.js')} ${command} ${args.join(' ')}`;
            const { stdout, stderr } = await execAsync(fullCommand);
            
            return {
                success: true,
                output: stdout,
                error: stderr || null,
                command: command,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                output: null,
                error: error.message,
                command: command,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Encryption wrapper
    async encrypt(algorithm, input, extension = '.enc') {
        try {
            const result = await this.executeCLI('encrypt', [algorithm, input, extension]);
            
            if (result.success) {
                // Parse the output to extract file information
                const lines = result.output.split('\n');
                const encryptedFile = lines.find(line => line.includes('Encrypted file:'));
                
                return {
                    success: true,
                    algorithm: algorithm,
                    input: input,
                    extension: extension,
                    output: result.output,
                    encryptedFile: encryptedFile ? encryptedFile.split(': ')[1] : null,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Decryption wrapper
    async decrypt(algorithm, input, key = null, extension = '.dec') {
        try {
            const args = key ? [algorithm, input, key, extension] : [algorithm, input, extension];
            const result = await this.executeCLI('decrypt', args);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Advanced crypto wrapper
    async advancedCrypto(input, operation = 'encrypt') {
        try {
            const result = await this.executeCLI('advancedcrypto', [input, operation]);
            
            if (result.success) {
                const lines = result.output.split('\n');
                const algorithmLine = lines.find(line => line.includes('Algorithm:'));
                const fileLine = lines.find(line => line.includes('file:'));
                
                return {
                    success: true,
                    input: input,
                    operation: operation,
                    algorithm: algorithmLine ? algorithmLine.split('Algorithm: ')[1] : 'unknown',
                    output: result.output,
                    file: fileLine ? fileLine.split(': ')[1] : null,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Hashing wrapper
    async hash(input, algorithm = 'sha256', save = false, extension = '.hash') {
        try {
            const args = [input, algorithm];
            if (save) args.push('true', extension);
            
            const result = await this.executeCLI('hash', args);
            
            if (result.success) {
                const lines = result.output.split('\n');
                const hashLine = lines.find(line => line.includes('hash:'));
                
                return {
                    success: true,
                    input: input,
                    algorithm: algorithm,
                    hash: hashLine ? hashLine.split(': ')[1] : null,
                    saved: save,
                    output: result.output,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // File analysis wrapper
    async analyze(input) {
        try {
            const result = await this.executeCLI('analyze', [input]);
            
            if (result.success) {
                const lines = result.output.split('\n');
                const size = lines.find(line => line.includes('Size:'));
                const type = lines.find(line => line.includes('Type:'));
                const entropy = lines.find(line => line.includes('Entropy:'));
                const md5 = lines.find(line => line.includes('MD5:'));
                const sha256 = lines.find(line => line.includes('SHA256:'));
                
                return {
                    success: true,
                    input: input,
                    analysis: {
                        size: size ? size.split(': ')[1] : null,
                        type: type ? type.split(': ')[1] : null,
                        entropy: entropy ? entropy.split(': ')[1] : null,
                        md5: md5 ? md5.split(': ')[1] : null,
                        sha256: sha256 ? sha256.split(': ')[1] : null
                    },
                    output: result.output,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Key generation wrapper
    async keygen(algorithm, length = null, save = false, extension = '.key') {
        try {
            const args = [algorithm];
            if (length) args.push(length);
            if (save) args.push('true', extension);
            
            const result = await this.executeCLI('keygen', args);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Encoding wrappers
    async base64encode(text) {
        return await this.executeCLI('base64encode', [text]);
    }

    async base64decode(text) {
        return await this.executeCLI('base64decode', [text]);
    }

    async hexencode(text) {
        return await this.executeCLI('hexencode', [text]);
    }

    async hexdecode(text) {
        return await this.executeCLI('hexdecode', [text]);
    }

    async urlencode(text) {
        return await this.executeCLI('urlencode', [text]);
    }

    async urldecode(text) {
        return await this.executeCLI('urldecode', [text]);
    }

    // Network tools wrappers
    async dnsLookup(hostname) {
        try {
            const result = await this.executeCLI('dns', [hostname]);
            
            if (result.success) {
                const lines = result.output.split('\n');
                const ipLine = lines.find(line => line.includes('IP:'));
                
                return {
                    success: true,
                    hostname: hostname,
                    ip: ipLine ? ipLine.split(': ')[1] : null,
                    output: result.output,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async ping(host, save = false, extension = '.ping') {
        try {
            const args = [host];
            if (save) args.push('true', extension);
            
            return await this.executeCLI('ping', args);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Text operations wrapper
    async textops(operation, text) {
        return await this.executeCLI('textops', [operation, text]);
    }

    // Validation wrapper
    async validate(input, type) {
        try {
            const result = await this.executeCLI('validate', [input, type]);
            
            if (result.success) {
                const isValid = result.output.includes('VALID');
                
                return {
                    success: true,
                    input: input,
                    type: type,
                    valid: isValid,
                    output: result.output,
                    timestamp: result.timestamp
                };
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // System information
    async getSystemInfo() {
        try {
            const result = await this.executeCLI('sysinfo');
            
            return {
                success: true,
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                memory: {
                    total: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
                    free: Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB'
                },
                uptime: Math.round(os.uptime() / 3600) + ' hours',
                output: result.output,
                timestamp: result.timestamp
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // List files in uploads directory
    async listFiles() {
        try {
            const files = await fs.readdir(this.uploadDir);
            const fileDetails = [];
            
            for (const file of files) {
                const filePath = path.join(this.uploadDir, file);
                const stats = await fs.stat(filePath);
                
                fileDetails.push({
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    extension: path.extname(file)
                });
            }
            
            return {
                success: true,
                files: fileDetails,
                count: fileDetails.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Generate random data
    async generateRandom(length = 32) {
        return await this.executeCLI('random', [length]);
    }

    // Generate UUID
    async generateUUID() {
        return await this.executeCLI('uuid');
    }

    // Generate password
    async generatePassword(length = 16, includeSpecial = true) {
        return await this.executeCLI('password', [length, includeSpecial]);
    }

    // Math operations
    async math(expression) {
        return await this.executeCLI('math', [expression]);
    }

    // Get current time
    async getTime() {
        return await this.executeCLI('time');
    }
}

module.exports = RawrZStandalone;