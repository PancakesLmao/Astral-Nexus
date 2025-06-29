<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../../utils/auth'

const router = useRouter()
const { logout } = useAuth()

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <aside class="sidebar">
    <h3>Honkai Blog</h3>
    <nav>
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/events" class="nav-link">Events</router-link>
      <router-link to="/myposts" class="nav-link">My Posts</router-link>
      <router-link to="/profile" class="nav-link">Profile</router-link>
    </nav>
    <button @click="handleLogout" class="logout-btn">Logout</button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  padding: 20px;
  border-right: 1px solid #dee2e6;
  min-height: 100vh;
}

.sidebar h3 {
  margin-bottom: 20px;
  color: #495057;
}

.nav-link {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #6c757d;
  border-radius: 5px;
  margin-bottom: 5px;
  transition: background-color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #e9ecef;
  color: #495057;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>
