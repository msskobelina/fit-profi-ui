import mixpanel from "mixpanel-browser";

const token = "736d309cabec2b9b3a8aa93d60e46cc4" as string | undefined;
const env = (import.meta.env.VITE_APP_ENV as string | undefined) ?? "local";

let inited = false;

export function initAnalytics() {
    if (inited) return;
    if (!token) {
        console.warn("[analytics] VITE_MIXPANEL_TOKEN is not set");
        return;
    }

    mixpanel.init(token, {
        debug: env !== "prod",
        track_pageview: false,
        persistence: "localStorage",
        api_host: "https://api-eu.mixpanel.com",
    });

    mixpanel.register({
        env,
        source: "frontend",
        app: "fitprofi-ui",
    });

    inited = true;
}

export function track(event: string, props: Record<string, any> = {}) {
    if (!token) return;
    mixpanel.track(event, props);
}

export function identify(distinctId: string) {
    if (!token) return;
    mixpanel.identify(distinctId);
}

export function setUserProfile(props: Record<string, any>) {
    if (!token) return;
    mixpanel.people.set(props);
}

export function resetAnalytics() {
    if (!token) return;
    mixpanel.reset();
}
