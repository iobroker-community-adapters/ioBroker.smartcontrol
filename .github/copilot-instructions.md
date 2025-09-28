# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

## Adapter-Specific Context
- **Adapter Name**: ioBroker.smartcontrol  
- **Primary Function**: Smart control adapter for grouping and controlling devices with intelligent automation based on triggers like motion sensors, wall switches, time schedules, and environmental conditions
- **Key Features**: 
  - Zone-based device automation and control
  - Motion sensor integration with brightness thresholds
  - Time-based scheduling (including astronomical events like sunrise/sunset)
  - Target device management (lights, radios, enumerations, URLs)
  - Conditional execution based on presence, holidays, manual states
  - Complex trigger combinations and linked motion sensors
- **Target Devices**: Lights, radios, switches, any ioBroker controllable devices
- **Configuration**: Extensive table-based configuration in adapter admin UI with multiple tabs for targets, conditions, triggers, zones, and execution schedules
- **Dependencies**: node-schedule, suncalc2, axios for external URL calls, cheerio for web scraping
- **Repository**: iobroker-community-adapters/ioBroker.smartcontrol

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Verify states were created
                        const states = await harness.states.getKeysAsync('your-adapter.0.*');
                        
                        if (states && states.length > 0) {
                            console.log(`✅ SUCCESS: Found ${states.length} states created`);
                            states.slice(0, 10).forEach(state => console.log(`   📊 ${state}`));
                            if (states.length > 10) console.log(`   ... and ${states.length - 10} more states`);
                            resolve();
                        } else {
                            reject(new Error('No states created by adapter'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).timeout(30000);
        });
    }
});
```

#### Configuration Testing Pattern
For configuration-heavy adapters like this one:

```javascript
// Test configuration validation
it('should validate adapter configuration', async function () {
    const config = {
        tableTriggerMotion: [
            {
                active: true,
                name: "Test.Motion",
                stateId: "test.motion.sensor",
                stateVal: "true",
                duration: "10"
            }
        ],
        tableTargetDevices: [
            {
                active: true,
                name: "Test.Light",
                onState: "test.light.state", 
                onValue: "true"
            }
        ],
        tableZones: [
            {
                active: true,
                name: "Test.Zone",
                triggers: ["Test.Motion"],
                targets: ["Test.Light"],
                offAfter: "5000"
            }
        ]
    };
    
    // Test configuration validation logic
    const validationResult = await adapter._asyncVerifyConfig(config);
    expect(validationResult.passed).toBe(true);
    expect(validationResult.issues).toHaveLength(0);
}).timeout(10000);
```

## ioBroker Adapter Patterns and Best Practices

### Core Adapter Structure

#### Main Class Structure
```javascript
class SmartControl extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'smartcontrol',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
}
```

#### Initialization Pattern
```javascript
async onReady() {
    try {
        // 1. Subscribe to states and objects
        this.subscribeStates('*');
        
        // 2. Validate configuration
        const configResult = await this._asyncVerifyConfig(this.config);
        if (!configResult.passed) {
            this.log.error(`Configuration validation failed: ${configResult.issues.join(', ')}`);
            this.setState('info.connection', false, true);
            return;
        }
        
        // 3. Initialize schedules, timers, subscriptions
        await this.initializeSchedules();
        await this.subscribeToTriggerStates();
        
        // 4. Set connection state
        this.setState('info.connection', true, true);
        
        this.log.info('Adapter started successfully');
    } catch (error) {
        this.log.error(`Error during initialization: ${error.message}`);
        this.setState('info.connection', false, true);
    }
}
```

### State and Object Management

#### State Operations
```javascript
// Safe state setting with acknowledgment handling
async setState(id, value, ack = false) {
    try {
        await this.setStateAsync(id, {
            val: value,
            ack: ack,
            ts: Date.now(),
            from: this.namespace
        });
    } catch (error) {
        this.log.error(`Failed to set state ${id}: ${error.message}`);
    }
}

// State subscription and handling
async subscribeToTriggerStates() {
    for (const trigger of this.config.tableTriggerMotion || []) {
        if (trigger.active && trigger.stateId) {
            await this.subscribeForeignStatesAsync(trigger.stateId);
        }
    }
}

