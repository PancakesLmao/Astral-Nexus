<template>
  <div id="home" class="px-5 py-0">
    <div class="search-bar mb-4">
      <input type="text" placeholder="Search..." class="form-control" />
    </div>
    <!-- Content list -->
    <div class="content-list">
      <h2>Recent Posts</h2>
      <ul class="list-unstyled">
        <li class="mb-3">
          <h3>Post Title 1</h3>
          <p>Short description of the post content.</p>
        </li>
        <li class="mb-3">
          <h3>Post Title 2</h3>
          <p>Short description of the post content.</p>
        </li>
        <li class="mb-3">
          <h3>Post Title 3</h3>
          <p>Short description of the post content.</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.search-bar input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #542f87;
  border-radius: 12px;
  background-color: rgba(10, 11, 15, 0.8);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-bar input:focus {
  border-color: #b8aff7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(184, 175, 247, 0.2);
  background-color: rgba(10, 11, 15, 0.95);
  transform: translateY(-2px);
}

.search-bar input::placeholder {
  color: #b8aff7;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.search-bar input:hover {
  border-color: #b8aff7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.1);
}

.search-bar input:focus::placeholder {
  color: #d1eafd;
  opacity: 0.8;
  transform: translateX(4px);
}
</style>
