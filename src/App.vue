<template>
  <v-app>
    <!-- Верхня панель -->
    <v-app-bar flat color="transparent" class="px-4">
      <v-btn icon variant="text">
        <v-icon icon="mdi-dumbbell"></v-icon>
      </v-btn>
      <v-app-bar-title class="font-weight-bold">FitProfi</v-app-bar-title>
      <v-spacer />
      <v-btn color="primary" variant="flat" class="rounded-xl">Увійти</v-btn>
    </v-app-bar>

    <!-- Основна секція -->
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

    <!-- Футер -->
    <v-footer app class="justify-center">
      <div class="text-caption text-medium-emphasis py-3">
        © {{ year }} FitProfi
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style>
.hero {
  position: relative;
  min-height: calc(100vh - 64px);
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
.hero__content {
  position: relative;
  width: 100%;
  max-width: 880px;
  text-align: center;
}
.hero__title {
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 8px 0 16px;
  line-height: 1.15;
}
.hero__title span {
  color: #7C4DFF;
}
.hero__subtitle {
  font-size: clamp(16px, 2.5vw, 20px);
  color: rgba(0, 0, 0, 0.65);
  margin: 0 auto 32px;
  max-width: 640px;
}
.hero__actions {
  margin-top: 8px;
}
</style>
