import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { initAnalytics, track } from "./analytics/mixpanel";

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#00BFA5',
                    secondary: '#7C4DFF',
                    surface: '#ffffff',
                },
            },
        },
    },
})

initAnalytics()
track("Frontend Started")

createApp(App).use(vuetify).mount('#app')
