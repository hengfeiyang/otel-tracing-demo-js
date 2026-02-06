import otelProvider from './otel.js';

// Logging helper
function log(message, type = 'info') {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
    console.log(message);
}

// Update status
function updateStatus(connected) {
    const statusDiv = document.getElementById('status');
    if (connected) {
        statusDiv.className = 'status connected';
        statusDiv.textContent = 'Status: OpenTelemetry initialized and ready';
        document.getElementById('testBtn').disabled = false;
        document.getElementById('asyncBtn').disabled = false;
        document.getElementById('nestedBtn').disabled = false;
        document.getElementById('errorBtn').disabled = false;
    } else {
        statusDiv.className = 'status disconnected';
        statusDiv.textContent = 'Status: Not initialized';
    }
}

// Initialize OpenTelemetry
window.initializeOtel = function() {
    try {
        log('Initializing OpenTelemetry...', 'info');
        
        // Get credentials from input fields
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const url = document.getElementById('collectorUrl').value.trim() || 'http://localhost:5080/api/default/v1/traces';
        const streamName = document.getElementById('streamName').value.trim() || 'default';

        // Build configuration object
        const config = {
            url: url,
            streamName: streamName
        };
        
        // Add Basic Auth if credentials are provided
        if (username && password) {
            config.username = username;
            config.password = password;
            log(`Using Basic Auth with username: ${username}`, 'info');
        } else {
            log('No credentials provided - connecting without authentication', 'info');
        }
        
        // Initialize the provider
        otelProvider.init(config);
        
        log('OpenTelemetry initialized successfully!', 'success');
        log('Tracer is ready. You can now create spans.', 'success');
        updateStatus(true);
        document.getElementById('initBtn').disabled = true;
        document.getElementById('username').disabled = true;
        document.getElementById('password').disabled = true;
        document.getElementById('collectorUrl').disabled = true;
        document.getElementById('streamName').disabled = true;
    } catch (error) {
        log(`Error initializing OpenTelemetry: ${error.message}`, 'error');
        console.error(error);
    }
};

// Example 1: Basic tracing test
window.runTracingTests = function() {
    log('Running basic tracing tests...', 'info');
    
    const tracer = otelProvider.getTracer('test-tracer', '1.0.0');
    
    // Simple span
    tracer.startActiveSpan('simple-operation', {
        attributes: {
            'operation.type': 'test',
            'test.name': 'basic-tracing'
        }
    }, (span) => {
        log('Created span: simple-operation', 'info');
        
        // Simulate some work
        setTimeout(() => {
            span.setStatus({ code: 1 }); // OK
            span.end();
            log('Span ended: simple-operation', 'success');
        }, 100);
    });
    
    // Multiple spans
    tracer.startActiveSpan('batch-processing', (span) => {
        log('Created span: batch-processing', 'info');
        
        for (let i = 0; i < 3; i++) {
            tracer.startActiveSpan(`process-item-${i}`, {
                attributes: {
                    'item.index': i,
                    'item.id': `item-${i}`
                }
            }, (childSpan) => {
                // Simulate processing
                setTimeout(() => {
                    childSpan.end();
                    log(`Processed item ${i}`, 'info');
                }, 50);
            });
        }
        
        setTimeout(() => {
            span.end();
            log('Span ended: batch-processing', 'success');
        }, 200);
    });
};

// Example 2: Async operations
window.testAsyncOperations = function() {
    log('Testing async operations...', 'info');
    
    const tracer = otelProvider.getTracer('async-tracer', '1.0.0');
    
    tracer.startActiveSpan('async-workflow', async (span) => {
        log('Started async workflow', 'info');
        
        // Simulate async operations
        await tracer.startActiveSpan('fetch-data', async (fetchSpan) => {
            log('Fetching data...', 'info');
            await new Promise(resolve => setTimeout(resolve, 300));
            fetchSpan.setAttribute('data.size', 1024);
            fetchSpan.setAttribute('data.type', 'json');
            fetchSpan.end();
            log('Data fetched', 'success');
        });
        
        await tracer.startActiveSpan('process-data', async (processSpan) => {
            log('Processing data...', 'info');
            await new Promise(resolve => setTimeout(resolve, 200));
            processSpan.setAttribute('processing.time', 200);
            processSpan.end();
            log('Data processed', 'success');
        });
        
        await tracer.startActiveSpan('save-result', async (saveSpan) => {
            log('Saving result...', 'info');
            await new Promise(resolve => setTimeout(resolve, 150));
            saveSpan.setAttribute('result.status', 'saved');
            saveSpan.end();
            log('Result saved', 'success');
        });
        
        span.end();
        log('Async workflow completed', 'success');
    });
};

// Example 3: Nested spans
window.testNestedSpans = function() {
    log('Testing nested spans...', 'info');
    
    const tracer = otelProvider.getTracer('nested-tracer', '1.0.0');
    
    tracer.startActiveSpan('parent-operation', {
        attributes: {
            'operation.level': 'parent'
        }
    }, (parentSpan) => {
        log('Created parent span', 'info');
        
        tracer.startActiveSpan('child-operation-1', {
            attributes: {
                'operation.level': 'child',
                'child.id': 1
            }
        }, (child1Span) => {
            log('Created child span 1', 'info');
            
            tracer.startActiveSpan('grandchild-operation', {
                attributes: {
                    'operation.level': 'grandchild'
                }
            }, (grandchildSpan) => {
                log('Created grandchild span', 'info');
                setTimeout(() => {
                    grandchildSpan.end();
                    log('Grandchild span ended', 'success');
                }, 100);
            });
            
            setTimeout(() => {
                child1Span.end();
                log('Child span 1 ended', 'success');
            }, 150);
        });
        
        tracer.startActiveSpan('child-operation-2', {
            attributes: {
                'operation.level': 'child',
                'child.id': 2
            }
        }, (child2Span) => {
            log('Created child span 2', 'info');
            setTimeout(() => {
                child2Span.end();
                log('Child span 2 ended', 'success');
            }, 120);
        });
        
        setTimeout(() => {
            parentSpan.end();
            log('Parent span ended', 'success');
        }, 200);
    });
};

// Example 4: Error handling
window.testErrorHandling = function() {
    log('Testing error handling...', 'info');
    
    const tracer = otelProvider.getTracer('error-tracer', '1.0.0');
    
    // Span with error
    tracer.startActiveSpan('operation-with-error', (span) => {
        log('Starting operation that will fail...', 'info');
        
        try {
            // Simulate an error
            throw new Error('Simulated error for testing');
        } catch (error) {
            span.recordException(error);
            span.setStatus({
                code: 2, // ERROR
                message: error.message
            });
            span.setAttribute('error.type', error.name);
            log(`Error recorded: ${error.message}`, 'error');
        }
        
        span.end();
        log('Span ended with error status', 'info');
    });
    
    // Successful operation after error
    setTimeout(() => {
        tracer.startActiveSpan('recovery-operation', (span) => {
            log('Starting recovery operation...', 'info');
            span.setStatus({ code: 1 }); // OK
            span.setAttribute('recovery.successful', true);
            span.end();
            log('Recovery operation completed', 'success');
        });
    }, 100);
};

// Auto-initialize on page load (optional - comment out if you want manual initialization)
// window.addEventListener('DOMContentLoaded', () => {
//     log('Page loaded. Click "Initialize OpenTelemetry" to start.', 'info');
// });
