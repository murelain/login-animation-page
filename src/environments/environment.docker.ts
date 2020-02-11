// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build c=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,

    API_HOST: 'http://localhost:5001',

    API_SOCKET_URL: 'ws://localhost:5001/ws',

    MSG_HOST: 'http://localhost:5002',

    MSG_SOCKET_URL: 'ws://localhost:5002/ws',

    COOKIE_DOMAIN: 'localhost',

    MAPBOX_TOKEN: 'pk.eyJ1IjoidHV0b3JhcHAiLCJhIjoiY2luNjJrYThqMGU4NHZobTRrb3N5dW8ydyJ9.tWCvx9Qix0jRtOpYN695CQ',

    FacebookAppID: '973943206139444',

    GoogleMapsApiKey: 'AIzaSyA3c50qvfZ98V8kGNWwwm1My42SitWfYT8',

    INTERCOM_APP_ID: 'vj5hlyew',
};
