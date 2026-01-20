<template>
  <v-app>
    <!-- HEADER -->
    <v-app-bar flat density="comfortable" color="transparent" class="appbar">
      <v-container fluid class="d-flex align-center justify-space-between px-4">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-dumbbell" size="24" class="mr-1" />
          <span class="text-h6 font-weight-bold">FitProfi</span>
        </div>

        <!-- RIGHT SIDE: AUTH / USER -->
        <div class="d-flex align-center ga-2">
          <!-- not logged in -->
          <template v-if="!isAuthenticated">
            <v-btn variant="text" class="text-medium-emphasis" @click="openLogin">
              Увійти
            </v-btn>
            <v-btn color="primary" variant="flat" class="rounded-xl px-5" @click="openRegister">
              Зареєструватись
            </v-btn>
          </template>

          <!-- logged in -->
          <template v-else>
            <span class="mr-2 text-body-2">
              Привіт, <b>{{ user?.fullName || 'користувач' }}</b>
            </span>

            <v-btn
                variant="tonal"
                class="rounded-xl px-4"
                @click="goToUserProfile"
            >
              Мій профіль
            </v-btn>

            <v-btn
                v-if="user?.role === 'admin'"
                variant="tonal"
                class="rounded-xl px-4"
                @click="goToCoachProfile"
            >
              Профіль тренера
            </v-btn>

            <v-btn
                color="error"
                variant="text"
                class="rounded-xl px-4"
                @click="onLogout"
            >
              Вийти
            </v-btn>
          </template>
        </div>
      </v-container>
    </v-app-bar>

    <!-- HERO (landing) -->
    <v-main v-if="currentView === 'landing'">
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
            <!-- Якщо не залогінений – реєстрація, якщо залогінений – одразу в профіль -->
            <v-btn
                color="primary"
                size="large"
                class="rounded-xl px-6"
                @click="primaryCta"
            >
              Почати зараз
            </v-btn>
            <v-btn variant="tonal" size="large" class="rounded-xl px-6 ml-2">
              Дізнатися більше
            </v-btn>
          </div>
        </div>
      </section>
    </v-main>

    <!-- USER PROFILE PAGE -->
    <v-main v-if="currentView === 'userProfile'">
      <v-container class="py-10">
        <v-card max-width="640" class="mx-auto pa-6">
          <v-card-title class="text-h5 font-weight-bold">
            Мій профіль
          </v-card-title>
          <v-card-subtitle v-if="!userProfileExists">
            Розкажи трохи про себе, щоб ми могли краще підібрати тренування 💪
          </v-card-subtitle>

          <v-card-text>
            <form @submit.prevent="saveUserProfile" class="d-flex flex-column ga-4">
              <div>
                <label class="form__label">Імʼя</label>
                <input
                    class="form__input"
                    v-model.trim="userProfile.fullName"
                    type="text"
                    required
                />
              </div>

              <div class="d-flex ga-4">
                <div class="flex-1">
                  <label class="form__label">Вік</label>
                  <input
                      class="form__input"
                      v-model.number="userProfile.age"
                      type="number"
                      min="10"
                      max="120"
                      required
                  />
                </div>
                <div class="flex-1">
                  <label class="form__label">Вага, кг</label>
                  <input
                      class="form__input"
                      v-model.number="userProfile.weightKg"
                      type="number"
                      step="0.1"
                      min="30"
                      max="500"
                      required
                  />
                </div>
              </div>

              <div>
                <label class="form__label">Мета</label>
                <select
                    class="form__input"
                    v-model="userProfile.goal"
                    required
                >
                  <option value="lose_weight">Схуднення</option>
                  <option value="gain_weight">Набір ваги/мʼязів</option>
                  <option value="rehab">Відновлення/реабілітація</option>
                  <option value="keep_fit">Підтримка форми</option>
                  <option value="competition">Підготовка до змагань</option>
                </select>
              </div>

              <div>
                <label class="form__label">Про тебе</label>
                <textarea
                    class="form__input"
                    rows="4"
                    v-model.trim="userProfile.description"
                    placeholder="Коротко опиши рівень підготовки, обмеження, побажання…"
                />
              </div>

              <div class="d-flex justify-end ga-2 mt-2">
                <button
                    type="button"
                    class="btn btn--ghost"
                    @click="backToLanding"
                >
                  На головну
                </button>
                <button
                    class="btn btn--primary"
                    :disabled="profileLoading"
                >
                  <span v-if="!profileLoading">
                    {{ userProfileExists ? 'Оновити профіль' : 'Зберегти профіль' }}
                  </span>
                  <span v-else>Збереження…</span>
                </button>
              </div>
            </form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- COACH PROFILE PAGE (admin only, чернетка) -->
    <v-main v-if="currentView === 'coachProfile'">
      <v-container class="py-10">
        <v-card max-width="720" class="mx-auto pa-6">
          <v-card-title class="text-h5 font-weight-bold">
            Профіль тренера
          </v-card-title>
          <v-card-subtitle>
          </v-card-subtitle>

          <v-card-text>
            <form @submit.prevent="saveCoachProfile" class="d-flex flex-column ga-4">
              <div>
                <label class="form__label">Імʼя</label>
                <input
                    class="form__input"
                    v-model.trim="coachProfile.fullName"
                    type="text"
                    required
                />
              </div>

              <div>
                <label class="form__label">Категорія</label>
                <select
                    class="form__input"
                    v-model="coachProfile.category"
                    required
                >
                  <option value="standard">Standard</option>
                  <option value="master">Master</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label class="form__label">Інформація про тебе</label>
                <textarea
                    class="form__input"
                    rows="4"
                    v-model.trim="coachProfile.info"
                    placeholder="Досвід, спеціалізації, чим можеш бути корисною клієнтам…"
                />
              </div>

              <!-- achievements/education можна буде додати окремим кроком -->

              <div class="d-flex justify-end ga-2 mt-2">
                <button
                    type="button"
                    class="btn btn--ghost"
                    @click="backToLanding"
                >
                  На головну
                </button>
                <button
                    class="btn btn--primary"
                    :disabled="coachProfileLoading"
                >
                  <span v-if="!coachProfileLoading">
                    {{ coachProfileExists ? 'Оновити профіль тренера' : 'Зберегти профіль тренера' }}
                  </span>
                  <span v-else>Збереження…</span>
                </button>
              </div>
            </form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- FOOTER -->
    <v-footer app class="justify-center">
      <div class="text-caption text-medium-emphasis py-3">
        © {{ year }} FitProfi
      </div>
    </v-footer>

    <!-- ======= LOGIN MODAL ======= -->
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

    <!-- ======= REGISTER MODAL ======= -->
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
import { ref, computed, onMounted } from 'vue'
import { track, identify, setUserProfile, resetAnalytics } from "./analytics/mixpanel";
import { watch } from "vue";

