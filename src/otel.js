import {
    defaultResource,
    resourceFromAttributes,
} from '@opentelemetry/resources';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter }                     from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { diag, DiagConsoleLogger, DiagLogLevel, trace } from '@opentelemetry/api';
const DEPLOYMENT_ENVIRONMENT_NAME="fairfax.deployment.environment.name"
const CUSTOMER_NAME="fairfax.customer.name"
const APPLICATION_NAME="fairfax.app.name"
const APPLICATION_VERSION="fairfax.app.version"
const COMPONENT_NAME="fairfax.app.component.name"
const COMPONENT_VERSION="fairfax.app.component.version"
const HOST="fairfax.environment.host"
const otelProvider = {
    provider:null,
    init(conf) {
        try {
            // Build headers object
            const headers = {};
            headers['stream-name'] = conf?.streamName || 'default';

            // Add Basic Auth if credentials are provided
            if (conf && conf.username && conf.password) {
                // Create Basic Auth header: base64(username:password)
                const credentials = btoa(`${conf.username}:${conf.password}`);
                headers['Authorization'] = `Basic ${credentials}`;
                console.log('Basic authentication configured');
            }
            
            // Allow custom headers to be passed
            if (conf && conf.headers) {
                Object.assign(headers, conf.headers);
            }
            
            const collectorOptions = {
                url: conf?.url || 'http://localhost:5080/api/default/v1/traces',
                headers: headers,
                timeout: conf?.timeout || 10000, // Optional: Maximum time the exporter waits for each batch (10s default)
            };
            const resource = defaultResource().merge(
                resourceFromAttributes({
                    [ATTR_SERVICE_NAME]: 'QKey',
                    [ATTR_SERVICE_VERSION]: '5.4.100.1',
                    [APPLICATION_NAME]: 'QKey',
                    [APPLICATION_VERSION]: '5.4.100.1',
                    [DEPLOYMENT_ENVIRONMENT_NAME]: 'Development',
                    [CUSTOMER_NAME]: 'LongNguyen',
                    [COMPONENT_NAME]: 'LibCommon',
                    [COMPONENT_VERSION]: '5.4.200.1',
                    [HOST]:'Machine1'
                }),
            );
            console.log('Resource attributes:', resource.attributes);

            const traceExporter = new OTLPTraceExporter(collectorOptions);

            const traceProcessor = new BatchSpanProcessor(traceExporter, {scheduledDelayMillis: 1000});

            const provider = new WebTracerProvider({
                    resource: resource,
                    spanProcessors: [traceProcessor]
                }
            );

            provider.register(/* ... */);
            this.provider = provider;

            const trace1 = trace.getTracer('Tracer1');
            trace1.startActiveSpan('Test1', (root) => {
                trace1.startActiveSpan('Test2', (child) => {
                    child.end();
                });
                root.end();
            });
        }
        catch(e){
            console.error("otelProvider.init error. " + e.message)
        }
    },

    getTracer(name, version) {
        return trace.getTracer(name, version);
    }
}
export default otelProvider;

