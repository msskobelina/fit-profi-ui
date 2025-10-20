import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#7C4DFF',
                    secondary: '#00BFA5',
                    surface: '#ffffff',
                },
            },
        },
    },
})

createApp(App).use(vuetify).mount('#app')
