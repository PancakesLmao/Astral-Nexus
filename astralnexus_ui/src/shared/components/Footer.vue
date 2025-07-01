<template>
  <footer class="footer-container">
    <div class="footer-content">
      <!-- Brand Section -->
      <div class="footer-brand">
        <router-link class="navbar-brand" to="/">
          <span class="brand-text">AstralNexus</span>
        </router-link>
      </div>

      <!-- Contact Section -->
      <div class="footer-contact">
        <div class="footer-social">
          <span>Contact:</span>
          <ul>
            <li>
              <a href="#" target="_blank" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
  </svg>
              </a>
            </li>
            <li>
              <a href="https://facebook.com/" target="_blank" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16">
    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
  </svg>
              </a>
            </li>
          </ul>
        </div>

        <!-- Community Section -->
        <div class="footer-join">
          <span>Community:</span>
          <a href="https://discord.com/" target="_blank" class="gradient-link footer-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-discord" viewBox="0 0 16 16">
    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
  </svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>Made by gamer for gamers</p>
    </div>
  </footer>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.brand-text {
  background: linear-gradient(135deg, #D1EAFD, #B8AFF7, #B8AFF7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.5rem;
  font-weight: 700;
}

.footer-container {
  background-color: #0A0B0F;
  color: #fff;
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 1.5rem;
}

.footer-brand {
  text-align: center;
}

.navbar-brand {
  text-decoration: none;
  color: inherit;
}

.footer-contact {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-social span {
  color: #e0e0e0;
  font-weight: 500;
  margin-right: 0.5rem;
}

.footer-social ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.footer-social ul li a {
  color: #B8AFF7;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(88, 101, 242, 0.1);
}

.footer-social ul li a:hover {
  background: rgba(88, 101, 242, 0.2);
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
}

.footer-social svg {
  width: 18px;
  height: 18px;
}

.footer-join {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-join span {
  color: #e0e0e0;
  font-weight: 500;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  margin-top: 1rem;
}

.footer-bottom p {
  margin: 0;
  color: #b0b0b0;
  font-size: 0.9rem;
  font-style: italic;
}

/* Responsive styling for smaller screens */
@media (max-width: 768px) {
  .footer-contact {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-social,
  .footer-join {
    justify-content: center;
  }

  .brand-text {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 1.5rem 1rem 1rem;
  }

  .footer-social {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-social ul {
    gap: 1.5rem;
  }
}
</style>
