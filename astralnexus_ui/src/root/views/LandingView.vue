<template>
  <div class="">
    <Header></Header>
    <section
      class="hero min-vh-100 d-flex flex-column justify-content-center align-items-center position-relative"
    >
      <!-- Dark overlay -->
      <div class="hero-overlay position-absolute"></div>

      <div class="hero-content position-relative">
        <h1 class="text-center">{{ languageStore.t('welcome') }}</h1>
        <h1 class="display-4 text-center mb-4">{{ languageStore.t('appName') }}</h1>
        <p class="lead text-center">{{ languageStore.t('description') }}</p>
        <div class="text-center">
          <router-link to="/login" class="get-started-btn">
            <svg>
              <rect x="0" y="0" fill="none" width="100%" height="100%" />
            </svg>
            <span>{{ languageStore.t('getStarted') }}</span>
          </router-link>
        </div>
      </div>
    </section>
    <section class="logo-gallery">
      <div class="logo-gallery-container">
        <div class="logo-gallery-scroll">
          <div class="logo-gallery-track">
            <div class="logo-set">
              <img
                src="@/shared/assets/4813560db5dc5c0f3785ddb4bc9ded45.png"
                alt="Game Logo 1"
                class="logo-item"
              />
              <img
                src="@/shared/assets/6636876050dcade8ec8e3023b1afe9bc.png"
                alt="Game Logo 2"
                class="logo-item"
              />
              <img
                src="@/shared/assets/8a42fb391ac55add6aac8811ffaea5f5.png"
                alt="Game Logo 3"
                class="logo-item"
              />
              <img
                src="@/shared/assets/fd278a8f5571d3db556bd83198beb09a.png"
                alt="Game Logo 4"
                class="logo-item"
              />
              <img
                src="@/shared/assets/4e0889bb750a24cc76c976b032b78f05.png"
                alt="Game Logo 5"
                class="logo-item"
              />
              <!-- Duplicate set for infinite loop (Well not really, the loop stil break after 2 set)-->
              <img
                src="@/shared/assets/4813560db5dc5c0f3785ddb4bc9ded45.png"
                alt="Game Logo 1"
                class="logo-item"
              />
              <img
                src="@/shared/assets/6636876050dcade8ec8e3023b1afe9bc.png"
                alt="Game Logo 2"
                class="logo-item"
              />
              <img
                src="@/shared/assets/8a42fb391ac55add6aac8811ffaea5f5.png"
                alt="Game Logo 3"
                class="logo-item"
              />
              <img
                src="@/shared/assets/fd278a8f5571d3db556bd83198beb09a.png"
                alt="Game Logo 4"
                class="logo-item"
              />
              <img
                src="@/shared/assets/4e0889bb750a24cc76c976b032b78f05.png"
                alt="Game Logo 5"
                class="logo-item"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer></Footer>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import Header from '@/shared/components/Header.vue'
import Footer from '@/shared/components/Footer.vue'
import { useLanguageStore } from '@/shared/stores/language'

const languageStore = useLanguageStore()

// Initialize language on component mount
onMounted(() => {
  languageStore.initializeLanguage()
})
</script>

<style scoped>
.hero {
  background-image: url('@/shared/assets/x62vjrpjghob1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

/* Overlay */
.hero-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  z-index: 1;
}

.hero-content {
  z-index: 2;
  color: white;
}

.hero-content h1 {
  color: white;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
}

.hero-content p {
  color: #e0e0e0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
/* Button */
.get-started-btn {
  position: relative;
  display: inline-block;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0.5rem;
  background: transparent;
  transition: all 0.35s ease;
  overflow: visible;
  z-index: 1;
}

.get-started-btn svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.get-started-btn rect {
  fill: none;
  stroke: #b8aff7;
  stroke-width: 2;
  stroke-dasharray: 300, 0;
  transition: all 0.35s linear;
  rx: 8px;
  ry: 8px;
}

.get-started-btn:hover {
  background: transparent;
  color: #b8aff7;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.get-started-btn:hover rect {
  stroke-width: 3;
  stroke-dasharray: 15, 285;
  stroke-dashoffset: 30;
  transition: all 1.35s cubic-bezier(0.19, 1, 0.22, 1);
}

.get-started-btn:hover .arrow-icon {
  transform: translateX(4px);
}

/* Logo Gallery*/
.logo-gallery {
  padding: 4rem 0;
  overflow: hidden;
  position: relative;
}

.logo-gallery::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
}

.logo-gallery-container {
  max-width: 100vw;
  overflow: hidden;
}

.logo-gallery-scroll {
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.logo-gallery-track {
  display: flex;
  align-items: center;
  animation: scroll-infinite 30s linear infinite;
}

.logo-set {
  display: flex;
  gap: 3rem;
  align-items: center;
  flex-shrink: 0;
}

.logo-item {
  height: 80px;
  width: auto;
  object-fit: contain;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.logo-item:hover {
  filter: brightness(1) grayscale(0);
  transform: scale(1.1);
}

@keyframes scroll-infinite {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .logo-gallery {
    padding: 2rem 0;
  }

  .logo-item {
    height: 60px;
  }

  .logo-set {
    gap: 2rem;
  }
}

@media (max-width: 480px) {
  .logo-item {
    height: 50px;
  }

  .logo-set {
    gap: 1.5rem;
  }
}
</style>
