// RawrZ Security Platform - Web Application JavaScript
class RawrZApp {
    constructor() {
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        this.setupTabs();
        this.checkSystemStatus();
        this.setupEventListeners();
        console.log('🚀 RawrZ Security Platform initialized');
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Hash method toggle
        const hashMethod = document.getElementById('hash-method');
        if (hashMethod) {
            hashMethod.addEventListener('change', toggleHashInput);
        }

        // Random type toggle
        const randomType = document.getElementById('random-type');
        if (randomType) {
            randomType.addEventListener('change', this.toggleRandomLength);
        }
    }

    toggleRandomLength() {
        const type = document.getElementById('random-type').value;
        const lengthGroup = document.getElementById('random-length-group');
        
        if (type === 'uuid') {
            lengthGroup.style.display = 'none';
        } else {
            lengthGroup.style.display = 'block';
        }
    }

    async checkSystemStatus() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            const data = await response.json();
            
            const statusElement = document.getElementById('system-status');
            if (data.status === 'healthy') {
                statusElement.className = 'stat-number status-online';
                statusElement.textContent = '●';
            } else {
                statusElement.className = 'stat-number status-offline';
                statusElement.textContent = '●';
            }
        } catch (error) {
            const statusElement = document.getElementById('system-status');
            statusElement.className = 'stat-number status-offline';
            statusElement.textContent = '●';
        }
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    addResult(title, content, isSuccess = true) {
        const resultsContent = document.getElementById('results-content');
        const noResults = resultsContent.querySelector('.no-results');
        
        if (noResults) {
            noResults.remove();
        }

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const resultClass = isSuccess ? 'result-success' : 'result-error';
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-title">${title}</span>
                <span class="result-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="result-content ${resultClass}">${content}</div>
        `;
        
        resultsContent.insertBefore(resultItem, resultsContent.firstChild);
        
        // Show results panel
        const resultsPanel = document.getElementById('results-panel');
        resultsPanel.style.display = 'flex';
    }

    async makeRequest(endpoint, data, isFormData = false) {
        try {
            this.showLoading();
            
            const options = {
                method: 'POST',
                body: isFormData ? data : JSON.stringify(data)
            };
            
            if (!isFormData) {
                options.headers = {
                    'Content-Type': 'application/json'
                };
            }
            
            const response = await fetch(`${this.baseURL}/api${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.hideLoading();
            return result;
        } catch (error) {
            this.hideLoading();
            console.error('Request failed:', error);
            throw error;
        }
    }
}

// Initialize the app
const app = new RawrZApp();

