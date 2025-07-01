<template>
  <header class="header-container position-fixed w-100" :class="{ 'scrolled': isScrolled }">
    <nav class="navbar navbar-expand-lg container">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <span class="brand-text">AstralNexus</span>
        </router-link>

        <div class="nav-actions">
          <!-- Language Selector -->
          <div class="language-selector" @click.stop>
            <button
              class="language-btn"
              @click="toggleLanguageDropdown"
              :aria-expanded="isLanguageDropdownOpen"
            >
              <span class="language-code">{{ languageStore.currentLanguageInfo.code.toUpperCase() }}</span>
              <ChevronDown class="dropdown-icon" :class="{ 'rotated': isLanguageDropdownOpen }" />
            </button>

            <div class="language-dropdown" v-show="isLanguageDropdownOpen">
              <button
                v-for="language in languageStore.availableLanguages"
                :key="language.code"
                class="language-option"
                :class="{ 'active': language.code === languageStore.currentLanguage }"
                @click="selectLanguage(language.code)"
              >
                <span class="language-flag">{{ language.flag }}</span>
                <span class="language-name">{{ language.name }}</span>
              </button>
            </div>
          </div>

          <!-- GitHub Repo -->
          <a class="github-logo gradient-link" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'

const isScrolled = ref(false)
const isLanguageDropdownOpen = ref(false)
const languageStore = useLanguageStore()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
}

const selectLanguage = (languageCode: string) => {
  languageStore.setLanguage(languageCode)
  isLanguageDropdownOpen.value = false
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-selector')) {
    isLanguageDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  languageStore.initializeLanguage()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header-container {
  top: 0;
  z-index: 999;
  transition: all 0.3s ease;
}

.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 11, 15, 0);
  z-index: -1;
  transition: background 0.3s ease;
}

/* Show background when scroll */
.header-container.scrolled::before {
  background: rgba(10, 11, 15, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Navbar Section*/
.navbar {
  padding: 1rem 0;
  position: relative;
  z-index: 1;
}

.navbar-brand {
  text-decoration: none;
  color: #E0E0E0 !important;
  font-weight: 700;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.brand-text {
  background: linear-gradient(135deg, #D1EAFD, #B8AFF7, #B8AFF7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Language Selector */
.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  color: #B8AFF7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.language-btn:hover {
  background: rgba(184, 175, 247, 0.2);
  border-color: rgba(184, 175, 247, 0.5);
  transform: translateY(-1px);
}

.language-flag {
  font-size: 1.1rem;
}

.language-code {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 140px;
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #E0E0E0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.language-option:hover {
  background: rgba(184, 175, 247, 0.1);
  color: #B8AFF7;
}

.language-option.active {
  background: rgba(184, 175, 247, 0.2);
  color: #B8AFF7;
  font-weight: 600;
}

.language-option .language-flag {
  font-size: 1rem;
}

.language-option .language-name {
  font-weight: inherit;
}

.github-logo {
  display: inline-block;
  color: #B8AFF7;
  fill: #B8AFF7;
  transition: all 0.3s ease;
}

.github-logo:hover {
  background: rgba(88, 101, 242, 0.2);
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 575.98px) {
  .navbar {
    padding: 0.75rem 0;
  }

  .navbar-brand {
    font-size: 1.3rem;
  }

  .nav-actions {
    gap: 0.75rem;
  }

  .language-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

  .language-dropdown {
    min-width: 120px;
  }

  .language-option {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }

  .github-logo svg {
    width: 30px;
    height: 30px;
  }
}
</style>