onStateChange(id, state) {
    if (!state || state.ack) return;
    
    // Handle state changes for triggers
    this.processTrigger(id, state);
}
```

#### Object Creation and Management
```javascript
// Create adapter objects
async createObject(id, obj) {
    try {
        const existingObj = await this.getObjectAsync(id);
        if (!existingObj) {
            await this.setObjectAsync(id, obj);
            this.log.debug(`Created object ${id}`);
        }
    } catch (error) {
        this.log.error(`Failed to create object ${id}: ${error.message}`);
    }
}
```

### Configuration Validation

#### Configuration Structure Validation
```javascript
async _asyncVerifyConfig(configObject) {
    const issues = [];
    let errors = 0;
    
    try {
        // Validate required tables exist
        const requiredTables = ['tableTargetDevices', 'tableZones', 'tableTriggerMotion'];
        for (const table of requiredTables) {
            if (!configObject[table] || !Array.isArray(configObject[table])) {
                issues.push(`Required table ${table} is missing or invalid`);
                errors++;
            }
        }
        
        // Validate trigger references
        for (const zone of configObject.tableZones || []) {
            if (zone.active) {
                for (const triggerName of zone.triggers || []) {
                    const triggerExists = this.findTriggerByName(configObject, triggerName);
                    if (!triggerExists) {
                        issues.push(`Zone "${zone.name}" references non-existent trigger "${triggerName}"`);
                        errors++;
                    }
                }
            }
        }
        
        return {
            passed: errors === 0,
            obj: configObject,
            issues: issues
        };
    } catch (error) {
        return {
            passed: false,
            obj: configObject,
            issues: [`Configuration validation error: ${error.message}`]
        };
    }
}
```

### Scheduling and Timers

#### Time-based Scheduling
```javascript
const schedule = require('node-schedule');

// Schedule recurring tasks
initializeSchedules() {
    // Process time-based triggers
    for (const timeTrigger of this.config.tableTriggerTimes || []) {
        if (timeTrigger.active) {
            this.scheduleTimeTrigger(timeTrigger);
        }
    }
}

scheduleTimeTrigger(trigger) {
    const job = schedule.scheduleJob(trigger.time, () => {
        this.log.info(`Time trigger "${trigger.name}" activated`);
        this.processTimeTrigger(trigger);
    });
    
    if (job) {
        this.scheduledJobs.push(job);
        this.log.debug(`Scheduled time trigger: ${trigger.name} (${trigger.time})`);
    } else {
        this.log.error(`Failed to schedule time trigger: ${trigger.name}`);
    }
}
```

### Error Handling and Recovery

#### Robust Error Handling
```javascript
async processZone(zoneName, triggerId) {
    try {
        const zone = this.findZoneByName(zoneName);
        if (!zone || !zone.active) {
            this.log.debug(`Zone ${zoneName} not found or inactive`);
            return;
        }
        
        // Process zone logic with individual error handling
        for (const targetName of zone.targets || []) {
            try {
                await this.activateTarget(targetName);
            } catch (error) {
                this.log.error(`Failed to activate target ${targetName}: ${error.message}`);
                // Continue with other targets
            }
        }
        
    } catch (error) {
        this.log.error(`Error processing zone ${zoneName}: ${error.message}`);
        // Don't throw - continue operation
    }
}
```

#### Connection Monitoring
```javascript
// Monitor adapter connection state
async checkConnection() {
    try {
        // Perform health check
        const isHealthy = await this.performHealthCheck();
        await this.setState('info.connection', isHealthy, true);
        
        if (!isHealthy) {
            this.log.warn('Health check failed, attempting recovery');
            await this.attemptRecovery();
        }
    } catch (error) {
        this.log.error(`Health check failed: ${error.message}`);
        await this.setState('info.connection', false, true);
    }
}
```

### Resource Cleanup

#### Proper Unload Handling
```javascript
async onUnload(callback) {
    try {
        // Cancel all scheduled jobs
        for (const job of this.scheduledJobs || []) {
            job.cancel();
        }
        this.scheduledJobs = [];
        
        // Clear all timers
        for (const timer of this.timers || []) {
            clearTimeout(timer);
        }
        this.timers = [];
        
        // Clear intervals
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = undefined;
        }
        
        // Close connections, clean up resources
        this.log.info('Adapter stopped');
        callback();
    } catch (error) {
        this.log.error(`Error during unload: ${error.message}`);
        callback();
    }
}
```

## JSON Configuration Management

### Admin Interface Integration
```javascript
// Handle messages from admin interface
onMessage(obj) {
    if (typeof obj === 'object' && obj.message) {
        switch (obj.command) {
            case 'validateConfig':
                this.handleConfigValidation(obj);
                break;
            case 'testConnection':
                this.handleConnectionTest(obj);
                break;
            default:
                this.log.warn(`Unknown command: ${obj.command}`);
        }
    }
}

async handleConfigValidation(obj) {
    try {
        const result = await this._asyncVerifyConfig(obj.message);
        this.sendTo(obj.from, obj.command, result, obj.callback);
    } catch (error) {
        this.sendTo(obj.from, obj.command, {
            error: error.message
        }, obj.callback);
    }
}
```

### JSON Configuration Parsing
```javascript
// Parse execution JSON from configuration
parseExecutionJson(executionJson) {
    try {
        if (!executionJson) return [];
        
        const executions = JSON.parse(executionJson);
        return Array.isArray(executions) ? executions : [];
    } catch (error) {
        this.log.error(`Failed to parse execution JSON: ${error.message}`);
        return [];
    }
}