// Encryption Functions
async function encryptFile() {
    const algorithm = document.getElementById('encrypt-algorithm').value;
    const fileInput = document.getElementById('encrypt-file');
    const extension = document.getElementById('encrypt-extension').value;
    
    if (!fileInput.files[0]) {
        alert('Please select a file to encrypt');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('algorithm', algorithm);
    formData.append('extension', extension);
    
    try {
        const result = await app.makeRequest('/encrypt', formData, true);
        
        if (result.success) {
            app.addResult('File Encryption', 
                `✅ File encrypted successfully!\n` +
                `Algorithm: ${result.algorithm}\n` +
                `Extension: ${result.extension}\n` +
                `Output: ${result.output || 'Encryption completed'}`
            );
        } else {
            app.addResult('File Encryption Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('File Encryption Error', `❌ ${error.message}`, false);
    }
}

async function encryptText() {
    const algorithm = document.getElementById('text-encrypt-algorithm').value;
    const text = document.getElementById('encrypt-text').value;
    
    if (!text.trim()) {
        alert('Please enter text to encrypt');
        return;
    }
    
    try {
        const result = await app.makeRequest('/encrypt', {
            algorithm: algorithm,
            text: text,
            extension: '.txt'
        });
        
        if (result.success) {
            app.addResult('Text Encryption', 
                `✅ Text encrypted successfully!\n` +
                `Algorithm: ${algorithm}\n` +
                `Output: ${result.output || 'Encryption completed'}`
            );
        } else {
            app.addResult('Text Encryption Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Text Encryption Error', `❌ ${error.message}`, false);
    }
}

async function advancedCrypto() {
    const operation = document.getElementById('advanced-operation').value;
    const fileInput = document.getElementById('advanced-file');
    
    if (!fileInput.files[0]) {
        alert('Please select a file for advanced crypto operations');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('operation', operation);
    
    try {
        const result = await app.makeRequest('/advanced-crypto', formData, true);
        
        if (result.success) {
            app.addResult('Advanced Crypto', 
                `🚀 Advanced crypto operation completed!\n` +
                `Operation: ${result.operation}\n` +
                `Algorithm: ${result.algorithm}\n` +
                `Output: ${result.output || 'Operation completed'}`
            );
        } else {
            app.addResult('Advanced Crypto Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Advanced Crypto Error', `❌ ${error.message}`, false);
    }
}

async function generateKey() {
    const algorithm = document.getElementById('keygen-algorithm').value;
    const length = document.getElementById('keygen-length').value;
    const save = document.getElementById('keygen-save').checked;
    
    try {
        const result = await app.makeRequest('/keygen', {
            algorithm: algorithm,
            length: parseInt(length),
            save: save,
            extension: '.key'
        });
        
        if (result.success) {
            app.addResult('Key Generation', 
                `🔑 Key generated successfully!\n` +
                `Algorithm: ${algorithm}\n` +
                `Length: ${length} bits\n` +
                `Saved: ${save ? 'Yes' : 'No'}\n` +
                `Output: ${result.output || 'Key generation completed'}`
            );
        } else {
            app.addResult('Key Generation Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Key Generation Error', `❌ ${error.message}`, false);
    }
}

// Analysis Functions
async function analyzeFile() {
    const fileInput = document.getElementById('analyze-file');
    
    if (!fileInput.files[0]) {
        alert('Please select a file to analyze');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
        const result = await app.makeRequest('/analyze', formData, true);
        
        if (result.success && result.analysis) {
            app.addResult('File Analysis', 
                `🔍 File analysis completed!\n` +
                `Size: ${result.analysis.size || 'Unknown'}\n` +
                `Type: ${result.analysis.type || 'Unknown'}\n` +
                `Entropy: ${result.analysis.entropy || 'Unknown'}\n` +
                `MD5: ${result.analysis.md5 || 'N/A'}\n` +
                `SHA256: ${result.analysis.sha256 || 'N/A'}`
            );
        } else {
            app.addResult('File Analysis', result.output || 'Analysis completed');
        }
    } catch (error) {
        app.addResult('File Analysis Error', `❌ ${error.message}`, false);
    }
}

async function generateHash() {
    const algorithm = document.getElementById('hash-algorithm').value;
    const method = document.getElementById('hash-method').value;
    
    let formData = new FormData();
    formData.append('algorithm', algorithm);
    formData.append('save', 'false');
    
    if (method === 'text') {
        const text = document.getElementById('hash-text').value;
        if (!text.trim()) {
            alert('Please enter text to hash');
            return;
        }
        formData.append('text', text);
    } else {
        const fileInput = document.getElementById('hash-file');
        if (!fileInput.files[0]) {
            alert('Please select a file to hash');
            return;
        }
        formData.append('file', fileInput.files[0]);
    }
    
    try {
        const result = await app.makeRequest('/hash', formData, true);
        
        if (result.success) {
            app.addResult('Hash Generation', 
                `#️⃣ Hash generated successfully!\n` +
                `Algorithm: ${result.algorithm}\n` +
                `Hash: ${result.hash || 'Generated'}\n` +
                `Output: ${result.output || 'Hash generation completed'}`
            );
        } else {
            app.addResult('Hash Generation Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Hash Generation Error', `❌ ${error.message}`, false);
    }
}

async function getSystemInfo() {
    try {
        const result = await app.makeRequest('/system', {});
        
        if (result.success) {
            app.addResult('System Information', 
                `💻 System information retrieved!\n` +
                `Platform: ${result.platform}\n` +
                `Architecture: ${result.arch}\n` +
                `Node.js: ${result.nodeVersion}\n` +
                `Memory Total: ${result.memory.total}\n` +
                `Memory Free: ${result.memory.free}\n` +
                `Uptime: ${result.uptime}`
            );
        } else {
            app.addResult('System Information Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('System Information Error', `❌ ${error.message}`, false);
    }
}

// Network Functions
async function dnsLookup() {
    const hostname = document.getElementById('dns-hostname').value;
    
    if (!hostname.trim()) {
        alert('Please enter a hostname');
        return;
    }
    
    try {
        const result = await app.makeRequest('/network/dns', {
            hostname: hostname
        });
        
        if (result.success) {
            app.addResult('DNS Lookup', 
                `🌐 DNS lookup completed!\n` +
                `Hostname: ${result.hostname}\n` +
                `IP Address: ${result.ip}\n` +
                `Output: ${result.output || 'DNS lookup completed'}`
            );
        } else {
            app.addResult('DNS Lookup Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('DNS Lookup Error', `❌ ${error.message}`, false);
    }
}

async function pingHost() {
    const host = document.getElementById('ping-host').value;
    
    if (!host.trim()) {
        alert('Please enter a host to ping');
        return;
    }
    
    try {
        const result = await app.makeRequest('/network/ping', {
            host: host,
            save: false
        });
        
        app.addResult('Ping Test', 
            `📡 Ping test completed!\n` +
            `Host: ${host}\n` +
            `Output: ${result.output || result.error || 'Ping completed'}`
        );
    } catch (error) {
        app.addResult('Ping Test Error', `❌ ${error.message}`, false);
    }
}

// Encoding Functions
async function encodeText() {
    const type = document.getElementById('encoding-type').value;
    const text = document.getElementById('encoding-text').value;
    
    if (!text.trim()) {
        alert('Please enter text to encode');
        return;
    }
    
    try {
        const result = await app.makeRequest('/encode', {
            text: text,
            type: type
        });
        
        if (result.success) {
            app.addResult('Text Encoding', 
                `🔤 Text encoded successfully!\n` +
                `Type: ${type.toUpperCase()}\n` +
                `Output: ${result.output || 'Encoding completed'}`
            );
        } else {
            app.addResult('Text Encoding Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Text Encoding Error', `❌ ${error.message}`, false);
    }
}

async function performTextOperation() {
    const operation = document.getElementById('textop-operation').value;
    const text = document.getElementById('textop-text').value;
    
    if (!text.trim()) {
        alert('Please enter text to process');
        return;
    }
    
    try {
        const result = await app.makeRequest('/textops', {
            operation: operation,
            text: text
        });
        
        if (result.success) {
            app.addResult('Text Operation', 
                `📝 Text operation completed!\n` +
                `Operation: ${operation}\n` +
                `Output: ${result.output || 'Operation completed'}`
            );
        } else {
            app.addResult('Text Operation Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Text Operation Error', `❌ ${error.message}`, false);
    }
}

async function validateInput() {
    const type = document.getElementById('validation-type').value;
    const input = document.getElementById('validation-input').value;
    
    if (!input.trim()) {
        alert('Please enter input to validate');
        return;
    }
    
    try {
        const result = await app.makeRequest('/validate', {
            input: input,
            type: type
        });
        
        if (result.success) {
            const status = result.valid ? '✅ VALID' : '❌ INVALID';
            app.addResult('Validation', 
                `🔍 Validation completed!\n` +
                `Type: ${type.toUpperCase()}\n` +
                `Input: ${input}\n` +
                `Result: ${status}`
            );
        } else {
            app.addResult('Validation Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('Validation Error', `❌ ${error.message}`, false);
    }
}

// Tools Functions
async function generateRandom() {
    const type = document.getElementById('random-type').value;
    const length = document.getElementById('random-length').value;
    
    let endpoint = '';
    let data = {};
    
    switch (type) {
        case 'password':
            endpoint = '/password';
            data = { length: parseInt(length), includeSpecial: true };
            break;
        case 'uuid':
            endpoint = '/uuid';
            break;
        case 'random':
            endpoint = '/random';
            data = { length: parseInt(length) };
            break;
    }
    
    try {
        const response = await fetch(`${app.baseURL}/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        app.addResult('Random Generation', 
            `🎲 Random ${type} generated!\n` +
            `Type: ${type.toUpperCase()}\n` +
            `Output: ${result.output || 'Generation completed'}`
        );
    } catch (error) {
        app.addResult('Random Generation Error', `❌ ${error.message}`, false);
    }
}

async function calculateMath() {
    const expression = document.getElementById('math-expression').value;
    
    if (!expression.trim()) {
        alert('Please enter a mathematical expression');
        return;
    }
    
    try {
        const response = await fetch(`${app.baseURL}/api/math`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expression })
        });
        
        const result = await response.json();
        
        app.addResult('Math Calculator', 
            `🧮 Calculation completed!\n` +
            `Expression: ${expression}\n` +
            `Output: ${result.output || 'Calculation completed'}`
        );
    } catch (error) {
        app.addResult('Math Calculator Error', `❌ ${error.message}`, false);
    }
}

async function listFiles() {
    try {
        const response = await fetch(`${app.baseURL}/api/files`);
        const result = await response.json();
        
        if (result.success) {
            const fileList = result.files.map(file => 
                `📄 ${file.name} (${file.size} bytes) - ${new Date(file.created).toLocaleString()}`
            ).join('\n');
            
            app.addResult('File Manager', 
                `📁 Files listed successfully!\n` +
                `Total files: ${result.count}\n\n` +
                `${fileList || 'No files found'}`
            );
        } else {
            app.addResult('File Manager Error', `❌ ${result.error}`, false);
        }
    } catch (error) {
        app.addResult('File Manager Error', `❌ ${error.message}`, false);
    }
}

// Utility Functions
function toggleHashInput() {
    const method = document.getElementById('hash-method').value;
    const textGroup = document.getElementById('hash-text-group');
    const fileGroup = document.getElementById('hash-file-group');
    
    if (method === 'text') {
        textGroup.style.display = 'block';
        fileGroup.style.display = 'none';
    } else {
        textGroup.style.display = 'none';
        fileGroup.style.display = 'block';
    }
}

function clearResults() {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = `
        <div class="no-results">
            <i class="fas fa-info-circle"></i>
            <p>Results will appear here after running operations</p>
        </div>
    `;
}

// Auto-refresh system status every 30 seconds
setInterval(() => {
    app.checkSystemStatus();
}, 30000);