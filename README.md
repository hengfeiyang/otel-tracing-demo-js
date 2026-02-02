# OpenTelemetry Tracing Test

A web-based application for testing OpenTelemetry tracing in the browser. This project demonstrates how to set up and use OpenTelemetry with OTLP HTTP exporter, including Basic Authentication support.

## Features

- ✅ OpenTelemetry Web SDK integration
- ✅ OTLP HTTP exporter for sending traces to collectors
- ✅ Basic Authentication support
- ✅ Interactive test UI with multiple tracing scenarios
- ✅ Custom resource attributes
- ✅ Nested spans, async operations, and error handling examples

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An OpenTelemetry collector running and accessible (default: `http://localhost:5080/api/public/v1/traces`)

## Installation

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### OpenTelemetry Collector

Make sure you have an OpenTelemetry collector running and accessible. The default endpoint is:
```
http://localhost:5080/api/public/v1/traces
```

You can change this URL in the UI or when initializing the provider programmatically.

### Basic Authentication

If your collector requires Basic Authentication, you can provide credentials:
- **Username**: Your collector username
- **Password**: Your collector password

The application will automatically create the `Authorization: Basic <base64>` header.

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

This will:
- Start Vite dev server (usually on `http://localhost:3333`)
- Open your browser automatically
- Enable hot module replacement for fast development

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Using the Web UI

1. **Open the application** in your browser (usually `http://localhost:3333`)

2. **Configure the connection**:
   - **Collector URL**: Enter your OpenTelemetry collector endpoint
   - **Username** (optional): Enter username if Basic Auth is required
   - **Password** (optional): Enter password if Basic Auth is required

3. **Initialize OpenTelemetry**:
   - Click "Initialize OpenTelemetry" button
   - Wait for the status to show "OpenTelemetry initialized and ready"

4. **Run tracing tests**:
   - **Run Tracing Tests**: Creates simple spans and batch processing examples
   - **Test Async Operations**: Demonstrates tracing async/await operations
   - **Test Nested Spans**: Shows parent-child-grandchild span relationships
   - **Test Error Handling**: Demonstrates error recording and status codes

5. **View logs**: Check the log panel at the bottom for detailed information about each operation

## Using the otel.js Module in Your Code

### Basic Usage

```javascript
import otelProvider from './otel.js';

// Initialize without authentication
otelProvider.init({
    url: 'http://localhost:5080/api/public/v1/traces'
});

// Get a tracer
const tracer = otelProvider.getTracer('my-tracer', '1.0.0');

// Create a span
tracer.startActiveSpan('my-operation', (span) => {
    span.setAttribute('key', 'value');
    // Your code here
    span.end();
});
```

### With Basic Authentication

```javascript
import otelProvider from './otel.js';

// Initialize with Basic Auth
otelProvider.init({
    url: 'http://localhost:5080/api/public/v1/traces',
    username: 'myuser',
    password: 'mypassword'
});

const tracer = otelProvider.getTracer('my-tracer', '1.0.0');
```

### Advanced Configuration

```javascript
import otelProvider from './otel.js';

// Initialize with custom headers and timeout
otelProvider.init({
    url: 'http://localhost:5080/api/public/v1/traces',
    username: 'myuser',
    password: 'mypassword',
    timeout: 15000, // 15 seconds
    headers: {
        'X-Custom-Header': 'value'
    }
});
```

## Code Examples

### Simple Span

```javascript
const tracer = otelProvider.getTracer('example-tracer', '1.0.0');

tracer.startActiveSpan('simple-operation', {
    attributes: {
        'operation.type': 'test',
        'user.id': '123'
    }
}, (span) => {
    // Your code here
    span.setStatus({ code: 1 }); // OK
    span.end();
});
```

### Nested Spans

```javascript
tracer.startActiveSpan('parent-operation', (parentSpan) => {
    tracer.startActiveSpan('child-operation', (childSpan) => {
        // Child operation code
        childSpan.end();
    });
    parentSpan.end();
});
```

### Async Operations

```javascript
tracer.startActiveSpan('async-workflow', async (span) => {
    await tracer.startActiveSpan('fetch-data', async (fetchSpan) => {
        const data = await fetch('/api/data');
        fetchSpan.setAttribute('data.size', data.size);
        fetchSpan.end();
    });
    span.end();
});
```

### Error Handling

```javascript
tracer.startActiveSpan('risky-operation', (span) => {
    try {
        // Code that might throw
        throw new Error('Something went wrong');
    } catch (error) {
        span.recordException(error);
        span.setStatus({
            code: 2, // ERROR
            message: error.message
        });
        span.setAttribute('error.type', error.name);
    }
    span.end();
});
```

## Resource Attributes

The application sets the following resource attributes (customizable in `src/otel.js`):

- `service.name`: QKey
- `service.version`: 5.4.100.1
- `fairfax.app.name`: QKey
- `fairfax.app.version`: 5.4.100.1
- `fairfax.deployment.environment.name`: Development
- `fairfax.customer.name`: LongNguyen
- `fairfax.app.component.name`: LibCommon
- `fairfax.app.component.version`: 5.4.200.1
- `fairfax.environment.host`: Machine1

To customize these, edit the `resourceFromAttributes` call in `src/otel.js`.

## Troubleshooting

### Module Resolution Errors

If you see errors like "Failed to resolve module specifier", make sure you're running the application through Vite:
```bash
npm run dev
```

Don't open `index.html` directly in the browser - it needs to be served through Vite.

### Traces Not Appearing in Collector

1. **Check collector URL**: Verify the URL is correct and accessible
2. **Check authentication**: If your collector requires auth, make sure credentials are correct
3. **Check network tab**: Open browser DevTools → Network tab and look for requests to your collector endpoint
4. **Check collector logs**: Verify your collector is receiving and processing traces
5. **CORS issues**: Make sure your collector allows CORS requests from your origin

### Connection Timeout

- Increase the timeout value in the configuration
- Check if your collector is running and accessible
- Verify firewall/network settings

## Project Structure

```
otel-test/
├── src/
│   ├── otel.js          # OpenTelemetry provider configuration
│   └── app.js           # Application logic and test examples
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Dependencies

- `@opentelemetry/api`: OpenTelemetry API
- `@opentelemetry/exporter-trace-otlp-http`: OTLP HTTP exporter
- `@opentelemetry/resources`: Resource management
- `@opentelemetry/sdk-trace-web`: Web SDK for tracing
- `@opentelemetry/semantic-conventions`: Semantic conventions
- `vite`: Build tool and dev server

## License

This is a test/demo project. Use as needed.

## Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [OTLP Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md)