// Validate execution rules
validateExecutionRule(rule) {
    const required = ['active', 'start', 'end'];
    for (const field of required) {
        if (!(field in rule)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Additional validation logic
    return true;
}
```

## Logging Best Practices

### Structured Logging
```javascript
// Use appropriate log levels
this.log.error('Critical error that prevents operation');
this.log.warn('Warning about potential issues');
this.log.info('Important operational information');
this.log.debug('Detailed debugging information');

// Structured logging with context
this.log.info(`Zone "${zoneName}" activated by trigger "${triggerName}" at ${new Date().toISOString()}`);

// Performance logging
const startTime = Date.now();
await this.processComplexOperation();
this.log.debug(`Complex operation completed in ${Date.now() - startTime}ms`);
```

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

## CI/CD and Testing Integration

### GitHub Actions for API Testing
For adapters with external API dependencies, implement separate CI/CD jobs:

```yaml
# Tests API connectivity with demo credentials (runs separately)
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run demo API tests
      run: npm run test:integration-demo
```

### CI/CD Best Practices
- Run credential tests separately from main test suite
- Use ubuntu-22.04 for consistency
- Don't make credential tests required for deployment
- Provide clear failure messages for API connectivity issues
- Use appropriate timeouts for external API calls (120+ seconds)

### Package.json Script Integration
Add dedicated script for credential testing:
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit"
  }
}
```

### Practical Example: Complete API Testing Implementation
Here's a complete example based on lessons learned from the Discovergy adapter:

#### test/integration-demo.js
```javascript
const path = require("path");
const { tests } = require("@iobroker/testing");

// Helper function to encrypt password using ioBroker's encryption method
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    
    if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    
    return result;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

## SmartControl-Specific Development Patterns

### Zone-Based Automation Logic
```javascript
// Process zone activation with complex conditions
async processZoneActivation(zoneName, triggerId, triggerValue) {
    try {
        const zone = this.findZoneByName(zoneName);
        if (!zone || !zone.active) return;
        
        // Check execution conditions (time, day, additional conditions)
        const executionRules = this.parseExecutionJson(zone.executionJson);
        const canExecute = await this.checkExecutionConditions(executionRules);
        
        if (!canExecute && !zone.executeAlways) {
            this.log.debug(`Zone ${zoneName} execution blocked by conditions`);
            return;
        }
        
        // Activate targets with individual error handling
        for (const targetName of zone.targets || []) {
            try {
                await this.activateTarget(targetName, zone);
            } catch (error) {
                this.log.error(`Failed to activate target ${targetName} in zone ${zoneName}: ${error.message}`);
            }
        }
        
        // Schedule auto-off if configured
        if (zone.offAfter && parseInt(zone.offAfter) > 0) {
            this.scheduleZoneOff(zoneName, parseInt(zone.offAfter));
        }
        
    } catch (error) {
        this.log.error(`Error processing zone activation ${zoneName}: ${error.message}`);
    }
}
```

### Motion Sensor Integration
```javascript
// Handle motion sensor triggers with brightness and linking
processMotionTrigger(trigger, state) {
    // Check brightness threshold if configured
    if (trigger.briStateId && trigger.briThreshold) {
        const brightness = await this.getForeignStateAsync(trigger.briStateId);
        if (brightness && brightness.val > parseInt(trigger.briThreshold)) {
            this.log.debug(`Motion ${trigger.name} ignored - brightness above threshold`);
            return;
        }
    }
    
    // Check linked motion sensors
    if (trigger.motionLinkedTrigger && trigger.motionLinkedTrigger.length > 0) {
        const linkedActive = await this.checkLinkedMotionSensors(trigger.motionLinkedTrigger);
        if (!linkedActive) {
            this.log.debug(`Motion ${trigger.name} ignored - linked sensors not active`);
            return;
        }
    }
    
    // Process zones that use this trigger
    this.findZonesByTrigger(trigger.name).forEach(zone => {
        this.processZoneActivation(zone.name, trigger.name, state.val);
    });
}
```

### Time and Schedule Management
```javascript
const SunCalc = require('suncalc2');

// Process astronomical time calculations
calculateAstronomicalTime(timeString) {
    const now = new Date();
    const times = SunCalc.getTimes(now, this.config.latitude || 51.1657, this.config.longitude || 10.4515);
    
    if (timeString.startsWith('sunrise')) {
        const offset = this.parseTimeOffset(timeString.replace('sunrise', ''));
        return new Date(times.sunrise.getTime() + offset);
    } else if (timeString.startsWith('sunset')) {
        const offset = this.parseTimeOffset(timeString.replace('sunset', ''));
        return new Date(times.sunset.getTime() + offset);
    }
    
    return this.parseTimeString(timeString);
}

parseTimeOffset(offsetStr) {
    const match = offsetStr.match(/^([+-]?)(\d+)$/);
    if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const minutes = parseInt(match[2]);
        return sign * minutes * 60 * 1000; // Convert to milliseconds
    }
    return 0;
}
```