const year = new Date().getFullYear()
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/v1'

// ===== AUTH STATE =====
const token = ref<string | null>(localStorage.getItem('fp_token'))
const user = ref<{
  id: number
  fullName: string
  email: string
  role: string | null
} | null>(null)

const isAuthenticated = computed(() => !!token.value)

// яка "сторінка" зараз:
// - landing
// - userProfile
// - coachProfile
const currentView = ref<'landing' | 'userProfile' | 'coachProfile'>('landing')

watch(currentView, (to, from) => {
  track("Page Viewed", {
    view: to,
    from: from ?? null,
  })
}, { immediate: true })

// dialogs
const loginDialog = ref(false)
const registerDialog = ref(false)
const openLogin = () => {
  track("Login Modal Opened");
  registerDialog.value = false;
  loginDialog.value = true;
};
const openRegister = () => {
  track("Register Modal Opened")
  loginDialog.value = false;
  registerDialog.value = true;
};
const closeAll = () => {
  if (loginDialog.value) track("Login Modal Closed")
  if (registerDialog.value) track("Register Modal Closed")
  loginDialog.value = false
  registerDialog.value = false
}

// forms
const login = ref({ email: '', password: '' })
const register = ref({ fullName: '', email: '', password: '' })
const loading = ref({ login: false, register: false })

// snackbar
const snack = ref<{ show: boolean; color: 'success' | 'error'; text: string }>({
  show: false,
  color: 'success',
  text: '',
})
function notify(text: string, color: 'success' | 'error' = 'success') {
  snack.value = { show: true, color, text }
}

// ===== HELPERS =====
async function safeMsg(res: Response) {
  try {
    const j = await res.json()
    return (j as any)?.message || (j as any)?.error
  } catch {
    return res.statusText
  }
}

// очистити авторизацію і повернути на лендінг
function clearAuthAndGoLanding(message?: string) {
  token.value = null
  user.value = null
  localStorage.removeItem('fp_token')
  currentView.value = 'landing'
  if (message) {
    notify(message, 'error')
  }
}

async function setAuthFromResponse(data: any) {
  if (!data?.token) return

  token.value = data.token
  localStorage.setItem('fp_token', data.token)

  // базова інфа з login / register
  user.value = {
    id: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: null, // роль дотягуємо окремо
  }

  // 1) тягнемо роль з /users/check
  await loadUserContext()

  // 2) вирішуємо, яку сторінку показувати
  if (user.value?.role === 'admin') {
    currentView.value = 'coachProfile'
    await loadCoachProfile()
  } else {
    currentView.value = 'userProfile'
    await loadUserProfile()
  }
}

