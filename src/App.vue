<template>
  <v-app>
    <!-- HEADER -->
    <v-app-bar flat density="comfortable" color="transparent" class="appbar">
      <v-container fluid class="d-flex align-center justify-space-between px-4">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-dumbbell" size="24" class="mr-1" />
          <span class="text-h6 font-weight-bold">FitProfi</span>
        </div>
        <div class="d-flex align-center ga-2">
          <v-btn variant="text" class="text-medium-emphasis" @click="openLogin">
            Увійти
          </v-btn>
          <v-btn color="primary" variant="flat" class="rounded-xl px-5" @click="openRegister">
            Зареєструватись
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <!-- HERO -->
    <v-main>
      <section class="hero">
        <div class="hero__overlay" />
        <div class="hero__content">
          <h1 class="hero__title">
            Твій персональний <br />
            <span>фітнес-помічник</span>
          </h1>

          <p class="hero__subtitle">
            Плануй тренування, відстежуй харчування та тримай себе у формі з FitProfi.
          </p>

          <div class="hero__actions">
            <v-btn color="primary" size="large" class="rounded-xl px-6">
              Почати зараз
            </v-btn>
            <v-btn variant="tonal" size="large" class="rounded-xl px-6 ml-2">
              Дізнатися більше
            </v-btn>
          </div>
        </div>
      </section>
    </v-main>

    <!-- FOOTER -->
    <v-footer app class="justify-center">
      <div class="text-caption text-medium-emphasis py-3">
        © {{ year }} FitProfi
      </div>
    </v-footer>

    <!-- ======= LOGIN MODAL (native inputs/buttons) ======= -->
    <div v-if="loginDialog" class="modal">
      <div class="modal__backdrop" @click="closeAll"></div>
      <div class="modal__card">
        <div class="modal__title">Увійти</div>
        <form @submit.prevent="onLogin" class="form">
          <label class="form__label">Email</label>
          <input class="form__input" type="email" v-model.trim="login.email" required />

          <label class="form__label">Пароль</label>
          <input class="form__input" type="password" v-model.trim="login.password" minlength="6" required />

          <button class="btn btn--primary" :disabled="loading.login">
            <span v-if="!loading.login">Увійти</span>
            <span v-else>Зачекайте…</span>
          </button>
          <button type="button" class="btn btn--ghost" @click="closeAll">Скасувати</button>
        </form>
      </div>
    </div>

    <!-- ======= REGISTER MODAL (native inputs/buttons) ======= -->
    <div v-if="registerDialog" class="modal">
      <div class="modal__backdrop" @click="closeAll"></div>
      <div class="modal__card">
        <div class="modal__title">Зареєструватись</div>
        <form @submit.prevent="onRegister" class="form">
          <label class="form__label">Ім’я</label>
          <input class="form__input" type="text" v-model.trim="register.fullName" required />

          <label class="form__label">Email</label>
          <input class="form__input" type="email" v-model.trim="register.email" required />

          <label class="form__label">Пароль</label>
          <input class="form__input" type="password" v-model.trim="register.password" minlength="6" required />

          <button class="btn btn--primary" :disabled="loading.register">
            <span v-if="!loading.register">Створити акаунт</span>
            <span v-else>Зачекайте…</span>
          </button>
          <button type="button" class="btn btn--ghost" @click="closeAll">Скасувати</button>
        </form>
      </div>
    </div>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">
      {{ snack.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const year = new Date().getFullYear()
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/v1'

// dialogs
const loginDialog = ref(false)
const registerDialog = ref(false)
const openLogin = () => { registerDialog.value = false; loginDialog.value = true }
const openRegister = () => { loginDialog.value = false; registerDialog.value = true }
const closeAll = () => { loginDialog.value = false; registerDialog.value = false }

// forms
const login = ref({ email: '', password: '' })
const register = ref({ fullName: '', email: '', password: '' })
const loading = ref({ login: false, register: false })

// snackbar
const snack = ref({ show: false, color: 'success', text: '' })
function notify(text: string, color: 'success' | 'error' = 'success') {
  snack.value = { show: true, color, text }
}

// helpers
async function safeMsg(res: Response) {
  try { const j = await res.json(); return j?.message || j?.error } catch { return res.statusText }
}

// API: POST /api/v1/users/login
async function onLogin() {
  try {
    loading.value.login = true
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login.value),
    })
    if (!res.ok) throw new Error(await safeMsg(res) || 'Помилка входу')
    const data = await res.json()
    if (data?.token) localStorage.setItem('fp_token', data.token)
    notify('Вітаємо! Ви ввійшли ✅')
    closeAll()
  } catch (e: any) {
    notify(e.message || 'Помилка входу', 'error')
  } finally {
    loading.value.login = false
  }
}

// API: POST /api/v1/users/register
async function onRegister() {
  try {
    loading.value.register = true
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(register.value),
    })
    if (!res.ok) throw new Error(await safeMsg(res) || 'Помилка реєстрації')
    const data = await res.json()
    if (data?.token) localStorage.setItem('fp_token', data.token)
    notify('Акаунт створено 🎉')
    closeAll()
  } catch (e: any) {
    notify(e.message || 'Помилка реєстрації', 'error')
  } finally {
    loading.value.register = false
  }
}
</script>

<style>
/* top bar */
.appbar {
  backdrop-filter: saturate(1.2) blur(2px);
  border-bottom: 1px solid rgba(0,0,0,.04);
}

/* hero */
.hero {
  position: relative;
  min-height: calc(100vh - 96px);
  display: grid;
  place-items: center;
  padding: 48px 16px;
  background:
      radial-gradient(1200px 600px at 80% 20%, rgba(124,77,255,.15), transparent 60%),
      radial-gradient(800px 500px at 10% 80%, rgba(0,191,165,.15), transparent 60%),
      linear-gradient(180deg, #fafafa, #ffffff);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(1000px 600px at 50% 0%, rgba(124,77,255,.08), transparent 60%);
  pointer-events: none;
}
.hero__content { position: relative; width: 100%; max-width: 880px; text-align: center; }
.hero__title { font-size: clamp(32px, 6vw, 64px); font-weight: 800; letter-spacing: -0.02em; margin: 8px 0 16px; line-height: 1.15; }
.hero__title span { color: #7C4DFF; }
.hero__subtitle { font-size: clamp(16px, 2.5vw, 20px); color: rgba(0, 0, 0, 0.65); margin: 0 auto 32px; max-width: 640px; }
.hero__actions { margin-top: 8px; }

/* ======= custom modal (no teleport, only native controls) ======= */
.modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
}
.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.35);
}
.modal__card {
  position: relative;
  width: min(92vw, 460px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,.15);
  padding: 18px 18px 16px;
}
.modal__title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
}

/* form */
.form { display: grid; gap: 10px; }
.form__label { font-size: 12px; color: #555; }
.form__input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  outline: none;
  font-size: 14px;
}
.form__input:focus { border-color: #7C4DFF; box-shadow: 0 0 0 3px rgba(124,77,255,.15); }

/* buttons */
.btn {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
}
.btn--primary {
  background: #7C4DFF;
  color: #fff;
}
.btn--primary:disabled { opacity: .7; cursor: default; }
.btn--ghost {
  background: transparent;
  color: #333;
  border-color: #e0e0e0;
}
</style>