// завантажити userId/role з /users/check
async function loadUserContext() {
  if (!token.value) return
  try {
    const res = await fetch(`${API_BASE}/users/check`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (res.status === 401) {
      // токен протух / невалідний — чистимо й просимо перелогінитись
      clearAuthAndGoLanding('Сесія завершилась, увійдіть знову')
      return
    }

    if (!res.ok) {
      console.error('users/check failed', res.status, await res.text())
      return
    }

    const data = await res.json()

    if (!user.value) {
      user.value = {
        id: data.userId,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        role: data.role ?? null,
      }
    } else {
      user.value.id = data.userId
      user.value.role = data.role ?? null
      if (data.fullName) user.value.fullName = data.fullName
      if (data.email) user.value.email = data.email
    }
  } catch (e) {
    console.error('users/check error', e)
  }
}

// ===== AUTH: LOGIN / REGISTER / LOGOUT =====
async function onLogin() {
  try {
    track("Login Submit")

    loading.value.login = true
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login.value),
    })
    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка входу')
    const data = await res.json()
    track("Login Success", {
      user_id: data.userId,
    });

    identify(String(data.userId));
    setUserProfile({
      $email: data.email,
      $name: data.fullName,
      user_id: data.userId,
    });

    await setAuthFromResponse(data)   // ← важливо: чекаємо тут
    notify('Вітаємо! Ви ввійшли ✅')
    closeAll()
  } catch (e: any) {
    track("Login Failed", {
      error: e?.message || "unknown",
    });

    notify(e.message || 'Помилка входу', 'error')
  } finally {
    loading.value.login = false
  }
}

async function onRegister() {
  try {
    track("Registration Submit")
    loading.value.register = true
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(register.value),
    })
    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка реєстрації')
    const data = await res.json()
    identify(String(data.userId));
    setUserProfile({
      $email: data.email,
      $name: data.fullName,
      user_id: data.userId,
    });
    track("Registration Success", {
      user_id: data.userId,
    });
    await setAuthFromResponse(data)   // ← так само
    notify('Акаунт створено 🎉')
    closeAll()
  } catch (e: any) {
    track("Registration Failed", {
      error: e?.message || "unknown",
    });

    notify(e.message || 'Помилка реєстрації', 'error')
  } finally {
    loading.value.register = false
  }
}

async function onLogout() {
  try {
    track("Logout Clicked")
    if (token.value) {
      // бекенд: /users/logout (може тихо фейлитись – нам не критично)
      await fetch(`${API_BASE}/users/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })
    }
    track("Logout Success")
  } catch {
    track("Logout Failed", { error: e?.message || "unknown" })
  } finally {
    track("Logout");
    resetAnalytics();

    clearAuthAndGoLanding('Ви вийшли з акаунту')
  }
}

// CTA з хедеру/героя
function primaryCta() {
  if (isAuthenticated.value) {
    currentView.value = 'userProfile'
    loadUserProfile()
  } else {
    openRegister()
  }
}

function goToUserProfile() {
  if (!isAuthenticated.value) {
    openLogin()
    return
  }
  currentView.value = 'userProfile'
  loadUserProfile()
}

function goToCoachProfile() {
  if (!isAuthenticated.value) {
    openLogin()
    return
  }
  currentView.value = 'coachProfile'
  loadCoachProfile()
}

function backToLanding() {
  currentView.value = 'landing'
}

// ===== USER PROFILE =====
const userProfile = ref<{
  fullName: string
  age: number | null
  weightKg: number | null
  goal: string
  description: string
}>({
  fullName: '',
  age: null,
  weightKg: null,
  goal: 'keep_fit',
  description: '',
})
const userProfileExists = ref(false)
const profileLoading = ref(false)

async function loadUserProfile() {
  if (!token.value) return
  try {
    profileLoading.value = true
    const res = await fetch(`${API_BASE}/profiles/user`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (res.status === 401) {
      clearAuthAndGoLanding('Сесія завершилась, увійдіть знову')
      return
    }

    if (res.status === 404) {
      userProfileExists.value = false
      // префіл з імʼям з auth
      userProfile.value.fullName = user.value?.fullName || ''
      userProfile.value.goal = 'keep_fit'
      return
    }

    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка завантаження профілю')

    const data = await res.json()
    userProfileExists.value = true
    userProfile.value = {
      fullName: data.fullName ?? (user.value?.fullName || ''),
      age: data.age ?? null,
      weightKg: data.weightKg ?? null,
      goal: data.goal ?? 'keep_fit',
      description: data.description ?? '',
    }
  } catch (e: any) {
    notify(e.message || 'Помилка завантаження профілю', 'error')
  } finally {
    profileLoading.value = false
  }
}

async function saveUserProfile() {
  if (!token.value) {
    notify('Потрібно увійти в акаунт', 'error')
    return
  }
  try {
    track("Profile Update Submit", {
      profile: "user",
      method: userProfileExists.value ? "PUT" : "POST",
      user_id: user.value?.id ?? null,
    })

    profileLoading.value = true

    const payload = {
      fullName: userProfile.value.fullName,
      age: userProfile.value.age ?? 0,
      weightKg: userProfile.value.weightKg ?? 0,
      goal: userProfile.value.goal,
      description: userProfile.value.description,
    }

    const method = userProfileExists.value ? 'PUT' : 'POST'
    const res = await fetch(`${API_BASE}/profiles/user`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 401) {
      clearAuthAndGoLanding('Сесія завершилась, увійдіть знову')
      return
    }

    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка збереження профілю')

    const data = await res.json()
    userProfileExists.value = true
    userProfile.value = {
      fullName: data.fullName,
      age: data.age,
      weightKg: data.weightKg,
      goal: data.goal,
      description: data.description,
    }
    notify('Профіль збережено ✅')
    track("Profile Update Success", {
      profile: "user",
      user_id: user.value?.id ?? null,
    })

  } catch (e: any) {
    notify(e.message || 'Помилка збереження профілю', 'error')
    track("Profile Update Failed", {
      profile: "user",
      error: e?.message || "unknown",
      user_id: user.value?.id ?? null,
    })

  } finally {
    profileLoading.value = false
  }
}

// ===== COACH PROFILE (admin) =====
const coachProfile = ref<{
  fullName: string
  category: string
  info: string
}>({
  fullName: '',
  category: 'standard',
  info: '',
})
const coachProfileExists = ref(false)
const coachProfileLoading = ref(false)

async function loadCoachProfile() {
  if (!token.value) return
  try {
    coachProfileLoading.value = true
    const res = await fetch(`${API_BASE}/profiles/coach`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (res.status === 401) {
      clearAuthAndGoLanding('Сесія завершилась, увійдіть знову')
      return
    }

    if (res.status === 404) {
      coachProfileExists.value = false
      coachProfile.value.fullName = user.value?.fullName || ''
      return
    }

    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка завантаження профілю тренера')

    const data = await res.json()
    coachProfileExists.value = true
    coachProfile.value = {
      fullName: data.fullName ?? (user.value?.fullName || ''),
      category: data.category ?? 'standard',
      info: data.info ?? '',
    }
  } catch (e: any) {
    notify(e.message || 'Помилка завантаження профілю тренера', 'error')
  } finally {
    coachProfileLoading.value = false
  }
}

async function saveCoachProfile() {
  if (!token.value) {
    notify('Потрібно увійти в акаунт', 'error')
    return
  }
  try {
    track("Profile Update Submit", {
      profile: "coach",
      method: coachProfileExists.value ? "PUT" : "POST",
      user_id: user.value?.id ?? null,
    })

    coachProfileLoading.value = true

    const payloadCreate = {
      fullName: coachProfile.value.fullName,
      category: coachProfile.value.category,
      info: coachProfile.value.info,
      achievements: [] as any[],
      education: [] as any[],
    }

    const payloadUpdate = {
      fullName: coachProfile.value.fullName,
      category: coachProfile.value.category,
      info: coachProfile.value.info,
      // achievements/education можна буде додати пізніше
    }

    const method = coachProfileExists.value ? 'PUT' : 'POST'
    const body = coachProfileExists.value ? payloadUpdate : payloadCreate

    const res = await fetch(`${API_BASE}/profiles/coach`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
    })

    if (res.status === 401) {
      clearAuthAndGoLanding('Сесія завершилась, увійдіть знову')
      return
    }

    if (!res.ok) throw new Error((await safeMsg(res)) || 'Помилка збереження профілю тренера')

    const data = await res.json()
    coachProfileExists.value = true
    coachProfile.value = {
      fullName: data.fullName,
      category: data.category,
      info: data.info,
    }
    notify('Профіль тренера збережено ✅')
    track("Profile Update Success", {
      profile: "coach",
      user_id: user.value?.id ?? null,
    });

  } catch (e: any) {
    notify(e.message || 'Помилка збереження профілю тренера', 'error')
    track("Profile Update Failed", {
      profile: "coach",
      error: e?.message || "unknown",
    });

  } finally {
    coachProfileLoading.value = false
  }
}

// ===== INIT ON MOUNT =====
onMounted(async () => {
  if (!token.value) return

  await loadUserContext()

  if (user.value?.role === 'admin') {
    currentView.value = 'coachProfile'
    await loadCoachProfile()
  } else {
    currentView.value = 'userProfile'
    await loadUserProfile()
  }
})

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
